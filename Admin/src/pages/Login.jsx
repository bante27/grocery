// src/pages/Login.jsx  →  DELETE THIS FILE OR REPLACE WITH THIS:

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If auto-login is active (from our AuthProvider), skip login entirely
    if (!loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Show nothing or a tiny loader while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600 mx-auto"></div>
        <p className="mt-6 text-xl font-semibold text-gray-700">Welcome to Grocery Admin</p>
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Login;