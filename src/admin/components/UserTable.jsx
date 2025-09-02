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
  Person,
  Edit,
  Delete,
  Visibility,
  Search,
  Download,
  FilterList,
  Email,
  Phone,
  Home,
  Cake
} from '@mui/icons-material';
import axios from 'axios';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/users');
      const userData = response.data?.users || response.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Failed to fetch users from server', 'error');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handleEdit = (user) => {
    // Navigate to edit form or open edit modal
    console.log('Edit user:', user);
    showAlert(`Edit functionality for ${user.name} - Coming Soon!`, 'info');
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      showAlert(`User "${userToDelete.name}" deleted successfully!`, 'success');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      showAlert('Failed to delete user', 'error');
      console.error(error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleView = (user) => {
    console.log('View user:', user);
    showAlert(`View details for ${user.name} - Coming Soon!`, 'info');
  };

  const downloadCSV = () => {
    if (filteredUsers.length === 0) {
      showAlert('No users to download', 'warning');
      return;
    }

    const headers = Object.keys(filteredUsers[0]).join(',');
    const csvContent = filteredUsers
      .map(user =>
        Object.values(user)
          .map(value => typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value)
          .join(',')
      )
      .join('\\n');

    const blob = new Blob([`${headers}\\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    showAlert('User data downloaded successfully!', 'success');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
        <Typography>Loading users...</Typography>
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
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
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
                    {filteredUsers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filtered Results
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
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {users.filter(u => u.gender?.toLowerCase() === 'male').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Male Users
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
                <Avatar sx={{ bgcolor: '#e91e63', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
                    {users.filter(u => u.gender?.toLowerCase() === 'female').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Female Users
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
            <Avatar sx={{ bgcolor: '#005A54', mr: 2 }}>
              <Person />
            </Avatar>
            <Typography variant="h6" component="h2" sx={{ color: '#005A54', flexGrow: 1 }}>
              User Management
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
              placeholder="Search users by name, email, address, phone..."
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

          {filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length === 0 ? 'No users in the database' : 'Try adjusting your search criteria'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#FFEED6' }}>
                  <TableRow>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Contact</strong></TableCell>
                    <TableCell><strong>Personal Info</strong></TableCell>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user._id} 
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0, 90, 84, 0.04)' },
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#005A54', mr: 2 }}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user._id?.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Email sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                            <Typography variant="body2">{user.gmail || 'N/A'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                            <Typography variant="body2">{user.phone || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>Age: {user.age || 'N/A'}</Typography>
                            {user.gender && (
                              <Chip 
                                label={user.gender} 
                                size="small" 
                                sx={{ 
                                  bgcolor: getGenderColor(user.gender),
                                  color: 'white',
                                  fontSize: '0.75rem'
                                }} 
                              />
                            )}
                          </Box>
                          {user.dob && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Cake sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                              <Typography variant="body2">{formatDate(user.dob)}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Home sx={{ fontSize: 16, mr: 1, color: '#005A54' }} />
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.address || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleView(user)}
                              sx={{ color: '#005A54' }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(user)}
                              sx={{ color: '#ff9800' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(user)}
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
            Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
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

export default UserTable;
