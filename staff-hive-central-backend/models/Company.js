// models/Company.js - Updated Company model to match frontend expectations
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  businessType: {
    type: String,
    enum: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Non-Profit', 'Other'],
    required: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Business registration number is required'],
    trim: true
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Other']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year cannot be before 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Address Information
  streetAddress: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    enum: ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Delta', 'Kaduna', 'Ogun', 'Imo', 'Plateau']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid website URL']
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-100', '101-500', '501-1000', '1000+'],
    required: true
  },
  
  // HR Contact Information
  hrContactName: {
    type: String,
    required: [true, 'HR contact name is required'],
    trim: true
  },
  hrContactEmail: {
    type: String,
    required: [true, 'HR contact email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  hrContactPhone: {
    type: String,
    required: [true, 'HR contact phone is required'],
    trim: true
  },
  
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for unique company name per user
companySchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);