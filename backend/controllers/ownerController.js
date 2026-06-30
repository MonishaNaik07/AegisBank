import User from '../models/User.js';
import Admin from '../models/Admin.js';

// @desc    Register a new admin
// @route   POST /api/owner/admins
// @access  Private/Owner
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, username, email, phone, address, zipCode, password, permissions } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // 1. Create user with Admin role
    const user = await User.create({
      fullName,
      username,
      email,
      phone,
      address,
      zipCode,
      password,
      role: 'Admin',
    });

    // 2. Create Admin profile record
    const admin = await Admin.create({
      userId: user._id,
      permissions: permissions || ['read_users', 'manage_requests', 'view_transactions'],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all admins
// @route   GET /api/owner/admins
// @access  Private/Owner
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({})
      .populate('userId', 'fullName username email phone status')
      .populate('createdBy', 'fullName');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove an admin
// @route   DELETE /api/owner/admins/:id
// @access  Private/Owner
export const removeAdmin = async (req, res) => {
  try {
    const adminUser = await User.findById(req.params.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    if (adminUser.role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'User is not an administrator' });
    }

    // Delete Admin metadata record
    await Admin.findOneAndDelete({ userId: adminUser._id });
    
    // Delete User record
    await User.findByIdAndDelete(adminUser._id);

    res.json({ success: true, message: 'Administrator removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update admin permissions
// @route   PUT /api/owner/admins/:id/permissions
// @access  Private/Owner
export const updateAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const admin = await Admin.findOne({ userId: req.params.id });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin record not found' });
    }

    admin.permissions = permissions;
    await admin.save();

    res.json({ success: true, message: 'Admin permissions updated successfully', admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
