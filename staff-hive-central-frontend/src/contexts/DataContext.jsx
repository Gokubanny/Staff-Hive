// src/contexts/DataContext.js
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  authAPI, 
  employeeAPI, 
  companyAPI, 
  applicantAPI, 
  jobAPI, 
  payrollAPI,
  analyticsAPI 
} from '../services/api';

const DataContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
  SET_EMPLOYEES: 'SET_EMPLOYEES',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  SET_COMPANIES: 'SET_COMPANIES',
  ADD_COMPANY: 'ADD_COMPANY',
  UPDATE_COMPANY: 'UPDATE_COMPANY',
  DELETE_COMPANY: 'DELETE_COMPANY',
  SET_APPLICANTS: 'SET_APPLICANTS',
  ADD_APPLICANT: 'ADD_APPLICANT',
  UPDATE_APPLICANT: 'UPDATE_APPLICANT',
  DELETE_APPLICANT: 'DELETE_APPLICANT',
  SET_JOBS: 'SET_JOBS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  SET_PAYROLL: 'SET_PAYROLL',
  ADD_PAYROLL: 'ADD_PAYROLL',
  UPDATE_PAYROLL: 'UPDATE_PAYROLL',
  DELETE_PAYROLL: 'DELETE_PAYROLL',
  SET_ANALYTICS: 'SET_ANALYTICS',
};

// Initial state
const initialState = {
  user: null,
  employees: [],
  companies: [],
  applicants: [],
  jobs: [],
  payroll: [],
  analytics: null,
  loading: false,
  error: null,
};

// Reducer
const dataReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.SET_EMPLOYEES:
      return { ...state, employees: action.payload };
    case ACTIONS.ADD_EMPLOYEE:
      return { ...state, employees: [...state.employees, action.payload] };
    case ACTIONS.UPDATE_EMPLOYEE:
      return { 
        ...state, 
        employees: state.employees.map(emp => emp._id === action.payload._id ? action.payload : emp) 
      };
    case ACTIONS.DELETE_EMPLOYEE:
      return { 
        ...state, 
        employees: state.employees.filter(emp => emp._id !== action.payload) 
      };
    case ACTIONS.SET_COMPANIES:
      return { ...state, companies: action.payload };
    case ACTIONS.ADD_COMPANY:
      return { ...state, companies: [...state.companies, action.payload] };
    case ACTIONS.UPDATE_COMPANY:
      return { 
        ...state, 
        companies: state.companies.map(comp => comp._id === action.payload._id ? action.payload : comp) 
      };
    case ACTIONS.DELETE_COMPANY:
      return { 
        ...state, 
        companies: state.companies.filter(comp => comp._id !== action.payload) 
      };
    case ACTIONS.SET_APPLICANTS:
      return { ...state, applicants: action.payload };
    case ACTIONS.ADD_APPLICANT:
      return { ...state, applicants: [...state.applicants, action.payload] };
    case ACTIONS.UPDATE_APPLICANT:
      return { 
        ...state, 
        applicants: state.applicants.map(app => app._id === action.payload._id ? action.payload : app) 
      };
    case ACTIONS.DELETE_APPLICANT:
      return { 
        ...state, 
        applicants: state.applicants.filter(app => app._id !== action.payload) 
      };
    case ACTIONS.SET_JOBS:
      return { ...state, jobs: action.payload };
    case ACTIONS.ADD_JOB:
      return { ...state, jobs: [...state.jobs, action.payload] };
    case ACTIONS.UPDATE_JOB:
      return { 
        ...state, 
        jobs: state.jobs.map(job => job._id === action.payload._id ? action.payload : job) 
      };
    case ACTIONS.DELETE_JOB:
      return { 
        ...state, 
        jobs: state.jobs.filter(job => job._id !== action.payload) 
      };
    case ACTIONS.SET_PAYROLL:
      return { ...state, payroll: action.payload };
    case ACTIONS.ADD_PAYROLL:
      return { ...state, payroll: [...state.payroll, action.payload] };
    case ACTIONS.UPDATE_PAYROLL:
      return { 
        ...state, 
        payroll: state.payroll.map(pay => pay._id === action.payload._id ? action.payload : pay) 
      };
    case ACTIONS.DELETE_PAYROLL:
      return { 
        ...state, 
        payroll: state.payroll.filter(pay => pay._id !== action.payload) 
      };
    case ACTIONS.SET_ANALYTICS:
      return { ...state, analytics: action.payload };
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Generic API handler
  const handleApiCall = async (apiCall, onSuccess, onError) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });

      const response = await apiCall();
      if (onSuccess) onSuccess(response || {});
      return response;
    } catch (error) {
      console.error('API Error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error?.message || 'Unknown API error' });
      if (onError) onError(error);
      return null;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Employee operations - FIXED: Proper response handling
  const fetchEmployees = useCallback(() =>
    handleApiCall(
      () => employeeAPI.getAll(),
      (response) => {
        console.log('🔍 Employees API Response:', response); // Debug log
        
        // Handle different response structures from backend
        let employeesData = [];
        
        if (Array.isArray(response)) {
          // If response is directly an array
          employeesData = response;
        } else if (Array.isArray(response?.data)) {
          // If response has data array
          employeesData = response.data;
        } else if (Array.isArray(response?.data?.employees)) {
          // If response has data.employees array
          employeesData = response.data.employees;
        } else if (response?.data && typeof response.data === 'object') {
          // If response.data is an object, convert to array
          employeesData = Object.values(response.data);
        } else {
          console.warn('⚠️ Unexpected employees response structure:', response);
          employeesData = [];
        }

        console.log('✅ Processed employees data:', employeesData);
        
        // Ensure all employees have proper structure
        const processedEmployees = employeesData.map(emp => {
          // Create proper name from firstName + lastName if name doesn't exist
          const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown Employee';
          
          return {
            _id: emp._id || emp.id,
            name: name,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            position: emp.position || emp.jobTitle || 'No Position',
            salary: emp.salary || emp.baseSalary || emp.monthlySalary || 0,
            employeeId: emp.employeeId || emp.empId,
            department: emp.department,
            status: emp.status,
            ...emp // Include all other properties
          };
        });

        dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: processedEmployees });
      },
      (error) => {
        console.error('❌ Failed to fetch employees:', error);
        dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: [] });
      }
    ), []);

  const addEmployee = useCallback((data) =>
    handleApiCall(() => employeeAPI.create(data), (res) => {
      const newEmployee = res?.data || res;
      dispatch({ type: ACTIONS.ADD_EMPLOYEE, payload: newEmployee });
    }), []);

  const updateEmployee = useCallback((id, data) =>
    handleApiCall(() => employeeAPI.update(id, data), (res) => {
      const updatedEmployee = res?.data || res;
      dispatch({ type: ACTIONS.UPDATE_EMPLOYEE, payload: updatedEmployee });
    }), []);

  const deleteEmployee = useCallback((id) =>
    handleApiCall(() => employeeAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_EMPLOYEE, payload: id })), []);

  // Company operations
  const fetchCompanies = useCallback(() =>
    handleApiCall(() => companyAPI.getAll(), (res) => {
      const companiesData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.companies || [];
      dispatch({ type: ACTIONS.SET_COMPANIES, payload: companiesData });
    }), []);

  const addCompany = useCallback((data) =>
    handleApiCall(() => companyAPI.create(data), (res) => {
      const newCompany = res?.data || res;
      dispatch({ type: ACTIONS.ADD_COMPANY, payload: newCompany });
    }), []);

  const updateCompany = useCallback((id, data) =>
    handleApiCall(() => companyAPI.update(id, data), (res) => {
      const updatedCompany = res?.data || res;
      dispatch({ type: ACTIONS.UPDATE_COMPANY, payload: updatedCompany });
    }), []);

  const deleteCompany = useCallback((id) =>
    handleApiCall(() => companyAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_COMPANY, payload: id })), []);

  // Applicant operations
  const fetchApplicants = useCallback(() =>
    handleApiCall(() => applicantAPI.getAll(), (res) => {
      const applicantsData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.applicants || [];
      dispatch({ type: ACTIONS.SET_APPLICANTS, payload: applicantsData });
    }), []);

  const addApplicant = useCallback((data) =>
    handleApiCall(() => applicantAPI.create(data), (res) => {
      const newApplicant = res?.data || res;
      dispatch({ type: ACTIONS.ADD_APPLICANT, payload: newApplicant });
    }), []);

  const updateApplicant = useCallback((id, data) =>
    handleApiCall(() => applicantAPI.update(id, data), (res) => {
      const updatedApplicant = res?.data || res;
      dispatch({ type: ACTIONS.UPDATE_APPLICANT, payload: updatedApplicant });
    }), []);

  const updateApplicantStage = useCallback((id, stage) =>
    handleApiCall(() => applicantAPI.updateStage(id, stage), (res) => {
      const updatedApplicant = res?.data || res;
      dispatch({ type: ACTIONS.UPDATE_APPLICANT, payload: updatedApplicant });
    }), []);

  const deleteApplicant = useCallback((id) =>
    handleApiCall(() => applicantAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_APPLICANT, payload: id })), []);

  // Job operations
  const fetchJobs = useCallback(() =>
    handleApiCall(() => jobAPI.getAll(), (res) => {
      const jobsData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.jobs || [];
      dispatch({ type: ACTIONS.SET_JOBS, payload: jobsData });
    }), []);

  const addJob = useCallback((data) =>
    handleApiCall(() => jobAPI.create(data), (res) => {
      const newJob = res?.data || res;
      dispatch({ type: ACTIONS.ADD_JOB, payload: newJob });
    }), []);

  const updateJob = useCallback((id, data) =>
    handleApiCall(() => jobAPI.update(id, data), (res) => {
      const updatedJob = res?.data || res;
      dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob });
    }), []);

  const deleteJob = useCallback((id) =>
    handleApiCall(() => jobAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_JOB, payload: id })), []);

  // Payroll operations
  const fetchPayroll = useCallback(() =>
    handleApiCall(() => payrollAPI.getAll(), (res) => {
      const payrollData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.payroll || [];
      dispatch({ type: ACTIONS.SET_PAYROLL, payload: payrollData });
    }), []);

  const addPayrollRecord = useCallback((data) =>
    handleApiCall(() => payrollAPI.create(data), (res) => {
      const newPayroll = res?.data || res;
      dispatch({ type: ACTIONS.ADD_PAYROLL, payload: newPayroll });
    }), []);

  const generatePayroll = useCallback((employeeIds, period) =>
    handleApiCall(() => payrollAPI.generate(employeeIds, period), () => fetchPayroll()), [fetchPayroll]);

  // Analytics
  const fetchAnalytics = useCallback(() =>
    handleApiCall(() => analyticsAPI.getDashboard(), (res) => {
      const analyticsData = res?.data || res;
      dispatch({ type: ACTIONS.SET_ANALYTICS, payload: analyticsData });
    }), []);

  // Load initial data when user exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && state.user) {
      console.log('🔄 Loading initial data for user:', state.user.name);
      
      const loadData = async () => {
        try {
          await Promise.allSettled([
            fetchEmployees(),
            fetchCompanies(),
            fetchApplicants(),
            fetchJobs(),
            fetchPayroll(),
            fetchAnalytics()
          ]);
          console.log('✅ All initial data loaded successfully');
        } catch (error) {
          console.error('❌ Error loading initial data:', error);
        }
      };

      loadData();
    }
  }, [state.user, fetchEmployees, fetchCompanies, fetchApplicants, fetchJobs, fetchPayroll, fetchAnalytics]);

  return (
    <DataContext.Provider
      value={{
        ...state,
        fetchEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        fetchCompanies,
        addCompany,
        updateCompany,
        deleteCompany,
        fetchApplicants,
        addApplicant,
        updateApplicant,
        updateApplicantStage,
        deleteApplicant,
        fetchJobs,
        addJob,
        updateJob,
        deleteJob,
        fetchPayroll,
        addPayrollRecord,
        generatePayroll,
        fetchAnalytics,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};