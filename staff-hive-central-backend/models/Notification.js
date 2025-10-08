// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'user_verification_request',
      'user_verified',
      'user_rejected',
      'system',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.statics.createVerificationRequest = async function(adminId, newUser) {
  return this.create({
    recipient: adminId,
    sender: newUser._id,
    type: 'user_verification_request',
    title: 'New User Registration',
    message: `${newUser.name} (${newUser.email}) has registered and is waiting for your approval.`,
    data: {
      userId: newUser._id,
      userName: newUser.name,
      userEmail: newUser.email,
      employeeId: newUser.employeeId,
      companyName: newUser.companyName
    },
    actionUrl: `/admin/pending-users`,
    priority: 'high'
  });
};

notificationSchema.statics.createApprovalNotification = async function(userId, adminName) {
  return this.create({
    recipient: userId,
    type: 'user_verified',
    title: 'Account Approved! 🎉',
    message: `Your account has been approved by ${adminName}. You can now access all features.`,
    priority: 'high'
  });
};

notificationSchema.statics.createRejectionNotification = async function(userId, reason) {
  return this.create({
    recipient: userId,
    type: 'user_rejected',
    title: 'Account Registration Declined',
    message: `Your account registration was not approved. Reason: ${reason || 'Not specified'}`,
    priority: 'high'
  });
};

module.exports = mongoose.model('Notification', notificationSchema);