// src/services/api.js - Fixed API Configuration
import axios from 'axios';

// ✅ FIXED: Use environment variable with fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://staff-hive-backend.onrender.com/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to false for CORS
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response.data; // Return data directly
  },
  (error) => {
    console.error('❌ API Error:', error);

    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.message;
      console.error('Server Error:', errorMessage);
      
      // Handle unauthorized errors
      if (error.response.status === 401) {
        console.log('🔒 Unauthorized - Clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/signin') {
          window.location.href = '/signin';
        }
      }
      
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from server:', error.request);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      console.error('❌ Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// ===== AUTH API =====
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  logout: () => apiClient.post('/auth/logout'),
  
  getCurrentUser: () => apiClient.get('/auth/user'),
  
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
  
  changePassword: (passwordData) => apiClient.put('/auth/change-password', passwordData),
  
  getPendingUsers: () => apiClient.get('/auth/pending-users'),
  
  verifyUser: (userId, action, reason = '') => 
    apiClient.post(`/auth/verify-user/${userId}`, { action, reason }),
};

// ===== EMPLOYEE API =====
export const employeeAPI = {
  getAll: () => apiClient.get('/employees'),
  
  getById: (id) => apiClient.get(`/employees/${id}`),
  
  create: (employeeData) => apiClient.post('/employees', employeeData),
  
  update: (id, employeeData) => apiClient.put(`/employees/${id}`, employeeData),
  
  delete: (id) => apiClient.delete(`/employees/${id}`),
  
  getStats: () => apiClient.get('/employees/stats'),
};

// ===== COMPANY API =====
export const companyAPI = {
  getProfile: () => apiClient.get('/companies/profile'),
  
  updateProfile: (companyData) => apiClient.put('/companies/profile', companyData),
  
  getStats: () => apiClient.get('/companies/stats'),
};

// ===== APPLICANT API =====
export const applicantAPI = {
  getAll: () => apiClient.get('/applicants'),
  
  getById: (id) => apiClient.get(`/applicants/${id}`),
  
  create: (applicantData) => apiClient.post('/applicants', applicantData),
  
  update: (id, applicantData) => apiClient.put(`/applicants/${id}`, applicantData),
  
  updateStatus: (id, status) => apiClient.patch(`/applicants/${id}/status`, { status }),
  
  delete: (id) => apiClient.delete(`/applicants/${id}`),
};

// ===== PAYROLL API =====
export const payrollAPI = {
  getAll: () => apiClient.get('/payroll'),
  
  getById: (id) => apiClient.get(`/payroll/${id}`),
  
  create: (payrollData) => apiClient.post('/payroll', payrollData),
  
  update: (id, payrollData) => apiClient.put(`/payroll/${id}`, payrollData),
  
  delete: (id) => apiClient.delete(`/payroll/${id}`),
  
  getStats: () => apiClient.get('/payroll/stats'),
};

// ===== JOB API =====
export const jobAPI = {
  getAll: () => apiClient.get('/jobs'),
  
  getById: (id) => apiClient.get(`/jobs/${id}`),
  
  create: (jobData) => apiClient.post('/jobs', jobData),
  
  update: (id, jobData) => apiClient.put(`/jobs/${id}`, jobData),
  
  delete: (id) => apiClient.delete(`/jobs/${id}`),
  
  updateStatus: (id, status) => apiClient.patch(`/jobs/${id}/status`, { status }),
};

// ===== ATTENDANCE API =====
export const attendanceAPI = {
  getAll: () => apiClient.get('/attendance'),
  
  getById: (id) => apiClient.get(`/attendance/${id}`),
  
  create: (attendanceData) => apiClient.post('/attendance', attendanceData),
  
  update: (id, attendanceData) => apiClient.put(`/attendance/${id}`, attendanceData),
  
  delete: (id) => apiClient.delete(`/attendance/${id}`),
  
  getStats: () => apiClient.get('/attendance/stats'),
};

// ===== LEAVE API =====
export const leaveAPI = {
  getAll: () => apiClient.get('/leave'),
  
  getById: (id) => apiClient.get(`/leave/${id}`),
  
  create: (leaveData) => apiClient.post('/leave', leaveData),
  
  update: (id, leaveData) => apiClient.put(`/leave/${id}`, leaveData),
  
  updateStatus: (id, status, reason = '') => 
    apiClient.patch(`/leave/${id}/status`, { status, reason }),
  
  delete: (id) => apiClient.delete(`/leave/${id}`),
  
  getStats: () => apiClient.get('/leave/stats'),
};

// ===== EVENT API =====
export const eventAPI = {
  getAll: () => apiClient.get('/events'),
  
  getById: (id) => apiClient.get(`/events/${id}`),
  
  create: (eventData) => apiClient.post('/events', eventData),
  
  update: (id, eventData) => apiClient.put(`/events/${id}`, eventData),
  
  delete: (id) => apiClient.delete(`/events/${id}`),
};

// ===== NOTIFICATION API =====
export const notificationAPI = {
  getAll: () => apiClient.get('/notifications'),
  
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
};

// Default export
export default apiClient;