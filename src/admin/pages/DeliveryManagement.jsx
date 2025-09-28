import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeliveryManagement = () => {
  const [shippedOrders, setShippedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A54]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#005A54] mb-2">
            Delivery Management
          </h1>
          <p className="text-gray-600">
            View SHIPPED orders ready for delivery
          </p>
        </div>
        <button
          onClick={fetchShippedOrders}
          className="flex items-center px-4 py-2 bg-[#005A54] text-white rounded-lg hover:bg-[#004d47] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-10 h-10 mr-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20,8h-3V4H3C1.89,4 1,4.89 1,6v11h2c0,1.66 1.34,3 3,3s3-1.34 3-3h6c0,1.66 1.34,3 3,3s3-1.34 3-3h2v-5L20,8zM6,18.5c-0.83,0 -1.5,-0.67 -1.5,-1.5s0.67,-1.5 1.5,-1.5s1.5,0.67 1.5,1.5S6.83,18.5 6,18.5zM18,18.5c-0.83,0 -1.5,-0.67 -1.5,-1.5s0.67,-1.5 1.5,-1.5s1.5,0.67 1.5,1.5S18.83,18.5 18,18.5zM19,13H5V6h14V13z"/>
            </svg>
            <div>
              <h2 className="text-4xl font-bold">
                {shippedOrders.length}
              </h2>
              <p className="text-sm">
                Orders Ready for Delivery
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-10 h-10 mr-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,12c2.21,0 4,-1.79 4,-4s-1.79,-4 -4,-4s-4,1.79 -4,4S9.79,12 12,12zM21,9v3l-2,-1v4c0,1.1 -0.9,2 -2,2l-2,0v-2l2,0v-2.5l-1.5,0.75V9l3.5,-1.5V3l-2,0v-1h2C21.1,2 21,2.9 21,4v2l2,1v2H21zM9,13c-2.67,0 -8,1.34 -8,4v3h16v-3C17,14.34 11.67,13 9,13z"/>
            </svg>
            <div>
              <h2 className="text-4xl font-bold">
                {drivers.filter(d => d.status === 'active').length}
              </h2>
              <p className="text-sm">
                Active Drivers
              </p>
            </div>
          </div>
        </div>
        <div className="bg-amber-600 text-white rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-10 h-10 mr-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,3H5C3.9,3 3,3.9 3,5v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2V5C21,3.9 20.1,3 19,3zM19,19H5V5h14V19zM17,12H7v-2h10V12zM15,16H7v-2h8V16zM17,8H7V6h10V8z"/>
            </svg>
            <div>
              <h2 className="text-4xl font-bold">
                {shippedOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
              </h2>
              <p className="text-sm">
                Total Value (USD)
              </p>
            </div>
          </div>
        </div>
        <div className="bg-cyan-600 text-white rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-10 h-10 mr-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10s10,-4.48 10,-10S17.52,2 12,2zM10,17l-5,-5l1.41,-1.41L10,14.17l7.59,-7.59L19,8L10,17z"/>
            </svg>
            <div>
              <h2 className="text-4xl font-bold">
                {shippedOrders.length > 0 ? Math.round((shippedOrders.length / shippedOrders.length) * 100) : 0}%
              </h2>
              <p className="text-sm">
                Ready for Assignment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                  <strong>Amount</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Order Date</strong>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <strong>Status</strong>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shippedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      No SHIPPED orders available for delivery assignment
                    </h3>
                    <p className="text-gray-400">
                      Orders marked as "SHIPPED" by the order manager will appear here
                    </p>
                  </td>
                </tr>
              ) : (
                shippedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Order #{order.orderId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </p>
                        <p className="text-sm text-gray-500">
                          Payment: {order.paymentMethod} ({order.paymentStatus})
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {formatDate(order.orderDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;
