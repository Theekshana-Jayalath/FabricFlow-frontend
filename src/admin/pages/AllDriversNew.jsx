import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Grid, 
  Chip,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const AllDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch drivers from employees endpoint
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://fabricflow-backend1.onrender.com/employees/drivers');
        
        if (response.data.success) {
          setDrivers(response.data.drivers || []);
          console.log(`Fetched ${response.data.count} drivers from employees`);
        } else {
          setError('Failed to fetch drivers');
        }
      } catch (err) {
        console.error('Error fetching drivers:', err);
        if (err.response) {
          setError(err.response.data?.message || 'Failed to fetch drivers');
        } else if (err.request) {
          setError('No response from server. Please check your backend connection.');
        } else {
          setError('Error: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);

  // Filter drivers based on search term
  const filteredDrivers = useMemo(() => {
    if (!searchTerm.trim()) return drivers;
    const term = searchTerm.toLowerCase();
    return drivers.filter((driver) => {
      return (
        (driver.empId || '').toLowerCase().includes(term) ||
        (driver.empName || '').toLowerCase().includes(term) ||
        (driver.empPhone || '').toLowerCase().includes(term) ||
        (driver.emailAddress || '').toLowerCase().includes(term) ||
        (driver.status || '').toLowerCase().includes(term) ||
        (driver.address || '').toLowerCase().includes(term) ||
        (driver.jobPosition || '').toLowerCase().includes(term)
      );
    });
  }, [drivers, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter(d => d.status === 'active').length;
    const inactive = drivers.filter(d => d.status === 'inactive').length;
    const terminated = drivers.filter(d => d.status === 'terminated').length;
    
    return { total, active, inactive, terminated };
  }, [drivers]);

  // Handle driver view/edit
  const handleView = (driver) => {
    setSelectedDriver(driver);
    setEditDriver({ ...driver });
    setModalOpen(true);
  };

  // Handle modal close
  const handleClose = () => {
    setModalOpen(false);
    setSelectedDriver(null);
    setEditDriver(null);
    setModalLoading(false);
  };

  // Handle driver update
  const handleUpdate = async () => {
    if (!editDriver) return;
    
    setModalLoading(true);
    try {
      const response = await axios.put(`https://fabricflow-backend1.onrender.com/employees/${editDriver._id}`, {
        empId: editDriver.empId,
        empName: editDriver.empName,
        empPhone: editDriver.empPhone,
        jobPosition: editDriver.jobPosition,
        status: editDriver.status,
        address: editDriver.address,
        emailAddress: editDriver.emailAddress,
        age: editDriver.age,
        gender: editDriver.gender,
        dob: editDriver.dob
      });

      if (response.data.employee) {
        // Update the drivers list with the updated driver
        setDrivers(prev => prev.map(d => 
          d._id === editDriver._id ? response.data.employee : d
        ));
        alert('Driver updated successfully!');
        handleClose();
      }
    } catch (err) {
      console.error('Error updating driver:', err);
      alert('Failed to update driver: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!editDriver) return;
    
    setModalLoading(true);
    try {
      const updatedDriver = { ...editDriver, status: newStatus };
      const response = await axios.put(`https://fabricflow-backend1.onrender.com/employees/${editDriver._id}`, {
        empId: updatedDriver.empId,
        empName: updatedDriver.empName,
        empPhone: updatedDriver.empPhone,
        jobPosition: updatedDriver.jobPosition,
        status: newStatus,
        address: updatedDriver.address,
        emailAddress: updatedDriver.emailAddress,
        age: updatedDriver.age,
        gender: updatedDriver.gender,
        dob: updatedDriver.dob
      });

      if (response.data.employee) {
        setDrivers(prev => prev.map(d => 
          d._id === editDriver._id ? response.data.employee : d
        ));
        alert(`Driver status changed to ${newStatus} successfully!`);
        handleClose();
      }
    } catch (err) {
      console.error('Error changing driver status:', err);
      alert('Failed to change status: ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  // Handle PDF report generation
  const handleDownloadReport = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const title = 'Employee Drivers Report';
    const subtitle = searchTerm ? `Filtered by: ${searchTerm}` : 'All employee drivers';
    const genAt = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text(title, 14, 14);
    doc.setFontSize(10);
    doc.text(subtitle, 14, 20);
    doc.text(`Generated at: ${genAt}`, 14, 26);

    const rows = filteredDrivers.map((driver, idx) => [
      idx + 1,
      driver.empId || '-',
      driver.empName || '-',
      driver.empPhone || '-',
      driver.emailAddress || '-',
      driver.status || '-',
      (driver.address || '').substring(0, 50),
      driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : '-'
    ]);

    doc.autoTable({
      startY: 32,
      head: [[
        '#', 'Employee ID', 'Name', 'Phone', 'Email', 'Status', 'Address', 'Created Date'
      ]],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 90, 84] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 28 },
        4: { cellWidth: 45 },
        5: { cellWidth: 20 },
        6: { cellWidth: 50 },
        7: { cellWidth: 25 }
      }
    });

    doc.save(`employee-drivers-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#005A54' }}>
          All Employee Drivers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{ borderColor: '#005A54', color: '#005A54' }}
          >
            Download Report
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/sales/drivers/add')}
            sx={{ bgcolor: '#005A54', '&:hover': { bgcolor: '#004d47' } }}
          >
            Add Driver
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1d4ed8', color: 'white' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.total}</Typography>
                <Typography>Total Drivers</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#15803d', color: 'white' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.active}</Typography>
                <Typography>Active Drivers</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f97316', color: 'white' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <RemoveCircleIcon sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.inactive}</Typography>
                <Typography>Inactive Drivers</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ef4444', color: 'white' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PendingIcon sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>{stats.terminated}</Typography>
                <Typography>Terminated</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Employee ID, name, phone, email, status, or address..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Drivers Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                <TableCell><strong>Driver</strong></TableCell>
                <TableCell><strong>Employee ID</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Address</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#005A54' }}>
                        {driver.empName ? driver.empName.charAt(0).toUpperCase() : 'D'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {driver.empName || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{driver.empId || 'N/A'}</TableCell>
                  <TableCell>{driver.empPhone || 'N/A'}</TableCell>
                  <TableCell>{driver.emailAddress || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={driver.status || 'unknown'}
                      size="small"
                      sx={{
                        bgcolor: 
                          driver.status === 'active' ? '#10b981' : 
                          driver.status === 'inactive' ? '#ef4444' : 
                          driver.status === 'terminated' ? '#6b7280' : '#f59e0b',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {driver.address ? 
                        (driver.address.length > 50 ? 
                          `${driver.address.substring(0, 50)}...` : 
                          driver.address
                        ) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleView(driver)}
                      sx={{ 
                        borderColor: '#005A54', 
                        color: '#005A54',
                        '&:hover': { 
                          bgcolor: '#005A54', 
                          color: 'white' 
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Driver Modal */}
      <Dialog open={modalOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Driver Details
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editDriver && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee ID"
                  value={editDriver.empId || ''}
                  onChange={e => setEditDriver({ ...editDriver, empId: e.target.value })}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee Name"
                  value={editDriver.empName || ''}
                  onChange={e => setEditDriver({ ...editDriver, empName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={editDriver.empPhone || ''}
                  onChange={e => setEditDriver({ ...editDriver, empPhone: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  value={editDriver.emailAddress || ''}
                  onChange={e => setEditDriver({ ...editDriver, emailAddress: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Status"
                  select
                  value={editDriver.status || 'active'}
                  onChange={e => setEditDriver({ ...editDriver, status: e.target.value })}
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Age"
                  type="number"
                  value={editDriver.age || ''}
                  onChange={e => setEditDriver({ ...editDriver, age: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={editDriver.address || ''}
                  onChange={e => setEditDriver({ ...editDriver, address: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={modalLoading}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleStatusChange('inactive')} 
            color="warning" 
            variant="outlined" 
            disabled={modalLoading || (editDriver && editDriver.status === 'inactive')}
          >
            Set Inactive
          </Button>
          <Button 
            onClick={() => handleStatusChange('terminated')} 
            color="error" 
            variant="outlined" 
            disabled={modalLoading || (editDriver && editDriver.status === 'terminated')}
          >
            Terminate
          </Button>
          <Button 
            onClick={handleUpdate} 
            color="primary" 
            variant="contained" 
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllDrivers;
