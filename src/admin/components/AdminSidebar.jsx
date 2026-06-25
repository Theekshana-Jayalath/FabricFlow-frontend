import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard,
  AdminPanelSettings,
  AccountBalance,
  Inventory,
  TrendingUp,
  ExpandLess,
  ExpandMore,
  People,
  Assessment,
  LocalShipping,
  Analytics,
  ShoppingCart,
  Assignment
} from '@mui/icons-material';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Avatar
} from '@mui/material';

const AdminSidebar = ({ drawerWidth = 280 }) => {
  const location = useLocation();
  const [administrationOpen, setAdministrationOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [salesDistributionOpen, setSalesDistributionOpen] = useState(false);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard'
    },
    {
      text: 'Administration',
      icon: <AdminPanelSettings />,
      hasDropdown: true,
      isOpen: administrationOpen,
      onClick: () => setAdministrationOpen(!administrationOpen),
      subItems: [
        { text: 'User Management', path: '/admin/users', icon: <People /> },
        { text: 'Employee Management', path: '/admin/employees', icon: <People /> },
        { text: 'System Settings', path: '/admin/settings', icon: <AdminPanelSettings /> }
      ]
    },
    {
      text: 'Orders',
      icon: <ShoppingCart />,
      hasDropdown: true,
      isOpen: ordersOpen,
      onClick: () => setOrdersOpen(!ordersOpen),
      subItems: [
        { text: 'All Orders', path: '/admin/orders/all', icon: <ShoppingCart /> }
      ]
    },
    {
      text: 'Finance',
      icon: <AccountBalance />,
      hasDropdown: true,
      isOpen: financeOpen,
      onClick: () => setFinanceOpen(!financeOpen),
      subItems: [
        { text: 'Financial Overview', path: '/admin/finance/overview', icon: <Assessment /> },
        { text: 'Revenue Reports', path: '/admin/finance/revenue', icon: <TrendingUp /> },
        { text: 'Expense Tracking', path: '/admin/finance/expenses', icon: <AccountBalance /> },
        { text: 'Budget Planning', path: '/admin/finance/budget', icon: <Analytics /> }
      ]
    },
    {
      text: 'Inventory',
      icon: <Inventory />,
      hasDropdown: true,
      isOpen: inventoryOpen,
      onClick: () => setInventoryOpen(!inventoryOpen),
      subItems: [
        { text: 'Stock Management', path: '/admin/inventory/stock', icon: <Inventory /> },
        { text: 'Material Tracking', path: '/admin/inventory/materials', icon: <Inventory /> },
        { text: 'Quality Control', path: '/admin/inventory/quality', icon: <Assessment /> },
        { text: 'Supplier Management', path: '/admin/inventory/suppliers', icon: <People /> }
      ]
    },
    {
      text: 'Sales & Distribution',
      icon: <TrendingUp />,
      hasDropdown: true,
      isOpen: salesDistributionOpen,
      onClick: () => setSalesDistributionOpen(!salesDistributionOpen),
      subItems: [
        { text: 'All Drivers', path: '/admin/sales/drivers', icon: <Analytics /> },
        { text: 'Vehicle Management', path: '/admin/sales/vehicles', icon: <LocalShipping /> },
        { text: 'Delivery Management', path: '/admin/delivery/management', icon: <LocalShipping /> },
        { text: 'All Delivery Orders', path: '/admin/orders/all-delivery-orders', icon: <Assignment /> },
        { text: 'Asign Orders', path: '/admin/sales/asignOrders', icon: <People /> },
        
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#005A54',
          color: '#FFEED6',
          border: 'none'
        },
      }}
    >
      <Box sx={{ height: '100%' }}>
        {/* Header with logo and user */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 238, 214, 0.2)' }}>
          <Typography variant="h6" sx={{ color: '#FFEED6', fontWeight: 'bold', mb: 2 }}>
            FABRICFLOW ADMIN
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#EF6869',
                mr: 2,
                fontSize: '14px'
              }}
            >
              <People />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: '#FFEED6', fontWeight: 500 }}>
                Admin User
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 238, 214, 0.7)' }}>
                Administrator
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton
                  component={item.hasDropdown ? 'div' : Link}
                  to={!item.hasDropdown ? item.path : undefined}
                  onClick={item.onClick}
                  sx={{
                    py: 1.5,
                    px: 3,
                    color: isActive(item.path) ? '#EF6869' : '#FFEED6',
                    bgcolor: isActive(item.path) ? 'rgba(239, 104, 105, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 238, 214, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: isActive(item.path) ? 600 : 500
                    }}
                  />
                  {item.hasDropdown && (
                    item.isOpen ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {/* Submenu items */}
              {item.hasDropdown && (
                <Collapse in={item.isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem, subIndex) => (
                      <ListItem key={subIndex} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={subItem.path}
                          sx={{
                            py: 1,
                            pl: 7,
                            pr: 3,
                            color: isActive(subItem.path) ? '#EF6869' : 'rgba(255, 238, 214, 0.8)',
                            bgcolor: isActive(subItem.path) ? 'rgba(239, 104, 105, 0.1)' : 'transparent',
                            '&:hover': {
                              bgcolor: 'rgba(255, 238, 214, 0.1)',
                            }
                          }}
                        >
                          {subItem.icon && (
                            <Box
                              sx={{
                                minWidth: 32,
                                height: 20,
                                bgcolor: isActive(subItem.path) ? '#EF6869' : 'rgba(255, 238, 214, 0.3)',
                                color: isActive(subItem.path) ? 'white' : '#005A54',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                mr: 2
                              }}
                            >
                              {subItem.icon}
                            </Box>
                          )}
                          <ListItemText 
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontSize: '13px',
                              fontWeight: isActive(subItem.path) ? 600 : 400
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
