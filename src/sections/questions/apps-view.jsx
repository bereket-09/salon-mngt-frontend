import { useState, useEffect } from 'react';
import Label from 'src/components/label';
import {
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Container,
  Typography,
  MenuItem,
  Select,
  Input,
  Grid,
  TableSortLabel,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import TableNoData from '../user/table-no-data';
import TableEmptyRows from '../user/table-empty-rows';
import { useNavigate } from 'react-router-dom';
import EditQuestionForm from './editQuestion';
import config from 'src/config'; // Import the config file
import { styled } from '@mui/system';

export default function QuestionsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [dates, setDates] = useState([]); // To store unique dates for the filter
  const [order, setOrder] = useState('desc'); // State for sorting order
  const [orderBy, setOrderBy] = useState('question_date'); // State for sorting column
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [userRoles, setUserRoles] = useState([]); // State to store user roles

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/create-question');
  };

  useEffect(() => {
    // Fetch user data from local storage and extract roles
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && Array.isArray(userData.roles)) {
      setUserRoles(userData.roles); // Set the roles in state
    }

    const fetchQuestions = async () => {
      const token = localStorage.getItem('authToken');

      const headers = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const url = `${config.BASE_URL}/api/questions`;
      try {
        const response = await fetch(url, headers);
        const result = await response.json();
        if (result.code === 1000) {
          setQuestions(result.data);

          // Extract unique dates from the questions and sort them in reverse order
          const uniqueDates = [
            ...new Set(result.data.map((question) => question.question_date.split('T')[0])),
          ];
          uniqueDates.sort((a, b) => new Date(b) - new Date(a)); // Sort in descending order
          setDates(uniqueDates);
        } else {
          console.error('Error fetching questions:', result.message);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value.toLowerCase());
  };

  const handleFilterByDate = (event) => {
    setFilterDate(event.target.value);
  };

  const handleOpenDialog = (question = null) => {
    if (question && question.question_id) {
      navigate(`/edit-question/${question.question_id}`);
    } else {
      console.log(question.question_id, question);
      console.error('Question ID is missing');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedQuestion(null);
  };

  // Apply filtering
  const filteredData = questions.filter((row) => {
    const matchesName =
      row.english_text.toLowerCase().includes(filterName) ||
      row.amharic_text.toLowerCase().includes(filterName);
    const matchesDate = !filterDate || row.question_date.split('T')[0] === filterDate;
    return matchesName && matchesDate;
  });

  // Apply sorting
  const sortedData = filteredData.sort((a, b) => {
    const valueA = a[orderBy];
    const valueB = b[orderBy];
    if (order === 'asc') {
      return valueA < valueB ? -1 : 1;
    } else {
      return valueA > valueB ? -1 : 1;
    }
  });

  const handleRedirectImport = () => {
    navigate('/upload-question');
  };

  const isEmpty = !sortedData.length && !loading;

  // Check if the user has admin or trivia-related roles
  const hasEditPermission = userRoles.some((role) =>
    ['admin', 'trivia-admin', 'trivia-questions-admin'].includes(role)
  );

  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    maxHeight: '70vh', // Set table container height to 80% of the viewport height
    overflowY: 'auto', // Enable vertical scrolling
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
      borderRadius: '10px',
    },
  }));

  return (
    <Container maxWidth="xl">
      {' '}
      {/* Wider container for better table visibility */}
      {/* Header Section */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h5" fontWeight="bold">
          Manage Questions
        </Typography>
        <Stack direction="row" spacing={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleRedirect}
          >
            New Question
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={handleRedirectImport}
          >
            Import
          </Button>
        </Stack>
      </Stack>
      {/* Filter Section */}
      <Card sx={{ mb: 1, p: 2, borderRadius: 1, boxShadow: 0 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={filterName}
              onChange={handleFilterByName}
              placeholder="Search questions..."
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" style={{ marginRight: 8 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Select
              value={filterDate}
              onChange={handleFilterByDate}
              displayEmpty
              size="small"
              fullWidth
              sx={{ minWidth: 120 }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 400, // Set a max height for the dropdown
                    overflowY: 'auto', // Allow scrolling if content exceeds maxHeight
                  },
                },
              }}
            >
              <MenuItem value="">All Dates</MenuItem>
              {dates.map((date) => (
                <MenuItem key={date} value={date}>
                  {date}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Card>
      {/* Table Section */}
      <Card sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        <StyledTableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.light' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'question_id'}
                    direction={orderBy === 'question_id' ? order : 'asc'}
                    onClick={() => handleRequestSort('question_id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'english_text'}
                    direction={orderBy === 'english_text' ? order : 'asc'}
                    onClick={() => handleRequestSort('english_text')}
                  >
                    English Text
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'amharic_text'}
                    direction={orderBy === 'amharic_text' ? order : 'asc'}
                    onClick={() => handleRequestSort('amharic_text')}
                  >
                    Amharic Text
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  English Options
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  Amharic Options
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'correct_answer'}
                    direction={orderBy === 'correct_answer' ? order : 'asc'}
                    onClick={() => handleRequestSort('correct_answer')}
                  >
                    Correct Answer
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'question_date'}
                    direction={orderBy === 'question_date' ? order : 'asc'}
                    onClick={() => handleRequestSort('question_date')}
                  >
                    Question Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'created_by_username'}
                    direction={orderBy === 'created_by_username' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_by_username')}
                  >
                    Created By
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                {hasEditPermission && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableNoData isNotFound={loading} />
              ) : isEmpty ? (
                <TableEmptyRows emptyRows={0} />
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((question) => (
                    <TableRow key={question.question_id} hover>
                      <TableCell>{question.question_id}</TableCell>
                      <TableCell>{question.english_text}</TableCell>
                      <TableCell>{question.amharic_text}</TableCell>
                      <TableCell>{question.english_options.join(', ')}</TableCell>
                      <TableCell>{question.amharic_options.join(', ')}</TableCell>
                      <TableCell>{question.correct_answer}</TableCell>
                      <TableCell>{question.question_date}</TableCell>
                      <TableCell>{question.created_by_username}</TableCell>
                      <TableCell>
                        <Label
                          variant="soft"
                          color={(question.status === 'deleted' && 'error') || 'success'}
                        >
                          {question.status}
                        </Label>
                      </TableCell>
                      {hasEditPermission && (
                        <TableCell>
                          <IconButton onClick={() => handleOpenDialog(question)}>
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 30, 45]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
