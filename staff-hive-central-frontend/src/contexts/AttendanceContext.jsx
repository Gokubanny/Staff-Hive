// src/contexts/AttendanceContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AttendanceContext = createContext();

// API base URL - adjust this to match your server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API service functions
const attendanceAPI = {
  // Get today's attendance for current user
  getTodayAttendance: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/today/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
      return null;
    }
  },

  // Check in
  checkIn: async (attendanceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      if (!response.ok) throw new Error('Failed to check in');
      return await response.json();
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  },

  // Check out
  checkOut: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeId })
      });

      if (!response.ok) throw new Error('Failed to check out');
      return await response.json();
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  },

  // Get attendance history
  getAttendanceHistory: async (employeeId, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        employeeId,
        startDate,
        endDate
      });

      const response = await fetch(`${API_BASE_URL}/attendance/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch attendance history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    }
  },

  // Admin: Get all attendance for a specific date
  getAllAttendanceByDate: async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/admin/date/${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch attendance data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  },

  // Admin: Get attendance statistics
  getAttendanceStats: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`${API_BASE_URL}/attendance/admin/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch attendance stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  }
};

// Provider component
export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user location
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            console.warn('Location access denied:', error);
            resolve({ location: 'Location unavailable' });
          }
        );
      } else {
        resolve({ location: 'Geolocation not supported' });
      }
    });
  }, []);

  // Get user IP address
  const getUserIP = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get IP address:', error);
      return 'Unknown';
    }
  }, []);

  // Check in function
  const checkIn = useCallback(async (employeeData) => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const ipAddress = await getUserIP();
      
      const checkInData = {
        ...employeeData,
        date: new Date().toISOString().split('T')[0],
        checkInTime: new Date().toTimeString().slice(0, 5), // HH:MM format
        location: location.location || `${location.latitude}, ${location.longitude}`,
        ipAddress,
        timestamp: new Date().toISOString()
      };

      // Try API first, fallback to localStorage
      try {
        const result = await attendanceAPI.checkIn(checkInData);
        setTodayAttendance(result.data);
        return result;
      } catch (apiError) {
        console.warn('API check-in failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const attendanceKey = `attendance_${checkInData.date}`;
        let records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
        
        const existingIndex = records.findIndex(record => record.employeeId === employeeData.employeeId);
        
        if (existingIndex >= 0) {
          records[existingIndex] = { ...records[existingIndex], ...checkInData };
        } else {
          records.push({ ...checkInData, id: Date.now() });
        }
        
        localStorage.setItem(attendanceKey, JSON.stringify(records));
        setTodayAttendance(checkInData);
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { detail: records }));
        
        return { success: true, data: checkInData };
      }
    } catch (error) {
      setError('Failed to check in. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, getUserIP]);

  // Check out function
  const checkOut = useCallback(async (employeeId) => {
    setIsLoading(true);
    setError(null);

    try {
      const checkOutTime = new Date().toTimeString().slice(0, 5); // HH:MM format
      
      // Try API first
      try {
        const result = await attendanceAPI.checkOut(employeeId);
        setTodayAttendance(result.data);
        return result;
      } catch (apiError) {
        console.warn('API check-out failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const date = new Date().toISOString().split('T')[0];
        const attendanceKey = `attendance_${date}`;
        let records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
        
        const existingIndex = records.findIndex(record => record.employeeId === employeeId);
        
        if (existingIndex >= 0) {
          records[existingIndex] = {
            ...records[existingIndex],
            checkOutTime,
            status: 'completed',
            updatedAt: new Date().toISOString()
          };
          
          localStorage.setItem(attendanceKey, JSON.stringify(records));
          setTodayAttendance(records[existingIndex]);
          
          // Notify other components
          window.dispatchEvent(new CustomEvent('attendanceUpdated', { detail: records }));
          
          return { success: true, data: records[existingIndex] };
        } else {
          throw new Error('No check-in record found');
        }
      }
    } catch (error) {
      setError('Failed to check out. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load today's attendance
  const loadTodayAttendance = useCallback(async (employeeId) => {
    if (!employeeId) return;

    setIsLoading(true);
    try {
      // Try API first
      const apiData = await attendanceAPI.getTodayAttendance(employeeId);
      
      if (apiData && apiData.success) {
        setTodayAttendance(apiData.data);
        return;
      }
      
      // Fallback to localStorage
      const date = new Date().toISOString().split('T')[0];
      const attendanceKey = `attendance_${date}`;
      const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
      const userRecord = records.find(record => record.employeeId === employeeId);
      
      setTodayAttendance(userRecord || null);
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
      setError('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get attendance for date range
  const getAttendanceForDateRange = useCallback(async (employeeId, startDate, endDate) => {
    setIsLoading(true);
    try {
      const data = await attendanceAPI.getAttendanceHistory(employeeId, startDate, endDate);
      return data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin functions
  const getAllAttendanceByDate = useCallback(async (date) => {
    setIsLoading(true);
    try {
      const data = await attendanceAPI.getAllAttendanceByDate(date);
      if (data && data.success) {
        setAttendanceRecords(data.data);
        return data.data;
      }
      
      // Fallback to localStorage
      const attendanceKey = `attendance_${date}`;
      const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
      setAttendanceRecords(records);
      return records;
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAttendanceStats = useCallback(async (startDate, endDate) => {
    try {
      return await attendanceAPI.getAttendanceStats(startDate, endDate);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  }, []);

  // Calculate duration helper
  const calculateDuration = useCallback((checkIn, checkOut) => {
    if (!checkIn || checkIn === '--') return '--';
    if (!checkOut || checkOut === '--') return 'Working...';
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const inTime = new Date(`${today} ${checkIn}`);
      const outTime = new Date(`${today} ${checkOut}`);
      const diff = outTime - inTime;
      
      if (diff < 0) return '--';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return '--';
    }
  }, []);

  const value = {
    // State
    attendanceRecords,
    todayAttendance,
    isLoading,
    error,

    // Functions
    checkIn,
    checkOut,
    loadTodayAttendance,
    getAttendanceForDateRange,
    getAllAttendanceByDate,
    getAttendanceStats,
    calculateDuration,

    // Utilities
    clearError: () => setError(null)
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

// Custom hook to use the context
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};