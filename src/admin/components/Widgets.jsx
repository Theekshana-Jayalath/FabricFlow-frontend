import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Notifications,
  Star,
  MoreVert,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';

const Widgets = () => {
  const StatWidget = ({ title, value, change, isPositive, icon: Icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#005A54' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isPositive ? (
                <TrendingUp sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                sx={{ color: isPositive ? '#4caf50' : '#f44336' }}
              >
                {change}%
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: color }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const ProgressWidget = ({ title, value, max, color, description }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" sx={{ color: '#005A54', mb: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#005A54' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            / {max}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(value / max) * 100} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(0, 90, 84, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color
            }
          }} 
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const NotificationWidget = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ color: '#005A54' }}>
            Notifications
          </Typography>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>
        <List sx={{ p: 0 }}>
          <ListItem sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                <CheckCircle sx={{ fontSize: 18 }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Order completed"
              secondary="2 minutes ago"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                <Warning sx={{ fontSize: 18 }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Low inventory alert"
              secondary="1 hour ago"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#f44336', width: 32, height: 32 }}>
                <Error sx={{ fontSize: 18 }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Payment failed"
              secondary="3 hours ago"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
        <Button 
          fullWidth 
          size="small" 
          sx={{ 
            mt: 1,
            color: '#005A54',
            '&:hover': {
              backgroundColor: 'rgba(0, 90, 84, 0.04)'
            }
          }}
        >
          View All
        </Button>
      </CardContent>
    </Card>
  );

  const TaskWidget = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" sx={{ color: '#005A54', mb: 2 }}>
          Today's Tasks
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Complete project review</Typography>
            <Chip label="High" size="small" sx={{ bgcolor: '#EF6869', color: 'white' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Update employee records</Typography>
            <Chip label="Medium" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Prepare monthly report</Typography>
            <Chip label="Low" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={65} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: 'rgba(0, 90, 84, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#005A54'
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          65% completed today
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#005A54', fontWeight: 'bold' }}>
          Widgets
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Interactive components for your dashboard
        </Typography>
      </Box>

      {/* Widgets Grid */}
      <Grid container spacing={3}>
        {/* Stat Widgets Row */}
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Total Sales"
            value="$24,500"
            change={12.5}
            isPositive={true}
            icon={AttachMoney}
            color="#005A54"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="New Users"
            value="1,245"
            change={8.2}
            isPositive={true}
            icon={People}
            color="#EF6869"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Orders"
            value="342"
            change={-3.1}
            isPositive={false}
            icon={ShoppingCart}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Revenue"
            value="$18,430"
            change={15.7}
            isPositive={true}
            icon={TrendingUp}
            color="#4caf50"
          />
        </Grid>

        {/* Progress Widgets Row */}
        <Grid item xs={12} md={6}>
          <ProgressWidget
            title="Monthly Goal"
            value={75}
            max={100}
            color="#005A54"
            description="Target achievement for this month"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProgressWidget
            title="Project Completion"
            value={8}
            max={12}
            color="#EF6869"
            description="Active projects completed"
          />
        </Grid>

        {/* Special Widgets */}
        <Grid item xs={12} md={6}>
          <NotificationWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <TaskWidget />
        </Grid>

        {/* Performance Widget */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ color: '#005A54', mb: 3 }}>
                Performance Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: '#005A54', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                      <People sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                      2,847
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: '#EF6869', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                      <ShoppingCart sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                      1,524
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: '#ff9800', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                      <Star sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                      4.8
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                      <AttachMoney sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                      $52K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Widgets;
