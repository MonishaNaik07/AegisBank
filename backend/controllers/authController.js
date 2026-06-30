import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/tokens.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, phone, address, zipCode, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      });
    }

    // First user is automatically Owner for convenience, otherwise User
    const usersCount = await User.countDocuments({});
    const role = usersCount === 0 ? 'Owner' : 'User';

    const user = await User.create({
      fullName,
      username,
      email,
      phone,
      address,
      zipCode,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id, user.role),
        refreshToken: generateRefreshToken(user._id),
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is inactive' });
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      refreshToken: generateRefreshToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          address: user.address,
          zipCode: user.zipCode,
          role: user.role,
          status: user.status,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.zipCode = req.body.zipCode || user.zipCode;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          zipCode: updatedUser.zipCode,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
