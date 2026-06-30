import express from 'express';
import {
  registerAdmin,
  getAllAdmins,
  removeAdmin,
  updateAdminPermissions,
} from '../controllers/ownerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection and restrict to Owner only
router.use(protect);
router.use(authorize('Owner'));

router.route('/admins')
  .post(registerAdmin)
  .get(getAllAdmins);

router.route('/admins/:id')
  .delete(removeAdmin);

router.route('/admins/:id/permissions')
  .put(updateAdminPermissions);

export default router;
