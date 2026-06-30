import express from 'express';
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllAccountRequests,
  reviewAccountRequest,
  getAllTransactions,
  getSystemAnalytics,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection and restrict to Admin/Owner for all routes
router.use(protect);
router.use(authorize('Admin', 'Owner'));

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/requests', getAllAccountRequests);
router.put('/requests/:id', reviewAccountRequest);

router.get('/transactions', getAllTransactions);
router.get('/analytics', getSystemAnalytics);

export default router;
