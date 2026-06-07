import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  InputAdornment,
  alpha,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';
import MapComponent from 'src/components/map/MapComponent';

export default function BranchesTable() {
  const theme = useTheme();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', phone: '', latitude: '', longitude: '' });
  const [editingBranch, setEditingBranch] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.location) return;
    try {
      const url = editingBranch ? `${config.BASE_URL}/branches/${editingBranch.id}` : `${config.BASE_URL}/branches`;
      const method = editingBranch ? 'PUT' : 'POST';
      const body = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      setForm({ name: '', location: '', phone: '', latitude: '', longitude: '' });
      setEditingBranch(null);
      fetchBranches();
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
      await fetch(`${config.BASE_URL}/branches/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (b) => {
    setEditingBranch(b);
    setForm({
      name: b.name,
      location: b.location,
      phone: b.phone || '',
      latitude: b.latitude || '',
      longitude: b.longitude || ''
    });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Branches</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>Add and manage your salon locations.</Typography>
        </Box>
        <Chip
          label={`${branches.length} Branches`}
          color="secondary"
          sx={{ fontWeight: 800, borderRadius: 1, px: 2, height: 40 }}
        />
      </Stack>

      <Grid container spacing={4}>
        {/* ADD / EDIT BRANCH */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
            position: 'sticky', top: 24
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <Box sx={{ p: 1, bgcolor: '#1A1A1A', borderRadius: 1.5, color: '#9A7B4F' }}>
                <Iconify icon="solar:transmission-linear" width={24} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <TextField
                label="Branch Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
              />
              <TextField
                label="Address / Location"
                fullWidth
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Latitude"
                    fullWidth
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Longitude"
                    fullWidth
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Phone Number"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
              />

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.disabled" fontWeight={800} mb={1} display="block">Map Preview</Typography>
                <MapComponent
                  lat={parseFloat(form.latitude)}
                  lng={parseFloat(form.longitude)}
                  height="160px"
                  interactive={false}
                  markers={form.latitude && form.longitude ? [{ lat: parseFloat(form.latitude), lng: parseFloat(form.longitude), title: form.name }] : []}
                />
              </Box>

              <Stack direction="row" spacing={2} pt={2}>
                {editingBranch && (
                  <Button variant="soft" color="error" fullWidth onClick={() => { setEditingBranch(null); setForm({ name: '', location: '', phone: '', latitude: '', longitude: '' }); }} sx={{ borderRadius: 1.5, fontWeight: 800 }}>
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained" color="secondary" fullWidth
                  onClick={handleSave}
                  sx={{ height: 60, fontWeight: 900, borderRadius: 1.5, fontSize: '1rem' }}
                >
                  {editingBranch ? 'Save Changes' : 'Add Branch'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* LIST OF BRANCHES */}
        <Grid item xs={12} lg={8}>
          {loading ? <LinearProgress color="secondary" sx={{ borderRadius: 1, height: 6 }} /> : (
            <Grid container spacing={3}>
              {branches.map((b) => (
                <Grid item xs={12} sm={6} key={b.id}>
                  <Card sx={{
                    borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                    boxShadow: theme.customShadows.z8, transition: '0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.customShadows.z20, borderColor: 'secondary.main' }
                  }}>
                    <Box sx={{ p: 0, height: '140px' }}>
                      <MapComponent
                        lat={parseFloat(b.latitude)}
                        lng={parseFloat(b.longitude)}
                        height="140px"
                        interactive={false}
                        zoom={14}
                        markers={b.latitude && b.longitude ? [{ lat: parseFloat(b.latitude), lng: parseFloat(b.longitude), title: b.name }] : []}
                      />
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Avatar sx={{
                          width: 40, height: 40, bgcolor: '#1A1A1A', color: 'white',
                          fontWeight: 800, fontSize: '1rem'
                        }}>{b.name[0]}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={800} noWrap>{b.name.toUpperCase()}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>ID: #{b.id}</Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                      <Stack spacing={1} mb={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Iconify icon="solar:map-point-linear" sx={{ color: 'secondary.main', width: 16 }} />
                          <Typography variant="body2" fontWeight={800} color="text.primary">{b.location.toUpperCase()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Iconify icon="solar:phone-linear" sx={{ color: 'info.main', width: 16 }} />
                          <Typography variant="body2" fontWeight={800} color="text.secondary">{b.phone || 'No Phone'}</Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          {b.latitude && b.longitude ? (
                            <Chip label="GPS Linked" size="small" variant="soft" color="info" sx={{ fontWeight: 800, borderRadius: 0.5, fontSize: '0.6rem' }} />
                          ) : (
                            <Chip label="No GPS" size="small" variant="soft" sx={{ fontWeight: 800, borderRadius: 0.5, fontSize: '0.6rem' }} />
                          )}
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => handleEdit(b)} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05), color: 'secondary.main' }}><Iconify icon="solar:pen-linear" width={18} /></IconButton>
                          <IconButton size="small" color="error" onClick={() => confirmDelete(b.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}><Iconify icon="solar:trash-bin-trash-linear" width={18} /></IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Branch?"
        content="Are you sure you want to delete this branch? This will remove it from the system."
        confirmLabel="Delete"
        color="error"
        onConfirm={executeDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
