import React, { createContext, useContext, useState, useEffect } from 'react';

const JobContext = createContext();

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState({
    name: 'TechCorp Inc.',
    contactEmail: 'admin@techcorp.com',
    phone: '+1 (555) 123-4567',
    about: 'Leading technology solutions provider',
    businessHours: {
      start: '09:00',
      end: '17:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    holidays: [],
    notificationSettings: {
      email: {
        newRegistrations: true,
        payrollAlerts: true,
        leaveRequests: true,
        systemUpdates: true,
        securityAlerts: true
      },
      app: {
        newMessages: true,
        approvalRequests: true,
        taskAssignments: true,
        deadlineReminders: true
      }
    }
  });
  
  const [integrations, setIntegrations] = useState([
    {
      id: 'payroll',
      name: 'Payroll System',
      description: 'Automated payroll processing',
      status: 'connected',
      provider: 'PayrollPro'
    },
    {
      id: 'calendar',
      name: 'Calendar Integration',
      description: 'Sync with Google Calendar',
      status: 'disconnected',
      provider: 'Google'
    },
    {
      id: 'email',
      name: 'Email Service',
      description: 'Automated email notifications',
      status: 'connected',
      provider: 'SendGrid'
    },
    {
      id: 'backup',
      name: 'Data Backup',
      description: 'Daily automated backups',
      status: 'connected',
      provider: 'CloudBackup'
    },
    {
      id: 'security',
      name: 'Security Monitoring',
      description: '24/7 security monitoring',
      status: 'disconnected',
      provider: 'SecureWatch'
    }
  ]);

  // Mock initial jobs data
  useEffect(() => {
    const mockJobs = [
      {
        id: 1,
        _id: 'job1',
        title: 'Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer to join our dynamic team.',
        location: 'San Francisco, CA',
        type: 'full-time',
        salary: '80000',
        salaryCurrency: 'USD',
        status: 'open',
        requirements: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
        company: 'TechCorp Inc.',
        postedDate: '2024-05-01',
        createdAt: '2024-05-01T10:00:00Z',
        applications: []
      },
      {
        id: 2,
        _id: 'job2',
        title: 'Backend Developer',
        description: 'Looking for an experienced Backend Developer to build scalable APIs.',
        location: 'Remote',
        type: 'full-time',
        salary: '90000',
        salaryCurrency: 'USD',
        status: 'open',
        requirements: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
        company: 'TechCorp Inc.',
        postedDate: '2024-05-15',
        createdAt: '2024-05-15T10:00:00Z',
        applications: []
      }
    ];
    setJobs(mockJobs);
  }, []);

  // Job Management Methods
  const addJob = async (jobData) => {
    setIsLoading(true);
    try {
      const newJob = {
        id: Date.now(),
        _id: `job${Date.now()}`,
        ...jobData,
        status: 'open',
        postedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        applications: []
      };
      setJobs(prev => [...prev, newJob]);
      return newJob;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (jobId, updates) => {
    setIsLoading(true);
    try {
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId || job._id === jobId 
            ? { ...job, ...updates }
            : job
        )
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeJob = async (jobId) => {
    setIsLoading(true);
    try {
      setJobs(prev => 
        prev.filter(job => job.id !== jobId && job._id !== jobId)
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getJob = (jobId) => {
    return jobs.find(job => job.id === jobId || job._id === jobId);
  };

  const searchJobs = (query) => {
    if (!query) return jobs;
    
    const lowerQuery = query.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(lowerQuery) ||
      job.description.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.requirements.some(req => req.toLowerCase().includes(lowerQuery))
    );
  };

  // Application Management Methods
  const addApplication = async (applicationData) => {
    setIsLoading(true);
    try {
      const newApplication = {
        id: Date.now(),
        _id: `app${Date.now()}`,
        ...applicationData,
        status: 'pending',
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setApplications(prev => [...prev, newApplication]);
      
      // Update job applications count
      setJobs(prev => 
        prev.map(job => 
          job.id === applicationData.jobId || job._id === applicationData.jobId
            ? { ...job, applications: [...(job.applications || []), newApplication.id] }
            : job
        )
      );
      
      return newApplication;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    setIsLoading(true);
    try {
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId || app._id === applicationId
            ? { ...app, status, updatedAt: new Date().toISOString() }
            : app
        )
      );
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getJobApplications = (jobId) => {
    return applications.filter(app => app.jobId === jobId);
  };

  const getUserApplications = (userId) => {
    return applications.filter(app => app.userId === userId);
  };

  // Company Management Methods
  const updateCompany = (newData) => {
    setCompany(prev => ({ ...prev, ...newData }));
  };

  // Integration Management Methods
  const updateIntegration = (integrationId, status) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status }
          : integration
      )
    );
  };

  // Data Management Methods
  const exportData = async (format) => {
    try {
      const data = {
        jobs,
        applications,
        company,
        integrations,
        exportDate: new Date().toISOString()
      };

      let content, filename, mimeType;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `company-data-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        // Convert jobs to CSV format
        const jobsCSV = jobs.map(job => ({
          id: job.id,
          title: job.title,
          location: job.location,
          type: job.type,
          salary: job.salary,
          status: job.status,
          postedDate: job.postedDate
        }));
        
        const headers = Object.keys(jobsCSV[0] || {}).join(',');
        const rows = jobsCSV.map(job => Object.values(job).join(',')).join('\n');
        content = headers + '\n' + rows;
        filename = `jobs-data-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      throw new Error('Export failed: ' + error.message);
    }
  };

  const importData = async (file) => {
    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
        if (data.jobs) setJobs(data.jobs);
        if (data.applications) setApplications(data.applications);
        if (data.company) setCompany(data.company);
        if (data.integrations) setIntegrations(data.integrations);
      } else if (file.name.endsWith('.csv')) {
        // Basic CSV parsing for jobs
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const jobsData = lines.slice(1).map(line => {
          const values = line.split(',');
          const job = {};
          headers.forEach((header, index) => {
            job[header] = values[index];
          });
          return { ...job, id: parseInt(job.id) || Date.now() };
        }).filter(job => job.title);
        
        setJobs(jobsData);
      }

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      throw new Error('Import failed: ' + error.message);
    }
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setJobs([]);
      setApplications([]);
      setCompany({
        name: '',
        contactEmail: '',
        phone: '',
        about: '',
        businessHours: {
          start: '09:00',
          end: '17:00',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        },
        holidays: [],
        notificationSettings: {
          email: {
            newRegistrations: true,
            payrollAlerts: true,
            leaveRequests: true,
            systemUpdates: true,
            securityAlerts: true
          },
          app: {
            newMessages: true,
            approvalRequests: true,
            taskAssignments: true,
            deadlineReminders: true
          }
        }
      });
      setIntegrations([
        {
          id: 'payroll',
          name: 'Payroll System',
          description: 'Automated payroll processing',
          status: 'disconnected',
          provider: 'PayrollPro'
        },
        {
          id: 'calendar',
          name: 'Calendar Integration',
          description: 'Sync with Google Calendar',
          status: 'disconnected',
          provider: 'Google'
        },
        {
          id: 'email',
          name: 'Email Service',
          description: 'Automated email notifications',
          status: 'disconnected',
          provider: 'SendGrid'
        },
        {
          id: 'backup',
          name: 'Data Backup',
          description: 'Daily automated backups',
          status: 'disconnected',
          provider: 'CloudBackup'
        },
        {
          id: 'security',
          name: 'Security Monitoring',
          description: '24/7 security monitoring',
          status: 'disconnected',
          provider: 'SecureWatch'
        }
      ]);
      setError(null);
    }
  };

  const contextValue = {
    // State
    jobs,
    applications,
    isLoading,
    error,
    company,
    integrations,
    
    // Job Methods
    addJob,
    updateJob,
    removeJob,
    getJob,
    searchJobs,
    
    // Application Methods
    addApplication,
    updateApplicationStatus,
    getJobApplications,
    getUserApplications,
    
    // Company Methods
    updateCompany,
    
    // Integration Methods
    updateIntegration,
    
    // Data Management Methods
    exportData,
    importData,
    resetData
  };

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

export default JobContext;