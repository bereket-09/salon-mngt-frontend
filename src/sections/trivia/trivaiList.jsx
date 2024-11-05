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
} from '@mui/material';
import Label from 'src/components/label';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import config from 'src/config'; // Import the config file

export default function TriviaList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [triviaData, setTriviaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('trivia_id');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchTrivia = async () => {
      const url = '${config.BASE_URL}/api/trivia';
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 1000) {
          setTriviaData(result.data);
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
    navigate(`/triviaDetail/${triviaId}`); // Navigate to the trivia detail page
  };

  const sortedData = triviaData.sort((a, b) => {
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
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Trivia List</Typography>
      </Stack>

      {/* Table Section */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'trivia_id'}
                    direction={orderBy === 'trivia_id' ? order : 'asc'}
                    onClick={() => handleRequestSort('trivia_id')}
                  >
                    Trivia ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'execution_date'}
                    direction={orderBy === 'execution_date' ? order : 'asc'}
                    onClick={() => handleRequestSort('execution_date')}
                  >
                    Execution Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'total_questions_count'}
                    direction={orderBy === 'total_questions_count' ? order : 'asc'}
                    onClick={() => handleRequestSort('total_questions_count')}
                  >
                    Total Questions Count
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'total_participants_pushed_count'}
                    direction={orderBy === 'total_participants_pushed_count' ? order : 'asc'}
                    onClick={() => handleRequestSort('total_participants_pushed_count')}
                  >
                    Total Participants Pushed
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
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_at')}
                  >
                    Created At
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'updated_at'}
                    direction={orderBy === 'updated_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('updated_at')}
                  >
                    Updated At
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((trivia) => (
                    <TableRow
                      key={trivia.trivia_id}
                      hover
                      onClick={() => handleRowClick(trivia.trivia_id)} // Make row clickable
                      style={{ cursor: 'pointer' }} // Add cursor pointer to indicate clickability
                    >
                      <TableCell>{trivia.trivia_id}</TableCell>
                      <TableCell>{new Date(trivia.execution_date).toLocaleString()}</TableCell>
                      <TableCell>{trivia.total_questions_count}</TableCell>
                      <TableCell>{trivia.total_participants_pushed_count}</TableCell>
                      <TableCell>
                        <Label
                          variant="soft"
                          color={
                            (trivia.status === 'STOPPED' && 'error') ||
                            (trivia.status === 'in_progress' && 'warning') ||
                            (trivia.status === 'scheduled' && 'info') ||
                            'success'
                          }
                        >
                          {trivia.status.toUpperCase()}
                        </Label>
                      </TableCell>
                      <TableCell>{new Date(trivia.created_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(trivia.updated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 50]}
          component="div"
          count={triviaData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
