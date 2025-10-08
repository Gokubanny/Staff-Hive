// models/Employee.js - Add companyName field
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Personal Information
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
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: true
  },
  
  // Employment Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Terminated', 'On Leave'],
    default: 'Active'
  },
  
  // Additional fields from user profile
  bio: String,
  skills: [String],
  education: [{
    id: Number,
    degree: String,
    institution: String,
    year: String,
    gpa: String
  }],
  experience: [{
    id: Number,
    title: String,
    company: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  certifications: [{
    id: Number,
    name: String,
    issuer: String,
    date: String,
    expiryDate: String
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String
  },
  yearsExperience: String,
  industry: String,
  noticePeriod: String,
  
  // Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true }
  },
  
  // References
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ userId: 1 });
employeeSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Employee', employeeSchema);