// utils/helpers.js
/**
 * Common utility functions for the Staff Hive Central backend
 */

// Format currency for Nigerian Naira
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };
  
  // Calculate payroll details
  const calculatePayrollDetails = (baseSalary) => {
    const overtime = 0; // Can be passed as parameter
    const bonuses = baseSalary * 0.1; // 10% bonus
    const taxDeduction = baseSalary * 0.075; // 7.5% tax
    const pensionDeduction = baseSalary * 0.08; // 8% pension
    const totalDeductions = taxDeduction + pensionDeduction;
    const netPay = baseSalary + overtime + bonuses - totalDeductions;
  
    return {
      baseSalary,
      overtime,
      bonuses,
      deductions: {
        tax: taxDeduction,
        pension: pensionDeduction,
        other: 0
      },
      totalDeductions,
      netPay
    };
  };
  
  // Generate employee ID
  const generateEmployeeId = (count) => {
    return `EMP${String(count + 1).padStart(4, '0')}`;
  };
  
  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };
  
  // Generate random password
  const generateRandomPassword = (length = 8) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };
  
  // Sanitize user input
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  };
  
  // Get default department based on position
  const getDefaultDepartment = (position) => {
    const positionMap = {
      'Software Engineer': 'Engineering',
      'Frontend Developer': 'Engineering',
      'Backend Developer': 'Engineering',
      'Full Stack Developer': 'Engineering',
      'DevOps Engineer': 'Engineering',
      'Data Scientist': 'Engineering',
      'Product Manager': 'Product',
      'UI/UX Designer': 'Design',
      'QA Engineer': 'Quality Assurance',
      'Business Analyst': 'Business Development',
      'Project Manager': 'Operations',
      'HR Manager': 'Human Resources',
      'Marketing Manager': 'Marketing',
      'Sales Representative': 'Sales',
      'Accountant': 'Finance'
    };
    
    return positionMap[position] || 'General';
  };
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Generate payroll period string
  const getCurrentPayrollPeriod = () => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Validate Nigerian phone number
  const isValidNigerianPhone = (phone) => {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };
  
  // Format Nigerian phone number
  const formatNigerianPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+234${cleaned.slice(1)}`;
    } else if (cleaned.length === 10) {
      return `+234${cleaned}`;
    }
    
    return phone; // Return original if can't format
  };
  
  // Response helper functions
  const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };
  
  const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString()
    });
  };
  
  module.exports = {
    formatCurrency,
    calculatePayrollDetails,
    generateEmployeeId,
    isValidEmail,
    generateRandomPassword,
    sanitizeInput,
    getDefaultDepartment,
    calculateAge,
    getCurrentPayrollPeriod,
    isValidNigerianPhone,
    formatNigerianPhone,
    successResponse,
    errorResponse
  };
  
  /* 
  FILE STRUCTURE SETUP GUIDE:
  
  1. CREATE THESE DIRECTORIES AND FILES:
  
  staff-hive-central-backend/
  ├── server.js (replace with updated version)
  ├── package.json (already exists)
  ├── .env (already exists)
  ├── models/
  │   ├── User.js (create this)
  │   ├── Employee.js (create this)
  │   ├── Company.js (create this)
  │   ├── Applicant.js (create this)
  │   ├── Payroll.js (create this)
  │   └── Job.js (create this)
  ├── routes/
  │   ├── auth.js (already exists)
  │   ├── employees.js (create this)
  │   ├── companies.js (create this)
  │   ├── applicants.js (create this)
  │   ├── payroll.js (create this)
  │   └── jobs.js (create this)
  ├── controllers/
  │   ├── employeeController.js (create this)
  │   ├── companyController.js (create this)
  │   ├── applicantController.js (create this)
  │   ├── payrollController.js (create this)
  │   └── jobController.js (create this)
  ├── middleware/
  │   └── auth.js (should already exist)
  └── utils/
      └── helpers.js (create this)
  
  2. FRONTEND UPDATES:
  
  src/
  ├── services/
  │   └── apiService.js (create this)
  └── contexts/
      └── DataContext.jsx (replace existing)
  
  3. SETUP STEPS:
  
  Step 1: Create backend directories
  mkdir models controllers utils
  
  Step 2: Create all the model files
  Copy the MongoDB schema code into each model file
  
  Step 3: Create all the controller files
  Copy the controller code for each entity
  
  Step 4: Create all the route files
  Copy the route definitions for each endpoint
  
  Step 5: Update server.js
  Replace your existing server.js with the updated version
  
  Step 6: Create utils/helpers.js
  Copy the utility functions
  
  Step 7: Update frontend
  - Create services/apiService.js
  - Replace contexts/DataContext.jsx
  
  Step 8: Test the setup
  npm run dev (backend)
  npm start (frontend)
  
  4. VERIFICATION CHECKLIST:
  
  □ All model files created in models/ directory
  □ All controller files created in controllers/ directory  
  □ All route files created in routes/ directory
  □ utils/helpers.js created
  □ server.js updated with new routes
  □ Frontend apiService.js created
  □ Frontend DataContext.jsx updated
  □ Backend running on http://localhost:5000
  □ Frontend connecting to backend successfully
  □ Authentication working
  □ Data operations (CRUD) working
  
  5. TESTING ENDPOINTS:
  
  GET  /api/health - Check server status
  POST /api/auth/register - Register new user
  POST /api/auth/login - Login user
  GET  /api/employees - Get employees
  POST /api/employees - Add employee
  GET  /api/analytics - Get dashboard analytics
  
  */