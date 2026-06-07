import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  MenuItem,
  ListSubheader,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Grid,
  alpha,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

const GOLD = '#9A7B4F';
const NAVY = '#1A1A1A';

const ROLE_META = {
  admin: { label: 'Admin', color: '#D14343', muiColor: 'error' },
  receptionist: { label: 'Receptionist', color: '#1C7ED6', muiColor: 'info' },
  employee: { label: 'Employee', color: GOLD, muiColor: 'secondary' },
};

const roleMeta = (role) => ROLE_META[role] || { label: role, color: GOLD, muiColor: 'secondary' };

export default function UserManagement() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]); // tree: supers with Children
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const emptyForm = {
    name: '',
    username: '',
    phone: '',
    password: '',
    role: 'employee',
    status: 'active',
    branchIds: [],
    categoryIds: [],
    commissionEnabled: false,
    commissionRate: 10,
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, bRes, cRes] = await Promise.all([
        fetch(`${config.BASE_URL}/users`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/branches`, { ...auth, cache: 'no-store' }),
        fetch(`${config.BASE_URL}/service-categories?tree=1`, { ...auth, cache: 'no-store' }),
      ]);
      setUsers(await uRes.json() || []);
      setBranches(await bRes.json() || []);
      setCategories(await cRes.json() || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.username) return;
    setSaving(true);
    try {
      const url = editingUser ? `${config.BASE_URL}/users/${editingUser.id}` : `${config.BASE_URL}/auth/register`;
      const method = editingUser ? 'PUT' : 'POST';
      const rate = Math.max(1, Math.min(99, Math.round(Number(form.commissionRate || 10))));
      const body = {
        ...form,
        branchIds: form.branchIds,
        commissionEnabled: !!form.commissionEnabled,
        commissionRate: form.commissionEnabled ? rate : null,
        password: (form.password && form.password.trim() !== '') ? form.password : (editingUser ? undefined : 'Milan@123')
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setForm(emptyForm);
        setEditingUser(null);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusUpdate = async (id, newStatus) => {
    try {
      await fetch(`${config.BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      username: u.username,
      phone: u.phone || '',
      password: '',
      role: u.role,
      status: u.status,
      branchIds: u.Branches ? u.Branches.map(b => b.id) : (u.BranchId ? [u.BranchId] : []),
      categoryIds: u.Specialties ? u.Specialties.map(c => c.id) : [],
      commissionEnabled: !!u.commissionEnabled,
      commissionRate: u.commissionRate ? Math.round(Number(u.commissionRate)) : 10,
    });
  };

  // name lookup for a category id across the super/sub tree
  const categoryName = (id) => {
    for (const sup of categories) {
      if (sup.id === id) return sup.name;
      const child = (sup.Children || []).find((c) => c.id === id);
      if (child) return child.name;
    }
    return null;
  };

  const renderSpecialtyOptions = () => {
    const out = [];
    categories.forEach((sup) => {
      out.push(<ListSubheader key={`h-${sup.id}`} sx={{ fontWeight: 900, color: 'secondary.main', lineHeight: '36px' }}>{sup.name}</ListSubheader>);
      out.push(<MenuItem key={`s-${sup.id}`} value={sup.id} sx={{ fontWeight: 800 }}>All {sup.name}</MenuItem>);
      (sup.Children || []).forEach((child) => {
        out.push(<MenuItem key={`c-${child.id}`} value={child.id} sx={{ pl: 4 }}>{child.name}</MenuItem>);
      });
    });
    return out;
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`${config.BASE_URL}/users/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const labelSx = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1,
    color: 'text.disabled',
    textTransform: 'uppercase',
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      fontWeight: 700,
      transition: 'all .2s',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD, borderWidth: 1.5 },
    },
    '& label.Mui-focused': { color: GOLD },
  };

  return (
    <Box>
      {/* PAGE HEADER */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        mb={5}
      >
        <Box>
          <Typography sx={{ ...labelSx, color: GOLD, mb: 0.75 }}>Team</Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: NAVY }}>
            Staff Management
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
            Add and manage your team members, roles and commission.
          </Typography>
        </Box>
        <Chip
          icon={<Iconify icon="solar:users-group-rounded-linear" width={18} sx={{ ml: 0.5 }} />}
          label={`${users.length} Staff Members`}
          sx={{
            fontWeight: 800,
            borderRadius: 2,
            px: 1.5,
            height: 42,
            color: NAVY,
            bgcolor: alpha(GOLD, 0.12),
            '& .MuiChip-icon': { color: GOLD },
            fontVariantNumeric: 'tabular-nums',
          }}
        />
      </Stack>

      <Grid container spacing={4}>
        {/* STAFF FORM */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            p: { xs: 3, sm: 4 }, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            position: { lg: 'sticky' }, top: 24,
            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08),
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <Box sx={{
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: NAVY, borderRadius: 2, color: GOLD,
              }}>
                <Iconify icon={editingUser ? 'solar:user-id-linear' : 'solar:user-plus-linear'} width={26} />
              </Box>
              <Box>
                <Typography sx={labelSx}>{editingUser ? 'Editing Member' : 'New Member'}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: NAVY, lineHeight: 1.2 }}>
                  {editingUser ? 'Edit Staff' : 'Add New Staff'}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={3.5}>
              {/* SECTION: Identity */}
              <Stack spacing={2}>
                <Typography sx={labelSx}>Profile</Typography>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={fieldSx}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Username" fullWidth value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Phone" fullWidth value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    sx={fieldSx}
                  />
                </Stack>
                <TextField
                  label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                  type="password"
                  fullWidth
                  value={form.password}
                  helperText={!editingUser ? "Default: Milan@123" : ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  sx={fieldSx}
                />
              </Stack>

              <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.08) }} />

              {/* SECTION: Role & Assignment */}
              <Stack spacing={2}>
                <Typography sx={labelSx}>Role & Assignment</Typography>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel sx={{ fontWeight: 700 }}>Job Role</InputLabel>
                  <Select
                    value={form.role} label="Job Role"
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                    renderValue={(val) => (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: roleMeta(val).color }} />
                        <span>{roleMeta(val).label}</span>
                      </Stack>
                    )}
                  >
                    <MenuItem value="admin" sx={{ fontWeight: 700 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: ROLE_META.admin.color, mr: 1.5 }} />
                      Admin
                    </MenuItem>
                    <MenuItem value="receptionist" sx={{ fontWeight: 700 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: ROLE_META.receptionist.color, mr: 1.5 }} />
                      Receptionist
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem value="employee" sx={{ fontWeight: 700 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: ROLE_META.employee.color, mr: 1.5 }} />
                      Employee
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel sx={{ fontWeight: 700 }}>Assigned Branches</InputLabel>
                  <Select
                    multiple
                    value={form.branchIds}
                    label="Assigned Branches"
                    onChange={(e) => setForm({ ...form, branchIds: e.target.value })}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((val) => (
                          <Chip key={val} label={branches.find(b => b.id === val)?.name} size="small" variant="soft" color="secondary" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
                        ))}
                      </Box>
                    )}
                  >
                    {branches.map(b => (
                      <MenuItem key={b.id} value={b.id} sx={{ fontWeight: 700 }}>
                        {b.name.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {form.role === 'employee' && (
                  <FormControl fullWidth sx={fieldSx}>
                    <InputLabel sx={{ fontWeight: 700 }}>Specialties (Service Categories)</InputLabel>
                    <Select
                      multiple
                      value={form.categoryIds}
                      label="Specialties (Service Categories)"
                      onChange={(e) => setForm({ ...form, categoryIds: e.target.value })}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((val) => (
                            <Chip
                              key={val}
                              label={categoryName(val)}
                              size="small"
                              sx={{ fontWeight: 800, borderRadius: 1.5, color: GOLD, bgcolor: alpha(GOLD, 0.12) }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {categories.length === 0 && <MenuItem disabled>Create categories first</MenuItem>}
                      {renderSpecialtyOptions()}
                    </Select>
                  </FormControl>
                )}
              </Stack>

              <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.08) }} />

              {/* SECTION: Commission */}
              <Box sx={{
                p: 2.5,
                bgcolor: form.commissionEnabled ? alpha(GOLD, 0.05) : 'background.neutral',
                borderRadius: 2,
                border: '1px solid',
                borderColor: form.commissionEnabled ? alpha(GOLD, 0.3) : alpha(theme.palette.divider, 0.08),
                transition: 'all .2s',
              }}>
                <FormControlLabel
                  sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                  labelPlacement="start"
                  control={
                    <Switch
                      checked={!!form.commissionEnabled}
                      color="secondary"
                      onChange={(e) => setForm({ ...form, commissionEnabled: e.target.checked })}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Iconify icon="solar:hand-money-linear" width={22} sx={{ color: GOLD }} />
                      <Box>
                        <Typography sx={{ ...labelSx, color: NAVY }}>Eligible for Commission</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Earns a percentage per service
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
                {form.commissionEnabled && (
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    label="Commission Percent"
                    placeholder="10"
                    helperText="Whole number between 1 and 99"
                    inputProps={{ min: 1, max: 99, step: 1 }}
                    value={form.commissionRate}
                    onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                    InputProps={{
                      endAdornment: <Typography variant="caption" fontWeight={800} color="text.disabled">%</Typography>,
                      sx: { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper', fontVariantNumeric: 'tabular-nums' }
                    }}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

              <Stack direction="row" spacing={2} pt={1}>
                {editingUser && (
                  <Button
                    variant="soft" color="error" fullWidth
                    disabled={saving}
                    onClick={() => { setEditingUser(null); setForm(emptyForm); }}
                    sx={{ height: 56, borderRadius: 2, fontWeight: 800, '&:active': { transform: 'scale(0.98)' } }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained" fullWidth
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    height: 56, fontWeight: 900, borderRadius: 2, fontSize: '1rem',
                    bgcolor: GOLD, color: '#fff',
                    boxShadow: `0 8px 20px 0 ${alpha(GOLD, 0.4)}`,
                    '&:hover': { bgcolor: '#b3851f', boxShadow: `0 10px 24px 0 ${alpha(GOLD, 0.5)}` },
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                  startIcon={saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : <Iconify icon="solar:verified-check-linear" width={24} />}
                >
                  {saving ? 'Saving…' : (editingUser ? 'Save Changes' : 'Add Staff')}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* STAFF LIST */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: theme.customShadows.z8,
          }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 720 }}>
                <TableHead sx={{ bgcolor: NAVY }}>
                  <TableRow>
                    <TableCell sx={{ ...labelSx, color: alpha('#fff', 0.7), py: 2.5, borderBottom: 'none' }}>Member</TableCell>
                    <TableCell sx={{ ...labelSx, color: alpha('#fff', 0.7), borderBottom: 'none' }}>Role</TableCell>
                    <TableCell sx={{ ...labelSx, color: alpha('#fff', 0.7), borderBottom: 'none' }}>Branches & Specialties</TableCell>
                    <TableCell sx={{ ...labelSx, color: alpha('#fff', 0.7), borderBottom: 'none' }}>Status</TableCell>
                    <TableCell align="right" sx={{ ...labelSx, color: alpha('#fff', 0.7), borderBottom: 'none' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 15, borderBottom: 'none' }}><CircularProgress sx={{ color: GOLD }} /></TableCell></TableRow>
                  ) : users.map((u) => {
                    const rm = roleMeta(u.role);
                    const isEditing = editingUser?.id === u.id;
                    return (
                    <TableRow
                      key={u.id}
                      hover
                      sx={{
                        transition: 'all .2s',
                        bgcolor: isEditing ? alpha(GOLD, 0.06) : 'transparent',
                        '&:nth-of-type(even)': { bgcolor: isEditing ? alpha(GOLD, 0.06) : alpha(theme.palette.text.primary, 0.015) },
                        '&:hover': { bgcolor: alpha(GOLD, 0.04) },
                        '& td': { borderColor: alpha(theme.palette.divider, 0.06) },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{
                            width: 44, height: 44,
                            bgcolor: alpha(rm.color, 0.12),
                            color: rm.color,
                            fontWeight: 800, fontSize: '1.05rem',
                            border: `2px solid ${alpha(rm.color, 0.4)}`,
                          }}>{u.name[0]}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ color: NAVY, letterSpacing: '-0.01em' }}>{u.name.toUpperCase()}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>@{u.username}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rm.label}
                          variant="soft"
                          size="small"
                          color={rm.muiColor}
                          sx={{ fontWeight: 800, borderRadius: 1.5, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>
                          {(u.Branches?.length > 0 ? u.Branches : (branches.find(b => b.id === u.BranchId) ? [branches.find(b => b.id === u.BranchId)] : [])).map(b => (
                            <Chip key={b.id} label={b.name?.toUpperCase()} size="small" variant="soft" sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.25 }} />
                          ))}
                          {(!u.Branches?.length && !u.BranchId) && <Typography variant="caption" sx={{ color: 'text.disabled' }}>No branch</Typography>}
                        </Stack>
                        {u.Specialties?.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5, mt: 0.75 }}>
                            {u.Specialties.map((c) => (
                              <Chip
                                key={c.id}
                                label={c.name}
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20, borderRadius: 1, color: GOLD, bgcolor: alpha(GOLD, 0.12) }}
                              />
                            ))}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Iconify icon={u.status === 'active' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={14} />}
                          label={u.status}
                          size="small"
                          variant="soft"
                          color={u.status === 'active' ? 'success' : 'error'}
                          sx={{ fontWeight: 800, textTransform: 'capitalize', borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingUser(u);
                                const newStatus = u.status === 'active' ? 'inactive' : 'active';
                                setForm(prev => ({ ...prev, status: newStatus }));
                                // Small delay to ensure state is set before save or just call direct
                                setTimeout(() => handleQuickStatusUpdate(u.id, newStatus), 100);
                              }}
                              sx={{
                                color: u.status === 'active' ? 'success.main' : 'error.main',
                                bgcolor: u.status === 'active' ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.error.main, 0.08),
                                transition: 'all .2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.customShadows.z8 },
                                '&:active': { transform: 'scale(0.98)' },
                              }}
                            >
                              <Iconify icon={u.status === 'active' ? 'solar:shield-check-linear' : 'solar:shield-cross-linear'} width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(u)}
                              sx={{
                                color: GOLD, bgcolor: alpha(GOLD, 0.08), transition: 'all .2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.customShadows.z8 },
                                '&:active': { transform: 'scale(0.98)' },
                              }}
                            >
                              <Iconify icon="solar:pen-linear" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => confirmDelete(u.id)}
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.08), transition: 'all .2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.customShadows.z8 },
                                '&:active': { transform: 'scale(0.98)' },
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-linear" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );})}
                  {users.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 10, borderBottom: 'none' }}>
                        <Stack spacing={1.5} alignItems="center">
                          <Box sx={{
                            width: 72, height: 72, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(GOLD, 0.1), color: GOLD,
                          }}>
                            <Iconify icon="solar:users-group-rounded-linear" width={36} />
                          </Box>
                          <Typography variant="h6" fontWeight={800} sx={{ color: NAVY }}>No staff yet</Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ maxWidth: 280 }}>
                            Add your first team member using the form on the left to get started.
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Staff Member?"
        content="Are you sure you want to delete this staff member? This will remove their access to the system."
        confirmLabel="Delete"
        color="error"
        onConfirm={executeDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
