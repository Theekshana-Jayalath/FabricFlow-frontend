import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleOAuthButton from '../auth/GoogleOAuthButton';

function Register() {
  const navigate = useNavigate();
  const { register, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    // Common fields
    role: 'user',
    password: '',
    confirmPassword: '',
    
    // User fields (UserModel)
    name: '',
    gmail: '',
    age: '',
    address: '',
    phone: '',
    gender: '',
    dob: '',
    
    // Employee fields (EmployeeModel)
    empId: '',
    empName: '',
    empPhone: '',
    jobPosition: '',
    status: 'active',
    emailAddress: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'user', label: 'User', description: 'Basic access to place orders and view reports' },
    { value: 'employee', label: 'Employee', description: 'Access to production and quality control' },
    { value: 'admin', label: 'Admin', description: 'Full system access and management' }
  ];

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const jobPositions = [
    { value: '', label: 'Select Position' },
    { value: 'Production Manager', label: 'Production Manager' },
    { value: 'Quality Controller', label: 'Quality Controller' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Operator', label: 'Operator' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Role-specific validation
    if (formData.role === 'user') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.gmail) {
        newErrors.gmail = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.gmail)) {
        newErrors.gmail = 'Email is invalid';
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (formData.age < 1 || formData.age > 120) {
        newErrors.age = 'Please enter a valid age';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    } else if (formData.role === 'employee') {
      if (!formData.empId.trim()) {
        newErrors.empId = 'Employee ID is required';
      }
      if (!formData.empName.trim()) {
        newErrors.empName = 'Employee name is required';
      }
      if (!formData.emailAddress) {
        newErrors.emailAddress = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
        newErrors.emailAddress = 'Email is invalid';
      }
      if (!formData.jobPosition) {
        newErrors.jobPosition = 'Job position is required';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    } else if (formData.role === 'admin') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.gmail) {
        newErrors.gmail = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.gmail)) {
        newErrors.gmail = 'Email is invalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data based on role
      let registrationData = {
        role: formData.role,
        password: formData.password
      };

      if (formData.role === 'user') {
        registrationData = {
          ...registrationData,
          name: formData.name,
          gmail: formData.gmail,
          age: parseInt(formData.age),
          address: formData.address,
          phone: formData.phone,
          gender: formData.gender || null,
          dob: formData.dob ? new Date(formData.dob) : null
        };
      } else if (formData.role === 'employee') {
        registrationData = {
          ...registrationData,
          empId: formData.empId,
          empName: formData.empName,
          empPhone: formData.empPhone,
          jobPosition: formData.jobPosition,
          status: formData.status,
          address: formData.address,
          emailAddress: formData.emailAddress,
          dob: formData.dob ? new Date(formData.dob) : null,
          gender: formData.gender || null,
          age: formData.age ? parseInt(formData.age) : null
        };
      } else if (formData.role === 'admin') {
        registrationData = {
          ...registrationData,
          name: formData.name,
          gmail: formData.gmail
        };
      }
      
      const result = await register(registrationData);
      
      if (result.success) {
        // Navigate based on user role
        const userRole = result.user.role;
        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'employee':
            navigate('/employee/dashboard');
            break;
          case 'user':
            navigate('/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#005A54] to-[#EF6869] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">FF</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Join FabricFlow Today
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account and get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border-t-4 border-[#EF6869]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select your role
              </label>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.value} className="relative">
                    <label className={`cursor-pointer block p-3 border rounded-lg transition-colors ${
                      formData.role === role.value
                        ? 'border-[#EF6869] bg-[#FFEED6]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 text-[#EF6869] focus:ring-[#EF6869] border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* User-specific fields */}
            {formData.role === 'user' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="gmail"
                      name="gmail"
                      type="email"
                      value={formData.gmail}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.gmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.gmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.gmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <div className="mt-1">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.age ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Age"
                      />
                      {errors.age && (
                        <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <div className="mt-1">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.gender ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Phone number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <div className="mt-1">
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.dob ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.dob && (
                        <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Employee-specific fields */}
            {formData.role === 'employee' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="empId" className="block text-sm font-medium text-gray-700">
                      Employee ID
                    </label>
                    <div className="mt-1">
                      <input
                        id="empId"
                        name="empId"
                        type="text"
                        value={formData.empId}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.empId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Employee ID"
                      />
                      {errors.empId && (
                        <p className="mt-1 text-sm text-red-600">{errors.empId}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="empName" className="block text-sm font-medium text-gray-700">
                      Employee Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="empName"
                        name="empName"
                        type="text"
                        value={formData.empName}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.empName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Full name"
                      />
                      {errors.empName && (
                        <p className="mt-1 text-sm text-red-600">{errors.empName}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="emailAddress"
                      name="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.emailAddress ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.emailAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700">
                      Job Position
                    </label>
                    <div className="mt-1">
                      <select
                        id="jobPosition"
                        name="jobPosition"
                        value={formData.jobPosition}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.jobPosition ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {jobPositions.map((position) => (
                          <option key={position.value} value={position.value}>
                            {position.label}
                          </option>
                        ))}
                      </select>
                      {errors.jobPosition && (
                        <p className="mt-1 text-sm text-red-600">{errors.jobPosition}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="empPhone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="empPhone"
                        name="empPhone"
                        type="tel"
                        value={formData.empPhone}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.empPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Phone number"
                      />
                      {errors.empPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.empPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <div className="mt-1">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.age ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Age"
                      />
                      {errors.age && (
                        <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <div className="mt-1">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                          errors.gender ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="mt-1">
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.dob ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.dob && (
                      <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Admin-specific fields */}
            {formData.role === 'admin' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="gmail" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="gmail"
                      name="gmail"
                      type="email"
                      value={formData.gmail}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                        errors.gmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.gmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.gmail}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                  isLoading || authLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#EF6869] hover:bg-[#005A54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF6869]'
                }`}
              >
                {isLoading || authLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div>
              <GoogleOAuthButton mode="register" />
            </div>

            {/* Login Link */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#EF6869] hover:text-[#005A54] transition-colors"
                >
                  Sign in here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your password?{' '}
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#005A54] hover:text-[#EF6869] transition-colors"
                >
                  Reset it here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
