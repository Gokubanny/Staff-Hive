const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    min: [0, 'Base salary must be positive']
  },
  overtime: {
    type: Number,
    default: 0,
    min: [0, 'Overtime must be positive']
  },
  bonuses: {
    type: Number,
    default: 0,
    min: [0, 'Bonuses must be positive']
  },
  deductions: {
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax deduction must be positive']
    },
    pension: {
      type: Number,
      default: 0,
      min: [0, 'Pension deduction must be positive']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, 'Other deductions must be positive']
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount must be positive']
  },
  period: {
    type: String,
    required: [true, 'Payroll period is required'],
    match: [/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processedDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductions').get(function() {
  return (this.deductions.tax || 0) + (this.deductions.pension || 0) + (this.deductions.other || 0);
});

// Pre-save hook to calculate totalAmount on creation
payrollSchema.pre('save', function(next) {
  this.totalAmount = (this.baseSalary || 0) + (this.overtime || 0) + (this.bonuses || 0) - this.totalDeductions;
  next();
});

// Pre-update hook to recalculate totalAmount on findOneAndUpdate
payrollSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();

  // Get the fields from the update or fallback to 0
  const baseSalary = update.baseSalary ?? 0;
  const overtime = update.overtime ?? 0;
  const bonuses = update.bonuses ?? 0;
  const deductions = update.deductions ?? {};

  const tax = deductions.tax ?? 0;
  const pension = deductions.pension ?? 0;
  const other = deductions.other ?? 0;

  const totalDeductions = tax + pension + other;
  update.totalAmount = baseSalary + overtime + bonuses - totalDeductions;

  this.setUpdate(update);
  next();
});

// Compound index to prevent duplicate payroll for same employee and period
payrollSchema.index({ userId: 1, employeeId: 1, period: 1 }, { unique: true });
payrollSchema.index({ userId: 1, status: 1 });
payrollSchema.index({ userId: 1, period: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
