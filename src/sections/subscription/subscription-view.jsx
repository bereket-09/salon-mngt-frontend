import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Container,
  Typography,
  MenuItem,
  Select,
  TableSortLabel,
  CircularProgress
} from '@mui/material';
import Label from 'src/components/label';
import TableNoData from '../user/table-no-data';
import TableEmptyRows from '../user/table-empty-rows';

export default function SubscriptionView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filterMsisdn, setFilterMsisdn] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('subscriber_id');
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchCustomers = async () => {
      const url = 'http://localhost:4000/api/customers';
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 1000) {
          setCustomers(result.data);
        } else {
          console.error('Error fetching customers:', result.message);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
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

  const handleFilterByMsisdn = (event) => {
    setFilterMsisdn(event.target.value);
  };

  const handleFilterByStatus = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredData = customers.filter((row) => {
    const matchesMsisdn = row.msisdn.includes(filterMsisdn);
    const matchesStatus = !filterStatus || row.status === filterStatus;
    return matchesMsisdn && matchesStatus;
  });

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

  const handleRowClick = (id) => {
    navigate(`/customerDetail/${id}`); // Navigate to the detail page
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Manage Subscriptions</Typography>
      </Stack>

      {/* Filter Section */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={filterMsisdn}
            onChange={handleFilterByMsisdn}
            placeholder="Search by MSISDN..."
          />
          <Select
            value={filterStatus}
            onChange={handleFilterByStatus}
            displayEmpty
            size="small"
            inputProps={{ 'aria-label': 'Filter by Status' }}
            fullWidth
            sx={{ minWidth: 60 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="A">Active</MenuItem>
            <MenuItem value="D">Inactive</MenuItem>
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
                    active={orderBy === 'subscriber_id'}
                    direction={orderBy === 'subscriber_id' ? order : 'asc'}
                    onClick={() => handleRequestSort('subscriber_id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'msisdn'}
                    direction={orderBy === 'msisdn' ? order : 'asc'}
                    onClick={() => handleRequestSort('msisdn')}
                  >
                    MSISDN
                  </TableSortLabel>
                </TableCell>
                <TableCell>Language</TableCell>
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
                    active={orderBy === 'shortcode'}
                    direction={orderBy === 'shortcode' ? order : 'asc'}
                    onClick={() => handleRequestSort('shortcode')}
                  >
                    Shortcode
                  </TableSortLabel>
                </TableCell>
                <TableCell>Offer Code</TableCell>
                <TableCell>Subscriber Lifecycle</TableCell>
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
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No data available</TableCell>
                </TableRow>
              ) : (
                sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
                  <TableRow
                    key={customer.subscriber_id}
                    hover
                    onClick={() => handleRowClick(customer.subscriber_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{customer.subscriber_id}</TableCell>
                    <TableCell>{customer.msisdn}</TableCell>
                    <TableCell>{customer.language}</TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={(customer.status === 'D' && 'error') || 'success'}
                      >
                        {customer.status === 'A' ? 'Active' : 'Inactive'}
                      </Label>
                    </TableCell>
                    <TableCell>{customer.shortcode}</TableCell>
                    <TableCell>{customer.offercode}</TableCell>
                    <TableCell>{customer.subscriber_lifecycle}</TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(customer.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 15, 25]}
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
