import React, { useState } from 'react';
import { X, User, Phone, Mail, IdCard } from 'lucide-react';

const AssignDriverModal = ({ vehicle, drivers, onClose, onDriverAssigned }) => {
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDriverId) {
      alert('Please select a driver');
      return;
    }

    setLoading(true);
    try {
      await onDriverAssigned(selectedDriverId);
    } catch (error) {
      console.error('Error assigning driver:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDriver = drivers.find(driver => driver._id === selectedDriverId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Driver</h2>
            <p className="text-sm text-gray-600">
              Assign a driver to vehicle {vehicle.registrationNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Driver *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drivers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No drivers available</p>
              ) : (
                drivers.map((driver) => (
                  <label
                    key={driver._id}
                    className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDriverId === driver._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="driver"
                      value={driver._id}
                      checked={selectedDriverId === driver._id}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {driver.empName}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            driver.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {driver.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          {driver.empPhone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{driver.empPhone}</span>
                            </div>
                          )}
                          {driver.empId && (
                            <div className="flex items-center space-x-1">
                              <IdCard className="w-3 h-3" />
                              <span>{driver.empId}</span>
                            </div>
                          )}
                        </div>
                        {driver.emailAddress && (
                          <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span>{driver.emailAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {selectedDriver && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Driver Details</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {selectedDriver.empName}</p>
                <p><strong>Employee ID:</strong> {selectedDriver.empId}</p>
                <p><strong>Phone:</strong> {selectedDriver.empPhone}</p>
                <p><strong>Status:</strong> {selectedDriver.status}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDriverId || drivers.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Assigning...' : 'Assign Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDriverModal;