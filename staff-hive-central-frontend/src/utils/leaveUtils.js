// src/utils/leaveUtils.js

// Save leave requests to localStorage
export const saveLeaveRequests = (requests) => {
  try {
    localStorage.setItem('leaveRequests', JSON.stringify(requests));
    window.dispatchEvent(new Event('storage')); // Notify other tabs
    return true;
  } catch (error) {
    console.error('Error saving leave requests:', error);
    return false;
  }
};

// Load leave requests from localStorage
export const loadLeaveRequests = () => {
  setIsLoading(true);
  try {
    const savedRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    
    // Filter requests for the current user only
    const userRequests = savedRequests.filter(request => 
      request.employeeId === user?.id || request.email === user?.email
    );
    
    setLeaveRequests(userRequests);
  } catch (error) {
    console.error('Error loading leave requests:', error);
    toast.error('Failed to load leave history');
  } finally {
    setIsLoading(false);
  }
};

// Create a new leave request with consistent structure
export const createLeaveRequest = (request, user) => {
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    employeeId: user?.id || request.employeeId,
    employeeName: user?.name || request.employeeName,
    email: user?.email || request.email,
    department: user?.department || request.department || 'Unknown',
    leaveType: request.leaveType || 'Annual Leave',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    days: request.days || days,
    reason: request.reason || '',
    emergencyContact: request.emergencyContact || '',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null
  };
};

// Update the status of a leave request in localStorage
export const updateLeaveRequestStatus = (requestId, newStatus, rejectionReason = null) => {
  try {
    const leaveRequests = loadLeaveRequests();

    const updatedRequests = leaveRequests.map((request) => {
      if (request.id === requestId) {
        return {
          ...request,
          status: newStatus,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : null,
          approvedAt: newStatus === 'approved' ? new Date().toISOString() : null,
          rejectedAt: newStatus === 'rejected' ? new Date().toISOString() : null,
        };
      }
      return request;
    });

    saveLeaveRequests(updatedRequests);
    return true;
  } catch (error) {
    console.error('Error updating leave request status:', error);
    return false;
  }
};

// Calculate days between two dates
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

// Format date as "Jan 1, 2023"
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date and time as "Jan 1, 2023, 10:30 AM"
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};