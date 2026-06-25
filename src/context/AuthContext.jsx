import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Authentication Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('fabricflow_token');
        const userData = localStorage.getItem('fabricflow_user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('User restored from localStorage:', parsedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('fabricflow_token');
        localStorage.removeItem('fabricflow_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, role = 'user') => {
    try {
      setIsLoading(true);
      
      // API call to backend
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('fabricflow_token', data.token);
        localStorage.setItem('fabricflow_user', JSON.stringify(data.user));

        // Update state
        setUser(data.user);
        setIsAuthenticated(true);

        console.log('Login successful:', data.user);
        return { success: true, user: data.user };
      } else {
        console.error('Login failed:', data.error);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // API call to backend
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('fabricflow_token', data.token);
        localStorage.setItem('fabricflow_user', JSON.stringify(data.user));

        // Update state
        setUser(data.user);
        setIsAuthenticated(true);

        console.log('Registration successful:', data.user);
        return { success: true, user: data.user };
      } else {
        console.error('Registration failed:', data.error);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login function
  const googleLogin = (userData, token) => {
    try {
      console.log('GoogleLogin called with:', { userData, token });
      
      // Store token and user data with correct keys
      localStorage.setItem('fabricflow_token', token);
      localStorage.setItem('fabricflow_user', JSON.stringify(userData));

      // Update state immediately
      setUser(userData);
      setIsAuthenticated(true);

      console.log('Google OAuth login successful. User set to:', userData);
      console.log('User firstName:', userData.firstName, 'lastName:', userData.lastName);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google OAuth state update error:', error);
      return { success: false, error: 'Failed to update authentication state' };
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('fabricflow_token');
      localStorage.removeItem('fabricflow_user');

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      console.log('Logout successful');
      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Logout failed' };
    }
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      setIsLoading(true);
      
      console.log('Updating profile with:', updatedData);
      
      // Make API call to update user profile
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fabricflow_token')}` // if you have JWT auth
        },
        body: JSON.stringify({
          name: updatedData.name,
          gmail: updatedData.email,
          age: updatedData.age,
          address: updatedData.address,
          phone: updatedData.phone,
          gender: updatedData.gender
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      const updatedUser = result.user;
      
      // Store in localStorage
      localStorage.setItem('fabricflow_user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);

      console.log('Profile updated successfully:', updatedUser);
      return { success: true, user: updatedUser };

    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has permission (role hierarchy)
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'user': 1,
      'employee': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  // Get user's display name
  const getDisplayName = () => {
    if (!user) return '';
    
    // Try firstName + lastName first
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // If we have a valid full name, use it
    if (fullName) return fullName;
    
    // Fall back to name field
    if (user.name) return user.name;
    
    // Fall back to email if nothing else
    if (user.email) return user.email.split('@')[0];
    
    return 'User';
  };

  // Get user's initials
  const getInitials = () => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    
    // Utilities
    hasRole,
    hasPermission,
    getDisplayName,
    getInitials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
