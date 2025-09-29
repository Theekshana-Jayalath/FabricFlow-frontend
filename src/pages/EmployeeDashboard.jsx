import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function EmployeeDashboard() {
  const { user, getDisplayName, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedJobPosition, setSelectedJobPosition] = useState('');

  // Job positions from signup form
  const jobPositions = [
    { value: '', label: 'All Positions' },
    { value: 'Production Manager', label: 'Production Manager' },
    { value: 'Quality Controller', label: 'Quality Controller' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Operator', label: 'Operator' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Driver', label: 'Driver' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleJobPositionChange = (e) => {
    setSelectedJobPosition(e.target.value);
    // Here you can add logic to filter content based on selected job position
    console.log('Selected job position:', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#005A54] to-[#EF6869] text-white p-8 rounded-lg mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Employee Portal - Welcome, {getDisplayName()}!
              </h1>
              <p className="text-lg opacity-90">
                Manage your production tasks and quality control activities
              </p>
            </div>
            
            {/* Logout Button */}
            <div className="flex items-center space-x-4">
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

        {/* Job Position Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Filter by Job Position</h2>
              <p className="text-sm text-gray-600">Select a job position to view relevant tasks and information</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedJobPosition}
                  onChange={handleJobPositionChange}
                  className="appearance-none bg-white border-2 border-gray-300 hover:border-[#005A54] focus:border-[#005A54] focus:ring-2 focus:ring-[#005A54]/20 focus:outline-none px-4 py-3 pr-10 rounded-lg font-medium text-gray-700 min-w-[200px] transition-all duration-200"
                >
                  {jobPositions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedJobPosition && (
                <button
                  onClick={() => setSelectedJobPosition('')}
                  className="bg-[#EF6869] hover:bg-[#EF6869]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Clear Filter</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Selected Position Info */}
          {selectedJobPosition && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#005A54]/10 to-[#EF6869]/10 rounded-lg border-l-4 border-[#005A54]">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#005A54] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">👷</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Viewing content for: <span className="text-[#005A54]">{selectedJobPosition}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Tasks and information relevant to this position are highlighted below
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-sm">🔍</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">QC Pending</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 text-sm">⏱️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Today</p>
                <p className="text-2xl font-bold text-gray-900">6.5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Tasks */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Current Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: 1, task: 'Cut fabric for Order #1234', priority: 'High', deadline: '2 hours', position: 'Operator' },
                  { id: 2, task: 'Quality check for Batch #567', priority: 'Medium', deadline: '4 hours', position: 'Quality Controller' },
                  { id: 3, task: 'Package finished garments', priority: 'Low', deadline: 'Tomorrow', position: 'Operator' },
                  { id: 4, task: 'Design review for new collection', priority: 'High', deadline: '1 day', position: 'Designer' },
                  { id: 5, task: 'Supervise production line A', priority: 'Medium', deadline: '3 hours', position: 'Supervisor' },
                  { id: 6, task: 'Equipment maintenance check', priority: 'High', deadline: '4 hours', position: 'Maintenance' },
                  { id: 7, task: 'Deliver materials to warehouse', priority: 'Medium', deadline: '2 days', position: 'Driver' },
                  { id: 8, task: 'Production planning meeting', priority: 'High', deadline: '1 hour', position: 'Production Manager' }
                ].filter(task => !selectedJobPosition || task.position === selectedJobPosition).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#005A54] transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{task.task}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-600">Deadline: {task.deadline}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {task.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <button className="text-[#005A54] hover:text-[#EF6869] text-sm font-medium transition-colors">
                        Start
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* No tasks message when filtered */}
                {selectedJobPosition && [
                  { id: 1, task: 'Cut fabric for Order #1234', priority: 'High', deadline: '2 hours', position: 'Operator' },
                  { id: 2, task: 'Quality check for Batch #567', priority: 'Medium', deadline: '4 hours', position: 'Quality Controller' },
                  { id: 3, task: 'Package finished garments', priority: 'Low', deadline: 'Tomorrow', position: 'Operator' },
                  { id: 4, task: 'Design review for new collection', priority: 'High', deadline: '1 day', position: 'Designer' },
                  { id: 5, task: 'Supervise production line A', priority: 'Medium', deadline: '3 hours', position: 'Supervisor' },
                  { id: 6, task: 'Equipment maintenance check', priority: 'High', deadline: '4 hours', position: 'Maintenance' },
                  { id: 7, task: 'Deliver materials to warehouse', priority: 'Medium', deadline: '2 days', position: 'Driver' },
                  { id: 8, task: 'Production planning meeting', priority: 'High', deadline: '1 hour', position: 'Production Manager' }
                ].filter(task => task.position === selectedJobPosition).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="font-medium">No tasks found for {selectedJobPosition}</p>
                    <p className="text-sm">Try selecting a different job position or clear the filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Production Overview */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Production Overview</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Daily Target</span>
                    <span className="text-sm text-gray-600">8/10 items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#005A54] h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Target</span>
                    <span className="text-sm text-gray-600">45/50 items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#EF6869] h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Quality Score</span>
                    <span className="text-sm text-gray-600">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button className="p-4 border-2 border-[#005A54] text-[#005A54] rounded-lg hover:bg-[#005A54] hover:text-white transition-colors">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">View All Tasks</div>
            </button>
            <button className="p-4 border-2 border-[#EF6869] text-[#EF6869] rounded-lg hover:bg-[#EF6869] hover:text-white transition-colors">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-medium">Quality Control</div>
            </button>
            <button className="p-4 border-2 border-[#005A54] text-[#005A54] rounded-lg hover:bg-[#005A54] hover:text-white transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">View Reports</div>
            </button>
            <button className="p-4 border-2 border-[#EF6869] text-[#EF6869] rounded-lg hover:bg-[#EF6869] hover:text-white transition-colors">
              <div className="text-2xl mb-2">⏰</div>
              <div className="text-sm font-medium">Clock In/Out</div>
            </button>
            <button 
              onClick={() => navigate('/driver/dashboard')}
              className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <div className="text-2xl mb-2">🚚</div>
              <div className="text-sm font-medium">Driver Dashboard</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
