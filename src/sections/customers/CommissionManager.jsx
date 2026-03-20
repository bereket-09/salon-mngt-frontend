import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  IconButton,
  Button,
  Stack,
  Avatar,
  Divider,
  alpha,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import dayjs from 'dayjs';

export default function CommissionManager() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: dayjs().startOf('month').format('YYYY-MM-DD'),
    to: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchCommissions();
  }, [dateRange]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const url = `${config.BASE_URL}/users/commissions/summary?from=${dateRange.from}&to=${dateRange.to}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSummaries(Array.isArray(data.summary) ? data.summary : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async (userId) => {
    try {
      const res = await fetch(`${config.BASE_URL}/commissions/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchCommissions();
    } catch (err) {
      console.error(err);
    }
  };

  const navigateToDetail = (userId) => {
    // Pass the selected dates to the detail page via navigation state
    navigate(`/commissions/${userId}`, {
      state: { from: dateRange.from, to: dateRange.to }
    });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={6}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box sx={{
            p: 1.5, bgcolor: '#C8972A', borderRadius: 2, color: 'white',
            display: 'flex', boxShadow: theme.customShadows.z12,
            border: '1px solid', borderColor: alpha('#C8972A', 0.2)
          }}>
            <Iconify icon="solar:wallet-money-bold-duotone" width={32} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Staff Earnings</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={800}>Monitor your staff performance and commissions.</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 1, bgcolor: alpha(theme.palette.background.neutral, 0.8), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
          <TextField
            type="date" size="small"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Typography variant="caption" fontWeight={900}>FROM:</Typography></InputAdornment>,
              sx: { borderRadius: 1.2, fontWeight: 800, bgcolor: 'background.paper' }
            }}
          />
          <TextField
            type="date" size="small"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Typography variant="caption" fontWeight={900}>TO:</Typography></InputAdornment>,
              sx: { borderRadius: 1.2, fontWeight: 800, bgcolor: 'background.paper' }
            }}
          />
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ py: 20, textAlign: 'center' }}><CircularProgress color="secondary" size={60} /></Box>
      ) : (
        <Grid container spacing={3.5}>
          {summaries.map((s) => (
            <Grid item xs={12} md={6} lg={4} key={s.userId}>
              <Card sx={{
                p: 0, borderRadius: 3.5, overflow: 'hidden', height: '100%',
                border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                boxShadow: theme.customShadows.z12,
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: theme.customShadows.z24, borderColor: 'secondary.main' }
              }}>
                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.03), borderBottom: '1px dashed', borderColor: alpha(theme.palette.divider, 0.2) }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar sx={{
                      width: 56, height: 56, bgcolor: '#1B1F3A', color: '#C8972A',
                      fontWeight: 900, fontSize: '1.4rem', boxShadow: theme.customShadows.card
                    }}>{s.userName?.[0] || '?'}</Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={900}>{(s.userName || 'Unknown').toUpperCase()}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={900}>
                        Commission Rate: {s.commissionRate}
                      </Typography>
                    </Box>
                    <Tooltip title="View Earnings Detail">
                      <IconButton
                        onClick={() => navigateToDetail(s.userId)}
                        sx={{ bgcolor: 'background.paper', boxShadow: theme.customShadows.z4, '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
                      >
                        <Iconify icon="solar:alt-arrow-right-bold-duotone" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Box sx={{ p: 3.5 }}>
                  <Stack spacing={3}>
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.5), borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 1.5 }}>COMMISSION EARNED</Typography>
                          <Typography variant="h3" fontWeight={900} color="#C8972A" sx={{ mt: 0.5 }}>
                            {s.commissionAmount} <Typography variant="caption" fontWeight={900} sx={{ color: 'text.secondary' }}>ETB</Typography>
                          </Typography>
                        </Box>
                        <Iconify icon="solar:round-transfer-horizontal-bold-duotone" width={40} sx={{ color: 'secondary.main', opacity: 0.5 }} />
                      </Stack>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="overline" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 1 }}>REVENUE</Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5 }}>{s.totalRevenue} <Typography variant="caption" fontWeight={700}>ETB</Typography></Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="overline" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 1 }}>TASKS</Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5 }}>{s.totalAssignments} <Typography variant="caption" fontWeight={700}>DONE</Typography></Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ p: 2.5, bgcolor: '#1B1F3A' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => navigateToDetail(s.userId)}
                    startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                    sx={{
                      height: 52, fontWeight: 900, borderRadius: 2, fontSize: '0.9rem',
                      boxShadow: theme.customShadows.z8,
                      '&:hover': { bgcolor: '#C8972A' }
                    }}
                  >
                    VIEW DETAILS
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
          {summaries.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ py: 20, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.02), borderRadius: 4, border: '2px dashed', borderColor: alpha(theme.palette.secondary.main, 0.1) }}>
                <Iconify icon="solar:bank-note-bold-duotone" width={80} sx={{ color: 'text.disabled', opacity: 0.2, mb: 2 }} />
                <Typography variant="h4" color="text.disabled" fontWeight={900}>No Earnings Yet</Typography>
                <Typography variant="body1" color="text.disabled" fontWeight={700}>We couldn't find any commissions for this date range.</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
