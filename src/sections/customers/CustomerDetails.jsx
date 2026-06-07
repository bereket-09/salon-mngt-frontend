import React, { useEffect, useState } from 'react';
import {
  Card,
  Stack,
  Typography,
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

  // Editorial micro-label: uppercase, tracked, 11px/700
  const microLabel = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'text.disabled',
    lineHeight: 1.5,
  };
  // Flat card: white, 1px hairline border, radius 6, minimal shadow
  const flatCard = {
    borderRadius: '6px',
    boxShadow: 'none',
    border: '1px solid',
    borderColor: alpha(theme.palette.divider, 0.18),
    bgcolor: 'background.paper',
  };
  const tabularNums = { fontVariantNumeric: 'tabular-nums' };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* LEFT: CUSTOMER PROFILE — calm flat panel */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Card sx={{ ...flatCard, p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack spacing={3.5}>
              <Box sx={{ textAlign: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box sx={{
                      width: 16, height: 16, borderRadius: '50%',
                      bgcolor: session ? 'success.main' : 'text.disabled',
                      border: '3px solid', borderColor: 'background.paper',
                    }} />
                  }
                >
                  <Avatar sx={{
                    width: 88, height: 88, mx: 'auto', bgcolor: 'primary.main', color: 'common.white',
                    fontFamily: theme.typography.h3.fontFamily, fontSize: '2rem', fontWeight: 600,
                  }}>
                    {customer.name[0]}
                  </Avatar>
                </Badge>
                <Typography variant="h4" sx={{ mt: 2.5, color: 'primary.main' }}>{customer.name}</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" mt={1.5}>
                  <Typography sx={{ ...microLabel, color: session ? 'success.main' : 'text.disabled' }}>
                    {session ? 'In Salon' : 'Checked Out'}
                  </Typography>
                </Stack>
              </Box>

              <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.18) }} />

              {/* Quiet meta rows */}
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Iconify icon="solar:phone-linear" width={20} sx={{ color: 'secondary.main', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={microLabel}>Phone</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: 'primary.main' }}>{customer.phone || 'N/A'}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Iconify icon="solar:map-point-linear" width={20} sx={{ color: 'secondary.main', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={microLabel}>Branch</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: 'primary.main' }}>{currentBranch}</Typography>
                  </Box>
                </Stack>
              </Stack>

              <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.18) }} />

              {/* Clear primary action */}
              <Stack spacing={1.5}>
                {!session ? (
                  <Button
                    fullWidth variant="contained" color="primary" size="large"
                    onClick={() => handleAction('check-in')}
                    disabled={actionBusy}
                    sx={{ minHeight: 52, fontWeight: 600, letterSpacing: '0.02em', borderRadius: '6px', boxShadow: 'none' }}
                    startIcon={actionBusy
                      ? <CircularProgress size={20} sx={{ color: 'inherit' }} />
                      : <Iconify icon="solar:login-3-linear" />}
                  >
                    {actionBusy ? 'Checking in…' : 'Check In'}
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth variant="contained" color="secondary" size="large"
                      onClick={openPayDialog}
                      disabled={actionBusy}
                      sx={{ minHeight: 52, fontWeight: 600, letterSpacing: '0.02em', borderRadius: '6px', boxShadow: 'none' }}
                      startIcon={<Iconify icon="solar:bill-check-linear" />}
                    >
                      Finish & Pay
                    </Button>
                    {!hasCompletedJobs ? (
                      <Button
                        fullWidth variant="outlined" color="error"
                        onClick={() => handleAction('cancel-session')}
                        disabled={actionBusy}
                        startIcon={actionBusy ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : null}
                        sx={{ minHeight: 44, fontWeight: 600, borderRadius: '6px', borderColor: alpha(theme.palette.error.main, 0.4) }}
                      >
                        {actionBusy ? 'Working…' : 'Cancel Visit'}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ fontStyle: 'italic', px: 1 }}>
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
        <Grid item xs={12} md={8} lg={8.5}>
          <Box sx={{ mb: 3, display: 'flex', gap: { xs: 2, sm: 4 }, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.18) }}>
            <Button
              disableRipple
              onClick={() => setTab('active')}
              sx={{
                py: 1.5, px: 0, minWidth: 0, borderRadius: 0,
                ...microLabel, fontSize: 12,
                color: tab === 'active' ? 'primary.main' : 'text.disabled',
                borderBottom: '2px solid',
                borderColor: tab === 'active' ? 'secondary.main' : 'transparent',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            >
              Active Now
            </Button>
            <Button
              disableRipple
              onClick={() => setTab('history')}
              sx={{
                py: 1.5, px: 0, minWidth: 0, borderRadius: 0,
                ...microLabel, fontSize: 12,
                color: tab === 'history' ? 'primary.main' : 'text.disabled',
                borderBottom: '2px solid',
                borderColor: tab === 'history' ? 'secondary.main' : 'transparent',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            >
              Visit History
            </Button>
          </Box>

          {tab === 'active' ? (
            !session ? (
              <Box sx={{
                ...flatCard, minHeight: 380, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center',
              }}>
                <Iconify icon="solar:moon-sleep-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" sx={{ color: 'primary.main' }}>No active visit</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
                  Check in the customer to add services.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {/* ADD SERVICE */}
                <Card sx={{ ...flatCard, p: { xs: 2.5, sm: 3 } }}>
                  <Typography sx={{ ...microLabel, fontSize: 12, mb: 2.5 }}>Add Service</Typography>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={5}>
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
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <MenuItem {...props} key={option.id}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                                  <Typography sx={{ ...microLabel, fontSize: 10 }}>{option.code || 'NO CODE'}</Typography>
                                </Box>
                                <Typography variant="caption" color="secondary.main" fontWeight={700} sx={tabularNums}>{option.price} Br</Typography>
                              </Box>
                            </MenuItem>
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Staff</InputLabel>
                        <Select
                          value={newAssignment.employeeId}
                          onChange={(e) => setNewAssignment({ ...newAssignment, employeeId: e.target.value })}
                          label="Staff"
                          sx={{ borderRadius: '6px' }}
                        >
                          {employees.map(e => (
                            <MenuItem key={e.id} value={e.id}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: 'primary.main', color: 'common.white' }}>{e.name[0]}</Avatar>
                                <Typography variant="body2" fontWeight={500}>{e.name}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth variant="contained" color="primary"
                        onClick={createAssignment}
                        disabled={!newAssignment.employeeId || !newAssignment.serviceId || addingService}
                        sx={{ minHeight: 53, fontWeight: 600, borderRadius: '6px', boxShadow: 'none' }}
                        startIcon={addingService
                          ? <CircularProgress size={18} sx={{ color: 'inherit' }} />
                          : <Iconify icon="solar:add-circle-linear" />}
                      >
                        {addingService ? 'Adding…' : 'Add'}
                      </Button>
                    </Grid>
                  </Grid>
                </Card>

                {/* CURRENT SERVICES — flat, hairline-separated rows */}
                <Card sx={{ ...flatCard, p: { xs: 2.5, sm: 3 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={2.5}>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'primary.main' }}>Services</Typography>
                      <Typography variant="caption" color="text.secondary">Added for this visit</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={microLabel}>Total</Typography>
                      <Typography variant="h4" sx={{ color: 'secondary.main', ...tabularNums }}>{totalEstimation} Br</Typography>
                    </Box>
                  </Stack>

                  <Stack divider={<Divider sx={{ borderColor: alpha(theme.palette.divider, 0.18) }} />}>
                    {assignments.map((a) => (
                      <Box key={a.id} sx={{ py: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={5}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'primary.main' }}>
                              {a.Services?.map(s => `${s.code ? '['+s.code+'] ' : ''}${s.name}`).join(', ') || 'Service'}
                            </Typography>
                            <Typography variant="caption" color="secondary.main" fontWeight={600} sx={tabularNums}>
                              {a.Services?.reduce((acc, s) => acc + Number(s.price), 0)} Br
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Avatar sx={{
                                width: 30, height: 30,
                                bgcolor: a.Employee ? 'primary.main' : alpha(theme.palette.text.disabled, 0.18),
                                color: a.Employee ? 'common.white' : 'text.disabled',
                                fontWeight: 600, fontSize: '0.75rem',
                              }}>
                                {a.Employee?.name ? a.Employee.name[0] : '?'}
                              </Avatar>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                {a.Employee ? (
                                  <Typography sx={{ ...microLabel, fontSize: 10, color: 'text.secondary' }} noWrap>
                                    {a.Employee.name}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ ...microLabel, fontSize: 10, color: 'warning.main' }}>
                                    Unassigned
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography sx={{
                                    ...microLabel, fontSize: 9,
                                    color: a.status === 'completed' ? 'success.main' : a.status === 'in_progress' ? 'secondary.main' : 'info.main',
                                  }}>
                                    {a.status.replace('_', ' ')}
                                  </Typography>
                                  {canReassign && a.status !== 'completed' && (
                                    <IconButton
                                      size="small"
                                      aria-label={a.Employee ? 'Reassign staff' : 'Assign staff'}
                                      onClick={(e) => { setReassignAnchor(e.currentTarget); setReassignTarget(a); }}
                                      sx={{ p: 0.5 }}
                                    >
                                      <Iconify icon="solar:pen-2-linear" width={14} sx={{ color: 'secondary.main' }} />
                                    </IconButton>
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} flexWrap="wrap" useFlexGap>
                              {a.status !== 'completed' && (
                                <>
                                  <Button
                                    size="small" variant="outlined" color="secondary"
                                    onClick={() => updateAssignmentStatus(a.id, 'in_progress')}
                                    disabled={a.status === 'in_progress' || statusBusyId === a.id}
                                    startIcon={statusBusyId === a.id ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : null}
                                    sx={{ minHeight: 36, borderRadius: '6px', fontWeight: 600, borderColor: alpha(theme.palette.secondary.main, 0.4) }}
                                  >
                                    Start
                                  </Button>
                                  <Button
                                    size="small" variant="contained" color="success"
                                    onClick={() => updateAssignmentStatus(a.id, 'completed')}
                                    disabled={statusBusyId === a.id}
                                    startIcon={statusBusyId === a.id ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : null}
                                    sx={{ minHeight: 36, borderRadius: '6px', fontWeight: 600, boxShadow: 'none' }}
                                  >
                                    Done
                                  </Button>
                                </>
                              )}
                              <IconButton
                                color="error"
                                aria-label="Remove job"
                                onClick={() => handleAction('delete-assignment', a.id)}
                                disabled={a.status === 'completed' || deleteAssignmentId === a.id}
                                sx={{ width: 36, height: 36 }}
                              >
                                {deleteAssignmentId === a.id
                                  ? <CircularProgress size={16} />
                                  : <Iconify icon="solar:trash-bin-trash-linear" width={18} />}
                              </IconButton>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    {assignments.length === 0 && (
                      <Box sx={{ py: 5, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.disabled">No jobs added yet.</Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              </Stack>
            )
          ) : (
            /* HISTORY TAB */
            <Stack spacing={2.5}>
              {history.map((h) => (
                <Card key={h.id} sx={{ ...flatCard, p: { xs: 2.5, sm: 3 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2} spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h5" sx={{ color: 'primary.main' }}>
                        {new Date(h.checkInTime).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography sx={{ ...microLabel, fontSize: 10, mt: 0.25 }}>
                        {new Date(h.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                        {h.Branch && (
                          <Box component="span" sx={{ color: 'secondary.main', ml: 0.75 }}>
                            · {h.Branch.name}
                          </Box>
                        )}
                      </Typography>
                    </Box>
                    <Typography sx={{ ...microLabel, fontSize: 10, color: 'success.main', flexShrink: 0 }}>Completed</Typography>
                  </Stack>

                  <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.18), mb: 1 }} />

                  <Stack divider={<Divider sx={{ borderColor: alpha(theme.palette.divider, 0.18) }} />}>
                    {h.Assignments?.map((a) => (
                      <Box key={a.id} sx={{ py: 1.5 }}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs={8} sm={9}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'primary.main' }}>
                              {a.Services?.map(s => `${s.code ? '['+s.code+'] ' : ''}${s.name}`).join(', ') || 'Service'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {a.Employee?.name || 'Unassigned'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sm={3} sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={tabularNums}>
                              {a.Services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0)} Br
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    {(!h.Assignments || h.Assignments.length === 0) && (
                      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', py: 1.5 }}>No services recorded for this visit.</Typography>
                    )}
                  </Stack>
                </Card>
              ))}
              {history.length === 0 && (
                <Box sx={{ ...flatCard, py: 8, textAlign: 'center' }}>
                  <Iconify icon="solar:history-linear" width={44} sx={{ mb: 1.5, color: 'text.disabled' }} />
                  <Typography variant="h6" color="text.disabled">No visit history found</Typography>
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
                <Box sx={{ p: 2.5, border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.3), borderRadius: '6px', textAlign: 'center' }}>
                  <Typography sx={microLabel}>Total Amount Due</Typography>
                  <Typography variant="h3" sx={{ color: 'secondary.main', ...tabularNums }}>{totalEstimation} Br</Typography>
                </Box>
              </Box>
            ) :
              confirm.type === 'cancel-session' ? 'Are you sure you want to cancel this visit?' : 'Are you sure you want to remove this?'
        }
        confirmLabel={
          confirm.type === 'check-in' ? 'Check In' :
            confirm.type === 'finish-session' ? 'Complete & Pay' :
              confirm.type === 'cancel-session' ? 'Cancel' : 'Remove'
        }
        color={confirm.type === 'check-in' ? 'primary' : confirm.type === 'finish-session' ? 'secondary' : 'error'}
        onConfirm={executeAction}
        onClose={() => setConfirm({ ...confirm, open: false })}
      />

      {/* BRANCH SELECTION DIALOG */}
      <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '6px' } }}>
         <DialogTitle variant="h5" sx={{ color: 'primary.main' }}>Select Branch</DialogTitle>
         <DialogContent sx={{ pt: '8px !important' }}>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
               You are currently in &lsquo;All Locations&rsquo; view. Please select which branch {customer.name} is visiting.
            </Typography>
            <FormControl fullWidth>
               <InputLabel>Branch</InputLabel>
               <Select
                  value={selectedCheckInBranch}
                  onChange={(e) => setSelectedCheckInBranch(e.target.value)}
                  label="Branch"
                  sx={{ borderRadius: '6px' }}
               >
                  {branches.map(b => (
                     <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
               </Select>
            </FormControl>
         </DialogContent>
         <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setBranchDialogOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
            <Button
               variant="contained" color="primary"
               disabled={!selectedCheckInBranch}
               onClick={() => handleCheckIn(selectedCheckInBranch)}
               sx={{ fontWeight: 600, px: 3, borderRadius: '6px', boxShadow: 'none' }}
            >
               Check In
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
            borderRadius: '6px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.18),
            boxShadow: 'none',
          }
        }}
      >
        {receiptData && (
          <DialogContent id="printable-bill" sx={{ p: { xs: 3.5, sm: 4.5 }, fontVariantNumeric: 'tabular-nums' }}>
            {/* Brand header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 34, lineHeight: 1, letterSpacing: '-0.04em', color: '#1A1A1A' }}>
                MILANA<Box component="span" sx={{ color: '#9A7B4F' }}>.</Box>
              </Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.42em', color: 'text.secondary', mt: 0.75, ml: '0.42em' }}>
                BOUTIQUE SALON
              </Typography>
            </Box>

            <Box sx={{ height: 3, borderRadius: 3, bgcolor: '#9A7B4F', mb: 2.5 }} />

            {/* Meta row */}
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>RECEIPT</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#1A1A1A' }}>
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
                <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#1A1A1A' }}>{receiptData.customer.name.toUpperCase()}</Typography>
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
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3 }}>
                        {a.Services?.map(s => `${s.name.toUpperCase()}`).join(', ') || 'SERVICE'}
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled' }}>
                        by {a.Employee?.name || 'Unassigned'}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, borderBottom: '1px dotted', borderColor: 'divider', mb: '5px' }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#1A1A1A', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {line.toLocaleString()} Br
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            {/* Total band */}
            <Box sx={{
              mt: 3, px: 2.5, py: 2, borderRadius: '6px', bgcolor: '#1A1A1A',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5 }}>TOTAL</Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 900, color: '#9A7B4F', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {Number(receiptData.total).toLocaleString()} Br
              </Typography>
            </Box>

            {/* Payment + PAID stamp */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>PAID VIA</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#1A1A1A' }}>
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
              <Iconify icon="solar:scissors-linear" width={22} sx={{ color: 'divider' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5, mt: 1 }}>
                THANK YOU — SEE YOU SOON
              </Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 4 }}>
          <Button
            variant="contained" color="primary" size="large"
            onClick={() => setReceiptOpen(false)}
            sx={{ fontWeight: 600, px: 5, borderRadius: '6px', boxShadow: 'none' }}
          >
            Done
          </Button>
          <Button
            variant="outlined" color="primary" size="large"
            onClick={() => window.print()}
            startIcon={<Iconify icon="solar:printer-minimalistic-linear" />}
            sx={{ fontWeight: 600, borderRadius: '6px', borderColor: alpha(theme.palette.divider, 0.4) }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* REASSIGN EMPLOYEE MENU */}
      <Menu
        anchorEl={reassignAnchor}
        open={Boolean(reassignAnchor)}
        onClose={() => { setReassignAnchor(null); setReassignTarget(null); }}
        PaperProps={{ sx: { maxHeight: 360, minWidth: 240, borderRadius: '6px', boxShadow: theme.customShadows.z8, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.18) } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.18) }}>
          <Typography sx={microLabel}>Assign Staff</Typography>
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
              sx={{ py: 1.25, minHeight: 44 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: 'primary.main', color: 'common.white' }}>
                  {emp.name[0]}
                </Avatar>
                <Typography variant="body2" fontWeight={500} sx={{ flexGrow: 1 }}>
                  {emp.name}
                </Typography>
                {isCurrent && <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />}
              </Stack>
            </MenuItem>
          );
        })}
      </Menu>

      {/* FINISH & PAY — PAYMENT METHOD PICKER */}
      <Dialog open={payOpen} onClose={() => !finishing && setPayOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '6px', boxShadow: theme.customShadows.z16 } }}>
        {payStep === 1 ? (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', pb: 1 }}>
              <Iconify icon="solar:wallet-money-linear" sx={{ color: 'secondary.main' }} />
              <Typography variant="h5" component="span">How was the payment received?</Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2.5, border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.3), borderRadius: '6px', textAlign: 'center', mb: 3, mt: 1 }}>
                <Typography sx={microLabel}>Total Due</Typography>
                <Typography variant="h3" sx={{ color: 'secondary.main', ...tabularNums }}>{totalEstimation} Br</Typography>
              </Box>
              {paymentMethods.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.18), borderRadius: '6px' }}>
                  <Iconify icon="solar:card-search-linear" width={44} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600} color="text.secondary">No payment methods configured</Typography>
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
                            p: 2, cursor: 'pointer', borderRadius: '6px', boxShadow: 'none',
                            border: '1px solid',
                            borderColor: selected ? 'secondary.main' : alpha(theme.palette.divider, 0.18),
                            bgcolor: selected ? alpha(theme.palette.secondary.main, 0.05) : 'background.paper',
                            transition: '0.15s',
                            '&:hover': { borderColor: 'secondary.main' },
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
                              <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'primary.main', color: 'secondary.main' }}>
                                <Iconify icon={pm.type === 'cash' ? 'solar:wallet-linear' : 'solar:card-linear'} />
                              </Avatar>
                            )}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'primary.main' }}>{pm.name}</Typography>
                              {pm.accountInfo && (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {pm.accountInfo}
                                </Typography>
                              )}
                            </Box>
                            <Typography sx={{ ...microLabel, fontSize: 10, color: pm.type === 'cash' ? 'success.main' : 'info.main' }}>
                              {pm.type === 'cash' ? 'Cash' : 'Bank'}
                            </Typography>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setPayOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
              <Button
                variant="contained" color="primary"
                onClick={() => setPayStep(2)}
                disabled={!selectedPaymentMethodId}
                sx={{ fontWeight: 600, px: 3, borderRadius: '6px', boxShadow: 'none' }}
              >
                Continue
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main', pb: 1 }}>
              <Iconify icon="solar:bill-check-linear" sx={{ color: 'secondary.main' }} />
              <Typography variant="h5" component="span">Confirm & Close Visit</Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" mb={3} mt={1} color="text.secondary">
                Once you confirm, this visit will be closed and you <Box component="strong" sx={{ color: 'primary.main' }}>cannot modify it</Box>. The system will record:
              </Typography>
              {(() => {
                const m = paymentMethods.find(p => p.id === selectedPaymentMethodId);
                return (
                  <Box sx={{ p: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.18), borderRadius: '6px' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography sx={microLabel}>Customer</Typography>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'primary.main' }}>{customer.name}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography sx={microLabel}>Amount</Typography>
                      <Typography variant="subtitle2" fontWeight={600} color="secondary.main" sx={tabularNums}>{totalEstimation} Br</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={microLabel}>Received Via</Typography>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'primary.main' }}>
                        {m ? `${m.name}${m.accountInfo ? ` · ${m.accountInfo}` : ''}` : '—'}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })()}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setPayStep(1)} disabled={finishing} sx={{ fontWeight: 600, color: 'text.secondary' }}>Back</Button>
              <Button
                variant="contained" color="secondary"
                onClick={finalizePayment}
                disabled={finishing}
                startIcon={finishing ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <Iconify icon="solar:check-circle-linear" />}
                sx={{ fontWeight: 600, px: 3, borderRadius: '6px', boxShadow: 'none' }}
              >
                {finishing ? 'Closing…' : 'Confirm & Close'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style>
        {`
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
