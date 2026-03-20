/* eslint-disable */
/* eslint-disable perfectionist/sort-imports */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// External imports (MUI)
import { Box, Stack, Drawer, Typography, ListItemButton, Avatar, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Internal imports (Hooks and Components)
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useResponsive } from 'src/hooks/use-responsive';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import AttendanceClock from './common/attendance-clock';

// Layout config and navigation
import { NAV } from './config-layout';
import navConfig from './config-navigation';

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  useEffect(() => {
    onCloseNav();
  }, [pathname]);

  const renderAccount = (
    <Box sx={{ px: 2, mb: 3 }}>
      <Box
        sx={{
          py: 1,
          px: 1.2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            border: '1px solid rgba(200, 151, 42, 0.5)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
          }
        }}
      >
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36, 
            bgcolor: 'secondary.main', 
            fontWeight: 900,
            fontSize: '0.85rem',
            boxShadow: '0 2px 6px rgba(200, 151, 42, 0.2)',
          }}
        >
          {userData.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ ml: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ color: 'white', fontWeight: 900, fontSize: '0.8rem', letterSpacing: 0.2 }}>
            {userData.name || 'User'}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'secondary.main', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.575rem', opacity: 0.8 }}>
            {userData.role || 'Staff'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const [openGroups, setOpenGroups] = useState({ 
    'Overview': true, 
    'Operations': true,
    'Management': true,
    'Financials': true,
    'Personal Workspace': true
  });

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2, pb: 4 }}>
      {navConfig
        .filter((item) => !item.roles || item.roles.includes(userData.role))
        .map((item) => {
           const isCollapsed = openGroups[item.title];
           return item.children ? (
            <Box key={item.title} sx={{ mb: 1.5 }}>
              <ListItemButton
                onClick={() => toggleGroup(item.title)}
                sx={{
                  px: 1.5,
                  minHeight: 32,
                  borderRadius: 1.5,
                  color: 'grey.500',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' }
                }}
              >
                <Iconify 
                  icon={item.icon || 'solar:folder-bold-duotone'} 
                  sx={{ width: 18, height: 18, mr: 1.5, color: isCollapsed ? 'secondary.main' : 'inherit' }} 
                />
                <Typography
                  variant="overline"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 900,
                    fontSize: '0.625rem',
                    letterSpacing: '0.1em',
                    color: isCollapsed ? 'white' : 'inherit',
                  }}
                >
                  {item.title}
                </Typography>
                <Iconify 
                  icon={isCollapsed ? "solar:alt-arrow-down-bold-duotone" : "solar:alt-arrow-right-bold-duotone"}
                  sx={{ width: 14, height: 14 }}
                />
              </ListItemButton>
              <Collapse in={isCollapsed} unmountOnExit sx={{ ml: 1, borderLeft: '1px solid rgba(255, 255, 255, 0.05)', mt: 1 }}>
                <Stack spacing={0.2} sx={{ pl: 1 }}>
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
          )
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
      <Box sx={{ px: 3, pt: 4, pb: 3 }}>
        <Typography variant="h4" sx={{ 
          color: 'white', 
          fontWeight: 950, 
          letterSpacing: -2, 
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontFamily: "'Outfit', sans-serif" 
        }}>
          MILANA<Box component="span" sx={{ color: 'secondary.main', fontSize: '1.2em' }}>.</Box>
        </Typography>
      </Box>

      {renderAccount}
      {renderMenu}
      <Box sx={{ flexGrow: 1 }} />
      <AttendanceClock />
    </Scrollbar>
  );

  return (
    <Box sx={{ flexShrink: { lg: 0 }, width: { lg: NAV.WIDTH } }}>
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            bgcolor: 'primary.darker',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
        borderRadius: 1.5,
        typography: 'body2',
        color: active ? 'white' : 'grey.600',
        fontWeight: active ? 900 : 700,
        px: 2,
        mb: 0.5,
        transition: 'all 0.25s ease',
        background: active 
          ? `linear-gradient(90deg, ${alpha('#C8972A', 0.12)} 0%, rgba(200, 151, 42, 0) 100%)` 
          : 'transparent',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          transform: 'translateX(3px)',
          color: active ? 'white' : 'grey.300',
          '& .iconify': { color: 'secondary.main' }
        },
      }}
    >
      {item.icon && (
        <Iconify
          icon={item.icon}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            transition: 'all 0.3s ease',
            color: active ? 'secondary.main' : 'inherit',
          }}
        />
      )}
      <Box component="span" sx={{ flexGrow: 1, letterSpacing: 0.2, fontSize: '0.775rem' }}>{item.title}</Box>
      {active && (
        <Box
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            boxShadow: '0 0 8px #C8972A',
          }}
        />
      )}
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};
