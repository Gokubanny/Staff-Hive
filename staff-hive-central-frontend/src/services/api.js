// src/services/api.js - CORRECTED API endpoints
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }

      // Return the actual error message from backend
      return Promise.reject(new Error(data.message || data.error || 'An error occurred'));
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
    }
  }
);

// ---------------------- API ENDPOINTS ----------------------

// Authentication API - CORRECTED ENDPOINTS
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/user'), // ✅ CHANGED FROM '/auth/me' TO '/auth/user'
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
  getPendingUsers: () => api.get('/auth/pending-users'),
  verifyUser: (userId, data) => api.post(`/auth/verify-user/${userId}`, data),
};

// Employee API
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
  getByUserId: (userId) => api.get(`/employees/user/${userId}`),
  updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }),
};

// Company API
export const companyAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (companyData) => api.post('/companies', companyData),
  update: (id, companyData) => api.put(`/companies/${id}`, companyData),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Job API
export const jobAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (jobData) => api.post('/jobs', jobData),
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Applicant API
export const applicantAPI = {
  getAll: (params) => api.get('/applicants', { params }),
  getById: (id) => api.get(`/applicants/${id}`),
  create: (applicantData) => api.post('/applicants', applicantData),
  update: (id, applicantData) => api.put(`/applicants/${id}`, applicantData),
  updateStage: (id, stage) => api.patch(`/applicants/${id}/stage`, { stage }),
  delete: (id) => api.delete(`/applicants/${id}`),
};

// Payroll API
export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  create: (payrollData) => api.post('/payroll', payrollData),
  generate: (employeeIds, period) => api.post('/payroll/generate', { employeeIds, period }),
  update: (id, payrollData) => api.put(`/payroll/${id}`, payrollData),
  delete: (id) => api.delete(`/payroll/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getEmployeeAnalytics: () => api.get('/analytics/employees'),
  getCompanyAnalytics: () => api.get('/analytics/companies'),
  getHiringAnalytics: () => api.get('/analytics/hiring'),
};

// Notifications API - ADDED MISSING EXPORT
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  create: (notificationData) => api.post('/notifications', notificationData),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Events API - ADDED MISSING EXPORT
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
};

export default api;