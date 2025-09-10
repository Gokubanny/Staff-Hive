// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
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
    trim: true,
    minlength: [10, 'Phone number must be at least 10 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    minlength: [2, 'Position must be at least 2 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    minlength: [2, 'Department must be at least 2 characters']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary must be a positive number']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
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
  employeeNumber: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
employeeSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode } = this.address;
  return [street, city, state, zipCode].filter(Boolean).join(', ');
});

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return 0;
  const today = new Date();
  const years = today.getFullYear() - this.hireDate.getFullYear();
  const monthDiff = today.getMonth() - this.hireDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.hireDate.getDate())) {
    return Math.max(0, years - 1);
  }
  return years;
});

// Compound index for better query performance
employeeSchema.index({ userId: 1, email: 1 }, { unique: true });
employeeSchema.index({ userId: 1, department: 1 });
employeeSchema.index({ userId: 1, status: 1 });

// Pre-save middleware to generate employee number
employeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeNumber) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    this.employeeNumber = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);