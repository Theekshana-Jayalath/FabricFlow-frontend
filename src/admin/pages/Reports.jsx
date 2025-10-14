import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  Alert,
  Fade,
  useTheme
} from '@mui/material';
import {
  Analytics,
  People,
  Assessment,
  TrendingUp,
  Download,
  Visibility,
  Schedule,
  BusinessCenter,
  LocalShipping,
  AccountBalance,
  Inventory,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState({});

  // Mock data for report stats
  const reportStats = {
    totalReports: 24,
    generatedToday: 8,
    pendingReports: 3,
    lastGenerated: '2 hours ago'
  };

  // Report categories with their available reports
  const reportCategories = [
    {
      id: 'users',
      title: 'User Management Reports',
      description: 'Comprehensive reports on user activities, registrations, and management',
      icon: <People />,
      color: '#005A54',
      reports: [
        {
          id: 'user_management',
          title: 'Professional User Report',
          description: 'Complete user management data with detailed analytics',
          lastGenerated: '1 hour ago',
          path: '/admin/users',
          action: 'view_and_generate'
        }
      ]
    },
    {
      id: 'employees',
      title: 'Employee Management Reports',
      description: 'Employee data, performance metrics, and workforce analytics',
      icon: <BusinessCenter />,
      color: '#EF6869',
      reports: [
        {
          id: 'employee_management',
          title: 'Professional Employee Report',
          description: 'Detailed employee management and analytics report',
          lastGenerated: '30 minutes ago',
          path: '/admin/employees',
          action: 'view_and_generate'
        },
        {
          id: 'driver_reports',
          title: 'Driver Management Report',
          description: 'Driver performance, delivery metrics, and vehicle assignments',
          lastGenerated: '2 hours ago',
          path: '/admin/sales/drivers',
          action: 'view_and_generate'
        }
      ]
    },
    {
      id: 'finance',
      title: 'Financial Reports',
      description: 'Revenue, expenses, and financial performance analytics',
      icon: <AccountBalance />,
      color: '#2196F3',
      reports: [
        {
          id: 'expense_reports',
          title: 'Expense Analysis Report',
          description: 'Detailed breakdown of company expenses and cost centers',
          lastGenerated: '4 hours ago',
          path: '/admin/finance/reports',
          action: 'navigate'
        },
        {
          id: 'revenue_reports',
          title: 'Revenue Performance Report',
          description: 'Sales performance, revenue trends, and growth metrics',
          lastGenerated: '6 hours ago',
          path: '/admin/finance/reports',
          action: 'navigate'
        }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Reports',
      description: 'Stock levels, material usage, and supply chain analytics',
      icon: <Inventory />,
      color: '#FF9800',
      reports: [
        {
          id: 'inventory_summary',
          title: 'Inventory Summary Report',
          description: 'Current stock levels, material consumption, and procurement needs',
          lastGenerated: '3 hours ago',
          path: '/admin/inventory/reports',
          action: 'navigate'
        },
        {
          id: 'supplier_reports',
          title: 'Supplier Performance Report',
          description: 'Supplier reliability, delivery times, and quality metrics',
          lastGenerated: '5 hours ago',
          path: '/admin/inventory/reports',
          action: 'navigate'
        }
      ]
    },
    {
      id: 'orders',
      title: 'Order Management Reports',
      description: 'Order processing, fulfillment, and customer analytics',
      icon: <Assignment />,
      color: '#9C27B0',
      reports: [
        {
          id: 'order_analytics',
          title: 'Order Analytics Report',
          description: 'Order patterns, fulfillment rates, and customer behavior',
          lastGenerated: '1 hour ago',
          path: '/admin/orders/all',
          action: 'navigate'
        },
        {
          id: 'delivery_reports',
          title: 'Delivery Performance Report',
          description: 'Delivery times, success rates, and logistics performance',
          lastGenerated: '2 hours ago',
          path: '/admin/delivery/management',
          action: 'navigate'
        }
      ]
    }
  ];

  const handleReportAction = async (report) => {
    if (report.action === 'navigate') {
      navigate(report.path);
    } else if (report.action === 'view_and_generate') {
      navigate(report.path);
    } else if (report.action === 'generate') {
      setIsGenerating(prev => ({ ...prev, [report.id]: true }));
      
      // Simulate report generation
      setTimeout(() => {
        setIsGenerating(prev => ({ ...prev, [report.id]: false }));
      }, 2000);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}20`
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ color: '#005A54', fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#005A54', 
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Analytics sx={{ fontSize: 40 }} />
          Reports Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive reporting and analytics for FabricFlow Management System
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Reports"
              value={reportStats.totalReports}
              subtitle="Available report types"
              icon={<Assessment />}
              color="#005A54"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Generated Today"
              value={reportStats.generatedToday}
              subtitle="Reports created today"
              icon={<TrendingUp />}
              color="#EF6869"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Pending Reports"
              value={reportStats.pendingReports}
              subtitle="Awaiting generation"
              icon={<Schedule />}
              color="#FF9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Last Generated"
              value={reportStats.lastGenerated}
              subtitle="Most recent report"
              icon={<Download />}
              color="#2196F3"
            />
          </Grid>
        </Grid>

        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-icon': { color: '#005A54' },
            border: '1px solid #005A54',
            backgroundColor: '#005A5410'
          }}
        >
          All reports are generated in real-time with the latest data. Click on any report card to view details or generate a new report.
        </Alert>
      </Box>

      {/* Report Categories */}
      <Grid container spacing={4}>
        {reportCategories.map((category, categoryIndex) => (
          <Grid item xs={12} key={category.id}>
            <Fade in={true} timeout={500 + categoryIndex * 200}>
              <Card 
                sx={{ 
                  mb: 2,
                  border: `2px solid ${category.color}20`,
                  '&:hover': {
                    boxShadow: `0 8px 25px ${category.color}20`,
                    borderColor: `${category.color}40`
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Category Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: category.color, 
                        mr: 2, 
                        width: 48, 
                        height: 48 
                      }}
                    >
                      {category.icon}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: category.color,
                          mb: 0.5
                        }}
                      >
                        {category.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${category.reports.length} Reports`}
                      sx={{ 
                        ml: 'auto',
                        bgcolor: `${category.color}15`,
                        color: category.color,
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Reports in this category */}
                  <Grid container spacing={2}>
                    {category.reports.map((report, reportIndex) => (
                      <Grid item xs={12} md={6} lg={4} key={report.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: `1px solid ${category.color}20`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 15px ${category.color}20`,
                              borderColor: category.color
                            }
                          }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: '#005A54',
                                mb: 1
                              }}
                            >
                              {report.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mb: 2, minHeight: 40 }}
                            >
                              {report.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                Last generated: {report.lastGenerated}
                              </Typography>
                            </Box>

                            {isGenerating[report.id] && (
                              <LinearProgress 
                                sx={{ 
                                  mb: 2,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: category.color
                                  }
                                }} 
                              />
                            )}
                          </CardContent>
                          
                          <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={report.action === 'navigate' ? <Visibility /> : <Download />}
                              onClick={() => handleReportAction(report)}
                              disabled={isGenerating[report.id]}
                              sx={{
                                bgcolor: category.color,
                                '&:hover': {
                                  bgcolor: `${category.color}dd`,
                                  transform: 'scale(1.02)'
                                }
                              }}
                            >
                              {isGenerating[report.id] 
                                ? 'Generating...' 
                                : report.action === 'navigate' 
                                  ? 'View Reports' 
                                  : 'Generate Report'
                              }
                            </Button>
                            
                            <Chip 
                              size="small"
                              label="Available"
                              sx={{ 
                                bgcolor: `${category.color}15`,
                                color: category.color,
                                fontWeight: 'bold'
                              }}
                            />
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Footer Note */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Reports are automatically updated with real-time data. For custom reports or additional analytics, 
          contact the system administrator.
        </Typography>
      </Box>
    </Container>
  );
};

export default Reports;