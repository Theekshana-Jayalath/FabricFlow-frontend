import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function RouteTest() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🛡️ Protected Routes Test</h1>
          
          {/* Authentication Status */}
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current Authentication Status</h2>
            <p>Logged in: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'Yes' : 'No'}</span></p>
            {user && (
              <>
                <p>User: {user.firstName} {user.lastName}</p>
                <p>Role: <span className="font-semibold">{user.role}</span></p>
                <p>Email: {user.email}</p>
              </>
            )}
          </div>

          {/* Test Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Public Routes */}
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Public Routes (Always Accessible)</h3>
              <div className="space-y-1 text-sm">
                <Link to="/" className="block text-green-700 hover:underline">Home</Link>
                <Link to="/about" className="block text-green-700 hover:underline">About</Link>
                <Link to="/services" className="block text-green-700 hover:underline">Services</Link>
                <Link to="/contact" className="block text-green-700 hover:underline">Contact</Link>
              </div>
            </div>

            {/* Authentication Required */}
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🔐 Authentication Required</h3>
              <div className="space-y-1 text-sm">
                <Link to="/dashboard" className="block text-yellow-700 hover:underline">User Dashboard</Link>
                <Link to="/orders" className="block text-yellow-700 hover:underline">My Orders</Link>
                <Link to="/profile" className="block text-yellow-700 hover:underline">Profile</Link>
              </div>
            </div>

            {/* Employee Permission Required */}
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">👷 Employee+ Permission</h3>
              <div className="space-y-1 text-sm">
                <Link to="/employee/dashboard" className="block text-blue-700 hover:underline">Employee Dashboard</Link>
                <Link to="/employee/tasks" className="block text-blue-700 hover:underline">Tasks</Link>
                <Link to="/employee/production" className="block text-blue-700 hover:underline">Production</Link>
                <Link to="/employee/quality" className="block text-blue-700 hover:underline">Quality Control</Link>
              </div>
            </div>

            {/* Admin Role Required */}
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">🛠️ Admin Role Only</h3>
              <div className="space-y-1 text-sm">
                <Link to="/admin" className="block text-red-700 hover:underline">Admin Panel</Link>
                <Link to="/admin/users" className="block text-red-700 hover:underline">User Management</Link>
                <Link to="/admin/employees" className="block text-red-700 hover:underline">Employee Management</Link>
                <Link to="/admin/reports" className="block text-red-700 hover:underline">Reports</Link>
              </div>
            </div>

            {/* Test Invalid Route */}
            <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">❌ Invalid Route Test</h3>
              <div className="space-y-1 text-sm">
                <Link to="/nonexistent" className="block text-gray-700 hover:underline">Non-existent Page</Link>
                <Link to="/invalid/route" className="block text-gray-700 hover:underline">Invalid Route</Link>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">📋 Testing Instructions</h3>
              <div className="text-xs text-purple-700 space-y-1">
                <p>1. Try links while logged out</p>
                <p>2. Register with different roles</p>
                <p>3. Test access permissions</p>
                <p>4. Check redirect behavior</p>
              </div>
            </div>
          </div>

          {/* Current Status Summary */}
          <div className="mt-8 p-4 bg-[#FFEED6] rounded-lg">
            <h3 className="font-semibold text-[#005A54] mb-2">Expected Behavior</h3>
            <div className="text-sm text-gray-700 space-y-1">
              {!isAuthenticated ? (
                <>
                  <p>• Public routes should work normally</p>
                  <p>• Protected routes should redirect to login</p>
                  <p>• Admin routes should redirect to login</p>
                </>
              ) : (
                <>
                  <p>• All public routes should work</p>
                  <p>• User routes should work based on your role</p>
                  {user?.role === 'admin' && <p>• Admin routes should be accessible</p>}
                  {user?.role === 'employee' && <p>• Employee routes should be accessible</p>}
                  {user?.role === 'user' && <p>• Employee/Admin routes should show access denied</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteTest;
