// routes/leave.js
import express from "express";
import { auth } from "../middleware/auth.js";

// Import controllers
import {
  submitLeaveRequest,
  getUserLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
  getLeaveBalance,
  getLeaveStats,
} from "../controllers/leaveController.js";

const router = express.Router();

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

export default router;