import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { RouterLink } from 'src/routes/components';
import Logo from 'src/components/logo';
import config from 'src/config'; // Import the config file

// ----------------------------------------------------------------------

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    // Fetch settings from API
    fetch('${config.BASE_URL}/api/misc_settings')
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
    fetch('${config.BASE_URL}/api/misc_settings', {
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
    <>
      <Box
        component="header"
        sx={{
          top: 0,
          left: 0,
          width: 1,
          lineHeight: 0,
          position: 'fixed',
          p: (theme) => ({ xs: theme.spacing(3, 3, 0), sm: theme.spacing(5, 5, 0) }),
        }}
      >
        <Logo />
      </Box>

      <Container>
        <Box
          sx={{
            py: 12,
            maxWidth: 800,
            mx: 'auto',
            minHeight: '100vh',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Settings
          </Typography>

          <Box sx={{ width: '100%' }}>
            {settings.map((setting) => (
              <Box
                key={setting.keyName}
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #ddd',
                  p: 2,
                }}
              >
                <Box sx={{ flexBasis: '30%', fontWeight: 'bold', textAlign: 'left' }}>
                  {setting.keyName}
                </Box>
                <Box sx={{ flexBasis: '50%', textAlign: 'left' }}>
                  {isEditing === setting.keyName ? (
                    <TextField
                      id={`value-${setting.keyName}`}
                      defaultValue={setting.value}
                      variant="outlined"
                      fullWidth
                    />
                  ) : (
                    setting.value
                  )}
                </Box>
                <Box sx={{ flexBasis: '20%', display: 'flex', justifyContent: 'flex-end' }}>
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
                    <Button
                      onClick={() => handleEditClick(setting.keyName)}
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          <Button href="/" size="large" variant="contained" component={RouterLink} sx={{ mt: 4 }}>
            Go to Home
          </Button>
        </Box>
      </Container>
    </>
  );
}
