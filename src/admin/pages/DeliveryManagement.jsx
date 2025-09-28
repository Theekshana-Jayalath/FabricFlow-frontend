import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Chip,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  LocalShipping, 
  Person, 
  Assignment, 
  CheckCircle, 
  Close, 
  Refresh,
  Visibility,
  AssignmentInd
} from '@mui/icons-material';
import axios from 'axios';

const DeliveryManagement = () => {
  const [shippedOrders, setShippedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assignedBy, setAssignedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [justAssigned, setJustAssigned] = useState({}); // orderId -> driver display name

  useEffect(() => {
    fetchShippedOrders();
    fetchDrivers();
  }, []);

  const fetchShippedOrders = async () => {
    try {
      setLoading(true);
      // Try the unassigned endpoint first
      try {
        const response = await axios.get('/api/distributions/unassigned');
        console.log('Unassigned orders response:', response.data);
        setShippedOrders(response.data.data?.orders || []);
      } catch (unassignedError) {
        console.log('Unassigned endpoint failed, trying original orders endpoint:', unassignedError);
        // Fallback to original orders endpoint
        const response = await axios.get('/api/orders?status=SHIPPED');
        console.log('SHIPPED orders response:', response.data);
        setShippedOrders(response.data.orders || []);
      }
    } catch (err) {
      setError('Failed to fetch SHIPPED orders');
      console.error('Error fetching SHIPPED orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('/api/drivers/allDrivers');
      setDrivers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };


  const handleAssignDelivery = (order) => {
    setSelectedOrder(order);
    setSelectedDriver('');
    setNotes('');
    setAssignedBy('Distribution Manager'); // You can make this dynamic
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedDriver) {
      setSnackbar({ open: true, message: 'Please select a driver', severity: 'error' });
      return;
    }

    setAssignLoading(true);
    try {
      const response = await axios.post('/api/distributions/assign', {
        orderId: selectedOrder._id,
        driverId: selectedDriver,
        assignedBy: assignedBy,
        notes: notes
      });

      if (response.data.message === 'Delivery assigned successfully.') {
        const assignedDriverObj = (response.data.data && response.data.data.driver) ||
          drivers.find(d => d._id === selectedDriver);
        const driverName = assignedDriverObj ? `${assignedDriverObj.firstName} ${assignedDriverObj.lastName}` : 'Driver';
        setJustAssigned(prev => ({ ...prev, [selectedOrder._id]: driverName }));

        setSnackbar({ open: true, message: 'Delivery assigned successfully!', severity: 'success' });
        setAssignDialogOpen(false);

        // Give a brief moment to display the assigned state before the item disappears
        setTimeout(() => {
          fetchShippedOrders(); // Refresh the list (this will remove the assigned order)
        }, 600);
      }
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to assign delivery', 
        severity: 'error' 
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#005A54">
            Delivery Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Assign SHIPPED orders to drivers for delivery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchShippedOrders}
          sx={{ bgcolor: '#005A54', '&:hover': { bgcolor: '#004d47' } }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalShipping sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {shippedOrders.length}
                  </Typography>
                  <Typography variant="body2">
                    Orders Ready for Delivery
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {drivers.filter(d => d.status === 'active').length}
                  </Typography>
                  <Typography variant="body2">
                    Active Drivers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {shippedOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Total Value (USD)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {shippedOrders.length > 0 ? Math.round((shippedOrders.length / shippedOrders.length) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2">
                    Ready for Assignment
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Paper sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell><strong>Order Details</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Order Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shippedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No SHIPPED orders available for delivery assignment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Orders marked as "SHIPPED" by the order manager will appear here
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                shippedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Order #{order.orderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.items.length} item(s)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Payment: {order.paymentMethod} ({order.paymentStatus})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order.customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.customer.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.customer.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.orderStatus} 
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {justAssigned[order._id] ? (
                        <Button
                          variant="contained"
                          disabled
                          startIcon={<Person />}
                          sx={{ bgcolor: 'success.main' }}
                          size="small"
                        >
                          Assigned to {justAssigned[order._id]}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<AssignmentInd />}
                          onClick={() => handleAssignDelivery(order)}
                          sx={{ 
                            bgcolor: '#005A54', 
                            '&:hover': { bgcolor: '#004d47' }
                          }}
                          size="small"
                        >
                          Assign Driver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assign Delivery Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#005A54', color: 'white' }}>
          <AssignmentInd />
          Assign Delivery
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Order ID"
                    value={selectedOrder.orderId}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Name"
                    value={selectedOrder.customer.name}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Amount"
                    value={formatCurrency(selectedOrder.totalAmount)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Order Date"
                    value={formatDate(selectedOrder.orderDate)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Assignment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Driver</InputLabel>
                    <Select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      label="Select Driver"
                    >
                      {drivers
                        .filter(driver => driver.status === 'active')
                        .map((driver) => (
                          <MenuItem key={driver._id} value={driver._id}>
                            {driver.firstName} {driver.lastName} - {driver.driverId}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Assigned By"
                    value={assignedBy}
                    onChange={(e) => setAssignedBy(e.target.value)}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Add any special delivery instructions..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssign}
            variant="contained"
            disabled={assignLoading || !selectedDriver}
            sx={{ bgcolor: '#005A54', '&:hover': { bgcolor: '#004d47' } }}
          >
            {assignLoading ? <CircularProgress size={20} /> : 'Assign Delivery'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeliveryManagement;
