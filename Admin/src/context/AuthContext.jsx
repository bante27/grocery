// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('guest');

  // Create axios instance for API calls
  const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });

  // Add token to requests if exists
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const checkExistingSession = async () => {
      const savedToken = localStorage.getItem('adminToken');
      const savedUser = localStorage.getItem('adminUser');
      
      if (savedToken && savedUser) {
        try {
          // Verify token with backend
          const response = await api.get('/user');
          
          if (response.data.success) {
            const userData = response.data.user;
            
            // Check if user is admin
            if (userData.role !== 'admin') {
              console.log('User is not admin, logging out...');
              logout();
              return;
            }
            
            setUser(userData);
            setToken(savedToken);
            setIsAuthenticated(true);
            setRole(userData.role);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Token verification failed:', error.message);
          // Token is invalid, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  // Admin login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/admin/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Verify user is admin
        if (user.role !== 'admin') {
          return { 
            success: false, 
            error: 'Access denied. Admin privileges required.' 
          };
        }
        
        // Save to localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Update state
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
        setRole(user.role);
        
        return { 
          success: true, 
          user,
          token
        };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed' 
        };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (error.response.status === 422) {
          errorMessage = 'Validation failed. Please check your input.';
        } else {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // No response received
        errorMessage = 'Cannot connect to server. Make sure Laravel is running: php artisan serve';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Server is taking too long to respond.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API if we have a token
      if (token) {
        await api.post('/logout');
      }
    } catch (error) {
      console.log('Logout API error (ignoring):', error.message);
    }
    
    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Reset state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setRole('guest');
    
    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        login,
        logout,
        loading,
        isAuthenticated,
        api,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};