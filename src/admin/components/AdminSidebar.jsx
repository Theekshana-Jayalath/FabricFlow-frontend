import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard,
  Description,
  Widgets,
  TableChart,
  Map,
  BarChart,
  People,
  ExpandLess,
  ExpandMore,
  TableRows,
  DataObject
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
  const [pagesOpen, setPagesOpen] = useState(true);
  const [tablesOpen, setTablesOpen] = useState(true);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard'
    },
    {
      text: 'Pages',
      icon: <Description />,
      hasDropdown: true,
      isOpen: pagesOpen,
      onClick: () => setPagesOpen(!pagesOpen),
      subItems: [
        { text: 'User Management', path: '/admin/users' },
        { text: 'Employee Management', path: '/admin/employees' },
      ]
    },
    {
      text: 'Components',
      icon: <Widgets />,
      path: '/admin/components'
    },
    {
      text: 'Forms',
      icon: <Description />,
      path: '/admin/forms'
    },
    {
      text: 'Tables',
      icon: <TableChart />,
      hasDropdown: true,
      isOpen: tablesOpen,
      onClick: () => setTablesOpen(!tablesOpen),
      subItems: [
        { text: 'Regular Tables', path: '/admin/tables/regular', icon: 'RT' },
        { text: 'Extended Tables', path: '/admin/tables/extended', icon: 'ET' },
        { text: 'DataTables.Net', path: '/admin/tables/datatables', icon: 'DT' }
      ]
    },
    {
      text: 'Maps',
      icon: <Map />,
      path: '/admin/maps'
    },
    {
      text: 'Widgets',
      icon: <Widgets />,
      path: '/admin/widgets'
    },
    {
      text: 'Charts',
      icon: <BarChart />,
      path: '/admin/charts'
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
