// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [serverStatus, setServerStatus] = useState("idle"); // idle, checking, connected, error
  const navigate = useNavigate();
  const { login } = useAuth();

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
    
    // Check server connection on mount
    checkServerConnection();
  }, []);

  // Function to check if Laravel server is running
  const checkServerConnection = async () => {
    try {
      setServerStatus('checking');
      const response = await fetch('http://localhost:8000/api/test', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (response.ok) {
        setServerStatus('connected');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      setServerStatus('error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    
    if (loginError) setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Check server connection before trying to login
    if (serverStatus === 'error') {
      setLoginError("Cannot connect to server. Make sure Laravel is running: php artisan serve");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call auth context login
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberEmail', formData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setLoginError(result.error || "Login failed. Please check your credentials.");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = () => {
    checkServerConnection();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Server Status Indicator */}
        {serverStatus === 'checking' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-yellow-500"></div>
            <span className="text-sm">Checking server connection...</span>
          </div>
        )}
        
        {serverStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cannot connect to server</p>
                <p className="text-xs mt-1">Make sure Laravel backend is running:</p>
                <code className="block mt-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-xs">
                  php artisan serve
                </code>
                <button
                  onClick={handleRetryConnection}
                  className="mt-2 text-xs underline hover:text-red-800 dark:hover:text-red-200"
                >
                  Retry connection
                </button>
              </div>
            </div>
          </div>
        )}
        
        {serverStatus === 'connected' && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Connected to server ✓</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gray-900 dark:bg-gray-900 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Glocery Admin</h1>
            <p className="text-gray-300 text-sm mt-1">Administrator Access Only</p>
          </div>
          
          {/* Form */}
          <div className="p-6">
            {/* Error Message */}
            {loginError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{loginError}</p>
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                      Only users with admin role can access this panel
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Admin Email
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="admin@glocery.et"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-gray-600 dark:text-gray-400 focus:ring-gray-500 border-gray-300 dark:border-gray-600 rounded"
                  id="rememberMe"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || serverStatus === 'error'}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                  isLoading || serverStatus === 'error'
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900 hover:shadow-lg dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in to Admin Panel"
                )}
              </button>

              {/* Admin Note */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This panel is restricted to authorized administrators only.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Server: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">http://localhost:8000</code>
                </p>
              </div>

            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Glocery Admin Panel
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Version 1.0.0 • MySQL Role-Based Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;