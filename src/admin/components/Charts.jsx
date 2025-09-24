import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper
} from '@mui/material';
import {
  BarChart,
  PieChart,
  ShowChart,
  DonutLarge,
  Timeline,
  TrendingUp
} from '@mui/icons-material';

const Charts = () => {
  const ChartCard = ({ title, icon: Icon, color, description }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="h6" component="h3" sx={{ color: '#005A54' }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            height: 200, 
            backgroundColor: '#FFEED6',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(0, 90, 84, 0.3)'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Icon sx={{ fontSize: 40, color: color, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Chart visualization will be rendered here
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#005A54', fontWeight: 'bold' }}>
          Charts
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Visualize your data with beautiful charts and graphs
        </Typography>
      </Box>

      {/* Chart Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Bar Chart"
            icon={BarChart}
            color="#005A54"
            description="Display data in vertical bars"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Line Chart"
            icon={ShowChart}
            color="#EF6869"
            description="Show trends over time"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Pie Chart"
            icon={PieChart}
            color="#ff9800"
            description="Display data distribution"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Donut Chart"
            icon={DonutLarge}
            color="#4caf50"
            description="Enhanced pie chart visualization"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Area Chart"
            icon={Timeline}
            color="#9c27b0"
            description="Show data with filled areas"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Trend Analysis"
            icon={TrendingUp}
            color="#f44336"
            description="Analyze business trends"
          />
        </Grid>
      </Grid>

      {/* Chart Integration Info */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" component="h3" sx={{ color: '#005A54', mb: 2 }}>
            Chart Integration
          </Typography>
          <Typography variant="body1" paragraph>
            To integrate actual charts, you can use libraries like:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Chart.js</strong> - Simple yet flexible JavaScript charting
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Recharts</strong> - React components for charts built with D3
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Victory</strong> - React components for modular charting
            </Typography>
            <Typography component="li" variant="body2">
              <strong>ApexCharts</strong> - Modern charting library
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Charts;
