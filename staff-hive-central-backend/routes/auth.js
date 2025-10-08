// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Dynamic imports for CommonJS modules
let User, Employee, Notification;
(async () => {
  const userModule = await import('../models/User.js');
  const employeeModule = await import('../models/Employee.js');
  const notificationModule = await import('../models/Notification.js');
  
  User = userModule.default;
  Employee = employeeModule.default;
  Notification = notificationModule.default;
})();

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
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, role, employeeId, companyName } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const userData = { name, email, password, role, companyName };

      // Handle user registration
      if (role === 'user') {
        if (!employeeId) {
          return res.status(400).json({ success: false, message: 'Employee ID is required for user accounts' });
        }
        if (!companyName) {
          return res.status(400).json({ success: false, message: 'Company name is required for user accounts' });
        }

        const admin = await User.findOne({
          companyName: companyName.trim(),
          role: 'admin'
        });

        if (!admin) {
          return res.status(400).json({
            success: false,
            message: 'No company found with this name. Please verify the company name with your admin.'
          });
        }

        userData.employeeId = employeeId;
        userData.adminId = admin._id;
        userData.isVerified = false;
        userData.verificationStatus = 'pending';
      }

      // Handle admin registration
      if (role === 'admin') {
        if (!companyName) {
          return res.status(400).json({ success: false, message: 'Company name is required for admin accounts' });
        }

        const existingCompany = await User.findOne({
          companyName: companyName.trim(),
          role: 'admin'
        });

        if (existingCompany) {
          return res.status(400).json({ success: false, message: 'A company with this name already exists' });
        }

        userData.isVerified = true;
        userData.verificationStatus = 'approved';
      }

      const user = new User(userData);
      await user.save();

      // If user role, create notification for admin
      if (role === 'user') {
        await Notification.createVerificationRequest(user.adminId, user);

        return res.status(201).json({
          success: true,
          message: 'Registration successful! Your account is pending admin approval.',
          data: {
            user: user.toJSON(),
            requiresVerification: true
          }
        });
      }

      // If admin, generate token and login immediately
      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }
);

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check verification status for users
      if (user.role === 'user') {
        if (user.verificationStatus === 'pending') {
          return res.status(403).json({
            success: false,
            message: 'Your account is pending admin approval. Please wait for verification.',
            verificationStatus: 'pending'
          });
        }

        if (user.verificationStatus === 'rejected') {
          return res.status(403).json({
            success: false,
            message: `Your account registration was declined. ${user.rejectionReason ? 'Reason: ' + user.rejectionReason : ''}`,
            verificationStatus: 'rejected'
          });
        }

        if (!user.isVerified) {
          return res.status(403).json({
            success: false,
            message: 'Your account is not verified. Please contact your administrator.',
            verificationStatus: 'unverified'
          });
        }
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
);

// In your routes/auth.js - Add this route after the existing routes

// Get current user profile - FIXED ENDPOINT
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Calculate profile completion
    const fields = ['name', 'email'];
    if (user.role === 'user') fields.push('employeeId');
    if (user.role === 'admin') fields.push('companyName');

    const filled = fields.filter(field => user[field]);
    const profileCompletion = Math.round((filled.length / fields.length) * 100);

    res.json({
      success: true,
      data: {
        user: { 
          ...user.toJSON(), 
          profileCompletion 
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user data' 
    });
  }
});

// Get pending users (Admin only)
router.get('/pending-users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const pendingUsers = await User.find({
      companyName: req.user.companyName,
      verificationStatus: 'pending',
      role: 'user'
    }).select('-password').sort({ createdAt: -1 });

    res.json({ success: true, data: pendingUsers, count: pendingUsers.length });
  } catch (error) {
    console.error('Fetch pending users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending users' });
  }
});

// Verify user (Admin only)
router.post('/verify-user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { action, reason } = req.body;

    const userToVerify = await User.findOne({
      _id: req.params.userId,
      companyName: req.user.companyName,
      role: 'user'
    });

    if (!userToVerify) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userToVerify.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'This user has already been processed' });
    }

    if (action === 'approve') {
      userToVerify.isVerified = true;
      userToVerify.verificationStatus = 'approved';
      userToVerify.verifiedBy = req.user.userId;
      userToVerify.verifiedAt = new Date();
      await userToVerify.save();

      // Create employee record
      try {
        const nameParts = userToVerify.name.split(' ');
        const firstName = nameParts[0] || userToVerify.name;
        const lastName = nameParts.slice(1).join(' ') || userToVerify.name;

        const employeeData = {
          firstName,
          lastName,
          email: userToVerify.email,
          phone: 'To be updated',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Prefer not to say',
          employeeId: userToVerify.employeeId || `EMP${Date.now()}`,
          position: 'Employee',
          department: 'General',
          startDate: new Date(),
          salary: 0,
          employmentType: 'Full-time',
          status: 'Active',
          address: {
            street: 'To be updated',
            city: 'To be updated',
            state: 'To be updated',
            postalCode: '000000'
          },
          emergencyContact: {
            name: 'To be updated',
            relationship: 'To be updated',
            phone: 'To be updated'
          },
          userId: userToVerify._id,
          createdBy: req.user.userId
        };

        const newEmployee = new Employee(employeeData);
        await newEmployee.save();
        console.log(`✅ Employee created: ${userToVerify.name}`);
      } catch (empError) {
        console.error('⚠️ Employee creation error:', empError);
      }

      await Notification.createApprovalNotification(userToVerify._id, req.user.name);

      res.json({
        success: true,
        message: 'User approved successfully and employee record created',
        data: userToVerify.toJSON()
      });
    } else if (action === 'reject') {
      userToVerify.verificationStatus = 'rejected';
      userToVerify.rejectionReason = reason || 'No reason provided';
      await userToVerify.save();

      await Notification.createRejectionNotification(userToVerify._id, reason);

      res.json({
        success: true,
        message: 'User registration rejected',
        data: userToVerify.toJSON()
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify user' });
  }
});

// Other routes...
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, companyName } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (companyName && user.role === 'admin') user.companyName = companyName;
    await user.save();

    res.json({ success: true, message: 'Profile updated', data: { user: user.toJSON() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
});

router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) return res.status(400).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
});

router.post('/logout', auth, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;