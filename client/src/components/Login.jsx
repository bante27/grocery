import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/shop';
  
  // API URLs to try
  const API_URLS = [
    'http://127.0.0.1:8000/api/auth',
    'http://127.0.0.1:8000/api',
    'http://127.0.0.1:8000'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Function to trigger auth update in Header
  const triggerAuthUpdate = () => {
    // Dispatch custom event to notify Header
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // Force a storage event (for cross-tab sync)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'token',
      newValue: localStorage.getItem('token')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let successfulLogin = false;

    // Try different API endpoints
    for (const baseUrl of API_URLS) {
      try {
        console.log(`Trying API: ${baseUrl}/login`);
        
        const response = await axios.post(`${baseUrl}/login`, formData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 3000
        });
        
        if (response.data.success) {
          // Save to localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Trigger auth update in Header
          triggerAuthUpdate();
          
          alert('Login successful!');
          navigate(from, { replace: true });
          successfulLogin = true;
          break;
        } else {
          setError(response.data.message || 'Login failed');
        }
      } catch (err) {
        console.log(`Failed for ${baseUrl}:`, err.message);
        
        // If we get a 401 (unauthorized), it means credentials are wrong
        if (err.response?.status === 401) {
          setError('Invalid email or password.');
          break;
        }
        
        // If we get a 422 (validation error), show validation errors
        if (err.response?.status === 422) {
          const errors = err.response.data.errors;
          if (errors.email) {
            setError(errors.email[0]);
          } else if (errors.password) {
            setError(errors.password[0]);
          } else {
            setError('Validation failed.');
          }
          break;
        }
        
        // If we get a 404, endpoint not found
        if (err.response?.status === 404) {
          console.log(`Endpoint ${baseUrl}/login not found, trying next...`);
          continue;
        }
      }
    }

    // If we tried all URLs and none worked, use mock login
    if (!successfulLogin && !error) {
      setError('Using mock login for testing...');
      
      // Mock login for testing
      setTimeout(() => {
        const mockUser = {
          id: 1,
          name: formData.email.split('@')[0] || 'User',
          email: formData.email,
          phone: '1234567890',
          role: 'user',
          isAdmin: false
        };
        
        const mockToken = 'mock_token_' + Date.now();
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Trigger auth update in Header
        triggerAuthUpdate();
        
        alert('Login successful! (Test Mode)');
        navigate(from, { replace: true });
        setLoading(false);
      }, 1000);
      return;
    }

    setLoading(false);
  };

  // Test credentials button
  const handleTestCredentials = () => {
    setFormData({
      email: 'test@example.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Test Credentials Button */}
          <button
            type="button"
            onClick={handleTestCredentials}
            className="mb-4 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Fill Test Credentials
          </button>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading
                    ? 'bg-emerald-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Test Backend Connection */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              axios.get('http://127.0.0.1:8000')
                .then(() => alert('✅ Backend is running!'))
                .catch(() => alert('❌ Backend is NOT running. Start with: php artisan serve'));
            }}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            Test Backend Connection
          </button>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link
            to="/"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;