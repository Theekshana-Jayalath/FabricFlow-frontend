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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.empName.trim()) {
      newErrors.empName = 'Employee name is required';
    }
    
    if (!formData.empID.trim()) {
      newErrors.empID = 'Employee ID is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.jobPosition.trim()) {
      newErrors.jobPosition = 'Job position is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.age && (isNaN(formData.age) || formData.age < 16 || formData.age > 80)) {
      newErrors.age = 'Please enter a valid age (16-80)';
    }

    if (formData.phoneNo && !/^\d{10}$/.test(formData.phoneNo.replace(/\D/g, ''))) {
      newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
    }

    if (formData.salary && (isNaN(formData.salary) || formData.salary < 0)) {
      newErrors.salary = 'Please enter a valid salary amount';
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
