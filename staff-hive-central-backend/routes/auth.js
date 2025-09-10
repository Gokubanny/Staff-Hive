// routes/auth.js (Fixed version)
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register Route (updated from signup)
router.post('/register', [
  // Validation middleware
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  
  // Conditional validation for employeeId
  body('employeeId').custom((value, { req }) => {
    if (req.body.role === 'user') {
      if (!value || !value.trim()) {
        throw new Error('Employee ID is required for user accounts');
      }
      if (value.trim().length < 3) {
        throw new Error('Employee ID must be at least 3 characters long');
      }
    }
    return true;
  }),
  
  // Conditional validation for companyName
  body('companyName').custom((value, { req }) => {
    if (req.body.role === 'admin') {
      if (!value || !value.trim()) {
        throw new Error('Company name is required for admin accounts');
      }
      if (value.trim().length < 2) {
        throw new Error('Company name must be at least 2 characters long');
      }
    }
    return true;
  })
], async (req, res) => {
  try {
    console.log('📝 Register attempt for:', req.body.email);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, employeeId, companyName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Check if employeeId already exists (for user accounts)
    if (role === 'user' && employeeId) {
      const existingEmployee = await User.findOne({ employeeId: employeeId.trim() });
      if (existingEmployee) {
        console.log('❌ Employee ID already exists:', employeeId);
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    };

    // Add role-specific data
    if (role === 'user') {
      userData.employeeId = employeeId.trim();
    } else if (role === 'admin') {
      userData.companyName = companyName.trim();
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    console.log('✅ User created successfully:', user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = field === 'email' 
        ? 'An account with this email already exists'
        : field === 'employeeId'
        ? 'Employee ID already exists'
        : `${field} already exists`;
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
});

// Login Route (updated from signin)
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
], async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if the role matches
    if (user.role !== role) {
      console.log('❌ Role mismatch. Expected:', role, 'Got:', user.role);
      return res.status(401).json({
        success: false,
        message: `Please select the correct account type. This email is registered as ${user.role}.`
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account deactivated:', email);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ User logged in successfully:', user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token,
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Get Current User (Protected Route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Update Profile (Protected Route)
router.put('/profile', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, companyName } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (companyName && user.role === 'admin') user.companyName = companyName.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change Password (Protected Route)
router.put('/change-password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Logout Route (Protected Route)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just send a success response
    console.log('👋 User logged out:', req.user.email);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router;