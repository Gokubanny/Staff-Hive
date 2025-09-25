// contexts/JobContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import apiService from "../services/apiService";

// Action types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_JOBS: "SET_JOBS",
  ADD_JOB: "ADD_JOB",
  UPDATE_JOB: "UPDATE_JOB",
  DELETE_JOB: "DELETE_JOB",
  SET_APPLICATIONS: "SET_APPLICATIONS",
  ADD_APPLICATION: "ADD_APPLICATION",
  UPDATE_APPLICATION: "UPDATE_APPLICATION",
};

// Initial state
const initialState = {
  jobs: [],
  applications: [],
  loading: false,
  error: null,
};

const JobContext = createContext();

// Reducer
const jobReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_JOBS:
      return { ...state, jobs: action.payload };
    case ACTIONS.ADD_JOB:
      return { ...state, jobs: [...state.jobs, action.payload] };
    case ACTIONS.UPDATE_JOB:
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job._id === action.payload._id ? action.payload : job
        ),
      };
    case ACTIONS.DELETE_JOB:
      return {
        ...state,
        jobs: state.jobs.filter((job) => job._id !== action.payload),
      };
    case ACTIONS.SET_APPLICATIONS:
      return { ...state, applications: action.payload };
    case ACTIONS.ADD_APPLICATION:
      return { ...state, applications: [...state.applications, action.payload] };
    case ACTIONS.UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map((app) =>
          app._id === action.payload._id ? action.payload : app
        ),
      };
    default:
      return state;
  }
};

// Provider
export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState);
  const [authToken, setAuthToken] = useState(null); // <-- store token in state

  // Set token (called after login)
  const setToken = (token) => {
    setAuthToken(token);
  };

  // Generic API handler
  const handleApiCall = async (apiCall, onSuccess, onError) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });

      if (!authToken) throw new Error("Access denied. No token provided.");

      // Pass token dynamically to apiService
      const response = await apiCall(authToken);
      onSuccess(response);
    } catch (err) {
      console.error("API Error:", err);
      dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      if (onError) onError(err);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Jobs
  const fetchJobs = (filters = {}) => {
    handleApiCall(
      (token) => apiService.getJobs(filters, token),
      (jobsData) => dispatch({ type: ACTIONS.SET_JOBS, payload: jobsData || [] })
    );
  };

  const addJob = (jobData) =>
    handleApiCall((token) => apiService.addJob(jobData, token), (newJob) =>
      dispatch({ type: ACTIONS.ADD_JOB, payload: newJob })
    );

  const updateJob = (jobId, updates) =>
    handleApiCall((token) => apiService.updateJob(jobId, updates, token), (updatedJob) =>
      dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })
    );

  const deleteJob = (jobId) =>
    handleApiCall((token) => apiService.deleteJob(jobId, token), () =>
      dispatch({ type: ACTIONS.DELETE_JOB, payload: jobId })
    );

  // Applications
  const fetchApplications = (filters = {}) => {
    handleApiCall(
      (token) => apiService.getApplicants(filters, token),
      (apps) => dispatch({ type: ACTIONS.SET_APPLICATIONS, payload: apps || [] })
    );
  };

  const addApplication = (applicationData) =>
    handleApiCall((token) => apiService.addApplicant(applicationData, token), (newApp) =>
      dispatch({ type: ACTIONS.ADD_APPLICATION, payload: newApp })
    );

  const updateApplicationStatus = (applicationId, status) =>
    handleApiCall(
      (token) => apiService.updateApplicantStage(applicationId, status, token),
      (updatedApp) =>
        dispatch({ type: ACTIONS.UPDATE_APPLICATION, payload: updatedApp })
    );

  // Utility functions
  const getJob = (jobId) => state.jobs.find((job) => job._id === jobId || job.id === jobId);

  const searchJobs = (query) => {
    if (!query) return state.jobs;
    const lowerQuery = query.toLowerCase();
    return state.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.description.toLowerCase().includes(lowerQuery) ||
        job.location.toLowerCase().includes(lowerQuery) ||
        job.requirements?.some((req) => req.toLowerCase().includes(lowerQuery))
    );
  };

  const value = {
    ...state,
    setToken,
    fetchJobs,
    addJob,
    updateJob,
    deleteJob,
    fetchApplications,
    addApplication,
    updateApplicationStatus,
    getJob,
    searchJobs,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within a JobProvider");
  return context;
};

export default JobContext;
