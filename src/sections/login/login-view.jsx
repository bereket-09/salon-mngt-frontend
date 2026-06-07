import React, { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import config from 'src/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Stack,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
} from '@mui/material';
import Iconify from 'src/components/iconify';

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ink = theme.palette.primary.main;
  const bronze = theme.palette.secondary.main;
  const bone = theme.palette.background.default;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('userData');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (['admin'].includes(user.role)) {
        router.push('/analytics');
      } else {
        router.push('/my-assignments');
      }
    }
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${config.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.user));
        toast.success('Welcome back!');

        // Redirect based on role
        if (['admin'].includes(result.user.role)) {
          router.push('/analytics');
        } else {
          router.push('/my-assignments');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Connection issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Shared flat input styling: hairline border, bronze focus outline.
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      bgcolor: theme.palette.common.white,
      fontFamily: theme.typography.fontFamily,
      fontSize: '1rem',
      '& fieldset': { borderColor: alpha(ink, 0.18) },
      '&:hover fieldset': { borderColor: alpha(bronze, 0.5) },
      '&.Mui-focused fieldset': { borderColor: bronze, borderWidth: '1.5px' },
    },
    '& .MuiInputBase-input': { py: 1.9, color: ink },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      fontSize: '0.95rem',
    },
    '& .MuiInputLabel-root.Mui-focused': { color: bronze },
  };

  // Micro-label used across the editorial layout.
  const microLabel = {
    textTransform: 'uppercase',
    letterSpacing: '0.32em',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: bronze,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: bone,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflowX: 'hidden',
      }}
    >
      {/* ── LEFT: editorial brand statement (desktop only) ───────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '50%',
          p: { md: 7, lg: 10 },
          borderRight: `1px solid ${alpha(ink, 0.08)}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 28, height: 1, bgcolor: bronze }} />
          <Typography sx={microLabel}>Milana Studio</Typography>
        </Stack>

        <Box sx={{ maxWidth: 520 }}>
          <Typography
            variant="h1"
            sx={{
              color: ink,
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              fontSize: { md: '3.4rem', lg: '4.6rem' },
            }}
          >
            The art of a{' '}
            <Box component="em" sx={{ color: bronze, fontStyle: 'italic' }}>
              well-run
            </Box>{' '}
            salon.
          </Typography>
          <Typography
            sx={{
              mt: 4,
              maxWidth: 420,
              color: theme.palette.text.secondary,
              fontSize: '1.05rem',
              lineHeight: 1.7,
            }}
          >
            A quiet, considered workspace for managing your studio &mdash;
            appointments, talent, and clientele, all in one refined place.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ ...microLabel, color: alpha(ink, 0.45) }}>
            Premium ERP &mdash; v4.0
          </Typography>
        </Stack>
      </Box>

      {/* ── RIGHT: the form ──────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 7, lg: 12 },
          py: { xs: 6, md: 0 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            '@media (prefers-reduced-motion: no-preference)': {
              animation: 'editorialFade 0.7s ease both',
            },
          }}
        >
          {/* Mobile brand mark */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ display: { xs: 'flex', md: 'none' }, mb: 5 }}
          >
            <Box sx={{ width: 28, height: 1, bgcolor: bronze }} />
            <Typography sx={microLabel}>Milana Studio</Typography>
          </Stack>

          <Typography sx={microLabel}>Welcome back</Typography>
          <Typography
            variant="h2"
            sx={{
              mt: 1.5,
              color: ink,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              fontSize: { xs: '2.4rem', sm: '2.9rem' },
            }}
          >
            Sign in
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              color: theme.palette.text.secondary,
              fontSize: '0.98rem',
            }}
          >
            Enter your credentials to access the studio.
          </Typography>

          <Box
            sx={{ width: 36, height: 1, bgcolor: alpha(ink, 0.15), my: 4 }}
          />

          <form onSubmit={handleSignIn}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                        sx={{
                          color: theme.palette.text.secondary,
                          width: 44,
                          height: 44,
                          '&:hover': { color: bronze, bgcolor: 'transparent' },
                        }}
                      >
                        <Iconify
                          icon={
                            showPassword
                              ? 'solar:eye-linear'
                              : 'solar:eye-closed-linear'
                          }
                          width={22}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                disableElevation
                endIcon={
                  !loading && (
                    <Iconify icon="solar:arrow-right-linear" width={20} />
                  )
                }
                sx={{
                  mt: 1,
                  height: 56,
                  bgcolor: ink,
                  color: theme.palette.common.white,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  borderRadius: 1,
                  textTransform: 'none',
                  transition: 'background-color 0.25s ease',
                  '&:hover': { bgcolor: bronze },
                  '&.Mui-disabled': {
                    bgcolor: alpha(ink, 0.4),
                    color: theme.palette.common.white,
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </form>

          <Typography
            sx={{
              mt: 5,
              fontSize: '0.8rem',
              color: alpha(ink, 0.4),
            }}
          >
            Milana Salon &mdash; Premium ERP System
          </Typography>
        </Box>
      </Box>

      <style>
        {`
          @keyframes editorialFade {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes editorialFade {
              from { opacity: 1; transform: none; }
              to { opacity: 1; transform: none; }
            }
          }
        `}
      </style>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="light" />
    </Box>
  );
}
