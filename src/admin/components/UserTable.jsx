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
import UserModal from './UserModal';
import LogoImage from '../../images/logo.png';

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
  
  // Add User Modal states
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addUserMode, setAddUserMode] = useState('create');

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
    
    // Also refresh when component becomes visible (when navigating to this page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing users');
        fetchUsers();
      }
    };
    
    // Listen for localStorage changes from other tabs/components
    const handleStorageChange = (e) => {
      if (e.key === 'localUsers' || e.key === 'userDataUpdated') {
        console.log('🔄 Storage change detected, refreshing table');
        fetchUsers();
      }
    };
    
    // Listen for custom refresh events from AdminDashboard
    const handleCustomRefresh = () => {
      console.log('🔄 Custom refresh event received, refreshing users');
      fetchUsers();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refreshUserTable', handleCustomRefresh);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshUserTable', handleCustomRefresh);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting fetchUsers...');
      
      // First, try to fetch from backend
      let backendUsers = [];
      try {
        console.log('📡 Attempting to fetch from backend...');
        const response = await axios.get('http://localhost:5000/users');
        backendUsers = response.data?.users || response.data || [];
        console.log('✅ Fetched users from backend:', backendUsers.length);
        console.log('Backend users:', backendUsers.map(u => ({ id: u._id, name: u.name, email: u.gmail || u.email })));
      } catch (backendError) {
        console.log('❌ Backend not available, using local data only:', backendError.message);
      }
      
      // Get users from localStorage (created when backend is down)
      const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      console.log('📁 Local users found:', localUsers.length);
      if (localUsers.length > 0) {
        console.log('Local users:', localUsers.map(u => ({ id: u._id, name: u.name, email: u.gmail || u.email })));
      }
      
      // Combine backend and local users, avoiding duplicates
      const allUsers = [...backendUsers];
      
      // Add local users that don't exist in backend data
      localUsers.forEach(localUser => {
        const existsInBackend = backendUsers.some(backendUser => 
          backendUser.email === localUser.email || 
          backendUser.gmail === localUser.gmail || 
          backendUser._id === localUser._id ||
          backendUser.name === localUser.name
        );
        if (!existsInBackend) {
          console.log('➕ Adding local user to table:', localUser.name);
          allUsers.push(localUser);
        } else {
          console.log('⏭️ Skipping duplicate local user:', localUser.name);
        }
      });
      
      console.log('📊 Total users (backend + local):', allUsers.length);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      
      // If we successfully got backend data and have local data, merge them properly
      if (backendUsers.length > 0 && localUsers.length > 0) {
        console.log('🔄 Backend is working, but keeping local users that might not be synced yet');
        // Don't clear localStorage immediately - let the backend sync process handle it
      }
      
    } catch (error) {
      console.error('❌ Error in fetchUsers:', error);
      showAlert('Failed to fetch users from server', 'error');
      
      // Fallback to localStorage only
      const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
      console.log('📁 Using localStorage fallback:', localUsers.length, 'users');
      setUsers(localUsers);
      setFilteredUsers(localUsers);
    } finally {
      setLoading(false);
      console.log('✅ fetchUsers completed');
    }
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const searchFields = [
          user.name || '',
          user.email || '',
          user.gmail || '',
          user.phone || '',
          user.address || '',
          user.role || '',
          user._id || ''
        ];
        
        return searchFields.some(field =>
          String(field).toLowerCase().startsWith(searchTerm.toLowerCase())
        );
      });
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
      console.log('Creating professional PDF with user data...');
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Professional Header Background
      doc.setFillColor(0, 90, 84); // #005A54
      doc.rect(0, 0, pageWidth, 100, 'F');
      
      // Add FabricFlow Logo Image
      try {
        // Use your actual logo image from src/images/logo.png
        doc.addImage(LogoImage, 'PNG', 30, 20, 60, 60);
      } catch (error) {
        console.log('Logo image failed to load, using fallback');
        // Professional fallback if image doesn't load
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(30, 20, 60, 60, 10, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(0, 90, 84);
        doc.text('FF', 55, 55);
      }
      
      // Company Name and Title
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text('FABRIC FLOW', 100, 45);
      
      doc.setFontSize(14);
      doc.setTextColor(220, 220, 220);
      doc.text('Management System', 100, 65);
      
      // Report Information Box
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
      
      // Info box background
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(40, 120, pageWidth - 80, 80, 5, 5, 'F');
      
      // Report Title
      doc.setFontSize(20);
      doc.setTextColor(0, 90, 84);
      doc.text('USER MANAGEMENT REPORT', 60, 150);
      
      // Report Details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${dateStr} at ${timeStr}`, 60, 170);
      doc.text(`Generated By: System Administrator`, 60, 185);
      doc.text(`Total Records: ${filteredUsers.length} users`, 400, 170);
      doc.text(`Report ID: USR-${Date.now().toString().slice(-6)}`, 400, 185);
      
      // Prepare professional table data
      const tableData = filteredUsers.map((user, index) => [
        (index + 1).toString(),
        user.name || 'N/A',
        user.gmail || user.email || 'N/A',
        user.phone || 'N/A',
        user.age ? user.age.toString() : 'N/A',
        user.role || 'User',
        user.gender || 'N/A',
        user.address || 'N/A'
      ]);
      
      // Professional Table
      autoTable(doc, {
        startY: 230,
        head: [['#', 'Full Name', 'Email Address', 'Phone Number', 'Age', 'Role', 'Gender', 'Address']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 90, 84],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 8
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          cellPadding: 6,
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },   // #
          1: { cellWidth: 80 },   // Name
          2: { cellWidth: 120 },  // Email  
          3: { cellWidth: 70 },   // Phone
          4: { cellWidth: 35, halign: 'center' },   // Age
          5: { cellWidth: 50, halign: 'center' },   // Role
          6: { cellWidth: 45, halign: 'center' },   // Gender
          7: { cellWidth: 100 }   // Address
        },
        styles: {
          overflow: 'linebreak',
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          cellPadding: 6
        },
        margin: { left: 40, right: 40 },
        didDrawPage: function (data) {
          // Professional Footer
          const footerY = pageHeight - 60;
          
          // Footer line
          doc.setDrawColor(0, 90, 84);
          doc.setLineWidth(2);
          doc.line(40, footerY, pageWidth - 40, footerY);
          
          // Footer content
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Fabric Flow Management System | Confidential Document', 40, footerY + 20);
          doc.text(`Page ${data.pageNumber}`, pageWidth - 80, footerY + 20);
          doc.text(`Generated on ${dateStr}`, 40, footerY + 35);
          doc.text('© 2025 Fabric Flow. All rights reserved.', pageWidth - 180, footerY + 35);
        }
      });
      
      // Summary Box
      const finalY = doc.lastAutoTable.finalY + 30;
      if (finalY < pageHeight - 120) {
        doc.setFillColor(0, 90, 84);
        doc.roundedRect(40, finalY, pageWidth - 80, 60, 5, 5, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('REPORT SUMMARY', 60, finalY + 25);
        
        doc.setFontSize(10);
        doc.text(`Total Users: ${filteredUsers.length}`, 60, finalY + 45);
        doc.text(`Active Users: ${filteredUsers.filter(u => u.role !== 'inactive').length}`, 200, finalY + 45);
        doc.text(`Admin Users: ${filteredUsers.filter(u => u.role === 'admin').length}`, 350, finalY + 45);
      }
      
      // Save the PDF
      const fileName = `FabricFlow_Professional_Users_Report_${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      showAlert('Professional user report downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating professional User PDF:', error);
      showAlert('Failed to generate professional user PDF report', 'error');
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

          {/* Debug Info and Refresh */}
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Debug Info: Total Users: {users.length} | Filtered: {filteredUsers.length} | 
              Local Storage: {JSON.parse(localStorage.getItem('localUsers') || '[]').length} users
            </Typography>
            <Button
              variant="contained"
              startIcon={<Person />}
              onClick={() => setAddUserModalOpen(true)}
              sx={{ 
                mr: 1,
                bgcolor: '#EF6869', 
                '&:hover': { bgcolor: '#d55859' },
                color: 'white'
              }}
            >
              Add New User
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                console.log('Manual refresh clicked');
                fetchUsers();
              }}
              sx={{ mr: 1, bgcolor: '#005A54' }}
            >
              Refresh Table
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const localData = localStorage.getItem('localUsers');
                console.log('LocalStorage data:', localData);
                alert(`LocalStorage contains: ${localData ? JSON.parse(localData).length : 0} users`);
              }}
              sx={{ borderColor: '#005A54', color: '#005A54' }}
            >
              Check Local Data
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

      {/* User Modal for Adding New Users */}
      <UserModal
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        user={null}
        mode={addUserMode}
        onUserUpdate={() => {
          fetchUsers(); // Refresh the table after adding a new user
          setAddUserModalOpen(false);
        }}
      />
    </Box>
  );
};

export default UserTable;
