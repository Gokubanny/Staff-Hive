// controllers/leaveController.js
const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const User = require("../models/User");

// ====================== Submit Leave ======================
exports.submitLeaveRequest = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      email,
      department,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      emergencyContact,
      workHandover,
      managerEmail,
    } = req.body;

    const userId = req.user.userId;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: employeeId, leaveType, startDate, endDate, reason",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start > end) {
      return res
        .status(400)
        .json({ success: false, message: "Start date cannot be after end date" });
    }

    if (start < today.setHours(0, 0, 0, 0)) {
      return res
        .status(400)
        .json({ success: false, message: "Start date cannot be in the past" });
    }

    const calculatedDays =
      days || Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const requestId = `LR_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const leaveRequest = new LeaveRequest({
      userId,
      requestId,
      employeeId,
      employeeName,
      email,
      department,
      leaveType,
      startDate,
      endDate,
      days: calculatedDays,
      reason,
      emergencyContact,
      workHandover,
      managerEmail,
      status: "pending",
      submittedAt: new Date(),
      appliedDate: new Date().toISOString().split("T")[0],
    });

    await leaveRequest.save();

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Leave request submission error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting leave request",
    });
  }
};

// ====================== User Leave Requests ======================
exports.getUserLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId, employeeId };
    if (status && status !== "all") query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const requests = await LeaveRequest.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching user leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave requests",
    });
  }
};

// ====================== Admin: All Leave Requests ======================
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, department, leaveType, page = 1, limit = 50 } = req.query;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    let query = {};
    if (status && status !== "all") query.status = status;
    if (department && department !== "all") query.department = department;
    if (leaveType && leaveType !== "all") query.leaveType = leaveType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const requests = await LeaveRequest.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching all leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave requests",
    });
  }
};

// ====================== Admin: Update Leave Status ======================
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { requestId, status, reason = "" } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Request ID and status are required",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const leaveRequest = await LeaveRequest.findOne({
      $or: [{ requestId }, { _id: requestId }],
    });

    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave request not found" });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leaveRequest.status}`,
      });
    }

    leaveRequest.status = status;
    leaveRequest[`${status}By`] = "Admin";
    leaveRequest[`${status}Date`] = new Date().toISOString().split("T")[0];
    leaveRequest.lastUpdated = new Date();

    if (status === "rejected" && reason) {
      leaveRequest.rejectionReason = reason;
    }

    await leaveRequest.save();

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating leave status",
    });
  }
};

// ====================== Employee Leave Balance ======================
exports.getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.userId;

    let employee = await Employee.findOne({ userId, employeeId });

    const defaultBalances = {
      annual: 25,
      sick: 15,
      personal: 7,
      maternity: 120,
      paternity: 14,
      bereavement: 5,
      emergency: 3,
    };

    const leaveBalances = employee?.leaveBalances || defaultBalances;

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const usedLeave = await LeaveRequest.aggregate([
      {
        $match: {
          userId,
          employeeId,
          status: "approved",
          startDate: {
            $gte: yearStart.toISOString().split("T")[0],
            $lte: yearEnd.toISOString().split("T")[0],
          },
        },
      },
      { $group: { _id: "$leaveType", totalDays: { $sum: "$days" } } },
    ]);

    const pendingLeave = await LeaveRequest.aggregate([
      {
        $match: {
          userId,
          employeeId,
          status: "pending",
          startDate: { $gte: new Date().toISOString().split("T")[0] },
        },
      },
      { $group: { _id: "$leaveType", totalDays: { $sum: "$days" } } },
    ]);

    const currentBalances = {};
    Object.keys(leaveBalances).forEach((type) => {
      const allocated = leaveBalances[type];
      const used = usedLeave.find((u) => u._id === type)?.totalDays || 0;
      const pending = pendingLeave.find((p) => p._id === type)?.totalDays || 0;
      const current = Math.max(0, allocated - used);
      currentBalances[type] = { allocated, used, pending, current };
    });

    res.json({
      success: true,
      data: {
        employeeId,
        year: currentYear,
        balances: currentBalances,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave balance",
    });
  }
};

// ====================== Admin: Leave Statistics ======================
exports.getLeaveStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    let match = {};
    if (startDate && endDate) {
      match.submittedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const overallStats = await LeaveRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          totalDays: { $sum: "$days" },
          averageDays: { $avg: "$days" },
        },
      },
    ]);

    const leaveTypeStats = await LeaveRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
          totalDays: { $sum: "$days" },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
    ]);

    const departmentStats = await LeaveRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          totalDays: { $sum: "$days" },
          averageDays: { $avg: "$days" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary:
          overallStats[0] || {
            totalRequests: 0,
            pendingRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0,
            totalDays: 0,
            averageDays: 0,
          },
        byLeaveType: leaveTypeStats,
        byDepartment: departmentStats,
      },
    });
  } catch (error) {
    console.error("Error fetching leave statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave statistics",
    });
  }
};
