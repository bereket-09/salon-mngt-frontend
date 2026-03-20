/* eslint-disable */
import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import config from 'src/config';
import Iconify from 'src/components/iconify';

export default function BranchSwitcher() {
  const theme = useTheme();
  const [open, setOpen] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  const userStr = localStorage.getItem('userData');
  const token = localStorage.getItem('authToken');
  const user = useMemo(() => userStr ? JSON.parse(userStr) : null, [userStr]);

  const selectBranch = useCallback((branch, reload = true) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranchId', branch.id);
    localStorage.setItem('selectedBranchName', branch.name);
    if (reload) window.location.reload();
  }, []);

  const fetchBranches = useCallback(async () => {
    const isHeaderLogo = user?.role === 'admin';
    if (!isHeaderLogo) {
      setBranches(user?.branches || []);
      return;
    }
    try {
      const res = await fetch(`${config.BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBranches(data);
    } catch (err) { console.error(err); }
  }, [user, token]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedBranchId');
    const isHeaderLogo = user?.role === 'admin';
    
    // We only initialize if we have branches loaded or we are an admin fetching them
    if (branches.length > 0 || (isHeaderLogo && branches.length > 0)) {
       if (saved === 'all' && isHeaderLogo) {
          if (selectedBranch?.id !== 'all') setSelectedBranch({ id: 'all', name: 'All Branches' });
       } else if (saved) {
          const found = branches.find(b => b.id === Number(saved));
          if (found) {
             if (selectedBranch?.id !== found.id) setSelectedBranch(found);
          } else if (branches.length > 0 && !selectedBranch) {
             selectBranch(branches[0], false);
          }
       } else if (branches.length > 0 && !selectedBranch) {
          selectBranch(branches[0], false);
       }
    }
  }, [user, branches, selectBranch, selectedBranch]);

  const handleOpen = (event) => setOpen(event.currentTarget);
  const handleClose = () => setOpen(null);

  const handleSelect = (branch) => {
    selectBranch(branch, true);
    handleClose();
  };

  // If we are still loading branches but we have a user, don't return null immediately
  if (user && branches.length === 0 && user?.role !== 'admin') {
     // Return nothing if they really have no branches and aren't admin
     return null;
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="soft"
        sx={{
          px: 1.5,
          height: 44,
          fontWeight: 900,
          borderRadius: 1.5,
          color: (theme) => theme.palette.text.primary,
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.2),
          }),
        }}
        startIcon={<Iconify icon="solar:shop-bold-duotone" width={20} sx={{ color: 'secondary.main' }} />}
        endIcon={<Iconify icon="solar:alt-arrow-down-bold" width={16} sx={{ color: 'text.secondary' }} />}
      >
        {selectedBranch?.name?.toUpperCase() || 'SELECT BRANCH'}
      </Button>

      <Popover 
        open={!!open} 
        anchorEl={open}
        onClose={handleClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            width: 220,
            boxShadow: 4,
            borderRadius: 1.5,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 900 }}>
            SWITCH LOCATION
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {user?.role === 'admin' && (
            <MenuItem
               selected={selectedBranch?.id === 'all'}
               onClick={() => handleSelect({ id: 'all', name: 'All Branches' })}
               sx={{ borderRadius: 1, fontWeight: 700, mb: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08) }}
            >
               <Iconify icon="solar:globus-bold-duotone" sx={{ mr: 2, color: 'primary.main' }} />
               ALL LOCATIONS
            </MenuItem>
          )}

          {branches.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === selectedBranch?.id}
              onClick={() => handleSelect(option)}
              sx={{ borderRadius: 1, fontWeight: 700, mb: 0.5 }}
            >
              <Iconify icon="solar:map-point-wave-bold-duotone" sx={{ mr: 2, color: 'secondary.main' }} />
              {option.name.toUpperCase()}
            </MenuItem>
          ))}
        </Stack>
      </Popover>
    </>
  );
}

