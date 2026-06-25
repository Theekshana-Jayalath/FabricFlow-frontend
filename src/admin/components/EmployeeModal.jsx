import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Divider,
  MenuItem,
  InputAdornment,
  Avatar,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';

const EmployeeModal = ({ open, onClose, employee, mode, onEmployeeUpdate }) => {
  const getInitialFormData = () => ({
    empName: '',
    empID: '',
    jobPosition: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    password: '', // Always start empty
    age: '',
    dob: '',
    gender: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Add password visibility state

  const jobPositions = [
    'Manager',
    'Supervisor',
    'Team Lead',
    'Senior Officer',
    'Officer',
    'Assistant',
    'Intern',
    'Consultant',
    'Specialist',
    'Driver'
  ];

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = ['Active', 'Inactive', 'On Leave', 'Terminated'];

  useEffect(() => {
    if (employee && mode !== 'create') {
      setFormData({
        empName: employee.empName || '',
        empID: employee.empID || '',
        jobPosition: employee.jobPosition || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        status: employee.status || 'Active',
        password: '', // Always clear password for existing employees
        age: employee.age || '',
        dob: employee.dob ? employee.dob.split('T')[0] : '',
        gender: employee.gender || ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode - use fresh data
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [employee, mode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // When modal opens, reset everything if it's create mode
      if (mode === 'create') {
        setFormData(getInitialFormData());
      }
      setShowPassword(false);
      setErrors({});
    } else {
      // Clear form data when modal closes
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [open, mode]);

  // Comprehensive validation helper functions
  const validateEmployeeId = (empID) => {
    const trimmed = empID.trim();
    if (!trimmed) {
      return 'Employee ID is required';
    }
    if (!/^[a-zA-Z0-9]{4,10}$/.test(trimmed)) {
      return 'Employee ID must be 4-10 alphanumeric characters only (no special characters)';
    }
    return '';
  };

  const validateEmployeeName = (empName) => {
    const trimmed = empName.trim();
    if (!trimmed) {
      return 'Employee name is required';
    }
    if (trimmed.length < 3) {
      return 'Employee name must be at least 3 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
      return 'Employee name can only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateAge = (age) => {
    if (!age) {
      return 'Age is required';
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      return 'Age must be between 18 and 65 years';
    }
    return '';
  };

  const validateGender = (gender) => {
    if (!gender || gender === '') {
      return 'Please select gender';
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
    if (age < 18 || age > 65) {
      return 'Age must be between 18 and 65 years based on date of birth';
    }
    return '';
  };

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

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (field, value) => {
    // Trim whitespace for relevant fields
    let processedValue = value;
    if (['empName', 'empID', 'email'].includes(field)) {
      processedValue = value.trim();
    }

    // Initialize updated form data
    let updatedFormData = {
      ...formData,
      [field]: processedValue
    };

    // Auto-calculate age when date of birth is entered
    if (field === 'dob') {
      const calculatedAge = calculateAgeFromDOB(processedValue);
      if (calculatedAge) {
        updatedFormData.age = calculatedAge;
      }
    }

    setFormData(updatedFormData);
    
    // Real-time validation
    const newErrors = { ...errors };
    
    if (newErrors[field]) {
      delete newErrors[field];
    }

    // Clear age error if DOB auto-calculated the age
    if (field === 'dob' && updatedFormData.age && newErrors.age) {
      delete newErrors.age;
    }
    
    // Validate current field
    let fieldError = '';
    
    switch (field) {
      case 'empID':
        fieldError = validateEmployeeId(processedValue);
        break;
      case 'empName':
        fieldError = validateEmployeeName(processedValue);
        break;
      case 'email':
        fieldError = validateEmail(processedValue);
        break;
      case 'password':
        fieldError = validatePassword(processedValue);
        break;
      case 'age':
        fieldError = validateAge(processedValue);
        break;
      case 'gender':
        fieldError = validateGender(processedValue);
        break;
      case 'dob':
        fieldError = validateDateOfBirth(processedValue);
        break;
      default:
        break;
    }
    
    if (fieldError) {
      newErrors[field] = fieldError;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    console.log('🔍 VALIDATION DEBUG - Starting form validation');
    console.log('Form data being validated:', JSON.stringify(formData, null, 2));
    
    const newErrors = {};
    
    // Check Employee Name
    console.log('Checking empName:', formData.empName);
    const empNameError = validateEmployeeName(formData.empName);
    if (empNameError) {
      console.log('❌ Employee Name Error:', empNameError);
      newErrors.empName = empNameError;
    }
    
    if (!formData.empName.trim()) {
      console.log('❌ Employee Name is empty');
      newErrors.empName = 'Employee name is required';
    }
    
    // Check Employee ID  
    console.log('Checking empID:', formData.empID);
    if (!formData.empID.trim()) {
      console.log('❌ Employee ID is empty');
      newErrors.empID = 'Employee ID is required';  
    }
    
    const empIDError = validateEmployeeId(formData.empID);
    if (empIDError) {
      console.log('❌ Employee ID Error:', empIDError);
      newErrors.empID = empIDError;
    }
    
    // Check Email
    console.log('Checking email:', formData.email);
    if (!formData.email.trim()) {
      console.log('❌ Email is empty');
      newErrors.email = 'Email is required';
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      console.log('❌ Email Error:', emailError);
      newErrors.email = emailError;
    }
    
    // Check Address
    console.log('Checking address:', formData.address);
    if (!formData.address.trim()) {
      console.log('❌ Address is empty');
      newErrors.address = 'Address is required';
    }

    // Check Job Position
    console.log('Checking jobPosition:', formData.jobPosition);
    if (!formData.jobPosition) {
      console.log('❌ Job Position is empty');
      newErrors.jobPosition = 'Job position is required';
    }

    // Check Password (only for create mode)
    if (mode === 'create') {
      console.log('Checking password:', formData.password ? '[HIDDEN]' : 'empty');
      if (!formData.password) {
        console.log('❌ Password is empty');
        newErrors.password = 'Password is required';
      } else {
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          console.log('❌ Password Error:', passwordError);
          newErrors.password = passwordError;
        }
      }
    }

    console.log('🔍 All validation errors found:', JSON.stringify(newErrors, null, 2));
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 Form validation result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    return isValid;
  };

  const handleSave = async () => {
    console.log('=== EMPLOYEE CREATION DEBUG START ===');
    console.log('Current Form Data:', JSON.stringify(formData, null, 2));
    console.log('Current Errors before validation:', JSON.stringify(errors, null, 2));
    console.log('Mode:', mode);
    
    if (!validateForm()) {
      console.log('❌ FORM VALIDATION FAILED!');
      console.log('Validation errors after validateForm():', JSON.stringify(errors, null, 2));
      return;
    }

    console.log('✅ Form validation passed, proceeding with save...');
    setLoading(true);
    
    try {
      let response;
      
      if (mode === 'create') {
        // Create new employee - simulate successful creation for now
        const newEmployee = {
          _id: Date.now().toString(), // Generate temporary ID
          empId: formData.empID,
          empName: formData.empName,
          empPhone: formData.phone || '',
          jobPosition: formData.jobPosition,
          status: formData.status.toLowerCase(),
          address: formData.address,
          emailAddress: formData.email,
          createdAt: new Date().toISOString()
        };
        
        console.log('Creating new employee locally:', newEmployee);
        
        // Try to save to backend first since it's running
        try {
          const backendData = {
            empId: formData.empID,
            empName: formData.empName,
            empPhone: formData.phone || '',
            jobPosition: formData.jobPosition || 'Officer', // Required field - default if not selected
            status: formData.status.toLowerCase(),
            address: formData.address || 'Not specified', // Required field - default if empty
            emailAddress: formData.email, // Required field
            password: formData.password, // Use password from form
            role: 'employee', // Default role
            dob: formData.dob ? new Date(formData.dob) : null, // Use actual DOB field
            gender: formData.gender || null, // Use actual gender field
            age: formData.age ? parseInt(formData.age) : null // Use actual age field
          };
          
          console.log('🚀 Sending employee data to backend...');
          console.log('Backend Data:', JSON.stringify(backendData, null, 2));
          console.log('POST URL: https://fabricflow-backend1.onrender.com/employees');
          
          // Validate required fields before sending
          const missingFields = [];
          if (!backendData.empId) missingFields.push('Employee ID');
          if (!backendData.empName) missingFields.push('Employee Name'); 
          if (!backendData.jobPosition) missingFields.push('Job Position');
          if (!backendData.address || backendData.address === 'Not specified') missingFields.push('Address');
          if (!backendData.emailAddress) missingFields.push('Email Address');
          
          if (missingFields.length > 0) {
            console.error('❌ Missing required fields:', missingFields);
            setErrors({ submit: `Missing required fields: ${missingFields.join(', ')}` });
            setLoading(false);
            return;
          }
          
          const backendResponse = await axios.post('https://fabricflow-backend1.onrender.com/employees', backendData);
          console.log('✅ SUCCESS! Employee saved to backend:', backendResponse.data);
          
          // Check if the response indicates success
          if (backendResponse.status === 201 && backendResponse.data.success) {
            response = backendResponse;
            console.log('✅ Backend confirmed successful creation');
          } else if (backendResponse.status === 201 && backendResponse.data.employee) {
            // Handle legacy response format (without success field)
            response = backendResponse;
            console.log('✅ Employee created (legacy response format)');
          } else {
            throw new Error('Unexpected response format from backend');
          }
          
        } catch (backendError) {
          console.error('❌ BACKEND ERROR Details:');
          console.error('Error message:', backendError.message);
          console.error('Error response data:', backendError.response?.data);
          console.error('Error status:', backendError.response?.status);
          console.error('Full error object:', backendError);
          
          // Get the actual error message from backend
          const backendErrorMessage = backendError.response?.data?.message || 
                                     backendError.response?.data?.error || 
                                     backendError.message || 
                                     'Unknown server error';
          
          // Show specific error messages based on the backend response
          if (backendError.response?.status === 400) {
            console.log('🚫 Validation error from backend');
            if (backendErrorMessage.includes('Employee ID already exists')) {
              setErrors({ empID: 'This Employee ID is already taken. Please use a different ID.' });
            } else if (backendErrorMessage.includes('Email address already exists')) {
              setErrors({ email: 'This email address is already registered. Please use a different email.' });
            } else if (backendErrorMessage.includes('required')) {
              setErrors({ submit: `Missing required field: ${backendErrorMessage}` });
            } else {
              setErrors({ submit: `Validation Error: ${backendErrorMessage}` });
            }
            setLoading(false);
            return;
          } else if (backendError.response?.status === 500) {
            console.log('� Server error from backend');
            setErrors({ submit: `Server Error: Please try again later.` });
            setLoading(false);
            return;
          } else if (backendError.code === 'ECONNREFUSED') {
            console.log('🔌 Backend connection refused');
            setErrors({ submit: `Cannot connect to server. Please check if the server is running.` });
            setLoading(false);
            return;
          } else {
            console.log('❓ Other backend error:', backendError.response?.status);
            setErrors({ submit: `Error: ${backendErrorMessage}` });
            setLoading(false);
            return;
          }
        }
        
      } else {
        // Update existing employee
        const backendData = {
          empId: formData.empID,
          empName: formData.empName,
          empPhone: formData.phone || '',
          jobPosition: formData.jobPosition,
          status: formData.status.toLowerCase(),
          address: formData.address,
          emailAddress: formData.email
        };
        
        try {
          response = await axios.put(`https://fabricflow-backend1.onrender.com/employees/${employee._id}`, backendData);
          console.log('Employee updated successfully:', response.data);
        } catch (updateError) {
          console.log('Backend update failed, using local update');
          response = { data: { employee: { ...employee, ...backendData } } };
        }
      }
      
      if (onEmployeeUpdate) {
        console.log('Calling onEmployeeUpdate with:', response.data);
        onEmployeeUpdate(response.data.employee || response.data);
      }
      
      // Also trigger manual refresh events for any listening tables
      console.log('🔄 Triggering table refresh events...');
      window.dispatchEvent(new CustomEvent('refreshEmployeeTable'));
      
      // Clear any previous errors and show success
      setErrors({});
      console.log('✅ Employee creation completed successfully!');
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} employee:`, error);
      setErrors({ submit: `Failed to ${mode === 'create' ? 'create' : 'update'} employee. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  
  // Debug logging
  console.log('🔍 EMPLOYEE MODAL DEBUG:', { mode, employee: !!employee, isCreateMode, isViewMode });
  
  const title = isViewMode ? 'Employee Details' : (isCreateMode ? 'Add New Employee' : 'Edit Employee');
  const buttonText = isCreateMode ? 'Create Employee' : 'Save Changes';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 90, 84, 0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #005A54 0%, #007B6F 100%)',
          color: 'white',
          position: 'relative',
          p: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {isViewMode ? (
                <VisibilityIcon sx={{ color: 'white' }} />
              ) : isCreateMode ? (
                <PersonAddIcon sx={{ color: 'white' }} />
              ) : (
                <EditIcon sx={{ color: 'white' }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isViewMode 
                  ? 'View employee information and details'
                  : isCreateMode 
                    ? 'Create a new employee with validation and age verification'
                    : 'Update employee information'
                }
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4, bgcolor: '#FAFAFA' }}>
          {/* Personal Information Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid rgba(0, 90, 84, 0.12)',
              bgcolor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: '#005A54', mr: 2, width: 32, height: 32 }}>
                <PersonAddIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#005A54', fontWeight: 'bold' }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter the employee's basic details and contact information
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={formData.empName}
                  onChange={(e) => handleInputChange('empName', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.empName}
                  helperText={errors.empName}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.empID}
                  onChange={(e) => handleInputChange('empID', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.empID}
                  helperText={errors.empID}
                  required
                  variant="outlined"
                  placeholder="e.g., EMP001"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  variant="outlined"
                  placeholder="employee@company.com"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.phone}
                  helperText={errors.phone || "Format: 0771234567 or +94771234567"}
                  variant="outlined"
                  placeholder="Enter phone number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gender"
                  select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.gender}
                  helperText={errors.gender}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Password field - only show for create mode */}
              {mode === 'create' && !employee && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isViewMode}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                    variant="outlined"
                    placeholder="Enter password (min. 6 characters)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#005A54' },
                        '&.Mui-focused fieldset': { borderColor: '#005A54' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Enter complete address with city and postal code"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Age & Date of Birth Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid rgba(0, 90, 84, 0.12)',
              bgcolor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: '#EF6869', mr: 2, width: 32, height: 32 }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#005A54', fontWeight: 'bold' }}>
                  Age & Date of Birth
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date of birth will automatically calculate the age
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  disabled={isViewMode}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dob}
                  helperText={errors.dob}
                  required
                  variant="outlined"
                  inputProps={{
                    max: new Date().toISOString().split('T')[0],
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  disabled={isViewMode || formData.dob} // Disable if DOB is filled (auto-calculated)
                  error={!!errors.age}
                  helperText={formData.dob ? "Auto-calculated from date of birth" : (errors.age || "Age will be calculated from date of birth")}
                  required
                  variant="outlined"
                  inputProps={{
                    min: 18,
                    max: 65,
                    step: 1
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' },
                      ...(formData.dob && {
                        bgcolor: '#f5f5f5'
                      })
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                  InputProps={{
                    endAdornment: formData.dob && (
                      <Chip 
                        label="Auto-calculated" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                    )
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Job Information Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid rgba(0, 90, 84, 0.12)',
              bgcolor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: '#ff9800', mr: 2, width: 32, height: 32 }}>
                <WorkIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#005A54', fontWeight: 'bold' }}>
                  Job Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure employee role and status
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Job Position"
                  value={formData.jobPosition}
                  onChange={(e) => handleInputChange('jobPosition', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.jobPosition}
                  helperText={errors.jobPosition || "Select employee position"}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                >
                  {jobPositions.map((position) => (
                    <MenuItem key={position} value={position}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: '#005A54' }} />
                        <Typography variant="body2">{position}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.status}
                  helperText={errors.status || "Employee work status"}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#005A54' },
                      '&.Mui-focused fieldset': { borderColor: '#005A54' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#005A54' }
                  }}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={status} 
                          size="small" 
                          color={status === 'Active' ? 'success' : status === 'Inactive' ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
            
          {employee && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mt: 3,
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                bgcolor: '#f8f9fa'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                System Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID (System)"
                    value={employee._id || ''}
                    disabled
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Created Date"
                    value={employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}
                    disabled
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {errors.submit && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#ffebee', 
                borderRadius: 2, 
                border: '1px solid #f44336' 
              }}
            >
              <Typography color="error" variant="body2">
                {errors.submit}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          {isViewMode ? 'Close' : 'Cancel'}
        </Button>
        {!isViewMode && (
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{ 
              bgcolor: '#005A54', 
              '&:hover': { bgcolor: '#004A47' },
              minWidth: 120
            }}
          >
            {loading ? (isCreateMode ? 'Creating...' : 'Saving...') : buttonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeModal;
