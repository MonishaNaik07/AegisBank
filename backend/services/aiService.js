import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 5000,
});

export const predictFraud = async (transactionData) => {
  try {
    const response = await aiClient.post('/predict-fraud', transactionData);
    return response.data;
  } catch (error) {
    console.warn('FastAPI Fraud service unavailable, using backend fallback rules.');
    // Fallback logic
    const { amount, senderBalance } = transactionData;
    let riskScore = 0.05;
    if (amount > 100000) riskScore = 0.85; // High amount warning
    else if (amount > senderBalance * 0.8) riskScore = 0.70; // Over 80% balance transfer
    
    return {
      is_fraud: riskScore > 0.5,
      risk_score: riskScore,
      reasons: riskScore > 0.5 ? ['High amount relative to balance', 'Large size transaction alert'] : [],
    };
  }
};

export const analyzeSpending = async (transactions) => {
  try {
    const response = await aiClient.post('/spending-analysis', { transactions });
    return response.data;
  } catch (error) {
    console.warn('FastAPI Spending Analysis service unavailable, using backend fallback rules.');
    // Fallback logic
    const categoryTotals = {};
    let total = 0;
    
    transactions.forEach((tx) => {
      if (tx.status !== 'completed') return;
      const amount = tx.amount;
      const type = tx.type;
      let category = tx.remarks || 'General';
      
      // Categorize
      if (type === 'transfer') category = 'Transfer';
      else if (type === 'withdraw') category = 'Withdrawal';
      else if (type === 'deposit') category = 'Deposit';
      
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      total += amount;
    });

    const categories = Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: total > 0 ? (categoryTotals[cat] / total) * 100 : 0,
    }));

    return {
      categories,
      total_spending: total,
      anomalies: total > 50000 ? ['High volume spending detected.'] : [],
    };
  }
};

export const getChatbotResponse = async (message, context) => {
  try {
    const response = await aiClient.post('/chatbot', { message, context });
    return response.data;
  } catch (error) {
    console.warn('FastAPI Chatbot service unavailable, using backend fallback rules.');
    // Simple query keyword response
    const msg = message.toLowerCase();
    let reply = "I'm the E-Banking Chatbot. I'm running in local fallback mode. How can I help you today?";
    
    if (msg.includes('balance') || msg.includes('how much')) {
      const activeAccounts = context?.accounts?.filter(a => a.status === 'active') || [];
      if (activeAccounts.length > 0) {
        reply = `You have ${activeAccounts.length} active account(s). Current balances: ` + 
                activeAccounts.map(a => `${a.accountType} (${a.accountNumber}): $${a.balance.toFixed(2)}`).join(', ');
      } else {
        reply = "You don't have any active accounts. Apply for one on the dashboard!";
      }
    } else if (msg.includes('transfer') || msg.includes('send')) {
      reply = "To transfer funds, navigate to the 'Transfer' page, enter the recipient's 10-digit account number, specify the amount, and click send. Real-time AI will scan for security.";
    } else if (msg.includes('fraud') || msg.includes('secure')) {
      reply = "Our system utilizes trained Machine Learning models (Random Forest) to evaluate transaction parameters such as amounts, transfer patterns, and frequency to keep your funds secure.";
    } else if (msg.includes('credit')) {
      reply = "We calculate your credit score dynamically based on balance history, transactions, and account performance. You can inspect your dashboard score inside the 'AI Insights' tab.";
    }
    
    return { response: reply };
  }
};

export const getBudgetRecommendations = async (spendingData) => {
  try {
    const response = await aiClient.post('/budget-recommendations', spendingData);
    return response.data;
  } catch (error) {
    console.warn('FastAPI Budget recommendations service unavailable, using backend fallback rules.');
    const { income, savings_goal, current_spending } = spendingData;
    
    const maxSpending = income - savings_goal;
    const recommendations = [];
    
    if (current_spending > maxSpending) {
      recommendations.push(`Your spending of $${current_spending.toFixed(2)} exceeds your savings target limit of $${maxSpending.toFixed(2)}.`);
      recommendations.push('Consider cutting down on discretionary items like restaurant and leisure shopping.');
    } else {
      recommendations.push('Great job! You are currently meeting your savings goal target.');
      recommendations.push('To build wealth, consider setting up an automated monthly deposit into your savings account.');
    }
    
    return {
      suggested_budgets: [
        { category: 'Necessities', limit: income * 0.5 },
        { category: 'Discretionary', limit: income * 0.3 },
        { category: 'Savings/Investment', limit: income * 0.2 },
      ],
      recommendations,
    };
  }
};

export const calculateCreditScore = async (historyData) => {
  try {
    const response = await aiClient.post('/credit-score', historyData);
    return response.data;
  } catch (error) {
    console.warn('FastAPI Credit Score service unavailable, using backend fallback rules.');
    const { account_age_months, balance_stability, transaction_count, failed_transactions } = historyData;
    
    let baseScore = 600; // Fair default
    
    baseScore += Math.min(account_age_months * 5, 100); // Up to +100 for account age
    baseScore += Math.min(balance_stability * 20, 100); // Up to +100 for stability
    baseScore += Math.min(transaction_count * 2, 80);   // Up to +80 for activity
    baseScore -= Math.min(failed_transactions * 50, 150); // Down to -150 for failures
    
    const finalScore = Math.max(300, Math.min(baseScore, 850));
    
    let rating = 'Poor';
    if (finalScore >= 740) rating = 'Excellent';
    else if (finalScore >= 670) rating = 'Good';
    else if (finalScore >= 580) rating = 'Fair';
    
    return {
      credit_score: finalScore,
      rating,
      details: {
        age_bonus: Math.min(account_age_months * 5, 100),
        stability_bonus: Math.min(balance_stability * 20, 100),
        activity_bonus: Math.min(transaction_count * 2, 80),
        failure_penalty: Math.min(failed_transactions * 50, 150),
      },
    };
  }
};
