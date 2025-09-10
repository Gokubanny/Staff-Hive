// middleware/auth.js (Fixed version)
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user and check if still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    // Add user to request object - keeping consistent with your server.js
    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(), // Adding both for compatibility
      email: user.email,
      role: user.role,
      name: user.name,
      employeeId: user.employeeId,
      companyName: user.companyName,
      isActive: user.isActive
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please sign in again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  return authorize('admin')(req, res, next);
};

// User only middleware  
const userOnly = (req, res, next) => {
  return authorize('user')(req, res, next);
};

// Export middleware functions
module.exports = { 
  auth, 
  authorize, 
  adminOnly, 
  userOnly 
};