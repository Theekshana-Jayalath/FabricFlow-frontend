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
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
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
  AssignmentInd,
  Phone,
  LocationOn,
  Schedule,
  DriveEta
} from '@mui/icons-material';
import axios from 'axios';

const AllOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDriverAssignModal, setShowDriverAssignModal] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [driverBusyStatus, setDriverBusyStatus] = useState({}); // Track which drivers are busy
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({
    customer: '',
    startDate: '',
    endDate: '',
    orderStatus: 'COMPLETED' // Default to completed orders
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchCompletedOrders();
    fetchAvailableDrivers();
  }, [filters, pagination.page]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      let params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.customer && { customer: filters.customer }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      // Handle order status filtering
      if (filters.orderStatus) {
        params.set('status', filters.orderStatus);
      }
      // If no specific status is selected, we'll fetch all orders and filter on frontend
      // since the backend API doesn't support multiple statuses in one call

      const url = `http://localhost:5000/api/orders?${params}`;
      console.log('Fetching orders from:', url); // Debug log
      const response = await axios.get(url);
      console.log('Orders response:', response.data); // Debug log
      
      if (response.data) {
        let orders = response.data.orders || [];
        
        // If no specific status filter, filter on frontend to show completed-related orders
        if (!filters.orderStatus) {
          orders = orders.filter(order => 
            ['COMPLETED', 'ASSIGNEDTODRIVER', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus)
          );
        }
        
        setCompletedOrders(orders);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pages || 1
        }));
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
      console.error('Error details:', err.response?.data); // Enhanced error logging
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      // First, try to get all active drivers from employees
      const response = await axios.get('http://localhost:5000/employees/drivers');
      console.log('All drivers response:', response.data); // Debug log
      
      if (response.data && response.data.success) {
        // Filter only active drivers on frontend
        const activeDrivers = response.data.drivers.filter(driver => 
          driver.status === 'active' && 
          driver.jobPosition && 
          driver.jobPosition.toLowerCase() === 'driver'
        );
        
        console.log('Filtered active drivers:', activeDrivers); // Debug log
        setAvailableDrivers(activeDrivers);
        
        // Also fetch driver busy status from distribution API
        try {
          const busyResponse = await axios.get('http://localhost:5000/api/distributions/available-drivers');
          console.log('Busy drivers response:', busyResponse.data); // Debug log
          
          if (busyResponse.data && busyResponse.data.success) {
            const freeDriverIds = busyResponse.data.data.freeDrivers?.map(driver => driver._id) || [];
            const busyStatus = {};
            activeDrivers.forEach(driver => {
              busyStatus[driver._id] = !freeDriverIds.includes(driver._id);
            });
            console.log('Driver busy status:', busyStatus); // Debug log
            setDriverBusyStatus(busyStatus);
          }
        } catch (busyErr) {
          console.log('Could not fetch driver busy status:', busyErr);
        }
      } else {
        console.log('No drivers found in response');
      }
    } catch (err) {
      console.error('Error fetching available drivers:', err);
      
      // Fallback: try the distribution endpoint
      try {
        console.log('Trying fallback distribution endpoint...');
        const fallbackResponse = await axios.get('http://localhost:5000/api/distributions/available-drivers');
        if (fallbackResponse.data && fallbackResponse.data.success) {
          const allDrivers = [
            ...(fallbackResponse.data.data.freeDrivers || []),
            ...(fallbackResponse.data.data.allDrivers || [])
          ];
          // Remove duplicates
          const uniqueDrivers = allDrivers.filter((driver, index, self) => 
            index === self.findIndex(d => d._id === driver._id)
          );
          console.log('Fallback drivers:', uniqueDrivers);
          setAvailableDrivers(uniqueDrivers);
        }
      } catch (fallbackErr) {
        console.error('Error fetching drivers (fallback):', fallbackErr);
      }
    }
  };

  const handleAssignDriver = (order) => {
    setSelectedOrder(order);
    setShowDriverAssignModal(true);
    setSelectedDriver('');
    setAssignmentNotes('');
  };

  const assignOrderToDriver = async () => {
    if (!selectedDriver || !selectedOrder) {
      setSnackbar({
        open: true,
        message: 'Please select a driver',
        severity: 'error'
      });
      return;
    }

    try {
      setAssignmentLoading(true);
      const response = await axios.post('http://localhost:5000/api/distributions/assign', {
        orderId: selectedOrder._id,
        driverId: selectedDriver,
        assignedBy: 'Admin', // You can get this from auth context
        notes: assignmentNotes
      });

      if (response.data && response.data.message) {
        setSnackbar({
          open: true,
          message: 'Order assigned to driver successfully!',
          severity: 'success'
        });
        
        // Refresh orders and drivers
        fetchCompletedOrders();
        fetchAvailableDrivers();
        
        // Close modal
        setShowDriverAssignModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error assigning order to driver:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to assign order to driver',
        severity: 'error'
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
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

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'PROCESSING': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'SHIPPED': return 'warning';
      case 'DELIVERED': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading orders...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={400}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">{error}</Typography>
          <Typography variant="body2">
            Make sure the backend server is running on http://localhost:5000
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => {
            setError(null);
            fetchCompletedOrders();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#005A54">
            Order Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage completed orders - Assign drivers for delivery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchCompletedOrders}
          sx={{ bgcolor: '#005A54', '&:hover': { bgcolor: '#004d47' }, mr: 1 }}
        >
          Refresh Orders
        </Button>
        <Button
          variant="outlined"
          startIcon={<Person />}
          onClick={fetchAvailableDrivers}
          sx={{ color: '#005A54', borderColor: '#005A54' }}
        >
          Refresh Drivers
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {completedOrders.filter(order => order.orderStatus === 'COMPLETED').length}
                  </Typography>
                  <Typography variant="body2">
                    Ready for Assignment
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DriveEta sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {completedOrders.filter(order => order.orderStatus === 'ASSIGNEDTODRIVER').length}
                  </Typography>
                  <Typography variant="body2">
                    Assigned to Drivers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {completedOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2">
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalShipping sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
                  </Typography>
                  <Typography variant="body2">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {availableDrivers.length}
                  </Typography>
                  <Typography variant="body2">
                    Active Drivers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="customer"
              label="Customer Name"
              value={filters.customer}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="endDate"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                name="orderStatus"
                value={filters.orderStatus || ''}
                label="Order Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="ASSIGNEDTODRIVER">Assigned to Driver</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell><strong>Order Details</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Items</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Payment Status</strong></TableCell>
                <TableCell><strong>Order Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Orders matching your filters will appear here
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                completedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Order #{order.orderId}
                        </Typography>
                        <Chip 
                          label={order.orderStatus}
                          color={getOrderStatusColor(order.orderStatus)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order.customer?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.customer?.email || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.customer?.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order.items?.length || 0} item(s)
                        </Typography>
                        {order.items?.slice(0, 2).map((item, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            {item.quantity}x {item.color} {item.size}
                          </Typography>
                        ))}
                        {order.items?.length > 2 && (
                          <Typography variant="body2" color="text.secondary">
                            +{order.items.length - 2} more items
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.paymentStatus}
                        color={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'FAILED' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.orderDate)}
                      </Typography>
                      {order.deliveryDate && (
                        <Typography variant="body2" color="text.secondary">
                          Delivery: {formatDate(order.deliveryDate)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleViewOrder(order)}
                          size="small"
                        >
                          View Details
                        </Button>
                        {order.orderStatus === 'COMPLETED' && (
                          <Button
                            variant="contained"
                            startIcon={<DriveEta />}
                            onClick={() => handleAssignDriver(order)}
                            size="small"
                            sx={{ 
                              bgcolor: '#005A54', 
                              '&:hover': { bgcolor: '#004d47' },
                              minWidth: 'auto'
                            }}
                          >
                            Assign Driver
                          </Button>
                        )}
                        {order.orderStatus === 'ASSIGNEDTODRIVER' && (
                          <Chip 
                            label="Driver Assigned"
                            color="info"
                            size="small"
                            icon={<CheckCircle />}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Typography variant="body1" sx={{ mx: 2, alignSelf: 'center' }}>
            Page {pagination.page} of {pagination.totalPages}
          </Typography>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            variant="outlined"
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <Dialog open={showOrderModal} onClose={() => setShowOrderModal(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#005A54', color: 'white' }}>
            <Assignment />
            Order Details
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Order Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Grid container spacing={2}>
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
                      label="Order Status"
                      value={selectedOrder.orderStatus}
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
                      label="Payment Status"
                      value={selectedOrder.paymentStatus}
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Delivery Date"
                      value={selectedOrder.deliveryDate ? formatDate(selectedOrder.deliveryDate) : 'Not set'}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Customer Name"
                      value={selectedOrder.customer?.name || 'N/A'}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      value={selectedOrder.customer?.email || 'N/A'}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      value={selectedOrder.customer?.phone || 'N/A'}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Address"
                      value={selectedOrder.customer?.shippingAddress ? 
                        `${selectedOrder.customer.shippingAddress.street || ''}, ${selectedOrder.customer.shippingAddress.city || ''}` : 
                        'N/A'
                      }
                      fullWidth
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Product ID</strong></TableCell>
                          <TableCell><strong>Size</strong></TableCell>
                          <TableCell><strong>Color</strong></TableCell>
                          <TableCell><strong>Quantity</strong></TableCell>
                          <TableCell><strong>Price</strong></TableCell>
                          <TableCell><strong>Total</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productId}</TableCell>
                            <TableCell>{item.size}</TableCell>
                            <TableCell>{item.color}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No items found for this order.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowOrderModal(false)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Driver Assignment Modal */}
      {showDriverAssignModal && selectedOrder && (
        <Dialog 
          open={showDriverAssignModal} 
          onClose={() => setShowDriverAssignModal(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#005A54', color: 'white' }}>
            <DriveEta />
            Assign Driver to Order
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mt: 2 }}>
              {/* Order Info */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedOrder.orderId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedOrder.customer?.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatCurrency(selectedOrder.totalAmount)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Items Count</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedOrder.items?.length || 0} items</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Driver Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Driver</InputLabel>
                <Select
                  value={selectedDriver}
                  label="Select Driver"
                  onChange={(e) => setSelectedDriver(e.target.value)}
                >
                  {availableDrivers.length === 0 ? (
                    <MenuItem disabled>
                      <Typography color="text.secondary">No active drivers found (Total drivers loaded: {availableDrivers.length})</Typography>
                    </MenuItem>
                  ) : (
                    availableDrivers.map((driver) => (
                      <MenuItem key={driver._id} value={driver._id}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {driver.empName} (ID: {driver.empId})
                            </Typography>
                            {driverBusyStatus[driver._id] && (
                              <Chip 
                                label="Busy" 
                                size="small" 
                                color="warning" 
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Phone: {driver.empPhone} | Email: {driver.emailAddress}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Address: {driver.address}
                          </Typography>
                          <Typography variant="caption" color={driver.status === 'active' ? 'success.main' : 'text.secondary'}>
                            Status: {driver.status?.toUpperCase() || 'N/A'} | Position: {driver.jobPosition}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Debug info - remove this later */}
              {process.env.NODE_ENV === 'development' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Debug:</strong> Found {availableDrivers.length} active drivers. 
                    Check browser console for more details.
                  </Typography>
                </Alert>
              )}

              {/* Info about busy drivers */}
              {selectedDriver && driverBusyStatus[selectedDriver] && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> This driver is currently assigned to another order but can still be assigned to this order if needed.
                  </Typography>
                </Alert>
              )}

              {/* Assignment Notes */}
              <TextField
                label="Assignment Notes (Optional)"
                multiline
                rows={3}
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                fullWidth
                placeholder="Add any special instructions for the driver..."
              />

              {availableDrivers.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No active drivers found. Please ensure there are employees with the role "driver" and status "active".
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowDriverAssignModal(false)} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={assignOrderToDriver}
              variant="contained"
              disabled={!selectedDriver || assignmentLoading || availableDrivers.length === 0}
              startIcon={assignmentLoading ? <CircularProgress size={20} /> : <AssignmentInd />}
              sx={{ bgcolor: '#005A54', '&:hover': { bgcolor: '#004d47' } }}
            >
              {assignmentLoading ? 'Assigning...' : 'Assign Driver'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

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

export default AllOrders;
