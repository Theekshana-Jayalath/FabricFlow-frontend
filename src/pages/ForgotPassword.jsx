import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email input, 2: Verification code, 3: New password
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const validateVerificationCode = () => {
    const newErrors = {};
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }
    return newErrors;
  };

  const validatePasswordReset = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmail();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/auth/forgot-password', {
        email: formData.email
      });

      if (response.data.success) {
        setMessage('Verification code sent to your email. Please check your inbox.');
        setStep(2);
      } else {
        setErrors({ email: response.data.error || 'Failed to send verification code' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send verification code. Please try again.';
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const validationErrors = validateVerificationCode();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/auth/verify-reset-code', {
        email: formData.email,
        code: formData.verificationCode
      });

      if (response.data.success) {
        setMessage('Code verified successfully. Please enter your new password.');
        setStep(3);
      } else {
        setErrors({ verificationCode: response.data.error || 'Invalid verification code' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid verification code. Please try again.';
      setErrors({ verificationCode: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const validationErrors = validatePasswordReset();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/auth/reset-password', {
        email: formData.email,
        code: formData.verificationCode,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setMessage('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please login with your new password.' 
            }
          });
        }, 2000);
      } else {
        setErrors({ newPassword: response.data.error || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reset password. Please try again.';
      setErrors({ newPassword: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:5000/auth/forgot-password', {
        email: formData.email
      });

      if (response.data.success) {
        setMessage('New verification code sent to your email.');
      } else {
        setMessage('Failed to resend code. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-teal-600 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Set New Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 && 'Enter your email address to receive a verification code'}
            {step === 2 && 'Check your email for the 6-digit verification code'}
            {step === 3 && 'Enter your new password below'}
          </p>
        </div>

        {message && (
          <div className={`rounded-md p-4 ${message.includes('successful') || message.includes('sent') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6">
          {step === 1 && (
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="verificationCode" className="sr-only">Verification Code</label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                maxLength="6"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.verificationCode ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest`}
                placeholder="000000"
                value={formData.verificationCode}
                onChange={handleChange}
              />
              {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="sr-only">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm`}
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          <div>
            {step === 1 && (
              <button
                type="submit"
                onClick={handleSendResetCode}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <button
                  type="submit"
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="w-full text-center text-sm text-teal-600 hover:text-teal-500 disabled:opacity-50"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            )}

            {step === 3 && (
              <button
                type="submit"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            )}
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
