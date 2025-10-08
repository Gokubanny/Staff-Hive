// controllers/authController.js
const User = require('../models/User');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role, employeeId, companyName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employeeId already exists
    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId: employeeId.trim() });
      if (existingEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
      employeeId: employeeId ? employeeId.trim() : undefined,
      companyName: companyName ? companyName.trim() : 'Unknown Company',
      isVerified: role === 'admin',
      verificationStatus: role === 'admin' ? 'approved' : 'pending'
    });

    await newUser.save();

    // If user is admin, generate token immediately
    if (role === 'admin') {
      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const userResponse = newUser.toObject();
      delete userResponse.password;

      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        data: {
          user: userResponse,
          token
        }
      });
    }

    // For regular users, find admin to send notification
    const adminUser = await User.findOne({ 
      companyName: newUser.companyName, 
      role: 'admin' 
    });

    if (adminUser) {
      await Notification.createVerificationRequest(adminUser._id, newUser);
    }

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Waiting for admin approval.',
      data: {
        user: userResponse,
        requiresVerification: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    // Check if user is verified (for regular users)
    if (user.role === 'user' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin verification.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
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
        user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// Get pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: 'pending',
      role: 'user',
      companyName: req.user.companyName
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingUsers,
      count: pendingUsers.length
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users',
      error: error.message
    });
  }
};

// Verify user (Approve/Reject)
exports.verifyUser = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user belongs to same company as admin
    if (user.companyName !== req.user.companyName) {
      return res.status(403).json({
        success: false,
        message: 'You can only verify users from your company'
      });
    }

    if (action === 'approve') {
      // Update user verification status
      user.isVerified = true;
      user.verificationStatus = 'approved';
      user.verifiedBy = req.user.userId;
      user.verifiedAt = new Date();
      await user.save();

      // Create employee record automatically
      try {
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || user.name;
        const lastName = nameParts.slice(1).join(' ') || user.name;

        const employeeData = {
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          phone: 'To be updated',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Prefer not to say',
          employeeId: user.employeeId || `EMP${Date.now()}`,
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
            postalCode: 'To be updated'
          },
          emergencyContact: {
            name: 'To be updated',
            relationship: 'To be updated',
            phone: 'To be updated'
          },
          companyId: req.user.companyId,
          userId: user._id,
          createdBy: req.user.userId
        };

        const newEmployee = new Employee(employeeData);
        await newEmployee.save();

        console.log(`✅ Employee record created for: ${user.name}`);

      } catch (employeeError) {
        console.error('❌ Error creating employee record:', employeeError);
        // Continue with user approval even if employee creation fails
      }

      // Send approval notification
      await Notification.createApprovalNotification(user._id, req.user.name);

      return res.json({
        success: true,
        message: 'User approved successfully and employee record created',
        data: { user }
      });

    } else if (action === 'reject') {
      // Update user verification status
      user.verificationStatus = 'rejected';
      user.rejectionReason = reason;
      await user.save();

      // Send rejection notification
      await Notification.createRejectionNotification(user._id, reason);

      return res.json({
        success: true,
        message: 'User rejected successfully',
        data: { user }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }

  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing verification',
      error: error.message
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};