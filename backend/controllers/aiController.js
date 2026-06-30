import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { transfer } from './transactionController.js';
import { getChatbotResponse, analyzeSpending, getBudgetRecommendations, calculateCreditScore } from '../services/aiService.js';

// @desc    Interact with AI banking chatbot
// @route   POST /api/ai/chatbot
// @access  Private

// Store pending chatbot transfers
const pendingTransfers = new Map();

export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch user details and account details for local context
    const accounts = await Account.find({ userId: req.user._id });
    const accountNumbers = accounts.map((a) => a.accountNumber);
    const recentTxns = await Transaction.find({
      $or: [
        { senderAccount: { $in: accountNumbers } },
        { receiverAccount: { $in: accountNumbers } },
      ],
    }).sort({ timestamp: -1 }).limit(5);

  // Monthly transaction summary
  const income = recentTxns
    .filter(
      (t) =>
        accountNumbers.includes(t.receiverAccount) &&
        t.status === "completed"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = recentTxns
    .filter(
      (t) =>
        accountNumbers.includes(t.senderAccount) &&
        t.status === "completed"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - expenses;

  // Spending Categories
  const spendingCategories = {};

  recentTxns.forEach((txn) => {
    if (
      txn.status === "completed" &&
      accountNumbers.includes(txn.senderAccount)
    ) {
      const category = txn.remarks || "Other";

      spendingCategories[category] =
        (spendingCategories[category] || 0) + txn.amount;
    }
  });

  const context = {
    user: {
      fullName: req.user.fullName,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },

    accounts,

    recentTransactions: recentTxns,

    monthlySummary: {
      income,
      expenses,
      savings,
    },

    spendingCategories,

    savingsGoal: {
      target: 50000,
      current: savings,
    },
  };

    const reply = await getChatbotResponse(message, context);

    // ------------------------------
    // AI wants to transfer money
    // ------------------------------

    // Check if user is confirming a pending transfer

    const pending = pendingTransfers.get(req.user._id.toString());

    if (pending && message.trim().toLowerCase() === "yes") {

        req.body = {
            senderAccountNumber: pending.sender,
            receiverAccountNumber: pending.receiver,
            amount: pending.amount,
            remarks: "AI Chatbot Transfer"
        };

        pendingTransfers.delete(req.user._id.toString());

        return await transfer(req, {
            status(code) {
                this.statusCode = code;
                return this;
            },

            json(data) {

                if (data.success) {

                    return res.json({
                        success: true,
                        response:
    `✅ Transfer Successful

    Amount : ₹${pending.amount}

    Receiver : ${pending.receiver}

    Transaction ID : ${data.transaction.transactionId}

    Remaining Balance : ₹${data.senderAccount.balance}`
                    });

                }

                return res.json({
                    success: false,
                    response: data.message
                });

            }
        });
    }

    if (pending && message.trim().toLowerCase() === "cancel") {

        pendingTransfers.delete(req.user._id.toString());

        return res.json({
            success: true,
            response: "✅ Transfer cancelled."
        });
    }


    // AI detected a transfer request

    if (
        reply.intent === "transfer_money" &&
        reply.status === "ready"
    ) {

        if (accounts.length === 0) {
            return res.json({
                success: true,
                response: "You don't have any active account to transfer from."
            });
        }

        pendingTransfers.set(
            req.user._id.toString(),
            {
                sender: accounts[0].accountNumber,
                receiver: reply.receiver,
                amount: reply.amount
            }
        );

        return res.json({
            success: true,
            response: reply.response
        });
    }

    return res.json({
        success: true,
        response: reply.response
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI financial insights (spending analysis, credit score, budgets)
// @route   GET /api/ai/insights
// @access  Private
export const getAIInsights = async (req, res) => {
  try {
    // 1. Fetch user accounts and transaction history
    const accounts = await Account.find({ userId: req.user._id });
    const accountNumbers = accounts.map((a) => a.accountNumber);
    const transactions = await Transaction.find({
      $or: [
        { senderAccount: { $in: accountNumbers } },
        { receiverAccount: { $in: accountNumbers } },
      ],
    }).sort({ timestamp: -1 });

    // 2. Perform spending pattern analysis
    const spendingAnalysis = await analyzeSpending(transactions);

    // 3. Calculate Credit Score
    const accountAgeMs = accounts.length > 0 
      ? Date.now() - Math.min(...accounts.map(a => new Date(a.createdAt).getTime()))
      : 0;
    const accountAgeMonths = Math.max(1, Math.floor(accountAgeMs / (1000 * 60 * 60 * 24 * 30)));
    const totalTransactions = transactions.length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;

    // Compute stability = standard deviation of balance / average balance (or a simple proxy: min balance / max balance)
    let balanceStability = 0.8; // Default good stability
    const balances = accounts.map(a => a.balance);
    if (balances.length > 0) {
      const maxBal = Math.max(...balances);
      const minBal = Math.min(...balances);
      balanceStability = maxBal > 0 ? minBal / maxBal : 0.1;
    }

    const creditScore = await calculateCreditScore({
      account_age_months: accountAgeMonths,
      balance_stability: balanceStability,
      transaction_count: totalTransactions,
      failed_transactions: failedTransactions,
    });

    // 4. Budget Recommendations
    // Assume a baseline user monthly income of $5000 (or customized parameter if supplied in headers/query)
    const income = req.query.income ? Number(req.query.income) : 5000;
    const savingsGoal = req.query.savingsGoal ? Number(req.query.savingsGoal) : 1000;

    const budgetRecommendations = await getBudgetRecommendations({
      income,
      savings_goal: savingsGoal,
      current_spending: spendingAnalysis.total_spending || 0,
    });

    res.json({
      success: true,
      data: {
        creditScore,
        spendingAnalysis,
        budgetRecommendations,
        config: {
          income,
          savingsGoal,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
