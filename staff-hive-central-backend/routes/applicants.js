// routes/applicants.js - Applicant routes
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const Applicant = require('../models/Applicant');
const Job = require('../models/Job');
const { validationResult } = require('express-validator');

// Applicant validation rules
const applicantValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('experience').isNumeric().withMessage('Experience must be a number')
];

// Get all applicants
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10, stage, status, jobId } = req.query;
    let query = { createdBy: req.user.userId };
    
    // Add filters
    if (stage && stage !== 'all') query.stage = stage;
    if (status && status !== 'all') query.status = status;
    if (jobId) query.jobId = jobId;
    
    const skip = (page - 1) * limit;
    
    let applicants = await Applicant.find(query)
      .populate('jobId', 'title department')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Applicant.countDocuments(query);
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      applicants = applicants.filter(applicant =>
        applicant.firstName.toLowerCase().includes(searchLower) ||
        applicant.lastName.toLowerCase().includes(searchLower) ||
        applicant.email.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: applicants,
      count: applicants.length,
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
});

// Get single applicant
router.get('/:id', auth, async (req, res) => {
  try {
    const applicant = await Applicant.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    }).populate('jobId', 'title department')
      .populate('companyId', 'name');
    
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
});

// Create new applicant
router.post('/', auth, applicantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if applicant already applied for this job
    const existingApplication = await Applicant.findOne({
      email: req.body.email,
      jobId: req.body.jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'This applicant has already applied for this job'
      });
    }

    // Get job details to set companyId
    const job = await Job.findById(req.body.jobId);
    if (!job) {
      return res.status(400).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applicantData = {
      ...req.body,
      companyId: job.companyId,
      createdBy: req.user.userId
    };
    
    const newApplicant = new Applicant(applicantData);
    await newApplicant.save();
    
    // Update job application count
    await Job.findByIdAndUpdate(req.body.jobId, {
      $inc: { applicationCount: 1 }
    });
    
    // Populate references before sending response
    await newApplicant.populate('jobId', 'title department');
    await newApplicant.populate('companyId', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Applicant created successfully',
      data: newApplicant
    });
  } catch (error) {
    console.error('Error creating applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating applicant',
      error: error.message
    });
  }
});

// Update applicant stage
router.patch('/:id/stage', auth, async (req, res) => {
  try {
    const { stage } = req.body;
    
    const validStages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Reference Check', 'Offer', 'Hired', 'Rejected'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stage value'
      });
    }

    const updatedApplicant = await Applicant.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { stage },
      { new: true, runValidators: true }
    ).populate('jobId', 'title department')
      .populate('companyId', 'name');
    
    if (!updatedApplicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Applicant stage updated successfully',
      data: updatedApplicant
    });
  } catch (error) {
    console.error('Error updating applicant stage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating applicant stage',
      error: error.message
    });
  }
});

// Update applicant
router.put('/:id', auth, applicantValidation, async (req, res) => {
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
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('jobId', 'title department')
      .populate('companyId', 'name');
    
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
});

// Delete applicant
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedApplicant = await Applicant.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    
    if (!deletedApplicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }
    
    // Decrease job application count
    await Job.findByIdAndUpdate(deletedApplicant.jobId, {
      $inc: { applicationCount: -1 }
    });
    
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
});

module.exports = router;