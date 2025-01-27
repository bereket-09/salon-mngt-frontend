import { useState, useEffect } from 'react';
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
  TableSortLabel,
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField, // Add TextField component for search
  IconButton,
} from '@mui/material';
import Label from 'src/components/label';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import config from 'src/config'; // Import the config file
import { styled } from '@mui/system';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  fontWeight: 'bold',
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: '70vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '10px',
  },
}));

export default function TriviaList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [triviaData, setTriviaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('trivia_id');
  const [searchDate, setSearchDate] = useState(''); // State for search date
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrivia = async () => {
      const url = `${config.BASE_URL}/api/trivia`;
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 1000) {
          setTriviaData(result.data);
          setFilteredData(result.data);
        } else {
          console.error('Error fetching trivia data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching trivia data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrivia();
  }, []);

  useEffect(() => {
    if (searchDate) {
      const filtered = triviaData.filter(
        (trivia) => trivia.execution_date.includes(searchDate) // Compare partial date match (YYYY-MM-DD)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(triviaData); // Reset to full data if search is empty
    }
  }, [searchDate, triviaData]);

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

  const handleRowClick = (triviaId) => {
    navigate(`/triviaDetail/${triviaId}`);
  };

  const handleViewClick = (triviaId) => {
    navigate(`/ismlar/${triviaId}`);
  };

  // Update the formatDate function to handle the 'YYYY-MM-DD HH:mm:ss' format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short', // Optional: e.g., "Mon"
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      // hour: '2-digit',
      // minute: '2-digit',
      // second: '2-digit',
    });
  };

  const sortedData = filteredData.sort((a, b) => {
    const valueA = a[orderBy];
    const valueB = b[orderBy];
    if (order === 'asc') {
      return valueA < valueB ? -1 : 1;
    } else {
      return valueA > valueB ? -1 : 1;
    }
  });

  const isEmpty = !sortedData.length && !loading;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Trivia Games List</Typography>

        {/* Search Section */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search by Date"
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
          <IconButton onClick={() => setSearchDate('')} color="primary" disabled={!searchDate}>
            {/* <SearchIcon /> */}
          </IconButton>
        </Stack>
      </Stack>

      {/* Table Section */}
      <Card elevation={3}>
        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'trivia_id'}
                    direction={orderBy === 'trivia_id' ? order : 'desc'}
                    onClick={() => handleRequestSort('trivia_id')}
                  >
                    Trivia ID
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'execution_date'}
                    direction={orderBy === 'execution_date' ? order : 'asc'}
                    onClick={() => handleRequestSort('execution_date')}
                  >
                    Execution Date
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'total_questions_count'}
                    direction={orderBy === 'total_questions_count' ? order : 'asc'}
                    onClick={() => handleRequestSort('total_questions_count')}
                  >
                    Total Questions
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'total_participants_pushed_count'}
                    direction={orderBy === 'total_participants_pushed_count' ? order : 'asc'}
                    onClick={() => handleRequestSort('total_participants_pushed_count')}
                  >
                    Participants Pushed
                  </TableSortLabel>
                </StyledTableCell>
                {/* <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'participants_completed'}
                    direction={orderBy === 'participants_completed' ? order : 'asc'}
                    onClick={() => handleRequestSort('participants_completed')}
                  >
                    Participants Completed
                  </TableSortLabel>
                </StyledTableCell> */}
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_at')}
                  >
                    Created At
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'updated_at'}
                    direction={orderBy === 'updated_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('updated_at')}
                  >
                    Updated At
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell> {/* Add Actions column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((trivia) => (
                    <StyledTableRow
                      key={trivia.trivia_id}
                      onDoubleClick={() => handleRowClick(trivia.trivia_id)}
                    >
                      <TableCell>{trivia.trivia_id}</TableCell>
                      <TableCell>{formatDate(trivia.execution_date)}</TableCell>{' '}
                      {/* Format the execution date */}
                      <TableCell>{trivia.total_questions_count}</TableCell>
                      <TableCell>{trivia.total_participants_pushed_count}</TableCell>
                      {/* <TableCell>{trivia.participants_completed}</TableCell> */}
                      <TableCell>
                        <Label
                          variant="soft"
                          color={
                            trivia.status === 'STOPPED'
                              ? 'error'
                              : trivia.status === 'in_progress'
                              ? 'warning'
                              : trivia.status === 'scheduled'
                              ? 'info'
                              : 'success'
                          }
                        >
                          {trivia.status.toUpperCase()}
                        </Label>
                      </TableCell>
                      <TableCell>{formatDate(trivia.created_at)}</TableCell>{' '}
                      {/* Format Created At */}
                      <TableCell>{formatDate(trivia.updated_at)}</TableCell>{' '}
                      {/* Format Updated At */}
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when the button is clicked
                            handleRowClick(trivia.trivia_id);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </StyledTableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 50]}
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
