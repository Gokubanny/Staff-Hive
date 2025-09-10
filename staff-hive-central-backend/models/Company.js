// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: [true, 'Company size is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for user-specific company names
companySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);