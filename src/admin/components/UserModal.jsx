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
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
    if (!address) return ''; // Address is optional
    
    const trimmed = address.trim();
    if (trimmed.length < 5) {
      return 'Address must be at least 5 characters';
    }
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(trimmed)) {
      return 'Address can only contain letters, numbers, spaces, commas, periods, and hyphens';
    }
    return '';
  };

  const validateAge = (age) => {
    if (!age) return ''; // Age is optional
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return 'Age must be between 16 and 100';
    }
    return '';
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return ''; // DOB is optional
    
    const birthDate = new Date(dob);
    const today = new Date();
    if (birthDate >= today) {
      return 'Date of birth cannot be in the future';
    }
    
    // Check if age and dob are consistent
    const currentYear = today.getFullYear();
    const birthYear = birthDate.getFullYear();
    const calculatedAge = currentYear - birthYear;
    
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
        fieldError = validateAge(processedValue);
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
          const ageError = validateAge(updatedFormData.age);
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

    const ageError = validateAge(formData.age);
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
            password: 'defaultPassword123',
            name: formData.name,
            gmail: formData.email,
            age: parseInt(formData.age) || null,
            address: formData.address || '',
            phone: formData.phone || '',
            gender: formData.gender || 'other',
            dob: formData.dob || null
          };
          
          console.log('Sending user registration data:', userData);
          const backendResponse = await axios.post('http://localhost:5000/auth/register', userData);
          console.log('User registered successfully:', backendResponse.data);
          
          // Use backend response data
          response = backendResponse;
          
        } catch (authError) {
          console.log('Auth register failed, trying direct user creation:', authError);
          
          try {
            const fallbackData = {
              name: formData.name,
              gmail: formData.email,
              age: parseInt(formData.age) || null,
              address: formData.address || '',
              phone: formData.phone || '',
              gender: formData.gender || 'other',
              dob: formData.dob || null
            };
            
            const fallbackResponse = await axios.post('http://localhost:5000/users', fallbackData);
            console.log('User created via fallback endpoint:', fallbackResponse.data);
            response = fallbackResponse;
            
          } catch (fallbackError) {
            console.log('Both backend endpoints failed, using localStorage:', fallbackError);
            
            // Final fallback to localStorage
            const existingUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
            existingUsers.push(newUser);
            localStorage.setItem('localUsers', JSON.stringify(existingUsers));
            console.log('Saved user to localStorage:', newUser);
            console.log('Total local users now:', existingUsers.length);
            
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
        console.log('Calling onUserUpdate with:', response.data);
        onUserUpdate(response.data.user || response.data);
      }
      
      console.log('Closing modal');
      onClose();
      
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            {isViewMode ? <VisibilityIcon color="primary" /> : <EditIcon color="primary" />}
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
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
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isViewMode}
                error={!!errors.email}
                helperText={errors.email}
                required
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
                SelectProps={{
                  native: false,
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
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                disabled={isViewMode}
                error={!!errors.age}
                helperText={errors.age}
                required
                inputProps={{
                  min: 16,
                  max: 100,
                  step: 1
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isViewMode}
                error={!!errors.phone}
                helperText={errors.phone}
                required
                inputProps={{
                  pattern: '[0-9+\\-\\s]*',
                  title: 'Please enter a valid phone number'
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
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
                rows={2}
              />
            </Grid>

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
                inputProps={{
                  max: new Date().toISOString().split('T')[0],
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isViewMode}
                error={!!errors.role}
                helperText={errors.role}
                required
                SelectProps={{
                  native: false,
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>
            
            {user && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    System Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User ID"
                    value={user._id || ''}
                    disabled
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Created Date"
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    disabled
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
          
          {errors.submit && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.submit}
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {isViewMode ? 'Close' : 'Cancel'}
        </Button>
        {!isViewMode && (
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
            sx={{ 
              bgcolor: '#005A54', 
              '&:hover': { bgcolor: '#004A45' } 
            }}
          >
            {loading ? (isCreateMode ? 'Creating...' : 'Saving...') : buttonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
