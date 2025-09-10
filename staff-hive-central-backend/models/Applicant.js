// models/Applicant.js
const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
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
    trim: true,
    minlength: [10, 'Phone number must be at least 10 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['Entry Level (0-1 years)', 'Junior (1-3 years)', 'Mid-Level (3-5 years)', 'Senior (5-8 years)', 'Lead (8+ years)', 'Executive (10+ years)']
  },
  expectedSalary: {
    type: Number,
    min: [0, 'Expected salary must be positive']
  },
  location: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true,
    enum: ['Company Website', 'LinkedIn', 'Indeed', 'Glassdoor', 'Referral', 'Job Fair', 'Recruitment Agency', 'Social Media', 'Other']
  },
  resume: {
    type: String,
    trim: true
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  stage: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for full name
applicantSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Compound index for user-specific applicant emails
applicantSchema.index({ userId: 1, email: 1 }, { unique: true });
applicantSchema.index({ userId: 1, stage: 1 });

module.exports = mongoose.model('Applicant', applicantSchema);