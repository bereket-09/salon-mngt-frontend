import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { useResponsive } from 'src/hooks/use-responsive';

import { NAV, HEADER, BOTTOM_NAV } from './config-layout';

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, navCollapsed = false, ...other }) {
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
        // Editorial whitespace: generous gutters even on mobile.
        px: 2.5,
        py: `${HEADER.H_MOBILE + SPACING * 2}px`,
        ...(hasBottomNav && {
          pb: `${BOTTOM_NAV.HEIGHT + SPACING * 2}px`,
        }),
        // Tablet tier: between mobile and desktop.
        ...(mdUp &&
          !lgUp && {
            px: 4,
            py: `${HEADER.H_TABLET + SPACING * 2}px`,
          }),
        ...(lgUp && {
          px: 6,
          py: `${HEADER.H_DESKTOP + SPACING * 3}px`,
          width: `calc(100% - ${navCollapsed ? NAV.W_MINI : NAV.WIDTH}px)`,
          transition: 'width 0.25s ease',
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
  navCollapsed: PropTypes.bool,
};
