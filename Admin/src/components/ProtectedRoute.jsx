// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');
  
  if (!token || !user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  try {
    const userData = JSON.parse(user);
    
    // Check if user is admin
    if (userData.role !== 'admin') {
      console.log('User is not admin, redirecting to login');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;