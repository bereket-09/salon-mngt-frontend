import React, { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import config from 'src/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Card,
  Stack,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  alpha,
  Divider,
  Container,
  Fade
} from '@mui/material';
import Iconify from 'src/components/iconify';

export default function LoginView() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: '#05060A',
    }}>
      {/* IMMERSIVE BACKGROUND ILLUSTRATION */}
      <Box
        component="img"
        src="/assets/new.svg"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.25, // Increased prominence
          zIndex: 0,
          mixBlendMode: 'screen',
          filter: 'contrast(1.2) brightness(0.8)',
          animation: 'pulseBackground 25s ease-in-out infinite',
        }}
      />

      {/* Luxury Gradient Overlay */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, transparent 0%, #05060A 90%)',
        zIndex: 1
      }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Fade in timeout={1500}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  letterSpacing: -5,
                  fontSize: { xs: '5rem', md: '7.5rem' },
                  lineHeight: 1,
                  mb: 1
                }}
              >
                MILANA<Box component="span" sx={{ color: '#C8972A' }}>.</Box>
              </Typography>
              <Typography variant="overline" sx={{ color: '#C8972A', fontWeight: 900, letterSpacing: 10, display: 'block', opacity: 0.9 }}>
                MANAGER LOGIN
              </Typography>
            </Box>
          </Fade>
        </Box>

        <Card sx={{
          p: { xs: 5, md: 10 },
          borderRadius: 4,
          boxShadow: '0 80px 160px rgba(0,0,0,0.8)',
          bgcolor: alpha('#0D0E1C', 0.92),
          backdropFilter: 'blur(40px)',
          border: '1px solid',
          borderColor: alpha('#C8972A', 0.2),
          animation: 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <Stack spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h2" fontWeight={900} color="white" letterSpacing={-1}>Login</Typography>
            <Typography variant="subtitle1" color="grey.500" fontWeight={600}>Enter your username and password</Typography>
          </Stack>

          <form onSubmit={handleSignIn}>
            <Stack spacing={4}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#C8972A' },
                  '& .MuiInputLabel-root': { color: 'grey.500', fontWeight: 700 },
                  '& .MuiInputBase-input': { color: 'white', fontWeight: 700, fontSize: '1.2rem', py: 1.5 }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#C8972A' },
                  '& .MuiInputLabel-root': { color: 'grey.500', fontWeight: 700 },
                  '& .MuiInputBase-input': { color: 'white', fontWeight: 700, fontSize: '1.2rem', py: 1.5 }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'grey.500' }}>
                        <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
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
                sx={{
                  height: 72,
                  bgcolor: '#C8972A',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  borderRadius: 2,
                  mt: 4,
                  boxShadow: '0 20px 40px rgba(200, 151, 42, 0.3)',
                  '&:hover': {
                    bgcolor: '#b08425',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 30px 60px rgba(200, 151, 42, 0.4)',
                  }
                }}
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 700 }}>
              Milana Salon Premium ERP System v4.0
            </Typography>
          </Box>
        </Card>
      </Container>

      <style>
        {`
          @keyframes pulseBackground {
            0% { transform: translate(-50%, -50%) scale(1); filter: contrast(1.2) brightness(0.8); }
            50% { transform: translate(-50%, -51%) scale(1.05); filter: contrast(1.4) brightness(1); }
            100% { transform: translate(-50%, -50%) scale(1); filter: contrast(1.2) brightness(0.8); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="dark" />
    </Box>
  );
}
