// contexts/DataContext.js - Updated to use backend API
import { createContext, useContext, useReducer, useEffect } from 'react';
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
        employees: state.employees.map(emp =>
          emp._id === action.payload._id ? action.payload : emp
        ),
      };
    
    case ACTIONS.DELETE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.filter(emp => emp._id !== action.payload),
      };
    
    case ACTIONS.SET_COMPANIES:
      return { ...state, companies: action.payload };
    
    case ACTIONS.ADD_COMPANY:
      return { ...state, companies: [...state.companies, action.payload] };
    
    case ACTIONS.UPDATE_COMPANY:
      return {
        ...state,
        companies: state.companies.map(comp =>
          comp._id === action.payload._id ? action.payload : comp
        ),
      };
    
    case ACTIONS.DELETE_COMPANY:
      return {
        ...state,
        companies: state.companies.filter(comp => comp._id !== action.payload),
      };
    
    case ACTIONS.SET_APPLICANTS:
      return { ...state, applicants: action.payload };
    
    case ACTIONS.ADD_APPLICANT:
      return { ...state, applicants: [...state.applicants, action.payload] };
    
    case ACTIONS.UPDATE_APPLICANT:
      return {
        ...state,
        applicants: state.applicants.map(app =>
          app._id === action.payload._id ? action.payload : app
        ),
      };
    
    case ACTIONS.DELETE_APPLICANT:
      return {
        ...state,
        applicants: state.applicants.filter(app => app._id !== action.payload),
      };
    
    case ACTIONS.SET_JOBS:
      return { ...state, jobs: action.payload };
    
    case ACTIONS.ADD_JOB:
      return { ...state, jobs: [...state.jobs, action.payload] };
    
    case ACTIONS.UPDATE_JOB:
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job._id === action.payload._id ? action.payload : job
        ),
      };
    
    case ACTIONS.DELETE_JOB:
      return {
        ...state,
        jobs: state.jobs.filter(job => job._id !== action.payload),
      };
    
    case ACTIONS.SET_PAYROLL:
      return { ...state, payroll: action.payload };
    
    case ACTIONS.ADD_PAYROLL:
      return { ...state, payroll: [...state.payroll, action.payload] };
    
    case ACTIONS.UPDATE_PAYROLL:
      return {
        ...state,
        payroll: state.payroll.map(pay =>
          pay._id === action.payload._id ? action.payload : pay
        ),
      };
    
    case ACTIONS.DELETE_PAYROLL:
      return {
        ...state,
        payroll: state.payroll.filter(pay => pay._id !== action.payload),
      };
    
    case ACTIONS.SET_ANALYTICS:
      return { ...state, analytics: action.payload };
    
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Helper function to handle API calls
  const handleApiCall = async (apiCall, onSuccess, onError) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      
      const response = await apiCall();
      onSuccess(response);
    } catch (error) {
      console.error('API Error:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      if (onError) onError(error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Authentication
  const login = async (credentials) => {
    return handleApiCall(
      () => authAPI.login(credentials),
      (response) => {
        localStorage.setItem('token', response.data.token);
        dispatch({ type: ACTIONS.SET_USER, payload: response.data.user });
        return response;
      }
    );
  };

  const register = async (userData) => {
    return handleApiCall(
      () => authAPI.register(userData),
      (response) => {
        localStorage.setItem('token', response.data.token);
        dispatch({ type: ACTIONS.SET_USER, payload: response.data.user });
        return response;
      }
    );
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: ACTIONS.SET_USER, payload: null });
    // Clear all data
    dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: [] });
    dispatch({ type: ACTIONS.SET_COMPANIES, payload: [] });
    dispatch({ type: ACTIONS.SET_APPLICANTS, payload: [] });
    dispatch({ type: ACTIONS.SET_JOBS, payload: [] });
    dispatch({ type: ACTIONS.SET_PAYROLL, payload: [] });
    dispatch({ type: ACTIONS.SET_ANALYTICS, payload: null });
  };

  // Employee operations
  const fetchEmployees = () => {
    handleApiCall(
      () => employeeAPI.getAll(),
      (response) => dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: response.data })
    );
  };

  const addEmployee = async (employeeData) => {
    return handleApiCall(
      () => employeeAPI.create(employeeData),
      (response) => {
        dispatch({ type: ACTIONS.ADD_EMPLOYEE, payload: response.data });
        return response;
      }
    );
  };

  const updateEmployee = async (id, employeeData) => {
    return handleApiCall(
      () => employeeAPI.update(id, employeeData),
      (response) => {
        dispatch({ type: ACTIONS.UPDATE_EMPLOYEE, payload: response.data });
        return response;
      }
    );
  };

  const deleteEmployee = async (id) => {
    return handleApiCall(
      () => employeeAPI.delete(id),
      () => dispatch({ type: ACTIONS.DELETE_EMPLOYEE, payload: id })
    );
  };

  // Company operations
  const fetchCompanies = () => {
    handleApiCall(
      () => companyAPI.getAll(),
      (response) => dispatch({ type: ACTIONS.SET_COMPANIES, payload: response.data })
    );
  };

  const addCompany = async (companyData) => {
    return handleApiCall(
      () => companyAPI.create(companyData),
      (response) => {
        dispatch({ type: ACTIONS.ADD_COMPANY, payload: response.data });
        return response;
      }
    );
  };

  const updateCompany = async (id, companyData) => {
    return handleApiCall(
      () => companyAPI.update(id, companyData),
      (response) => {
        dispatch({ type: ACTIONS.UPDATE_COMPANY, payload: response.data });
        return response;
      }
    );
  };

  const deleteCompany = async (id) => {
    return handleApiCall(
      () => companyAPI.delete(id),
      () => dispatch({ type: ACTIONS.DELETE_COMPANY, payload: id })
    );
  };

  // Applicant operations
  const fetchApplicants = () => {
    handleApiCall(
      () => applicantAPI.getAll(),
      (response) => dispatch({ type: ACTIONS.SET_APPLICANTS, payload: response.data })
    );
  };

  const addApplicant = async (applicantData) => {
    return handleApiCall(
      () => applicantAPI.create(applicantData),
      (response) => {
        dispatch({ type: ACTIONS.ADD_APPLICANT, payload: response.data });
        return response;
      }
    );
  };

  const updateApplicant = async (id, applicantData) => {
    return handleApiCall(
      () => applicantAPI.update(id, applicantData),
      (response) => {
        dispatch({ type: ACTIONS.UPDATE_APPLICANT, payload: response.data });
        return response;
      }
    );
  };

  const updateApplicantStage = async (id, stage) => {
    return handleApiCall(
      () => applicantAPI.updateStage(id, stage),
      (response) => {
        dispatch({ type: ACTIONS.UPDATE_APPLICANT, payload: response.data });
        return response;
      }
    );
  };

  const deleteApplicant = async (id) => {
    return handleApiCall(
      () => applicantAPI.delete(id),
      () => dispatch({ type: ACTIONS.DELETE_APPLICANT, payload: id })
    );
  };

  // Job operations
  const fetchJobs = () => {
    handleApiCall(
      () => jobAPI.getAll(),
      (response) => dispatch({ type: ACTIONS.SET_JOBS, payload: response.data })
    );
  };

  const addJob = async (jobData) => {
    return handleApiCall(
      () => jobAPI.create(jobData),
      (response) => {
        dispatch({ type: ACTIONS.ADD_JOB, payload: response.data });
        return response;
      }
    );
  };

  const updateJob = async (id, jobData) => {
    return handleApiCall(
      () => jobAPI.update(id, jobData),
      (response) => {
        dispatch({ type: ACTIONS.UPDATE_JOB, payload: response.data });
        return response;
      }
    );
  };

  const deleteJob = async (id) => {
    return handleApiCall(
      () => jobAPI.delete(id),
      () => dispatch({ type: ACTIONS.DELETE_JOB, payload: id })
    );
  };

  // Payroll operations
  const fetchPayroll = () => {
    handleApiCall(
      () => payrollAPI.getAll(),
      (response) => dispatch({ type: ACTIONS.SET_PAYROLL, payload: response.data })
    );
  };

  const addPayrollRecord = async (payrollData) => {
    return handleApiCall(
      () => payrollAPI.create(payrollData),
      (response) => {
        dispatch({ type: ACTIONS.ADD_PAYROLL, payload: response.data });
        return response;
      }
    );
  };

  const generatePayroll = async (employeeIds, period) => {
    return handleApiCall(
      () => payrollAPI.generate(employeeIds, period),
      (response) => {
        // Refresh payroll data after generation
        fetchPayroll();
        return response;
      }
    );
  };

  // Analytics
  const fetchAnalytics = () => {
    handleApiCall(
      () => analyticsAPI.getDashboard(),
      (response) => dispatch({ type: ACTIONS.SET_ANALYTICS, payload: response.data })
    );
  };

  // Load initial data when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && state.user) {
      fetchEmployees();
      fetchCompanies();
      fetchApplicants();
      fetchJobs();
      fetchPayroll();
      fetchAnalytics();
    }
  }, [state.user]);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleApiCall(
        () => authAPI.getCurrentUser(),
        (response) => dispatch({ type: ACTIONS.SET_USER, payload: response.data.user }),
        () => {
          // Token is invalid, remove it
          localStorage.removeItem('token');
        }
      );
    }
  }, []);

  const value = {
    // State
    ...state,
    
    // Auth
    login,
    register,
    logout,
    
    // Employees
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Companies
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Applicants
    fetchApplicants,
    addApplicant,
    updateApplicant,
    updateApplicantStage,
    deleteApplicant,
    
    // Jobs
    fetchJobs,
    addJob,
    updateJob,
    deleteJob,
    
    // Payroll
    fetchPayroll,
    addPayrollRecord,
    generatePayroll,
    
    // Analytics
    fetchAnalytics,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};