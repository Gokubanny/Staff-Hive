//controllers/attendanceController
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// ✅ Employee Check-in
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    // ✅ Get employee details from User model (instead of requiring frontend to send them)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingAttendance = await Attendance.findOne({ userId, date: today });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: "Already checked in today" });
    }

    const attendance = new Attendance({
      userId,
      employeeId: user.employeeId || user._id.toString(), // fallback if not set
      name: user.name || `${user.firstName} ${user.lastName}`,
      department: user.department || "Unknown",
      email: user.email,
      date: today,
      checkInTime: currentTime,
      location: req.body.location || "Unknown",
      ipAddress: req.body.ipAddress || req.ip,
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


// ✅ Employee Check-out
exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    const attendance = await Attendance.findOne({ userId, employeeId, date: today });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No check-in record found for today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Employee already checked out today' });
    }

    attendance.checkOutTime = currentTime;
    attendance.status = 'completed';
    attendance.updatedAt = new Date();
    attendance.duration = attendance.calculateDuration();

    await attendance.save();
    res.json({ success: true, message: 'Check-out successful', data: attendance });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ success: false, message: 'Error during check-out' });
  }
};

// ✅ Get today's attendance for an employee
exports.getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ userId, employeeId, date: today });
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ success: false, message: 'Error fetching attendance data' });
  }
};

// ✅ Get attendance history
exports.getHistory = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    let query = { userId };
    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .sort({ date: -1, checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance history' });
  }
};

// ✅ Admin: Get all attendance for specific date
exports.getAllByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const records = await Attendance.find({ userId, date }).sort({ checkInTime: 1 });
    res.json({ success: true, data: records, count: records.length });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance data' });
  }
};


// ✅ Admin: Get statistics
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    let dateFilter = { userId };
    if (startDate && endDate) dateFilter.date = { $gte: startDate, $lte: endDate };

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
      { $group: { _id: '$department', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $ne: ['$checkOutTime', null] }, 1, 0] } } } }
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
    res.status(500).json({ success: false, message: 'Error fetching attendance statistics' });
  }
};
