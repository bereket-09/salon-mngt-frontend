import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Card,
  alpha,
  useTheme,
  Drawer,
  IconButton,
  Tooltip,
} from '@mui/material';
import config from 'src/config';
import Iconify from 'src/components/iconify';

import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerDetails from './CustomerDetails';
import ActiveSessionsBoard from './ActiveSessionsBoard';

const DRAWER_WIDTH = 440;

export default function CustomersPage() {
  const theme = useTheme();
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [viewState, setViewState] = useState('board'); // board | list
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Background refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const branchId = localStorage.getItem('selectedBranchId');
      const branchQuery = (branchId && branchId !== 'all') ? `branchId=${branchId}` : '';
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      
      const [custRes, branchRes, empRes, serviceRes] = await Promise.all([
        fetch(`${config.BASE_URL}/customers`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/branches`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/users?role=employee&status=active${branchQuery ? `&${branchQuery}` : ''}`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/services?${branchQuery}`, { ...auth, cache: 'no-store' }),
      ]);

      setCustomers(await custRes.json() || []);
      setBranches(await branchRes.json() || []);
      setEmployees(await empRes.json() || []);
      setServices(await serviceRes.json() || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.status !== 'checked_in' &&
          (c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.phone && String(c.phone).includes(search)))
      ),
    [customers, search]
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3, lg: 5 }, minHeight: '100vh', bgcolor: alpha('#1B1F3A', 0.02) }}>
      {/* Header Info */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" mb={6} spacing={2}>
        <Box sx={{ mb: { xs: 3, sm: 0 } }}>
          <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -2, fontSize: { xs: '1.6rem', md: '2rem', lg: '2.25rem' } }}>
            Manage <Box component="span" sx={{ color: '#C8972A' }}>Customers</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>View and manage your customer list and active sessions.</Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 0.8, bgcolor: 'white', borderRadius: 2, display: 'flex', border: '1px solid', borderColor: alpha('#1B1F3A', 0.05), boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <Button
              variant={viewState === 'board' ? 'contained' : 'text'}
              onClick={() => setViewState('board')}
              startIcon={<Iconify icon="solar:floor-plan-bold-duotone" />}
              sx={{ fontWeight: 900, borderRadius: 1.5, px: 3, height: 44, bgcolor: viewState === 'board' ? '#1B1F3A' : 'transparent', color: viewState === 'board' ? 'white' : 'text.secondary' }}
            >
              ACTIVE BOARD
            </Button>
            <Button
              variant={viewState === 'list' ? 'contained' : 'text'}
              onClick={() => setViewState('list')}
              startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
              sx={{ fontWeight: 900, borderRadius: 1.5, px: 3, height: 44, bgcolor: viewState === 'list' ? '#1B1F3A' : 'transparent', color: viewState === 'list' ? 'white' : 'text.secondary' }}
            >
              CUSTOMER LIST
            </Button>
          </Box>
          {!currentCustomer && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setDrawerOpen(true)}
              startIcon={<Iconify icon="solar:magnifer-zoom-in-bold-duotone" />}
              sx={{ fontWeight: 900, borderRadius: 2, px: 3, height: 48, bgcolor: '#C8972A', '&:hover': { bgcolor: '#B5851F' } }}
            >
              SEARCH / ADD
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Main View Area */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {currentCustomer ? (
            <Box>
              <Button
                startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
                onClick={() => setCurrentCustomer(null)}
                sx={{ mb: 4, fontWeight: 900, color: '#C8972A', fontSize: '1.05rem' }}
              >
                BACK TO CUSTOMERS
              </Button>
              <CustomerDetails
                customer={currentCustomer}
                setCustomer={setCurrentCustomer}
                branches={branches}
                employees={employees}
                services={services}
                token={token}
                refreshCustomers={fetchData}
              />
            </Box>
          ) : (
            <Box>
              {viewState === 'board' ? (
                <ActiveSessionsBoard
                  employees={employees}
                  services={services}
                  token={token}
                  onSelectCustomer={setCurrentCustomer}
                />
              ) : (
                <Card sx={{
                  p: 5, borderRadius: 4, border: '1px solid', borderColor: alpha('#1B1F3A', 0.05),
                  boxShadow: '0 30px 60px rgba(0,0,0,0.03)'
                }}>
                  <Stack direction="row" spacing={2.5} alignItems="center" mb={5}>
                    <Box sx={{ p: 2, bgcolor: '#1B1F3A', borderRadius: 2, color: '#C8972A' }}>
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={32} />
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: -0.5 }}>Customer List</Typography>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={800} letterSpacing={1}>ALL CUSTOMERS</Typography>
                    </Box>
                  </Stack>
                  <CustomerList
                    customers={filteredCustomers}
                    setCurrentCustomer={setCurrentCustomer}
                    token={token}
                    columns={{ xs: 12 }}
                  />
                </Card>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: DRAWER_WIDTH },
            bgcolor: alpha('#1B1F3A', 0.02),
            p: { xs: 2.5, md: 3.5 },
            borderLeft: '1px solid',
            borderColor: alpha('#1B1F3A', 0.05),
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.5 }}>
            Search & Add
          </Typography>
          <Tooltip title="Close">
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ bgcolor: alpha('#1B1F3A', 0.05) }}>
              <Iconify icon="solar:close-circle-bold-duotone" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={3}>
          <Card sx={{
            p: { xs: 2.5, md: 3 }, borderRadius: 2.5,
            border: '1px solid', borderColor: alpha('#1B1F3A', 0.05),
            boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
            bgcolor: 'white'
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#C8972A', 0.1), color: '#C8972A' }}>
                <Iconify icon="solar:magnifer-zoom-in-bold-duotone" width={24} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: -0.5 }}>Search</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>FIND CUSTOMERS</Typography>
              </Box>
            </Stack>
            <TextField
              fullWidth
              autoFocus
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="solar:user-bold-duotone" sx={{ mr: 1.5, color: '#C8972A' }} />,
                sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: alpha('#1B1F3A', 0.02) }
              }}
            />

            {search && (
              <Box sx={{ mt: 3, maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                <CustomerList
                  customers={filteredCustomers}
                  setCurrentCustomer={(c) => {
                    setCurrentCustomer(c);
                    setSearch('');
                    setDrawerOpen(false);
                  }}
                  token={token}
                  columns={{ xs: 12 }}
                />
              </Box>
            )}

            {!search && (
              <Box sx={{ mt: 3, textAlign: 'center', py: 4, border: '2px dashed', borderColor: alpha('#1B1F3A', 0.05), borderRadius: 2 }}>
                <Iconify icon="solar:ghost-bold-duotone" width={48} sx={{ color: alpha('#1B1F3A', 0.1), mb: 1.5 }} />
                <Typography variant="body2" color="text.disabled" fontWeight={800}>SEARCH BY NAME OR PHONE</Typography>
              </Box>
            )}
          </Card>

          <CustomerForm
            branches={branches}
            onCustomerCreated={(c) => {
              setCurrentCustomer(c);
              setViewState('board');
              setDrawerOpen(false);
            }}
            token={token}
            refreshCustomers={fetchData}
          />
        </Stack>
      </Drawer>
    </Box>
  );
}
