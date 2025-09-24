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

const EmployeeModal = ({ open, onClose, employee, mode, onEmployeeUpdate }) => {
  const [formData, setFormData] = useState({
    empName: '',
    empID: '',
    department: '',
    jobPosition: '',
    email: '',
    phone: '',
    address: '',
    salary: '',
    hireDate: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const departments = [
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Production',
    'Quality Control',
    'IT',
    'Administration',
    'Research & Development'
  ];

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

  const statusOptions = ['Active', 'Inactive', 'On Leave', 'Terminated'];

  useEffect(() => {
    if (employee) {
      setFormData({
        empName: employee.empName || '',
        empID: employee.empID || '',
        department: employee.department || '',
        jobPosition: employee.jobPosition || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        salary: employee.salary || '',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        status: employee.status || 'Active'
      });
    }
  }, [employee]);

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.jobPosition) {
      newErrors.jobPosition = 'Job position is required';
    }

    if (formData.salary && (isNaN(formData.salary) || formData.salary < 0)) {
      newErrors.salary = 'Please enter a valid salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/employees/${employee._id}`, formData);
      
      if (onEmployeeUpdate) {
        onEmployeeUpdate(response.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating employee:', error);
      setErrors({ submit: 'Failed to update employee. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';
  const title = isViewMode ? 'Employee Details' : 'Edit Employee';

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
                label="Employee Name"
                value={formData.empName}
                onChange={(e) => handleInputChange('empName', e.target.value)}
                disabled={isViewMode}
                error={!!errors.empName}
                helperText={errors.empName}
                required
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
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={isViewMode}
                error={!!errors.department}
                helperText={errors.department}
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Job Position"
                value={formData.jobPosition}
                onChange={(e) => handleInputChange('jobPosition', e.target.value)}
                disabled={isViewMode}
                error={!!errors.jobPosition}
                helperText={errors.jobPosition}
                required
              >
                {jobPositions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </TextField>
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
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isViewMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                disabled={isViewMode}
                error={!!errors.salary}
                helperText={errors.salary}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleInputChange('hireDate', e.target.value)}
                disabled={isViewMode}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={isViewMode}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
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
              />
            </Grid>
            
            {employee && (
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
                    label="Employee ID (System)"
                    value={employee._id || ''}
                    disabled
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Created Date"
                    value={employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}
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
              bgcolor: '#EF6869', 
              '&:hover': { bgcolor: '#e55456' } 
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeModal;
