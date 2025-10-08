//controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// ✅ Employee Check-in (Fixed)
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    // Get employee details from User model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({ userId, date: today });
    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: "Already checked in today",
        data: existingAttendance 
      });
    }

    const attendance = new Attendance({
      userId,
      employeeId: user.employeeId || user._id.toString(),
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      department: user.department || "Unknown",
      email: user.email,
      date: today,
      checkInTime: currentTime,
      location: req.body.location || "Unknown",
      ipAddress: req.body.ipAddress || req.ip || req.connection?.remoteAddress || 'Unknown',
      status: "working"
    });

    await attendance.save();
    res.status(201).json({
      success: true,
      message: "Check-in successful",
      data: attendance
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error during check-in"
    });
  }
};

// ✅ Employee Check-out (Fixed)
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    // Find today's attendance record
    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'No check-in record found for today. Please check in first.' 
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already checked out today',
        data: attendance 
      });
    }

    // Update checkout time
    attendance.checkOutTime = currentTime;
    attendance.status = 'completed';
    attendance.duration = attendance.calculateDuration();

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
      message: 'Error during check-out' 
    });
  }
};

// ✅ Get today's attendance for current user (Fixed)
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ userId, date: today });
    res.json({ 
      success: true, 
      data: attendance 
    });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching attendance data' 
    });
  }
};

// ✅ Get attendance history for current user
exports.getHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    let query = { userId };
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
      message: 'Error fetching attendance history' 
    });
  }
};

// ✅ Admin: Get all attendance for specific date
exports.getAllByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const records = await Attendance.find({ date }).sort({ checkInTime: 1 });
    res.json({ 
      success: true, 
      data: records, 
      count: records.length 
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching attendance data' 
    });
  }
};

// ✅ Admin: Get statistics
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const stats = await Attendance.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          completedDays: { $sum: { $cond: [{ $ne: ['$checkOutTime', null] }, 1, 0] } },
          workingDays: { $sum: { $cond: [{ $and: [{ $ne: ['$checkInTime', null] }, { $eq: ['$checkOutTime', null] }] }, 1, 0] } }
        }
      }
    ]);

    const departmentStats = await Attendance.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: '$department', 
          count: { $sum: 1 }, 
          completed: { $sum: { $cond: [{ $ne: ['$checkOutTime', null] }, 1, 0] } } 
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
      message: 'Error fetching attendance statistics' 
    });
  }
};