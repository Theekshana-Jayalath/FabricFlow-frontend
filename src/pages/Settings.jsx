import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../Components/ChangePassword/ChangePassword';

function Settings() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize profile data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || user.empName || '',
        email: user.email || user.gmail || user.emailAddress || '',
        phone: user.phone || user.empPhone || '',
        address: user.address || '',
        age: user.age || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 3) return 'Name must be at least 3 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) return 'Please enter a valid phone number';
    return '';
  };

  const validateAddress = (address) => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 5) return 'Address must be at least 5 characters';
    return '';
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(profileData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(profileData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(profileData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const addressError = validateAddress(profileData.address);
    if (addressError) newErrors.address = addressError;

    if (profileData.age && (isNaN(profileData.age) || profileData.age < 18 || profileData.age > 60)) {
      newErrors.age = 'Age must be between 18 and 60';
    }

    if (profileData.gender && !['male', 'female', 'other'].includes(profileData.gender)) {
      newErrors.gender = 'Please select a valid gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Here you would call your API to update the profile
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If updateProfile function exists in your AuthContext, use it
      if (updateProfile) {
        await updateProfile(profileData);
      }

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        name: user.name || user.empName || '',
        email: user.email || user.gmail || user.emailAddress || '',
        phone: user.phone || user.empPhone || '',
        address: user.address || '',
        age: user.age || '',
        gender: user.gender || ''
      });
    }
    setErrors({});
    setSuccessMessage('');
    setIsEditing(false);
  };

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
                  
                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-800">{successMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* General Error */}
                  {errors.general && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{errors.general}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-6">
                    {!isEditing ? (
                      // View Mode
                      <>
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <p className="text-gray-900">{user?.phone || user?.empPhone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <p className="text-gray-900">{user?.address || 'Not provided'}</p>
                          </div>
                          {user?.age && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                              <p className="text-gray-900">{user.age} years</p>
                            </div>
                          )}
                          {user?.gender && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                              <p className="text-gray-900 capitalize">{user.gender}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-6">
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-[#005A54] text-white px-6 py-2 rounded-lg hover:bg-[#EF6869] transition-colors duration-200 font-medium"
                          >
                            Edit Profile
                          </button>
                        </div>
                      </>
                    ) : (
                      // Edit Mode
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your full name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors ${
                                errors.email ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your email address"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors ${
                                errors.phone ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your phone number"
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                          </div>

                          {/* Age */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                            <input
                              type="number"
                              value={profileData.age}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors ${
                                errors.age ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your age"
                              min="18"
                              max="60"
                            />
                            {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <select
                              value={profileData.gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors ${
                                errors.gender ? 'border-red-300' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                          </div>

                          {/* Role (Read-only) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <input
                              type="text"
                              value={user?.role || 'User'}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">Role cannot be changed</p>
                          </div>
                        </div>

                        {/* Address (Full Width) */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                          <textarea
                            value={profileData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors ${
                              errors.address ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter your full address"
                          />
                          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex space-x-4">
                          <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-[#005A54] text-white px-6 py-2 rounded-lg hover:bg-[#EF6869] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                          <button 
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
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
