import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand */}
        <Link to="/" className="nav-logo">
          <div className="logo-content">
            <span className="logo-icon">🧵</span>
            <span className="logo-text">FabricFlow</span>
          </div>
        </Link>
        
        {/* Navigation Menu */}
        <ul className="nav-menu">
          <li className={`nav-item ${location.pathname === '/' || location.pathname === '/home' ? 'active' : ''}`}>
            <Link to="/" className="nav-link">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          
          <li className={`nav-item ${location.pathname === '/employees' ? 'active' : ''}`}>
            <Link to="/employees" className="nav-link">
              <i className="fas fa-users"></i>
              <span>Employees</span>
            </Link>
          </li>
          
          <li className={`nav-item ${location.pathname === '/adduser' ? 'active' : ''}`}>
            <Link to="/adduser" className="nav-link">
              <i className="fas fa-user-plus"></i>
              <span>Add User</span>
            </Link>
          </li>
          
          <li className={`nav-item ${location.pathname === '/userdetails' ? 'active' : ''}`}>
            <Link to="/userdetails" className="nav-link">
              <i className="fas fa-id-card"></i>
              <span>User Details</span>
            </Link>
          </li>
          
          <li className={`nav-item ${location.pathname === '/production' ? 'active' : ''}`}>
            <Link to="/production" className="nav-link">
              <i className="fas fa-industry"></i>
              <span>Production</span>
            </Link>
          </li>
          
          <li className={`nav-item ${location.pathname === '/inventory' ? 'active' : ''}`}>
            <Link to="/inventory" className="nav-link">
              <i className="fas fa-boxes"></i>
              <span>Inventory</span>
            </Link>
          </li>
          
          <li className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}>
            <Link to="/reports" className="nav-link">
              <i className="fas fa-chart-bar"></i>
              <span>Reports</span>
            </Link>
          </li>
        </ul>

        {/* User Profile Section */}
        <div className="nav-profile">
          <div className="profile-dropdown">
            <button className="profile-btn">
              <i className="fas fa-user-circle"></i>
              <span>Admin</span>
              <i className="fas fa-chevron-down"></i>
            </button>
            <div className="dropdown-content">
              <Link to="/profile" className="dropdown-link">
                <i className="fas fa-user"></i> Profile
              </Link>
              <Link to="/settings" className="dropdown-link">
                <i className="fas fa-cog"></i> Settings
              </Link>
              <hr className="dropdown-divider" />
              <button className="dropdown-link logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
