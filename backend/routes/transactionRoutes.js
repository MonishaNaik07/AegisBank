import express from 'express';
import { deposit, withdraw, transfer, verifyOTPAndTransfer, getMyTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { depositWithdrawValidationRules, transferValidationRules, validateResult } from '../middleware/validator.js';

const router = express.Router();

router.post('/deposit', protect, depositWithdrawValidationRules, validateResult, deposit);
router.post('/withdraw', protect, depositWithdrawValidationRules, validateResult, withdraw);
router.post('/transfer', protect, transferValidationRules, validateResult, transfer);
router.post( "/verify-otp", protect, async (req, res) => { return verifyOTPAndTransfer(req, res); } );
router.get('/my', protect, getMyTransactions);

export default router;
