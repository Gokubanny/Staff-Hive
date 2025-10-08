// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state - NO CACHED DATA
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Checking authentication with token...');
        const response = await authAPI.getCurrentUser();
        console.log('✅ Auth API Response:', response);
        
        // Handle response structure
        const userData = response?.data?.user || null;

        if (userData) {
          setUser(userData);
          setToken(savedToken);
          localStorage.setItem('user', JSON.stringify(userData)); // Only store if API succeeds
          console.log('✅ User authenticated successfully');
        } else {
          throw new Error('No user data received from API');
        }
      } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        
        // Clear everything on failure - NO CACHED DATA
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        console.log('🔒 Cleared authentication data due to API failure');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, role, redirectPath = null) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password, role });
      console.log('Login response:', response);
      
      const userData = response?.data?.user || null;
      const userToken = response?.data?.token || null;

      if (userData && userToken) {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(userToken);

        const defaultPath = userData.role === 'admin' ? '/dashboard' : '/user-dashboard';
        navigate(redirectPath || defaultPath, { replace: true });

        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: 'Login failed - no user data received' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      console.log('Signup response:', response);
      
      const newUser = response?.data?.user || null;
      const newToken = response?.data?.token || null;

      if (newUser && newToken) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setToken(newToken);
        
        const defaultPath = newUser.role === 'admin' ? '/dashboard' : '/user-dashboard';
        navigate(defaultPath, { replace: true });
        
        return { success: true, user: newUser };
      } else {
        return { 
          success: false, 
          error: 'Signup failed - no user data received' 
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin', { replace: true });
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response?.data?.user || null;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: 'Profile update failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      return response?.success
        ? { success: true, message: response.message }
        : { success: false, error: 'Password change failed' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  const isAuthenticated = () => !!user && !!token;
  const hasRole = (role) => user?.role === role;
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        hasRole,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        sidebarOpen,
        toggleSidebar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ProtectedRoute component
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) return <Navigate to="/signin" replace />;

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/user-dashboard'} replace />;
  }

  return children;
};