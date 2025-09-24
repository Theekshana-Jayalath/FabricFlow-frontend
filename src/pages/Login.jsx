import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleOAuthButton from '../auth/GoogleOAuthButton';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || null;
  const successMessage = location.state?.message || null;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' // default role
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Add password visibility state
  const [authError, setAuthError] = useState(''); // Add authentication error state

  const roles = [
    { value: 'user', label: 'User', description: 'Customer access' },
    { value: 'employee', label: 'Employee', description: 'Production & QC access' },
    { value: 'admin', label: 'Admin', description: 'Full system access' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError('');
    }
    
    // Update form data with trimmed values for email
    const trimmedValue = name === 'email' ? value.trim() : value;
    setFormData(prev => ({
      ...prev,
      [name]: trimmedValue
    }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    // Clear existing error for this field
    if (newErrors[name]) {
      delete newErrors[name];
    }
    
    // Validate the current field in real-time
    let fieldError = '';
    
    switch (name) {
      case 'email':
        if (!trimmedValue) {
          fieldError = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedValue)) {
            fieldError = 'Please enter a valid email address';
          }
        }
        break;
      case 'password':
        if (!value) {
          fieldError = 'Password is required';
        } else if (value.length < 8) {
          fieldError = 'Password must be at least 8 characters';
        }
        break;
      case 'role':
        if (!value) {
          fieldError = 'Please select your role';
        }
        break;
      default:
        break;
    }
    
    // Add error if validation failed
    if (fieldError) {
      newErrors[name] = fieldError;
    }
    
    // Update errors state
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (name@domain.com)';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    } else if (!['user', 'employee', 'admin'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email: formData.email, role: formData.role });
      const result = await login(formData.email, formData.password, formData.role);
      
      console.log('Login result:', result);
      
      if (result.success) {
        // Get the user role to determine proper redirect
        const userRole = result.user.role;
        console.log('User role after login:', userRole);
        
        // Check if user was trying to access a protected page
        if (from) {
          console.log('Redirecting from protected page:', from);
          // Only redirect to the original page if the user has permission
          // Check if the requested page matches the user's role
          const isAdminRoute = from.startsWith('/admin');
          const isEmployeeRoute = from.startsWith('/employee');
          
          if (isAdminRoute && userRole === 'admin') {
            navigate(from, { replace: true });
          } else if (isEmployeeRoute && (userRole === 'employee' || userRole === 'admin')) {
            navigate(from, { replace: true });
          } else if (!isAdminRoute && !isEmployeeRoute) {
            // For general protected routes, allow if authenticated
            navigate(from, { replace: true });
          } else {
            // User doesn't have permission for the requested page, redirect to their default
            console.log('User lacks permission, redirecting to default dashboard');
            navigateToUserDashboard(userRole);
          }
        } else {
          // No specific page requested, navigate to default dashboard
          console.log('No specific page requested, navigating to default dashboard');
          navigateToUserDashboard(userRole);
        }
      } else {
        console.error('Login failed:', result.error);
        const errorMessage = result.error || 'Login failed. Please check your credentials.';
        setErrors({ general: errorMessage });
        setAuthError(errorMessage); // Set auth error to show forgot password link
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
      setAuthError(errorMessage); // Set auth error to show forgot password link
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to navigate users to their appropriate dashboard
  const navigateToUserDashboard = (userRole) => {
    console.log('Navigating to dashboard for role:', userRole);
    switch (userRole) {
      case 'admin':
        console.log('Redirecting admin to /admin/dashboard');
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'employee':
        console.log('Redirecting employee to /employee/dashboard');
        navigate('/employee/dashboard', { replace: true });
        break;
      case 'user':
        console.log('Redirecting user to /dashboard');
        navigate('/dashboard', { replace: true });
        break;
      default:
        console.log('Unknown role, redirecting to home');
        navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#005A54] to-[#EF6869] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">FF</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome back to FabricFlow
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border-t-4 border-[#005A54]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {successMessage}
              </div>
            )}
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#005A54] focus:border-[#005A54] sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#005A54] focus:border-[#005A54] sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select your role
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.value} className="relative">
                    <label className={`cursor-pointer block p-3 border rounded-lg transition-colors ${
                      formData.role === role.value
                        ? 'border-[#005A54] bg-[#FFEED6]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="h-4 w-4 text-[#005A54] focus:ring-[#005A54] border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#005A54] focus:ring-[#005A54] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            {/* Show Forgot Password link only when there's an auth error */}
            {authError && (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                  isLoading || authLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#005A54] hover:bg-[#EF6869] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A54]'
                }`}
              >
                {isLoading || authLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div>
              <GoogleOAuthButton mode="login" />
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-[#005A54] hover:text-[#EF6869] transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
