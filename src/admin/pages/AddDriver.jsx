import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddDriver = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    driverId: '',
    firstName: '',
    lastName: '',
    address: '',
    contact: '',
    licenseNo: '',
    nic: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // Basic client-side validation
      const requiredFields = ['driverId','firstName','lastName','address','contact','licenseNo'];
      const missing = requiredFields.filter(f => !String(form[f] || '').trim());
      if (missing.length) {
        setError(`Please fill required fields: ${missing.join(', ')}`);
        setSubmitting(false);
        return;
      }

      const payload = {
        driverId: form.driverId.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        address: form.address.trim(),
        contact: form.contact.trim(),
        licenseNo: form.licenseNo.trim(),
        nic: form.nic?.trim() || undefined,
        status: form.status
      };

      const res = await axios.post('/api/drivers', payload);
      if (res.data.success) {
        setSuccess('Driver added successfully');
        setTimeout(() => navigate('/admin/sales/drivers'), 800);
      } else {
        setError(res.data.message || 'Failed to add driver');
      }
    } catch (err) {
      // Surface detailed backend validation/duplicate error if present
      const backendDetail = err.response?.data?.error || err.response?.data?.message;
      setError(backendDetail || err.message || 'Failed to add driver');
      console.error('Add driver error:', err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="#005A54">
        Add Driver
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Driver ID" name="driverId" value={form.driverId} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" name="address" value={form.address} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact" name="contact" value={form.contact} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="License No" name="licenseNo" value={form.licenseNo} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="NIC" name="nic" value={form.nic} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => navigate('/admin/sales/drivers')}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: '#005A54', '&:hover': { bgcolor: '#004d47' } }}>
                  {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Add Driver'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddDriver;


