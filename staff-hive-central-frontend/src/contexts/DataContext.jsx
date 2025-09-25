// src/contexts/DataContext.js
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

  // Authentication
  const login = async (credentials) =>
    handleApiCall(
      () => authAPI.login(credentials),
      (response) => {
        const token = response?.data?.token;
        const user = response?.data?.user;
        if (token && user) {
          localStorage.setItem('token', token);
          dispatch({ type: ACTIONS.SET_USER, payload: user });
        }
      }
    );

  const register = async (userData) =>
    handleApiCall(
      () => authAPI.register(userData),
      (response) => {
        const token = response?.data?.token;
        const user = response?.data?.user;
        if (token && user) {
          localStorage.setItem('token', token);
          dispatch({ type: ACTIONS.SET_USER, payload: user });
        }
      }
    );

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: ACTIONS.SET_USER, payload: null });
    dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: [] });
    dispatch({ type: ACTIONS.SET_COMPANIES, payload: [] });
    dispatch({ type: ACTIONS.SET_APPLICANTS, payload: [] });
    dispatch({ type: ACTIONS.SET_JOBS, payload: [] });
    dispatch({ type: ACTIONS.SET_PAYROLL, payload: [] });
    dispatch({ type: ACTIONS.SET_ANALYTICS, payload: null });
  };

  // Employee operations
  const fetchEmployees = () =>
    handleApiCall(
      () => employeeAPI.getAll(),
      (response) => {
        const data = Array.isArray(response?.data) ? response.data : response?.data?.employees || [];
        dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: data });
      }
    );

  const addEmployee = (data) =>
    handleApiCall(() => employeeAPI.create(data), (res) => dispatch({ type: ACTIONS.ADD_EMPLOYEE, payload: res?.data }));

  const updateEmployee = (id, data) =>
    handleApiCall(() => employeeAPI.update(id, data), (res) => dispatch({ type: ACTIONS.UPDATE_EMPLOYEE, payload: res?.data }));

  const deleteEmployee = (id) =>
    handleApiCall(() => employeeAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_EMPLOYEE, payload: id }));

  // Company operations
  const fetchCompanies = () =>
    handleApiCall(() => companyAPI.getAll(), (res) => dispatch({ type: ACTIONS.SET_COMPANIES, payload: res?.data || [] }));

  const addCompany = (data) =>
    handleApiCall(() => companyAPI.create(data), (res) => dispatch({ type: ACTIONS.ADD_COMPANY, payload: res?.data }));

  const updateCompany = (id, data) =>
    handleApiCall(() => companyAPI.update(id, data), (res) => dispatch({ type: ACTIONS.UPDATE_COMPANY, payload: res?.data }));

  const deleteCompany = (id) =>
    handleApiCall(() => companyAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_COMPANY, payload: id }));

  // Applicant operations
  const fetchApplicants = () =>
    handleApiCall(() => applicantAPI.getAll(), (res) => dispatch({ type: ACTIONS.SET_APPLICANTS, payload: res?.data || [] }));

  const addApplicant = (data) =>
    handleApiCall(() => applicantAPI.create(data), (res) => dispatch({ type: ACTIONS.ADD_APPLICANT, payload: res?.data }));

  const updateApplicant = (id, data) =>
    handleApiCall(() => applicantAPI.update(id, data), (res) => dispatch({ type: ACTIONS.UPDATE_APPLICANT, payload: res?.data }));

  const updateApplicantStage = (id, stage) =>
    handleApiCall(() => applicantAPI.updateStage(id, stage), (res) => dispatch({ type: ACTIONS.UPDATE_APPLICANT, payload: res?.data }));

  const deleteApplicant = (id) =>
    handleApiCall(() => applicantAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_APPLICANT, payload: id }));

  // Job operations
  const fetchJobs = () =>
    handleApiCall(() => jobAPI.getAll(), (res) => dispatch({ type: ACTIONS.SET_JOBS, payload: res?.data || [] }));

  const addJob = (data) =>
    handleApiCall(() => jobAPI.create(data), (res) => dispatch({ type: ACTIONS.ADD_JOB, payload: res?.data }));

  const updateJob = (id, data) =>
    handleApiCall(() => jobAPI.update(id, data), (res) => dispatch({ type: ACTIONS.UPDATE_JOB, payload: res?.data }));

  const deleteJob = (id) =>
    handleApiCall(() => jobAPI.delete(id), () => dispatch({ type: ACTIONS.DELETE_JOB, payload: id }));

  // Payroll operations
  const fetchPayroll = () =>
    handleApiCall(() => payrollAPI.getAll(), (res) => dispatch({ type: ACTIONS.SET_PAYROLL, payload: res?.data || [] }));

  const addPayrollRecord = (data) =>
    handleApiCall(() => payrollAPI.create(data), (res) => dispatch({ type: ACTIONS.ADD_PAYROLL, payload: res?.data }));

  const generatePayroll = (employeeIds, period) =>
    handleApiCall(() => payrollAPI.generate(employeeIds, period), () => fetchPayroll());

  // Analytics
  const fetchAnalytics = () =>
    handleApiCall(() => analyticsAPI.getDashboard(), (res) => dispatch({ type: ACTIONS.SET_ANALYTICS, payload: res?.data }));

  // Load initial data when user exists
  useEffect(() => {
    if (state.user) {
      fetchEmployees();
      fetchCompanies();
      fetchApplicants();
      fetchJobs();
      fetchPayroll();
      fetchAnalytics();
    }
  }, [state.user]);

  // Check existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleApiCall(
        () => authAPI.getCurrentUser(),
        (res) => dispatch({ type: ACTIONS.SET_USER, payload: res?.data?.user || null }),
        () => localStorage.removeItem('token')
      );
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
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
