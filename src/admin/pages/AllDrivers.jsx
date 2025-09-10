
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Divider, Grid, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const AllDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  // For details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [detailsDriver, setDetailsDriver] = useState(null);


  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get('/api/drivers/allDrivers');
        setDrivers(res.data.data || []);
        console.log(res)
      } catch (err) {
        if (err.response) {
          setError(err.response.data?.message || 'Failed to fetch drivers');
        } else if (err.request) {
          setError('No response from server. Please check your backend connection.');
        } else {
          setError('Error: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // Modal open handler
  const handleView = (driver) => {
    setSelectedDriver(driver);
    setEditDriver({ ...driver });
    setModalOpen(true);
  };

  // Modal close handler
  const handleClose = () => {
    setModalOpen(false);
    setSelectedDriver(null);
    setEditDriver(null);
    setModalLoading(false);
  };

  // Update driver handler
  const handleUpdate = async () => {
    setModalLoading(true);
    try {
      await axios.put(`/api/drivers/${editDriver._id}`, editDriver);
      setDrivers((prev) => prev.map((d) => (d._id === editDriver._id ? { ...editDriver } : d)));
      handleClose();
    } catch (err) {
      alert('Failed to update driver');
    } finally {
      setModalLoading(false);
    }
  };

  // Set inactive handler
  const handleSetInactive = async () => {
    setModalLoading(true);
    try {
      await axios.put(`/api/drivers/${editDriver._id}`, { ...editDriver, status: 'inactive' });
      setDrivers((prev) => prev.map((d) => (d._id === editDriver._id ? { ...editDriver, status: 'inactive' } : d)));
      handleClose();
    } catch (err) {
      alert('Failed to set inactive');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete driver handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    setModalLoading(true);
    try {
      await axios.delete(`/api/drivers/${editDriver._id}`);
      setDrivers((prev) => prev.filter((d) => d._id !== editDriver._id));
      handleClose();
    } catch (err) {
      alert('Failed to delete driver');
    } finally {
      setModalLoading(false);
    }
  };

  // Handler for opening details modal
  const handleSeeMore = async (driverId) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsDriver(null);
    try {
      const res = await axios.get(`/api/drivers/${driverId}`);
      setDetailsDriver(res.data.data);
    } catch (err) {
      setDetailsError('Failed to fetch driver details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetailsDriver(null);
    setDetailsError(null);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="#005A54">
        All Drivers
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2, maxWidth: '100%', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f3f4f6' }}>
                <TableCell>Driver</TableCell>
                <TableCell>Driver ID</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => {
                const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim();
                return (
                  <TableRow key={driver._id || driver.id} hover sx={{ transition: 'background 0.2s' }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: '#005A54', width: 40, height: 40, fontSize: 20 }}>
                          {driver.firstName ? driver.firstName[0] : '?'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{fullName || '-'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{driver.driverId || '-'}</TableCell>
                    <TableCell>{driver.address || '-'}</TableCell>
                    <TableCell>{driver.contact || '-'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: driver.status === 'active' ? '#10b981' : '#ef4444',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: 13,
                          minWidth: 70,
                          textAlign: 'center',
                        }}
                      >
                        {driver.status || 'inactive'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" size="small" color="primary" onClick={() => handleView(driver)}>
                        View
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="text" size="small" color="secondary" onClick={() => handleSeeMore(driver._id)}>
                        See more
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Driver Details Modal */}
      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Driver Details
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editDriver && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="First Name" value={editDriver.firstName || ''} onChange={e => setEditDriver({ ...editDriver, firstName: e.target.value })} fullWidth />
              <TextField label="Last Name" value={editDriver.lastName || ''} onChange={e => setEditDriver({ ...editDriver, lastName: e.target.value })} fullWidth />
              <TextField label="Driver ID" value={editDriver.driverId || ''} onChange={e => setEditDriver({ ...editDriver, driverId: e.target.value })} fullWidth />
              <TextField label="Address" value={editDriver.address || ''} onChange={e => setEditDriver({ ...editDriver, address: e.target.value })} fullWidth />
              <TextField label="Contact" value={editDriver.contact || ''} onChange={e => setEditDriver({ ...editDriver, contact: e.target.value })} fullWidth />
              {/* Status dropdown */}
              <TextField
                label="Status"
                select
                value={editDriver.status || ''}
                onChange={e => setEditDriver({ ...editDriver, status: e.target.value })}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdate} color="primary" variant="contained" disabled={modalLoading}>Update</Button>
          <Button onClick={handleSetInactive} color="warning" variant="outlined" disabled={modalLoading || (editDriver && editDriver.status === 'inactive')}>Set Inactive</Button>
          <Button onClick={handleDelete} color="error" variant="outlined" disabled={modalLoading}>Delete</Button>
          <Button disabled variant="outlined">Assign Delivery (Coming Soon)</Button>
        </DialogActions>
      </Dialog>

      {/* Modern Driver Details Modal (See more) */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {/* Colored Header */}
        <Box sx={{ bgcolor: 'teal.700', background: 'linear-gradient(90deg, #00695f 0%, #00897b 100%)', color: 'white', p: 3, display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
          <Typography variant="h6" fontWeight={700} letterSpacing={1} flex={1}>
            Driver Details
          </Typography>
          <IconButton onClick={handleCloseDetails} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent dividers sx={{ p: 3, bgcolor: '#f6f8fa' }}>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
          ) : detailsError ? (
            <Typography color="error">{detailsError}</Typography>
          ) : !detailsDriver ? (
            <Typography>No driver found.</Typography>
          ) : (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ bgcolor: '#005A54', width: 64, height: 64, fontSize: 32 }}>
                  {detailsDriver.firstName ? detailsDriver.firstName[0] : '?'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{detailsDriver.firstName} {detailsDriver.lastName}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">Driver ID: {detailsDriver.driverId}</Typography>
                  <Chip label={detailsDriver.status} color={detailsDriver.status === 'active' ? 'success' : detailsDriver.status === 'inactive' ? 'default' : 'warning'} size="small" sx={{ mt: 1 }} />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Address" value={detailsDriver.address || ''} fullWidth InputProps={{ readOnly: true, startAdornment: (<Box mr={1} color="teal.main"><CloseIcon fontSize="small" /></Box>) }} margin="dense" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Contact" value={detailsDriver.contact || ''} fullWidth InputProps={{ readOnly: true, startAdornment: (<Box mr={1} color="teal.main"><CloseIcon fontSize="small" /></Box>) }} margin="dense" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="License No" value={detailsDriver.licenseNo || ''} fullWidth InputProps={{ readOnly: true, startAdornment: (<Box mr={1} color="teal.main"><CloseIcon fontSize="small" /></Box>) }} margin="dense" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="NIC" value={detailsDriver.nic || ''} fullWidth InputProps={{ readOnly: true, startAdornment: (<Box mr={1} color="teal.main"><CloseIcon fontSize="small" /></Box>) }} margin="dense" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Created" value={new Date(detailsDriver.createdAt).toLocaleString()} fullWidth InputProps={{ readOnly: true, startAdornment: (<Box mr={1} color="teal.main"><CloseIcon fontSize="small" /></Box>) }} margin="dense" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Updated" value={new Date(detailsDriver.updatedAt).toLocaleString()} fullWidth InputProps={{ readOnly: true, startAdornment: (<Box mr={1} color="teal.main"><CloseIcon fontSize="small" /></Box>) }} margin="dense" />
                </Grid>
              </Grid>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={handleCloseDetails} sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}>
                  CLOSE
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AllDrivers;
