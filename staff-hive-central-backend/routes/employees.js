// routes/employees.js - FIXED VERSION with consistent field usage
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// Validation rules for employee
const employeeValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Please select a valid gender'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('startDate').isISO8601().withMessage('Please provide a valid start date'),
  body('salary').isNumeric().withMessage('Salary must be a number'),
  body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Intern']).withMessage('Please select a valid employment type')
];

// Get all employees - FIXED to use createdBy consistently
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 100, department, status } = req.query;
    
    // Use $or to query both createdBy and userId for backward compatibility
    let query = {
      $or: [
        { createdBy: req.user.userId },
        { userId: req.user.userId }
      ]
    };
    
    // Add filters
    if (department && department !== 'all') query.department = department;
    if (status && status !== 'all') query.status = status;
    
    const skip = (page - 1) * limit;
    
    let employees = await Employee.find(query)
      .populate('companyId', 'name')
      .populate('userId', 'name email companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Employee.countDocuments(query);
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.position.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: employees,
      count: employees.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// Get single employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.userId },
        { userId: req.user.userId }
      ]
    }).populate('companyId', 'name').populate('userId', 'name email companyName');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// Get employee by user ID (for current logged-in employee)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.params.userId
    }).populate('companyId', 'name');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee by user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee record',
      error: error.message
    });
  }
});

// Create new employee
router.post('/', auth, employeeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      employeeId: req.body.employeeId.trim()
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    const employeeData = {
      ...req.body,
      createdBy: req.user.userId,
      userId: req.body.userId || req.user.userId // Set userId to the employee's user account
    };
    
    const newEmployee = new Employee(employeeData);
    await newEmployee.save();
    
    // Populate references before sending response
    await newEmployee.populate('companyId', 'name');
    await newEmployee.populate('userId', 'name email companyName');
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or employee ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
});

// Update employee - FIXED to handle both admin updates and self-updates
router.put('/:id', auth, async (req, res) => {
  try {
    // Allow partial validation for updates
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Find employee - allow if created by user OR if it's the user's own record
    const employee = await Employee.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.userId },
        { userId: req.user.userId }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or you do not have permission to update this employee'
      });
    }

    // Update the employee
    Object.assign(employee, req.body);
    await employee.save();
    
    // Populate before returning
    await employee.populate('companyId', 'name');
    await employee.populate('userId', 'name email companyName');
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEmployee = await Employee.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
});

// Update employee status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Active', 'Inactive', 'Terminated', 'On Leave'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [
          { createdBy: req.user.userId },
          { userId: req.user.userId }
        ]
      },
      { status },
      { new: true, runValidators: true }
    ).populate('companyId', 'name').populate('userId', 'name email companyName');
    
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee status updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee status',
      error: error.message
    });
  }
});

module.exports = router;