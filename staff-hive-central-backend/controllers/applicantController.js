// controllers/applicantController.js (Fixed version)
const Applicant = require('../models/Applicant');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper function to determine department based on position
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

// Get all applicants for logged-in user
exports.getApplicants = async (req, res) => {
  try {
    const { stage, search, page = 1, limit = 10 } = req.query;
    let query = { userId: req.user.userId };
    
    if (stage && stage !== 'all') {
      query.stage = stage;
    }
    
    const skip = (page - 1) * limit;
    
    const applicants = await Applicant.find(query)
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Applicant.countDocuments(query);
    
    // Filter by search term if provided
    let filteredApplicants = applicants;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplicants = applicants.filter(applicant =>
        applicant.firstName.toLowerCase().includes(searchLower) ||
        applicant.lastName.toLowerCase().includes(searchLower) ||
        applicant.email.toLowerCase().includes(searchLower) ||
        applicant.position.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: filteredApplicants,
      count: filteredApplicants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applicants',
      error: error.message
    });
  }
};

// Get single applicant
exports.getApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    }).populate('jobId', 'title company');
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    res.json({
      success: true,
      data: applicant
    });
  } catch (error) {
    console.error('Error fetching applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applicant',
      error: error.message
    });
  }
};

// Add new applicant
exports.addApplicant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if applicant with same email already exists
    const existingApplicant = await Applicant.findOne({
      email: req.body.email.toLowerCase().trim(),
      userId: req.user.userId
    });

    if (existingApplicant) {
      return res.status(400).json({
        success: false,
        message: 'Applicant with this email already exists'
      });
    }

    const applicantData = {
      ...req.body,
      userId: req.user.userId,
      email: req.body.email.toLowerCase().trim(),
      stage: 'applied',
      appliedDate: new Date()
    };
    
    const newApplicant = new Applicant(applicantData);
    await newApplicant.save();
    
    res.status(201).json({
      success: true,
      message: 'Applicant added successfully',
      data: newApplicant
    });
  } catch (error) {
    console.error('Error adding applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding applicant',
      error: error.message
    });
  }
};

// Update applicant
exports.updateApplicant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedApplicant = await Applicant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedApplicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Applicant updated successfully',
      data: updatedApplicant
    });
  } catch (error) {
    console.error('Error updating applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating applicant',
      error: error.message
    });
  }
};

// Update applicant stage
exports.updateApplicantStage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { stage } = req.body;
    
    const applicant = await Applicant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { stage },
      { new: true, runValidators: true }
    );
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    // If hired, automatically create employee record
    if (stage === 'hired') {
      const employeeData = {
        name: `${applicant.firstName} ${applicant.lastName}`,
        email: applicant.email,
        phone: applicant.phone,
        position: applicant.position,
        department: getDefaultDepartment(applicant.position),
        salary: applicant.expectedSalary || 0,
        hireDate: new Date(),
        status: 'active',
        userId: req.user.userId
      };
      
      const newEmployee = new Employee(employeeData);
      await newEmployee.save();
    }
    
    res.json({
      success: true,
      message: 'Applicant stage updated successfully',
      data: applicant
    });
  } catch (error) {
    console.error('Error updating applicant stage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating applicant stage',
      error: error.message
    });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
  try {
    const deletedApplicant = await Applicant.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!deletedApplicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Applicant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting applicant',
      error: error.message
    });
  }
};