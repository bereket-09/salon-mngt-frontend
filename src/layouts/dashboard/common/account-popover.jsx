/* eslint-disable perfectionist/sort-imports */
import { useState } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';

import { accountMock } from 'src/_mock/account';

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'solar:home-2-linear',
    route: '/',
  },
  {
    label: 'Profile Settings',
    icon: 'solar:user-id-linear',
    route: '/profile',
  },
  {
    label: 'General Settings',
    icon: 'solar:settings-linear',
    route: '/setting',
  }
];

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const router = useRouter();
  const account = JSON.parse(localStorage.getItem('userData')) || accountMock;

  const handleOpen = (event) => setOpen(event.currentTarget);
  const handleClose = () => setOpen(null);

  const handleMenuItemClick = (route) => {
    router.push(route);
    handleClose();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      alert('Logged out successfully');
      router.push('/login');
      setOpen(null);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          width: 40,
          height: 40,
        }}
      >
        <Avatar
          variant="square"
          sx={{
            width: 38,
            height: 38,
            borderRadius: '4px',
            bgcolor: 'transparent',
            color: 'secondary.main',
            border: (theme) =>
              `1px solid ${open ? theme.palette.secondary.main : alpha(theme.palette.secondary.main, 0.5)}`,
            fontFamily: (theme) => theme.typography.h4.fontFamily,
            fontWeight: 600,
            fontSize: '1.05rem',
            transition: (theme) => theme.transitions.create(['border-color']),
            '&:hover': {
              borderColor: 'secondary.main',
            },
          }}
        >
          {account.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.25,
            width: 240,
            boxShadow: 'none',
            borderRadius: 1,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              display: 'block',
              color: 'secondary.main',
              fontWeight: 700,
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              mb: 0.75,
            }}
          >
            {account.roles?.[0] || account.role || 'Account'}
          </Typography>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {account.name}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {account.email}
          </Typography>
        </Box>

        <Divider />

        {MENU_OPTIONS.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => handleMenuItemClick(option.route)}
            sx={{ px: 2, py: 1.25, fontWeight: 500 }}
          >
            <Iconify icon={option.icon} sx={{ mr: 2, width: 20, height: 20 }} />
            {option.label}
          </MenuItem>
        ))}

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            px: 2,
            typography: 'body2',
            color: 'error.main',
            py: 1.25,
            fontWeight: 500,
          }}
        >
          <Iconify icon="solar:logout-2-linear" sx={{ mr: 2, width: 20, height: 20 }} />
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}

