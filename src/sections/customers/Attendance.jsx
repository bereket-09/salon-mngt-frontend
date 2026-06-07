import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Grid,
  Divider,
  alpha,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import { getSelectedBranchId } from 'src/utils/branch';
import { useResponsive } from 'src/hooks/use-responsive';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

const GOLD = '#C8972A';
const NAVY = '#1B1F3A';

// Shared label styling: small uppercase eyebrow / column label
const labelSx = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '1px',
  color: 'text.disabled',
  textTransform: 'uppercase',
};

const numSx = { fontVariantNumeric: 'tabular-nums' };

export default function Attendance() {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'md');
  const [currentTab, setCurrentTab] = useState('live'); // live | history
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState('in');

  // Filters
  const [filter, setFilter] = useState({
    userId: '',
    branchId: 'all',
    from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdmin = userData?.role === 'admin';

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchAttendance = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (filter.from) params.append('from', filter.from);
      if (filter.to) params.append('to', filter.to);
      if (filter.branchId !== 'all') params.append('branchId', filter.branchId);
      if (filter.userId) params.append('userId', filter.userId);

      const res = await fetch(`${config.BASE_URL}/attendance?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [token, filter]);

  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchAttendance();
    if (!isAdmin && userData?.id) {
      setSelectedUser(userData.id);
    }
  }, [fetchUsers, fetchAttendance, isAdmin, userData?.id]);

  const executeAction = async (action) => {
    setConfirmOpen(false);
    if (!selectedUser) return;

    const endpoint = action || (actionType === 'out' ? 'check-out' : (actionType === 'break' ? 'toggle-break' : 'check-in'));
    try {
      // Auto-detect branch for the user being updated
      const res = await fetch(`${config.BASE_URL}/attendance/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
           userId: selectedUser,
           branchId: getSelectedBranchId() || userData.branches?.[0]?.id || userData.BranchId
        }),
      });

      if (res.ok) fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const userAttendance = useMemo(() => {
     if (!selectedUser) return null;
     return attendance.find(a => a.UserId === selectedUser && a.date === new Date().toISOString().split('T')[0]);
  }, [selectedUser, attendance]);

  const isUserClockedIn = userAttendance && !userAttendance.checkOutTime;
  const isUserOnBreak = userAttendance?.status === 'on_break';

  const activeStaff = useMemo(() => attendance.filter(a => !a.checkOutTime && a.date === new Date().toISOString().split('T')[0]), [attendance]);

  const totalHoursWorked = useMemo(() => {
    return attendance.reduce((sum, current) => sum + parseFloat(current.totalHours || 0), 0).toFixed(1);
  }, [attendance]);

  // Hoisted from inside JSX (was a conditional/in-render hook — rules-of-hooks violation).
  // Computes the gantt timeline segments for the selected shift dialog.
  const ganttSegments = useMemo(() => {
    if (!selectedShift?.events || selectedShift.events.length <= 1) return [];
    const events = [...selectedShift.events].sort((a, b) => new Date(a.time) - new Date(b.time));
    const startTime = new Date(events[0].time).getTime();
    const lastEventTime = new Date(events[events.length - 1].time).getTime();
    const totalDur = lastEventTime - startTime;

    return events
      .map((e, i) => {
        if (i === events.length - 1) return null;
        const next = events[i + 1];
        const segmentDur = new Date(next.time).getTime() - new Date(e.time).getTime();
        const width = totalDur ? (segmentDur / totalDur) * 100 : 0;
        const isBreak = e.type === 'BREAK_START';
        const isUndo = e.type === 'UNDO_END';
        return { key: i, width, segmentDur, type: e.type, isBreak, isUndo };
      })
      .filter(Boolean);
  }, [selectedShift]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* PAGE HEADER */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={3}
        mb={{ xs: 4, md: 5 }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box sx={{
            p: 1.5, bgcolor: NAVY, borderRadius: 2.5, color: GOLD,
            display: 'flex', border: '1px solid', borderColor: alpha(GOLD, 0.2),
            boxShadow: theme.customShadows.z8,
          }}>
            <Iconify icon="solar:user-speak-bold-duotone" width={32} />
          </Box>
          <Box>
            <Typography sx={{ ...labelSx, color: GOLD, mb: 0.25 }}>ATTENDANCE</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05, color: NAVY }}>
              Attendance Hub
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
              Professional hour tracking and payroll management.
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', md: 'auto' } }}
        >
           <Tabs
             value={currentTab}
             onChange={(e, val) => setCurrentTab(val)}
             sx={{
                minHeight: 0,
                bgcolor: alpha(theme.palette.background.neutral, 0.6),
                p: 0.5, borderRadius: 2,
                border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08),
                '& .MuiTabs-indicator': {
                  height: '100%', borderRadius: 1.5, zIndex: 0,
                  bgcolor: NAVY,
                },
                '& .MuiTab-root': { minHeight: 40, py: 0.5 },
             }}
           >
             <Tab
                value="live" label="Live View"
                sx={{ zIndex: 1, fontWeight: 800, letterSpacing: '0.02em', minWidth: 110, borderRadius: 1.5, '&.Mui-selected': { color: 'white' } }}
             />
             <Tab
                value="history" label="Payroll & History"
                sx={{ zIndex: 1, fontWeight: 800, letterSpacing: '0.02em', minWidth: 160, borderRadius: 1.5, '&.Mui-selected': { color: 'white' } }}
             />
           </Tabs>
           <Tooltip title="Refresh">
             <IconButton
               onClick={fetchAttendance}
               sx={{
                 width: 44, height: 44, borderRadius: 2,
                 bgcolor: alpha(GOLD, 0.1), color: GOLD,
                 border: '1px solid', borderColor: alpha(GOLD, 0.2),
                 transition: 'all .2s', '&:hover': { bgcolor: alpha(GOLD, 0.18) },
                 '&:active': { transform: 'scale(0.98)' },
               }}
             >
               <Iconify icon="solar:restart-bold-duotone" className={refreshing ? 'animate-spin' : ''} />
             </IconButton>
           </Tooltip>
        </Stack>
      </Stack>

      {currentTab === 'live' ? (
        <Grid container spacing={{ xs: 3, lg: 4 }}>
          {/* CONTROL PANEL — premium time clock */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              p: { xs: 3, md: 4 }, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
              border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08),
              position: 'relative', overflow: 'hidden',
            }}>
              {/* status strip */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                bgcolor: isUserClockedIn ? (isUserOnBreak ? 'warning.main' : 'success.main') : alpha(theme.palette.divider, 0.3),
              }} />

              <Stack direction="row" spacing={1.5} alignItems="center" mb={3.5}>
                <Box sx={{ p: 1, bgcolor: alpha(GOLD, 0.1), borderRadius: 1.5, color: GOLD, display: 'flex' }}>
                  <Iconify icon="solar:display-bold-duotone" width={22} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>TIME CLOCK</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: NAVY }}>Clock In / Out</Typography>
                </Box>
              </Stack>

              <Stack spacing={3.5}>
                {isAdmin && (
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 700 }}>Select Employee</InputLabel>
                    <Select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      label="Select Employee"
                      sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: alpha(theme.palette.background.neutral, 0.4) }}
                    >
                      {users.map(u => (
                        <MenuItem key={u.id} value={u.id}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{
                              width: 32, height: 32, bgcolor: NAVY,
                              color: 'white', fontSize: '0.8rem', fontWeight: 800
                            }}>{u.name[0]}</Avatar>
                            <Typography variant="subtitle2" fontWeight={800}>{u.name.toUpperCase()}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {!isAdmin && (
                   <Paper
                     elevation={0}
                     sx={{ p: 2, bgcolor: alpha(GOLD, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(GOLD, 0.12) }}
                   >
                      <Stack direction="row" spacing={2} alignItems="center">
                         <Avatar sx={{ width: 48, height: 48, bgcolor: NAVY, color: GOLD, fontWeight: 900 }}>{userData.name[0]}</Avatar>
                         <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: NAVY }}>{userData.name.toUpperCase()}</Typography>
                            <Typography sx={{ ...labelSx, fontWeight: 700 }}>Your Personal Work Console</Typography>
                         </Box>
                      </Stack>
                   </Paper>
                )}

                {/* Current status display */}
                <Box sx={{
                  p: 2.5, borderRadius: 2, textAlign: 'center',
                  bgcolor: alpha(
                    isUserClockedIn ? (isUserOnBreak ? theme.palette.warning.main : theme.palette.success.main) : theme.palette.text.disabled,
                    0.06
                  ),
                  border: '1px dashed',
                  borderColor: alpha(
                    isUserClockedIn ? (isUserOnBreak ? theme.palette.warning.main : theme.palette.success.main) : theme.palette.text.disabled,
                    0.25
                  ),
                }}>
                  <Typography sx={{ ...labelSx, mb: 0.75 }}>CURRENT STATUS</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Box sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: isUserClockedIn ? (isUserOnBreak ? 'warning.main' : 'success.main') : 'text.disabled',
                      ...(isUserClockedIn && { animation: 'pulse 2s infinite' }),
                    }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: NAVY }}>
                      {isUserClockedIn ? (isUserOnBreak ? 'On Break' : 'On Duty') : 'Off Duty'}
                    </Typography>
                  </Stack>
                  {isUserClockedIn && userAttendance?.checkInTime && (
                    <Typography variant="caption" color="text.secondary" sx={{ ...numSx, fontWeight: 700, mt: 0.5, display: 'block' }}>
                      Since {new Date(userAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  )}
                </Box>

                <Stack spacing={2}>
                  {!isUserClockedIn ? (
                    <Button
                      fullWidth variant="contained" color="success"
                      onClick={() => { setActionType('in'); setConfirmOpen(true); }}
                      disabled={!selectedUser && isAdmin}
                      startIcon={<Iconify icon="solar:play-bold-duotone" />}
                      sx={{ height: 64, fontSize: '1.05rem', fontWeight: 800, borderRadius: 2, boxShadow: theme.customShadows.z8, '&:active': { transform: 'scale(0.98)' } }}
                    >
                      Start Shift
                    </Button>
                  ) : (
                    <>
                      <Button
                        fullWidth variant="soft" color={isUserOnBreak ? "warning" : "info"}
                        onClick={() => { setActionType('break'); setConfirmOpen(true); }}
                        startIcon={<Iconify icon={isUserOnBreak ? "solar:restart-bold-duotone" : "solar:coffee-bold-duotone"} />}
                        sx={{ height: 56, fontSize: '0.95rem', fontWeight: 800, borderRadius: 2, '&:active': { transform: 'scale(0.98)' } }}
                      >
                        {isUserOnBreak ? 'End Break' : 'Start Break'}
                      </Button>
                      <Button
                        fullWidth variant="contained"
                        onClick={() => { setActionType('out'); setConfirmOpen(true); }}
                        startIcon={<Iconify icon="solar:stop-bold-duotone" />}
                        sx={{
                          height: 56, fontSize: '0.95rem', fontWeight: 800, borderRadius: 2,
                          bgcolor: NAVY, color: 'white', boxShadow: theme.customShadows.z8,
                          '&:hover': { bgcolor: '#2b2f4a' }, '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        End Shift
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* ON DUTY LIST */}
          <Grid item xs={12} lg={8}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
              <Box>
                <Typography sx={labelSx}>ON DUTY NOW</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: NAVY }}>
                  Currently Active Specialists
                </Typography>
              </Box>
              <Chip
                 label={activeStaff.length} size="small"
                 sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 800, borderRadius: 1, ...numSx }}
              />
            </Stack>

            <Grid container spacing={2.5}>
              {activeStaff.map(att => {
                const u = users.find(x => x.id === att.UserId);
                const isOnBreak = att.status === 'on_break';
                const accent = isOnBreak ? theme.palette.warning.main : theme.palette.success.main;
                return (
                  <Grid item xs={12} sm={6} key={att.id}>
                    <Card sx={{
                      p: 2.5, borderRadius: 2.5, border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.08),
                      boxShadow: theme.customShadows.z8,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.customShadows.z12, borderColor: alpha(accent, 0.3) }
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar sx={{
                            width: 52, height: 52, bgcolor: NAVY, color: 'white',
                            fontWeight: 900, fontSize: '1.2rem',
                          }}>{u?.name?.[0] || '?'}</Avatar>
                          {/* status dot */}
                          <Box sx={{
                            position: 'absolute', bottom: -1, right: -1,
                            width: 14, height: 14, borderRadius: '50%',
                            bgcolor: accent, border: '2px solid', borderColor: 'background.paper',
                            animation: 'pulse 2s infinite',
                          }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ letterSpacing: '-0.01em', color: NAVY }}>
                            {u?.name?.toUpperCase() || 'STAFF'}
                          </Typography>
                          <Typography variant="caption" sx={{ ...numSx, color: isOnBreak ? 'warning.main' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.04em' }}>
                             {isOnBreak ? 'On Break' : `Since ${new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
              {activeStaff.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{
                    py: { xs: 8, md: 12 }, textAlign: 'center', bgcolor: alpha(theme.palette.background.neutral, 0.4),
                    borderRadius: 2.5, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.12)
                  }}>
                    <Iconify icon="solar:ghost-bold-duotone" width={56} sx={{ color: 'text.disabled', opacity: 0.4, mb: 1.5 }} />
                    <Typography variant="h6" color="text.disabled" fontWeight={800}>No activity detected</Typography>
                    <Typography variant="body2" color="text.disabled" fontWeight={600}>All specialists are currently off duty.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Stack spacing={3}>
          {/* HISTORY FILTERS */}
          <Card sx={{
            p: { xs: 2.5, md: 3 }, borderRadius: 2.5,
            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: theme.customShadows.z8,
          }}>
             <Stack
               direction={{ xs: 'column', sm: 'row' }}
               spacing={2.5}
               alignItems={{ xs: 'stretch', sm: 'flex-end' }}
             >
                {isAdmin && (
                   <Box sx={{ flex: 1, width: '100%' }}>
                      <Typography sx={{ ...labelSx, mb: 0.75, display: 'block' }}>Employee</Typography>
                      <FormControl fullWidth size="small">
                         <Select
                           value={filter.userId}
                           onChange={(e) => setFilter({...filter, userId: e.target.value})}
                           sx={{ borderRadius: 1.5, fontWeight: 700 }}
                         >
                            <MenuItem value="">ALL STAFF</MenuItem>
                            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name.toUpperCase()}</MenuItem>)}
                         </Select>
                      </FormControl>
                   </Box>
                )}
                <Box sx={{ flex: 1, width: '100%' }}>
                   <Typography sx={{ ...labelSx, mb: 0.75, display: 'block' }}>From Date</Typography>
                   <TextField
                      fullWidth size="small" type="date"
                      value={filter.from}
                      onChange={(e) => setFilter({...filter, from: e.target.value})}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 1.5, fontWeight: 700, ...numSx } }}
                   />
                </Box>
                <Box sx={{ flex: 1, width: '100%' }}>
                   <Typography sx={{ ...labelSx, mb: 0.75, display: 'block' }}>To Date</Typography>
                   <TextField
                      fullWidth size="small" type="date"
                      value={filter.to}
                      onChange={(e) => setFilter({...filter, to: e.target.value})}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 1.5, fontWeight: 700, ...numSx } }}
                   />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
                    <Card sx={{
                      p: 2, bgcolor: NAVY, color: 'white', borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: theme.customShadows.z8,
                    }}>
                       <Box>
                          <Typography sx={{ ...labelSx, color: GOLD }}>Total Hours</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', ...numSx }}>{totalHoursWorked}h</Typography>
                       </Box>
                       <Iconify icon="solar:clock-circle-bold-duotone" width={30} sx={{ color: GOLD, opacity: 0.9 }} />
                    </Card>
                </Box>
             </Stack>
          </Card>

          {/* HISTORY — MOBILE CARD LIST (xs–sm) */}
          {isMobile ? (
            <Stack spacing={2}>
              {attendance.map((att) => {
                const hasResumed = att.events?.some((e) => e.type === 'UNDO_END');
                const onDuty = !att.checkOutTime;
                return (
                  <Card
                    key={att.id}
                    onClick={() => setSelectedShift(att)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedShift(att);
                      }
                    }}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.08),
                      boxShadow: theme.customShadows.z8,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.customShadows.z12, borderColor: alpha(GOLD, 0.4) },
                      '&:focus-visible': { outline: `2px solid ${alpha(GOLD, 0.6)}`, outlineOffset: 2 },
                    }}
                  >
                    {/* Header: employee + date */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar sx={{ width: 44, height: 44, bgcolor: NAVY, color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>
                          {att.User?.name?.[0] || '?'}
                        </Avatar>
                        <Box sx={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 12, height: 12, borderRadius: '50%',
                          bgcolor: onDuty ? 'success.main' : 'text.disabled',
                          border: '2px solid', borderColor: 'background.paper',
                        }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: NAVY }}>
                          {att.User?.name?.toUpperCase() || 'STAFF'}
                        </Typography>
                        <Typography variant="caption" sx={{ ...numSx, fontWeight: 700, color: 'text.secondary' }}>
                          {new Date(att.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Chip label={att.Branch?.name || 'MAIN'} size="small" variant="soft" sx={{ fontWeight: 800, borderRadius: 1 }} />
                    </Stack>

                    {hasResumed && (
                      <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
                        <Iconify icon="solar:danger-bold" width={13} sx={{ mr: 0.5, color: 'error.main' }} />
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800, letterSpacing: '0.04em' }}>
                          SHIFT RESUMED
                        </Typography>
                      </Stack>
                    )}

                    <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

                    {/* Key-value pairs */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Typography sx={{ ...labelSx, display: 'block' }}>Check In</Typography>
                        <Typography variant="subtitle2" sx={{ ...numSx, fontWeight: 800, color: 'success.main' }}>
                          {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ ...labelSx, display: 'block' }}>Check Out</Typography>
                        <Typography variant="subtitle2" sx={{ ...numSx, fontWeight: 800, color: att.checkOutTime ? 'text.primary' : GOLD }}>
                          {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ON DUTY'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ ...labelSx, display: 'block' }}>Breaks</Typography>
                        <Typography variant="subtitle2" sx={{ ...numSx, fontWeight: 800, color: 'warning.main' }}>{att.breakMinutes || 0}m</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography sx={{ ...labelSx, display: 'block' }}>Net Work Hours</Typography>
                        <Box sx={{ ...numSx, mt: 0.25, px: 1.25, py: 0.25, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1, display: 'inline-block', color: 'info.main', fontWeight: 800 }}>
                          {att.totalHours || '—'} Hrs
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
              {attendance.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 2.5, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.12) }}>
                  <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled', opacity: 0.4, mb: 1 }} />
                  <Typography variant="subtitle1" color="text.disabled" fontWeight={800}>No records found</Typography>
                  <Typography variant="body2" color="text.disabled" fontWeight={600}>Try widening the date range or clearing filters.</Typography>
                </Box>
              )}
            </Stack>
          ) : (
          /* HISTORY TABLE (md and up) */
          <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: theme.customShadows.z8, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), overflow: 'hidden' }}>
             <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.background.neutral, 0.6) }}>
                   <TableRow>
                      <TableCell sx={{ ...labelSx, py: 2 }}>Employee</TableCell>
                      <TableCell sx={labelSx}>Date</TableCell>
                      <TableCell sx={labelSx}>Check In</TableCell>
                      <TableCell sx={labelSx}>Check Out</TableCell>
                      <TableCell sx={labelSx}>Breaks</TableCell>
                      <TableCell sx={labelSx}>Branch</TableCell>
                      <TableCell sx={labelSx} align="center">Net Work Hours</TableCell>
                   </TableRow>
                </TableHead>
                <TableBody>
                   {attendance.map((att) => {
                      const onDuty = !att.checkOutTime;
                      return (
                      <TableRow
                        key={att.id} hover
                        onClick={() => setSelectedShift(att)}
                        sx={{ cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: alpha(GOLD, 0.05) }, '&:last-of-type td': { border: 0 } }}
                      >
                         <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                               <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                 <Avatar sx={{ width: 36, height: 36, bgcolor: NAVY, color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>{att.User?.name?.[0]}</Avatar>
                                 <Box sx={{
                                   position: 'absolute', bottom: -1, right: -1,
                                   width: 11, height: 11, borderRadius: '50%',
                                   bgcolor: onDuty ? 'success.main' : 'text.disabled',
                                   border: '2px solid', borderColor: 'background.paper',
                                 }} />
                               </Box>
                               <Box>
                                 <Typography variant="subtitle2" sx={{ fontWeight: 800, color: NAVY }}>{att.User?.name?.toUpperCase()}</Typography>
                                 {att.events?.some(e => e.type === 'UNDO_END') && (
                                    <Stack direction="row" alignItems="center" sx={{ mt: 0.25 }}>
                                       <Iconify icon="solar:danger-bold" width={12} sx={{ mr: 0.5, color: 'error.main' }} />
                                       <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800, letterSpacing: '0.04em' }}>SHIFT RESUMED</Typography>
                                    </Stack>
                                 )}
                               </Box>
                            </Stack>
                         </TableCell>
                         <TableCell sx={{ ...numSx, fontWeight: 700 }}>{new Date(att.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</TableCell>
                         <TableCell sx={{ ...numSx, fontWeight: 800, color: 'success.main' }}>{new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                         <TableCell sx={{ ...numSx, fontWeight: 800, color: att.checkOutTime ? 'text.primary' : GOLD }}>
                            {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ON DUTY'}
                         </TableCell>
                         <TableCell sx={{ ...numSx, fontWeight: 800, color: 'warning.main' }}>{att.breakMinutes || 0}m</TableCell>
                         <TableCell>
                            <Chip label={att.Branch?.name || 'MAIN'} size="small" variant="soft" sx={{ fontWeight: 800, borderRadius: 1 }} />
                         </TableCell>
                         <TableCell align="center">
                            <Box sx={{
                               ...numSx,
                               px: 1.5, py: 0.5, bgcolor: alpha(theme.palette.info.main, 0.1),
                               borderRadius: 1, display: 'inline-block', color: 'info.main', fontWeight: 800
                            }}>
                               {att.totalHours || '—'} Hrs
                            </Box>
                         </TableCell>
                      </TableRow>
                      );
                   })}
                   {attendance.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={7} align="center" sx={{ py: 8, border: 0 }}>
                            <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled', opacity: 0.4, mb: 1 }} />
                            <Typography variant="subtitle1" color="text.disabled" fontWeight={800}>No records found</Typography>
                            <Typography variant="body2" color="text.disabled" fontWeight={600}>Try widening the date range or clearing filters.</Typography>
                         </TableCell>
                      </TableRow>
                   )}
                </TableBody>
             </Table>
          </TableContainer>
          )}
        </Stack>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={
          actionType === 'in' ? 'Start Shift?' :
          (actionType === 'out' ? 'End Shift?' : 'Toggle Break?')
        }
        content={
          actionType === 'in' ? 'Confirm starting this work session? Location will be automatically logged.' :
          (actionType === 'out' ? 'Confirm completion of this shift? All hours including breaks will be finalized.' :
          'Confirm toggling break status? This will pause or resume the work shift timer.')
        }
        confirmLabel={
          actionType === 'in' ? 'START SHIFT' :
          (actionType === 'out' ? 'COMPLETE SHIFT' : 'CONFIRM TOGGLE')
        }
        onConfirm={() => executeAction()}
        onClose={() => setConfirmOpen(false)}
        color={actionType === 'out' ? 'secondary' : (actionType === 'in' ? 'success' : 'warning')}
      />

      <Dialog
        open={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#F4F6F8', minHeight: '80vh' } }}
      >
        <DialogTitle sx={{ bgcolor: NAVY, color: 'white', p: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
           {/* gold accent strip */}
           <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: GOLD }} />
           <Box>
              <Typography sx={{ ...labelSx, color: GOLD, mb: 0.5 }}>Shift Audit</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>{selectedShift?.User?.name?.toUpperCase()}</Typography>
              <Typography variant="subtitle2" sx={{ ...numSx, opacity: 0.75, fontWeight: 600 }}>
                 {selectedShift?.date && new Date(selectedShift.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
           </Box>
           <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(GOLD, 0.15), color: GOLD, border: '2px solid', borderColor: alpha(GOLD, 0.4), fontWeight: 900 }}>
              {selectedShift?.User?.name?.[0] || '?'}
           </Avatar>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
           <Stack spacing={0}>
              {/* VISUAL GANTT CHART HEADER */}
              {selectedShift?.events?.length > 1 && (
                 <Box sx={{ p: { xs: 3, md: 4 }, pb: 2, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                       <Typography sx={labelSx}>Visual Day Flow</Typography>
                       <Chip
                          label={`${selectedShift.totalHours} WORKING HOURS`}
                          size="small"
                          sx={{ fontWeight: 800, borderRadius: 1, bgcolor: NAVY, color: 'white', ...numSx }}
                       />
                    </Stack>
                    <Box sx={{
                       height: 36, width: '100%', borderRadius: 1.5, overflow: 'hidden',
                       display: 'flex', bgcolor: alpha(NAVY, 0.05), border: '1px solid', borderColor: 'divider'
                    }}>
                       {ganttSegments.map((seg) => (
                          <Tooltip key={seg.key} title={`${seg.type.replace('_', ' ')} (${Math.round(seg.segmentDur / 60000)}m)`}>
                             <Box sx={{
                                width: `${seg.width}%`, height: '100%',
                                bgcolor: seg.isBreak ? 'warning.main' : (seg.isUndo ? 'error.main' : 'success.main'),
                                borderRight: '1px solid rgba(255,255,255,0.15)',
                                opacity: seg.isBreak ? 0.6 : 1, transition: 'all 0.2s',
                                '&:hover': { opacity: 0.9, filter: 'brightness(1.1)' }
                             }} />
                          </Tooltip>
                       ))}
                    </Box>
                    {/* legend */}
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                       {[
                          { c: theme.palette.success.main, l: 'Working' },
                          { c: theme.palette.warning.main, l: 'Break' },
                          { c: theme.palette.error.main, l: 'Resumed' },
                       ].map((it) => (
                          <Stack key={it.l} direction="row" spacing={0.75} alignItems="center">
                             <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: it.c }} />
                             <Typography sx={{ ...labelSx, color: 'text.secondary' }}>{it.l}</Typography>
                          </Stack>
                       ))}
                    </Stack>
                 </Box>
              )}

              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography sx={{ ...labelSx, mb: 3, display: 'block' }}>Complete Event Audit</Typography>

                <Box sx={{ position: 'relative' }}>
                   {/* VERTICAL LINE */}
                   <Box sx={{
                      position: 'absolute', left: 23, top: 0, bottom: 0,
                      width: 2, bgcolor: alpha(NAVY, 0.1), borderRadius: 1
                   }} />

                   <Stack spacing={3.5}>
                       {(selectedShift?.events || []).map((e, idx) => {
                          const isSuccess = e.type.includes('START') || e.type.includes('IN');
                          const isError = e.type.includes('OUT') || e.type === 'UNDO_END';
                          const isWarning = e.type.includes('BREAK');

                          return (
                             <Stack key={idx} direction="row" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                                <Box sx={{
                                   width: 48, height: 48, borderRadius: 2, flexShrink: 0,
                                   bgcolor: 'white', border: '2px solid',
                                   borderColor: isSuccess ? 'success.main' : (isError ? 'error.main' : 'warning.main'),
                                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   boxShadow: theme.customShadows.z8, color: isSuccess ? 'success.main' : (isError ? 'error.main' : 'warning.main')
                                }}>
                                   <Iconify
                                      icon={e.type.includes('CLOCK') ? "solar:clock-circle-bold" : (e.type.includes('BREAK') ? "solar:coffee-bold" : "solar:undo-left-bold")}
                                      width={24}
                                   />
                                </Box>

                                <Box sx={{ flex: 1, pt: 0.5, minWidth: 0 }}>
                                   <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: NAVY }}>
                                         {e.type.replace('_', ' ')}
                                      </Typography>
                                      <Typography variant="caption" sx={{ ...numSx, flexShrink: 0, fontWeight: 800, color: 'text.secondary', bgcolor: alpha(NAVY, 0.05), px: 1, py: 0.5, borderRadius: 0.75 }}>
                                         {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </Typography>
                                   </Stack>

                                   <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                                      {e.lat && (
                                         <Button
                                           size="small" variant="soft" color="info"
                                           component="a" href={`https://www.google.com/maps?q=${e.lat},${e.lng}`} target="_blank"
                                           startIcon={<Iconify icon="solar:map-point-bold" />}
                                           sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1 }}
                                         >
                                            View GPS Location
                                         </Button>
                                      )}
                                      {e.duration && (
                                         <Chip
                                           label={`${e.duration}m duration`}
                                           size="small" variant="soft" color="warning"
                                           sx={{ fontWeight: 700, borderRadius: 1, ...numSx }}
                                         />
                                      )}
                                   </Stack>
                                </Box>
                             </Stack>
                          );
                       })}
                   </Stack>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                 <Grid container spacing={2}>
                    <Grid item xs={6}>
                       <Box sx={{ p: 2, bgcolor: alpha(GOLD, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(GOLD, 0.12) }}>
                          <Typography sx={{ ...labelSx, mb: 0.5, display: 'block' }}>Total Work</Typography>
                          <Typography variant="h4" fontWeight={900} sx={{ ...numSx, letterSpacing: '-0.02em', color: GOLD }}>{selectedShift?.totalHours} Hrs</Typography>
                       </Box>
                    </Grid>
                    <Grid item xs={6}>
                       <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.12) }}>
                          <Typography sx={{ ...labelSx, mb: 0.5, display: 'block' }}>Rest Periods</Typography>
                          <Typography variant="h4" fontWeight={900} sx={{ ...numSx, letterSpacing: '-0.02em', color: 'warning.main' }}>{selectedShift?.breakMinutes} Min</Typography>
                       </Box>
                    </Grid>
                 </Grid>
              </Box>
           </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#F4F6F8' }}>
           <Button fullWidth variant="contained" color="inherit" onClick={() => setSelectedShift(null)} sx={{ fontWeight: 800, py: 1.5, borderRadius: 2, bgcolor: NAVY, color: 'white', '&:hover': { bgcolor: '#2b2f4a' }, '&:active': { transform: 'scale(0.98)' } }}>
              CLOSE AUDIT CONSOLE
           </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
        `}
      </style>
    </Box>
  );
}
