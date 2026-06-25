import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GoogleOAuthButton = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google OAuth Success:', credentialResponse);
      console.log('Current window location:', window.location.origin);
      console.log('Expected OAuth origin: http://localhost:5173');
      
      // Send the Google credential to our backend for verification
      const response = await axios.post('https://fabricflow-backend1.onrender.com/auth/google-oauth', {
        credential: credentialResponse.credential,
        mode: mode // 'login' or 'register'
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        const { user, token } = response.data;
        
        console.log('User authenticated:', user);
        console.log('Updating auth context with GoogleLogin method');
        
        // Use AuthContext method to properly update auth state
        const authResult = googleLogin(user, token);
        
        if (authResult.success) {
          console.log('Auth context updated successfully');
          console.log('Redirecting to dashboard for role:', user.role);
          console.log('User object:', user);
          
          // Navigate using React Router
          const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : 
                               user.role === 'employee' ? '/employee/dashboard' : '/dashboard';
          
          console.log('Navigating to:', dashboardPath);
          
          // Try immediate navigation first
          navigate(dashboardPath, { replace: true });
          
          // Also try window.location as backup
          setTimeout(() => {
            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
              console.log('Navigation failed, trying window.location redirect');
              window.location.href = dashboardPath;
            }
          }, 1000);
        } else {
          console.error('Failed to update auth context:', authResult.error);
          alert('Authentication state update failed. Please try again.');
        }
      } else {
        console.error('OAuth authentication failed:', response.data.error);
        alert(`Authentication failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('OAuth error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response && error.response.status === 404) {
        // User not found, redirect to role selection
        console.log('User not found, redirecting to role selection');
        localStorage.setItem('googleCredential', credentialResponse.credential);
        navigate('/google-role-selection');
      } else {
        const errorMessage = error.response?.data?.error || 'Authentication failed. Please try again.';
        alert(`Authentication error: ${errorMessage}`);
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth failed');
    console.log('Current URL:', window.location.href);
    console.log('Expected OAuth origin: http://localhost:5173');
    console.log('Checking OAuth configuration...');
    
    // More detailed error message
    const errorDetails = `
Google OAuth Error - Please check:

1. Your email is authorized as a test user in Google Cloud Console
2. OAuth consent screen is properly configured
3. Authorized JavaScript origins include: http://localhost:5173
4. Authorized redirect URIs include: http://localhost:5173
5. The OAuth client ID is correct: 837612251712-fi076juj2fr00lo8g3hvqok47i2o8s1r.apps.googleusercontent.com
6. Try using incognito mode or clearing browser cache
7. Make sure you're using the correct Google account

Current URL: ${window.location.href}
Expected Origin: http://localhost:5173
    `.trim();
    
    alert(errorDetails);
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        width="100%"
        text={mode === 'register' ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleOAuthButton;
