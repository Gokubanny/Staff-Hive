// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters'],
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
  },
  salary: {
    type: Number,
    min: [0, 'Salary must be positive']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  closingDate: {
    type: Date
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, title: 'text', company: 'text', department: 'text' });

module.exports = mongoose.model('Job', jobSchema);