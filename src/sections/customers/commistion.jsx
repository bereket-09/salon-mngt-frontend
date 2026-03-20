import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Card,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Collapse,
  Chip,
  Avatar,
  Divider,
  TextField,
  Box,
  Grid,
  alpha,
  useTheme,
  InputAdornment,
  LinearProgress,
  IconButton,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import config from 'src/config';
import dayjs from 'dayjs';

export default function CommissionReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();

  // Initialize dates from location state if available, else fallback to current month
  const [dateRange, setDateRange] = useState({
    from: location.state?.from || dayjs().startOf('month').format('YYYY-MM-DD'),
    to: location.state?.to || dayjs().format('YYYY-MM-DD'),
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});

  const fetchReport = async () => {
    if (!userId) return setError('No user ID found');
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    try {
      const query = `from=${dateRange.from}&to=${dateRange.to}`;
      const res = await fetch(`${config.BASE_URL}/users/commission-report/${userId}?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to get report');
        setReport(null);
      } else {
        setReport(data || {});
      }
    } catch (err) {
      console.error(err);
      setError('Connection error');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [userId, dateRange]);

  const toggleSession = (id) => {
    setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading && !report) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="secondary" size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 900, color: 'text.secondary' }}>LOADING REPORT...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={6} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Button
            variant="soft" color="secondary"
            onClick={() => navigate(-1)}
            startIcon={<Iconify icon="solar:alt-arrow-left-bold-duotone" />}
            sx={{ height: 52, fontWeight: 900, borderRadius: 1.5, px: 3 }}
          >
            Back to Payouts
          </Button>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Commission Report</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={800}>History of jobs and commissions earned.</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 1.2, bgcolor: alpha(theme.palette.background.neutral, 0.8), borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
          <TextField
            type="date" size="small"
            value={dateRange.from}
            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Typography variant="caption" fontWeight={900}>START:</Typography></InputAdornment>,
              sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: 'background.paper' }
            }}
          />
          <TextField
            type="date" size="small"
            value={dateRange.to}
            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Typography variant="caption" fontWeight={900}>END:</Typography></InputAdornment>,
              sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: 'background.paper' }
            }}
          />
        </Stack>
      </Stack>

      {report && (
        <Grid container spacing={4}>
          {/* EMPLOYEE INFO */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              p: 4, borderRadius: 3.5, boxShadow: theme.customShadows.z12,
              position: 'sticky', top: 24, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1)
            }}>
              <Stack spacing={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{
                    width: 100, height: 100, mx: 'auto', bgcolor: '#1B1F3A', color: '#C8972A',
                    fontWeight: 900, fontSize: '2.5rem', border: '5px solid', borderColor: alpha('#C8972A', 0.1),
                    boxShadow: theme.customShadows.z12
                  }}>
                    {report.userName?.[0]}
                  </Avatar>
                  <Typography variant="h4" fontWeight={900} sx={{ mt: 3, letterSpacing: -0.5 }}>{report.userName?.toUpperCase()}</Typography>
                  <Chip
                    label={`OFFICIAL ID: #PRO_${report.userId}`}
                    variant="soft" color="secondary"
                    sx={{ mt: 1, fontWeight: 900, borderRadius: 0.5, height: 26 }}
                  />
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box>
                  <Typography variant="overline" color="text.disabled" sx={{ letterSpacing: 2.5, fontWeight: 900, mb: 2, display: 'block' }}>EARNINGS INFO</Typography>
                  <Stack spacing={2.5}>
                    {[
                      { label: 'TOTAL REVENUE', value: `${report.totalRevenue || 0} Br`, icon: 'solar:chart-square-bold-duotone', color: 'info' },
                      { label: 'SESSIONS', value: report.totalSessions || 0, icon: 'solar:users-group-rounded-bold-duotone', color: 'secondary' },
                      { label: 'JOBS DONE', value: report.totalAssignments || 0, icon: 'solar:verified-check-bold-duotone', color: 'success' },
                    ].map((metric, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Iconify icon={metric.icon} sx={{ color: `${metric.color}.main`, width: 18 }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={800}>{metric.label}</Typography>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={900}>{metric.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{
                  p: 3, borderRadius: 2.5, bgcolor: '#1B1F3A',
                  textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                    <Iconify icon="solar:safe-bold-duotone" width={100} />
                  </Box>
                  <Typography variant="overline" color="#C8972A" sx={{ letterSpacing: 3, fontWeight: 900, opacity: 0.8 }}>MY COMMISSION EARNINGS</Typography>
                  <Typography variant="h2" fontWeight={900} color="white" sx={{ mt: 1 }}>{report.commissionAmount || 0} <Typography variant="h5" component="span" fontWeight={900}>ETB</Typography></Typography>
                  <LinearProgress
                    variant="determinate" value={100}
                    sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: alpha('#C8972A', 0.2), '& .MuiLinearProgress-bar': { bgcolor: '#C8972A' } }}
                  />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* JOB HISTORY */}
          <Grid item xs={12} lg={8}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box sx={{ p: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 1.2, color: 'secondary.main', display: 'flex' }}>
                <Iconify icon="solar:bill-list-bold-duotone" width={24} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>Job History</Typography>
            </Stack>

            <Stack spacing={2.5}>
              {report.sessions?.map((session) => (
                <Card key={session.sessionId} sx={{
                  p: 0, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                  boxShadow: theme.customShadows.z8,
                  transition: '0.2s', '&:hover': { borderColor: 'secondary.main' }
                }}>
                  <Box
                    onClick={() => toggleSession(session.sessionId)}
                    sx={{
                      p: 3, cursor: 'pointer', bgcolor: alpha(theme.palette.background.neutral, 0.5),
                      transition: '0.2s', '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
                    }}
                  >
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{
                            width: 44, height: 44, bgcolor: '#1B1F3A', borderRadius: 1.5,
                            color: '#C8972A', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Iconify icon="solar:ticket-bold-duotone" width={24} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={900} sx={{ letterSpacing: -0.5 }}>VISIT #S_{session.sessionId}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={900}>CUSTOMER: {session.customer?.toUpperCase() || 'UNKNOWN'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" justifyContent="flex-end" spacing={4} alignItems="center">
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 1, display: 'block' }}>DATE</Typography>
                            <Typography variant="subtitle2" fontWeight={900} color="secondary.main">
                              {session.checkOut ? dayjs(session.checkOut).format('MMM DD, YYYY').toUpperCase() : 'ACTIVE'}
                            </Typography>
                          </Box>
                          <IconButton sx={{ bgcolor: 'background.paper', boxShadow: theme.customShadows.z2 }}>
                            <Iconify icon={expandedSessions[session.sessionId] ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'} />
                          </IconButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>

                  <Collapse in={expandedSessions[session.sessionId]}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderTop: '1px dashed', borderColor: alpha(theme.palette.divider, 0.2) }}>
                      <Stack spacing={2}>
                        {session.assignments.map((assignment) => (
                          <Box key={assignment.assignmentId} sx={{
                            p: 2.5, borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.neutral, 0.4),
                            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1)
                          }}>
                            <Grid container alignItems="center">
                              <Grid item xs={12} sm={7}>
                                <Typography variant="caption" color="secondary.main" fontWeight={900} sx={{ letterSpacing: 1.5 }}>JOB: #J_{assignment.assignmentId}</Typography>
                                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                                  {assignment.services.map((s) => (
                                    <Chip
                                      key={s.serviceId}
                                      label={s.serviceName.toUpperCase()}
                                      size="small" variant="soft" color="secondary"
                                      sx={{ fontSize: '0.65rem', fontWeight: 900, borderRadius: 0.5, height: 22 }}
                                    />
                                  ))}
                                </Stack>
                              </Grid>
                              <Grid item xs={12} sm={5} sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 1 }}>COMMISSION FROM JOB</Typography>
                                <Typography variant="h5" color="secondary.main" fontWeight={900}>
                                  {assignment.commission} <Typography variant="caption" component="span" fontWeight={900} color="text.secondary">ETB</Typography>
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Collapse>
                </Card>
              ))}
              {(!report.sessions || report.sessions.length === 0) && (
                <Box sx={{ py: 15, textAlign: 'center', border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.2), borderRadius: 4, bgcolor: alpha(theme.palette.secondary.main, 0.01) }}>
                  <Iconify icon="solar:document-text-bold-duotone" width={60} sx={{ color: 'text.disabled', opacity: 0.2, mb: 1.5 }} />
                  <Typography variant="h5" color="text.disabled" fontWeight={900}>No jobs found</Typography>
                  <Typography variant="body2" color="text.disabled" fontWeight={700}>Try selecting a different date range.</Typography>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
