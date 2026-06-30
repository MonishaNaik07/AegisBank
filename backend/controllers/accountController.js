import Account from '../models/Account.js';
import AccountRequest from '../models/AccountRequest.js';

// @desc    Apply for a new bank account
// @route   POST /api/accounts/request
// @access  Private
export const applyForAccount = async (req, res) => {
  try {
    const { accountType, initialDeposit } = req.body;

    // 1. Check if user already has 3 accounts
    const activeAccountsCount = await Account.countDocuments({
      userId: req.user._id,
      status: { $in: ['active', 'suspended'] },
    });

    if (activeAccountsCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 3 bank accounts reached.',
      });
    }

    // 2. Check if user already has a pending account request
    const pendingRequest = await AccountRequest.findOne({
      userId: req.user._id,
      status: 'pending',
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending bank account request. Please wait for admin approval.',
      });
    }

    // 3. Create account request
    const request = await AccountRequest.create({
      userId: req.user._id,
      accountType,
      initialDeposit,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Bank account request submitted successfully.',
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's bank accounts
// @route   GET /api/accounts/my
// @access  Private
export const getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id });
    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's bank account requests
// @route   GET /api/accounts/requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await AccountRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
