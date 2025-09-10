// services/apiService.js (Frontend)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        return result.data || result; // Handle both wrapped and unwrapped responses
      }
      
      return await response.text();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection and try again');
      }
      throw error;
    }
  }

  // Authentication API calls
  async login(credentials) {
    return this.apiCall('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  async register(userData) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  async verifyToken() {
    return this.apiCall('/auth/verify');
  }

  // Employee API calls
  async getEmployees() {
    return this.apiCall('/employees');
  }

  async getEmployee(id) {
    return this.apiCall(`/employees/${id}`);
  }

  async addEmployee(employeeData) {
    return this.apiCall('/employees', {
      method: 'POST',
      body: employeeData
    });
  }

  async updateEmployee(id, updates) {
    return this.apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteEmployee(id) {
    return this.apiCall(`/employees/${id}`, {
      method: 'DELETE'
    });
  }

  // Company API calls
  async getCompanies() {
    return this.apiCall('/companies');
  }

  async addCompany(companyData) {
    return this.apiCall('/companies', {
      method: 'POST',
      body: companyData
    });
  }

  async updateCompany(id, updates) {
    return this.apiCall(`/companies/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteCompany(id) {
    return this.apiCall(`/companies/${id}`, {
      method: 'DELETE'
    });
  }

  // Applicant API calls
  async getApplicants(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/applicants?${queryParams}` : '/applicants';
    return this.apiCall(endpoint);
  }

  async addApplicant(applicantData) {
    return this.apiCall('/applicants', {
      method: 'POST',
      body: applicantData
    });
  }

  async updateApplicantStage(id, stage) {
    return this.apiCall(`/applicants/${id}/stage`, {
      method: 'PATCH',
      body: { stage }
    });
  }

  // Payroll API calls
  async getPayroll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/payroll?${queryParams}` : '/payroll';
    return this.apiCall(endpoint);
  }

  async addPayrollRecord(payrollData) {
    return this.apiCall('/payroll', {
      method: 'POST',
      body: payrollData
    });
  }

  async generatePayroll(employeeIds) {
    return this.apiCall('/payroll/generate', {
      method: 'POST',
      body: { employeeIds }
    });
  }

  async updatePayrollRecord(id, updates) {
    return this.apiCall(`/payroll/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deletePayrollRecord(id) {
    return this.apiCall(`/payroll/${id}`, {
      method: 'DELETE'
    });
  }

  // Job API calls
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/jobs?${queryParams}` : '/jobs';
    return this.apiCall(endpoint);
  }

  async addJob(jobData) {
    return this.apiCall('/jobs', {
      method: 'POST',
      body: jobData
    });
  }

  async updateJob(id, updates) {
    return this.apiCall(`/jobs/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteJob(id) {
    return this.apiCall(`/jobs/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics API call
  async getAnalytics() {
    return this.apiCall('/analytics');
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// contexts/DataContext.jsx (Updated for MongoDB)
import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user session and load data
  useEffect(() => {
    const initializeUserSession = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');
        
        if (token && storedUser) {
          try {
            // Verify token is still valid
            await apiService.verifyToken();
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            await loadUserData();
          } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            apiService.clearAuthData();
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing user session:', error);
        setError('Failed to initialize user session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserSession();
  }, []);

  // Load all user data from API
  const loadUserData = async () => {
    if (!apiService.isAuthenticated()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const [
        employeesResult, 
        companiesResult, 
        applicantsResult, 
        payrollResult, 
        jobsResult,
        analyticsResult
      ] = await Promise.allSettled([
        apiService.getEmployees(),
        apiService.getCompanies(),
        apiService.getApplicants(),
        apiService.getPayroll(),
        apiService.getJobs(),
        apiService.getAnalytics()
      ]);

      // Handle successful responses
      if (employeesResult.status === 'fulfilled') {
        setEmployees(employeesResult.value || []);
      }
      if (companiesResult.status === 'fulfilled') {
        setCompanies(companiesResult.value || []);
      }
      if (applicantsResult.status === 'fulfilled') {
        setApplicants(applicantsResult.value || []);
      }
      if (payrollResult.status === 'fulfilled') {
        setPayroll(payrollResult.value || []);
      }
      if (jobsResult.status === 'fulfilled') {
        setJobs(jobsResult.value || []);
      }
      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value || null);
      }

      // Log any failures for debugging
      const results = [employeesResult, companiesResult, applicantsResult, payrollResult, jobsResult, analyticsResult];
      const dataTypes = ['employees', 'companies', 'applicants', 'payroll', 'jobs', 'analytics'];
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to load ${dataTypes[index]}:`, result.reason);
        }
      });
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication functions
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      const { user, token } = response;
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
      await loadUserData();
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      const { user, token } = response;
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
      await loadUserData();
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    apiService.clearAuthData();
    
    // Clear all data when logging out
    setEmployees([]);
    setCompanies([]);
    setApplicants([]);
    setPayroll([]);
    setJobs([]);
    setAnalytics(null);
  };

  // Employee CRUD operations (with error handling)
  const addEmployee = async (employeeData) => {
    try {
      const newEmployee = await apiService.addEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      return { success: true, employee: newEmployee };
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, error: error.message };
    }
  };

  const updateEmployee = async (id, updates) => {
    try {
      const updatedEmployee = await apiService.updateEmployee(id, updates);
      setEmployees(prev => 
        prev.map(emp => emp._id === id || emp.id === id ? updatedEmployee : emp)
      );
      return { success: true, employee: updatedEmployee };
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await apiService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp._id !== id && emp.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting employee:', error);
      return { success: false, error: error.message };
    }
  };

  // Company CRUD operations
  const addCompany = async (companyData) => {
    try {
      const newCompany = await apiService.addCompany(companyData);
      setCompanies(prev => [...prev, newCompany]);
      return { success: true, company: newCompany };
    } catch (error) {
      console.error('Error adding company:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCompany = async (id, updates) => {
    try {
      const updatedCompany = await apiService.updateCompany(id, updates);
      setCompanies(prev => 
        prev.map(comp => comp._id === id || comp.id === id ? updatedCompany : comp)
      );
      return { success: true, company: updatedCompany };
    } catch (error) {
      console.error('Error updating company:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteCompany = async (id) => {
    try {
      await apiService.deleteCompany(id);
      setCompanies(prev => prev.filter(comp => comp._id !== id && comp.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting company:', error);
      return { success: false, error: error.message };
    }
  };

  // Applicant operations
  const addApplicant = async (applicantData) => {
    try {
      const newApplicant = await apiService.addApplicant(applicantData);
      setApplicants(prev => [...prev, newApplicant]);
      return { success: true, applicant: newApplicant };
    } catch (error) {
      console.error('Error adding applicant:', error);
      return { success: false, error: error.message };
    }
  };

  const updateApplicantStage = async (applicantId, newStage) => {
    try {
      const updatedApplicant = await apiService.updateApplicantStage(applicantId, newStage);
      setApplicants(prev => 
        prev.map(app => app._id === applicantId || app.id === applicantId ? updatedApplicant : app)
      );

      // If hired, refresh employees data to include the new hire
      if (newStage === 'hired') {
        const employeesData = await apiService.getEmployees();
        setEmployees(employeesData || []);
      }
      
      return { success: true, applicant: updatedApplicant };
    } catch (error) {
      console.error('Error updating applicant stage:', error);
      return { success: false, error: error.message };
    }
  };

  // Payroll operations
  const addPayrollRecord = async (payrollData) => {
    try {
      const newRecord = await apiService.addPayrollRecord(payrollData);
      setPayroll(prev => [...prev, newRecord]);
      return { success: true, record: newRecord };
    } catch (error) {
      console.error('Error adding payroll record:', error);
      return { success: false, error: error.message };
    }
  };

  const generatePayrollForEmployees = async (employeeIds) => {
    try {
      const generatedRecords = await apiService.generatePayroll(employeeIds);
      setPayroll(prev => [...prev, ...(generatedRecords || [])]);
      
      // Refresh analytics after payroll generation
      try {
        const newAnalytics = await apiService.getAnalytics();
        setAnalytics(newAnalytics);
      } catch (analyticsError) {
        console.warn('Failed to refresh analytics:', analyticsError);
      }
      
      return { success: true, records: generatedRecords };
    } catch (error) {
      console.error('Error generating payroll:', error);
      return { success: false, error: error.message };
    }
  };

  // Job operations
  const addJob = async (jobData) => {
    try {
      const newJob = await apiService.addJob(jobData);
      setJobs(prev => [...prev, newJob]);
      return { success: true, job: newJob };
    } catch (error) {
      console.error('Error adding job:', error);
      return { success: false, error: error.message };
    }
  };

  const updateJob = async (id, updates) => {
    try {
      const updatedJob = await apiService.updateJob(id, updates);
      setJobs(prev => 
        prev.map(job => job._id === id || job.id === id ? updatedJob : job)
      );
      return { success: true, job: updatedJob };
    } catch (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteJob = async (id) => {
    try {
      await apiService.deleteJob(id);
      setJobs(prev => prev.filter(job => job._id !== id && job.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }
  };

  // Refresh analytics
  const refreshAnalytics = async () => {
    try {
      const newAnalytics = await apiService.getAnalytics();
      setAnalytics(newAnalytics);
      return { success: true, analytics: newAnalytics };
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    currentUser,
    employees,
    companies,
    applicants,
    payroll,
    jobs,
    analytics,
    isLoading,
    error,
    
    // Auth functions
    login,
    register,
    logout,
    
    // Employee functions
    addEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Company functions
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Applicant functions
    addApplicant,
    updateApplicantStage,
    
    // Payroll functions
    addPayrollRecord,
    generatePayrollForEmployees,
    
    // Job functions
    addJob,
    updateJob,
    deleteJob,
    
    // Utility functions
    loadUserData,
    refreshAnalytics
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};