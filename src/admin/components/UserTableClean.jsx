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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import UserViewEditModal from './UserViewEditModal';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://fabricflow-backend1.onrender.com/users');
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
    console.log('Edit clicked for:', user);
    setSelectedUser(user);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`https://fabricflow-backend1.onrender.com/users/${userToDelete._id}`);
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
    console.log('View clicked for:', user);
    setSelectedUser(user);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setModalMode('view');
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers(users.map(user => 
      user._id === updatedUser._id ? updatedUser : user
    ));
    setFilteredUsers(filteredUsers.map(user => 
      user._id === updatedUser._id ? updatedUser : user
    ));
    showAlert(`User "${updatedUser.name}" updated successfully!`, 'success');
    handleModalClose();
  };

  const downloadPDF = () => {
    if (filteredUsers.length === 0) {
      showAlert('No users to download', 'warning');
      return;
    }

    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      
      // Header - FABRIC FLOW title
      doc.setFontSize(24);
      doc.setTextColor(0, 90, 84); // #005A54
      doc.text('FABRIC FLOW', 56.69, 756.85);
      
      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('User Management Report', 56.69, 714.33);
      
      // Generated date and time
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      doc.text(`Generated on: ${dateStr} at ${timeStr}`, 56.69, 685.98);
      
      // Horizontal line separator
      doc.setDrawColor(0, 90, 84);
      doc.setLineWidth(1.42);
      doc.line(56.69, 671.81, 538.58, 671.81);
      
      // Prepare table data
      const tableData = filteredUsers.map(user => [
        user.name || 'N/A',
        user.gmail || user.email || 'N/A',
        user.phone || 'N/A',
        user.age ? user.age.toString() : 'N/A',
        user.role || 'user',
        user.gender || 'N/A',
        user.address || 'N/A'
      ]);
      
      // Create table using autoTable
      doc.autoTable({
        startY: 643.46,
        head: [['Name', 'Email', 'Phone', 'Age', 'Role', 'Gender', 'Address']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 90, 84],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [80, 80, 80],
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 80 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30 },
          4: { cellWidth: 40 },
          5: { cellWidth: 40 },
          6: { cellWidth: 150 }
        },
        styles: {
          overflow: 'linebreak',
          cellPadding: 5,
          lineWidth: 0.78,
          lineColor: [200, 200, 200]
        },
        margin: { left: 56.69 }
      });
      
      // Footer information
      const finalY = doc.lastAutoTable.finalY || 500;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This report is generated by Fabric Flow Admin System', 56.69, finalY + 40);
      doc.text(`Total Users: ${filteredUsers.length}`, 56.69, finalY + 68);
      
      // Save the PDF
      const fileName = `FabricFlow_Users_Report_${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      showAlert('User report downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('Failed to generate PDF report', 'error');
    }
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
                <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
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
              onClick={downloadPDF}
              sx={{
                borderColor: '#005A54',
                color: '#005A54',
                '&:hover': {
                  borderColor: '#005A54',
                  backgroundColor: 'rgba(0, 90, 84, 0.04)'
                }
              }}
            >
              Download PDF
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

      {/* User Modal for View/Edit */}
      <UserViewEditModal
        open={modalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        mode={modalMode}
        onUserUpdate={handleUserUpdate}
      />
    </Box>
  );
};

export default UserTable;
