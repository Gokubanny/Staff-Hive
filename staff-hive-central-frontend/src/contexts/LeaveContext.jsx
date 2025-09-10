// src/contexts/LeaveContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LeaveContext = createContext();

// API base URL - adjust this to match your server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API service functions
const leaveAPI = {
  // Submit leave request
  submitLeaveRequest: async (requestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  },

  // Get user's leave requests
  getUserLeaveRequests: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/user/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch leave requests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user leave requests:', error);
      return { success: false, data: [] };
    }
  },

  // Admin: Get all leave requests
  getAllLeaveRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/leave/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch leave requests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all leave requests:', error);
      return { success: false, data: [] };
    }
  },

  // Admin: Update leave request status
  updateLeaveStatus: async (requestId, status, reason = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/admin/update-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, status, reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update leave status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw error;
    }
  },

  // Get leave balance
  getLeaveBalance: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/balance/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch leave balance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      return null;
    }
  },

  // Get leave statistics
  getLeaveStats: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`${API_BASE_URL}/leave/admin/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch leave statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      return null;
    }
  }
};

// Leave type configurations
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
    bgColor: "bg-blue-50"
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
    bgColor: "bg-red-50"
  },
  personal: {
    name: "Personal Leave",
    description: "Personal and family matters",
    yearlyAllocation: 7,
    carryOverLimit: 0,
    accrualRate: 0.58,
    canCarryOver: false,
    minNotice: 3,
    maxConsecutive: 5,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50"
  },
  maternity: {
    name: "Maternity Leave",
    description: "Leave for childbirth and bonding",
    yearlyAllocation: 120,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    minNotice: 30,
    maxConsecutive: 120,
    color: "bg-pink-500",
    textColor: "text-pink-700",
    bgColor: "bg-pink-50"
  },
  paternity: {
    name: "Paternity Leave",
    description: "Leave for new fathers",
    yearlyAllocation: 14,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    minNotice: 30,
    maxConsecutive: 14,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50"
  },
  bereavement: {
    name: "Bereavement Leave",
    description: "Leave for family loss",
    yearlyAllocation: 5,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    minNotice: 0,
    maxConsecutive: 5,
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50"
  },
  emergency: {
    name: "Emergency Leave",
    description: "Unforeseen circumstances",
    yearlyAllocation: 3,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    minNotice: 0,
    maxConsecutive: 3,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50"
  }
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};

export const LeaveProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userLeaveBalance, setUserLeaveBalance] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to generate unique request ID
  const generateRequestId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `LR_${timestamp}_${random}`;
  }, []);

  // Calculate leave days between two dates
  const calculateLeaveDays = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }, []);

  // Validate leave request
  const validateLeaveRequest = useCallback((requestData) => {
    const errors = [];
    
    // Check required fields
    if (!requestData.leaveType) errors.push('Leave type is required');
    if (!requestData.startDate) errors.push('Start date is required');
    if (!requestData.endDate) errors.push('End date is required');
    if (!requestData.reason) errors.push('Reason is required');
    
    // Check date validity
    if (requestData.startDate && requestData.endDate) {
      const startDate = new Date(requestData.startDate);
      const endDate = new Date(requestData.endDate);
      const today = new Date();
      
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }
      
      if (startDate < today.setHours(0, 0, 0, 0)) {
        errors.push('Start date cannot be in the past');
      }
    }
    
    // Check leave type specific validations
    const leaveType = leaveTypeConfigs[requestData.leaveType];
    if (leaveType) {
      const days = calculateLeaveDays(requestData.startDate, requestData.endDate);
      
      // Check maximum consecutive days
      if (days > leaveType.maxConsecutive) {
        errors.push(`Maximum ${leaveType.maxConsecutive} consecutive days allowed for ${leaveType.name}`);
      }
      
      // Check minimum notice
      if (requestData.startDate) {
        const startDate = new Date(requestData.startDate);
        const today = new Date();
        const daysDiff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff < leaveType.minNotice) {
          errors.push(`${leaveType.name} requires ${leaveType.minNotice} days advance notice`);
        }
      }
      
      // Check leave balance
      const balance = userLeaveBalance[requestData.leaveType] || 0;
      if (days > balance) {
        errors.push(`Insufficient leave balance. Available: ${balance} days, Requested: ${days} days`);
      }
    }
    
    return errors;
  }, [calculateLeaveDays, userLeaveBalance]);

  // Submit leave request
  const submitLeaveRequest = useCallback(async (requestData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate request
      const validationErrors = validateLeaveRequest(requestData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }

      const requestId = generateRequestId();
      const days = calculateLeaveDays(requestData.startDate, requestData.endDate);
      
      const newRequest = {
        ...requestData,
        requestId,
        days,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        appliedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString()
      };

      // Try API first
      try {
        const result = await leaveAPI.submitLeaveRequest(newRequest);
        
        if (result.success) {
          setLeaveRequests(prev => [result.data, ...prev]);
          return { success: true, data: result.data, requestId };
        } else {
          throw new Error(result.message || 'Failed to submit leave request');
        }
      } catch (apiError) {
        console.warn('API submission failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        requests.unshift(newRequest);
        localStorage.setItem('leaveRequests', JSON.stringify(requests));
        
        setLeaveRequests(prev => [newRequest, ...prev]);
        
        // Notify admin components
        window.dispatchEvent(new CustomEvent('leaveRequestSubmitted', { 
          detail: { request: newRequest, isNew: true }
        }));
        
        return { success: true, data: newRequest, requestId };
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [validateLeaveRequest, generateRequestId, calculateLeaveDays]);

  // Load user's leave requests
  const loadUserLeaveRequests = useCallback(async (employeeId) => {
    if (!employeeId) return;

    setIsLoading(true);
    try {
      // Try API first
      const apiData = await leaveAPI.getUserLeaveRequests(employeeId);
      
      if (apiData.success) {
        setLeaveRequests(apiData.data);
        return;
      }
      
      // Fallback to localStorage
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      const userRequests = requests.filter(req => req.employeeId === employeeId);
      setLeaveRequests(userRequests);
    } catch (error) {
      console.error('Error loading user leave requests:', error);
      setError('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin: Load all leave requests
  const loadAllLeaveRequests = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      // Try API first
      const apiData = await leaveAPI.getAllLeaveRequests(filters);
      
      if (apiData.success) {
        setLeaveRequests(apiData.data);
        return apiData.data;
      }
      
      // Fallback to localStorage
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      setLeaveRequests(requests);
      return requests;
    } catch (error) {
      console.error('Error loading all leave requests:', error);
      setError('Failed to load leave requests');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin: Update leave request status
  const updateLeaveStatus = useCallback(async (requestId, newStatus, reason = '') => {
    setIsLoading(true);
    setError(null);

    try {
      // Try API first
      try {
        const result = await leaveAPI.updateLeaveStatus(requestId, newStatus, reason);
        
        if (result.success) {
          setLeaveRequests(prev => prev.map(request => 
            request.requestId === requestId || request.id === requestId
              ? { ...request, ...result.data }
              : request
          ));
          
          // Notify user components
          window.dispatchEvent(new CustomEvent('leaveRequestUpdated', {
            detail: result.data
          }));
          
          return result;
        } else {
          throw new Error(result.message || 'Failed to update leave status');
        }
      } catch (apiError) {
        console.warn('API update failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        const updatedRequests = requests.map(request => {
          if (request.requestId === requestId || request.id === requestId) {
            return {
              ...request,
              status: newStatus,
              [`${newStatus}By`]: 'Admin',
              [`${newStatus}Date`]: new Date().toISOString().split('T')[0],
              ...(newStatus === 'rejected' && reason && { rejectionReason: reason }),
              lastUpdated: new Date().toISOString()
            };
          }
          return request;
        });
        
        localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
        
        const updatedRequest = updatedRequests.find(req => 
          req.requestId === requestId || req.id === requestId
        );
        
        setLeaveRequests(prev => prev.map(request => 
          request.requestId === requestId || request.id === requestId
            ? updatedRequest
            : request
        ));
        
        // Notify user components
        window.dispatchEvent(new CustomEvent('leaveRequestUpdated', {
          detail: updatedRequest
        }));
        
        return { success: true, data: updatedRequest };
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load leave balance
  const loadLeaveBalance = useCallback(async (employeeId) => {
    if (!employeeId) return;

    try {
      const apiData = await leaveAPI.getLeaveBalance(employeeId);
      
      if (apiData && apiData.success) {
        setUserLeaveBalance(apiData.data);
        return apiData.data;
      }
      
      // Fallback to mock data or localStorage
      const mockBalance = {
        annual: 18,
        sick: 12,
        personal: 5,
        maternity: 120,
        paternity: 14,
        bereavement: 5,
        emergency: 3
      };
      
      setUserLeaveBalance(mockBalance);
      return mockBalance;
    } catch (error) {
      console.error('Error loading leave balance:', error);
      return null;
    }
  }, []);

  // Get requests by status
  const getRequestsByStatus = useCallback((status) => {
    if (status === 'all') return leaveRequests;
    return leaveRequests.filter(request => request.status === status);
  }, [leaveRequests]);

  // Get requests by employee
  const getEmployeeRequests = useCallback((employeeId) => {
    return leaveRequests.filter(request => 
      request.employeeId === employeeId
    );
  }, [leaveRequests]);

  // Get leave statistics
  const getLeaveStatistics = useCallback(async (startDate, endDate) => {
    try {
      const apiData = await leaveAPI.getLeaveStats(startDate, endDate);
      
      if (apiData && apiData.success) {
        return apiData.data;
      }
      
      // Fallback calculation from current data
      const filteredRequests = leaveRequests.filter(req => {
        const reqDate = new Date(req.submittedAt || req.appliedDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return reqDate >= start && reqDate <= end;
      });
      
      return {
        totalRequests: filteredRequests.length,
        pendingRequests: filteredRequests.filter(req => req.status === 'pending').length,
        approvedRequests: filteredRequests.filter(req => req.status === 'approved').length,
        rejectedRequests: filteredRequests.filter(req => req.status === 'rejected').length,
        totalDays: filteredRequests.reduce((sum, req) => sum + (req.days || 0), 0),
        byLeaveType: filteredRequests.reduce((acc, req) => {
          const type = req.leaveType;
          if (!acc[type]) acc[type] = { count: 0, days: 0 };
          acc[type].count += 1;
          acc[type].days += req.days || 0;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting leave statistics:', error);
      return null;
    }
  }, [leaveRequests]);

  // Listen for real-time updates
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'leaveRequests') {
        const requests = JSON.parse(event.newValue || '[]');
        setLeaveRequests(requests);
      }
    };

    const handleLeaveUpdate = (event) => {
      const updatedRequest = event.detail;
      setLeaveRequests(prev => prev.map(request => 
        (request.requestId === updatedRequest.requestId || request.id === updatedRequest.id)
          ? { ...request, ...updatedRequest }
          : request
      ));
    };

    const handleNewRequest = (event) => {
      const { request, isNew } = event.detail;
      if (isNew) {
        setLeaveRequests(prev => {
          const exists = prev.some(req => 
            req.requestId === request.requestId || req.id === request.id
          );
          return exists ? prev : [request, ...prev];
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('leaveRequestUpdated', handleLeaveUpdate);
    window.addEventListener('leaveRequestSubmitted', handleNewRequest);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leaveRequestUpdated', handleLeaveUpdate);
      window.removeEventListener('leaveRequestSubmitted', handleNewRequest);
    };
  }, []);

  const value = {
    // State
    leaveRequests,
    userLeaveBalance,
    isLoading,
    error,

    // Functions
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

    // Utilities
    clearError: () => setError(null),
    leaveTypeConfigs
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};