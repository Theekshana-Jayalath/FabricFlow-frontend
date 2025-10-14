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
import autoTable from 'jspdf-autotable';
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
        const response = await axios.get('http://localhost:5000/employees/drivers');
        
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
      const response = await axios.put(`http://localhost:5000/employees/${editDriver._id}`, {
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
      const response = await axios.put(`http://localhost:5000/employees/${editDriver._id}`, {
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
    if (filteredDrivers.length === 0) {
      alert('No drivers to download');
      return;
    }

    try {
      console.log('Creating professional PDF with driver data...');
      const doc = new jsPDF('l', 'pt', 'a4'); // Landscape orientation
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Professional Header Background
      doc.setFillColor(0, 90, 84); // #005A54
      doc.rect(0, 0, pageWidth, 100, 'F');
      
      // Company Logo Area (placeholder)
      doc.setFillColor(255, 255, 255);
      doc.circle(60, 50, 25, 'F');
      doc.setFontSize(12);
      doc.setTextColor(0, 90, 84);
      doc.text('FF', 55, 55);
      
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
      doc.text('DRIVER MANAGEMENT REPORT', 60, 150);
      
      // Report Details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${dateStr} at ${timeStr}`, 60, 170);
      doc.text(`Generated By: System Administrator`, 60, 185);
      doc.text(`Total Records: ${filteredDrivers.length} drivers`, 500, 170);
      doc.text(`Report ID: DRV-${Date.now().toString().slice(-6)}`, 500, 185);
      
      // Add search filter info if applicable
      if (searchTerm) {
        doc.text(`Filter Applied: "${searchTerm}"`, 60, 195);
      }
      
      // Prepare professional table data
      const tableData = filteredDrivers.map((driver, index) => [
        (index + 1).toString(),
        driver.empId || 'N/A',
        driver.empName || 'N/A',
        driver.empPhone || 'N/A',
        driver.emailAddress || 'N/A',
        driver.status || 'Unknown',
        driver.age ? driver.age.toString() : 'N/A',
        driver.gender || 'N/A',
        driver.address || 'N/A',
        driver.createdAt ? new Date(driver.createdAt).toLocaleDateString('en-GB') : 'N/A'
      ]);
      
      // Professional Table
      autoTable(doc, {
        startY: 230,
        head: [['#', 'Employee ID', 'Full Name', 'Phone Number', 'Email Address', 'Status', 'Age', 'Gender', 'Address', 'Join Date']],
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
          fontSize: 8,
          textColor: [60, 60, 60],
          cellPadding: 6,
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },   // #
          1: { cellWidth: 70 },   // Employee ID
          2: { cellWidth: 90 },   // Name
          3: { cellWidth: 80 },   // Phone
          4: { cellWidth: 120 },  // Email  
          5: { cellWidth: 60, halign: 'center' },   // Status
          6: { cellWidth: 35, halign: 'center' },   // Age
          7: { cellWidth: 50, halign: 'center' },   // Gender
          8: { cellWidth: 140 },  // Address
          9: { cellWidth: 70, halign: 'center' }    // Join Date
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
        doc.text(`Total Drivers: ${stats.total}`, 60, finalY + 45);
        doc.text(`Active Drivers: ${stats.active}`, 200, finalY + 45);
        doc.text(`Inactive Drivers: ${stats.inactive}`, 350, finalY + 45);
        doc.text(`Terminated Drivers: ${stats.terminated}`, 500, finalY + 45);
      }
      
      // Save the PDF
      const fileName = `FabricFlow_Professional_Drivers_Report_${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      // Show success message after PDF is saved
      setTimeout(() => {
        alert('Professional driver report downloaded successfully!');
      }, 100);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    }
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
