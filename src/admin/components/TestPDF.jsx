import React from 'react';
import { Button, Box } from '@mui/material';
import jsPDF from 'jspdf';

const TestPDF = () => {
  const handleCSVTest = () => {
    console.log('CSV test button clicked');
    try {
      const csvData = "Name,Email,Phone\nJohn Doe,john@test.com,123-456-7890\nJane Smith,jane@test.com,987-654-3210";
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('CSV download successful');
    } catch (error) {
      console.error('CSV error:', error);
    }
  };

  const handleClick = () => {
    console.log('Test PDF button clicked');
    try {
      const doc = new jsPDF();
      doc.text('Hello world!', 10, 10);
      
      // Try different save methods
      const pdfOutput = doc.output('blob');
      console.log('PDF blob created:', pdfOutput);
      
      // Create blob URL and download
      const url = URL.createObjectURL(pdfOutput);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('PDF error:', error);
    }
  };

  const handleClick2 = () => {
    console.log('Test PDF 2 button clicked');
    try {
      const doc = new jsPDF();
      doc.text('Hello world 2!', 10, 10);
      doc.save('test2.pdf');
      console.log('PDF 2 saved successfully');
    } catch (error) {
      console.error('PDF 2 error:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Button onClick={handleCSVTest} variant="contained" size="small" color="success">
        Test CSV
      </Button>
      <Button onClick={handleClick} variant="contained" size="small">
        Test PDF (Blob)
      </Button>
      <Button onClick={handleClick2} variant="outlined" size="small">
        Test PDF (Save)
      </Button>
    </Box>
  );
};

export default TestPDF;
