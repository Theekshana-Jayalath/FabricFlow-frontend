import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const AllDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch drivers from employees endpoint
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/employees/drivers');
        
        if (response.data.success) {
          setDrivers(response.data.drivers || []);
          console.log(`Fetched ${response.data.count} drivers from employees`);
        } else {
          setError('Failed to fetch drivers');
        }
      } catch (err) {
        console.error('Error fetching drivers:', err);
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

  // Filter drivers based on search term
  const filteredDrivers = useMemo(() => {
    if (!searchTerm.trim()) return drivers;
    const term = searchTerm.toLowerCase();
    return drivers.filter((driver) => {
      return (
        (driver.empId || '').toLowerCase().includes(term) ||
        (driver.empName || '').toLowerCase().includes(term) ||
        (driver.empPhone || '').toLowerCase().includes(term) ||
        (driver.emailAddress || '').toLowerCase().includes(term) ||
        (driver.status || '').toLowerCase().includes(term) ||
        (driver.address || '').toLowerCase().includes(term) ||
        (driver.jobPosition || '').toLowerCase().includes(term)
      );
    });
  }, [drivers, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter(d => d.status === 'active').length;
    const inactive = drivers.filter(d => d.status === 'inactive').length;
    const terminated = drivers.filter(d => d.status === 'terminated').length;
    
    return { total, active, inactive, terminated };
  }, [drivers]);

  // Handle driver view/edit
  const handleView = (driver) => {
    setSelectedDriver(driver);
    setEditDriver({ ...driver });
    setModalOpen(true);
  };

  // Handle modal close
  const handleClose = () => {
    setModalOpen(false);
    setSelectedDriver(null);
    setEditDriver(null);
    setModalLoading(false);
  };

  // Handle driver update
  const handleUpdate = async () => {
    if (!editDriver) return;
    
    setModalLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/employees/${editDriver._id}`, {
        empId: editDriver.empId,
        empName: editDriver.empName,
        empPhone: editDriver.empPhone,
        jobPosition: editDriver.jobPosition,
        status: editDriver.status,
        address: editDriver.address,
        emailAddress: editDriver.emailAddress,
        age: editDriver.age,
        gender: editDriver.gender,
        dob: editDriver.dob
      });

      if (response.data.employee) {
        // Update the drivers list with the updated driver
        setDrivers(prev => prev.map(d => 
          d._id === editDriver._id ? response.data.employee : d
        ));
        alert('Driver updated successfully!');
        handleClose();
      }
    } catch (err) {
      console.error('Error updating driver:', err);
      alert('Failed to update driver: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!editDriver) return;
    
    setModalLoading(true);
    try {
      const updatedDriver = { ...editDriver, status: newStatus };
      const response = await axios.put(`http://localhost:5000/employees/${editDriver._id}`, {
        empId: updatedDriver.empId,
        empName: updatedDriver.empName,
        empPhone: updatedDriver.empPhone,
        jobPosition: updatedDriver.jobPosition,
        status: newStatus,
        address: updatedDriver.address,
        emailAddress: updatedDriver.emailAddress,
        age: updatedDriver.age,
        gender: updatedDriver.gender,
        dob: updatedDriver.dob
      });

      if (response.data.employee) {
        setDrivers(prev => prev.map(d => 
          d._id === editDriver._id ? response.data.employee : d
        ));
        alert(`Driver status changed to ${newStatus} successfully!`);
        handleClose();
      }
    } catch (err) {
      console.error('Error changing driver status:', err);
      alert('Failed to change status: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  // Handle PDF report generation
  const handleDownloadReport = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const title = 'Employee Drivers Report';
    const subtitle = searchTerm ? `Filtered by: ${searchTerm}` : 'All employee drivers';
    const genAt = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text(title, 14, 14);
    doc.setFontSize(10);
    doc.text(subtitle, 14, 20);
    doc.text(`Generated at: ${genAt}`, 14, 26);

    const rows = filteredDrivers.map((driver, idx) => [
      idx + 1,
      driver.empId || '-',
      driver.empName || '-',
      driver.empPhone || '-',
      driver.emailAddress || '-',
      driver.status || '-',
      (driver.address || '').substring(0, 50),
      driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : '-'
    ]);

    autoTable(doc, {
      startY: 32,
      head: [[
        '#', 'Employee ID', 'Name', 'Phone', 'Email', 'Status', 'Address', 'Created Date'
      ]],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 90, 84] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 28 },
        4: { cellWidth: 45 },
        5: { cellWidth: 20 },
        6: { cellWidth: 50 },
        7: { cellWidth: 25 }
      }
    });

    doc.save(`employee-drivers-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#005A54]">
          All Employee Drivers
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 border border-[#005A54] text-[#005A54] rounded-lg hover:bg-[#005A54] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-700 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-4">
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.5 2.5 0 0017.5 7H14.5c-.93 0-1.81.62-2.06 1.52L10.91 16H8v-4c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55.45 1 1 1h2.91l1.53-7.37A.503.503 0 0112 10h3l1.5 4.5v7.5c0 .55.45 1 1 1s1-.45 1-1z"/>
            </svg>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm">Total Drivers</div>
            </div>
          </div>
        </div>
        <div className="bg-green-700 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-4">
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-sm">Active Drivers</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-600 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-4">
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
            </svg>
            <div>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <div className="text-sm">Inactive Drivers</div>
            </div>
          </div>
        </div>
        <div className="bg-red-500 text-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-4">
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div>
              <div className="text-2xl font-bold">{stats.terminated}</div>
              <div className="text-sm">Terminated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee ID, name, phone, email, status, or address..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
          />
        </div>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005A54]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#005A54] rounded-full flex items-center justify-center text-white font-medium">
                          {driver.empName ? driver.empName.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {driver.empName || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.empId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.empPhone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.emailAddress || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        driver.status === 'active' ? 'bg-green-500 text-white' : 
                        driver.status === 'inactive' ? 'bg-red-500 text-white' : 
                        driver.status === 'terminated' ? 'bg-gray-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {driver.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {driver.address ? 
                          (driver.address.length > 50 ? 
                            `${driver.address.substring(0, 50)}...` : 
                            driver.address
                          ) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleView(driver)}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-[#005A54] text-[#005A54] rounded-lg hover:bg-[#005A54] hover:text-white transition-colors mx-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Driver Details</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {editDriver && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={editDriver.empId || ''}
                      onChange={e => setEditDriver({ ...editDriver, empId: e.target.value })}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                    <input
                      type="text"
                      value={editDriver.empName || ''}
                      onChange={e => setEditDriver({ ...editDriver, empName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={editDriver.empPhone || ''}
                      onChange={e => setEditDriver({ ...editDriver, empPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editDriver.emailAddress || ''}
                      onChange={e => setEditDriver({ ...editDriver, emailAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editDriver.status || 'active'}
                      onChange={e => setEditDriver({ ...editDriver, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={editDriver.age || ''}
                      onChange={e => setEditDriver({ ...editDriver, age: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={editDriver.address || ''}
                      onChange={e => setEditDriver({ ...editDriver, address: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A54] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={modalLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={modalLoading || (editDriver && editDriver.status === 'inactive')}
                className="px-4 py-2 text-orange-700 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Inactive
              </button>
              <button
                onClick={() => handleStatusChange('terminated')}
                disabled={modalLoading || (editDriver && editDriver.status === 'terminated')}
                className="px-4 py-2 text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Terminate
              </button>
              <button
                onClick={handleUpdate}
                disabled={modalLoading}
                className="px-4 py-2 bg-[#005A54] text-white rounded-lg hover:bg-[#004A44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDrivers;
