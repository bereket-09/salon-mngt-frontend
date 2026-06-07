import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  alpha,
  useTheme,
  Drawer,
  IconButton,
} from '@mui/material';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import { withBranch, isAggregated, getSelectedBranchName } from 'src/utils/branch';

import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerDetails from './CustomerDetails';
import ActiveSessionsBoard from './ActiveSessionsBoard';

const DRAWER_WIDTH = 460;

// Uppercase tracked micro-label
const microLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  lineHeight: 1.5,
};

export default function CustomersPage() {
  const theme = useTheme();
  const hairline = alpha(theme.palette.divider, 0.18);
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
      const auth = { headers: { Authorization: `Bearer ${token}` } };

      const [custRes, branchRes, empRes, serviceRes] = await Promise.all([
        fetch(`${config.BASE_URL}/customers?status=active${withBranch('&')}`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/branches`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/users?role=employee&status=active${withBranch('&')}`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/services?status=active${withBranch('&')}`, { ...auth, cache: 'no-store' }),
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

  // Tidy segmented view toggle (board / list)
  const renderViewToggle = () => {
    const tabs = [
      { key: 'board', label: 'Active Board', icon: 'solar:widget-5-linear' },
      { key: 'list', label: 'Customer List', icon: 'solar:users-group-rounded-linear' },
    ];
    return (
      <Box
        sx={{
          display: 'flex',
          border: '1px solid',
          borderColor: hairline,
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {tabs.map((tab, i) => {
          const active = viewState === tab.key;
          return (
            <Button
              key={tab.key}
              disableElevation
              onClick={() => setViewState(tab.key)}
              startIcon={<Iconify icon={tab.icon} width={18} />}
              sx={{
                flex: { xs: 1, sm: 'none' },
                minHeight: 44,
                px: { xs: 1.5, sm: 2.5 },
                borderRadius: 0,
                borderLeft: i === 0 ? 'none' : '1px solid',
                borderColor: hairline,
                bgcolor: active ? 'primary.main' : 'transparent',
                color: active ? 'primary.contrastText' : 'text.secondary',
                ...microLabel,
                '&:hover': { bgcolor: active ? 'primary.dark' : alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 6 }, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box mb={{ xs: 4, md: 6 }}>
        <Typography sx={{ ...microLabel, color: 'secondary.main', mb: 1 }}>
          Reception
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 1 }}>
              Active Customers
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                Live sessions and the people in your salon today.
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: hairline,
                  color: isAggregated() ? 'text.primary' : 'secondary.main',
                }}
              >
                <Iconify
                  icon={isAggregated() ? 'solar:global-linear' : 'solar:map-point-linear'}
                  width={14}
                />
                <Typography sx={{ ...microLabel, fontSize: 10 }}>
                  {isAggregated() ? 'All Branches' : (getSelectedBranchName() || 'Current Branch')}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems="center"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            {renderViewToggle()}
            {!currentCustomer && (
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                onClick={() => setDrawerOpen(true)}
                startIcon={<Iconify icon="solar:add-circle-linear" width={18} />}
                sx={{
                  minHeight: 44,
                  px: 3,
                  borderRadius: 1.5,
                  width: { xs: '100%', sm: 'auto' },
                  ...microLabel,
                }}
              >
                Search / Add
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Main View Area */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {currentCustomer ? (
            <Box>
              <Button
                startIcon={<Iconify icon="solar:alt-arrow-left-linear" width={18} />}
                onClick={() => setCurrentCustomer(null)}
                sx={{ mb: 4, color: 'secondary.main', ...microLabel }}
              >
                Back to Customers
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
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ pb: 2, mb: 4, borderBottom: '1px solid', borderColor: hairline }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ color: 'text.primary' }}>
                        Customer List
                      </Typography>
                      <Typography sx={{ ...microLabel, color: 'text.secondary', mt: 0.5 }}>
                        All Customers
                      </Typography>
                    </Box>
                    <Iconify icon="solar:users-group-rounded-linear" width={28} sx={{ color: alpha(theme.palette.secondary.main, 0.4) }} />
                  </Stack>
                  <CustomerList
                    customers={filteredCustomers}
                    setCurrentCustomer={setCurrentCustomer}
                    token={token}
                    columns={{ xs: 12, sm: 6, lg: 4 }}
                  />
                </Box>
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
            bgcolor: 'background.default',
            p: { xs: 2.5, md: 3.5 },
            borderLeft: '1px solid',
            borderColor: hairline,
          },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={4}>
          <Box>
            <Typography sx={{ ...microLabel, color: 'secondary.main', mb: 0.5 }}>
              Reception
            </Typography>
            <Typography variant="h4" sx={{ color: 'text.primary' }}>
              Search &amp; Add
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              width: 44,
              height: 44,
              border: '1px solid',
              borderColor: hairline,
              borderRadius: 1.5,
              color: 'text.primary',
            }}
          >
            <Iconify icon="solar:close-circle-linear" width={20} />
          </IconButton>
        </Stack>

        <Stack spacing={3}>
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: hairline,
              bgcolor: 'background.paper',
            }}
          >
            <Typography sx={{ ...microLabel, color: 'text.secondary', mb: 2 }}>
              Find Customers
            </Typography>
            <TextField
              fullWidth
              autoFocus
              placeholder="Search by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-linear" width={20} sx={{ mr: 1.5, color: 'secondary.main' }} />,
                sx: { borderRadius: 1.5 },
              }}
            />

            {search && (
              <Box sx={{ mt: 3, maxHeight: 400, overflowY: 'auto', pr: 0.5 }}>
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
              <Box
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  py: 5,
                  border: '1px dashed',
                  borderColor: hairline,
                  borderRadius: 1.5,
                }}
              >
                <Iconify icon="solar:magnifer-linear" width={36} sx={{ color: alpha(theme.palette.secondary.main, 0.35), mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontFamily: "'Fraunces', serif", color: 'text.primary', mb: 0.5 }}>
                  Find a customer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type a name or phone number to begin.
                </Typography>
              </Box>
            )}
          </Box>

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
