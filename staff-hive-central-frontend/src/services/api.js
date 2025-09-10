// services/api.js - Updated API service to match backend
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper with proper error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Fixed: register instead of signup
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Fixed: login instead of signin
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getCurrentUser: () => apiRequest('/auth/me'),
  
  updateProfile: (profileData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  changePassword: (passwordData) => apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
};

// Employee API
export const employeeAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/employees${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/employees/${id}`),
  
  create: (employeeData) => apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }),
  
  update: (id, employeeData) => apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  }),
  
  updateStatus: (id, status) => apiRequest(`/employees/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  delete: (id) => apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  }),
};

// Company API
export const companyAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/companies${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/companies/${id}`),
  
  create: (companyData) => apiRequest('/companies', {
    method: 'POST',
    body: JSON.stringify(companyData),
  }),
  
  update: (id, companyData) => apiRequest(`/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(companyData),
  }),
  
  delete: (id) => apiRequest(`/companies/${id}`, {
    method: 'DELETE',
  }),
};

// Applicant API
export const applicantAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/applicants${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/applicants/${id}`),
  
  create: (applicantData) => apiRequest('/applicants', {
    method: 'POST',
    body: JSON.stringify(applicantData),
  }),
  
  update: (id, applicantData) => apiRequest(`/applicants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(applicantData),
  }),
  
  updateStage: (id, stage) => apiRequest(`/applicants/${id}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  }),
  
  delete: (id) => apiRequest(`/applicants/${id}`, {
    method: 'DELETE',
  }),
};

// Job API
export const jobAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/jobs${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/jobs/${id}`),
  
  create: (jobData) => apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  }),
  
  update: (id, jobData) => apiRequest(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  }),
  
  updateStatus: (id, status) => apiRequest(`/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  delete: (id) => apiRequest(`/jobs/${id}`, {
    method: 'DELETE',
  }),
};

// Payroll API
export const payrollAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/payroll${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/payroll/${id}`),
  
  create: (payrollData) => apiRequest('/payroll', {
    method: 'POST',
    body: JSON.stringify(payrollData),
  }),
  
  generate: (employeeIds, period) => apiRequest('/payroll/generate', {
    method: 'POST',
    body: JSON.stringify({ employeeIds, period }),
  }),
  
  update: (id, payrollData) => apiRequest(`/payroll/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payrollData),
  }),
  
  updateStatus: (id, status) => apiRequest(`/payroll/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  delete: (id) => apiRequest(`/payroll/${id}`, {
    method: 'DELETE',
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiRequest('/analytics'),
};

// Health Check API
export const healthAPI = {
  check: () => apiRequest('/health'),
};