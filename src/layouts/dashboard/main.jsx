import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { useResponsive } from 'src/hooks/use-responsive';

import { NAV, HEADER, BOTTOM_NAV } from './config-layout';

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, ...other }) {
  const lgUp = useResponsive('up', 'lg');
  const mdUp = useResponsive('up', 'md');
  const mdDown = useResponsive('down', 'md');

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  // Employees on mobile/tablet-down get a fixed bottom nav; pad so content clears it.
  const hasBottomNav = mdDown && userData.role === 'employee';

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(hasBottomNav && {
          pb: `${BOTTOM_NAV.HEIGHT + SPACING * 2}px`,
        }),
        // Tablet tier: between mobile and desktop.
        ...(mdUp &&
          !lgUp && {
            px: 1.5,
            py: `${HEADER.H_TABLET + SPACING}px`,
          }),
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
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
