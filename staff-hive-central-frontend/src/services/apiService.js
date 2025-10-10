// services/apiService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://staff-hive-backend.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API call with dynamic token
  async apiCall(endpoint, { method = 'GET', body = null, token } = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        return result.data || result;
      }

      return await response.text();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection and try again');
      }
      throw error;
    }
  }

  // Authentication
  login(credentials) {
    return this.apiCall('/auth/login', { method: 'POST', body: credentials });
  }

  register(userData) {
    return this.apiCall('/auth/register', { method: 'POST', body: userData });
  }

  verifyToken(token) {
    return this.apiCall('/auth/verify', { token });
  }

  // Employees
  getEmployees(token) {
    return this.apiCall('/employees', { token });
  }

  getEmployee(id, token) {
    return this.apiCall(`/employees/${id}`, { token });
  }

  addEmployee(employeeData, token) {
    return this.apiCall('/employees', { method: 'POST', body: employeeData, token });
  }

  updateEmployee(id, updates, token) {
    return this.apiCall(`/employees/${id}`, { method: 'PUT', body: updates, token });
  }

  deleteEmployee(id, token) {
    return this.apiCall(`/employees/${id}`, { method: 'DELETE', token });
  }

  // Companies
  getCompanies(token) {
    return this.apiCall('/companies', { token });
  }

  addCompany(companyData, token) {
    return this.apiCall('/companies', { method: 'POST', body: companyData, token });
  }

  updateCompany(id, updates, token) {
    return this.apiCall(`/companies/${id}`, { method: 'PUT', body: updates, token });
  }

  deleteCompany(id, token) {
    return this.apiCall(`/companies/${id}`, { method: 'DELETE', token });
  }

  // Applicants
  getApplicants(filters = {}, token) {
    const query = new URLSearchParams(filters).toString();
    return this.apiCall(query ? `/applicants?${query}` : '/applicants', { token });
  }

  addApplicant(applicantData, token) {
    return this.apiCall('/applicants', { method: 'POST', body: applicantData, token });
  }

  updateApplicantStage(id, stage, token) {
    return this.apiCall(`/applicants/${id}/stage`, { method: 'PATCH', body: { stage }, token });
  }

  deleteApplicant(id, token) {
    return this.apiCall(`/applicants/${id}`, { method: 'DELETE', token });
  }

  // Jobs
  getJobs(filters = {}, token) {
    const query = new URLSearchParams(filters).toString();
    return this.apiCall(query ? `/jobs?${query}` : '/jobs', { token });
  }

  addJob(jobData, token) {
    return this.apiCall('/jobs', { method: 'POST', body: jobData, token });
  }

  updateJob(id, updates, token) {
    return this.apiCall(`/jobs/${id}`, { method: 'PUT', body: updates, token });
  }

  deleteJob(id, token) {
    return this.apiCall(`/jobs/${id}`, { method: 'DELETE', token });
  }

  // Payroll
  getPayroll(filters = {}, token) {
    const query = new URLSearchParams(filters).toString();
    return this.apiCall(query ? `/payroll?${query}` : '/payroll', { token });
  }

  addPayrollRecord(data, token) {
    return this.apiCall('/payroll', { method: 'POST', body: data, token });
  }

  generatePayroll(employeeIds, token) {
    return this.apiCall('/payroll/generate', { method: 'POST', body: { employeeIds }, token });
  }

  updatePayrollRecord(id, updates, token) {
    return this.apiCall(`/payroll/${id}`, { method: 'PUT', body: updates, token });
  }

  deletePayrollRecord(id, token) {
    return this.apiCall(`/payroll/${id}`, { method: 'DELETE', token });
  }

  // Analytics
  getAnalytics(token) {
    return this.apiCall('/analytics', { token });
  }
}

export default new ApiService();
