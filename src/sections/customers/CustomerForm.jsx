import React, { useState } from 'react';
import {
  Card,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
  Box,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';

export default function CustomerForm({
  branches,
  onCustomerCreated,
  token,
  refreshCustomers,
}) {
  const theme = useTheme();
  const [form, setForm] = useState({ name: '', phone: '', branchId: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 3) errs.name = 'Minimum 3 characters required';
    if (!/^[79]\d{8}$/.test(form.phone)) errs.phone = 'Start with 7/9 (9 digits)';
    if (!form.branchId) errs.branchId = 'Select a hub location';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createCustomer = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`${config.BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          phone: `+251${form.phone}`,
        }),
      });

      const data = await res.json();
      onCustomerCreated(data);
      refreshCustomers();
      setForm({ name: '', phone: '', branchId: '' });
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{
      borderRadius: 2.5, boxShadow: theme.customShadows.z12,
      border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1, bgcolor: '#1A1A1A', borderRadius: 1.5, color: '#9A7B4F' }}>
            <Iconify icon="solar:user-plus-linear" width={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>Register Customer</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Add a new customer to the salon.</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="e.g. Abebe Balcha"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="912345678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={800} color="text.disabled">+251</Typography></InputAdornment>,
                inputProps: { maxLength: 9 },
                sx: { borderRadius: 1.5, fontWeight: 700 }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.branchId}>
              <InputLabel sx={{ fontWeight: 800 }}>Select Branch</InputLabel>
              <Select
                value={form.branchId}
                label="Select Branch"
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id} sx={{ fontWeight: 700 }}>
                    {b.name.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {errors.branchId && <Typography variant="caption" color="error" sx={{ mt: 0.5, fontWeight: 800 }}>{errors.branchId}</Typography>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="secondary"
              disabled={loading || !form.name || !form.phone || !form.branchId}
              onClick={createCustomer}
              sx={{ height: 60, fontWeight: 900, borderRadius: 1.5, fontSize: '1rem' }}
              startIcon={<Iconify icon="solar:user-check-linear" />}
            >
              Check-In Customer
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

import { Stack } from '@mui/material';
