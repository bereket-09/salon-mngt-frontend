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
} from '@mui/material';
// import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import config from 'src/config';
import { useParams, useNavigate } from 'react-router-dom';

export default function TriviaWinnersList() {
  const navigate = useNavigate();
  const { trivia_id } = useParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [winnersData, setWinnersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      const url = `${config.BASE_URL}/api/trivia/winners/${trivia_id}`;
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 1000) {
          setWinnersData(result.data);
          setTotalUsers(result.totalCount);
        } else {
          console.error('Error fetching winners data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching winners data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, [trivia_id]);

  const handleExport = () => {
    const formattedData = winnersData.map((row) => ({
      MSISDN: row.msisdn,
      Score: row.score,
      Ranking: row.ranking,
      Status: row.status,
      'Completion Time': `${Math.floor(
        row.average_completion_time / 60_000_000
      )} min and ${Math.floor((row.average_completion_time % 60_000_000) / 1_000_000)} sec`,
      'Message Queue Status': row.messageQueueStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Winners');
    XLSX.writeFile(workbook, `Trivia_Winners_${trivia_id}.xlsx`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isEmpty = !winnersData.length && !loading;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Button onClick={() => navigate(-1)} color="primary" variant="outlined">
          Back
        </Button>

        <Typography variant="h4">Trivia Winners List</Typography>
        <Button variant="contained" onClick={handleExport} disabled={!winnersData.length}>
          Export to Excel
        </Button>
      </Stack>
      <Typography variant="subtitle1">Total Users: {totalUsers}</Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>MSISDN</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Ranking</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Completion Time</TableCell>
                <TableCell>Message Queue Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                winnersData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell>{winner.msisdn}</TableCell>
                      <TableCell>{winner.score}</TableCell>
                      <TableCell>{winner.ranking}</TableCell>
                      <TableCell>{winner.status}</TableCell>
                      <TableCell>
                        {Math.floor(winner.average_completion_time / 60_000_000)} min and{' '}
                        {Math.floor((winner.average_completion_time % 60_000_000) / 1_000_000)} sec
                      </TableCell>
                      <TableCell>{winner.messageQueueStatus}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 50]}
          component="div"
          count={winnersData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
