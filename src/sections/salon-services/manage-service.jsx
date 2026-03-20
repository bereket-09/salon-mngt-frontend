import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

export default function ServicesPage() {
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    name: '',
    type: 'Styling',
    price: '',
    status: 'active',
    BranchId: '',
    gender: 'both',
    estimatedDuration: 30,
    commissionEnabled: false,
    commissionRate: 0.10,
    code: '',
  });
  const [editService, setEditService] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [svcRes, brRes] = await Promise.all([
        fetch(`${config.BASE_URL}/services`, auth),
        fetch(`${config.BASE_URL}/branches`, auth),
      ]);
      const svcData = await svcRes.json();
      const brData = await brRes.json();
      setServices(Array.isArray(svcData) ? svcData : []);
      setBranches(Array.isArray(brData) ? brData : []);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.price) return;
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        commissionRate: parseFloat(form.commissionRate),
        estimatedDuration: parseInt(form.estimatedDuration, 10),
      };
      await fetch(`${config.BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setForm({ name: '', type: 'Styling', price: '', status: 'active', BranchId: '', gender: 'both', estimatedDuration: 30, commissionEnabled: false, commissionRate: 0.10, code: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editService) return;
    try {
      const payload = {
        ...editService,
        price: parseFloat(editService.price),
        commissionRate: parseFloat(editService.commissionRate),
        estimatedDuration: parseInt(editService.estimatedDuration, 10),
      };
      await fetch(`${config.BASE_URL}/services/${editService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setEditService(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    try {
      await fetch(`${config.BASE_URL}/services/${deleteId}`, {
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
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Service List</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>Manage your salon services and staff commissions.</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={`${services.length} Active Services`}
            color="secondary"
            sx={{ fontWeight: 800, borderRadius: 1.5, px: 2, height: 44 }}
          />
          <IconButton onClick={fetchData} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 44, height: 44 }}>
            <Iconify icon="solar:restart-bold-duotone" sx={{ color: 'secondary.main' }} />
          </IconButton>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* ADD NEW SERVICE */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            position: 'sticky', top: 24, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
            bgcolor: alpha(theme.palette.background.neutral, 0.4)
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <Box sx={{ p: 1, bgcolor: '#1B1F3A', borderRadius: 1.5, color: '#C8972A' }}>
                <Iconify icon="solar:box-minimalistic-bold-duotone" width={28} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Add New Service</Typography>
            </Stack>

            <Stack spacing={3}>
              <TextField
                label="Service Name"
                fullWidth
                placeholder="e.g. Hair Cut"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                InputProps={{
                  sx: { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }
                }}
              />

              <TextField
                label="Service Code (Optional)"
                fullWidth
                placeholder="e.g. CUT-01"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                InputProps={{
                  sx: { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' },
                  startAdornment: <InputAdornment position="start"><Iconify icon="solar:hashtag-bold-duotone" sx={{ color: 'secondary.main', mr: 1 }} /></InputAdornment>,
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 800 }}>Category</InputLabel>
                    <Select
                      value={form.gender} label="Category"
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="male">For Men</MenuItem>
                      <MenuItem value="female">For Women</MenuItem>
                      <MenuItem value="both">For Both</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={800}>Br</Typography></InputAdornment>,
                      sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: 'background.paper' }
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Duration (Minutes)"
                type="number"
                fullWidth
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Iconify icon="solar:clock-circle-bold-duotone" sx={{ color: 'secondary.main', mr: 1 }} /></InputAdornment>,
                  sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: 'background.paper' }
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Select Branch</InputLabel>
                <Select
                  value={form.BranchId} label="Select Branch"
                  onChange={(e) => setForm({ ...form, BranchId: e.target.value })}
                  sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name.toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>

              <Box sx={{ p: 2, bgcolor: '#1B1F3A', borderRadius: 2, border: '1px solid', borderColor: alpha('#C8972A', 0.1) }}>
                <FormControlLabel
                  control={<Switch checked={form.commissionEnabled} color="secondary" onChange={(e) => setForm({ ...form, commissionEnabled: e.target.checked })} />}
                  label={<Typography variant="caption" fontWeight={800} color="#C8972A">ENABLE COMMISSION</Typography>}
                />
                {form.commissionEnabled && (
                  <TextField
                    label="Commission Rate"
                    type="number" fullWidth size="small" sx={{ mt: 2, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 1, fontWeight: 800 } }}
                    placeholder="e.g. 0.1 for 10%"
                    value={form.commissionRate}
                    onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight={800}>% Rate</Typography></InputAdornment> }}
                  />
                )}
              </Box>

              <Button
                variant="contained" color="secondary" fullWidth
                onClick={handleCreate}
                sx={{ height: 64, fontWeight: 900, borderRadius: 1.5, fontSize: '1.1rem' }}
              >
                Save Service
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* SERVICE GRID */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {services.map((s) => (
              <Grid item xs={12} sm={6} key={s.id}>
                <Card sx={{
                  borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                  transition: '0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.customShadows.z12, borderColor: 'secondary.main' }
                }}>
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                          <Chip
                            label={s.gender === 'male' ? 'Men' : s.gender === 'female' ? 'Women' : 'Both'}
                            size="small" color={s.gender === 'male' ? 'info' : 'secondary'} variant="soft"
                            sx={{ fontWeight: 800, borderRadius: 0.5 }}
                          />
                          <Chip label={`${s.estimatedDuration || 30} min`} variant="soft" color="default" size="small" sx={{ fontWeight: 800, borderRadius: 0.5 }} />
                        </Stack>
                        <Typography variant="h6" fontWeight={800} noWrap>{s.name.toUpperCase()}</Typography>
                        <Typography variant="caption" color="secondary.main" fontWeight={900} sx={{ display: 'block', mt: -0.5, mb: 0.5 }}>{s.code || 'NO CODE'}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block' }}>Branch: {s.Branch?.name?.toUpperCase() || 'All Branches'}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" fontWeight={900} color="#1B1F3A">{s.price}</Typography>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">ETB</Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        {s.commissionEnabled ? (
                          <Typography variant="caption" fontWeight={800} color="success.main">Commission: {(Number(s.commissionRate) * 100).toFixed(0)}%</Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled" fontWeight={800}>No Commission</Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => setEditService(s)} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}><Iconify icon="solar:pen-bold-duotone" width={18} /></IconButton>
                        <IconButton size="small" onClick={() => confirmDelete(s.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main' }}><Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} /></IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* EDIT MODAL */}
      <Dialog open={!!editService} onClose={() => setEditService(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: '#1B1F3A', color: 'white' }}>Edit Service</DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {editService && (
            <Stack spacing={3}>
              <TextField fullWidth label="Service Name" value={editService.name} onChange={(e) => setEditService({ ...editService, name: e.target.value })} />
              <TextField fullWidth label="Service Code" placeholder="Leave empty for auto-generation" value={editService.code || ''} onChange={(e) => setEditService({ ...editService, code: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={editService.gender} label="Category" onChange={(e) => setEditService({ ...editService, gender: e.target.value })}>
                      <MenuItem value="male">Men</MenuItem>
                      <MenuItem value="female">Women</MenuItem>
                      <MenuItem value="both">Both</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Price" type="number" value={editService.price} onChange={(e) => setEditService({ ...editService, price: e.target.value })} />
                </Grid>
              </Grid>
              <TextField fullWidth label="Duration (min)" type="number" value={editService.estimatedDuration} onChange={(e) => setEditService({ ...editService, estimatedDuration: e.target.value })} />

              <Box sx={{ p: 2, bgcolor: '#1B1F3A', borderRadius: 2 }}>
                <FormControlLabel
                  control={<Switch checked={editService.commissionEnabled} color="secondary" onChange={(e) => setEditService({ ...editService, commissionEnabled: e.target.checked })} />}
                  label={<Typography variant="caption" fontWeight={800} color="#C8972A">Enable Commission</Typography>}
                />
                {editService.commissionEnabled && (
                  <TextField label="Commission %" type="number" fullWidth size="small" sx={{ mt: 2, bgcolor: 'background.paper' }} value={editService.commissionRate} onChange={(e) => setEditService({ ...editService, commissionRate: e.target.value })} />
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="soft" color="inherit" fullWidth onClick={() => setEditService(null)}>Cancel</Button>
          <Button variant="contained" color="secondary" fullWidth onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={executeDelete}
        onClose={() => setConfirmOpen(false)}
        title="Delete Service?"
        content="Are you sure you want to delete this service?"
      />
    </Box>
  );
}
