import React, { useState } from 'react';
import {
  Box,
  Stack,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';

const microLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  lineHeight: 1.5,
};

export default function CustomerForm({
  branches,
  onCustomerCreated,
  token,
  refreshCustomers,
}) {
  const theme = useTheme();
  const hairline = alpha(theme.palette.divider, 0.18);
  const [form, setForm] = useState({ name: '', phone: '', branchId: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 3) errs.name = 'Minimum 3 characters required';
    if (!/^[79]\d{8}$/.test(form.phone)) errs.phone = 'Start with 7/9 (9 digits)';
    if (!form.branchId) errs.branchId = 'Select a branch location';
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
    <Box
      sx={{
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: hairline,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: hairline }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:user-plus-linear" width={22} sx={{ color: 'secondary.main' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: 'text.primary' }}>
              Register Customer
            </Typography>
            <Typography sx={{ ...microLabel, fontSize: 10, color: 'text.secondary', mt: 0.25 }}>
              Add &amp; check in
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="e.g. Abebe Balcha"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                startAdornment: <InputAdornment position="start"><Typography variant="body2" color="text.disabled">+251</Typography></InputAdornment>,
                inputProps: { maxLength: 9 },
                sx: { borderRadius: 1.5 },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.branchId}>
              <InputLabel>Select Branch</InputLabel>
              <Select
                value={form.branchId}
                label="Select Branch"
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                sx={{ borderRadius: 1.5 }}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.branchId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, fontWeight: 600 }}>
                  {errors.branchId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="secondary"
              disableElevation
              disabled={loading || !form.name || !form.phone || !form.branchId}
              onClick={createCustomer}
              sx={{ minHeight: 52, borderRadius: 1.5, ...microLabel }}
              startIcon={<Iconify icon="solar:user-check-linear" width={18} />}
            >
              Check-In Customer
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
