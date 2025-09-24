import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../Components/ChangePassword/ChangePassword';

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#005A54] to-[#EF6869] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#005A54] text-[#005A54]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <p className="text-gray-900">{user?.name || user?.empName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{user?.email || user?.gmail || user?.emailAddress || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <p className="text-gray-900 capitalize">{user?.role || 'User'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                        <p className="text-gray-600 text-sm font-mono">{user?._id || 'Not available'}</p>
                      </div>
                      {user?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-gray-900">{user.phone}</p>
                        </div>
                      )}
                      {user?.address && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <p className="text-gray-900">{user.address}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6">
                      <button className="bg-[#005A54] text-white px-4 py-2 rounded-md hover:bg-[#EF6869] transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Change Password Section */}
                    <div>
                      <ChangePassword />
                    </div>
                    
                    {/* Security Information */}
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Security Status</h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Account is active
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Password is secured
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Email verified
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2">Security Recommendations</h4>
                        <ul className="space-y-1 text-sm text-yellow-800">
                          <li>• Change your password regularly</li>
                          <li>• Use a strong, unique password</li>
                          <li>• Don't share your login credentials</li>
                          <li>• Log out from shared devices</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Account Actions</h4>
                        <div className="space-y-3">
                          <button className="w-full text-left px-3 py-2 text-sm text-[#005A54] hover:bg-white rounded-md border border-[#005A54] transition-colors">
                            Download Account Data
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-300 transition-colors">
                            Deactivate Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-6">
                    {/* Notification Preferences */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                            <p className="text-sm text-gray-500">Receive updates via email</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-[#005A54] focus:ring-[#005A54] border-gray-300 rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Order Updates</label>
                            <p className="text-sm text-gray-500">Get notified about order status changes</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-[#005A54] focus:ring-[#005A54] border-gray-300 rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">System Alerts</label>
                            <p className="text-sm text-gray-500">Important system notifications</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-[#005A54] focus:ring-[#005A54] border-gray-300 rounded" defaultChecked />
                        </div>
                      </div>
                    </div>

                    {/* Display Preferences */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Display</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                          <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#005A54] focus:border-[#005A54] sm:text-sm rounded-md">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>Auto</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#005A54] focus:border-[#005A54] sm:text-sm rounded-md">
                            <option>English</option>
                            <option>Sinhala</option>
                            <option>Tamil</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button className="bg-[#005A54] text-white px-4 py-2 rounded-md hover:bg-[#EF6869] transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
