import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { RouterLink } from 'src/routes/components';
import Logo from 'src/components/logo';
import config from 'src/config'; // Import the config file
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    // Fetch user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.roles) {
      // Check if the user has the "admin" or "trivia-admin" role
      const hasAdminRole = userData.roles.includes('admin');
      const hasTriviaAdminRole = userData.roles.includes('trivia-admin');
      if (hasAdminRole || hasTriviaAdminRole) {
        setUserRoles(userData.roles); // Set roles if they have necessary permissions
      }
    }

    // Fetch settings from API
    fetch(`${config.BASE_URL}/api/misc_settings`)
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 1000) {
          setSettings(data.data);
        } else {
          console.error('Failed to fetch settings');
        }
      })
      .catch((error) => console.error('Error fetching settings:', error));
  }, []);

  const handleEditClick = (keyName) => {
    setIsEditing(keyName);
  };

  const handleSaveClick = (keyName) => {
    const updatedValue = document.getElementById(`value-${keyName}`).value;

    // Send updated value to the API
    fetch(`${config.BASE_URL}/api/misc_settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyName, value: updatedValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 1000) {
          // Update the settings state with the new value
          setSettings((prevSettings) =>
            prevSettings.map((setting) =>
              setting.keyName === keyName ? { ...setting, value: updatedValue } : setting
            )
          );
          setIsEditing(null);
        } else {
          console.error('Failed to update setting');
        }
      })
      .catch((error) => console.error('Error updating setting:', error));
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 6, minHeight: '100vh', backgroundColor: 'background.default' }}
    >
      {/* Page Header */}
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          mb: 5,
          textAlign: 'center',
          color: 'primary.main',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Platform Settings
      </Typography>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 6,
        }}
      >
        <Table>
          {/* Table Header */}
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  fontSize: '1.1rem',
                  color: 'text.primary',
                  padding: '16px',
                  width: '350px',
                }}
              >
                Key Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'left',
                  fontSize: '1.1rem',
                  color: 'text.primary',
                  padding: '16px',
                }}
              >
                Value / Content
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  color: 'text.primary',
                  padding: '16px',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {settings.map((setting, index) => (
              <TableRow
                key={setting.keyName}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? 'grey.50' : 'background.paper',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {/* Key Name Column */}
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'left',
                    verticalAlign: 'middle',
                    wordBreak: 'break-word',
                    padding: '16px',
                  }}
                >
                  {setting.keyName}
                </TableCell>

                {/* Value Column */}
                <TableCell
                  sx={{
                    textAlign: 'left',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    padding: '16px',
                  }}
                >
                  {isEditing === setting.keyName ? (
                    <TextField
                      id={`value-${setting.keyName}`}
                      defaultValue={setting.value}
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {setting.value}
                    </Typography>
                  )}
                </TableCell>

                {/* Actions Column */}
                <TableCell sx={{ textAlign: 'center', padding: '16px' }}>
                  {isEditing === setting.keyName ? (
                    <>
                      <Button
                        onClick={() => handleSaveClick(setting.keyName)}
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsEditing(null)}
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    userRoles.length > 0 && (
                      <Button
                        onClick={() => handleEditClick(setting.keyName)}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Edit
                      </Button>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Button */}
      <Box textAlign="center">
        <Button
          href="/"
          size="large"
          variant="contained"
          component={RouterLink}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Go to Home
        </Button>
      </Box>
    </Container>

    // <Container>
    //   <Box
    //     sx={{
    //       py: 12,
    //       maxWidth: 900, // Increase max width of the container
    //       mx: 'auto',
    //       minHeight: '100vh',
    //       textAlign: 'center',
    //     }}
    //   >
    //     <Typography variant="h3" sx={{ mb: 5, fontWeight: 'bold' }}>
    //       Settings
    //     </Typography>

    //     <Box sx={{ width: '100%' }}>
    //       {settings.map((setting) => (
    //         <Box
    //           key={setting.keyName}
    //           sx={{
    //             mb: 3,
    //             p: 3,
    //             display: 'flex',
    //             alignItems: 'center',
    //             justifyContent: 'space-between',
    //             borderRadius: 1,
    //             backgroundColor: 'background.default',
    //             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    //           }}
    //         >
    //           <Box sx={{ flexBasis: '50%', fontWeight: 'bold', textAlign: 'left', pr: 2 }}>
    //             {setting.keyName}
    //           </Box>
    //           <Box sx={{ flexBasis: '40%', textAlign: 'left', pr: 2 }}>
    //             {isEditing === setting.keyName ? (
    //               <TextField
    //                 id={`value-${setting.keyName}`}
    //                 defaultValue={setting.value}
    //                 variant="outlined"
    //                 fullWidth
    //                 multiline
    //                 minRows={3}
    //                 size="small"
    //               />
    //             ) : (
    //               <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
    //                 {setting.value}
    //               </Typography>
    //             )}
    //           </Box>
    //           <Box sx={{ flexBasis: '10%', display: 'flex', justifyContent: 'flex-end' }}>
    //             {userRoles.length > 0 && isEditing !== setting.keyName && (
    //               <Button
    //                 onClick={() => handleEditClick(setting.keyName)}
    //                 variant="outlined"
    //                 color="primary"
    //                 size="small"
    //               >
    //                 Edit
    //               </Button>
    //             )}
    //             {isEditing === setting.keyName && (
    //               <>
    //                 <Button
    //                   onClick={() => handleSaveClick(setting.keyName)}
    //                   variant="contained"
    //                   color="primary"
    //                   size="small"
    //                   sx={{ mr: 1 }}
    //                 >
    //                   Save
    //                 </Button>
    //                 <Button
    //                   onClick={() => setIsEditing(null)}
    //                   variant="outlined"
    //                   color="secondary"
    //                   size="small"
    //                 >
    //                   Cancel
    //                 </Button>
    //               </>
    //             )}
    //           </Box>
    //         </Box>
    //       ))}
    //     </Box>

    //     <Button
    //       href="/"
    //       size="large"
    //       variant="contained"
    //       component={RouterLink}
    //       sx={{
    //         mt: 6,
    //         px: 4,
    //         py: 1.5,
    //         fontSize: '1rem',
    //       }}
    //     >
    //       Go to Home
    //     </Button>
    //   </Box>
    // </Container>
  );
}
