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
  const [showPassword, setShowPassword] = useState(false); // Add password visibility state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Add confirm password visibility state

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
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Driver', label: 'Driver' }
  ];

  // Function to calculate age from date of birth
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (birthDate >= today) return '';
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Initialize updated form data
    let updatedFormData = {
      ...formData,
      [name]: value
    };
    
    // Auto-calculate age when date of birth is entered
    if (name === 'dob') {
      const calculatedAge = calculateAgeFromDOB(value);
      if (calculatedAge) {
        updatedFormData.age = calculatedAge;
      }
    }
    
    // Update form data
    setFormData(updatedFormData);
    
    // Real-time validation
    const newErrors = { ...errors };
    
    // Clear existing error for this field
    if (newErrors[name]) {
      delete newErrors[name];
    }
    
    // Clear age error if DOB auto-calculated the age
    if (name === 'dob' && updatedFormData.age && newErrors.age) {
      delete newErrors.age;
    }
    
    // Validate the current field in real-time
    let fieldError = '';
    
    switch (name) {
      case 'empId':
        fieldError = validateEmployeeId(value);
        break;
      case 'name':
      case 'empName':
        fieldError = validateName(value);
        break;
      case 'gmail':
      case 'emailAddress':
        fieldError = validateEmail(value);
        break;
      case 'jobPosition':
        fieldError = validateJobPosition(value);
        break;
      case 'phone':
      case 'empPhone':
        fieldError = validatePhone(value);
        break;
      case 'address':
        fieldError = validateAddress(value);
        break;
      case 'age':
        fieldError = validateAge(value, formData.dob);
        break;
      case 'gender':
        fieldError = validateGender(value);
        break;
      case 'dob':
        fieldError = validateDateOfBirth(value);
        // Auto-calculated age should be validated against the new DOB
        if (!fieldError && updatedFormData.age) {
          const ageError = validateAge(updatedFormData.age, value);
          if (ageError && ageError.includes('date of birth')) {
            newErrors.age = ageError;
          } else if (newErrors.age && newErrors.age.includes('date of birth')) {
            delete newErrors.age;
          }
        }
        break;
      case 'password':
        fieldError = validatePassword(value);
        // Also revalidate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          if (confirmError) {
            newErrors.confirmPassword = confirmError;
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }
    
    // Add error if validation failed
    if (fieldError) {
      newErrors[name] = fieldError;
    }
    
    // Update errors state
    setErrors(newErrors);
  };

  // Validation helper functions
  const validateEmployeeId = (empId) => {
    if (!empId.trim()) {
      return 'Employee ID is required';
    }
    if (!/^[a-zA-Z0-9]{4,10}$/.test(empId.trim())) {
      return 'Employee ID must be 4-10 alphanumeric characters only';
    }
    return '';
  };

  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    const trimmed = email.trim();
    
    if (!trimmed) {
      return 'Email is required';
    }
    
    // Length validation
    if (trimmed.length > 100) {
      return 'Email must not exceed 100 characters';
    }
    
    // Check for spaces
    if (/\s/.test(trimmed)) {
      return 'Email cannot contain spaces';
    }
    
    // First letter must be simple (lowercase letter)
    if (!/^[a-z]/.test(trimmed)) {
      return 'Email must start with a simple lowercase letter (a-z)';
    }
    
    // Enhanced email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (name@domain.com)';
    }
    
    // Check for consecutive dots
    if (/\.{2,}/.test(trimmed)) {
      return 'Email cannot contain consecutive dots';
    }
    
    // Check for invalid characters at start/end
    if (/^[.-]|[.-]$/.test(trimmed)) {
      return 'Email cannot start or end with dots or hyphens';
    }
    
    // Check domain part specifically
    const atIndex = trimmed.indexOf('@');
    if (atIndex > 0) {
      const domain = trimmed.substring(atIndex + 1);
      if (domain.length < 3) {
        return 'Domain must be at least 3 characters long';
      }
      if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
        return 'Domain contains invalid characters';
      }
    }
    
    return '';
  };

  const validateJobPosition = (jobPosition) => {
    if (!jobPosition || jobPosition === '') {
      return 'Please select a job position';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    // Allow formats: +94xxxxxxxxx or 0xxxxxxxxx or xxxxxxxxx
    const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
      return 'Please enter a valid phone number (10 digits)';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address.trim()) {
      return 'Address is required';
    }
    if (address.trim().length < 5) {
      return 'Address must be at least 5 characters';
    }
    // Allow letters, numbers, spaces, commas, dots, slashes - no special chars
    if (!/^[a-zA-Z0-9\s,./\-]+$/.test(address.trim())) {
      return 'Address contains invalid characters';
    }
    return '';
  };

  const validateAge = (age, dob = null) => {
    if (!age) {
      return 'Age is required';
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 60) {
      return 'Age must be between 18 and 60 years';
    }
    
    // Enhanced cross-validation with DOB if provided
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      
      // Calculate age more accurately
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      // Allow exact match or difference of 1 year (for birthday timing)
      if (Math.abs(calculatedAge - ageNum) > 1) {
        return `Age should be ${calculatedAge} based on date of birth`;
      }
    }
    return '';
  };

  const validateGender = (gender) => {
    if (!gender || gender === '') {
      return 'Please select your gender';
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return 'Please select a valid gender option';
    }
    return '';
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) {
      return 'Date of birth is required';
    }
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (birthDate >= today) {
      return 'Date of birth cannot be in the future';
    }
    
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18 || age > 60) {
      return 'Age must be between 18 and 60 years';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowercase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    
    // Common passwords check
    const commonPasswords = ['password', '12345678', 'password123', 'admin123', 'qwerty123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return 'Please choose a more secure password';
    }
    
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Toggle password visibility functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    // Trim all string inputs
    const trimmedData = {
      ...formData,
      name: formData.name?.trim(),
      empName: formData.empName?.trim(),
      empId: formData.empId?.trim(),
      gmail: formData.gmail?.trim(),
      emailAddress: formData.emailAddress?.trim(),
      phone: formData.phone?.trim(),
      empPhone: formData.empPhone?.trim(),
      address: formData.address?.trim()
    };

    // Common validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Password validation (common for all roles)
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    // Role-specific validation
    if (formData.role === 'user') {
      const nameError = validateName(trimmedData.name);
      if (nameError) newErrors.name = nameError;

      const emailError = validateEmail(trimmedData.gmail);
      if (emailError) newErrors.gmail = emailError;

      const phoneError = validatePhone(trimmedData.phone);
      if (phoneError) newErrors.phone = phoneError;

      const addressError = validateAddress(trimmedData.address);
      if (addressError) newErrors.address = addressError;

      const ageError = validateAge(formData.age, formData.dob);
      if (ageError) newErrors.age = ageError;

      const genderError = validateGender(formData.gender);
      if (genderError) newErrors.gender = genderError;

      const dobError = validateDateOfBirth(formData.dob);
      if (dobError) newErrors.dob = dobError;

    } else if (formData.role === 'employee') {
      const empIdError = validateEmployeeId(trimmedData.empId);
      if (empIdError) newErrors.empId = empIdError;

      const empNameError = validateName(trimmedData.empName);
      if (empNameError) newErrors.empName = empNameError;

      const emailError = validateEmail(trimmedData.emailAddress);
      if (emailError) newErrors.emailAddress = emailError;

      const jobPositionError = validateJobPosition(formData.jobPosition);
      if (jobPositionError) newErrors.jobPosition = jobPositionError;

      const phoneError = validatePhone(trimmedData.empPhone);
      if (phoneError) newErrors.empPhone = phoneError;

      const addressError = validateAddress(trimmedData.address);
      if (addressError) newErrors.address = addressError;

      const ageError = validateAge(formData.age, formData.dob);
      if (ageError) newErrors.age = ageError;

      const genderError = validateGender(formData.gender);
      if (genderError) newErrors.gender = genderError;

      const dobError = validateDateOfBirth(formData.dob);
      if (dobError) newErrors.dob = dobError;

    } else if (formData.role === 'admin') {
      const nameError = validateName(trimmedData.name);
      if (nameError) newErrors.name = nameError;

      const emailError = validateEmail(trimmedData.gmail);
      if (emailError) newErrors.gmail = emailError;
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
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#EF6869] focus:border-[#EF6869] sm:text-sm ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
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
