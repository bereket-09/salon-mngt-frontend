import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function NotFoundView() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#05060A',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(154, 123, 79, 0.05) 0%, transparent 70%)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 5, display: 'inline-flex', position: 'relative', width: '100%', justifyContent: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '8rem' },
                fontWeight: 900,
                color: alpha('#fff', 0.03),
                lineHeight: 1,
                letterSpacing: { xs: -4, md: -10 }
              }}
            >
              404
            </Typography>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              zIndex: 5
            }}>
              <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -2, color: 'white' }}>
                Lost in <Box component="span" sx={{ color: '#9A7B4F' }}>Style</Box>
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 700, mt: 2, opacity: 0.8 }}>
                The page you are looking for has been moved or doesn't exist.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 8 }}>
            <Button
              href="/"
              variant="contained"
              component={RouterLink}
              size="large"
              startIcon={<Iconify icon="solar:home-2-linear" />}
              sx={{
                height: 60,
                px: 6,
                borderRadius: 1.5,
                fontWeight: 900,
                fontSize: '1.1rem',
                bgcolor: '#9A7B4F',
                color: 'white',
                boxShadow: '0 10px 40px rgba(154, 123, 79, 0.2)',
                '&:hover': { bgcolor: '#7A6038', transform: 'translateY(-2px)' },
                transition: '0.3s'
              }}
            >
              Return to Dashboard
            </Button>
          </Box>

          <Typography variant="caption" sx={{ display: 'block', mt: 10, color: 'text.disabled', fontWeight: 800, letterSpacing: 3 }}>
            MILANA BOUTIQUE SALON • ADDIS ABABA
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
