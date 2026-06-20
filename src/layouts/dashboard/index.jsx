import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Nav from './nav';
import Main from './main';
import Header from './header';
import BottomNav from './bottom-nav';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const [openNav, setOpenNav] = useState(false);
  // Desktop side-nav collapsed (icon-only rail). Persisted so it survives reloads
  // (the branch switcher reloads the page).
  const [navCollapsed, setNavCollapsed] = useState(() => {
    try { return localStorage.getItem('navCollapsed') === '1'; } catch { return false; }
  });
  const toggleCollapse = () => setNavCollapsed((c) => {
    const next = !c;
    try { localStorage.setItem('navCollapsed', next ? '1' : '0'); } catch { /* ignore */ }
    return next;
  });

  return (
    <>
      <Header onOpenNav={() => setOpenNav(true)} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Nav
          openNav={openNav}
          onCloseNav={() => setOpenNav(false)}
          collapsed={navCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <Main navCollapsed={navCollapsed}>{children}</Main>
      </Box>

      <BottomNav onOpenNav={() => setOpenNav(true)} />
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
