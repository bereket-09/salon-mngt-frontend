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
  TableSortLabel,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import TableNoData from '../user/table-no-data';
import TableEmptyRows from '../user/table-empty-rows';
import { useNavigate } from 'react-router-dom';
import EditQuestionForm from './editQuestion';
import config from 'src/config'; // Import the config file

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
      const url = `${config.BASE_URL}/api/questions`;
      try {
        const response = await fetch(url);
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
  const hasEditPermission = userRoles.some(role =>
    ['admin', 'trivia-admin', 'trivia-questions-admin'].includes(role)
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Manage Questions</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleRedirect}
          >
            New Question
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleRedirectImport}
          >
            Import
          </Button>
        </Stack>
      </Stack>

      {/* Filter Section */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={filterName}
            onChange={handleFilterByName}
            placeholder="Search by text..."
          />
          <Select
            value={filterDate}
            onChange={handleFilterByDate}
            displayEmpty
            size="small"
            inputProps={{ 'aria-label': 'Filter by Date' }}
            fullWidth
            sx={{ minWidth: 60 }}
          >
            <MenuItem value="">All Dates</MenuItem>
            {dates.map((date) => (
              <MenuItem key={date} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Card>

      {/* Table Section */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'question_id'}
                    direction={orderBy === 'question_id' ? order : 'asc'}
                    onClick={() => handleRequestSort('question_id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'english_text'}
                    direction={orderBy === 'english_text' ? order : 'asc'}
                    onClick={() => handleRequestSort('english_text')}
                  >
                    English Text
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'amharic_text'}
                    direction={orderBy === 'amharic_text' ? order : 'asc'}
                    onClick={() => handleRequestSort('amharic_text')}
                  >
                    Amharic Text
                  </TableSortLabel>
                </TableCell>
                <TableCell>English Options</TableCell>
                <TableCell>Amharic Options</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'correct_answer'}
                    direction={orderBy === 'correct_answer' ? order : 'asc'}
                    onClick={() => handleRequestSort('correct_answer')}
                  >
                    Correct Answer
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'question_date'}
                    direction={orderBy === 'question_date' ? order : 'asc'}
                    onClick={() => handleRequestSort('question_date')}
                  >
                    Question Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_by_username'}
                    direction={orderBy === 'created_by_username' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_by_username')}
                  >
                    Created By
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                {hasEditPermission && <TableCell>Actions</TableCell>}
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
                    <TableRow key={question.question_id}>
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
                          <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleOpenDialog(question)}>
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
