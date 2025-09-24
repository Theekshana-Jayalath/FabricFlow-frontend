import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminLayout = () => {
  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <AdminSidebar drawerWidth={drawerWidth} />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
          bgcolor: '#f8fafc'
        }}
      >
        {/* Header */}
        <AdminHeader drawerWidth={drawerWidth} />
        
        {/* Page content */}
        <Box
          sx={{
            mt: 8, // Account for AppBar height
            p: 3,
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
