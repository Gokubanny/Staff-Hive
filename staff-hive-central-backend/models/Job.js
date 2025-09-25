// models/Job.js - Job postings model
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [50, 'Job description must be at least 50 characters']
  },
  requirements: [{
    type: String,
    required: true,
    trim: true
  }],
  responsibilities: [{
    type: String,
    required: true,
    trim: true
  }],
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
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    required: true
  },
  salaryRange: {
    min: {
      type: Number,
      required: true,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      required: true,
      min: [0, 'Maximum salary cannot be negative']
    }
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed', 'On Hold'],
    default: 'Draft'
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  
  // References
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Statistics
  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes
jobSchema.index({ companyId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDeadline: 1 });

module.exports = mongoose.model('Job', jobSchema);