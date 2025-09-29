import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A54] mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Access denied component
const AccessDenied = ({ requiredRole, userRole }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚫</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <div className="text-sm text-gray-500 mb-6">
        <p>Your role: <span className="font-semibold">{userRole || 'None'}</span></p>
        <p>Required: <span className="font-semibold">{requiredRole}</span></p>
      </div>
      <div className="space-y-2">
        <button
          onClick={() => window.history.back()}
          className="w-full bg-[#005A54] text-white px-4 py-2 rounded-md hover:bg-[#EF6869] transition-colors"
        >
          Go Back
        </button>
        <a
          href="/"
          className="block w-full border border-[#005A54] text-[#005A54] px-4 py-2 rounded-md hover:bg-[#005A54] hover:text-white transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  </div>
);

// Main ProtectedRoute component
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requiredRole = null,
  requiredPermission = null,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Save the intended destination for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    // Instead of showing access denied, redirect users to their appropriate dashboard
    const userRole = user?.role;
    let redirectPath = '/';
    
    switch (userRole) {
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      case 'employee':
        redirectPath = '/employee/dashboard';
        break;
      case 'user':
        redirectPath = '/dashboard';
        break;
      default:
        redirectPath = '/';
    }
    
    // If user is trying to access a different role's area, redirect to their dashboard
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
    
    // If they're already on their dashboard page, show access denied
    return <AccessDenied requiredRole={requiredRole} userRole={user?.role} />;
  }

  // Check permission requirement (hierarchical)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied requiredRole={requiredPermission} userRole={user?.role} />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
