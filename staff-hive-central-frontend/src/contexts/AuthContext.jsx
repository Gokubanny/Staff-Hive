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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Get user with token
          const response = await authAPI.getCurrentUser(savedToken);
          const userData = response?.data?.user || response?.user || null;

          if (userData) {
            setUser(userData);
            setToken(savedToken);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Auth initialized successfully:', userData);
          } else {
            console.warn('Token invalid or user not found, clearing localStorage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, role, redirectPath = null) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password, role });
      const userData = response?.data?.user || response?.user || null;
      const userToken = response?.data?.token || response?.token || null;

      if (userData && userToken) {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(userToken);

        if (redirectPath) navigate(redirectPath, { replace: true });
        else {
          const defaultPath = userData.role === 'admin' ? '/dashboard' : '/user-dashboard';
          navigate(defaultPath, { replace: true });
        }

        return { success: true, user: userData };
      } else {
        return { success: false, error: response?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      const newUser = response?.data?.user || response?.user || null;
      const newToken = response?.data?.token || response?.token || null;

      if (newUser && newToken) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setToken(newToken);
        return { success: true, user: newUser };
      } else {
        return { success: false, error: response?.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout(token);
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
      const response = await authAPI.updateProfile(profileData, token);
      const updatedUser = response?.data?.user || response?.user || null;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response?.message || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Profile update error' };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword }, token);
      return response?.success
        ? { success: true, message: response.message }
        : { success: false, error: response?.message || 'Password change failed' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change error' };
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
