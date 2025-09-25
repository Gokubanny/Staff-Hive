// routes/auth.js (Fixed ESM/Node version)
import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register Route
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, role, employeeId, companyName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const userData = { name, email, password, role };
      if (role === 'user') userData.employeeId = employeeId;
      if (role === 'admin') userData.companyName = companyName;

      const user = new User(userData);
      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { token, user: user.toPublicJSON() },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
);

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('role').isIn(['user', 'admin']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { email, password, role } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      if (user.role !== role)
        return res
          .status(401)
          .json({ success: false, message: `Email registered as ${user.role}` });

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid)
        return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = generateToken(user._id);

      res.json({ success: true, message: 'Login successful', data: { token, user: user.toPublicJSON() } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
);

// Get current authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Calculate profile completion
    const fields = ['name', 'email'];
    if (user.role === 'user') fields.push('employeeId');
    if (user.role === 'admin') fields.push('companyName');

    const filled = fields.filter(field => user[field]);
    const profileCompletion = Math.round((filled.length / fields.length) * 100);

    res.json({ success: true, user: { ...user.toPublicJSON(), profileCompletion } });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, companyName } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (companyName && user.role === 'admin') user.companyName = companyName;

    await user.save();

    // Recalculate profile completion
    const fields = ['name', 'email'];
    if (user.role === 'user') fields.push('employeeId');
    if (user.role === 'admin') fields.push('companyName');

    const filled = fields.filter(field => user[field]);
    const profileCompletion = Math.round((filled.length / fields.length) * 100);

    res.json({ success: true, message: 'Profile updated', data: { user: { ...user.toPublicJSON(), profileCompletion } } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

export default router;
