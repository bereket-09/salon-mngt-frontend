/* eslint-disable */
/* eslint-disable perfectionist/sort-imports */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// External imports (MUI)
import {
  Box,
  Stack,
  Drawer,
  Divider,
  Popover,
  MenuItem,
  Typography,
  ListItemButton,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// Internal imports (Hooks and Components)
import { usePathname, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useResponsive } from 'src/hooks/use-responsive';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import AttendanceClock from './common/attendance-clock';

// Layout config and navigation
import { NAV } from './config-layout';
import navConfig from './config-navigation';

export default function Nav({ openNav, onCloseNav, collapsed = false, onToggleCollapse }) {
  const pathname = usePathname();
  const router = useRouter();
  const upLg = useResponsive('up', 'lg');
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  // Active branch surfaced prominently in the account block.
  const branchName = localStorage.getItem('selectedBranchName');

  const [accountMenu, setAccountMenu] = useState(null);
  const handleOpenAccount = (event) => setAccountMenu(event.currentTarget);
  const handleCloseAccount = () => setAccountMenu(null);

  const handleAccountNav = (route) => {
    router.push(route);
    handleCloseAccount();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      router.push('/login');
      handleCloseAccount();
    }
  };

  useEffect(() => {
    onCloseNav();
  }, [pathname]);

  const renderAccount = (mini) => (
    <Box sx={{ px: mini ? 0 : 3, mb: 2.5, display: 'flex', flexDirection: 'column', alignItems: mini ? 'center' : 'stretch' }}>
      <Tooltip title={mini ? `${userData.name || 'User'} · ${userData.role || 'Staff'}` : ''} placement="right">
        <ListItemButton
          onClick={handleOpenAccount}
          sx={{
            p: 0,
            minHeight: 44,
            borderRadius: 0,
            alignItems: 'center',
            justifyContent: mini ? 'center' : 'flex-start',
            width: mini ? 'auto' : '100%',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: 'transparent' },
          }}
        >
          <Avatar
            variant="square"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '4px',
              bgcolor: 'transparent',
              color: 'secondary.main',
              border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
              fontFamily: (theme) => theme.typography.h4.fontFamily,
              fontWeight: 600,
              fontSize: '1.05rem',
            }}
          >
            {userData.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          {!mini && (
            <>
              <Box sx={{ ml: 1.5, minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ color: 'common.white', fontWeight: 600, fontSize: '0.825rem' }}
                >
                  {userData.name || 'User'}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    display: 'block',
                    color: 'secondary.main',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                  }}
                >
                  {userData.role || 'Staff'}
                </Typography>
              </Box>
              <Iconify
                icon="solar:alt-arrow-down-linear"
                width={16}
                sx={{ color: alpha('#FFFFFF', 0.4), flexShrink: 0 }}
              />
            </>
          )}
        </ListItemButton>
      </Tooltip>

      {!mini && branchName && (
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              display: 'block',
              color: alpha('#FFFFFF', 0.4),
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              mb: 0.25,
            }}
          >
            Branch
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:shop-linear" width={16} sx={{ color: 'secondary.main', flexShrink: 0 }} />
            <Typography
              noWrap
              sx={{ color: 'common.white', fontWeight: 500, fontSize: '0.8125rem' }}
            >
              {branchName}
            </Typography>
          </Stack>
        </Box>
      )}

      <Popover
        open={!!accountMenu}
        anchorEl={accountMenu}
        onClose={handleCloseAccount}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 1, width: 210, p: 0.5, borderRadius: 1 } }}
      >
        <MenuItem onClick={() => handleAccountNav('/profile')} sx={{ borderRadius: 0.5, fontWeight: 500 }}>
          <Iconify icon="solar:user-id-linear" sx={{ mr: 1.5 }} width={20} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => handleAccountNav('/setting')} sx={{ borderRadius: 0.5, fontWeight: 500 }}>
          <Iconify icon="solar:settings-linear" sx={{ mr: 1.5 }} width={20} />
          General Settings
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: 0.5, fontWeight: 500, color: 'error.main' }}>
          <Iconify icon="solar:logout-2-linear" sx={{ mr: 1.5 }} width={20} />
          Logout
        </MenuItem>
      </Popover>
    </Box>
  );

  const [openGroups, setOpenGroups] = useState({
    Overview: true,
    Operations: true,
    Management: true,
    Financials: true,
    'My Workspace': true,
  });

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const visibleChildren = (item) =>
    (item.children || []).filter((child) => !child.roles || child.roles.includes(userData.role));

  const renderMenu = (mini) => (
    <Stack
      component="nav"
      spacing={mini ? 0.5 : 0.25}
      sx={{ px: mini ? 1 : 2, pb: 3, alignItems: mini ? 'center' : 'stretch' }}
    >
      {navConfig
        .filter((item) => !item.roles || item.roles.includes(userData.role))
        .map((item) => {
          // Collapsed rail: flatten groups to icon-only items separated by a hairline.
          if (mini) {
            const kids = item.children ? visibleChildren(item) : [item];
            return (
              <Box key={item.title} sx={{ width: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {item.children && <Divider flexItem sx={{ borderColor: alpha('#FFFFFF', 0.08), my: 0.75, width: 28, mx: 'auto' }} />}
                {kids.map((child) => (
                  <NavItem key={child.title} item={child} mini />
                ))}
              </Box>
            );
          }

          const isOpen = openGroups[item.title];
          return item.children ? (
            <Box key={item.title} sx={{ mb: 1.5 }}>
              <ListItemButton
                onClick={() => toggleGroup(item.title)}
                sx={{
                  px: 1,
                  minHeight: 32,
                  borderRadius: 0,
                  color: alpha('#FFFFFF', 0.4),
                  '&:hover': { bgcolor: 'transparent', color: alpha('#FFFFFF', 0.6) },
                }}
              >
                <Typography
                  sx={{
                    flexGrow: 1,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'inherit',
                  }}
                >
                  {item.title}
                </Typography>
                <Iconify
                  icon={isOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                  sx={{ width: 14, height: 14 }}
                />
              </ListItemButton>
              <Collapse in={isOpen} unmountOnExit>
                <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                  {visibleChildren(item).map((child) => (
                    <NavItem key={child.title} item={child} />
                  ))}
                </Stack>
              </Collapse>
            </Box>
          ) : (
            <NavItem key={item.title} item={item} />
          );
        })}
    </Stack>
  );

  // Logo + collapse toggle. The toggle only shows on desktop (where collapsing applies).
  const renderLogo = (mini) => (
    <Stack
      direction={mini ? 'column' : 'row'}
      alignItems="center"
      justifyContent={mini ? 'center' : 'space-between'}
      spacing={mini ? 1 : 0}
      sx={{ px: mini ? 0 : 3, pt: 4, pb: 3 }}
    >
      <Typography
        variant="h3"
        sx={{ color: 'common.white', fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1 }}
      >
        {mini ? 'M' : 'Milana'}
        <Box component="span" sx={{ color: 'secondary.main', ml: '2px', fontSize: '1em' }}>.</Box>
      </Typography>
      {upLg && onToggleCollapse && (
        <Tooltip title={mini ? 'Expand menu' : 'Collapse menu'} placement="right">
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            sx={{ color: alpha('#FFFFFF', 0.5), '&:hover': { color: 'common.white', bgcolor: alpha('#FFFFFF', 0.08) } }}
          >
            <Iconify icon={mini ? 'solar:square-double-alt-arrow-right-linear' : 'solar:square-double-alt-arrow-left-linear'} width={20} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );

  const renderContent = (mini) => (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {renderLogo(mini)}

      <Divider sx={{ borderColor: alpha('#FFFFFF', 0.1), mb: 3 }} />

      {renderAccount(mini)}

      <Divider sx={{ borderColor: alpha('#FFFFFF', 0.1), mb: 2.5 }} />

      {renderMenu(mini)}
      <Box sx={{ flexGrow: 1 }} />
      {!mini && <AttendanceClock />}
    </Scrollbar>
  );

  const desktopWidth = collapsed ? NAV.W_MINI : NAV.WIDTH;

  return (
    <Box sx={{ flexShrink: { lg: 0 }, width: { lg: desktopWidth }, transition: 'width 0.25s ease' }}>
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: desktopWidth,
            transition: 'width 0.25s ease',
            bgcolor: 'background.sidebar',
            borderRight: '1px solid',
            borderColor: alpha('#FFFFFF', 0.1),
          }}
        >
          {renderContent(collapsed)}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
              bgcolor: 'background.sidebar',
              borderRight: 'none',
            },
          }}
        >
          {renderContent(false)}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item, mini }) {
  const pathname = usePathname();
  const active = item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path));

  const button = (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 44,
        borderRadius: mini ? 1 : 0,
        typography: 'body2',
        color: active ? 'common.white' : alpha('#FFFFFF', 0.55),
        fontWeight: active ? 600 : 400,
        position: 'relative',
        transition: 'color 0.2s ease',
        ...(mini
          ? {
              width: 44,
              justifyContent: 'center',
              px: 0,
              bgcolor: active ? alpha('#FFFFFF', 0.08) : 'transparent',
            }
          : {
              pl: 2,
              pr: 1.5,
              bgcolor: 'transparent',
              borderLeft: '2px solid',
              borderColor: active ? 'secondary.main' : 'transparent',
            }),
        '&:hover': {
          bgcolor: mini ? alpha('#FFFFFF', 0.08) : 'transparent',
          color: active ? 'common.white' : alpha('#FFFFFF', 0.85),
        },
      }}
    >
      {item.icon && (
        <Iconify
          icon={item.icon}
          sx={{
            width: 19,
            height: 19,
            mr: mini ? 0 : 1.5,
            color: active ? 'secondary.main' : 'inherit',
          }}
        />
      )}
      {!mini && (
        <Box component="span" sx={{ flexGrow: 1, letterSpacing: 0.1, fontSize: '0.8125rem' }}>
          {item.title}
        </Box>
      )}
    </ListItemButton>
  );

  return mini ? (
    <Tooltip title={item.title} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
  mini: PropTypes.bool,
};
