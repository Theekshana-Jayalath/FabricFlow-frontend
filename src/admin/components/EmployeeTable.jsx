import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import {
  Work,
  Edit,
  Delete,
  Visibility,
  Search,
  Download,
  FilterList,
  Email,
  Phone,
  Home,
  Cake,
  Badge,
  Business
} from '@mui/icons-material';
import axios from 'axios';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/employees');
      const employeeData = response.data?.employees || response.data || [];
      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showAlert('Failed to fetch employees from server', 'error');
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((employee) =>
        Object.values(employee).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handleEdit = (employee) => {
    console.log('Edit employee:', employee);
    showAlert(`Edit functionality for ${employee.empName} - Coming Soon!`, 'info');
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/employees/${employeeToDelete._id}`);
      setEmployees(employees.filter(emp => emp._id !== employeeToDelete._id));
      showAlert(`Employee "${employeeToDelete.empName}" deleted successfully!`, 'success');
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      showAlert('Failed to delete employee', 'error');
      console.error(error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleView = (employee) => {
    console.log('View employee:', employee);
    showAlert(`View details for ${employee.empName} - Coming Soon!`, 'info');
  };

  const downloadCSV = () => {
    if (filteredEmployees.length === 0) {
      showAlert('No employees to download', 'warning');
      return;
    }

    const headers = Object.keys(filteredEmployees[0]).join(',');
    const csvContent = filteredEmployees
      .map(emp =>
        Object.values(emp)
          .map(value => typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value)
          .join(',')
      )
      .join('\\n');

    const blob = new Blob([`${headers}\\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    showAlert('Employee data downloaded successfully!', 'success');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#4caf50';
      case 'inactive': return '#f44336';
      case 'pending': return '#ff9800';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading employees...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#005A54', mr: 2 }}>
                  <Work />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {employees.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <Work />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {employees.filter(emp => emp.status?.toLowerCase() === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {[...new Set(employees.map(emp => emp.jobPosition))].length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Job Positions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#EF6869', mr: 2 }}>
                  <Search />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {filteredEmployees.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filtered Results
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: '#EF6869', mr: 2 }}>
              <Work />
            </Avatar>
            <Typography variant="h6" component="h2" sx={{ color: '#005A54', flexGrow: 1 }}>
              Employee Management
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadCSV}
              sx={{
                borderColor: '#005A54',
                color: '#005A54',
                '&:hover': {
                  borderColor: '#005A54',
                  backgroundColor: 'rgba(0, 90, 84, 0.04)'
                }
              }}
            >
              Export CSV
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search employees by name, email, position, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#005A54' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#005A54',
                  },
                  '&:hover fieldset': {
                    borderColor: '#005A54',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005A54',
                  },
                },
              }}
            />
          </Box>

          {filteredEmployees.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No employees found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employees.length === 0 ? 'No employees in the database' : 'Try adjusting your search criteria'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#FFEED6' }}>
                  <TableRow>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Job Details</strong></TableCell>
                    <TableCell><strong>Contact</strong></TableCell>
                    <TableCell><strong>Personal Info</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((employee, index) => (
                    <TableRow 
                      key={employee._id} 
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0, 90, 84, 0.04)' },
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#EF6869', mr: 2 }}>
                            {getInitials(employee.empName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {employee.empName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {employee.empId || employee._id?.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Business sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {employee.jobPosition || 'N/A'}
                            </Typography>
                          </Box>
                          {employee.status && (
                            <Chip 
                              label={employee.status} 
                              size="small" 
                              sx={{ 
                                bgcolor: getStatusColor(employee.status),
                                color: 'white',
                                fontSize: '0.75rem'
                              }} 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Email sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                            <Typography variant="body2">{employee.emailAddress || 'N/A'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                            <Typography variant="body2">{employee.empPhone || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>Age: {employee.age || 'N/A'}</Typography>
                            {employee.gender && (
                              <Chip 
                                label={employee.gender} 
                                size="small" 
                                sx={{ 
                                  bgcolor: getGenderColor(employee.gender),
                                  color: 'white',
                                  fontSize: '0.75rem'
                                }} 
                              />
                            )}
                          </Box>
                          {employee.dob && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Cake sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                              <Typography variant="body2">{formatDate(employee.dob)}</Typography>
                            </Box>
                          )}
                          {employee.address && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Home sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                              <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {employee.address}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleView(employee)}
                              sx={{ color: '#005A54' }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Employee">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(employee)}
                              sx={{ color: '#ff9800' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Employee">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(employee)}
                              sx={{ color: '#EF6869' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete employee "{employeeToDelete?.empName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ color: '#005A54' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} sx={{ color: '#EF6869' }} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeTable;
