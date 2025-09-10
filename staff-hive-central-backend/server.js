// server.js (Fixed version)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const companyRoutes = require('./routes/companies');
const applicantRoutes = require('./routes/applicants');
const payrollRoutes = require('./routes/payroll');
const jobRoutes = require('./routes/jobs');

// Import auth middleware with destructuring
const { auth } = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/staff-hive-central';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/jobs', jobRoutes);

// Analytics endpoint
app.get('/api/analytics', auth, async (req, res) => {
  try {
    const Employee = require('./models/Employee');
    const Company = require('./models/Company');
    const Applicant = require('./models/Applicant');
    const Payroll = require('./models/Payroll');
    const Job = require('./models/Job');
    
    const userId = req.user.userId;
    
    // Get counts
    const [
      totalEmployees,
      totalCompanies,
      totalApplicants,
      totalPayrollRecords,
      activeJobs
    ] = await Promise.all([
      Employee.countDocuments({ userId }),
      Company.countDocuments({ userId }),
      Applicant.countDocuments({ userId }),
      Payroll.countDocuments({ userId }),
      Job.countDocuments({ userId, status: 'active' })
    ]);
    
    // Get applicants by stage
    const applicantStages = await Applicant.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);
    
    const applicantsByStage = applicantStages.reduce((acc, stage) => {
      acc[stage._id || 'unknown'] = stage.count;
      return acc;
    }, {});
    
    // Get employees by department
    const employeeDepartments = await Employee.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    const employeesByDepartment = employeeDepartments.reduce((acc, dept) => {
      acc[dept._id || 'unknown'] = dept.count;
      return acc;
    }, {});
    
    // Calculate total payroll and average salary
    const payrollStats = await Payroll.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: null, 
          totalPayroll: { $sum: '$totalAmount' },
          avgPayroll: { $avg: '$totalAmount' }
        } 
      }
    ]);
    
    const salaryStats = await Employee.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: null, 
          avgSalary: { $avg: '$salary' },
          totalSalaryBudget: { $sum: '$salary' }
        } 
      }
    ]);
    
    // Recent activity
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const recentHires = await Employee.countDocuments({
      userId,
      hireDate: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });
    
    const pendingApplicants = await Applicant.countDocuments({
      userId,
      stage: { $in: ['applied', 'screening', 'interview'] }
    });
    
    const currentMonthPeriod = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const thisMonthPayroll = await Payroll.countDocuments({
      userId,
      period: currentMonthPeriod
    });
    
    const analytics = {
      totals: {
        employees: totalEmployees,
        companies: totalCompanies,
        applicants: totalApplicants,
        payrollRecords: totalPayrollRecords,
        activeJobs
      },
      breakdown: {
        applicantsByStage,
        employeesByDepartment
      },
      financial: {
        totalPayroll: payrollStats[0]?.totalPayroll || 0,
        averagePayroll: payrollStats[0]?.avgPayroll || 0,
        averageSalary: salaryStats[0]?.avgSalary || 0,
        totalSalaryBudget: salaryStats[0]?.totalSalaryBudget || 0
      },
      recentActivity: {
        newEmployeesThisMonth: recentHires,
        pendingApplicants,
        thisMonthPayrollRecords: thisMonthPayroll
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Staff Hive Central API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: '1.0.0'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to Staff Hive Central API!',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        logout: 'POST /api/auth/logout'
      },
      employees: {
        list: 'GET /api/employees',
        get: 'GET /api/employees/:id',
        create: 'POST /api/employees',
        update: 'PUT /api/employees/:id',
        updateStatus: 'PATCH /api/employees/:id/status',
        delete: 'DELETE /api/employees/:id'
      },
      companies: {
        list: 'GET /api/companies',
        get: 'GET /api/companies/:id',
        create: 'POST /api/companies',
        update: 'PUT /api/companies/:id',
        delete: 'DELETE /api/companies/:id'
      },
      applicants: {
        list: 'GET /api/applicants',
        get: 'GET /api/applicants/:id',
        create: 'POST /api/applicants',
        update: 'PUT /api/applicants/:id',
        updateStage: 'PATCH /api/applicants/:id/stage',
        delete: 'DELETE /api/applicants/:id'
      },
      payroll: {
        list: 'GET /api/payroll',
        get: 'GET /api/payroll/:id',
        create: 'POST /api/payroll',
        generate: 'POST /api/payroll/generate',
        update: 'PUT /api/payroll/:id',
        updateStatus: 'PATCH /api/payroll/:id/status',
        delete: 'DELETE /api/payroll/:id'
      },
      jobs: {
        list: 'GET /api/jobs',
        get: 'GET /api/jobs/:id',
        create: 'POST /api/jobs',
        update: 'PUT /api/jobs/:id',
        updateStatus: 'PATCH /api/jobs/:id/status',
        delete: 'DELETE /api/jobs/:id'
      },
      analytics: 'GET /api/analytics',
      health: 'GET /api/health'
    }
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth/*',
      '/api/employees/*',
      '/api/companies/*',
      '/api/applicants/*',
      '/api/payroll/*',
      '/api/jobs/*',
      '/api/analytics',
      '/api/health'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // Default error
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(isDevelopment && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/employees`);
  console.log(`   - GET  /api/companies`);
  console.log(`   - GET  /api/applicants`);
  console.log(`   - GET  /api/payroll`);
  console.log(`   - GET  /api/jobs`);
  console.log(`   - GET  /api/analytics`);
  console.log(`   - GET  /api/health`);
});

module.exports = { app, server };