import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidationRules, loginValidationRules, validateResult } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidationRules, validateResult, registerUser);
router.post('/login', authLimiter, loginValidationRules, validateResult, loginUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
