import React, { useState } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  TableContainer,
} from '@mui/material';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import config from 'src/config'; // Import the config file

const ImportQuestions = () => {
  const [parsedData, setParsedData] = useState([]);
  const [fileType, setFileType] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false); // Clear confirmation dialog
  const navigate = useNavigate(); // Hook for navigation

  const requiredColumns = [
    'Question_TEXT_(English)',
    'Question_TEXT_(Amharic)',
    'English_Option_A',
    'English_Option_B',
    'English_Option_C',
    'Amharic_Option_A',
    'Amharic_Option_B',
    'Amharic_Option_C',
    'CORRECT_ANSWER',
    'Scheduled_Date',
  ];

  const validateColumns = (columns) => {
    const missingColumns = requiredColumns.filter((col) => !columns.includes(col));
    if (missingColumns.length > 0) {
      setError(`Missing required columns: ${missingColumns.join(', ')}`);
      return false;
    }
    return true;
  };

  const validateRow = (row) => {
    const today = dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs().format('HH:mm');
    let status = { message: 'Success', color: 'success' };

    for (let col of requiredColumns) {
      // Check if row[col] is defined and is a string; if not, handle it as empty
      if (!row[col] || (typeof row[col] === 'string' && row[col].trim() === '')) {
        status = { message: `Error: ${col} is empty`, color: 'error' };
        return status;
      }
    }
    const account = JSON.parse(localStorage.getItem('userData'));
    const role = account.role;

    const scheduledDate = row['Scheduled_Date'];
    if (!dayjs(scheduledDate, 'YYYY-MM-DD', true).isValid()) {
      status = { message: 'Error: Invalid date format', color: 'error' };
    } else if (dayjs(scheduledDate).isBefore(today)) {
      status = { message: 'Error: Scheduled date is in the past', color: 'error' };
    } else if (scheduledDate === today && currentTime >= '09:00' && role != 'admin') {
      status = { message: 'Error: Scheduled date cannot be today after 09:00', color: 'error' };
    }

    return status;
  };

  // const validateRow = (row) => {
  //   const today = dayjs().format('YYYY-MM-DD');
  //   // Get the current local time
  //   const currentTime = dayjs().format('HH:mm');
  //   let status = { message: 'Success', color: 'success' };

  //   for (let col of requiredColumns) {
  //     if (!row[col] || row[col].trim() === '') {
  //       status = { message: `Error: ${col} is empty`, color: 'error' };
  //       return status;
  //     }
  //   }

  //   const scheduledDate = row['Scheduled_Date'];
  //   if (!dayjs(scheduledDate, 'YYYY-MM-DD', true).isValid()) {
  //     status = { message: 'Error: Invalid date format', color: 'error' };
  //   } else if (dayjs(scheduledDate).isBefore(today)) {
  //     status = { message: 'Error: Scheduled date is in the past', color: 'error' };
  //   } else if (scheduledDate === today && currentTime >= '18:00') {
  //     status = { message: 'Error: Scheduled date cannot be today after 08:00', color: 'error' };
  //   }

  //   return status;
  // };

  // const handleFileUpload = (file) => {
  //   const extension = file.name.split('.').pop().toLowerCase();
  //   setFileType(extension);

  //   const reader = new FileReader();

  //   const fileReaderOnLoad = (e) => {
  //     const binaryString = e.target.result;
  //     try {
  //       const workbook = XLSX.read(binaryString, { type: 'binary' });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet);

  //       const columns = Object.keys(jsonData[0]);
  //       if (!validateColumns(columns)) {
  //         return;
  //       }

  //       const dataWithStatus = jsonData.map((row) => ({
  //         ...row,
  //         status: validateRow(row),
  //       }));

  //       setParsedData(dataWithStatus);
  //       setError('');
  //     } catch (error) {
  //       setError('Error parsing Excel file. Please check the file format.');
  //     }
  //   };

  //   if (extension === 'csv') {
  //     reader.onload = () => {
  //       Papa.parse(file, {
  //         header: true,
  //         complete: (result) => {
  //           if (result.errors.length > 0) {
  //             setError('Error parsing CSV file. Please check the file format.');
  //             return;
  //           }

  //           const columns = Object.keys(result.data[0]);
  //           if (!validateColumns(columns)) {
  //             return;
  //           }

  //           const dataWithStatus = result.data.map((row) => ({
  //             ...row,
  //             status: validateRow(row),
  //           }));

  //           setParsedData(dataWithStatus);
  //           setError('');
  //         },
  //       });
  //     };
  //     reader.readAsText(file);
  //   } else if (extension === 'xlsx') {
  //     reader.onload = fileReaderOnLoad;
  //     reader.readAsBinaryString(file);
  //   } else {
  //     setError('Unsupported file format. Only CSV and XLSX are allowed.');
  //   }

  //   setFile(file);
  // };

  // const handleFileInputChange = (event) => {
  //   const selectedFile = event.target.files[0];
  //   if (selectedFile) {
  //     if (file && file.name === selectedFile.name && file.size === selectedFile.size) {
  //       // File is the same as the previous one
  //       setConfirmOpen(true);
  //       setNewFile(selectedFile);
  //     } else {
  //       handleFileUpload(selectedFile);
  //     }
  //   }
  // };

  const handleFileUpload = (file) => {
    console.log('File selected:', file); // Log file details

    const extension = file.name.split('.').pop().toLowerCase();
    setFileType(extension);
    console.log('File extension:', extension); // Log file extension

    const reader = new FileReader();

    const fileReaderOnLoad = (e) => {
      const binaryString = e.target.result;
      try {
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Parsed Excel data:', jsonData); // Log parsed Excel data

        const columns = Object.keys(jsonData[0]);
        if (!validateColumns(columns)) {
          console.error('Invalid columns:', columns); // Log invalid columns
          return;
        }

        const dataWithStatus = jsonData.map((row) => ({
          ...row,
          status: validateRow(row),
        }));

        setParsedData(dataWithStatus);
        setError('');
        console.log('Data with status added:', dataWithStatus); // Log data with validation status
      } catch (error) {
        console.error('Error parsing Excel file:', error); // Log parsing error
        setError('Error parsing Excel file. Please check the file format.');
      }
    };

    if (extension === 'csv') {
      reader.onload = () => {
        Papa.parse(file, {
          header: true,
          complete: (result) => {
            if (result.errors.length > 0) {
              console.error('CSV parsing errors:', result.errors); // Log CSV parsing errors
              setError('Error parsing CSV file. Please check the file format.');
              return;
            }

            const columns = Object.keys(result.data[0]);
            if (!validateColumns(columns)) {
              console.error('Invalid columns in CSV:', columns); // Log invalid columns in CSV
              return;
            }

            const dataWithStatus = result.data.map((row) => ({
              ...row,
              status: validateRow(row),
            }));

            setParsedData(dataWithStatus);
            setError('');
            console.log('CSV data with status added:', dataWithStatus); // Log CSV data with validation status
          },
        });
      };
      reader.readAsText(file);
    } else if (extension === 'xlsx') {
      reader.onload = fileReaderOnLoad;
      reader.readAsBinaryString(file);
    } else {
      console.error('Unsupported file format:', extension); // Log unsupported file format
      setError('Unsupported file format. Only CSV and XLSX are allowed.');
    }

    setFile(file);
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file from input:', selectedFile); // Log selected file from input

    if (selectedFile) {
      if (file && file.name === selectedFile.name && file.size === selectedFile.size) {
        // File is the same as the previous one
        console.log('Same file selected, prompting confirmation'); // Log same file selection
        setConfirmOpen(true);
        setNewFile(selectedFile);
      } else {
        handleFileUpload(selectedFile);
      }
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (file && file.name === droppedFile.name && file.size === droppedFile.size) {
        setConfirmOpen(true);
        setNewFile(droppedFile);
      } else {
        handleFileUpload(droppedFile);
      }
    }
  };

  const handleConfirmNewFile = () => {
    handleFileUpload(newFile);
    setNewFile(null);
    setConfirmOpen(false);
  };

  const handleCancelNewFile = () => {
    setNewFile(null);
    setConfirmOpen(false);
  };

  const handleClear = () => {
    setClearConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    setFile(null);
    setParsedData([]);
    setClearConfirmOpen(false);
  };

  const handleCancelClear = () => {
    setClearConfirmOpen(false);
  };

  const handleConfirm = () => {
    // Ask user if they want to insert all questions into the DB
    const userConfirmed = window.confirm(
      'Do you want to insert all the questions into the database?'
    );
    if (userConfirmed) {
      isConfirmDisabled = true;
      const account = JSON.parse(localStorage.getItem('userData'));
      const username = account.username;

      const formattedQuestions = parsedData.map((row) => ({
        englishText: row['Question_TEXT_(English)'],
        amharicText: row['Question_TEXT_(Amharic)'],
        englishOptions: [row['English_Option_A'], row['English_Option_B'], row['English_Option_C']],
        amharicOptions: [row['Amharic_Option_A'], row['Amharic_Option_B'], row['Amharic_Option_C']],
        correctAnswer: row['CORRECT_ANSWER'],
        date: row['Scheduled_Date'],
        created_by_username: username,
        status: 'active',
      }));

      fetch(`${config.BASE_URL}/api/questions/bulk-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedQuestions),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
          if (data.code === 1000) {
            // Handle success (e.g., show a success message)
            toast.success(data.message);
            setTimeout(() => navigate('/questions'), 2000); // Redirect after 2 seconds to allow toast to be displayed
          } else {
            toast.error('Failed to create question: ' + data.message);
            isConfirmDisabled = errorCount > 0;
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          // Handle error (e.g., show an error message)
        });
    }
  };

  const totalQuestions = parsedData.length;
  const errorCount = parsedData.filter((row) => row.status.color === 'error').length;
  let isConfirmDisabled = errorCount > 0;

  return (
    <div>
      {!file && (
        <Box sx={{ mb: 3 }}>
              <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 4 }}>
                  Back
                </Button>
                <br />
          <Typography variant="h5" gutterBottom>
            Import Questions
          </Typography>

          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            sx={{
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f1f1f1',
              },
            }}
          >
            <Typography variant="body1" color="textSecondary">
              Drag & drop a file here, or{' '}
              <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#1976d2' }}>
                browse
              </label>
            </Typography>
            <input
              type="file"
              accept=".csv, .xlsx"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
            {file && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 2 }}
              >{`Selected File: ${file.name}`}</Typography>
            )}
          </Box>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      )}

      {file && parsedData.length > 0 && (
        <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Imported Questions ({totalQuestions} total, {errorCount} errors)
          </Typography>

          <TableContainer sx={{ maxHeight: '70vh', overflowX: 'auto', maxWidth: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {requiredColumns.map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedData.map((row, index) => (
                  <TableRow key={index}>
                    {requiredColumns.map((col, idx) => (
                      <TableCell key={idx}>{row[col] || 'N/A'}</TableCell>
                    ))}
                    <TableCell>
                      <Chip
                        label={row.status.message}
                        color={row.status.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            sx={{ mt: 2 }}
          >
            Confirm Import
          </Button>

          <Button variant="outlined" color="secondary" onClick={handleClear} sx={{ mt: 2, ml: 2 }}>
            Clear
          </Button>
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={handleCancelNewFile}>
        <DialogTitle>File Upload Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A file is already uploaded. Do you want to replace it with the new one?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNewFile}>Cancel</Button>
          <Button onClick={handleConfirmNewFile} color="primary">
            Yes, Replace
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clearConfirmOpen} onClose={handleCancelClear}>
        <DialogTitle>Clear Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear the uploaded file and data?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear}>Cancel</Button>
          <Button onClick={handleConfirmClear} color="primary">
            Yes, Clear
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default ImportQuestions;
