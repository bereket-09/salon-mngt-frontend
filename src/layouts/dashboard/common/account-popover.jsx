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
import { useKeycloak } from '@react-keycloak/web'; // Ensure this hook is imported
import { useRouter } from 'src/routes/hooks';

import { accountMock } from 'src/_mock/account';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
    route: '/',
  },
  // {
  //   label: 'Profile',
  //   icon: 'eva:person-fill',
  //   route: '/profile', // Assuming a route for profile
  // },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
    route: '/setting', // Assuming a route for settings
  },
];
// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const { keycloak } = useKeycloak(); // Call useKeycloak here inside the component
  const router = useRouter();
  const account = JSON.parse(localStorage.getItem('userData'));

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMenuItemClick = (route) => {
    // Navigate to the selected route
    router.push(route); // Use this if using react-router v6
    // router.push(route); // Use this if using custom router hook
    handleClose();
  };

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if (confirmLogout) {
      // Clear the token and user data from local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      // Clear the Keycloak session
      if (keycloak) {
        keycloak.logout({
          redirectUri: `${window.location.origin}/`, // Redirect to login page after logout
        });
      } else {
        // If Keycloak is not initialized, just redirect manually
        window.location.href = '/';
      }

      // Show logout success message
      alert('Logged out successfully');

      // Close any open menu (if applicable)
      setOpen(null);
    } else {
      // Do nothing if user cancels
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
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={accountMock.photoURL}
          alt={account.username}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {account.username.charAt(0).toUpperCase()}
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
            ml: 0.75,
            width: 200,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {account.username}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {account.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem key={option.label} onClick={() => handleMenuItemClick(option.route)}>
            {/* <Iconify icon={option.icon} /> */}
            {option.label}
          </MenuItem>
        ))}

        <Divider sx={{ borderStyle: 'dashed', m: 0 }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleLogout}
          sx={{ typography: 'body2', color: 'error.main', py: 1.5 }}
        >
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
