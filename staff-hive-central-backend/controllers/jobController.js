// controllers/jobController.js (Fixed version)
const Job = require('../models/Job');
const { validationResult } = require('express-validator');

// Get all jobs for logged-in user
exports.getJobs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    let query = { userId: req.user.userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(query)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    // Filter by search term if provided
    let filteredJobs = jobs;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: filteredJobs,
      count: filteredJobs.length,
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
};

// Get single job
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
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
};

// Add new job
exports.addJob = async (req, res) => {
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
      userId: req.user.userId,
      status: req.body.status || 'active',
      postedDate: new Date()
    };
    
    const newJob = new Job(jobData);
    await newJob.save();
    
    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: newJob
    });
  } catch (error) {
    console.error('Error adding job:', error);
    res.status(500).json({
      success: false,
      message: 'Error posting job',
      error: error.message
    });
  }
};

// Update job
exports.updateJob = async (req, res) => {
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
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
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
};

// Update job status
exports.updateJobStatus = async (req, res) => {
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
    
    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: error.message
    });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
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
};