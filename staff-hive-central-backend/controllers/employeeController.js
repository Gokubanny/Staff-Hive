// controllers/employeeController.js (Fixed version)
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// Get all employees for logged-in user
exports.getEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    let query = { userId: req.user.userId };
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const employees = await Employee.find(query)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Employee.countDocuments(query);
    
    // Filter by search term if provided
    let filteredEmployees = employees;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.position.toLowerCase().includes(searchLower) ||
        employee.department.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: filteredEmployees,
      count: filteredEmployees.length,
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
};

// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    }).populate('companyId', 'name');
    
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
};

// Add new employee
exports.addEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if employee with same email already exists
    const existingEmployee = await Employee.findOne({
      email: req.body.email.toLowerCase().trim(),
      userId: req.user.userId
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    const employeeData = {
      ...req.body,
      userId: req.user.userId,
      email: req.body.email.toLowerCase().trim(),
      status: req.body.status || 'active'
    };
    
    const newEmployee = new Employee(employeeData);
    await newEmployee.save();
    
    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      data: newEmployee
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding employee',
      error: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Update employee status
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    
    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status },
      { new: true, runValidators: true }
    );
    
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
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await Employee.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
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
};