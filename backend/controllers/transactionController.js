import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateTransactionId } from '../utils/helpers.js';
import { predictFraud } from '../services/aiService.js';
import OTP from '../models/OTP.js';
import { createTransferOTP, verifyTransferOTP, deleteTransferOTP } from '../services/otpService.js';
import { sendTransferOTP } from '../utils/email.js';

// @desc    Deposit money into an account
// @route   POST /api/transactions/deposit
// @access  Private
export const deposit = async (req, res) => {
  try {
    const { accountNumber, amount, remarks } = req.body;

    const account = await Account.findOne({ accountNumber, userId: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found or does not belong to you' });
    }

    if (account.status !== 'active') {
      return res.status(400).json({ success: false, message: `Account is currently ${account.status}` });
    }

    // Update balance
    account.balance += Number(amount);
    await account.save();

    // Create transaction record
    const txnId = generateTransactionId();
    const transaction = await Transaction.create({
      transactionId: txnId,
      receiverAccount: accountNumber,
      amount,
      type: 'deposit',
      status: 'completed',
      remarks: remarks || 'Deposit',
    });

    // Create notification
    await Notification.create({
      userId: req.user._id,
      title: 'Deposit Successful',
      message: `Deposited $${Number(amount).toFixed(2)} into account ${accountNumber}. New balance: $${account.balance.toFixed(2)}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Deposit successful',
      account,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw money from an account
// @route   POST /api/transactions/withdraw
// @access  Private
export const withdraw = async (req, res) => {
  try {
    const { accountNumber, amount, remarks } = req.body;

    const account = await Account.findOne({ accountNumber, userId: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found or does not belong to you' });
    }

    if (account.status !== 'active') {
      return res.status(400).json({ success: false, message: `Account is currently ${account.status}` });
    }

    if (account.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Update balance
    account.balance -= Number(amount);
    await account.save();

    // Create transaction record
    const txnId = generateTransactionId();
    const transaction = await Transaction.create({
      transactionId: txnId,
      senderAccount: accountNumber,
      amount,
      type: 'withdraw',
      status: 'completed',
      remarks: remarks || 'Withdrawal',
    });

    // Create notification
    await Notification.create({
      userId: req.user._id,
      title: 'Withdrawal Successful',
      message: `Withdrew $${Number(amount).toFixed(2)} from account ${accountNumber}. Remaining balance: $${account.balance.toFixed(2)}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal successful',
      account,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer funds between accounts
// @route   POST /api/transactions/transfer
// @access  Private
export const transfer = async (req, res) => {
  try {
    const { senderAccountNumber, receiverAccountNumber, amount, remarks } = req.body;

    if (senderAccountNumber === receiverAccountNumber) {
      return res.status(400).json({ success: false, message: 'Sender and receiver accounts cannot be the same' });
    }

    // 1. Validate sender account
    const senderAccount = await Account.findOne({ accountNumber: senderAccountNumber, userId: req.user._id });
    if (!senderAccount) {
      return res.status(404).json({ success: false, message: 'Sender account not found or does not belong to you' });
    }

    if (senderAccount.status !== 'active') {
      return res.status(400).json({ success: false, message: `Sender account is currently ${senderAccount.status}` });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // 2. Validate receiver account
    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
    if (!receiverAccount) {
      return res.status(404).json({ success: false, message: 'Receiver account number does not exist' });
    }

    if (receiverAccount.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Receiver account is suspended or closed' });
    }

    // Calculate account age in months for the AI service
    const accountAgeMs = Date.now() - new Date(senderAccount.createdAt).getTime();
    const accountAgeMonths = Math.max(1, Math.floor(accountAgeMs / (1000 * 60 * 60 * 24 * 30)));

    // 3. Perform AI Fraud Detection check
    const fraudResult = await predictFraud({
      amount: Number(amount),
      senderBalance: senderAccount.balance,
      receiverBalance: receiverAccount.balance,
      accountAgeMonths,
      type: 'transfer',
      hourOfDay: new Date().getHours(),
    });

    const isHighRisk = fraudResult.risk_score > 0.8;

    // Block completely if extremely high risk
    if (isHighRisk) {
      const txnId = generateTransactionId();
      await Transaction.create({
        transactionId: txnId,
        senderAccount: senderAccountNumber,
        receiverAccount: receiverAccountNumber,
        amount,
        type: 'transfer',
        status: 'failed',
        isFraudulent: true,
        fraudRiskScore: fraudResult.risk_score,
        remarks: remarks || 'Blocked: Security Risk Alert',
      });

      await Notification.create({
        userId: req.user._id,
        title: 'Security Alert: Transaction Blocked',
        message: `A transfer of $${Number(amount).toFixed(2)} to ${receiverAccountNumber} was blocked due to an abnormally high AI security risk score of ${(fraudResult.risk_score * 100).toFixed(0)}%.`,
      });

      return res.status(403).json({
        success: false,
        message: 'Transaction declined by security subsystem. High probability of fraud detected.',
        riskScore: fraudResult.risk_score,
        reasons: fraudResult.reasons,
      });
    }

    // ==========================================
    // OTP Verification for transfers above ₹10,000
    // ==========================================

    if (Number(amount) > 10000) {

        const otp = await createTransferOTP({
            userId: req.user._id,
            senderAccount: senderAccountNumber,
            receiverAccount: receiverAccountNumber,
            amount: Number(amount)
        });

        await sendTransferOTP({
            email: req.user.email,
            fullName: req.user.fullName,
            otp,
            amount: Number(amount),
            receiverAccount: receiverAccountNumber
        });

        return res.status(200).json({
            success: true,
            otpRequired: true,
            message: "OTP sent successfully to your registered email."
        });

    }

    // 4. Perform actual transfer
    senderAccount.balance -= Number(amount);
    receiverAccount.balance += Number(amount);

    await senderAccount.save();
    await receiverAccount.save();

    // Create transaction record
    const txnId = generateTransactionId();
    const transaction = await Transaction.create({
      transactionId: txnId,
      senderAccount: senderAccountNumber,
      receiverAccount: receiverAccountNumber,
      amount,
      type: 'transfer',
      status: 'completed',
      isFraudulent: fraudResult.is_fraud,
      fraudRiskScore: fraudResult.risk_score,
      remarks: remarks || 'Funds Transfer',
    });

    // Create notifications for sender
    await Notification.create({
      userId: req.user._id,
      title: 'Funds Transferred',
      message: `Successfully transferred $${Number(amount).toFixed(2)} to account ${receiverAccountNumber}. Remaining balance: $${senderAccount.balance.toFixed(2)}.`,
    });

    // Create notifications for receiver
    const receiverUser = await User.findById(receiverAccount.userId);
    if (receiverUser) {
      await Notification.create({
        userId: receiverUser._id,
        title: 'Funds Received',
        message: `Received $${Number(amount).toFixed(2)} from account ${senderAccountNumber}. New balance: $${receiverAccount.balance.toFixed(2)}.`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Transfer successful',
      senderAccount,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOTPAndTransfer = async (req, res) => {

    try {

        const { otp } = req.body;

        const verification = await verifyTransferOTP(
            req.user._id,
            otp
        );

        if (!verification.success) {

            return res.status(400).json({
                success: false,
                message: verification.message
            });

        }

        const otpRecord = verification.otpRecord;

        const senderAccount = await Account.findOne({
            accountNumber: otpRecord.senderAccount
        });

        const receiverAccount = await Account.findOne({
            accountNumber: otpRecord.receiverAccount
        });

        if (!senderAccount || !receiverAccount) {

            return res.status(404).json({
                success: false,
                message: "Account not found."
            });

        }

        senderAccount.balance -= otpRecord.amount;
        receiverAccount.balance += otpRecord.amount;

        await senderAccount.save();
        await receiverAccount.save();

        const txnId = generateTransactionId();

        const transaction = await Transaction.create({

            transactionId: txnId,

            senderAccount: otpRecord.senderAccount,

            receiverAccount: otpRecord.receiverAccount,

            amount: otpRecord.amount,

            type: "transfer",

            status: "completed",

            remarks: "OTP Verified Transfer"

        });

        await Notification.create({

            userId: req.user._id,

            title: "Funds Transferred",

            message:
                `Successfully transferred ₹${otpRecord.amount} to ${otpRecord.receiverAccount}.`

        });

        const receiverUser = await User.findById(
            receiverAccount.userId
        );

        if (receiverUser) {

            await Notification.create({

                userId: receiverUser._id,

                title: "Funds Received",

                message:
                    `Received ₹${otpRecord.amount} from ${otpRecord.senderAccount}.`

            });

        }

        await deleteTransferOTP(req.user._id);

        return res.json({

            success: true,

            message: "Transfer Successful",

            transaction

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// @desc    Get logged in user's transactions
// @route   GET /api/transactions/my
// @access  Private
export const getMyTransactions = async (req, res) => {
  try {
    // Get all accounts of user
    const accounts = await Account.find({ userId: req.user._id });
    const accountNumbers = accounts.map((a) => a.accountNumber);

    // Find all transactions where sender or receiver is one of user's accounts
    const transactions = await Transaction.find({
      $or: [
        { senderAccount: { $in: accountNumbers } },
        { receiverAccount: { $in: accountNumbers } },
      ],
    }).sort({ timestamp: -1 });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
