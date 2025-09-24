import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function EmployeeDashboard() {
  const { user, getDisplayName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
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
                  { id: 1, task: 'Cut fabric for Order #1234', priority: 'High', deadline: '2 hours' },
                  { id: 2, task: 'Quality check for Batch #567', priority: 'Medium', deadline: '4 hours' },
                  { id: 3, task: 'Package finished garments', priority: 'Low', deadline: 'Tomorrow' }
                ].map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{task.task}</p>
                      <p className="text-sm text-gray-600">Deadline: {task.deadline}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <button className="text-[#005A54] hover:text-[#EF6869] text-sm font-medium">
                        Start
                      </button>
                    </div>
                  </div>
                ))}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
