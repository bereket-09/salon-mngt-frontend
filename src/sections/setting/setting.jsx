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
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import Swal from 'sweetalert2';
import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const isMobile = useResponsive('down', 'md');

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
    const token = localStorage.getItem('authToken');

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch settings from API
    fetch(`${config.BASE_URL}/api/misc_settings`, headers)
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
    // Ask for user confirmation using SweetAlert2
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to save these changes? This might have huge Impact on Platform.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedValue = document.getElementById(`value-${keyName}`).value;
        const token = localStorage.getItem('authToken');

        // Send updated value to the API
        fetch(`${config.BASE_URL}/api/misc_settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`,
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
              Swal.fire('Saved!', 'Your changes have been saved.', 'success'); // Success alert
            } else {
              console.error('Failed to update setting');
              Swal.fire('Error', 'Failed to save the settings.', 'error'); // Error alert
            }
          })
          .catch((error) => {
            console.error('Error updating setting:', error);
            Swal.fire('Error', 'There was an error saving the settings.', 'error'); // Error alert
          });
      }
    });
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

      {/* Card fallback for small screens — avoids horizontal table scroll */}
      {isMobile ? (
        <Stack spacing={2.5} sx={{ mb: 6 }}>
          {settings.map((setting) => (
            <Card key={setting.keyName} sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 'bold', color: 'text.disabled', letterSpacing: 0.5, textTransform: 'uppercase' }}
                >
                  Key Name
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, wordBreak: 'break-word' }}>
                  {setting.keyName}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ fontWeight: 'bold', color: 'text.disabled', letterSpacing: 0.5, textTransform: 'uppercase' }}
                >
                  Value / Content
                </Typography>
                {isEditing === setting.keyName ? (
                  <TextField
                    id={`value-${setting.keyName}`}
                    defaultValue={setting.value}
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    sx={{ mt: 1, mb: 2 }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, wordBreak: 'break-word' }}>
                    {setting.value}
                  </Typography>
                )}

                {isEditing === setting.keyName ? (
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      onClick={() => handleSaveClick(setting.keyName)}
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(null)}
                      variant="outlined"
                      color="secondary"
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  userRoles.length > 0 && (
                    <Button
                      onClick={() => handleEditClick(setting.keyName)}
                      variant="outlined"
                      color="primary"
                      fullWidth
                    >
                      Edit
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
      /* Table Section (md and up) */
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
                  width: { xs: 'auto', md: '350px' },
                  minWidth: { xs: 120, md: 350 },
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
                        sx={{ mb: 1 }}
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
      )}

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
  );
}
