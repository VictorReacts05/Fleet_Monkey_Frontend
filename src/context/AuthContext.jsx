import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = async (loginId, password) => {
    try {
      const response = await axios.post('http://localhost:5173/api/auth/login', {
        loginId,
        password
      });

      if (response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setIsAuthenticated(true);
        navigate('/sales-rfq', { replace: true });
        return { success: true };
      } else {
        return { success: false, error: 'Authentication failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Authentication failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Check if user is already logged in on app load
  useState(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);