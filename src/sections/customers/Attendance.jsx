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
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

export default function Attendance() {
  const theme = useTheme();
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
  const isAdmin = userData?.role === 'admin' || userData?.role === 'manager';

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
           branchId: (selectedBranchId && selectedBranchId !== 'all') ? selectedBranchId : (userData.branches?.[0]?.id || userData.BranchId)
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{
            p: 1.5, bgcolor: '#1B1F3A', borderRadius: 2.5, color: '#C8972A',
            display: 'flex', border: '1px solid', borderColor: alpha('#C8972A', 0.2),
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <Iconify icon="solar:user-speak-bold-duotone" width={32} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -2 }}>Attendance Hub</Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={700}>Professional hour tracking and payroll management.</Typography>
          </Box>
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center">
           <Tabs 
             value={currentTab} 
             onChange={(e, val) => setCurrentTab(val)}
             sx={{ 
                bgcolor: alpha(theme.palette.background.neutral, 0.4), 
                p: 0.5, borderRadius: 1.5,
                '& .MuiTabs-indicator': { height: '100%', borderRadius: 1.2, zIndex: 0 },
             }}
           >
             <Tab 
                value="live" label="Live View" 
                sx={{ zIndex: 1, fontWeight: 900, minWidth: 120, borderRadius: 1.2, '&.Mui-selected': { color: 'white' } }} 
             />
             <Tab 
                value="history" label="Payroll & History" 
                sx={{ zIndex: 1, fontWeight: 900, minWidth: 180, borderRadius: 1.2, '&.Mui-selected': { color: 'white' } }} 
             />
           </Tabs>
           <IconButton onClick={fetchAttendance} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 44, height: 44 }}>
             <Iconify icon="solar:restart-bold-duotone" className={refreshing ? 'animate-spin' : ''} sx={{ color: 'secondary.main' }} />
           </IconButton>
        </Stack>
      </Stack>

      {currentTab === 'live' ? (
        <Grid container spacing={4}>
          {/* CONTROL PANEL */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
              border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
              bgcolor: alpha(theme.palette.background.default, 0.8),
              backdropFilter: 'blur(8px)'
            }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Box sx={{ p: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 1.5, color: 'secondary.main' }}>
                  <Iconify icon="solar:display-bold-duotone" width={24} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Clock In / Out</Typography>
              </Stack>

              <Stack spacing={4}>
                {isAdmin && (
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 800 }}>Select Employee</InputLabel>
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
                              width: 32, height: 32, bgcolor: '#1B1F3A',
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
                   <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 1.5, border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.1) }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                         <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', color: 'white', fontWeight: 900 }}>{userData.name[0]}</Avatar>
                         <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{userData.name.toUpperCase()}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Your Personal Work Console</Typography>
                         </Box>
                      </Stack>
                   </Paper>
                )}

                <Stack direction="row" spacing={2}>
                  {!isUserClockedIn ? (
                    <Button
                      fullWidth variant="contained" color="success"
                      onClick={() => { setActionType('in'); setConfirmOpen(true); }}
                      disabled={!selectedUser && isAdmin}
                      startIcon={<Iconify icon="solar:play-bold-duotone" />}
                      sx={{ height: 60, fontSize: '1.1rem', fontWeight: 900, borderRadius: 1.5 }}
                    >
                      Start Shift
                    </Button>
                  ) : (
                    <>
                      <Button
                        fullWidth variant="soft" color={isUserOnBreak ? "warning" : "info"}
                        onClick={() => { setActionType('break'); setConfirmOpen(true); }}
                        startIcon={<Iconify icon={isUserOnBreak ? "solar:restart-bold-duotone" : "solar:coffee-bold-duotone"} />}
                        sx={{ height: 60, fontSize: '1rem', fontWeight: 900, borderRadius: 1.5 }}
                      >
                        {isUserOnBreak ? 'End Break' : 'Start Break'}
                      </Button>
                      <Button
                        fullWidth variant="contained" color="secondary"
                        onClick={() => { setActionType('out'); setConfirmOpen(true); }}
                        startIcon={<Iconify icon="solar:stop-bold-duotone" />}
                        sx={{ height: 60, fontSize: '1rem', fontWeight: 900, borderRadius: 1.5 }}
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
            <Stack direction="row" spacing={1.5} alignItems="center" mb={4}>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Currently Active Specialists</Typography>
              <Chip 
                 label={activeStaff.length} size="small" 
                 sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 900, borderRadius: 1 }} 
              />
            </Stack>

            <Grid container spacing={3}>
              {activeStaff.map(att => {
                const u = users.find(x => x.id === att.UserId);
                const isOnBreak = att.status === 'on_break';
                return (
                  <Grid item xs={12} sm={6} key={att.id}>
                    <Card sx={{
                      p: 3, borderRadius: 2.5, border: '1px solid', 
                      borderColor: alpha(isOnBreak ? theme.palette.warning.main : theme.palette.success.main, 0.2),
                      bgcolor: alpha(isOnBreak ? theme.palette.warning.main : theme.palette.success.main, 0.02),
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { transform: 'scale(1.02)', boxShadow: theme.customShadows.z12 }
                    }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar sx={{
                          width: 56, height: 56, bgcolor: '#1B1F3A', color: 'white',
                          fontWeight: 900, fontSize: '1.3rem', border: '2px solid', 
                          borderColor: isOnBreak ? 'warning.main' : 'secondary.main'
                        }}>{u?.name?.[0] || '?'}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={900} noWrap sx={{ letterSpacing: 0.2 }}>{u?.name?.toUpperCase() || 'STAFF'}</Typography>
                          <Typography variant="caption" sx={{ color: isOnBreak ? 'warning.main' : 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                             {isOnBreak ? 'Current Status: ON BREAK' : `On duty since ${new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                           width: 12, height: 12, borderRadius: '50%', 
                           bgcolor: isOnBreak ? 'warning.main' : 'success.main', 
                           animation: 'pulse 2s infinite',
                           boxShadow: `0 0 10px ${isOnBreak ? alpha(theme.palette.warning.main, 0.5) : alpha(theme.palette.success.main, 0.5)}`
                        }} />
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
              {activeStaff.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{
                    py: 12, textAlign: 'center', bgcolor: alpha(theme.palette.background.neutral, 0.4),
                    borderRadius: 3, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1)
                  }}>
                    <Iconify icon="solar:ghost-bold-duotone" width={64} sx={{ color: 'text.disabled', opacity: 0.1, mb: 2 }} />
                    <Typography variant="h5" color="text.disabled" fontWeight={800}>No activity detected</Typography>
                    <Typography variant="body2" color="text.disabled" fontWeight={700}>All specialists are currently off duty.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Stack spacing={4}>
          {/* HISTORY FILTERS */}
          <Card sx={{ p: 3, borderRadius: 2.5, bgcolor: alpha(theme.palette.background.neutral, 0.3) }}>
             <Grid container spacing={3} alignItems="flex-end">
                {isAdmin && (
                   <Grid item xs={12} sm={3}>
                      <Typography variant="caption" fontWeight={900} sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>EMPLOYEE</Typography>
                      <FormControl fullWidth size="small">
                         <Select 
                           value={filter.userId} 
                           onChange={(e) => setFilter({...filter, userId: e.target.value})}
                           sx={{ borderRadius: 1, fontWeight: 700, bgcolor: 'white' }}
                         >
                            <MenuItem value="">ALL STAFF</MenuItem>
                            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name.toUpperCase()}</MenuItem>)}
                         </Select>
                      </FormControl>
                   </Grid>
                )}
                <Grid item xs={12} sm={3}>
                   <Typography variant="caption" fontWeight={900} sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>FROM DATE</Typography>
                   <TextField 
                      fullWidth size="small" type="date" 
                      value={filter.from} 
                      onChange={(e) => setFilter({...filter, from: e.target.value})}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 1, fontWeight: 700, bgcolor: 'white' } }} 
                   />
                </Grid>
                <Grid item xs={12} sm={3}>
                   <Typography variant="caption" fontWeight={900} sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>TO DATE</Typography>
                   <TextField 
                      fullWidth size="small" type="date" 
                      value={filter.to}
                      onChange={(e) => setFilter({...filter, to: e.target.value})}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 1, fontWeight: 700, bgcolor: 'white' } }} 
                   />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ p: 2, bgcolor: '#1B1F3A', color: 'white', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main', display: 'block' }}>TOTAL HOURS</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 950 }}>{totalHoursWorked}h</Typography>
                       </Box>
                       <Iconify icon="solar:clock-circle-bold-duotone" width={32} />
                    </Card>
                </Grid>
             </Grid>
          </Card>

          {/* HISTORY TABLE */}
          <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: theme.customShadows.z8, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), overflow: 'hidden' }}>
             <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.background.neutral, 0.6) }}>
                   <TableRow>
                      <TableCell sx={{ fontWeight: 900, py: 2.5 }}>EMPLOYEE</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>DATE</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>CHECK IN</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>CHECK OUT</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>BREAKS</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>BRANCH</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="center">NET WORK HOURS</TableCell>
                   </TableRow>
                </TableHead>
                <TableBody>
                   {attendance.map((att) => (
                      <TableRow 
                        key={att.id} hover 
                        onClick={() => setSelectedShift(att)}
                        sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) } }}
                      >
                         <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                               <Avatar sx={{ width: 36, height: 36, bgcolor: '#1B1F3A', color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>{att.User?.name[0]}</Avatar>
                               <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{att.User?.name?.toUpperCase()}</Typography>
                            </Stack>
                            {att.events?.some(e => e.type === 'UNDO_END') && (
                               <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 900, display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Iconify icon="solar:danger-bold" width={12} sx={{ mr: 0.5 }} /> SHIFT RESUMED
                               </Typography>
                            )}
                         </TableCell>
                         <TableCell sx={{ fontWeight: 700 }}>{new Date(att.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</TableCell>
                         <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>{new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                         <TableCell sx={{ fontWeight: 800, color: att.checkOutTime ? 'text.primary' : 'secondary.main' }}>
                            {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ON DUTY'}
                         </TableCell>
                         <TableCell sx={{ fontWeight: 800, color: 'warning.main' }}>{att.breakMinutes || 0}m</TableCell>
                         <TableCell sx={{ fontWeight: 700 }}>
                            <Chip label={att.Branch?.name || 'MAIN'} size="small" variant="soft" sx={{ fontWeight: 900, borderRadius: 0.8 }} />
                         </TableCell>
                         <TableCell align="center">
                            <Box sx={{ 
                               px: 1.5, py: 0.5, bgcolor: alpha(theme.palette.info.main, 0.1), 
                               borderRadius: 1, display: 'inline-block', color: 'info.main', fontWeight: 900 
                            }}>
                               {att.totalHours || '—'} Hrs
                            </Box>
                         </TableCell>
                      </TableRow>
                   ))}
                   {attendance.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <Typography variant="body1" color="text.disabled" fontWeight={800}>No records found for this period.</Typography>
                         </TableCell>
                      </TableRow>
                   )}
                </TableBody>
             </Table>
          </TableContainer>
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
        <DialogTitle sx={{ bgcolor: '#1B1F3A', color: 'white', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <Box>
              <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: -0.5 }}>{selectedShift?.User?.name?.toUpperCase()}</Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700 }}>
                 {new Date(selectedShift?.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
           </Box>
           <Avatar src="/favicon/favicon.ico" sx={{ width: 48, height: 48, border: '2px solid rgba(255,255,255,0.2)' }} />
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
           <Stack spacing={0}>
              {/* VISUAL GANTT CHART HEADER */}
              {selectedShift?.events?.length > 1 && (
                 <Box sx={{ p: 4, pb: 2, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                       <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary' }}>Visual Day Flow</Typography>
                       <Chip 
                          label={`${selectedShift.totalHours} WORKING HOURS`} 
                          size="small" color="secondary" 
                          sx={{ fontWeight: 900, borderRadius: 1 }} 
                       />
                    </Stack>
                    <Box sx={{ 
                       height: 40, width: '100%', borderRadius: 1, overflow: 'hidden', 
                       display: 'flex', bgcolor: alpha('#1B1F3A', 0.05), border: '1px solid', borderColor: 'divider'
                    }}>
                       {useMemo(() => {
                           const events = [...selectedShift.events].sort((a,b) => new Date(a.time) - new Date(b.time));
                           const startTime = new Date(events[0].time).getTime();
                           const lastEventTime = new Date(events[events.length-1].time).getTime();
                           const totalDur = lastEventTime - startTime;

                           return events.map((e, i) => {
                               if (i === events.length - 1) return null;
                               const next = events[i+1];
                               const segmentDur = new Date(next.time).getTime() - new Date(e.time).getTime();
                               const width = (segmentDur / totalDur) * 100;
                               
                               const isBreak = e.type === 'BREAK_START';
                               const isUndo = e.type === 'UNDO_END';
                               
                               return (
                                  <Tooltip key={i} title={`${e.type.replace('_', ' ')} (${Math.round(segmentDur/60000)}m)`}>
                                     <Box sx={{ 
                                        width: `${width}%`, height: '100%', 
                                        bgcolor: isBreak ? 'warning.main' : (isUndo ? 'error.main' : 'success.main'),
                                        borderRight: '1px solid rgba(255,255,255,0.1)',
                                        opacity: isBreak ? 0.6 : 1, transition: 'all 0.3s',
                                        '&:hover': { opacity: 0.9, filter: 'brightness(1.1)' }
                                     }} />
                                  </Tooltip>
                               );
                           });
                       }, [selectedShift])}
                    </Box>
                 </Box>
              )}

              <Box sx={{ p: 4 }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', mb: 3, display: 'block' }}>Complete Event Audit</Typography>
                
                <Box sx={{ position: 'relative' }}>
                   {/* VERTICAL LINE */}
                   <Box sx={{ 
                      position: 'absolute', left: 23, top: 0, bottom: 0, 
                      width: 2, bgcolor: alpha('#1B1F3A', 0.1), borderRadius: 1
                   }} />

                   <Stack spacing={4}>
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
                                   boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: isSuccess ? 'success.main' : (isError ? 'error.main' : 'warning.main')
                                }}>
                                   <Iconify 
                                      icon={e.type.includes('CLOCK') ? "solar:clock-circle-bold" : (e.type.includes('BREAK') ? "solar:coffee-bold" : "solar:undo-left-bold")} 
                                      width={24} 
                                   />
                                </Box>
                                
                                <Box sx={{ flex: 1, pt: 0.5 }}>
                                   <Stack direction="row" alignItems="center" justifyContent="space-between">
                                      <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1rem' }}>
                                         {e.type.replace('_', ' ')}
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', bgcolor: alpha('#1B1F3A', 0.05), px: 1, py: 0.5, borderRadius: 0.5 }}>
                                         {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </Typography>
                                   </Stack>
                                   
                                   <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                      {e.lat && (
                                         <Button 
                                           size="small" variant="soft" color="info"
                                           component="a" href={`https://www.google.com/maps?q=${e.lat},${e.lng}`} target="_blank"
                                           startIcon={<Iconify icon="solar:map-point-bold" />}
                                           sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 0.5 }}
                                         >
                                            View GPS Location
                                         </Button>
                                      )}
                                      {e.duration && (
                                         <Chip 
                                           label={`${e.duration}m duration`} 
                                           size="small" variant="soft" color="warning" 
                                           sx={{ fontWeight: 800, borderRadius: 0.5 }} 
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
              
              <Box sx={{ p: 4, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                 <Grid container spacing={2}>
                    <Grid item xs={6}>
                       <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.1) }}>
                          <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>TOTAL WORK</Typography>
                          <Typography variant="h4" fontWeight={950} color="secondary.main">{selectedShift?.totalHours} Hrs</Typography>
                       </Box>
                    </Grid>
                    <Grid item xs={6}>
                       <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.1) }}>
                          <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>REST PERIODS</Typography>
                          <Typography variant="h4" fontWeight={950} color="warning.main">{selectedShift?.breakMinutes} Min</Typography>
                       </Box>
                    </Grid>
                 </Grid>
              </Box>
           </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#F4F6F8' }}>
           <Button fullWidth variant="contained" color="inherit" onClick={() => setSelectedShift(null)} sx={{ fontWeight: 900, py: 1.5, borderRadius: 1.5, bgcolor: '#1B1F3A', color: 'white', '&:hover': { bgcolor: '#2b2f4a' } }}>
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
