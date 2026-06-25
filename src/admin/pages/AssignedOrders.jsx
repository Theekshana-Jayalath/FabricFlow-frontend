import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Modal,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Search,
  Visibility,
  LocalShipping,
  Person,
  Assignment,
  Close
} from '@mui/icons-material';

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm) {
      const filtered = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://fabricflow-backend1.onrender.com/api/orders/assigned/drivers');
      setOrders(response.data.orders);
      setError('');
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      setError('Failed to fetch assigned orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount);
};


  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#005A54', fontWeight: 'bold' }}>
          Assigned Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage orders that have been assigned to drivers for delivery
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#005A54', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    {filteredOrders.length}
                  </Typography>
                  <Typography variant="body2">
                    Total Assigned
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#EF6869', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    {filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Total Value (LKR)
                  </Typography>
                </Box>
                <LocalShipping sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFEED6', color: '#005A54' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    {new Set(filteredOrders.map(order => order.assignedDriver)).size}
                  </Typography>
                  <Typography variant="body2">
                    Active Drivers
                  </Typography>
                </Box>
                <Person sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#2c1ce2ff', color: '#fefefeff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    {filteredOrders.filter(order => 
                      new Date(order.deliveryDate) <= new Date(Date.now() + 24*60*60*1000)
                    ).length}
                  </Typography>
                  <Typography variant="body2">
                    Due Today/Tomorrow
                  </Typography>
                </Box>
                <Visibility sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by Order ID, Customer Name, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Customer
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Order Date
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Delivery Date
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Total Amount
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Status
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Payment
                </TableCell>
                <TableCell sx={{ bgcolor: '#005A54', color: 'white', fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No assigned orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    sx={{ 
                      bgcolor: 'white',
                      '&:hover': { bgcolor: '#e5e7eb' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {order.orderId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {order.customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={
                          new Date(order.deliveryDate) <= new Date(Date.now() + 24*60*60*1000)
                            ? 'error' 
                            : 'inherit'
                        }
                        fontWeight={
                          new Date(order.deliveryDate) <= new Date(Date.now() + 24*60*60*1000)
                            ? 'bold' 
                            : 'normal'
                        }
                      >
                        {formatDate(order.deliveryDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Assigned to Driver"
                        color="warning"
                        size="small"
                        sx={{ 
                          bgcolor: '#ff9800', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus}
                        color={order.paymentStatus === 'PAID' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(order)}
                          sx={{ 
                            color: '#005A54',
                            '&:hover': { bgcolor: '#005A54', color: 'white' }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOrders.length} assigned order(s)
          </Typography>
        </Box>
      )}

      {/* Order Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="order-details-modal"
        aria-describedby="order-details-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
            maxWidth: 800,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            overflow: 'auto'
          }}
        >
          {selectedOrder && (
            <>
              {/* Modal Header */}
              <Box sx={{ 
                p: 3, 
                bgcolor: '#005A54', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h5" component="h2">
                  Order Details - {selectedOrder.orderId}
                </Typography>
                <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>

              {/* Modal Content */}
              <Box sx={{ p: 3 }}>
                {/* Customer Information */}
                <Typography variant="h6" gutterBottom sx={{ color: '#005A54', mb: 2 }}>
                  Customer Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedOrder.customer?.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedOrder.customer?.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedOrder.customer?.phone || 'N/A'}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Shipping Address */}
                <Typography variant="h6" gutterBottom sx={{ color: '#005A54', mb: 2 }}>
                  Shipping Address
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      {selectedOrder.customer?.shippingAddress?.street || 'N/A'}<br />
                      {selectedOrder.customer?.shippingAddress?.city || 'N/A'}
                      {selectedOrder.customer?.shippingAddress?.postalCode && 
                        `, ${selectedOrder.customer.shippingAddress.postalCode}`}
                      {selectedOrder.customer?.shippingAddress?.country && 
                        `<br />${selectedOrder.customer.shippingAddress.country}`}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Order Information */}
                <Typography variant="h6" gutterBottom sx={{ color: '#005A54', mb: 2 }}>
                  Order Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">{formatDate(selectedOrder.orderDate)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Delivery Date</Typography>
                    <Typography variant="body1" color={
                      new Date(selectedOrder.deliveryDate) <= new Date(Date.now() + 24*60*60*1000)
                        ? 'error.main' : 'inherit'
                    }>
                      {formatDate(selectedOrder.deliveryDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Order Status</Typography>
                    <Chip
                      label="Assigned to Driver"
                      color="warning"
                      size="small"
                      sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 'bold' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                    <Chip
                      label={selectedOrder.paymentStatus}
                      color={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                <Typography variant="h6" gutterBottom sx={{ color: '#005A54', mb: 2 }}>
                  Order Items
                </Typography>
                <List sx={{ mb: 3 }}>
                  {selectedOrder.products && selectedOrder.products.length > 0 ? (
                    selectedOrder.products.map((product, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1, bgcolor: index % 2 === 0 ? '#f9f9f9' : 'inherit' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="medium">
                                {product.productName || 'Product Name'}
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {formatCurrency((product.price || 0) * (product.quantity || 0))}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                Size: {product.size || 'N/A'} | Material: {product.material || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {product.quantity || 0} × {formatCurrency(product.price || 0)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" color="text.secondary" align="center">
                            No product details available
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>

                {/* Total Amount */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  bgcolor: '#005A54',
                  color: 'white',
                  p: 2,
                  borderRadius: 1
                }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AssignedOrders;
