// controllers/authController.js - Updated with company creation
const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register new user
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'user',
      employeeId: employeeId?.trim(),
      companyName: companyName.trim(),
      isActive: role === 'admin', // Auto-approve admins
      verificationStatus: role === 'admin' ? 'approved' : 'pending'
    });

    await newUser.save();

    // **NEW: Create basic company profile for admin users**
    if (role === 'admin') {
      try {
        // Check if company already exists for this user
        const existingCompany = await Company.findOne({
          name: companyName.trim(),
          userId: newUser._id
        });

        if (!existingCompany) {
          // Create basic company profile
          const basicCompany = new Company({
            name: companyName.trim(),
            businessType: 'Other', // Default value
            registrationNumber: 'PENDING', // Placeholder
            taxId: 'PENDING', // Placeholder
            industry: 'Other', // Default value
            size: '1-10', // Default smallest size
            description: `Company profile for ${companyName.trim()}. Please update with complete information.`,
            streetAddress: 'To be updated',
            city: 'To be updated',
            state: 'Lagos', // Default state
            postalCode: '100001',
            location: 'To be updated',
            phone: 'To be updated',
            email: email.toLowerCase().trim(), // Use admin's email as company email
            employeeCount: '1-10',
            hrContactName: name.trim(),
            hrContactEmail: email.toLowerCase().trim(),
            hrContactPhone: 'To be updated',
            userId: newUser._id,
            isActive: true
          });

          await basicCompany.save();
          console.log(`✅ Created basic company profile for: ${companyName}`);
        }
      } catch (companyError) {
        // Log error but don't fail registration
        console.error('⚠️ Error creating company profile:', companyError);
      }
    }

    // Generate token
    const token = generateToken(newUser._id);

    // Return user data (excluding password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      employeeId: newUser.employeeId,
      companyName: newUser.companyName,
      isActive: newUser.isActive,
      verificationStatus: newUser.verificationStatus
    };

    res.status(201).json({
      success: true,
      message: role === 'admin' 
        ? 'Admin account created successfully. Complete your company profile.' 
        : 'Registration successful. Awaiting admin approval.',
      data: {
        user: userResponse,
        token: role === 'admin' ? token : null // Only return token for admins
      },
      requiresVerification: role !== 'admin'
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error during registration',
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

    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if role matches
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is pending approval or has been deactivated. Please contact your administrator.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      companyName: user.companyName,
      isActive: user.isActive,
      verificationStatus: user.verificationStatus
    };

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
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          companyName: user.companyName,
          isActive: user.isActive,
          verificationStatus: user.verificationStatus
        }
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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, employeeId, companyName } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (employeeId) updateData.employeeId = employeeId.trim();
    if (companyName) updateData.companyName = companyName.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // In a more complex system, you might invalidate the token here
    res.json({
      success: true,
      message: 'Logged out successfully'
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

// Get pending users (admin only)
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: 'pending',
      role: 'user'
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingUsers
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users',
      error: error.message
    });
  }
};

// Verify user (admin only)
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (action === 'approve') {
      user.verificationStatus = 'approved';
      user.isActive = true;
      await user.save();

      return res.json({
        success: true,
        message: 'User approved successfully'
      });
    } else if (action === 'reject') {
      user.verificationStatus = 'rejected';
      user.isActive = false;
      user.rejectionReason = reason;
      await user.save();

      return res.json({
        success: true,
        message: 'User rejected successfully'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying user',
      error: error.message
    });
  }
};

module.exports = exports;