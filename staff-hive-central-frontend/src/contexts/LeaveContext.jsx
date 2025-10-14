// src/contexts/LeaveContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

// Context
const LeaveContext = createContext();

// API base URL
// In all context files
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://staff-hive-backend.onrender.com/api';

// ---------------------
// API service functions
// ---------------------
const leaveAPI = {
  submitLeaveRequest: async (requestData) => {
    const response = await fetch(`${API_BASE_URL}/leave/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit leave request");
    }
    return await response.json();
  },

  getUserLeaveRequests: async (employeeId) => {
    const response = await fetch(`${API_BASE_URL}/leave/user/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch leave requests");
    return await response.json();
  },

  // ✅ Fixed: admin/all route
  getAllLeaveRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/leave/admin/all?${params}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch leave requests");
    return await response.json();
  },

  // ✅ Fixed: admin/update-status route
  updateLeaveStatus: async (requestId, status, reason = "") => {
    const response = await fetch(`${API_BASE_URL}/leave/admin/update-status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId, status, reason }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update leave status");
    }
    return await response.json();
  },

  getLeaveBalance: async (employeeId) => {
    const response = await fetch(
      `${API_BASE_URL}/leave/balance/${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch leave balance");
    return await response.json();
  },

  // ✅ Fixed: admin/stats route
  getLeaveStats: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${API_BASE_URL}/leave/admin/stats?${params}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch leave statistics");
    return await response.json();
  },
};

// ---------------------
// Leave types config
// ---------------------
export const leaveTypeConfigs = {
  annual: {
    name: "Annual Leave",
    description: "Vacation and holiday time",
    yearlyAllocation: 25,
    carryOverLimit: 5,
    accrualRate: 2.08,
    canCarryOver: true,
    minNotice: 7,
    maxConsecutive: 30,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  sick: {
    name: "Sick Leave",
    description: "Medical and health-related leave",
    yearlyAllocation: 15,
    carryOverLimit: 0,
    accrualRate: 1.25,
    canCarryOver: false,
    minNotice: 0,
    maxConsecutive: 14,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
  // ... other leave types
};

// ---------------------
// Hook
// ---------------------
export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error("useLeave must be used within a LeaveProvider");
  }
  return context;
};

// ---------------------
// Provider
// ---------------------
export const LeaveProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userLeaveBalance, setUserLeaveBalance] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----- Wrapper functions -----
  const submitLeaveRequest = useCallback(async (data) => {
    try {
      setIsLoading(true);
      const result = await leaveAPI.submitLeaveRequest(data);
      setLeaveRequests((prev) => [...prev, result.data]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserLeaveRequests = useCallback(async (employeeId) => {
    try {
      setIsLoading(true);
      const result = await leaveAPI.getUserLeaveRequests(employeeId);
      setLeaveRequests(result.data || []);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAllLeaveRequests = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      const result = await leaveAPI.getAllLeaveRequests(filters);
      setLeaveRequests(result.data || []);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLeaveStatus = useCallback(async (requestId, status, reason) => {
    try {
      setIsLoading(true);
      const result = await leaveAPI.updateLeaveStatus(
        requestId,
        status,
        reason
      );
      setLeaveRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status } : req))
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLeaveBalance = useCallback(async (employeeId) => {
    try {
      setIsLoading(true);
      const result = await leaveAPI.getLeaveBalance(employeeId);
      setUserLeaveBalance(result.data || {});
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLeaveStatistics = useCallback(async (startDate, endDate) => {
    try {
      setIsLoading(true);
      return await leaveAPI.getLeaveStats(startDate, endDate);
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helpers
  const getRequestsByStatus = (status) =>
    leaveRequests.filter((req) => req.status === status);

  const getEmployeeRequests = (employeeId) =>
    leaveRequests.filter((req) => req.employeeId === employeeId);

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? diff : 0;
  };

  const validateLeaveRequest = (type, startDate, endDate) => {
    const config = leaveTypeConfigs[type];
    if (!config) return { valid: false, message: "Invalid leave type" };

    const days = calculateLeaveDays(startDate, endDate);
    if (days > config.maxConsecutive) {
      return {
        valid: false,
        message: `Cannot exceed ${config.maxConsecutive} consecutive days`,
      };
    }
    return { valid: true };
  };

  const value = {
    leaveRequests,
    userLeaveBalance,
    isLoading,
    error,
    submitLeaveRequest,
    loadUserLeaveRequests,
    loadAllLeaveRequests,
    updateLeaveStatus,
    loadLeaveBalance,
    getRequestsByStatus,
    getEmployeeRequests,
    getLeaveStatistics,
    calculateLeaveDays,
    validateLeaveRequest,
    clearError: () => setError(null),
    leaveTypeConfigs,
  };

  return (
    <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>
  );
};
