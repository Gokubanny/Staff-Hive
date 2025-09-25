//models/Attendance
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
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
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  checkInTime: {
    type: String, // HH:MM format
    required: true
  },
  checkOutTime: {
    type: String, // HH:MM format
    default: null
  },
  duration: {
    type: String, // e.g., "8h 30m"
    default: null
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  status: {
    type: String,
    enum: ['working', 'completed', 'absent'],
    default: 'working'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
attendanceSchema.index({ userId: 1, employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ employeeId: 1, date: -1 });

// Virtuals
attendanceSchema.virtual('checkInDateTime').get(function () {
  if (this.date && this.checkInTime) {
    return new Date(`${this.date}T${this.checkInTime}:00`);
  }
  return null;
});

attendanceSchema.virtual('checkOutDateTime').get(function () {
  if (this.date && this.checkOutTime) {
    return new Date(`${this.date}T${this.checkOutTime}:00`);
  }
  return null;
});

// Method to calculate work duration
attendanceSchema.methods.calculateDuration = function () {
  if (this.checkInTime && this.checkOutTime) {
    const checkIn = new Date(`${this.date}T${this.checkInTime}:00`);
    const checkOut = new Date(`${this.date}T${this.checkOutTime}:00`);
    const diffMs = checkOut - checkIn;

    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
  }
  return null;
};

// Pre-save middleware to calculate duration
attendanceSchema.pre('save', function (next) {
  if (this.checkInTime && this.checkOutTime && !this.duration) {
    this.duration = this.calculateDuration();
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
