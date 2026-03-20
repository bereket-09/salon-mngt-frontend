import React from 'react';
import { Grid, Card, Typography, Chip, Box, Avatar, Stack, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  active: { label: 'WAITING', color: 'warning', icon: 'solar:clock-circle-bold-duotone' },
  checked_in: { label: 'IN SALON', color: 'success', icon: 'solar:pulse-bold-duotone' },
  completed: { label: 'COMPLETED', color: 'secondary', icon: 'solar:check-circle-bold-duotone' },
};

// ----------------------------------------------------------------------

export default function CustomerList({ customers = [], setCurrentCustomer, columns }) {
  const theme = useTheme();

  const gridConfig = columns || { xs: 12, sm: 6, md: 6 };

  if (!customers.length) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.02), borderRadius: 2.5, border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.1) }}>
        <Iconify icon="solar:users-group-rounded-bold-duotone" width={64} sx={{ color: 'text.disabled', opacity: 0.1, mb: 2 }} />
        <Typography variant="h6" color="text.disabled" fontWeight={800}>No customers found.</Typography>
      </Box>
    );
  }

  // Sort: checked_in → active → completed
  const sortedCustomers = [...customers].sort((a, b) => {
    const order = { checked_in: 0, active: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <Grid container spacing={2.5}>
      {sortedCustomers.map((customer) => {
        const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const status = STATUS_CONFIG[customer.status] || { label: 'UNKNOWN', color: 'default', icon: 'solar:info-circle-bold-duotone' };

        return (
          <Grid item {...gridConfig} key={customer.id}>
            <Card
              onClick={() => setCurrentCustomer?.(customer)}
              sx={{
                p: 3,
                cursor: 'pointer',
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: 'background.paper',
                boxShadow: theme.customShadows.z4,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.customShadows.z20,
                  borderColor: 'secondary.main',
                  '& .hover-arrow': { opacity: 1, transform: 'translateX(0)' }
                }
              }}
            >
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box position="relative">
                    <Avatar sx={{
                      width: 56, height: 56,
                      bgcolor: customer.status === 'checked_in' ? 'success.main' : 'secondary.main',
                      fontWeight: 900, fontSize: '1.2rem',
                      boxShadow: theme.customShadows.card
                    }}>
                      {initials}
                    </Avatar>
                    <Box sx={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 14, height: 14,
                      bgcolor: customer.status === 'checked_in' ? 'success.main' : 'warning.main',
                      borderRadius: '50%', border: '2px solid #fff'
                    }} />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={900} noWrap sx={{ letterSpacing: -0.5 }}>{customer.name.toUpperCase()}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:phone-bold-duotone" sx={{ width: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>{customer.phone}</Typography>
                    </Stack>
                  </Box>

                  <Iconify
                    icon="solar:alt-arrow-right-bold-duotone"
                    className="hover-arrow"
                    sx={{ color: 'secondary.main', opacity: 0, transform: 'translateX(-10px)', transition: '0.3s' }}
                  />
                </Stack>

                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.neutral, 0.8), borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:map-point-bold-duotone" sx={{ width: 14, color: 'secondary.main' }} />
                      <Typography variant="caption" fontWeight={900} color="text.secondary">{customer.Branch?.name?.toUpperCase() || 'MAIN HUB'}</Typography>
                    </Stack>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                      variant="soft"
                      icon={<Iconify icon={status.icon} />}
                      sx={{ fontWeight: 900, borderRadius: 1, height: 24, fontSize: '0.65rem' }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
