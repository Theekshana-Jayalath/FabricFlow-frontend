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
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import EmployeeViewEditModal from './EmployeeViewEditModal';
import EmployeeModal from './EmployeeModal';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  
  // Add Employee Modal states
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [addEmployeeMode, setAddEmployeeMode] = useState('create');

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
    
    // Also refresh when component becomes visible (when navigating to this page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing employees');
        fetchEmployees();
      }
    };
    
    // Listen for localStorage changes from other tabs/components
    const handleStorageChange = (e) => {
      if (e.key === 'localEmployees') {
        console.log('Local employees changed, refreshing table');
        fetchEmployees();
      }
    };
    
    // Listen for custom refresh events from AdminDashboard
    const handleCustomRefresh = () => {
      console.log('Custom refresh event received, refreshing employees');
      fetchEmployees();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refreshEmployeeTable', handleCustomRefresh);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshEmployeeTable', handleCustomRefresh);
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // First, try to fetch from backend
      let backendEmployees = [];
      try {
        const response = await axios.get('http://localhost:5000/employees');
        backendEmployees = response.data?.employees || response.data || [];
        console.log('Fetched employees from backend:', backendEmployees.length);
      } catch (backendError) {
        console.log('Backend not available, using local data only');
      }
      
      // Get employees from localStorage (created when backend is down)
      const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
      console.log('Local employees found:', localEmployees.length);
      
      // Combine backend and local employees, avoiding duplicates
      const allEmployees = [...backendEmployees];
      
      // Add local employees that don't exist in backend data
      localEmployees.forEach(localEmp => {
        const existsInBackend = backendEmployees.some(backendEmp => 
          backendEmp.empId === localEmp.empId || backendEmp._id === localEmp._id
        );
        if (!existsInBackend) {
          allEmployees.push(localEmp);
        }
      });
      
      console.log('Total employees (backend + local):', allEmployees.length);
      setEmployees(allEmployees);
      setFilteredEmployees(allEmployees);
      
      // If we successfully got backend data, clear localStorage to avoid duplicates
      if (backendEmployees.length > 0) {
        localStorage.removeItem('localEmployees');
        console.log('Cleared local employees cache - backend is working');
      }
      
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      showAlert('Failed to fetch employees from server', 'error');
      
      // Fallback to localStorage only
      const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
      setEmployees(localEmployees);
      setFilteredEmployees(localEmployees);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((employee) => {
        const searchFields = [
          employee.empName || '',
          employee.emailAddress || '',
          employee.empPhone || '',
          employee.jobPosition || '',
          employee.empId || '',
          employee.age || '',
          employee.gender || '',
          employee.status || '',
          employee._id || ''
        ];
        
        return searchFields.some(field =>
          String(field).toLowerCase().startsWith(searchTerm.toLowerCase())
        );
      });
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setModalOpen(true);
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
    setSelectedEmployee(employee);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
    setModalMode('view');
  };

  const handleEmployeeUpdate = (updatedEmployee) => {
    setEmployees(employees.map(emp => 
      emp._id === updatedEmployee._id ? updatedEmployee : emp
    ));
    setFilteredEmployees(filteredEmployees.map(emp => 
      emp._id === updatedEmployee._id ? updatedEmployee : emp
    ));
    showAlert(`Employee "${updatedEmployee.empName}" updated successfully!`, 'success');
    handleModalClose();
  };

  const downloadPDF = () => {
    if (filteredEmployees.length === 0) {
      showAlert('No employees to download', 'warning');
      return;
    }

    try {
      console.log('Creating professional PDF with employee data...');
      const doc = new jsPDF('p', 'pt', 'a4');
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
      doc.text('EMPLOYEE MANAGEMENT REPORT', 60, 150);
      
      // Report Details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Generated: ${dateStr} at ${timeStr}`, 60, 170);
      doc.text(`Generated By: System Administrator`, 60, 185);
      doc.text(`Total Records: ${filteredEmployees.length} employees`, 400, 170);
      doc.text(`Report ID: EMP-${Date.now().toString().slice(-6)}`, 400, 185);
      
      // Prepare professional table data
      const tableData = filteredEmployees.map((emp, index) => [
        (index + 1).toString(),
        emp.empName || 'N/A',
        emp.department || emp.jobPosition || 'N/A',
        emp.age ? emp.age.toString() : 'N/A',
        emp.gender || 'N/A',
        emp.empPhone || emp.phoneNo || 'N/A',
        emp.emailAddress || emp.email || 'N/A',
        emp.address || 'N/A'
      ]);
      
      // Professional Table
      autoTable(doc, {
        startY: 230,
        head: [['#', 'Employee Name', 'Department', 'Age', 'Gender', 'Phone Number', 'Email Address', 'Address']],
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
          2: { cellWidth: 70 },   // Department
          3: { cellWidth: 35, halign: 'center' },   // Age
          4: { cellWidth: 45, halign: 'center' },   // Gender
          5: { cellWidth: 70 },   // Phone
          6: { cellWidth: 100 },  // Email
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
        doc.text(`Total Employees: ${filteredEmployees.length}`, 60, finalY + 45);
        doc.text(`Departments: ${[...new Set(filteredEmployees.map(e => e.department || e.jobPosition).filter(Boolean))].length}`, 200, finalY + 45);
        doc.text(`Average Age: ${Math.round(filteredEmployees.filter(e => e.age).reduce((sum, e) => sum + e.age, 0) / filteredEmployees.filter(e => e.age).length) || 0}`, 350, finalY + 45);
      }
      
      // Save the PDF
      const fileName = `FabricFlow_Professional_Employees_Report_${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      showAlert('Professional employee report downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating professional Employee PDF:', error);
      showAlert('Failed to generate professional employee PDF report', 'error');
    }
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
              Debug Info: Total Employees: {employees.length} | Filtered: {filteredEmployees.length} | 
              Local Storage: {JSON.parse(localStorage.getItem('localEmployees') || '[]').length} employees
            </Typography>
            <Button
              variant="contained"
              startIcon={<Work />}
              onClick={() => setAddEmployeeModalOpen(true)}
              sx={{ 
                mr: 1,
                bgcolor: '#EF6869', 
                '&:hover': { bgcolor: '#d55859' },
                color: 'white'
              }}
            >
              Add New Employee
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                console.log('Manual refresh clicked');
                fetchEmployees();
              }}
              sx={{ mr: 1, bgcolor: '#005A54' }}
            >
              Refresh Table
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const localData = localStorage.getItem('localEmployees');
                console.log('LocalStorage data:', localData);
                alert(`LocalStorage contains: ${localData ? JSON.parse(localData).length : 0} employees`);
              }}
              sx={{ borderColor: '#005A54', color: '#005A54' }}
            >
              Check Local Data
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

      {/* Employee Modal for View/Edit */}
      <EmployeeViewEditModal
        open={modalOpen}
        onClose={handleModalClose}
        employee={selectedEmployee}
        mode={modalMode}
        onEmployeeUpdate={handleEmployeeUpdate}
      />

      {/* Employee Modal for Adding New Employees */}
      <EmployeeModal
        open={addEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        employee={null}
        mode={addEmployeeMode}
        onEmployeeUpdate={() => {
          fetchEmployees(); // Refresh the table after adding a new employee
          setAddEmployeeModalOpen(false);
        }}
      />
    </Box>
  );
};

export default EmployeeTable;
