import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Only adding sidebar state
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, role = 'user', redirectPath = null) => {
    if (email && password) {
      const userData = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        role: role
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/signin', { replace: true });
  };

  // Simple sidebar toggle function
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const value = {
    // Auth values
    user,
    login,
    logout,
    isLoading,
    
    // UI values
    sidebarOpen,
    toggleSidebar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/user-dashboard'} replace />;
  }

  return children;
};