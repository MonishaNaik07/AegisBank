import express from 'express';
import { applyForAccount, getMyAccounts, getMyRequests } from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';
import { requestAccountValidationRules, validateResult } from '../middleware/validator.js';

const router = express.Router();

router.post('/request', protect, requestAccountValidationRules, validateResult, applyForAccount);
router.get('/my', protect, getMyAccounts);
router.get('/requests', protect, getMyRequests);

export default router;
