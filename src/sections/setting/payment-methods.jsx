import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import config from 'src/config';

const emptyForm = {
  id: null,
  name: '',
  type: 'bank',
  accountInfo: '',
  order: 0,
  status: 'active',
};

export default function PaymentMethodsPage() {
  const theme = useTheme();
  const token = localStorage.getItem('authToken');

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.BASE_URL}/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setForm(emptyForm); setFile(null); setDialogOpen(true); };
  const openEdit = (m) => {
    setForm({ id: m.id, name: m.name, type: m.type, accountInfo: m.accountInfo || '', order: m.order || 0, status: m.status });
    setFile(null);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      setSnack({ open: true, message: 'Name is required', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('type', form.type);
      fd.append('accountInfo', form.accountInfo || '');
      fd.append('order', String(form.order || 0));
      fd.append('status', form.status);
      if (file) fd.append('logo', file);

      const url = form.id
        ? `${config.BASE_URL}/payment-methods/${form.id}`
        : `${config.BASE_URL}/payment-methods`;
      const method = form.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        setSnack({ open: true, message: form.id ? 'Updated' : 'Created', severity: 'success' });
        setDialogOpen(false);
        await fetchMethods();
      } else {
        const err = await res.json().catch(() => ({}));
        setSnack({ open: true, message: err.error || 'Save failed', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: 'Network error', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this payment method? Existing invoices will still keep the snapshot label.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${config.BASE_URL}/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSnack({ open: true, message: 'Deleted', severity: 'success' });
        await fetchMethods();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (m) => {
    const newStatus = m.status === 'active' ? 'inactive' : 'active';
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      await fetch(`${config.BASE_URL}/payment-methods/${m.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      await fetchMethods();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: alpha('#1A1A1A', 0.02) }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={5} spacing={2}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -1 }}>
            Payment <Box component="span" sx={{ color: '#9A7B4F' }}>Methods</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            Configure how the reception records incoming payments. Cash, banks, mobile wallets — anything.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined" color="inherit" onClick={fetchMethods}
            startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:restart-linear" />}
            disabled={loading}
            sx={{ fontWeight: 800, height: 48, borderRadius: 1.5 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained" color="secondary" onClick={openCreate}
            startIcon={<Iconify icon="solar:add-circle-linear" />}
            sx={{ fontWeight: 900, height: 48, px: 3, borderRadius: 1.5, bgcolor: '#9A7B4F', '&:hover': { bgcolor: '#B5851F' } }}
          >
            Add Method
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {methods.map((m) => (
          <Grid item xs={12} sm={6} md={4} key={m.id}>
            <Card sx={{
              p: 3, borderRadius: 2.5,
              border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
              opacity: m.status === 'active' ? 1 : 0.55,
              transition: '0.2s',
              '&:hover': { boxShadow: theme.customShadows.z12 },
            }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                {m.logoUrl ? (
                  <Avatar src={`${config.BASE_URL}${m.logoUrl}`} variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'background.neutral' }} />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: '#1A1A1A', color: '#9A7B4F' }}>
                    <Iconify icon={m.type === 'cash' ? 'solar:wallet-linear' : 'solar:card-linear'} width={28} />
                  </Avatar>
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={900} noWrap>{m.name}</Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5}>
                    <Chip
                      label={m.type === 'cash' ? 'CASH' : 'BANK'}
                      size="small" variant="soft"
                      color={m.type === 'cash' ? 'success' : 'info'}
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                    />
                    <Chip
                      label={m.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                      size="small" variant="soft"
                      color={m.status === 'active' ? 'success' : 'default'}
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                    />
                  </Stack>
                </Box>
              </Stack>

              {m.accountInfo && (
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 1, mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="text.disabled" display="block">
                    ACCOUNT INFO
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-all' }}>
                    {m.accountInfo}
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title={m.status === 'active' ? 'Disable' : 'Enable'}>
                  <Switch
                    size="small"
                    checked={m.status === 'active'}
                    onChange={() => toggleStatus(m)}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(m)} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.06) }}>
                    <Iconify icon="solar:pen-linear" width={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small" color="error"
                    onClick={() => remove(m.id)}
                    disabled={deletingId === m.id}
                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.06) }}
                  >
                    {deletingId === m.id
                      ? <CircularProgress size={16} />
                      : <Iconify icon="solar:trash-bin-trash-linear" width={18} />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          </Grid>
        ))}

        {methods.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box sx={{ py: 10, textAlign: 'center', border: '2px dashed', borderColor: alpha('#1A1A1A', 0.05), borderRadius: 3 }}>
              <Iconify icon="solar:wallet-money-linear" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={900} color="text.disabled">No payment methods yet</Typography>
              <Typography variant="body2" color="text.disabled" fontWeight={700}>
                Click "Add Method" to set up Cash, banks, mobile wallets, etc.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900, bgcolor: '#1A1A1A', color: 'white' }}>
          {form.id ? 'Edit Payment Method' : 'New Payment Method'}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Display Name"
              placeholder="e.g. Commercial Bank of Ethiopia"
              fullWidth value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700 } }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: 800 }}>Type</InputLabel>
              <Select
                value={form.type} label="Type"
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                <MenuItem value="cash" sx={{ fontWeight: 700 }}>Cash</MenuItem>
                <MenuItem value="bank" sx={{ fontWeight: 700 }}>Bank / Wallet</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Account Info (Optional)"
              placeholder="Account number, phone, or branch identifier"
              fullWidth value={form.accountInfo}
              onChange={(e) => setForm({ ...form, accountInfo: e.target.value })}
              InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700 } }}
            />

            <Box>
              <Typography variant="caption" fontWeight={900} color="text.secondary" display="block" mb={1}>LOGO (OPTIONAL)</Typography>
              <Button
                component="label" variant="outlined" fullWidth
                startIcon={<Iconify icon="solar:upload-bold" />}
                sx={{ height: 56, borderRadius: 1.5, borderStyle: 'dashed' }}
              >
                {file ? file.name : (form.id ? 'Replace Logo' : 'Upload Logo')}
                <input type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.status === 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
                />
              }
              label={<Typography variant="body2" fontWeight={800}>Active (visible to reception)</Typography>}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ fontWeight: 900, color: 'text.secondary' }}>CANCEL</Button>
          <Button
            variant="contained" color="secondary"
            onClick={save} disabled={saving}
            startIcon={saving ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : null}
            sx={{ fontWeight: 900, px: 4 }}
          >
            {saving ? 'SAVING…' : (form.id ? 'SAVE CHANGES' : 'CREATE')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 700 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
