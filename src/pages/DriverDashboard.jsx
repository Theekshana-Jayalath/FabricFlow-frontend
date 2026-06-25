import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DriverDashboard() {
  const { user, getDisplayName, logout } = useAuth();
  const navigate = useNavigate();
  
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleBackToEmployeeDashboard = () => {
    navigate('/employee/dashboard');
  };

  // Fetch driver's assigned vehicle
  const fetchAssignedVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://fabricflow-backend1.onrender.com/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Vehicle data:', data);
        // Find vehicle assigned to current user
        const userVehicle = data.data?.find(vehicle => 
          vehicle.assignedDriverId && vehicle.assignedDriverId._id === user._id
        );
        setAssignedVehicle(userVehicle || null);
      } else {
        console.log('Failed to fetch vehicles, status:', response.status);
        setAssignedVehicle(null);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setAssignedVehicle(null);
    }
  };

  // Fetch driver's delivery orders
  const fetchDeliveryOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://fabricflow-backend1.onrender.com/api/distributions/assigned?driverId=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliveryOrders(data.data || []);
      } else {
        console.log('Failed to fetch delivery orders, status:', response.status);
        setDeliveryOrders([]);
      }
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      setDeliveryOrders([]);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (distributionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://fabricflow-backend1.onrender.com/api/distributions/${distributionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });
      
      if (response.ok) {
        // Refresh delivery orders
        fetchDeliveryOrders();
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setError('Failed to update delivery status');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      console.log('Loading data for user:', user);
      
      // Load data independently - don't fail if one fails
      try {
        await Promise.allSettled([fetchAssignedVehicle(), fetchDeliveryOrders()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?._id) {
      loadData();
    } else {
      console.log('No user ID available:', user);
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#005A54] to-[#EF6869] text-white p-8 rounded-lg mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Driver Dashboard - Welcome, {getDisplayName()}!
              </h1>
              <p className="text-lg opacity-90">
                Manage your deliveries, routes, and vehicle information
              </p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToEmployeeDashboard}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back to Employee</span>
              </button>
              
              <div className="text-right">
                <p className="text-sm opacity-75">Signed in as</p>
                <p className="font-medium">{getDisplayName()}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A54]"></div>
            <span className="ml-3 text-gray-600">Loading your dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
            <button 
              onClick={() => {setError(null); fetchDeliveryOrders(); fetchAssignedVehicle();}}
              className="ml-4 text-red-800 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content - Show after loading */}
        {!loading && (
          <div>
            {/* Vehicle Assignment */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Assignment</h2>
              {assignedVehicle ? (
                <div className="bg-gradient-to-r from-[#005A54]/10 to-[#EF6869]/10 p-4 rounded-lg border-l-4 border-[#005A54]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Assigned Vehicle</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      assignedVehicle.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignedVehicle.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Registration Number</p>
                      <p className="font-medium">{assignedVehicle.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium">{assignedVehicle.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Brand & Model</p>
                      <p className="font-medium">{assignedVehicle.brand} {assignedVehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Capacity</p>
                      <p className="font-medium">{assignedVehicle.capacity}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🚗</div>
                  <p className="font-medium">No Vehicle Assigned</p>
                  <p className="text-sm">Contact your supervisor for vehicle assignment</p>
                </div>
              )}
            </div>

            {/* Delivery Orders */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Delivery Orders</h2>
                <button 
                  onClick={() => {fetchDeliveryOrders(); fetchAssignedVehicle();}}
                  className="text-[#005A54] hover:text-[#EF6869] text-sm font-medium transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
              
              {deliveryOrders.length > 0 ? (
                <div className="space-y-4">
                  {deliveryOrders.map((delivery) => (
                    <div key={delivery._id} className="border border-gray-200 rounded-lg p-4 hover:border-[#005A54] transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              Order {delivery.order?.orderId || 'N/A'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              delivery.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              delivery.deliveryStatus === 'IN_TRANSIT' ? 'bg-yellow-100 text-yellow-800' :
                              delivery.deliveryStatus === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {delivery.deliveryStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Distribution ID: {delivery.distributionId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-[#005A54]">
                            Rs. {delivery.order?.totalAmount?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Customer Information */}
                      {delivery.order?.customer && (
                        <div className="bg-gray-50 p-3 rounded mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Name: </span>
                              <span className="font-medium">{delivery.order.customer.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone: </span>
                              <span className="font-medium">{delivery.order.customer.phone}</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Address: </span>
                              <span className="font-medium">{delivery.order.customer.address}</span>
                            </div>
                            {delivery.order.customer.email && (
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Email: </span>
                                <span className="font-medium">{delivery.order.customer.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Order Date</p>
                          <p className="font-medium">
                            {delivery.order?.orderDate ? new Date(delivery.order.orderDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivery Date</p>
                          <p className="font-medium">
                            {delivery.order?.deliveryDate ? new Date(delivery.order.deliveryDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Assigned Date</p>
                          <p className="font-medium">
                            {delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Assigned By</p>
                          <p className="font-medium">{delivery.assignedBy || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {delivery.notes && (
                        <div className="mb-3">
                          <p className="text-gray-600 text-sm">Notes:</p>
                          <p className="text-gray-800 text-sm bg-yellow-50 p-2 rounded">{delivery.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2">
                        {delivery.deliveryStatus === 'ASSIGNED' && (
                          <button
                            onClick={() => updateDeliveryStatus(delivery._id, 'IN_TRANSIT')}
                            className="bg-[#005A54] hover:bg-[#005A54]/90 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Start Delivery
                          </button>
                        )}
                        {delivery.deliveryStatus === 'IN_TRANSIT' && (
                          <button
                            onClick={() => updateDeliveryStatus(delivery._id, 'DELIVERED')}
                            className="bg-[#EF6869] hover:bg-[#EF6869]/90 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Mark as Delivered
                          </button>
                        )}
                        <button className="text-[#005A54] hover:text-[#EF6869] px-4 py-2 text-sm font-medium transition-colors border border-[#005A54] rounded hover:border-[#EF6869]">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="font-medium">No Delivery Orders Assigned</p>
                  <p className="text-sm">Check back later for new delivery assignments</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;