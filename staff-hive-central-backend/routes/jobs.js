// routes/jobs.js - Job routes
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const Job = require('../models/Job');
const { validationResult } = require('express-validator');

// Job validation rules
const jobValidation = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Job title must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 50 }).withMessage('Job description must be at least 50 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Intern']).withMessage('Please select a valid employment type'),
  body('experienceLevel').isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Executive']).withMessage('Please select a valid experience level'),
  body('applicationDeadline').isISO8601().withMessage('Please provide a valid application deadline'),
  body('salaryRange.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salaryRange.max').isNumeric().withMessage('Maximum salary must be a number')
];

// Get all jobs
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10, status, department } = req.query;
    let query = { createdBy: req.user.userId };
    
    // Add filters
    if (status && status !== 'all') query.status = status;
    if (department && department !== 'all') query.department = department;
    
    const skip = (page - 1) * limit;
    
    let jobs = await Job.find(query)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: jobs,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Get single job
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    }).populate('companyId', 'name');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// Create new job
router.post('/', auth, jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const jobData = {
      ...req.body,
      createdBy: req.user.userId
    };
    
    const newJob = new Job(jobData);
    await newJob.save();
    
    // Populate references before sending response
    await newJob.populate('companyId', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: newJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
});

// Update job
router.put('/:id', auth, jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('companyId', 'name');
    
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedJob = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
});

module.exports = router;