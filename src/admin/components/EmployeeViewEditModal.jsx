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
  Avatar,
  Alert,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon
} from '@mui/icons-material';
import axios from 'axios';

const EmployeeViewEditModal = ({ open, onClose, employee, mode, onEmployeeUpdate }) => {
  const [formData, setFormData] = useState({
    empName: '',
    empID: '',
    department: '',
    jobPosition: '',
    email: '',
    phoneNo: '',
    address: '',
    age: '',
    gender: '',
    salary: '',
    hireDate: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentMode, setCurrentMode] = useState(mode || 'view');

  const departmentOptions = [
    'Production',
    'Quality Control',
    'Design & Development',
    'Sales & Marketing',
    'Administration',
    'Finance',
    'Human Resources',
    'IT Support',
    'Maintenance',
    'Logistics'
  ];

  const jobPositionOptions = [
    'Manager',
    'Supervisor',
    'Team Lead',
    'Senior Officer',
    'Officer',
    'Assistant',
    'Intern',
    'Consultant',
    'Specialist',
    'Operator',
    'Technician',
    'Driver'
  ];

  const statusOptions = ['Active', 'Inactive', 'On Leave', 'Terminated'];

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        empName: employee.empName || '',
        empID: employee.empID || '',
        department: employee.department || '',
        jobPosition: employee.jobPosition || '',
        email: employee.email || '',
        phoneNo: employee.phoneNo || '',
        address: employee.address || '',
        age: employee.age ? employee.age.toString() : '',
        gender: employee.gender || '',
        salary: employee.salary ? employee.salary.toString() : '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status || 'Active'
      });
    }
    setCurrentMode(mode || 'view');
    setErrors({});
  }, [employee, mode]);

  // Comprehensive validation helper functions
  const validateEmployeeId = (empID) => {
    const trimmed = empID.trim();
    if (!trimmed) {
      return 'Employee ID is required';
    }
    if (!/^[a-zA-Z0-9]{4,10}$/.test(trimmed)) {
      return 'Employee ID must be 4-10 alphanumeric characters only (no special characters)';
    }
    // TODO: Add uniqueness check against database
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
      return 'Employee name can only contain letters and spaces (no numbers or special characters)';
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
      return 'Please enter a valid email address (name@domain.com)';
    }
    // TODO: Add uniqueness check against database
    return '';
  };

  const validateJobPosition = (jobPosition) => {
    if (!jobPosition || jobPosition === '') {
      return 'Job position is required';
    }
    if (!jobPositionOptions.includes(jobPosition)) {
      return 'Please select a valid job position from the dropdown';
    }
    return '';
  };

  const validatePhoneNumber = (phoneNo) => {
    const trimmed = phoneNo.trim();
    if (!trimmed) {
      return 'Phone number is required';
    }
    
    // Remove all non-digits for validation
    const digitsOnly = trimmed.replace(/\D/g, '');
    
    // Check for valid Sri Lankan phone formats
    // +94XXXXXXXXX (12 digits total) or 0XXXXXXXXX (10 digits) or XXXXXXXXX (9 digits)
    if (!/^(\+94[0-9]{9}|0[0-9]{9}|[0-9]{9})$/.test(trimmed.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number (10 digits, may include +94 country code)';
    }
    
    if (digitsOnly.length < 9 || digitsOnly.length > 12) {
      return 'Phone number must be 9-12 digits';
    }
    
    // TODO: Add uniqueness check against database
    return '';
  };

  const validateAddress = (address) => {
    const trimmed = address.trim();
    if (!trimmed) {
      return 'Address is required';
    }
    if (trimmed.length < 5) {
      return 'Address must be at least 5 characters';
    }
    // Allow letters, numbers, spaces, commas, dots, slashes, hyphens - no special chars like !@#$%^&*
    if (!/^[a-zA-Z0-9\s,./\-]+$/.test(trimmed)) {
      return 'Address contains invalid characters (only letters, numbers, spaces, commas, dots, slashes, and hyphens allowed)';
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
    
    // Cross-validation with DOB if provided
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (Math.abs(calculatedAge - ageNum) > 1) {
        return 'Age does not match the date of birth';
      }
    }
    return '';
  };

  const validateGender = (gender) => {
    if (!gender || gender === '') {
      return 'Gender is required';
    }
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return 'Please select a valid gender option (Male, Female, or Other)';
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
      return 'Age calculated from date of birth must be between 18 and 60 years';
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    // Trim whitespace for relevant fields
    let processedValue = value;
    if (['empName', 'empID', 'email', 'phoneNo', 'address'].includes(field)) {
      processedValue = value.trim();
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    // Clear existing error for this field
    if (newErrors[field]) {
      delete newErrors[field];
    }
    
    // Validate the current field in real-time
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
      case 'jobPosition':
        fieldError = validateJobPosition(processedValue);
        break;
      case 'phoneNo':
        fieldError = validatePhoneNumber(processedValue);
        break;
      case 'address':
        fieldError = validateAddress(processedValue);
        break;
      case 'age':
        fieldError = validateAge(processedValue, formData.hireDate);
        break;
      case 'gender':
        fieldError = validateGender(processedValue);
        break;
      case 'hireDate':
        fieldError = validateDateOfBirth(processedValue);
        // Also revalidate age if DOB changes
        if (!fieldError && formData.age) {
          const ageError = validateAge(formData.age, processedValue);
          if (ageError && ageError.includes('date of birth')) {
            newErrors.age = ageError;
          } else if (newErrors.age && newErrors.age.includes('date of birth')) {
            delete newErrors.age;
          }
        }
        break;
      default:
        break;
    }
    
    // Add error if validation failed
    if (fieldError) {
      newErrors[field] = fieldError;
    }
    
    // Update errors state
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all required fields
    const empIDError = validateEmployeeId(formData.empID);
    if (empIDError) newErrors.empID = empIDError;

    const empNameError = validateEmployeeName(formData.empName);
    if (empNameError) newErrors.empName = empNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const jobPositionError = validateJobPosition(formData.jobPosition);
    if (jobPositionError) newErrors.jobPosition = jobPositionError;

    const phoneError = validatePhoneNumber(formData.phoneNo);
    if (phoneError) newErrors.phoneNo = phoneError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const ageError = validateAge(formData.age, formData.hireDate);
    if (ageError) newErrors.age = ageError;

    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;

    if (formData.hireDate) {
      const dobError = validateDateOfBirth(formData.hireDate);
      if (dobError) newErrors.hireDate = dobError;
    }

    // Department validation
    if (!formData.department || formData.department === '') {
      newErrors.department = 'Department is required';
    }

    // Status validation
    if (!formData.status || formData.status === '') {
      newErrors.status = 'Status is required';
    }

    // Salary validation (if provided)
    if (formData.salary && (isNaN(formData.salary) || parseFloat(formData.salary) < 0)) {
      newErrors.salary = 'Please enter a valid salary amount (must be a positive number)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      const response = await axios.put(`http://localhost:5000/employees/${employee._id}`, updateData);
      
      if (onEmployeeUpdate) {
        onEmployeeUpdate(response.data.employee || response.data);
      }
      
      setCurrentMode('view');
    } catch (error) {
      console.error('Error updating employee:', error);
      setErrors({ submit: 'Failed to update employee. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentMode('view');
    setErrors({});
    onClose();
  };

  const switchToEditMode = () => {
    setCurrentMode('edit');
  };

  const cancelEdit = () => {
    if (employee) {
      setFormData({
        empName: employee.empName || '',
        empID: employee.empID || '',
        department: employee.department || '',
        jobPosition: employee.jobPosition || '',
        email: employee.email || '',
        phoneNo: employee.phoneNo || '',
        address: employee.address || '',
        age: employee.age ? employee.age.toString() : '',
        gender: employee.gender || '',
        salary: employee.salary ? employee.salary.toString() : '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status || 'Active'
      });
    }
    setCurrentMode('view');
    setErrors({});
  };

  const isViewMode = currentMode === 'view';
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#4caf50';
      case 'inactive': return '#f44336';
      case 'on leave': return '#ff9800';
      case 'terminated': return '#9e9e9e';
      default: return '#9c27b0';
    }
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return '#2196f3';
      case 'female': return '#e91e63';
      default: return '#9c27b0';
    }
  };

  if (!employee) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#005A54', 
        color: 'white', 
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isViewMode ? <VisibilityIcon /> : <EditIcon />}
          <Typography variant="h6" component="div">
            {isViewMode ? 'Employee Details' : 'Edit Employee'}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {errors.submit && (
          <Alert severity="error" sx={{ m: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Employee Profile Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #005A54 0%, #007A6B 100%)', 
          color: 'white', 
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              fontSize: '2rem',
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)'
            }}
          >
            {getInitials(formData.empName)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {formData.empName || 'Unknown Employee'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              {formData.jobPosition} - {formData.department}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`ID: ${formData.empID}`} 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white'
                }}
              />
              <Chip 
                label={formData.status} 
                size="small"
                sx={{ 
                  bgcolor: getStatusColor(formData.status), 
                  color: 'white'
                }}
              />
              {formData.gender && (
                <Chip 
                  label={formData.gender} 
                  size="small"
                  sx={{ 
                    bgcolor: getGenderColor(formData.gender), 
                    color: 'white',
                    textTransform: 'capitalize'
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                color: '#005A54', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <WorkIcon />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee Name"
                value={formData.empName}
                onChange={(e) => handleInputChange('empName', e.target.value)}
                disabled={isViewMode}
                error={!!errors.empName}
                helperText={errors.empName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.empID}
                onChange={(e) => handleInputChange('empID', e.target.value)}
                disabled={isViewMode}
                error={!!errors.empID}
                helperText={errors.empID}
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={isViewMode}
                error={!!errors.department}
                helperText={errors.department}
                select
                SelectProps={{
                  native: true,
                }}
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              >
                <option value="">Select Department</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Position"
                value={formData.jobPosition}
                onChange={(e) => handleInputChange('jobPosition', e.target.value)}
                disabled={isViewMode}
                error={!!errors.jobPosition}
                helperText={errors.jobPosition}
                select
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              >
                <option value="">Select Position</option>
                {jobPositionOptions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </TextField>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                color: '#005A54', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2
              }}>
                <EmailIcon />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isViewMode}
                error={!!errors.email}
                helperText={errors.email}
                type="email"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNo}
                onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                disabled={isViewMode}
                error={!!errors.phoneNo}
                helperText={errors.phoneNo}
                placeholder="e.g., 0771234567"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isViewMode}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: <HomeIcon sx={{ mr: 1, color: '#005A54', alignSelf: 'flex-start', mt: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            {/* Personal Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                color: '#005A54', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2
              }}>
                <CakeIcon />
                Personal Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                disabled={isViewMode}
                error={!!errors.age}
                helperText={errors.age}
                type="number"
                InputProps={{
                  startAdornment: <CakeIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={isViewMode}
                select
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={isViewMode}
                select
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </TextField>
            </Grid>

            {/* Employment Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                color: '#005A54', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2
              }}>
                <MoneyIcon />
                Employment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                disabled={isViewMode}
                error={!!errors.salary}
                helperText={errors.salary}
                type="number"
                placeholder="e.g., 50000"
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hire Date"
                value={formData.hireDate}
                onChange={(e) => handleInputChange('hireDate', e.target.value)}
                disabled={isViewMode}
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: <EventIcon sx={{ mr: 1, color: '#005A54' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#005A54',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#005A54',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        {isViewMode ? (
          <>
            <Button 
              onClick={handleClose}
              variant="outlined"
              sx={{ 
                borderColor: '#005A54',
                color: '#005A54',
                '&:hover': {
                  borderColor: '#005A54',
                  backgroundColor: 'rgba(0, 90, 84, 0.04)'
                }
              }}
            >
              Close
            </Button>
            <Button 
              onClick={switchToEditMode}
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ 
                backgroundColor: '#005A54',
                '&:hover': {
                  backgroundColor: '#004A44'
                }
              }}
            >
              Edit Employee
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={cancelEdit}
              variant="outlined"
              disabled={loading}
              sx={{ 
                borderColor: '#EF6869',
                color: '#EF6869',
                '&:hover': {
                  borderColor: '#EF6869',
                  backgroundColor: 'rgba(239, 104, 105, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              variant="contained"
              disabled={loading}
              sx={{ 
                backgroundColor: '#005A54',
                '&:hover': {
                  backgroundColor: '#004A44'
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeViewEditModal;
