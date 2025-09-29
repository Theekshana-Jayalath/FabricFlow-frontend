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
  Avatar,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const UserModal = ({ open, onClose, user, mode, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    phone: '',
    address: '',
    role: 'user',
    dob: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && mode !== 'create') {
      setFormData({
        name: user.name || '',
        email: user.gmail || user.email || '', // Handle both gmail and email fields
        gender: user.gender || '',
        age: user.age || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'user',
        dob: user.dob ? user.dob.split('T')[0] : ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        email: '',
        gender: '',
        age: '',
        phone: '',
        address: '',
        role: 'user',
        dob: ''
      });
      setErrors({});
    }
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
      return 'Name can only contain letters and spaces';
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

  const validatePhoneNumber = (phone) => {
    if (!phone) return ''; // Phone is optional
    
    const trimmed = phone.toString().trim();
    // Sri Lankan mobile number patterns
    const sriLankanMobile = /^(\+94|0)?[1-9][0-9]{8}$/;
    
    if (!sriLankanMobile.test(trimmed)) {
      return 'Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)';
    }
    return '';
  };

  const validateAddress = (address) => {
    const trimmed = address.trim();
    if (!trimmed) {
      return 'Address is required';
    }
    
    if (trimmed.length < 10) {
      return 'Address must be at least 10 characters';
    }
    
    if (trimmed.length > 200) {
      return 'Address must not exceed 200 characters';
    }
    
    // Allow letters, numbers, spaces, common punctuation for addresses
    if (!/^[a-zA-Z0-9\s,.\-/\\#()]+$/.test(trimmed)) {
      return 'Address contains invalid characters';
    }
    
    return '';
  };

  const validateAge = (age, dob = null) => {
    if (!age) {
      return 'Age is required';
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return 'Age must be between 16 and 100 years';
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

  const validateDateOfBirth = (dob) => {
    if (!dob) {
      return 'Date of birth is required';
    }
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (birthDate >= today) {
      return 'Date of birth cannot be in the future';
    }
    
    // Calculate age from DOB and validate range
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    if (calculatedAge < 16 || calculatedAge > 100) {
      return 'Age calculated from date of birth must be between 16 and 100 years';
    }
    
    return '';
  };

  const validateGender = (gender) => {
    if (!gender) {
      return 'Gender is required';
    }
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return 'Please select a valid gender';
    }
    return '';
  };

  const validateRole = (role) => {
    if (!role) {
      return 'Role is required';
    }
    if (!['user', 'admin'].includes(role.toLowerCase())) {
      return 'Please select a valid role';
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

  const handleInputChange = (field, value) => {
    // Trim whitespace for relevant fields
    let processedValue = value;
    if (['name', 'email', 'address'].includes(field)) {
      processedValue = typeof value === 'string' ? value.trim() : value;
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
        fieldError = validateAge(processedValue, updatedFormData.dob);
        break;
      case 'gender':
        fieldError = validateGender(processedValue);
        break;
      case 'role':
        fieldError = validateRole(processedValue);
        break;
      case 'dob':
        fieldError = validateDateOfBirth(processedValue);
        // Auto-calculated age should be validated against the new DOB
        if (!fieldError && updatedFormData.age) {
          const ageError = validateAge(updatedFormData.age, processedValue);
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
    
    if (fieldError) {
      newErrors[field] = fieldError;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
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

    const roleError = validateRole(formData.role);
    if (roleError) newErrors.role = roleError;

    const dobError = validateDateOfBirth(formData.dob);
    if (dobError) newErrors.dob = dobError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('handleSave called, mode:', mode);
    console.log('Form data before validation:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed, errors:', errors);
      return;
    }

    console.log('Form validation passed');
    setLoading(true);
    
    try {
      let response;
      
      if (mode === 'create') {
        // Create new user - simulate successful creation for now
        const newUser = {
          _id: Date.now().toString(), // Generate temporary ID
          name: formData.name,
          email: formData.email,
          gmail: formData.email,
          age: parseInt(formData.age) || null,
          address: formData.address || '',
          phone: formData.phone || '',
          gender: formData.gender || 'other',
          role: formData.role || 'user',
          dob: formData.dob || null,
          createdAt: new Date().toISOString()
        };
        
        console.log('Created new user:', newUser);
        
        // Simulate successful response
        response = { data: { user: newUser } };
        
        // Try to save to backend first since it's running
        try {
          const userData = {
            role: formData.role || 'user',
            password: 'defaultPassword123', // Default password for admin-created users
            name: formData.name,
            gmail: formData.email,
            age: parseInt(formData.age) || null,
            address: formData.address || '',
            phone: formData.phone || '',
            gender: formData.gender || 'other',
            dob: formData.dob || null
          };
          
          console.log('📡 Attempting auth/register endpoint:', userData);
          const backendResponse = await axios.post('http://localhost:5000/auth/register', userData);
          console.log('✅ User registered via auth/register:', backendResponse.data);
          
          // Use backend response data and ensure it has proper structure
          const createdUser = backendResponse.data.user || backendResponse.data;
          response = { 
            data: { 
              user: {
                ...createdUser,
                email: createdUser.gmail || createdUser.email, // Ensure email field exists
                gmail: createdUser.gmail || createdUser.email  // Ensure gmail field exists
              } 
            } 
          };
          
          console.log('✅ Final user data from auth/register:', response.data.user);
          
        } catch (authError) {
          console.log('❌ Auth register failed, trying direct user creation:', authError.message);
          
          try {
            const fallbackData = {
              name: formData.name,
              gmail: formData.email,
              email: formData.email, // Include both email fields
              age: parseInt(formData.age) || null,
              address: formData.address || '',
              phone: formData.phone || '',
              gender: formData.gender || 'other',
              dob: formData.dob || null,
              role: formData.role || 'user'
            };
            
            console.log('📡 Attempting direct users endpoint:', fallbackData);
            const fallbackResponse = await axios.post('http://localhost:5000/users', fallbackData);
            console.log('✅ User created via direct users endpoint:', fallbackResponse.data);
            
            // Use fallback response
            const createdUser = fallbackResponse.data.user || fallbackResponse.data;
            response = { 
              data: { 
                user: {
                  ...createdUser,
                  email: createdUser.gmail || createdUser.email,
                  gmail: createdUser.gmail || createdUser.email
                } 
              } 
            };
            
            console.log('✅ Final user data from direct endpoint:', response.data.user);
            
          } catch (fallbackError) {
            console.log('❌ Both backend endpoints failed, using localStorage:', fallbackError.message);
            
            // Final fallback to localStorage
            const existingUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
            existingUsers.push(newUser);
            localStorage.setItem('localUsers', JSON.stringify(existingUsers));
            console.log('💾 Saved user to localStorage:', newUser);
            console.log('📊 Total local users now:', existingUsers.length);
            
            // Trigger a storage event for other components to listen to
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'localUsers',
              newValue: JSON.stringify(existingUsers)
            }));
            
            response = { data: { user: newUser } };
          }
        }
        
      } else {
        // Update existing user
        const backendData = {
          name: formData.name,
          gmail: formData.email,
          age: parseInt(formData.age) || null,
          address: formData.address || '',
          phone: formData.phone || '',
          gender: formData.gender || 'other',
          dob: formData.dob || null
        };
        
        try {
          response = await axios.put(`http://localhost:5000/users/${user._id}`, backendData);
          console.log('User updated successfully:', response.data);
        } catch (updateError) {
          console.log('Backend update failed, using local update');
          response = { data: { user: { ...user, ...backendData } } };
        }
      }
      
      if (onUserUpdate) {
        console.log('=== USER UPDATE CALLBACK ===');
        console.log('Response data:', response.data);
        console.log('User data being passed to callback:', response.data.user || response.data);
        onUserUpdate(response.data.user || response.data);
        console.log('onUserUpdate callback completed');
      } else {
        console.log('⚠️ Warning: onUserUpdate callback is not provided');
      }
      
      console.log('Closing modal');
      onClose();
      
      // Add a small delay to ensure the update callback is processed
      setTimeout(() => {
        console.log('🔄 Dispatching additional refresh events');
        // Force refresh of user table
        const refreshEvent = new CustomEvent('refreshUserTable');
        window.dispatchEvent(refreshEvent);
        
        // Also dispatch storage event to trigger other listeners
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userDataUpdated',
          newValue: Date.now().toString()
        }));
      }, 100);
      
      // Clear any previous errors
      setErrors({});
      
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} user:`, error);
      setErrors({ submit: `Failed to ${mode === 'create' ? 'create' : 'update'} user. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  
  const title = isViewMode ? 'User Details' : (isCreateMode ? 'Add New User' : 'Edit User');
  const buttonText = isCreateMode ? 'Create User' : 'Save Changes';

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
                  ? 'View user information and details'
                  : isCreateMode 
                    ? 'Create a new user account with validation'
                    : 'Update user information'
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
                  Enter the user's basic details and contact information
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.name}
                  helperText={errors.name}
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
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.email}
                  helperText={errors.email}
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
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.phone}
                  helperText={errors.phone || "Format: 0771234567 or +94771234567"}
                  required
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
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              
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
                    min: 16,
                    max: 100,
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

          {/* System Information Section */}
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
                <EditIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#005A54', fontWeight: 'bold' }}>
                  Account Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure user role and permissions
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={isViewMode}
                  error={!!errors.role}
                  helperText={errors.role || "Select user access level"}
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
                  <MenuItem value="user">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="User" size="small" color="default" />
                      <Typography variant="body2">Basic access to place orders</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Admin" size="small" color="primary" />
                      <Typography variant="body2">Full system access</Typography>
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
            
          {user && (
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
                    label="User ID"
                    value={user._id || ''}
                    disabled
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Created Date"
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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
      
      <DialogActions 
        sx={{ 
          px: 4, 
          py: 3, 
          bgcolor: '#f8f9fa',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          gap: 2,
          justifyContent: 'flex-end'
        }}
      >
        <Button 
          onClick={onClose} 
          color="inherit"
          size="large"
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { 
              bgcolor: 'rgba(0, 0, 0, 0.04)' 
            }
          }}
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </Button>
        {!isViewMode && (
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
            size="large"
            startIcon={isCreateMode ? <PersonAddIcon /> : <EditIcon />}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #005A54 0%, #007B6F 100%)',
              boxShadow: '0 4px 14px 0 rgba(0, 90, 84, 0.39)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #004A45 0%, #006B5F 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px 0 rgba(0, 90, 84, 0.49)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.26)',
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'white',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                {isCreateMode ? 'Creating User...' : 'Saving Changes...'}
              </Box>
            ) : (
              buttonText
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
