import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  // Fetch user data from local storage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData'); // Clear user data from local storage
    window.location.href = '/login'; // Redirect to login page
  };

  const openLogoutDialog = () => setLogoutDialogOpen(true);
  const closeLogoutDialog = () => setLogoutDialogOpen(false);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          {/* Profile Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}>
              <Iconify
                icon="flowbite:profile-card-outline"
                sx={{ width: 50, height: 50, color: 'white', transform: 'scale(1.2)' }}
              />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              {userData.username || 'Guest'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {userData.email || 'Email not provided'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* User Details */}
          <Grid container spacing={2} sx={{ mb: 3, paddingLeft: 2 }}>
            {/* Full Name */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:card-account-details"
                  sx={{ width: 20, height: 20, color: 'primary.main' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Full Name:
                </Typography>
              </Box>
              <Typography variant="body2">{userData.name || 'Not Provided'}</Typography>
            </Grid>

            {/* Username */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:account-circle"
                  sx={{ width: 20, height: 20, color: 'primary.main' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Username:
                </Typography>
              </Box>
              <Typography variant="body2">{userData.username || 'Not Provided'}</Typography>
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="mdi:email" sx={{ width: 20, height: 20, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="bold">
                  Email:
                </Typography>
              </Box>
              <Typography variant="body2">{userData.email || 'Not Provided'}</Typography>
            </Grid>

            {/* Email Verified */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:shield-check"
                  sx={{ width: 20, height: 20, color: 'primary.main' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Email Verified:
                </Typography>
              </Box>
              <Typography variant="body2">{userData.email_verified ? 'Yes' : 'No'}</Typography>
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:account-key"
                  sx={{ width: 20, height: 20, color: 'primary.main' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Role:
                </Typography>
              </Box>
              <Typography variant="body2">
                {userData.roles?.join(', ') || 'No Role Assigned'}
              </Typography>
            </Grid>

            {/* Token Expiry */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="mdi:timer" sx={{ width: 20, height: 20, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="bold">
                  Token Expiry:
                </Typography>
              </Box>
              <Typography variant="body2">
                {userData.exp ? new Date(userData.exp * 1000).toLocaleString() : 'Unknown'}
              </Typography>
            </Grid>

            {/* Issuer */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="mdi:domain" sx={{ width: 20, height: 20, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="bold">
                  Issuer:
                </Typography>
              </Box>
              <Typography variant="body2">{userData.iss || 'Not Provided'}</Typography>
            </Grid>

            {/* Refresh Token */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="mdi:refresh" sx={{ width: 20, height: 20, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="bold">
                  Refresh Token:
                </Typography>
              </Box>
              <Typography variant="body2">
                {userData.refreshToken && userData.refreshToken.length > 50
                  ? `${userData.refreshToken.slice(0, 50)}...`
                  : userData.refreshToken || 'Not Provided'}
              </Typography>
            </Grid>

            {/* Session ID */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:identifier"
                  sx={{ width: 20, height: 20, color: 'primary.main' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Session ID:
                </Typography>
              </Box>
              <Typography variant="body2">{userData.sid || 'Not Provided'}</Typography>
            </Grid>

            {/* Issued At */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:clock-outline"
                  sx={{ width: 20, height: 20, color: 'primary.main' }}
                />
                <Typography variant="body1" fontWeight="bold">
                  Issued At:
                </Typography>
              </Box>
              <Typography variant="body2">
                {userData.iat ? new Date(userData.iat * 1000).toLocaleString() : 'Unknown'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              paddingLeft: 2,
              paddingRight: 5,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(-1)}
              startIcon={<Iconify icon="mdi:arrow-left" sx={{ width: 20, height: 20 }} />}
              
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={openLogoutDialog}
              startIcon={<Iconify icon="mdi:logout" sx={{ width: 20, height: 20 }} />}
              sx={{ px: 4 }}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={isLogoutDialogOpen}
        onClose={closeLogoutDialog}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
