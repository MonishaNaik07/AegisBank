import User from '../models/User.js';
import Account from '../models/Account.js';
import AccountRequest from '../models/AccountRequest.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { generateAccountNumber } from '../utils/helpers.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Owner') {
      return res.status(403).json({ success: false, message: 'Cannot modify Owner status' });
    }

    user.status = status;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: 'Account Status Updated',
      message: `Your account status has been updated to '${status}' by an administrator.`,
    });

    res.json({ success: true, message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Owner') {
      return res.status(403).json({ success: false, message: 'Cannot delete Owner user' });
    }

    // Delete user's accounts, notifications, account requests
    await Account.deleteMany({ userId: user._id });
    await AccountRequest.deleteMany({ userId: user._id });
    await Notification.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bank account requests
// @route   GET /api/admin/requests
// @access  Private/Admin
export const getAllAccountRequests = async (req, res) => {
  try {
    const requests = await AccountRequest.find({}).populate('userId', 'fullName username email').sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review account request (Approve/Reject)
// @route   PUT /api/admin/requests/:id
// @access  Private/Admin
export const reviewAccountRequest = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const request = await AccountRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Account request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Account request already processed' });
    }

    request.status = status;
    request.remarks = remarks || '';
    await request.save();

    if (status === 'approved') {
      // 1. Generate unique account number
      let accountNumber = generateAccountNumber();
      let accountExists = await Account.findOne({ accountNumber });
      while (accountExists) {
        accountNumber = generateAccountNumber();
        accountExists = await Account.findOne({ accountNumber });
      }

      // 2. Create bank account
      const account = await Account.create({
        userId: request.userId,
        accountNumber,
        accountType: request.accountType,
        balance: request.initialDeposit,
        status: 'active',
      });

      // 3. Log initial deposit transaction
      const txnId = 'DEP' + Date.now().toString().slice(-8);
      await Transaction.create({
        transactionId: txnId,
        receiverAccount: accountNumber,
        amount: request.initialDeposit,
        type: 'deposit',
        status: 'completed',
        remarks: 'Initial Deposit (Account Open)',
      });

      // 4. Send notification
      await Notification.create({
        userId: request.userId,
        title: 'Bank Account Approved',
        message: `Congratulations! Your request for a new ${request.accountType} account was approved. Your account number is ${accountNumber}.`,
      });
    } else {
      // Send rejection notification
      await Notification.create({
        userId: request.userId,
        title: 'Bank Account Rejected',
        message: `Your request for a new ${request.accountType} account was rejected. Remarks: ${remarks || 'None provided'}`,
      });
    }

    res.json({ success: true, message: `Account request ${status}`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ timestamp: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get global analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getSystemAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'User' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const totalAccounts = await Account.countDocuments({});
    
    const accountSummary = await Account.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    const totalDeposited = accountSummary[0]?.totalBalance || 0;

    const transactionStats = await Transaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    const recentTransactions = await Transaction.find({}).sort({ timestamp: -1 }).limit(5);

    const fraudTrxCount = await Transaction.countDocuments({ isFraudulent: true });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalAdmins,
        totalAccounts,
        totalDeposited,
        transactionStats,
        recentTransactions,
        fraudTrxCount,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
