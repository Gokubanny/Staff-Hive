// services/authService.js - Frontend Authentication Service
const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get stored user
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // API request helper
  async apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
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
      console.error('Auth API Error:', error);
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      // Call backend logout endpoint if needed
      if (this.getToken()) {
        await this.apiRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get current user from backend
  async getCurrentUser() {
    try {
      const response = await this.apiRequest('/auth/me');
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      throw new Error('Failed to get current user');
    } catch (error) {
      // If token is invalid, clear storage
      this.logout();
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await this.apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await this.apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();