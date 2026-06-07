import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { usePathname, useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';

import { BOTTOM_NAV } from './config-layout';

// ----------------------------------------------------------------------

const TABS = [
  { label: 'My Jobs', value: '/my-assignments', icon: 'solar:checklist-minimalistic-bold-duotone' },
  { label: 'Earnings', value: '/my-earnings', icon: 'solar:wallet-money-bold-duotone' },
  { label: 'Attendance', value: '/my-attendance', icon: 'solar:clock-circle-bold-duotone' },
  { label: 'More', value: '__more__', icon: 'solar:hamburger-menu-bold-duotone' },
];

export default function BottomNav({ onOpenNav }) {
  const router = useRouter();
  const pathname = usePathname();
  const mdDown = useResponsive('down', 'md');

  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  // Only employees on mobile/tablet-down see the bottom bar.
  if (!mdDown || userData.role !== 'employee') {
    return null;
  }

  // Resolve which tab is active from the current route ("More" never wins).
  const current =
    TABS.find((tab) => tab.value !== '__more__' && pathname.startsWith(tab.value))?.value || false;

  const handleChange = (_event, value) => {
    if (value === '__more__') {
      onOpenNav();
      return;
    }
    router.push(value);
  };

  return (
    <Paper
      square
      elevation={0}
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
        display: { xs: 'block', md: 'none' },
        zIndex: (theme) => theme.zIndex.appBar + 1,
        bgcolor: 'primary.darker',
        borderTop: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        boxShadow: (theme) => theme.customShadows.z16,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={current}
        onChange={handleChange}
        showLabels
        sx={{
          height: BOTTOM_NAV.HEIGHT,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 44,
            color: 'grey.500',
            '&.Mui-selected': { color: 'secondary.main' },
          },
          '& .MuiBottomNavigationAction-label': {
            fontWeight: 800,
            fontSize: '0.65rem',
            letterSpacing: 0.2,
            '&.Mui-selected': { fontSize: '0.65rem' },
          },
        }}
      >
        {TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={<Iconify icon={tab.icon} width={24} />}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

BottomNav.propTypes = {
  onOpenNav: PropTypes.func,
};
