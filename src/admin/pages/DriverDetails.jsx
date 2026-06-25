import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Divider, Grid, Button, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await axios.get(`/api/drivers/${id}`);
        setDriver(res.data.data);
      } catch (err) {
        setError('Failed to fetch driver details');
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!driver) return <Typography>No driver found.</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fa', py: 6, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Paper elevation={8} sx={{ maxWidth: 650, width: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: 10 }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'teal.700', background: 'linear-gradient(90deg, #00695f 0%, #00897b 100%)', color: 'white', p: 3, display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
          <InfoOutlinedIcon fontSize="large" sx={{ mr: 1 }} />
          <Typography variant="h5" fontWeight={700} letterSpacing={1} flex={1}>Driver Details</Typography>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Section Title */}
        <Box sx={{ p: 3, pt: 2 }}>
          <Typography variant="h6" fontWeight={700} color="teal" mb={2} display="flex" alignItems="center" gap={1}>
            <PersonIcon fontSize="medium" /> Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Driver ID" value={driver.driverId} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="First Name" value={driver.firstName} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Last Name" value={driver.lastName} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Contact" value={driver.contact} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="NIC" value={driver.nic} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="License No" value={driver.licenseNo} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><AssignmentIndIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Address" value={driver.address} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Status" value={driver.status} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Created" value={new Date(driver.createdAt).toLocaleString()} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><CalendarTodayIcon /></InputAdornment> }} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label="Updated" value={new Date(driver.updatedAt).toLocaleString()} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><CalendarTodayIcon /></InputAdornment> }} margin="dense" />
            </Grid>
          </Grid>
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}>
              CLOSE
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default DriverDetails;
