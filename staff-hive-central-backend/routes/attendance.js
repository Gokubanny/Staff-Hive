// routes/attendance.js
import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

// Employee endpoints
router.post('/checkin', auth, attendanceController.checkIn);
router.put('/checkout', auth, attendanceController.checkOut);
router.get('/today/:employeeId', auth, attendanceController.getTodayAttendance);
router.get('/history', auth, attendanceController.getHistory);

// Admin endpoints (require admin role)
router.get('/admin/date/:date', auth, adminOnly, attendanceController.getAllByDate);
router.get('/admin/stats', auth, adminOnly, attendanceController.getStats);

export default router;