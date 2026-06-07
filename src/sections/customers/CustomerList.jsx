import React from 'react';
import { Grid, Card, Typography, Chip, Box, Avatar, Stack, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const microLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  lineHeight: 1.5,
};

const STATUS_CONFIG = {
  active: { label: 'Waiting', token: 'warning', icon: 'solar:clock-circle-linear' },
  checked_in: { label: 'In Salon', token: 'secondary', icon: 'solar:pulse-linear' },
  completed: { label: 'Completed', token: 'success', icon: 'solar:check-circle-linear' },
};

// ----------------------------------------------------------------------

export default function CustomerList({ customers = [], setCurrentCustomer, columns }) {
  const theme = useTheme();
  const hairline = alpha(theme.palette.divider, 0.18);

  const gridConfig = columns || { xs: 12, sm: 6, md: 6 };

  if (!customers.length) {
    return (
      <Box
        sx={{
          py: { xs: 7, md: 10 },
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: hairline,
        }}
      >
        <Iconify icon="solar:users-group-rounded-linear" width={44} sx={{ color: alpha(theme.palette.secondary.main, 0.4), mb: 1.5 }} />
        <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5 }}>
          No customers yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customers will appear here once they are added.
        </Typography>
      </Box>
    );
  }

  // Sort: checked_in → active → completed
  const sortedCustomers = [...customers].sort((a, b) => {
    const order = { checked_in: 0, active: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <Grid container spacing={{ xs: 2, md: 2.5 }}>
      {sortedCustomers.map((customer) => {
        const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const status = STATUS_CONFIG[customer.status] || { label: 'Unknown', token: 'secondary', icon: 'solar:info-circle-linear' };
        const statusColor = theme.palette[status.token]?.main || theme.palette.secondary.main;

        return (
          <Grid item {...gridConfig} key={customer.id}>
            <Card
              onClick={() => setCurrentCustomer?.(customer)}
              sx={{
                p: { xs: 2.5, md: 3 },
                cursor: 'pointer',
                height: '100%',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: hairline,
                boxShadow: 'none',
                bgcolor: 'background.paper',
                transition: 'border-color 0.2s ease',
                '&:hover': { borderColor: 'secondary.main' },
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'transparent',
                      color: 'text.primary',
                      border: '1px solid',
                      borderColor: hairline,
                      fontWeight: 700,
                      fontSize: '1rem',
                      fontFamily: "'Fraunces', serif",
                    }}
                  >
                    {initials}
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: 'text.primary' }}
                    >
                      {customer.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Iconify icon="solar:phone-linear" width={12} sx={{ color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary">{customer.phone}</Typography>
                    </Stack>
                  </Box>

                  <Iconify icon="solar:alt-arrow-right-linear" width={18} sx={{ color: 'secondary.main', flexShrink: 0 }} />
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ pt: 2, borderTop: '1px solid', borderColor: hairline }}
                >
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                    <Iconify icon="solar:map-point-linear" width={14} sx={{ color: 'secondary.main', flexShrink: 0 }} />
                    <Typography sx={{ ...microLabel, fontSize: 10, color: 'text.secondary' }} noWrap>
                      {customer.Branch?.name || 'Main Branch'}
                    </Typography>
                  </Stack>
                  <Chip
                    label={status.label}
                    size="small"
                    variant="outlined"
                    icon={<Iconify icon={status.icon} width={14} />}
                    sx={{
                      ...microLabel,
                      fontSize: 10,
                      borderRadius: 1,
                      height: 26,
                      borderColor: hairline,
                      color: statusColor,
                      '& .MuiChip-icon': { color: statusColor },
                    }}
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
