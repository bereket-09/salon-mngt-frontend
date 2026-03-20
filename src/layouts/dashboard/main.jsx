import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useResponsive } from 'src/hooks/use-responsive';

import { NAV, HEADER } from './config-layout';

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, ...other }) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.WIDTH}px)`,
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
      <Box sx={{ mt: 'auto', textAlign: 'center', py: 5, borderTop: '0px solid', borderColor: 'divider', pb: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: 1, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem' }}>
          Developed by <Box component="span" sx={{ color: 'secondary.main' }}>BZ Solutions</Box>
        </Typography>
      </Box>
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
