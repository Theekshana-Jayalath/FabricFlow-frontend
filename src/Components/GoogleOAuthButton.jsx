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
          
          // Navigate using React Router
          const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : 
                               user.role === 'employee' ? '/employee/dashboard' : '/dashboard';
          
          navigate(dashboardPath, { replace: true });
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
    console.log('OAuth Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID || 'Using hardcoded ID');
    alert('Google authentication failed. Please check:\n1. Your email is added as a test user in Google Console\n2. Authorized origins include http://localhost:5174\n3. Try incognito mode or clear cache');
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
