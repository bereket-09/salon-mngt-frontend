/* eslint-disable perfectionist/sort-imports */
import { useEffect } from 'react';
import PropTypes from 'prop-types';

// External imports (MUI)
import { Box, Stack, Drawer, Divider, Typography, ListItemButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Internal imports (Hooks and Components)
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useResponsive } from 'src/hooks/use-responsive';

// Mock data and other components
// import { accountMock } from 'src/_mock/account';
import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';

// Layout config and navigation
import { NAV } from './config-layout';
import navConfig from './config-navigation';

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  // const account = JSON.parse(localStorage.getItem('userData')) || accountMock;
  const upLg = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
  }, [pathname, openNav, onCloseNav]);

  // const renderAccount = (
  //   <Box
  //     sx={{
  //       my: 3,
  //       mx: 2.5,
  //       py: 2,
  //       px: 2.5,
  //       display: 'flex',
  //       borderRadius: 1.5,
  //       alignItems: 'center',
  //       bgcolor: (theme) => alpha(theme.palette.primary.light, 0.1),
  //       boxShadow: 1,
  //     }}
  //   >
  //     <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
  //       <Iconify
  //         icon="mdi:faq"
  //         style={{ color: '#fff', fontSize: '48px', transform: 'scale(1.2)' }}
  //       />
  //     </Avatar>
  //     <Box sx={{ ml: 2 }}>
  //       <Typography variant="subtitl" sx={{ fontWeight: 'bold' }}>
  //         {account.name?.toUpperCase()}
  //       </Typography>
  //       <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //         {account.roles?.[0] || account.role}
  //       </Typography>
  //     </Box>
  //   </Box>
  // );

  const renderAccount='' 

  const renderMenu = (
    <Stack component="nav" spacing={1} sx={{ px: 2, py: 1 }}>
      {navConfig.map((item) =>
        item.children ? (
          <Box key={item.title}>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                fontWeight: 'bold',
              }}
            >
              <Iconify
                icon={item.icon}
                sx={{ width: 20, height: 20, mr: 1, color: 'primary.main' }}
              />
              {item.title}
            </Typography>
           
            <Divider />
            <Stack spacing={1} sx={{ pl: 2 }}>
              {item.children.map((child) => (
                <NavItem key={child.title} item={child} />
              ))}
            </Stack>
            <br />
          </Box>
        ) : (
          <NavItem key={item.title} item={item} />
        )
      )}
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

      <Logo sx={{ mt: 1, ml: 1, mb: 0 }} />

      {renderAccount}
      {renderMenu}
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
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
            bgcolor: 'background.paper',
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
  const active = item.path === pathname;

  return (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 48,
        borderRadius: 1,
        typography: 'body2',
        color: active ? 'primary.main' : 'text.secondary',
        fontWeight: active ? 'fontWeightBold' : 'fontWeightMedium',
        bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
        },
        pl: 3,
      }}
    >
      {active && (
        <Iconify
          // icon="mynaui:asterisk-circle"
          icon="grommet-icons:checkbox-selected"
          style={{ color: 'primary.main', fontSize: '20px', marginRight: '8px' }}
        />
      )}
      <Iconify
        icon={item.icon}
        sx={{
          width: 24,
          height: 24,
          mr: 2,
          color: active ? 'primary.main' : 'text.secondary',
        }}
      />
      {item.title}
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};

// /* eslint-disable perfectionist/sort-imports */
// import { useEffect } from 'react';
// import PropTypes from 'prop-types';

// // External imports (MUI)
// import { Box, Stack, Drawer, Avatar, Divider, Typography, ListItemButton } from '@mui/material';
// import { alpha } from '@mui/material/styles';

// // Internal imports (Hooks and Components)
// import { usePathname } from 'src/routes/hooks';
// import { RouterLink } from 'src/routes/components';
// import { useResponsive } from 'src/hooks/use-responsive';

// // Mock data and other components
// import { accountMock } from 'src/_mock/account';
// import Logo from 'src/components/logo';
// import Scrollbar from 'src/components/scrollbar';

// // Layout config and navigation
// import { NAV } from './config-layout';
// import navConfig from './config-navigation';

// // ----------------------------------------------------------------------

// export default function Nav({ openNav, onCloseNav }) {
//   const pathname = usePathname();
//   const account = JSON.parse(localStorage.getItem('userData'));
//   const upLg = useResponsive('up', 'lg');

//   useEffect(() => {
//     if (openNav) {
//       onCloseNav();
//     }
//   }, [pathname, openNav, onCloseNav]);

//   const renderAccount = (
//     <Box
//       sx={{
//         my: 3,
//         mx: 2.5,
//         py: 2,
//         px: 2.5,
//         display: 'flex',
//         borderRadius: 1.5,
//         alignItems: 'center',
//         bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
//       }}
//     >
//       <Avatar src={accountMock.photoURL} alt="photoURL" />
//       <Box sx={{ ml: 2 }}>
//         <Typography variant="subtitle2">{account.username}</Typography>
//         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//           {account.roles[0]}
//         </Typography>
//       </Box>
//     </Box>
//   );

//   const renderMenu = (
//     <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
//       {navConfig.map((item) =>
//         item.children ? (
//           <Box key={item.title}>
//             <Typography variant="h6" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
//               <Box component="span" sx={{ mr: 2 }}>
//                 {item.icon}
//               </Box>
//               {item.title}
//             </Typography>
//             <Divider />
//             <Stack spacing={1} sx={{ pl: 1 }}>
//               {item.children.map((child) => (
//                 <NavItem key={child.title} item={child} />
//               ))}
//             </Stack>
//           </Box>
//         ) : (
//           <NavItem key={item.title} item={item} />
//         )
//       )}
//     </Stack>
//   );

//   const renderContent = (
//     <Scrollbar
//       sx={{
//         height: 1,
//         '& .simplebar-content': {
//           height: 1,
//           display: 'flex',
//           flexDirection: 'column',
//         },
//       }}
//     >
//       <Logo sx={{ mt: 3, ml: 4 }} />
//       {renderAccount}
//       {renderMenu}
//     </Scrollbar>
//   );

//   return (
//     <Box sx={{ flexShrink: { lg: 0 }, width: { lg: NAV.WIDTH } }}>
//       {upLg ? (
//         <Box
//           sx={{
//             height: 1,
//             position: 'fixed',
//             width: NAV.WIDTH,
//             borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
//           }}
//         >
//           {renderContent}
//         </Box>
//       ) : (
//         <Drawer
//           open={openNav}
//           onClose={onCloseNav}
//           PaperProps={{
//             sx: {
//               width: NAV.WIDTH,
//             },
//           }}
//         >
//           {renderContent}
//         </Drawer>
//       )}
//     </Box>
//   );
// }

// Nav.propTypes = {
//   openNav: PropTypes.bool,
//   onCloseNav: PropTypes.func,
// };

// // ----------------------------------------------------------------------

// function NavItem({ item }) {
//   const pathname = usePathname();
//   const active = item.path === pathname;

//   return (
//     <ListItemButton
//       component={RouterLink}
//       href={item.path}
//       sx={{
//         minHeight: 44,
//         borderRadius: 0.75,
//         typography: 'body2',
//         color: 'text.secondary',
//         textTransform: 'capitalize',
//         fontWeight: 'fontWeightMedium',
//         ...(active && {
//           color: 'primary.main',
//           fontWeight: 'fontWeightSemiBold',
//           bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
//           '&:hover': {
//             bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
//           },
//         }),
//       }}
//     >
//       <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
//         {/* If there is no icon for individual items, just leave this empty */}
//       </Box>
//       <Box component="span">{item.title}</Box>
//     </ListItemButton>
//   );
// }

// NavItem.propTypes = {
//   item: PropTypes.object,
// };
