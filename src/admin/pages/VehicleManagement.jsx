import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, Edit, Trash2, Eye, User, UserX, UserPlus } from 'lucide-react';
import AddVehicleModal from './AddVehicleModal';
import EditVehicleModal from './EditVehicleModal';
import AssignDriverModal from './AssignDriverModal';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVehicles: 0
  });

  // Fetch vehicles from backend
  const fetchVehicles = async (page = 1, search = '', status = '', type = '') => {
    try {
      setLoading(true);
      let url = `https://fabricflow-backend1.onrender.com/api/vehicles?page=${page}&limit=10`;
      
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (type) url += `&vehicleType=${encodeURIComponent(type)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      
      if (data.success) {
        setVehicles(data.vehicles || []);
        setPagination({
          currentPage: page,
          totalPages: data.totalPages || 1,
          totalVehicles: data.totalVehicles || 0
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers from backend
  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://fabricflow-backend1.onrender.com/api/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setDrivers(data);
      } else if (data.success && data.data) {
        setDrivers(data.data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  useEffect(() => {
    fetchVehicles(1, searchTerm, statusFilter, typeFilter);
    fetchDrivers();
  }, [searchTerm, statusFilter, typeFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
  };

  const handlePageChange = (newPage) => {
    fetchVehicles(newPage, searchTerm, statusFilter, typeFilter);
  };

  const handleVehicleAdded = () => {
    setShowAddModal(false);
    fetchVehicles(pagination.currentPage, searchTerm, statusFilter, typeFilter);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleVehicleUpdated = () => {
    setShowEditModal(false);
    setSelectedVehicle(null);
    fetchVehicles(pagination.currentPage, searchTerm, statusFilter, typeFilter);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await fetch(`https://fabricflow-backend1.onrender.com/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchVehicles(pagination.currentPage, searchTerm, statusFilter, typeFilter);
      } else {
        alert('Failed to delete vehicle');
      }
    } catch (err) {
      alert('Error deleting vehicle: ' + err.message);
    }
  };

  const handleAssignDriver = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowAssignDriverModal(true);
  };

  const handleDriverAssignment = async (driverId) => {
    try {
      const response = await fetch(`https://fabricflow-backend1.onrender.com/api/vehicles/${selectedVehicle._id}/assign-driver`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });

      if (response.ok) {
        setShowAssignDriverModal(false);
        setSelectedVehicle(null);
        fetchVehicles(pagination.currentPage, searchTerm, statusFilter, typeFilter);
        alert('Driver assigned successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to assign driver');
      }
    } catch (err) {
      alert('Error assigning driver: ' + err.message);
    }
  };

  const handleUnassignDriver = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to unassign the driver from this vehicle?')) {
      return;
    }

    try {
      const response = await fetch(`https://fabricflow-backend1.onrender.com/api/vehicles/${vehicleId}/unassign-driver`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchVehicles(pagination.currentPage, searchTerm, statusFilter, typeFilter);
        alert('Driver unassigned successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to unassign driver');
      }
    } catch (err) {
      alert('Error unassigning driver: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Under Maintenance': 'bg-yellow-100 text-yellow-800',
      'Out of Service': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getVehicleTypeIcon = (type) => {
    return <Truck className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-7 h-7 text-blue-600" />
                Vehicle Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your fleet vehicles and assignments</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by registration number, brand, model..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={handleTypeFilter}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Motorcycle">Motorcycle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getVehicleTypeIcon(vehicle.vehicleType)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.registrationNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.vehicleType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          Capacity: {vehicle.capacity}kg • {vehicle.fuelType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vehicle.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.assignedDriverId ? (
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-green-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.assignedDriverId.empName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.assignedDriverId.empPhone}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <UserX className="w-4 h-4 mr-2" />
                            <span className="text-sm">Unassigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditVehicle(vehicle)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {vehicle.assignedDriverId ? (
                            <button 
                              onClick={() => handleUnassignDriver(vehicle._id)}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                              title="Unassign Driver"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleAssignDriver(vehicle)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Assign Driver"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteVehicle(vehicle._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalVehicles)} of {pagination.totalVehicles} vehicles
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onVehicleAdded={handleVehicleAdded}
        />
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <EditVehicleModal
          vehicle={selectedVehicle}
          onClose={handleCloseEditModal}
          onVehicleUpdated={handleVehicleUpdated}
        />
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && selectedVehicle && (
        <AssignDriverModal
          vehicle={selectedVehicle}
          drivers={drivers}
          onClose={() => {
            setShowAssignDriverModal(false);
            setSelectedVehicle(null);
          }}
          onDriverAssigned={handleDriverAssignment}
        />
      )}
    </div>
  );
};

export default VehicleManagement;