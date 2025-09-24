import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Nav() {
  const location = useLocation();
  const { user, isAuthenticated, logout, getDisplayName, getInitials } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = user?.role;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items for different user types
  const publicNavItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/about', label: 'About Us', icon: '📖' },
    { path: '/services', label: 'Services', icon: '⚙️' },
    { path: '/features', label: 'Features', icon: '✨' },
    { path: '/contact', label: 'Contact', icon: '📞' },
  ];

  const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders', label: 'My Orders', icon: '📦' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const employeeNavItems = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/employee/tasks', label: 'Tasks', icon: '✅' },
    { path: '/employee/production', label: 'Production', icon: '🏭' },
    { path: '/employee/quality', label: 'Quality Control', icon: '🔍' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Admin Panel', icon: '🛠️' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/employees', label: 'Employees', icon: '👷' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const getNavItems = () => {
    if (!isAuthenticated) {
      return publicNavItems;
    }
    
    // For logged-in users, combine public items with role-specific items
    const roleSpecificItems = (() => {
      switch (userRole) {
        case 'admin':
          return adminNavItems;
        case 'employee':
          return employeeNavItems;
        case 'user':
          return userNavItems;
        default:
          return [];
      }
    })();

    // Combine public navigation with role-specific items
    return [
      ...publicNavItems,
      // Add a separator if there are role-specific items
      ...(roleSpecificItems.length > 0 ? [{ path: 'separator', label: '---', icon: '' }] : []),
      ...roleSpecificItems
    ];
  };

  const isActivePath = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-[#005A54] sticky top-0 z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-[#005A54] to-[#EF6869] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg">FF</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#005A54] to-[#EF6869] bg-clip-text text-transparent">
                  FabricFlow
                </span>
                <p className="text-xs text-gray-500 -mt-1">Apparel Management</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {getNavItems().map((item, index) => {
                // Handle separator
                if (item.path === 'separator') {
                  return (
                    <div key={index} className="px-2 text-gray-400 text-sm">
                      |
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                      isActivePath(item.path)
                        ? 'bg-[#005A54] text-white shadow-md'
                        : 'text-gray-700 hover:bg-[#FFEED6] hover:text-[#005A54]'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-[#005A54] hover:text-[#EF6869] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#EF6869] hover:bg-[#005A54] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4 bg-gray-50 rounded-lg px-3 py-2">
                {/* Role Icon */}
                <div className="flex items-center space-x-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    user?.role === 'admin' ? 'bg-red-500' : 
                    user?.role === 'employee' ? 'bg-blue-500' : 
                    'bg-green-500'
                  }`}>
                    {user?.role === 'admin' ? '👑' : 
                     user?.role === 'employee' ? '👷' : 
                     '👤'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900 font-medium whitespace-nowrap">
                      {getDisplayName()}
                    </span>
                    <span className={`text-xs font-medium capitalize ${
                      user?.role === 'admin' ? 'text-red-600' : 
                      user?.role === 'employee' ? 'text-blue-600' : 
                      'text-green-600'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <button 
                  onClick={logout}
                  className="flex items-center space-x-1 text-[#EF6869] hover:text-[#005A54] text-sm font-medium transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-100"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#005A54] hover:text-[#EF6869] hover:bg-[#FFEED6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#005A54] transition-colors duration-200"
            >
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-2 ${
                isActivePath(item.path)
                  ? 'bg-[#005A54] text-white'
                  : 'text-gray-700 hover:bg-[#FFEED6] hover:text-[#005A54]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Mobile Auth Buttons */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-[#005A54] hover:bg-[#FFEED6] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-[#EF6869] text-white hover:bg-[#005A54] transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center px-3 py-2 space-x-2">
                  <div className="w-8 h-8 bg-[#FFEED6] rounded-full flex items-center justify-center">
                    <span className="text-[#005A54] font-semibold text-sm">
                      {getInitials()}
                    </span>
                  </div>
                  <span className="text-base text-gray-700 font-medium">
                    {getDisplayName()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#EF6869] hover:bg-[#FFEED6] transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;