// controllers/payrollController.js (Fixed version)
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// Get all payroll records for logged-in user
exports.getPayrollRecords = async (req, res) => {
  try {
    const { period, status, page = 1, limit = 10 } = req.query;
    let query = { userId: req.user.userId };
    
    if (period) query.period = period;
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const payrollRecords = await Payroll.find(query)
      .populate('employeeId', 'name position department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Payroll.countDocuments(query);
    
    res.json({
      success: true,
      data: payrollRecords,
      count: payrollRecords.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payroll records',
      error: error.message
    });
  }
};

// Get single payroll record
exports.getPayrollRecord = async (req, res) => {
  try {
    const payrollRecord = await Payroll.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    }).populate('employeeId', 'name position department');
    
    if (!payrollRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    res.json({
      success: true,
      data: payrollRecord
    });
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payroll record',
      error: error.message
    });
  }
};

// Generate payroll for selected employees
exports.generatePayroll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { employeeIds, period } = req.body;
    
    const employees = await Employee.find({
      _id: { $in: employeeIds },
      userId: req.user.userId,
      status: 'active'
    });
    
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid active employees found'
      });
    }
    
    const currentDate = new Date();
    const payrollPeriod = period || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const payrollRecords = [];
    const existingRecords = [];
    
    for (const employee of employees) {
      // Check if payroll already exists for this employee and period
      const existingRecord = await Payroll.findOne({
        employeeId: employee._id,
        period: payrollPeriod,
        userId: req.user.userId
      });
      
      if (existingRecord) {
        existingRecords.push(employee.name);
        continue;
      }
      
      const baseSalary = employee.salary || 0;
      const overtime = 0;
      const bonuses = baseSalary * 0.1; // 10% bonus
      const taxDeduction = baseSalary * 0.075; // 7.5% tax
      const pensionDeduction = baseSalary * 0.08; // 8% pension
      const totalDeductions = taxDeduction + pensionDeduction;
      
      const payrollData = {
        employeeId: employee._id,
        employeeName: employee.name,
        baseSalary: baseSalary,
        overtime: overtime,
        bonuses: bonuses,
        deductions: {
          tax: taxDeduction,
          pension: pensionDeduction,
          other: 0
        },
        totalAmount: baseSalary + overtime + bonuses - totalDeductions,
        period: payrollPeriod,
        status: 'completed',
        processedDate: new Date(),
        userId: req.user.userId
      };
      
      const payrollRecord = new Payroll(payrollData);
      await payrollRecord.save();
      payrollRecords.push(payrollRecord);
    }
    
    let message = `Payroll generated for ${payrollRecords.length} employees`;
    if (existingRecords.length > 0) {
      message += `. Skipped ${existingRecords.length} employees with existing payroll: ${existingRecords.join(', ')}`;
    }
    
    res.status(201).json({
      success: true,
      message,
      data: {
        generated: payrollRecords,
        skipped: existingRecords,
        count: payrollRecords.length
      }
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating payroll',
      error: error.message
    });
  }
};

// Add individual payroll record
exports.addPayrollRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if employee exists and belongs to user
    const employee = await Employee.findOne({
      _id: req.body.employeeId,
      userId: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if payroll already exists for this employee and period
    const existingRecord = await Payroll.findOne({
      employeeId: req.body.employeeId,
      period: req.body.period,
      userId: req.user.userId
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Payroll record already exists for this employee and period'
      });
    }

    const payrollData = {
      ...req.body,
      userId: req.user.userId,
      processedDate: new Date()
    };
    
    const newRecord = new Payroll(payrollData);
    await newRecord.save();
    
    res.status(201).json({
      success: true,
      message: 'Payroll record added successfully',
      data: newRecord
    });
  } catch (error) {
    console.error('Error adding payroll record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payroll record',
      error: error.message
    });
  }
};

// Update payroll record
exports.updatePayrollRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedRecord = await Payroll.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payroll record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating payroll record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payroll record',
      error: error.message
    });
  }
};

// Update payroll status
exports.updatePayrollStatus = async (req, res) => {
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
    
    const updatedRecord = await Payroll.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payroll status updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payroll status',
      error: error.message
    });
  }
};

// Delete payroll record
exports.deletePayrollRecord = async (req, res) => {
  try {
    const deletedRecord = await Payroll.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payroll record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payroll record',
      error: error.message
    });
  }
};