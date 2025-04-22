import React, { useState, useEffect } from 'react';
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
  Container,
  Typography,
  Button,
  TableSortLabel,
} from '@mui/material';
// import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import config from 'src/config';
import { useParams, useNavigate } from 'react-router-dom';

export default function TriviaLosersList() {
  const navigate = useNavigate();
  const { trivia_id } = useParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [losersData, setLosersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('asc'); // sorting order
  const [orderBy, setOrderBy] = useState('msisdn'); // column to be sorted by

  useEffect(() => {
    const fetchLosers = async () => {
      const token = localStorage.getItem('authToken');

      const headers = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const url = `${config.BASE_URL}/api/trivia/losers/${trivia_id}`;
      try {
        const response = await fetch(url, headers);
        const result = await response.json();
        if (result.code === 1000) {
          setLosersData(result.data);
          setTotalUsers(result.totalCount);
        } else {
          console.error('Error fetching losers data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching losers data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLosers();
  }, [trivia_id]);

  const handleExport = () => {
    const formattedData = losersData.map((row) => ({
      MSISDN: row.msisdn,
      Score: row.score,
      Status: row.status,
      'Completion Time': row.average_completion_time
        ? `${Math.floor(row.average_completion_time / 60_000_000)} min and ${Math.floor(
            (row.average_completion_time % 60_000_000) / 1_000_000
          )} sec`
        : 'N/A',
      'Message Queue Status': row.messageQueueStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Losers');
    XLSX.writeFile(workbook, `Trivia_Losers_${trivia_id}.xlsx`);
  };

  const handleRequestSort = (event, property) => {
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

  const isEmpty = !losersData.length && !loading;

  // Sorting logic
  const sortedLosersData = losersData.sort((a, b) => {
    if (orderBy === 'msisdn') {
      return order === 'asc' ? a.msisdn.localeCompare(b.msisdn) : b.msisdn.localeCompare(a.msisdn);
    }
    if (orderBy === 'score') {
      return order === 'asc' ? a.score - b.score : b.score - a.score;
    }
    if (orderBy === 'average_completion_time') {
      return order === 'asc'
        ? (a.average_completion_time || 0) - (b.average_completion_time || 0)
        : (b.average_completion_time || 0) - (a.average_completion_time || 0);
    }
    return 0;
  });

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Button onClick={() => navigate(-1)} color="primary" variant="outlined">
          Back
        </Button>

        <Typography variant="h4">Trivia Losers List</Typography>
        <Button variant="contained" onClick={handleExport} disabled={!losersData.length}>
          Export to Excel
        </Button>
      </Stack>
      <Typography variant="subtitle1">Total Users: {totalUsers}</Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'msisdn'}
                    direction={orderBy === 'msisdn' ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, 'msisdn')}
                  >
                    MSISDN
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'score'}
                    direction={orderBy === 'score' ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, 'score')}
                  >
                    Score
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'average_completion_time'}
                    direction={orderBy === 'average_completion_time' ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, 'average_completion_time')}
                  >
                    Completion Time
                  </TableSortLabel>
                </TableCell>
                <TableCell>Message Queue Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedLosersData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((loser) => (
                    <TableRow key={loser.id}>
                      <TableCell>{loser.msisdn}</TableCell>
                      <TableCell>{loser.score}</TableCell>
                      <TableCell>{loser.status}</TableCell>
                      <TableCell>
                        {loser.average_completion_time
                          ? `${Math.floor(
                              loser.average_completion_time / 60_000_000
                            )} min and ${Math.floor(
                              (loser.average_completion_time % 60_000_000) / 1_000_000
                            )} sec`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{loser.messageQueueStatus}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 50, 100, 200]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
