// models/Applicant.js - Job applicants model
const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Application Information
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  coverLetter: {
    type: String,
    trim: true
  },
  
  // Application Status
  stage: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Assessment', 'Reference Check', 'Offer', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  status: {
    type: String,
    enum: ['Active', 'Withdrawn', 'Rejected', 'Hired'],
    default: 'Active'
  },
  
  // Experience and Skills
  experience: {
    type: Number,
    required: true,
    min: [0, 'Experience cannot be negative']
  },
  skills: [{
    type: String,
    trim: true
  }],
  education: {
    degree: { type: String, required: true },
    field: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true }
  },
  
  // Interview Information
  interviews: [{
    date: { type: Date, required: true },
    interviewer: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['Phone', 'Video', 'In-Person', 'Technical'], 
      required: true 
    },
    notes: { type: String },
    rating: { 
      type: Number, 
      min: 1, 
      max: 10 
    }
  }],
  
  // Notes and Comments
  notes: {
    type: String,
    trim: true
  },
  
  // References
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
applicantSchema.index({ jobId: 1 });
applicantSchema.index({ companyId: 1 });
applicantSchema.index({ email: 1, jobId: 1 }, { unique: true }); // Prevent duplicate applications
applicantSchema.index({ stage: 1 });
applicantSchema.index({ status: 1 });

module.exports = mongoose.model('Applicant', applicantSchema);