import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  ViewModule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const AdminHeader = ({ drawerWidth = 280 }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationOpen = Boolean(notificationAnchor);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: '#FFEED6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0, 90, 84, 0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Page title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              color: '#005A54', 
              fontWeight: 600,
              mr: 2
            }}
          >
            Extended Tables
          </Typography>
        </Box>

        {/* Right side - Icons and profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Grid view toggle */}
          <IconButton
            size="large"
            aria-label="view modules"
            color="inherit"
            sx={{ color: '#005A54' }}
          >
            <ViewModule />
          </IconButton>

          {/* Notifications */}
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ color: '#005A54' }}
          >
            <Badge badgeContent={3} sx={{ '& .MuiBadge-badge': { bgcolor: '#EF6869', color: 'white' } }}>
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#EF6869',
                fontSize: '14px',
                color: 'white'
              }}
            >
              AU
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          id="primary-search-account-menu"
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': {
              minWidth: 200,
              mt: 1,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#005A54' }}>
              Admin User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrator
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <AccountCircle sx={{ mr: 2, color: '#005A54' }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Settings sx={{ mr: 2, color: '#005A54' }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <Logout sx={{ mr: 2, color: '#EF6869' }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isNotificationOpen}
          onClose={handleNotificationClose}
          sx={{
            '& .MuiPaper-root': {
              minWidth: 300,
              mt: 1,
              maxHeight: 400,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#005A54' }}>
              Notifications
            </Typography>
          </Box>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                New user registered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                2 minutes ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Employee updated profile
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 hour ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                System backup completed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3 hours ago
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
