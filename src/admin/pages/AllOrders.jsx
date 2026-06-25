import React, { useState, useEffect } from 'react';
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

  // Auto-hide snackbar after 6 seconds
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, open: false });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

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

      const url = `https://fabricflow-backend1.onrender.com/api/orders?${params}`;
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
      const response = await axios.get('https://fabricflow-backend1.onrender.com/employees/drivers');
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
          const busyResponse = await axios.get('https://fabricflow-backend1.onrender.com/api/distributions/available-drivers');
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
        const fallbackResponse = await axios.get('https://fabricflow-backend1.onrender.com/api/distributions/available-drivers');
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
      const response = await axios.post('https://fabricflow-backend1.onrender.com/api/distributions/assign', {
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#005A54] border-t-transparent"></div>
        <p className="ml-4 text-lg text-gray-700 mt-4">
          Loading orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-96">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-lg">
          <p className="font-semibold text-lg">{error}</p>
          <p className="text-sm">
            Make sure the backend server is running on https://fabricflow-backend1.onrender.com
          </p>
        </div>
        <button 
          className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#004d47] transition-colors"
          onClick={() => {
            setError(null);
            fetchCompletedOrders();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#005A54]">
            Order Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage completed orders - Assign drivers for delivery
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            className="flex items-center gap-2 bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#004d47] transition-colors"
            onClick={fetchCompletedOrders}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Orders
          </button>
          <button
            className="flex items-center gap-2 border border-[#005A54] text-[#005A54] px-4 py-2 rounded hover:bg-[#005A54] hover:text-white transition-colors"
            onClick={fetchAvailableDrivers}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Refresh Drivers
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-green-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {completedOrders.filter(order => order.orderStatus === 'COMPLETED').length}
              </p>
              <p className="text-sm opacity-90">
                Ready for Assignment
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-500 text-white rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {completedOrders.filter(order => order.orderStatus === 'ASSIGNEDTODRIVER').length}
              </p>
              <p className="text-sm opacity-90">
                Assigned to Drivers
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 15.5h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V9h2v2.5zm0-3.5h-2V6h2v2zm5 9.5h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V9h2v2.5zm0-3.5h-2V6h2v2z"/>
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {completedOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
              </p>
              <p className="text-sm opacity-90">
                Total Items
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {formatCurrency(completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
              </p>
              <p className="text-sm opacity-90">
                Total Revenue
              </p>
            </div>
          </div>
        </div>

        <div className="bg-teal-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {availableDrivers.length}
              </p>
              <p className="text-sm opacity-90">
                Active Drivers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customer"
              value={filters.customer}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
              placeholder="Search by customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
            <select
              name="orderStatus"
              value={filters.orderStatus || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="ASSIGNEDTODRIVER">Assigned to Driver</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Order Details</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Customer</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Items</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Amount</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Payment Status</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Order Date</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Actions</strong>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-500">
                        No orders found
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Orders matching your filters will appear here
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                completedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Order #{order.orderId}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'ASSIGNEDTODRIVER' ? 'bg-orange-100 text-orange-800' :
                          order.orderStatus === 'SHIPPED' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.customer?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer?.email || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer?.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.items?.length || 0} item(s)
                        </p>
                        {order.items?.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-sm text-gray-500">
                            {item.quantity}x {item.color} {item.size}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(order.orderDate)}
                        </p>
                        {order.deliveryDate && (
                          <p className="text-sm text-gray-500">
                            Delivery: {formatDate(order.deliveryDate)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <button
                          className="flex items-center gap-1 text-[#005A54] hover:text-[#004d47] border border-[#005A54] hover:bg-[#005A54] hover:text-white px-3 py-1 rounded text-sm transition-colors"
                          onClick={() => handleViewOrder(order)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                        {order.orderStatus === 'COMPLETED' && (
                          <button
                            className="flex items-center gap-1 bg-[#005A54] hover:bg-[#004d47] text-white px-3 py-1 rounded text-sm transition-colors"
                            onClick={() => handleAssignDriver(order)}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                            </svg>
                            Assign Driver
                          </button>
                        )}
                        {order.orderStatus === 'ASSIGNEDTODRIVER' && (
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Driver Assigned
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className={`px-4 py-2 mr-2 rounded border ${
              pagination.page === 1 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-[#005A54] border-[#005A54] hover:bg-[#005A54] hover:text-white'
            } transition-colors`}
          >
            Previous
          </button>
          <div className="flex items-center px-4 py-2 text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className={`px-4 py-2 ml-2 rounded border ${
              pagination.page === pagination.totalPages 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-[#005A54] border-[#005A54] hover:bg-[#005A54] hover:text-white'
            } transition-colors`}
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center gap-2 bg-[#005A54] text-white px-6 py-4 rounded-t-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 15.5h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V9h2v2.5zm0-3.5h-2V6h2v2zm5 9.5h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V9h2v2.5zm0-3.5h-2V6h2v2z"/>
              </svg>
              <h2 className="text-xl font-semibold">Order Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                      <input
                        type="text"
                        value={selectedOrder.orderId}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                      <input
                        type="text"
                        value={selectedOrder.orderStatus}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="text"
                        value={formatCurrency(selectedOrder.totalAmount)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                      <input
                        type="text"
                        value={selectedOrder.paymentStatus}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                      <input
                        type="text"
                        value={formatDate(selectedOrder.orderDate)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                      <input
                        type="text"
                        value={selectedOrder.deliveryDate ? formatDate(selectedOrder.deliveryDate) : 'Not set'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={selectedOrder.customer?.name || 'N/A'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="text"
                        value={selectedOrder.customer?.email || 'N/A'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={selectedOrder.customer?.phone || 'N/A'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={selectedOrder.customer?.shippingAddress ? 
                          `${selectedOrder.customer.shippingAddress.street || ''}, ${selectedOrder.customer.shippingAddress.city || ''}` : 
                          'N/A'
                        }
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.size}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.color}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.price)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No items found for this order.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowOrderModal(false)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showDriverAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center gap-2 bg-[#005A54] text-white px-6 py-4 rounded-t-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <h2 className="text-xl font-semibold">Assign Driver to Order</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.customer?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items Count</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.items?.length || 0} items</p>
                    </div>
                  </div>
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                  >
                    <option value="">Choose a driver...</option>
                    {availableDrivers.length === 0 ? (
                      <option disabled>No active drivers found (Total drivers loaded: {availableDrivers.length})</option>
                    ) : (
                      availableDrivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.empName} (ID: {driver.empId}) - {driver.empPhone}
                          {driverBusyStatus[driver._id] ? ' - BUSY' : ''}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Driver Details */}
                  {selectedDriver && availableDrivers.find(d => d._id === selectedDriver) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      {(() => {
                        const driver = availableDrivers.find(d => d._id === selectedDriver);
                        return (
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{driver.empName} (ID: {driver.empId})</span>
                              {driverBusyStatus[driver._id] && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                  Busy
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">Phone: {driver.empPhone} | Email: {driver.emailAddress}</p>
                            <p className="text-gray-600">Address: {driver.address}</p>
                            <p className="text-gray-600">
                              Status: <span className={driver.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                                {driver.status?.toUpperCase() || 'N/A'}
                              </span> | Position: {driver.jobPosition}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Debug info - remove this later */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-blue-100 border border-blue-200 text-blue-800 p-3 rounded">
                    <p className="text-sm">
                      <strong>Debug:</strong> Found {availableDrivers.length} active drivers. 
                      Check browser console for more details.
                    </p>
                  </div>
                )}

                {/* Info about busy drivers */}
                {selectedDriver && driverBusyStatus[selectedDriver] && (
                  <div className="bg-blue-100 border border-blue-200 text-blue-800 p-3 rounded">
                    <p className="text-sm">
                      <strong>Note:</strong> This driver is currently assigned to another order but can still be assigned to this order if needed.
                    </p>
                  </div>
                )}

                {/* Assignment Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Add any special instructions for the driver..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent resize-none"
                  />
                </div>

                {availableDrivers.length === 0 && (
                  <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 p-3 rounded">
                    <p className="text-sm">
                      No active drivers found. Please ensure there are employees with the role "driver" and status "active".
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowDriverAssignModal(false)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={assignOrderToDriver}
                disabled={!selectedDriver || assignmentLoading || availableDrivers.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  !selectedDriver || assignmentLoading || availableDrivers.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#005A54] text-white hover:bg-[#004d47]'
                }`}
              >
                {assignmentLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
                {assignmentLoading ? 'Assigning...' : 'Assign Driver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
            snackbar.severity === 'success' ? 'bg-green-600' :
            snackbar.severity === 'error' ? 'bg-red-600' :
            snackbar.severity === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
          }`}>
            <div className="flex-1">
              {snackbar.message}
            </div>
            <button 
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
