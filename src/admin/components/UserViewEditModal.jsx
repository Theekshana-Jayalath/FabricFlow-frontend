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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import axios from 'axios';

const UserViewEditModal = ({ open, onClose, user, mode, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    phone: '',
    address: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentMode, setCurrentMode] = useState(mode || 'view');

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.gmail || user.email || '', // Handle both gmail and email fields
        gender: user.gender || '',
        age: user.age ? user.age.toString() : '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'user'
      });
    }
    setCurrentMode(mode || 'view');
    setErrors({});
  }, [user, mode]);

  // Comprehensive validation helper functions
  const validateUserName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Name is required';
    }
    if (trimmed.length < 3) {
      return 'Name must be at least 3 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
      return 'Name can only contain letters and spaces (no numbers or special characters)';
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

  const validatePhoneNumber = (phone) => {
    const trimmed = phone.trim();
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
    if (['name', 'email', 'phone', 'address'].includes(field)) {
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
      case 'name':
        fieldError = validateUserName(processedValue);
        break;
      case 'email':
        fieldError = validateEmail(processedValue);
        break;
      case 'phone':
        fieldError = validatePhoneNumber(processedValue);
        break;
      case 'address':
        fieldError = validateAddress(processedValue);
        break;
      case 'age':
        fieldError = validateAge(processedValue, formData.dob);
        break;
      case 'gender':
        fieldError = validateGender(processedValue);
        break;
      case 'dob':
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
    const nameError = validateUserName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhoneNumber(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const ageError = validateAge(formData.age, formData.dob);
    if (ageError) newErrors.age = ageError;

    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;

    if (formData.dob) {
      const dobError = validateDateOfBirth(formData.dob);
      if (dobError) newErrors.dob = dobError;
    }

    // Role validation (should not be empty)
    if (!formData.role || formData.role === '') {
      newErrors.role = 'Role is required';
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
        age: formData.age ? parseInt(formData.age) : null
      };

      const response = await axios.put(`http://localhost:5000/users/${user._id}`, updateData);
      
      if (onUserUpdate) {
        onUserUpdate(response.data.user || response.data);
      }
      
      setCurrentMode('view');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: 'Failed to update user. Please try again.' });
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
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.gmail || user.email || '', // Handle both gmail and email fields
        gender: user.gender || '',
        age: user.age ? user.age.toString() : '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'user'
      });
    }
    setCurrentMode('view');
    setErrors({});
  };

  const isViewMode = currentMode === 'view';
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return '#2196f3';
      case 'female': return '#e91e63';
      default: return '#9c27b0';
    }
  };

  if (!user) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
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
            {isViewMode ? 'User Details' : 'Edit User'}
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

        {/* User Profile Header */}
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
            {getInitials(formData.name)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {formData.name || 'Unknown User'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={formData.role || 'user'} 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  textTransform: 'capitalize'
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
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                color: '#005A54', 
                fontWeight: 'bold', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PersonIcon />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isViewMode}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: '#005A54' }} />
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
                label="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isViewMode}
                error={!!errors.email}
                helperText={errors.email}
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
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isViewMode}
                error={!!errors.phone}
                helperText={errors.phone}
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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
                <option value="prefer-not-to-say">Prefer not to say</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isViewMode}
                select
                SelectProps={{
                  native: true,
                }}
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
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isViewMode}
                multiline
                rows={3}
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
              Edit User
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

export default UserViewEditModal;
