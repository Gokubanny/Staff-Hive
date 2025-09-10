// models/LeaveRequest.js
const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: [
      'Annual Leave',
      'Sick Leave', 
      'Personal Leave',
      'Maternity Leave',
      'Paternity Leave',
      'Bereavement Leave',
      'Emergency Leave'
    ]
  },
  startDate: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  endDate: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: 0.5
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  workHandover: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  managerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  appliedDate: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedDate: {
    type: String // YYYY-MM-DD format
  },
  rejectedBy: {
    type: String,
    trim: true
  },
  rejectedDate: {
    type: String // YYYY-MM-DD format
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
leaveRequestSchema.index({ userId: 1, employeeId: 1, submittedAt: -1 });
leaveRequestSchema.index({ userId: 1, status: 1, submittedAt: -1 });
leaveRequestSchema.index({ requestId: 1 }, { unique: true });

// Virtual for formatted start date
leaveRequestSchema.virtual('startDateTime').get(function() {
  return new Date(this.startDate);
});

// Virtual for formatted end date
leaveRequestSchema.virtual('endDateTime').get(function() {
  return new Date(this.endDate);
});

// Method to calculate leave duration in business days
leaveRequestSchema.methods.calculateBusinessDays = function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  let businessDays = 0;
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
};

// Method to check if leave period is valid
leaveRequestSchema.methods.isValidPeriod = function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return start <= end && start >= today;
};

// Pre-save middleware to update lastUpdated
leaveRequestSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get leave statistics for a user
leaveRequestSchema.statics.getLeaveStatsByUser = function(userId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        status: 'approved',
        startDate: {
          $gte: startOfYear.toISOString().split('T')[0],
          $lte: endOfYear.toISOString().split('T')[0]
        }
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$days' },
        requests: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);