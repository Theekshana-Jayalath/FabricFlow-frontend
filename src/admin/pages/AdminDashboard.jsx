import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People,
  Work,
  ShoppingBag,
  TrendingUp,
  Notifications,
  CheckCircle,
  Schedule,
  Person,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Logout
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';

const AdminDashboard = () => {
  const { logout, getDisplayName } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    avgAge: 0,
    maleUsers: 0,
    femaleUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [departmentData, setDepartmentData] = useState([]);

  // Sample chart data
  const revenueData = [
    { month: 'Jan', revenue: 12000, users: 45, employees: 12 },
    { month: 'Feb', revenue: 19000, users: 68, employees: 15 },
    { month: 'Mar', revenue: 15000, users: 52, employees: 18 },
    { month: 'Apr', revenue: 25000, users: 78, employees: 22 },
    { month: 'May', revenue: 22000, users: 85, employees: 25 },
    { month: 'Jun', revenue: 30000, users: 95, employees: 28 }
  ];

  const genderData = [
    { name: 'Male', value: 0, color: '#005A54' },
    { name: 'Female', value: 0, color: '#EF6869' },
    { name: 'Other', value: 0, color: '#FFEED6' }
  ];

  // Fetch statistics
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000); // Add a brief delay for better UX
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and employees in parallel
      const [usersResponse, employeesResponse] = await Promise.all([
        axios.get('http://localhost:5000/users').catch(() => ({ data: { users: [] } })),
        axios.get('http://localhost:5000/employees').catch(() => ({ data: { employees: [] } }))
      ]);

      const users = usersResponse.data?.users || usersResponse.data || [];
      const employees = employeesResponse.data?.employees || employeesResponse.data || [];

      // Calculate real statistics
      const activeEmployees = employees.filter(emp => emp.status?.toLowerCase() === 'active').length;
      const maleUsers = users.filter(user => user.gender?.toLowerCase() === 'male').length;
      const femaleUsers = users.filter(user => user.gender?.toLowerCase() === 'female').length;
      
      // Calculate average age
      const usersWithAge = users.filter(user => user.age && user.age > 0);
      const avgAge = usersWithAge.length > 0 
        ? Math.round(usersWithAge.reduce((sum, user) => sum + user.age, 0) / usersWithAge.length)
        : 0;

      setStats({
        totalUsers: users.length,
        totalEmployees: employees.length,
        activeEmployees: activeEmployees,
        avgAge: avgAge,
        maleUsers: maleUsers,
        femaleUsers: femaleUsers,
        totalOrders: 152, // Keep this as sample data since it's not in your backend
        revenue: 24500 // Keep this as sample data since it's not in your backend
      });

      // Update gender data for pie chart
      genderData[0].value = maleUsers;
      genderData[1].value = femaleUsers;
      genderData[2].value = users.length - maleUsers - femaleUsers;

      // Calculate real department distribution from employee data
      const departmentCounts = {};
      const colors = ['#005A54', '#EF6869', '#4CAF50', '#FF9800', '#9C27B0', '#FF5722'];
      
      employees.forEach(emp => {
        const dept = emp.department || emp.jobPosition || 'Other';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      const realDepartmentData = Object.entries(departmentCounts).map(([name, count], index) => ({
        name,
        employees: count,
        value: count, // For pie chart
        color: colors[index % colors.length]
      }));

      setDepartmentData(realDepartmentData);

      // Generate recent activity from real data
      const activity = generateRecentActivity(users, employees);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate recent activity from real data
  const generateRecentActivity = (users, employees) => {
    const activities = [];
    
    // Add recent users (latest 3)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
    
    recentUsers.forEach((user, index) => {
      activities.push({
        id: `user-${user._id}`,
        user: user.name,
        action: 'Registered as new user',
        time: user.createdAt ? formatTimeAgo(user.createdAt) : `${(index + 1) * 2} hours ago`,
        type: 'profile',
        avatar: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
      });
    });

    // Add recent employees (latest 2)
    const recentEmployees = employees
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 2);
    
    recentEmployees.forEach((emp, index) => {
      activities.push({
        id: `emp-${emp._id}`,
        user: emp.empName,
        action: `Added as ${emp.jobPosition || 'employee'}`,
        time: emp.createdAt ? formatTimeAgo(emp.createdAt) : `${(index + 4) * 2} hours ago`,
        type: 'employee',
        avatar: emp.empName ? emp.empName.split(' ').map(n => n[0]).join('').toUpperCase() : 'E'
      });
    });

    // If no real data, show placeholder
    if (activities.length === 0) {
      return [
        {
          id: 1,
          user: 'System',
          action: 'Dashboard initialized',
          time: '1 hour ago',
          type: 'system',
          avatar: 'SY'
        }
      ];
    }

    return activities.slice(0, 4); // Show max 4 activities
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const StatCard = ({ title, value, icon: Icon, color, progress, suffix = '', trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}18 100%)`,
        border: `1px solid ${color}20`,
        '&:hover': {
          boxShadow: `0 10px 25px ${color}25`,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Typography variant="h3" component="div" sx={{ 
                  fontWeight: 'bold', 
                  color: color,
                  mb: 1,
                  fontSize: { xs: '1.8rem', sm: '2.2rem' }
                }}>
                  {loading ? '...' : value}{suffix}
                </Typography>
              </motion.div>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                {title}
              </Typography>
              
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {trend === 'up' ? (
                    <ArrowUpward sx={{ color: '#4CAF50', fontSize: 16, mr: 0.5 }} />
                  ) : (
                    <ArrowDownward sx={{ color: '#F44336', fontSize: 16, mr: 0.5 }} />
                  )}
                  <Typography variant="caption" sx={{ 
                    color: trend === 'up' ? '#4CAF50' : '#F44336',
                    fontWeight: 600
                  }}>
                    {trendValue}% {trend === 'up' ? 'increase' : 'decrease'}
                  </Typography>
                </Box>
              )}

              {progress && (
                <Box sx={{ mt: 2 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: `${color}15`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: color,
                          borderRadius: 4
                        }
                      }} 
                    />
                  </motion.div>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                    {progress}% of target
                  </Typography>
                </Box>
              )}
            </Box>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Avatar sx={{ 
                bgcolor: color, 
                width: 64, 
                height: 64,
                boxShadow: `0 8px 16px ${color}40`
              }}>
                <Icon sx={{ fontSize: 32 }} />
              </Avatar>
            </motion.div>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag sx={{ color: '#EF6869' }} />;
      case 'profile':
        return <Person sx={{ color: '#005A54' }} />;
      case 'project':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'employee':
        return <Work sx={{ color: '#EF6869' }} />;
      case 'system':
        return <Notifications sx={{ color: '#ff9800' }} />;
      default:
        return <Notifications sx={{ color: '#005A54' }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {/* Enhanced Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ 
                color: '#005A54', 
                fontWeight: 'bold',
                mb: 1,
                background: 'linear-gradient(45deg, #005A54 30%, #EF6869 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
              }}>
                Welcome to Admin Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Manage your FabricFlow system efficiently
              </Typography>
            </Box>
            
            {/* Logout Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" color="text.secondary">
                  Signed in as
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#005A54' }}>
                  {getDisplayName()}
                </Typography>
              </Box>
              <Tooltip title="Refresh Dashboard">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: '#EF6869',
                    color: 'white',
                    '&:hover': { bgcolor: '#d45456' },
                    '&:disabled': { bgcolor: 'rgba(239, 104, 105, 0.3)' }
                  }}
                >
                  <motion.div
                    animate={{ rotate: refreshing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                  >
                    <Refresh />
                  </motion.div>
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  startIcon={<Logout />}
                  sx={{
                    color: '#005A54',
                    borderColor: '#005A54',
                    '&:hover': {
                      backgroundColor: '#005A54',
                      color: 'white',
                      borderColor: '#005A54'
                    }
                  }}
                >
                  Logout
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={People}
              color="#005A54"
              progress={75}
              trend="up"
              trendValue={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={Work}
              color="#EF6869"
              progress={60}
              trend="up"
              trendValue={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Employees"
              value={stats.activeEmployees}
              icon={Work}
              color="#4CAF50"
              progress={stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}
              trend="down"
              trendValue={3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Age"
              value={stats.avgAge > 0 ? stats.avgAge : 'N/A'}
              suffix={stats.avgAge > 0 ? ' yrs' : ''}
              icon={People}
              color="#9C27B0"
              progress={stats.avgAge > 0 ? Math.min(Math.round((stats.avgAge / 80) * 100), 100) : 0}
              trend="up"
              trendValue={5}
            />
          </Grid>
        </Grid>

        {/* Interactive Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card sx={{ 
                height: 400,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ color: '#005A54', fontWeight: 'bold' }}>
                      Monthly Analytics
                    </Typography>
                    <Chip label="Revenue Trend" color="primary" variant="outlined" />
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#005A54" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#005A54" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #005A54',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#005A54" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Gender Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card sx={{ 
                height: 400,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
              }}>
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#005A54', fontWeight: 'bold' }}>
                    User Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: stats.maleUsers, color: '#005A54' },
                          { name: 'Female', value: stats.femaleUsers, color: '#EF6869' },
                          { name: 'Other', value: Math.max(0, stats.totalUsers - stats.maleUsers - stats.femaleUsers), color: '#9C27B0' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Male', value: stats.maleUsers, color: '#005A54' },
                          { name: 'Female', value: stats.femaleUsers, color: '#EF6869' },
                          { name: 'Other', value: Math.max(0, stats.totalUsers - stats.maleUsers - stats.femaleUsers), color: '#9C27B0' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#005A54', borderRadius: '50%' }} />
                      <Typography variant="caption">Male ({stats.maleUsers})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#EF6869', borderRadius: '50%' }} />
                      <Typography variant="caption">Female ({stats.femaleUsers})</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Enhanced Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card sx={{ 
                height: 400,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
              }}>
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#005A54', fontWeight: 'bold' }}>
                    Recent Activity
                  </Typography>
                  <List sx={{ maxHeight: 280, overflow: 'auto' }}>
                    <AnimatePresence>
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListItem 
                            sx={{ 
                              px: 0,
                              '&:hover': { 
                                backgroundColor: 'rgba(0, 90, 84, 0.04)',
                                borderRadius: 2,
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: '#FFEED6', 
                                color: '#005A54',
                                border: '2px solid #005A54'
                              }}>
                                {activity.avatar}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getActivityIcon(activity.type)}
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {activity.user}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {activity.action}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <Schedule sx={{ fontSize: 12 }} />
                                    {activity.time}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </List>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ 
                      mt: 2,
                      borderColor: '#005A54',
                      color: '#005A54',
                      '&:hover': {
                        borderColor: '#005A54',
                        backgroundColor: 'rgba(0, 90, 84, 0.04)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Department Stats */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card sx={{ 
                height: 400,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
              }}>
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#005A54', fontWeight: 'bold' }}>
                    Employee Distribution by Department
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="employees"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #005A54',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {departmentData.map((dept, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: dept.color, borderRadius: '50%' }} />
                        <Typography variant="caption">{dept.name} ({dept.employees})</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 3, color: '#005A54' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<People />}
                    sx={{
                      bgcolor: '#005A54',
                      '&:hover': { bgcolor: '#004A44' },
                      py: 1.5
                    }}
                  >
                    Add New User
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Work />}
                    sx={{
                      bgcolor: '#EF6869',
                      '&:hover': { bgcolor: '#d55859' },
                      py: 1.5
                    }}
                  >
                    Add Employee
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingBag />}
                    sx={{
                      borderColor: '#005A54',
                      color: '#005A54',
                      '&:hover': {
                        borderColor: '#005A54',
                        backgroundColor: 'rgba(0, 90, 84, 0.04)'
                      },
                      py: 1.5
                    }}
                  >
                    View Orders
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    sx={{
                      borderColor: '#EF6869',
                      color: '#EF6869',
                      '&:hover': {
                        borderColor: '#EF6869',
                        backgroundColor: 'rgba(239, 104, 105, 0.04)'
                      },
                      py: 1.5
                    }}
                  >
                    View Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </motion.div>
  );
};

export default AdminDashboard;
