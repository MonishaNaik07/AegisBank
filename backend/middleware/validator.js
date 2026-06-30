import { validationResult, body } from 'express-validator';

export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const registerValidationRules = [
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters').trim(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('zipCode').notEmpty().withMessage('Zip code is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidationRules = [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const requestAccountValidationRules = [
  body('accountType').isIn(['Savings', 'Checking']).withMessage('Account type must be Savings or Checking'),
  body('initialDeposit').isFloat({ min: 500 }).withMessage('Initial deposit must be at least 500'),
];

export const depositWithdrawValidationRules = [
  body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
];

export const transferValidationRules = [
  body('senderAccountNumber').isLength({ min: 10, max: 10 }).withMessage('Sender account number must be 10 digits'),
  body('receiverAccountNumber').isLength({ min: 10, max: 10 }).withMessage('Receiver account number must be 10 digits'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
];
