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
  TextField,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import config from 'src/config'; // Import the config file
import * as XLSX from 'xlsx';



export default function WinnerTimes() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [winnerData, setWinnerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('winner_id');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchWinnerData = async () => {
      const url = `${config.BASE_URL}/api/trivia/list/winners/all`;
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 1000) {
          setWinnerData(result.data);
          setFilteredData(result.data); // Set filtered data initially
        } else {
          console.error('Error fetching winner data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching winner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinnerData();
  }, []);


  // Styled components for table
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

const handleExport = () => {
  if (!filteredData || filteredData.length === 0) {
    console.error('No data available to export');
    return;
  }

  const formattedData = filteredData.map((row) => ({
    'Winner ID': row.winner_id,
    'Trivia Execution Date': formatDate(row.trivia_execution_date),
    'Trivia ID': row.trivia_id,
    'Average Completion Time': row.average_completion_time,
    MSISDN: row.msisdn,
    Score: `${row.score} / ${row.totalQuestion}`,
    Language: row.language === '1' ? 'English' : 'Amharic',
    'Activation Status': row.activation_status === 'A' ? 'ACTIVE' : 'INACTIVE',
    'Start Time': new Date(row.start_time).toLocaleString(),
    'End Time': new Date(row.end_time).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Winners');

  const fileName = `Trivia_Winners_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};



  useEffect(() => {
    // Filter the winner data based on the selected date range
    if (startDate && endDate) {
      const filtered = winnerData.filter((winner) => {
        const winnerDate = new Date(winner.trivia_execution_date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if winner's date is within the range
        return winnerDate >= start && winnerDate <= end;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(winnerData); // Reset to full data if no date range is selected
    }
  }, [startDate, endDate, winnerData]);

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

  const handleClearFilter = () => {
    setStartDate(''); // Clear the start date
    setEndDate(''); // Clear the end date
  };

  const formatDate = (date) => {
    const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options).toUpperCase();
  };

  const calculateAvgCompletionTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMilliseconds = end - start; // Difference in milliseconds
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000); // Convert milliseconds to minutes
    return diffInMinutes ? `${diffInMinutes} mins` : 'N/A';
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

  //button i used is

  

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Winner Times List</Typography>

        {/* Date Range Filter Section */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
          
          <Button variant="outlined" color="secondary" onClick={handleClearFilter}>
            Clear
          </Button>
          <Button variant="contained" color="primary" onClick={handleExport} disabled={!filteredData.length}>
            Export to Excel
          </Button>
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
                    active={orderBy === 'winner_id'}
                    direction={orderBy === 'winner_id' ? order : 'desc'}
                    onClick={() => handleRequestSort('winner_id')}
                  >
                    Winner ID
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'trivia_execution_date'}
                    direction={orderBy === 'trivia_execution_date' ? order : 'asc'}
                    onClick={() => handleRequestSort('trivia_execution_date')}
                  >
                    Trivia Execution Date
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'trivia_id'}
                    direction={orderBy === 'trivia_id' ? order : 'asc'}
                    onClick={() => handleRequestSort('trivia_id')}
                  >
                    Trivia ID
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'average_completion_time'}
                    direction={orderBy === 'average_completion_time' ? order : 'asc'}
                    onClick={() => handleRequestSort('average_completion_time')}
                  >
                    Average Completion Time
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'msisdn'}
                    direction={orderBy === 'msisdn' ? order : 'asc'}
                    onClick={() => handleRequestSort('msisdn')}
                  >
                    MSISDN
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'score'}
                    direction={orderBy === 'score' ? order : 'asc'}
                    onClick={() => handleRequestSort('score')}
                  >
                    Score
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'language'}
                    direction={orderBy === 'language' ? order : 'asc'}
                    onClick={() => handleRequestSort('language')}
                  >
                    Language
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'activation_status'}
                    direction={orderBy === 'activation_status' ? order : 'asc'}
                    onClick={() => handleRequestSort('activation_status')}
                  >
                    Activation Status
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'start_time'}
                    direction={orderBy === 'start_time' ? order : 'asc'}
                    onClick={() => handleRequestSort('start_time')}
                  >
                    Start Time
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'end_time'}
                    direction={orderBy === 'end_time' ? order : 'asc'}
                    onClick={() => handleRequestSort('end_time')}
                  >
                    End Time
                  </TableSortLabel>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((winner) => (
                    <StyledTableRow key={winner.winner_id}>
                      <TableCell>{winner.winner_id}</TableCell>
                      <TableCell>{formatDate(winner.trivia_execution_date)}</TableCell>
                      <TableCell>{winner.trivia_id}</TableCell>
                      <TableCell>
                        {/* {calculateAvgCompletionTime(winner.start_time, winner.end_time)} */}

                        {winner.average_completion_time}
                      </TableCell>
                      <TableCell>{winner.msisdn}</TableCell>
                      <TableCell>
                        {winner.score} / {winner.totalQuestion}{' '}
                      </TableCell>
                      <TableCell>{winner.language === '1' ? 'English' : 'Amharic'}</TableCell>
                      <TableCell>
                        {winner.activation_status === 'A' ? 'ACTIVE' : 'INACTIVE'}
                      </TableCell>
                      <TableCell>{new Date(winner.start_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(winner.end_time).toLocaleString()}</TableCell>
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
