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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

export default function UserManagement() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    phone: '',
    password: '',
    role: 'employee',
    status: 'active',
    branchIds: [],
    commissionRate: 0.10,
  });
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, bRes] = await Promise.all([
        fetch(`${config.BASE_URL}/users`, auth),
        fetch(`${config.BASE_URL}/branches`, auth),
      ]);
      setUsers(await uRes.json() || []);
      setBranches(await bRes.json() || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.username) return;
    try {
      const url = editingUser ? `${config.BASE_URL}/users/${editingUser.id}` : `${config.BASE_URL}/auth/register`;
      const method = editingUser ? 'PUT' : 'POST';
      const body = {
        ...form,
        branchIds: form.branchIds,
        password: (form.password && form.password.trim() !== '') ? form.password : (editingUser ? undefined : 'Milan@123')
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setForm({ name: '', username: '', phone: '', password: '', role: 'employee', status: 'active', branchIds: [], commissionRate: 0.10 });
        setEditingUser(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
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
      role: u.role,
      status: u.status,
      branchIds: u.Branches ? u.Branches.map(b => b.id) : (u.BranchId ? [u.BranchId] : []),
      commissionRate: u.commissionRate || 0.10,
    });
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    try {
      await fetch(`${config.BASE_URL}/users/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Staff Management</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>Add and manage your team members and their roles.</Typography>
        </Box>
        <Chip
          label={`${users.length} Staff Members`}
          color="secondary"
          sx={{ fontWeight: 800, borderRadius: 1, px: 2, height: 40 }}
        />
      </Stack>

      <Grid container spacing={4}>
        {/* STAFF FORM */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            position: 'sticky', top: 24, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1)
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <Box sx={{ p: 1, bgcolor: '#1B1F3A', borderRadius: 1.5, color: '#C8972A' }}>
                <Iconify icon="solar:user-plus-bold-duotone" width={24} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {editingUser ? 'Edit Staff' : 'Add New Staff'}
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Username" fullWidth value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
                />
                <TextField
                  label="Phone" fullWidth value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
                />
              </Stack>
              <TextField
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                fullWidth
                value={form.password}
                helperText={!editingUser ? "Default: Milan@123" : ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Job Role</InputLabel>
                <Select
                  value={form.role} label="Job Role"
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  sx={{ borderRadius: 1.5, fontWeight: 700 }}
                >
                  <MenuItem value="admin" sx={{ fontWeight: 700, color: 'error.main' }}>Admin</MenuItem>
                  <MenuItem value="receptionist" sx={{ fontWeight: 700, color: 'info.main' }}>Receptionist</MenuItem>
                  <Divider sx={{ my: 1 }} />
                  {['barber', 'hairdresser', 'nail_specialist', 'spa_therapist', 'employee'].map(r => (
                    <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize', fontWeight: 700 }}>
                      {r.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Assigned Branches</InputLabel>
                <Select
                  multiple
                  value={form.branchIds}
                  label="Assigned Branches"
                  onChange={(e) => setForm({ ...form, branchIds: e.target.value })}
                  sx={{ borderRadius: 1.5, fontWeight: 700 }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((val) => (
                            <Chip key={val} label={branches.find(b => b.id === val)?.name} size="small" variant="soft" color="secondary" sx={{ fontWeight: 800 }} />
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

              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.02), borderRadius: 1.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                <Typography variant="overline" color="secondary.main" fontWeight={800} sx={{ letterSpacing: 1 }}>Commission Rate</Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                  InputProps={{
                    endAdornment: <Typography variant="caption" fontWeight={800} color="text.disabled">%</Typography>,
                    sx: { borderRadius: 1, fontWeight: 700, bgcolor: 'background.paper' }
                  }}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Stack direction="row" spacing={2} pt={2}>
                {editingUser && (
                  <Button variant="soft" color="error" fullWidth onClick={() => { setEditingUser(null); fetchData(); }} sx={{ borderRadius: 1.5, fontWeight: 800 }}>
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained" color="secondary" fullWidth
                  onClick={handleSave}
                  sx={{ height: 60, fontWeight: 900, borderRadius: 1.5, fontSize: '1rem' }}
                  startIcon={<Iconify icon="solar:verified-check-bold-duotone" width={24} />}
                >
                  {editingUser ? 'Save Changes' : 'Add Staff'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* STAFF LIST */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
            boxShadow: theme.customShadows.z12
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#1B1F3A' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 2.5, color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'white' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'white' }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'white' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'white' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 15 }}><CircularProgress color="secondary" /></TableCell></TableRow>
                  ) : users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ py: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{
                            width: 44, height: 44,
                            bgcolor: u.role === 'admin' ? 'error.main' : u.role === 'receptionist' ? 'info.main' : 'secondary.main',
                            fontWeight: 800, fontSize: '1.1rem',
                          }}>{u.name[0]}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>{u.name.toUpperCase()}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>@{u.username}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.role.replace('_', ' ')}
                          variant="soft"
                          size="small"
                          color={u.role === 'admin' ? 'error' : u.role === 'receptionist' ? 'info' : 'secondary'}
                          sx={{ fontWeight: 800, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {(u.Branches?.length > 0 ? u.Branches : (branches.find(b => b.id === u.BranchId) ? [branches.find(b => b.id === u.BranchId)] : [])).map(b => (
                            <Chip key={b.id} label={b.name?.toUpperCase()} size="small" variant="soft" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                          ))}
                          {(!u.Branches?.length && !u.BranchId) && <Typography variant="caption" sx={{ color: 'text.disabled' }}>None</Typography>}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.status}
                          size="small"
                          color={u.status === 'active' ? 'success' : 'error'}
                          sx={{ fontWeight: 800, textTransform: 'capitalize', borderRadius: 0.5 }}
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
                                bgcolor: u.status === 'active' ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05)
                              }}
                            >
                              <Iconify icon={u.status === 'active' ? 'solar:shield-check-bold-duotone' : 'solar:shield-cross-bold-duotone'} width={18} />
                            </IconButton>
                          </Tooltip>
                          <IconButton size="small" onClick={() => handleEdit(u)} sx={{ color: 'secondary.main', bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                            <Iconify icon="solar:pen-bold-duotone" width={18} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => confirmDelete(u.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                            <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && !loading && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><Typography color="text.disabled" variant="subtitle1" fontWeight={700}>No staff found</Typography></TableCell></TableRow>
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
