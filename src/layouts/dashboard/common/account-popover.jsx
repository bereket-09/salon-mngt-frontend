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
    icon: 'eva:home-fill',
    route: '/',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
    route: '/setting',
  },
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
          width: 40,
          height: 40,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          },
          ...(open && {
            bgcolor: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          // src={accountMock.photoURL}
          // alt={account.username}
          sx={{
            width: 40,
            height: 40,
            border: (theme) => `solid 1px ${theme.palette.background.default}`,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'secondary.main',
            },
          }}
        >
          <Iconify
            icon="ri:account-pin-circle-fill"
            style={{ color: '#fff', fontSize: '48px', transform: 'scale(1.5)' }}
          />
          {/* {account.username.charAt(0).toUpperCase()} */}
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
            mt: 1,
            width: 240,
            boxShadow: 4,
            borderRadius: 1.5,
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center', justifyContent: 'center' }}>
          {/* <Avatar
            src={accountMock.photoURL}
            alt={account.username}
            sx={{
              width: 44,
              height: 44,
              mb: 1,
            }}
          /> */}

          <Iconify
            icon="ix:panel-ipc-question"
            style={{ color: '#00A76F', fontSize: '48px', transform: 'scale(2.4)' }}
          />

          <br />
          <br />
          <Typography variant="subtitle1">{account.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {account.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => handleMenuItemClick(option.route)}
            sx={{ px: 2.5 }}
          >
            <Iconify icon={option.icon} sx={{ mr: 2, width: 20, height: 20 }} />
            {option.label}
          </MenuItem>
        ))}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            typography: 'body2',
            color: 'error.main',
            py: 1.5,
          }}
        >
          <Iconify icon="ri:logout-circle-line" sx={{ mr: 2, width: 20, height: 20 }} />
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}

