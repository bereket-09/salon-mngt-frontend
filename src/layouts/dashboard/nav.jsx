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

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const router = useRouter();
  const upLg = useResponsive('up', 'lg');
  const onlyTablet = useResponsive('between', 'md', 'lg');
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  // Width steps: tablet gets a slightly narrower rail than desktop.
  const navWidth = onlyTablet ? NAV.W_TABLET : NAV.WIDTH;

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

  const renderAccount = (
    <Box sx={{ px: 2, mb: 2 }}>
      <ListItemButton
        onClick={handleOpenAccount}
        sx={{
          p: 1.25,
          borderRadius: 1.5,
          alignItems: 'center',
          bgcolor: alpha('#FFFFFF', 0.04),
          border: '1px solid',
          borderColor: alpha('#FFFFFF', 0.08),
          '&:hover': {
            bgcolor: alpha('#FFFFFF', 0.06),
            borderColor: alpha('#C8972A', 0.4),
          },
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'secondary.main',
            fontWeight: 900,
            fontSize: '0.95rem',
          }}
        >
          {userData.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ ml: 1.25, minWidth: 0, flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ color: 'common.white', fontWeight: 800, fontSize: '0.825rem' }}
          >
            {userData.name || 'User'}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: 'secondary.main',
              textTransform: 'uppercase',
              fontWeight: 800,
              fontSize: '0.6rem',
              letterSpacing: 0.5,
            }}
          >
            {userData.role || 'Staff'}
          </Typography>
        </Box>
        <Iconify
          icon="solar:alt-arrow-down-bold"
          width={16}
          sx={{ color: 'grey.600', flexShrink: 0 }}
        />
      </ListItemButton>

      {branchName && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            mt: 1,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: alpha('#C8972A', 0.1),
            border: '1px solid',
            borderColor: alpha('#C8972A', 0.25),
          }}
        >
          <Iconify icon="solar:shop-bold-duotone" width={18} sx={{ color: 'secondary.main' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'grey.500', fontSize: '0.55rem', fontWeight: 700, letterSpacing: 0.5 }}
            >
              ACTIVE BRANCH
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ display: 'block', color: 'common.white', fontWeight: 800, fontSize: '0.7rem' }}
            >
              {branchName}
            </Typography>
          </Box>
        </Stack>
      )}

      <Popover
        open={!!accountMenu}
        anchorEl={accountMenu}
        onClose={handleCloseAccount}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 1, width: 200, p: 0.5 } }}
      >
        <MenuItem onClick={() => handleAccountNav('/profile')} sx={{ borderRadius: 1, fontWeight: 700 }}>
          <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1.5 }} width={20} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => handleAccountNav('/setting')} sx={{ borderRadius: 1, fontWeight: 700 }}>
          <Iconify icon="solar:settings-bold-duotone" sx={{ mr: 1.5 }} width={20} />
          General Settings
        </MenuItem>
        <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: 1, fontWeight: 700, color: 'error.main' }}>
          <Iconify icon="ri:logout-circle-line" sx={{ mr: 1.5 }} width={20} />
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

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 1.5, pb: 3 }}>
      {navConfig
        .filter((item) => !item.roles || item.roles.includes(userData.role))
        .map((item) => {
          const isOpen = openGroups[item.title];
          return item.children ? (
            <Box key={item.title} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => toggleGroup(item.title)}
                sx={{
                  px: 1.5,
                  minHeight: 36,
                  borderRadius: 1,
                  color: 'grey.500',
                  '&:hover': { bgcolor: alpha('#FFFFFF', 0.04) },
                }}
              >
                <Iconify
                  icon={item.icon || 'solar:folder-bold-duotone'}
                  sx={{ width: 18, height: 18, mr: 1.5, color: isOpen ? 'secondary.main' : 'inherit' }}
                />
                <Typography
                  variant="overline"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 800,
                    fontSize: '0.625rem',
                    letterSpacing: '0.08em',
                    color: isOpen ? 'common.white' : 'inherit',
                  }}
                >
                  {item.title}
                </Typography>
                <Iconify
                  icon={isOpen ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-right-bold'}
                  sx={{ width: 14, height: 14 }}
                />
              </ListItemButton>
              <Collapse in={isOpen} unmountOnExit>
                <Stack
                  spacing={0.25}
                  sx={{ mt: 0.5, ml: 2.25, pl: 1, borderLeft: '1px solid', borderColor: alpha('#FFFFFF', 0.08) }}
                >
                  {item.children
                    .filter((child) => !child.roles || child.roles.includes(userData.role))
                    .map((child) => (
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

  const renderContent = (
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
      <Box sx={{ px: 3, pt: 3.5, pb: 2.5 }}>
        <Typography
          variant="h4"
          sx={{
            color: 'common.white',
            fontWeight: 900,
            letterSpacing: -1.5,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          MILANA
          <Box component="span" sx={{ color: 'secondary.main', fontSize: '1.2em' }}>
            .
          </Box>
        </Typography>
      </Box>

      <Divider sx={{ borderColor: alpha('#FFFFFF', 0.08), mb: 2.5 }} />

      {renderAccount}

      <Divider sx={{ borderColor: alpha('#FFFFFF', 0.08), mb: 2 }} />

      {renderMenu}
      <Box sx={{ flexGrow: 1 }} />
      <AttendanceClock />
    </Scrollbar>
  );

  return (
    <Box sx={{ flexShrink: { lg: 0 }, width: { lg: navWidth } }}>
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: navWidth,
            bgcolor: 'primary.darker',
            borderRight: '1px solid',
            borderColor: alpha('#FFFFFF', 0.08),
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
              bgcolor: 'primary.darker',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const pathname = usePathname();
  const active = item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path));

  return (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 44,
        borderRadius: 1,
        typography: 'body2',
        color: active ? 'common.white' : 'grey.500',
        fontWeight: active ? 800 : 600,
        px: 2,
        position: 'relative',
        transition: 'all 0.2s ease',
        bgcolor: active ? alpha('#C8972A', 0.1) : 'transparent',
        '&:hover': {
          bgcolor: active ? alpha('#C8972A', 0.14) : alpha('#FFFFFF', 0.04),
          color: active ? 'common.white' : 'grey.300',
        },
        ...(active && {
          // Gold accent indicator on the left edge.
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -9,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 18,
            borderRadius: 1,
            bgcolor: 'secondary.main',
          },
        }),
      }}
    >
      {item.icon && (
        <Iconify
          icon={item.icon}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            color: active ? 'secondary.main' : 'inherit',
          }}
        />
      )}
      <Box component="span" sx={{ flexGrow: 1, letterSpacing: 0.2, fontSize: '0.8rem' }}>
        {item.title}
      </Box>
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};
