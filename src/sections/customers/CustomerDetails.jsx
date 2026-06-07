import React, { useEffect, useState } from 'react';
import {
  Card,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  IconButton,
  Avatar,
  Badge,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Menu,
  ListItemAvatar,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

export default function CustomerDetails({
  customer,
  setCustomer,
  branches,
  employees,
  services,
  token,
  refreshCustomers,
}) {
  const theme = useTheme();
  const [session, setSession] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false); // check-in / cancel / delete-assignment
  const [addingService, setAddingService] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null); // per-assignment Start/Done
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: '', data: null });
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [selectedCheckInBranch, setSelectedCheckInBranch] = useState('');

  // Assignment Form State
  const [newAssignment, setNewAssignment] = useState({
    serviceId: '',
    employeeId: '',
  });

  const [tab, setTab] = useState('active'); // active | history
  const [history, setHistory] = useState([]);

  const [reassignAnchor, setReassignAnchor] = useState(null);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassignSaving, setReassignSaving] = useState(false);

  // Payment & confirmation state for Finish & Pay
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payOpen, setPayOpen] = useState(false);
  const [payStep, setPayStep] = useState(1); // 1 = pick method, 2 = final confirm
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [finishing, setFinishing] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('userData') || 'null'); }
    catch (_e) { return null; }
  })();
  const canReassign = currentUser?.role === 'admin' || currentUser?.role === 'receptionist';

  useEffect(() => {
    if (customer?.id) {
      fetchLatestSession();
      fetchHistory();
    }
  }, [customer]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/payment-methods?activeOnly=1`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchPaymentMethods error:', err);
      setPaymentMethods([]);
    }
  };

  const reassignEmployee = async (assignmentId, newEmployeeId) => {
    setReassignSaving(true);
    try {
      await fetch(`${config.BASE_URL}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId: newEmployeeId }),
      });
      await fetchAssignments(session.id);
    } catch (err) {
      console.error('reassignEmployee error:', err);
    } finally {
      setReassignSaving(false);
      setReassignAnchor(null);
      setReassignTarget(null);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/sessions/customer/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data.filter(s => s.status === 'completed') : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLatestSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.BASE_URL}/sessions/customer/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setSession(null);
        setAssignments([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const active = data.find(s => s.status === 'checked_in');
        if (active) {
          setSession(active);
          fetchAssignments(active.id);
        } else {
          setSession(null);
          setAssignments([]);
        }
      } else {
        setSession(null);
        setAssignments([]);
      }
    } catch (err) {
      console.error('fetchLatestSession error:', err);
      setSession(null);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (sessionId) => {
    try {
      const res = await fetch(`${config.BASE_URL}/assignments/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAssignments([]);
        return;
      }
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = (type, data = null) => {
    setConfirm({ open: true, type, data });
  };

  const executeAction = async () => {
    const { type, data } = confirm;
    setConfirm({ ...confirm, open: false });
    setActionBusy(true);
    if (type === 'delete-assignment') setDeleteAssignmentId(data);

    try {
      let url = '';
      let method = 'POST';
      let body = {};

      if (type === 'check-in') {
        const branchId = localStorage.getItem('selectedBranchId');
        url = `${config.BASE_URL}/customers/${customer.id}/check-in`;
        method = 'POST';
        body = { branchId };
      } else if (type === 'cancel-session') {
        url = `${config.BASE_URL}/sessions/${session.id}`;
        method = 'DELETE';
      } else if (type === 'delete-assignment') {
        url = `${config.BASE_URL}/assignments/${data}`;
        method = 'DELETE';
      }

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: method === 'POST' && body !== null ? JSON.stringify(body) : undefined,
      });

      await fetchLatestSession();
      await fetchHistory();
      refreshCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionBusy(false);
      setDeleteAssignmentId(null);
    }
  };

  const openPayDialog = () => {
    setSelectedPaymentMethodId('');
    setPayStep(1);
    setPayOpen(true);
    fetchPaymentMethods();
  };

  const finalizePayment = async () => {
    setFinishing(true);
    try {
      const res = await fetch(`${config.BASE_URL}/sessions/${session.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethodId: selectedPaymentMethodId || null }),
      });
      if (res.ok) {
        const selectedMethod = paymentMethods.find(p => p.id === selectedPaymentMethodId);
        setReceiptData({
          customer,
          session,
          assignments,
          total: totalEstimation,
          date: new Date(),
          paymentMethod: selectedMethod || null,
        });
        setReceiptOpen(true);
        setPayOpen(false);
        fetchLatestSession();
        fetchHistory();
        refreshCustomers();
      }
    } catch (err) {
      console.error('finalizePayment error:', err);
    } finally {
      setFinishing(false);
    }
  };

  const createAssignment = async () => {
    if (!newAssignment.serviceId || !newAssignment.employeeId) return;
    setAddingService(true);
    try {
      // 1. Create the assignment
      const aRes = await fetch(`${config.BASE_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId: session.id,
          employeeId: newAssignment.employeeId,
        }),
      });
      const assignment = await aRes.json();

      // 2. Add the service to the assignment
      await fetch(`${config.BASE_URL}/assignments/${assignment.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceIds: [newAssignment.serviceId] }),
      });

      setNewAssignment({ serviceId: '', employeeId: '' });
      await fetchAssignments(session.id);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingService(false);
    }
  };

  const handleCheckIn = async (overrideBranchId) => {
    try {
      const branchId = overrideBranchId || localStorage.getItem('selectedBranchId');
      
      if (!branchId || branchId === 'all') {
         setBranchDialogOpen(true);
         return;
      }

      const res = await fetch(`${config.BASE_URL}/customers/${customer.id}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ branchId }),
      });
      if (res.ok) {
        setBranchDialogOpen(false);
        fetchLatestSession();
        refreshCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAssignmentStatus = async (assignmentId, newStatus) => {
    setStatusBusyId(assignmentId);
    try {
      await fetch(`${config.BASE_URL}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchAssignments(session.id);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusBusyId(null);
    }
  };

  const currentBranch = branches.find(b => b.id === customer.BranchId)?.name || 'Central Branch';

  const totalEstimation = assignments.reduce((sum, a) => {
    const servicesList = a.Services || a.services || [];
    const servicesTotal = servicesList.reduce((sSum, s) => {
      // Use priceAtTime from join table if available, else current service price
      const price = s.AssignmentService?.priceAtTime || s.price || 0;
      return sSum + Number(price);
    }, 0);
    return sum + servicesTotal;
  }, 0);

  const hasCompletedJobs = assignments.some(a => a.status === 'completed');

  return (
    <Box>
      <Grid container spacing={3}>
        {/* LEFT: CUSTOMER PROFILE */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Card sx={{
            p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
            height: '100%'
          }}>
            <Stack spacing={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%', bgcolor: session ? 'success.main' : 'text.disabled',
                      border: '3px solid white', boxShadow: 2,
                      animation: session ? 'pulse 2s infinite' : 'none'
                    }} />
                  }
                >
                  <Avatar sx={{
                    width: 100, height: 100, mx: 'auto', bgcolor: '#1B1F3A', color: 'white',
                    fontSize: '2rem', fontWeight: 800
                  }}>
                    {customer.name[0]}
                  </Avatar>
                </Badge>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 3 }}>{customer.name.toUpperCase()}</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                  <Chip
                    label={session ? 'In Salon' : 'Checked Out'}
                    size="small" color={session ? 'success' : 'default'} variant="soft"
                    sx={{ fontWeight: 800, borderRadius: 0.5 }}
                  />
                </Stack>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack spacing={2}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 1.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Iconify icon="solar:phone-bold-duotone" width={20} sx={{ color: 'secondary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled" fontWeight={800}>PHONE</Typography>
                      <Typography variant="body2" fontWeight={800}>{customer.phone || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 1.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Iconify icon="solar:map-point-bold-duotone" width={20} sx={{ color: 'info.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled" fontWeight={800}>BRANCH</Typography>
                      <Typography variant="body2" fontWeight={800}>{currentBranch.toUpperCase()}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>

              <Stack spacing={2} pt={2}>
                {!session ? (
                  <Button
                    fullWidth variant="contained" color="success" size="large"
                    onClick={() => handleAction('check-in')}
                    disabled={actionBusy}
                    sx={{ height: 60, fontSize: '1.1rem', fontWeight: 900, borderRadius: 1.5 }}
                    startIcon={actionBusy
                      ? <CircularProgress size={20} sx={{ color: 'inherit' }} />
                      : <Iconify icon="solar:play-bold-duotone" />}
                  >
                    {actionBusy ? 'Checking in…' : 'Check In'}
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth variant="contained" color="secondary" size="large"
                      onClick={openPayDialog}
                      disabled={actionBusy}
                      sx={{ height: 60, fontSize: '1.1rem', fontWeight: 900, borderRadius: 1.5 }}
                      startIcon={<Iconify icon="solar:verified-check-bold-duotone" />}
                    >
                      Finish & Pay
                    </Button>
                    {!hasCompletedJobs ? (
                      <Button
                        fullWidth variant="soft" color="error"
                        onClick={() => handleAction('cancel-session')}
                        disabled={actionBusy}
                        startIcon={actionBusy ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : null}
                        sx={{ height: 44, fontWeight: 700, borderRadius: 1 }}
                      >
                        {actionBusy ? 'Working…' : 'Cancel Visit'}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ fontStyle: 'italic' }}>
                        Visit cannot be cancelled as some jobs are already finished.
                      </Typography>
                    )}
                  </>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* RIGHT: SERVICES & ASSIGNMENTS */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 4, display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
            <Button
              onClick={() => setTab('active')}
              sx={{
                py: 2, px: 3, borderRadius: '8px 8px 0 0', fontWeight: 800,
                color: tab === 'active' ? 'secondary.main' : 'text.disabled',
                borderBottom: tab === 'active' ? '3px solid' : 'none',
                borderColor: 'secondary.main'
              }}
            >
              Active Now
            </Button>
            <Button
              onClick={() => setTab('history')}
              sx={{
                py: 2, px: 3, borderRadius: '8px 8px 0 0', fontWeight: 800,
                color: tab === 'history' ? 'secondary.main' : 'text.disabled',
                borderBottom: tab === 'history' ? '3px solid' : 'none',
                borderColor: 'secondary.main'
              }}
            >
              Visit History
            </Button>
          </Box>

          {tab === 'active' ? (
            !session ? (
              <Box sx={{
                height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', p: 4,
                border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1),
                borderRadius: 2.5, bgcolor: alpha(theme.palette.secondary.main, 0.01)
              }}>
                <Iconify icon="solar:sleeping-circle-bold-duotone" width={64} sx={{ color: 'text.disabled', opacity: 0.1, mb: 2 }} />
                <Typography variant="h5" color="text.disabled" fontWeight={800}>No active visit</Typography>
                <Typography variant="body2" color="text.disabled" fontWeight={600} textAlign="center">
                  Check in the customer to add services.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={4}>
                {/* ADD SERVICE */}
                <Card sx={{ p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                  <Typography variant="h6" fontWeight={800} mb={3}>Add Service</Typography>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <Autocomplete
                          fullWidth
                          options={services}
                          getOptionLabel={(option) => `${option.code || ''} - ${option.name.toUpperCase()}`}
                          value={services.find(s => s.id === newAssignment.serviceId) || null}
                          onChange={(e, newsletter) => setNewAssignment({ ...newAssignment, serviceId: newsletter?.id || '' })}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Service"
                              placeholder="Search by name or code..."
                              sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 }
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <MenuItem {...props} key={option.id} sx={{ fontWeight: 700 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>{option.name.toUpperCase()}</Typography>
                                  <Typography variant="caption" color="text.disabled" fontWeight={800}>{option.code || 'NO CODE'}</Typography>
                                </Box>
                                <Typography variant="caption" color="secondary.main" fontWeight={800}>{option.price} Br</Typography>
                              </Box>
                            </MenuItem>
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontWeight: 800 }}>Staff</InputLabel>
                        <Select
                          value={newAssignment.employeeId}
                          onChange={(e) => setNewAssignment({ ...newAssignment, employeeId: e.target.value })}
                          label="Staff"
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          {employees.map(e => (
                            <MenuItem key={e.id} value={e.id} sx={{ fontWeight: 700 }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: '#1B1F3A', color: 'white' }}>{e.name[0]}</Avatar>
                                <Typography variant="body2" fontWeight={700}>{e.name.toUpperCase()}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth variant="contained" color="secondary"
                        onClick={createAssignment}
                        disabled={!newAssignment.employeeId || !newAssignment.serviceId || addingService}
                        sx={{ height: 56, fontWeight: 900, borderRadius: 1.5 }}
                        startIcon={addingService
                          ? <CircularProgress size={18} sx={{ color: 'inherit' }} />
                          : <Iconify icon="solar:bolt-circle-bold-duotone" />}
                      >
                        {addingService ? 'Adding…' : 'Add Now'}
                      </Button>
                    </Grid>
                  </Grid>
                </Card>

                {/* CURRENT SERVICES */}
                <Card sx={{ p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>Services</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Services added for this customer</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.disabled" fontWeight={800}>TOTAL</Typography>
                      <Typography variant="h4" fontWeight={900} color="#C8972A">{totalEstimation} Br</Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2}>
                    {assignments.map((a) => (
                      <Box key={a.id} sx={{
                        p: 2.5, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.05),
                        bgcolor: alpha(theme.palette.background.neutral, 0.3),
                        transition: '0.2s', '&:hover': { bgcolor: 'background.paper' }
                      }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ p: 1, bgcolor: '#1B1F3A', borderRadius: 1.2, color: '#C8972A' }}>
                                <Iconify icon="solar:hashtag-bold-duotone" width={18} />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={800}>
                                  {a.Services?.map(s => `${s.code ? '['+s.code+'] ' : ''}${s.name.toUpperCase()}`).join(', ') || 'Service'}
                                </Typography>
                                <Typography variant="caption" color="secondary.main" fontWeight={800}>
                                  {a.Services?.reduce((acc, s) => acc + Number(s.price), 0)} Br
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{
                                width: 32, height: 32,
                                bgcolor: a.Employee ? 'primary.main' : alpha(theme.palette.text.disabled, 0.2),
                                color: a.Employee ? 'white' : 'text.disabled',
                                fontWeight: 800, fontSize: '0.8rem',
                              }}>
                                {a.Employee?.name ? a.Employee.name[0] : '?'}
                              </Avatar>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                {a.Employee ? (
                                  <Typography variant="caption" fontWeight={800} display="block" color="text.secondary" noWrap>
                                    {a.Employee.name.toUpperCase()}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" fontWeight={800} display="block" color="warning.main">
                                    UNASSIGNED
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Chip
                                    label={a.status.toUpperCase()}
                                    size="small"
                                    color={a.status === 'completed' ? 'success' : a.status === 'in_progress' ? 'secondary' : 'info'}
                                    variant="soft"
                                    sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800 }}
                                  />
                                  {canReassign && a.status !== 'completed' && (
                                    <Tooltip title={a.Employee ? 'Reassign staff' : 'Assign staff'}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => { setReassignAnchor(e.currentTarget); setReassignTarget(a); }}
                                        sx={{ p: 0.25 }}
                                      >
                                        <Iconify icon="solar:pen-2-bold-duotone" width={14} sx={{ color: 'secondary.main' }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={5} sx={{ textAlign: 'right' }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {a.status !== 'completed' && (
                                <>
                                  <Button
                                    size="small" color="secondary"
                                    onClick={() => updateAssignmentStatus(a.id, 'in_progress')}
                                    disabled={a.status === 'in_progress' || statusBusyId === a.id}
                                    startIcon={statusBusyId === a.id ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : null}
                                  >
                                    Start
                                  </Button>
                                  <Button
                                    size="small" color="success"
                                    onClick={() => updateAssignmentStatus(a.id, 'completed')}
                                    disabled={statusBusyId === a.id}
                                    startIcon={statusBusyId === a.id ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : null}
                                  >
                                    Done
                                  </Button>
                                </>
                              )}
                              <Tooltip title="Remove Job">
                                <IconButton
                                  color="error"
                                  onClick={() => handleAction('delete-assignment', a.id)}
                                  size="small"
                                  disabled={a.status === 'completed' || deleteAssignmentId === a.id}
                                >
                                  {deleteAssignmentId === a.id
                                    ? <CircularProgress size={16} />
                                    : <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    {assignments.length === 0 && (
                      <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                        <Typography variant="caption" fontWeight={700}>No jobs added yet.</Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Stack>
            )
          ) : (
            /* HISTORY TAB */
            <Stack spacing={3}>
              {history.map((h) => (
                <Card key={h.id} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ p: 1, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', borderRadius: 1 }}>
                        <Iconify icon="solar:calendar-date-bold-duotone" width={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={900}>
                          {new Date(h.checkInTime).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>
                          {new Date(h.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                          {h.Branch && (
                            <Typography component="span" variant="caption" sx={{ color: 'secondary.main', fontWeight: 900, ml: 1, letterSpacing: 1 }}>
                              • {h.Branch.name.toUpperCase()}
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip label="COMPLETED" size="small" variant="soft" color="success" sx={{ fontWeight: 900, borderRadius: 0.5 }} />
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed', mb: 2.5 }} />

                  <Stack spacing={2}>
                    {h.Assignments?.map((a) => (
                      <Box key={a.id} sx={{ p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 1.5 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" fontWeight={800}>
                              {a.Services?.map(s => `${s.code ? '['+s.code+'] ' : ''}${s.name.toUpperCase()}`).join(', ') || 'Service'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                              Stylist: {a.Employee?.name || 'Unassigned'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight={900} color="secondary.main">
                              {a.Services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0)} ETB
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    {(!h.Assignments || h.Assignments.length === 0) && (
                      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>No services recorded for this visit.</Typography>
                    )}
                  </Stack>
                </Card>
              ))}
              {history.length === 0 && (
                <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                  <Iconify icon="solar:history-bold-duotone" width={48} sx={{ mb: 2, color: 'text.disabled' }} />
                  <Typography variant="h6" fontWeight={800} color="text.disabled">No visit history found</Typography>
                </Box>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirm.open}
        title={
          confirm.type === 'check-in' ? 'Check In?' :
            confirm.type === 'finish-session' ? 'Finish & Pay?' :
              confirm.type === 'cancel-session' ? 'Cancel Visit?' : 'Remove?'
        }
        content={
          confirm.type === 'check-in' ? 'Are you sure you want to check in this customer?' :
            confirm.type === 'finish-session' ? (
              <Box>
                <Typography variant="body1" mb={2}>This will finish the visit and generate the final bill.</Typography>
                <Box sx={{ p: 2, bgcolor: alpha('#C8972A', 0.1), borderRadius: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={900} color="text.disabled">TOTAL AMOUNT DUE</Typography>
                  <Typography variant="h3" fontWeight={900} color="#C8972A">{totalEstimation} Br</Typography>
                </Box>
              </Box>
            ) :
              confirm.type === 'cancel-session' ? 'Are you sure you want to cancel this visit?' : 'Are you sure you want to remove this?'
        }
        confirmLabel={
          confirm.type === 'check-in' ? 'Check In' :
            confirm.type === 'finish-session' ? 'COMPLETE & PAY' :
              confirm.type === 'cancel-session' ? 'Cancel' : 'Remove'
        }
        color={confirm.type === 'check-in' ? 'primary' : confirm.type === 'finish-session' ? 'secondary' : 'error'}
        onConfirm={executeAction}
        onClose={() => setConfirm({ ...confirm, open: false })}
      />

      {/* BRANCH SELECTION DIALOG */}
      <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)}>
         <DialogTitle sx={{ fontWeight: 900 }}>Select Branch</DialogTitle>
         <DialogContent sx={{ minWidth: 400, pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 3, fontWeight: 700, color: 'text.secondary' }}>
               You are currently in 'All Locations' view. Please select which branch {customer.name.toUpperCase()} is visiting.
            </Typography>
            <FormControl fullWidth>
               <InputLabel sx={{ fontWeight: 700 }}>Branch</InputLabel>
               <Select
                  value={selectedCheckInBranch}
                  onChange={(e) => setSelectedCheckInBranch(e.target.value)}
                  label="Branch"
                  sx={{ borderRadius: 1.5, fontWeight: 800 }}
               >
                  {branches.map(b => (
                     <MenuItem key={b.id} value={b.id} sx={{ fontWeight: 700 }}>{b.name.toUpperCase()}</MenuItem>
                  ))}
               </Select>
            </FormControl>
         </DialogContent>
         <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setBranchDialogOpen(false)} sx={{ fontWeight: 900, color: 'text.secondary' }}>CANCEL</Button>
            <Button 
               variant="contained" color="secondary" 
               disabled={!selectedCheckInBranch}
               onClick={() => handleCheckIn(selectedCheckInBranch)}
               sx={{ fontWeight: 900, px: 4 }}
            >
               CHECK IN AT BRANCH
            </Button>
         </DialogActions>
      </Dialog>

      {/* RECEIPT DIALOG */}
      <Dialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)',
            backgroundSize: '4px 4px',
            bgcolor: 'white',
            boxShadow: theme.customShadows.z24,
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10, left: 0, right: 0, height: 10,
              backgroundImage: 'linear-gradient(135deg, white 5px, transparent 0), linear-gradient(-135deg, white 5px, transparent 0)',
              backgroundSize: '10px 10px',
              backgroundPosition: '0 100%'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10, left: 0, right: 0, height: 10,
              backgroundImage: 'linear-gradient(45deg, white 5px, transparent 0), linear-gradient(-45deg, white 5px, transparent 0)',
              backgroundSize: '10px 10px',
              backgroundPosition: '0 0%'
            }
          }
        }}
      >
        {receiptData && (
          <DialogContent id="printable-bill" sx={{ p: { xs: 3.5, sm: 4.5 }, fontVariantNumeric: 'tabular-nums' }}>
            {/* Brand header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 34, lineHeight: 1, letterSpacing: '-0.04em', color: '#1B1F3A' }}>
                MILANA<Box component="span" sx={{ color: '#C8972A' }}>.</Box>
              </Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.42em', color: 'text.secondary', mt: 0.75, ml: '0.42em' }}>
                BOUTIQUE SALON
              </Typography>
            </Box>

            <Box sx={{ height: 3, borderRadius: 3, bgcolor: '#C8972A', mb: 2.5 }} />

            {/* Meta row */}
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>RECEIPT</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#1B1F3A' }}>
                #MIL-{String(receiptData.session?.id || 0).padStart(5, '0')}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>BRANCH</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'secondary.main', letterSpacing: 0.5 }}>
                {(receiptData.session?.Branch?.name || localStorage.getItem('selectedBranchName') || 'Main Branch').toUpperCase()}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>DATE</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                {receiptData.date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })} · {receiptData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 2.5 }} />

            {/* Billed to */}
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>BILLED TO</Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#1B1F3A' }}>{receiptData.customer.name.toUpperCase()}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{receiptData.customer.phone}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 2.5 }} />

            {/* Items with dotted leaders */}
            <Stack spacing={1.75}>
              {receiptData.assignments.map((a, i) => {
                const line = a.Services?.reduce((sum, s) => sum + Number(s.price), 0) || 0;
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1B1F3A', lineHeight: 1.3 }}>
                        {a.Services?.map(s => `${s.name.toUpperCase()}`).join(', ') || 'SERVICE'}
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled' }}>
                        by {a.Employee?.name || 'Unassigned'}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, borderBottom: '1px dotted', borderColor: 'divider', mb: '5px' }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#1B1F3A', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {line.toLocaleString()} Br
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            {/* Total band */}
            <Box sx={{
              mt: 3, px: 2.5, py: 2, borderRadius: 2, bgcolor: '#1B1F3A',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5 }}>TOTAL</Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 900, color: '#C8972A', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {Number(receiptData.total).toLocaleString()} Br
              </Typography>
            </Box>

            {/* Payment + PAID stamp */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>PAID VIA</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#1B1F3A' }}>
                  {receiptData.paymentMethod
                    ? `${receiptData.paymentMethod.name.toUpperCase()}${receiptData.paymentMethod.accountInfo ? ` · ${receiptData.paymentMethod.accountInfo}` : ''}`
                    : 'CASH'}
                </Typography>
              </Box>
              <Box sx={{
                px: 1.5, py: 0.5, border: '2px solid', borderColor: 'success.main', borderRadius: 1,
                transform: 'rotate(-6deg)', color: 'success.main',
              }}>
                <Typography sx={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>PAID</Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Iconify icon="solar:scissors-bold-duotone" width={22} sx={{ color: 'divider' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5, mt: 1 }}>
                THANK YOU — SEE YOU SOON
              </Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained" color="secondary" size="large"
            onClick={() => setReceiptOpen(false)}
            sx={{ fontWeight: 900, px: 6, borderRadius: 1.5 }}
          >
            DONE
          </Button>
          <Button
            variant="soft" color="inherit" size="large"
            onClick={() => window.print()}
            startIcon={<Iconify icon="solar:printer-minimalistic-bold-duotone" />}
            sx={{ fontWeight: 900, borderRadius: 1.5 }}
          >
            PRINT
          </Button>
        </DialogActions>
      </Dialog>

      {/* REASSIGN EMPLOYEE MENU */}
      <Menu
        anchorEl={reassignAnchor}
        open={Boolean(reassignAnchor)}
        onClose={() => { setReassignAnchor(null); setReassignTarget(null); }}
        PaperProps={{ sx: { maxHeight: 360, minWidth: 240, borderRadius: 2 } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight={900} color="text.disabled" letterSpacing={1}>
            ASSIGN STAFF
          </Typography>
        </Box>
        {employees.length === 0 && (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="caption" color="text.disabled">No staff available</Typography>
          </Box>
        )}
        {employees.map((emp) => {
          const isCurrent = reassignTarget?.Employee?.id === emp.id;
          return (
            <MenuItem
              key={emp.id}
              selected={isCurrent}
              disabled={reassignSaving}
              onClick={() => reassignTarget && reassignEmployee(reassignTarget.id, emp.id)}
              sx={{ fontWeight: 700, py: 1 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#1B1F3A', color: 'white' }}>
                  {emp.name[0]}
                </Avatar>
                <Typography variant="body2" fontWeight={700} sx={{ flexGrow: 1 }}>
                  {emp.name.toUpperCase()}
                </Typography>
                {isCurrent && <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />}
              </Stack>
            </MenuItem>
          );
        })}
      </Menu>

      {/* FINISH & PAY — PAYMENT METHOD PICKER */}
      <Dialog open={payOpen} onClose={() => !finishing && setPayOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {payStep === 1 ? (
          <>
            <DialogTitle sx={{ fontWeight: 900, bgcolor: '#1B1F3A', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Iconify icon="solar:wallet-money-bold-duotone" />
              How was the payment received?
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Box sx={{ p: 2.5, bgcolor: alpha('#C8972A', 0.08), borderRadius: 2, textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" fontWeight={900} color="text.disabled" letterSpacing={1}>TOTAL DUE</Typography>
                <Typography variant="h3" fontWeight={900} color="#C8972A">{totalEstimation} Br</Typography>
              </Box>
              {paymentMethods.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                  <Iconify icon="solar:card-search-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" fontWeight={800} color="text.disabled">No payment methods configured</Typography>
                  <Typography variant="caption" color="text.disabled">Admin can set them up in Settings.</Typography>
                </Box>
              ) : (
                <RadioGroup value={selectedPaymentMethodId} onChange={(e) => setSelectedPaymentMethodId(Number(e.target.value))}>
                  <Stack spacing={1.5}>
                    {paymentMethods.map((pm) => {
                      const selected = selectedPaymentMethodId === pm.id;
                      return (
                        <Card
                          key={pm.id}
                          onClick={() => setSelectedPaymentMethodId(pm.id)}
                          sx={{
                            p: 2, cursor: 'pointer', borderRadius: 2,
                            border: '2px solid',
                            borderColor: selected ? '#C8972A' : alpha(theme.palette.divider, 0.15),
                            bgcolor: selected ? alpha('#C8972A', 0.05) : 'background.paper',
                            transition: '0.2s',
                            '&:hover': { borderColor: '#C8972A' },
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Radio checked={selected} value={pm.id} sx={{ p: 0.5 }} />
                            {pm.logoUrl ? (
                              <Avatar
                                src={`${config.BASE_URL}${pm.logoUrl}`}
                                variant="rounded"
                                sx={{ width: 44, height: 44, bgcolor: 'background.neutral' }}
                              />
                            ) : (
                              <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: '#1B1F3A', color: '#C8972A' }}>
                                <Iconify icon={pm.type === 'cash' ? 'solar:wallet-bold-duotone' : 'solar:card-bold-duotone'} />
                              </Avatar>
                            )}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" fontWeight={900}>{pm.name}</Typography>
                              {pm.accountInfo && (
                                <Typography variant="caption" color="text.secondary" fontWeight={700} noWrap>
                                  {pm.accountInfo}
                                </Typography>
                              )}
                            </Box>
                            <Chip label={pm.type === 'cash' ? 'CASH' : 'BANK'} size="small" variant="soft" color={pm.type === 'cash' ? 'success' : 'info'} sx={{ fontWeight: 800 }} />
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setPayOpen(false)} sx={{ fontWeight: 900, color: 'text.secondary' }}>CANCEL</Button>
              <Button
                variant="contained" color="secondary"
                onClick={() => setPayStep(2)}
                disabled={!selectedPaymentMethodId}
                sx={{ fontWeight: 900, px: 4 }}
              >
                CONTINUE
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ fontWeight: 900, bgcolor: '#1B1F3A', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Iconify icon="solar:bill-check-bold-duotone" sx={{ color: '#C8972A' }} />
              Confirm & Close Visit
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Typography variant="body1" fontWeight={700} mb={3}>
                Once you confirm, this visit will be closed and you <strong>cannot modify it</strong>. The system will record:
              </Typography>
              {(() => {
                const m = paymentMethods.find(p => p.id === selectedPaymentMethodId);
                return (
                  <Box sx={{ p: 3, bgcolor: alpha('#1B1F3A', 0.04), borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                      <Typography variant="caption" fontWeight={800} color="text.disabled">CUSTOMER</Typography>
                      <Typography variant="subtitle2" fontWeight={900}>{customer.name.toUpperCase()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                      <Typography variant="caption" fontWeight={800} color="text.disabled">AMOUNT</Typography>
                      <Typography variant="subtitle2" fontWeight={900} color="secondary.main">{totalEstimation} Br</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight={800} color="text.disabled">RECEIVED VIA</Typography>
                      <Typography variant="subtitle2" fontWeight={900}>
                        {m ? `${m.name}${m.accountInfo ? ` • ${m.accountInfo}` : ''}` : '—'}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })()}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setPayStep(1)} disabled={finishing} sx={{ fontWeight: 900, color: 'text.secondary' }}>BACK</Button>
              <Button
                variant="contained" color="secondary"
                onClick={finalizePayment}
                disabled={finishing}
                startIcon={finishing ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <Iconify icon="solar:check-circle-bold-duotone" />}
                sx={{ fontWeight: 900, px: 4 }}
              >
                {finishing ? 'CLOSING…' : 'CONFIRM & CLOSE'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
          @media print {
            body * { visibility: hidden; }
            #printable-bill, #printable-bill * { visibility: visible; }
            #printable-bill { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
            .MuiBackdrop-root { display: none !important; }
          }
        `}
      </style>
    </Box>
  );
}
