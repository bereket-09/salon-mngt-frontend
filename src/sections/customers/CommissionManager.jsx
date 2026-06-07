import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Button,
  Stack,
  Avatar,
  Divider,
  alpha,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import dayjs from 'dayjs';

const GOLD = '#9A7B4F';
const INK = '#1A1A1A';

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

  // Derived totals — computed from already-fetched data, no new requests.
  const totalPayable = summaries.reduce((sum, s) => sum + (Number(s.commissionAmount) || 0), 0);
  const totalRevenue = summaries.reduce((sum, s) => sum + (Number(s.totalRevenue) || 0), 0);
  const staffCount = summaries.length;

  const fmt = (n) => (Number(n) || 0).toLocaleString();

  const labelSx = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1,
    color: 'text.disabled',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1.4,
  };

  const moneySx = { fontVariantNumeric: 'tabular-nums' };

  const dateFieldSx = {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontWeight: 700,
      bgcolor: 'background.paper',
      ...moneySx,
    },
  };

  return (
    <Box>
      {/* ---------- Page header ---------- */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        justifyContent="space-between"
        spacing={3}
        mb={5}
      >
        <Box>
          <Typography
            sx={{
              ...labelSx,
              color: GOLD,
              fontWeight: 800,
              letterSpacing: 1.5,
              mb: 1,
            }}
          >
            Payroll
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: INK, lineHeight: 1.05 }}
          >
            Staff Commissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
            Monitor staff performance and what each member has earned this period.
          </Typography>
        </Box>

        {/* Date-range filter — tidy card, full-width on mobile */}
        <Card
          sx={{
            p: 2,
            width: { xs: '100%', md: 'auto' },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: theme.customShadows.z8,
          }}
        >
          <Typography sx={{ ...labelSx, mb: 1.25 }}>Date Range</Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ minWidth: { sm: 360 } }}
          >
            <TextField
              type="date"
              size="small"
              label="From"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={dateFieldSx}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={dateFieldSx}
            />
          </Stack>
        </Card>
      </Stack>

      {/* ---------- Summary strip ---------- */}
      {!loading && staffCount > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: alpha(GOLD, 0.25),
                bgcolor: alpha(GOLD, 0.04),
                boxShadow: theme.customShadows.z8,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: GOLD,
                    color: 'white',
                    display: 'flex',
                  }}
                >
                  <Iconify icon="solar:wallet-money-linear" width={26} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Total Payable</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: GOLD, ...moneySx, lineHeight: 1.1 }}>
                    {fmt(totalPayable)}{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                      Br
                    </Typography>
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Card
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: theme.customShadows.z8,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha(INK, 0.06),
                    color: INK,
                    display: 'flex',
                  }}
                >
                  <Iconify icon="solar:chart-2-linear" width={26} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Total Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: INK, ...moneySx, lineHeight: 1.1 }}>
                    {fmt(totalRevenue)}{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                      Br
                    </Typography>
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Card
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: theme.customShadows.z8,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha(INK, 0.06),
                    color: INK,
                    display: 'flex',
                  }}
                >
                  <Iconify icon="solar:users-group-rounded-linear" width={26} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Staff</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: INK, ...moneySx, lineHeight: 1.1 }}>
                    {staffCount}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ---------- Body ---------- */}
      {loading ? (
        <Box sx={{ py: 20, textAlign: 'center' }}>
          <CircularProgress sx={{ color: GOLD }} size={56} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {summaries.map((s) => (
            <Grid item xs={12} sm={6} lg={4} key={s.userId}>
              <Card
                sx={{
                  p: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.08),
                  boxShadow: theme.customShadows.z8,
                  transition: 'transform .2s, box-shadow .2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.customShadows.z12,
                  },
                }}
              >
                {/* Staff identity header */}
                <Box sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: INK,
                        color: GOLD,
                        fontWeight: 900,
                        fontSize: '1.3rem',
                      }}
                    >
                      {s.userName?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: INK }}
                      >
                        {s.userName || 'Unknown'}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Rate ${s.commissionRate}`}
                        sx={{
                          mt: 0.5,
                          height: 22,
                          fontWeight: 800,
                          fontSize: 11,
                          color: GOLD,
                          bgcolor: alpha(GOLD, 0.1),
                          border: '1px solid',
                          borderColor: alpha(GOLD, 0.2),
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                {/* Hero commission figure */}
                <Box
                  sx={{
                    mx: 2.5,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha(GOLD, 0.05),
                    border: '1px solid',
                    borderColor: alpha(GOLD, 0.15),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={labelSx}>Commission Earned</Typography>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 900, color: GOLD, ...moneySx, lineHeight: 1.1, mt: 0.5 }}
                      >
                        {fmt(s.commissionAmount)}{' '}
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                          Br
                        </Typography>
                      </Typography>
                    </Box>
                    <Iconify
                      icon="solar:round-transfer-horizontal-linear"
                      width={36}
                      sx={{ color: GOLD, opacity: 0.45, flexShrink: 0 }}
                    />
                  </Stack>
                </Box>

                {/* Secondary stats — 2-col mini grid */}
                <Grid container sx={{ mt: 2, px: 2.5 }}>
                  <Grid item xs={6} sx={{ pr: 1.25 }}>
                    <Box
                      sx={{
                        p: 1.75,
                        height: '100%',
                        borderRadius: 1.75,
                        bgcolor: alpha(theme.palette.divider, 0.04),
                      }}
                    >
                      <Typography sx={labelSx}>Revenue</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: INK, ...moneySx, mt: 0.25 }}>
                        {fmt(s.totalRevenue)}{' '}
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          Br
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sx={{ pl: 1.25 }}>
                    <Box
                      sx={{
                        p: 1.75,
                        height: '100%',
                        borderRadius: 1.75,
                        bgcolor: alpha(theme.palette.divider, 0.04),
                      }}
                    >
                      <Typography sx={labelSx}>Tasks</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: INK, ...moneySx, mt: 0.25 }}>
                        {fmt(s.totalAssignments)}{' '}
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          done
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Spacer pushes action to the bottom so buttons align across cards */}
                <Box sx={{ flexGrow: 1 }} />

                <Divider sx={{ mt: 2.5, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.12) }} />

                <Box sx={{ p: 2.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigateToDetail(s.userId)}
                    startIcon={<Iconify icon="solar:eye-linear" />}
                    sx={{
                      height: 48,
                      fontWeight: 800,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      letterSpacing: '0.02em',
                      bgcolor: INK,
                      boxShadow: theme.customShadows.z8,
                      '&:hover': { bgcolor: GOLD },
                      '&:active': { transform: 'scale(0.98)' },
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}

          {summaries.length === 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  py: { xs: 10, md: 16 },
                  px: 3,
                  textAlign: 'center',
                  borderRadius: 2.5,
                  bgcolor: alpha(GOLD, 0.02),
                  border: '1px dashed',
                  borderColor: alpha(GOLD, 0.2),
                }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    mx: 'auto',
                    mb: 2.5,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(GOLD, 0.08),
                  }}
                >
                  <Iconify icon="solar:bank-note-linear" width={44} sx={{ color: GOLD, opacity: 0.7 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: INK }}>
                  No earnings yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                  We couldn&apos;t find any commissions for this date range. Try adjusting the dates above.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
