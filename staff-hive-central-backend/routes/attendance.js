// routes/attendance.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// POST /api/attendance/checkin - Employee check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const { employeeId, name, department, email, location, ipAddress } = req.body;
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

    // Check if employee already checked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      employeeId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Employee already checked in today'
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      userId,
      employeeId,
      name,
      department,
      email,
      date: today,
      checkInTime: currentTime,
      location: location || 'Unknown',
      ipAddress: ipAddress || req.ip,
      status: 'working'
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/attendance/checkout - Employee check out
router.put('/checkout', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId,
      employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Employee already checked out today'
      });
    }

    // Update with check-out time
    attendance.checkOutTime = currentTime;
    attendance.status = 'completed';
    attendance.updatedAt = new Date();

    // Calculate duration
    const checkIn = new Date(`${today} ${attendance.checkInTime}`);
    const checkOut = new Date(`${today} ${currentTime}`);
    const durationMs = checkOut - checkIn;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    attendance.duration = `${hours}h ${minutes}m`;

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-out',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/attendance/today/:employeeId - Get today's attendance for specific employee
router.get('/today/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      userId,
      employeeId,
      date: today
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/attendance/history - Get attendance history with filters
router.get('/history', auth, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    let query = { userId };
    
    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);
    
    const records = await Attendance.find(query)
      .sort({ date: -1, checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/attendance/admin/date/:date - Admin: Get all attendance for specific date
router.get('/admin/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    // Verify user is admin
    const user = await require('../models/User').findById(userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const records = await Attendance.find({
      userId,
      date
    }).sort({ checkInTime: 1 });

    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/attendance/admin/stats - Admin: Get attendance statistics
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Verify user is admin
    const user = await require('../models/User').findById(userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    let dateFilter = { userId };
    if (startDate && endDate) {
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const stats = await Attendance.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          completedDays: { 
            $sum: { 
              $cond: [{ $ne: ["$checkOutTime", null] }, 1, 0] 
            }
          },
          workingDays: { 
            $sum: { 
              $cond: [
                { $and: [{ $ne: ["$checkInTime", null] }, { $eq: ["$checkOutTime", null] }] }, 
                1, 
                0
              ] 
            }
          }
        }
      }
    ]);

    // Get department breakdown
    const departmentStats = await Attendance.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          completed: { 
            $sum: { 
              $cond: [{ $ne: ["$checkOutTime", null] }, 1, 0] 
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { totalRecords: 0, completedDays: 0, workingDays: 0 },
        departmentBreakdown: departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;