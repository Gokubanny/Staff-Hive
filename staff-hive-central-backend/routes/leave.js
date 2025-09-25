// routes/leave.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

// Import controllers
const {
  submitLeaveRequest,
  getUserLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
  getLeaveBalance,
  getLeaveStats,
} = require("../controllers/leaveController");

// ====================== Submit Leave ======================
router.post("/submit", auth, submitLeaveRequest);

// ====================== User Leave Requests ======================
router.get("/user/:employeeId", auth, getUserLeaveRequests);

// ====================== Admin: All Leave Requests ======================
router.get("/admin/all", auth, getAllLeaveRequests);

// ====================== Admin: Update Leave Status ======================
router.put("/admin/update-status", auth, updateLeaveStatus);

// ====================== Employee Leave Balance ======================
router.get("/balance/:employeeId", auth, getLeaveBalance);

// ====================== Admin: Leave Statistics ======================
router.get("/admin/stats", auth, getLeaveStats);

module.exports = router;
