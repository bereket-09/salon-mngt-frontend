import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function Searchbar() {
  return (
    <InputBase
      placeholder="Search"
      startAdornment={
        <InputAdornment position="start">
          <Iconify
            icon="solar:magnifer-linear"
            sx={{ color: 'text.secondary', width: 18, height: 18 }}
          />
        </InputAdornment>
      }
      sx={{
        // Hidden on the smallest screens to keep the header uncluttered.
        display: { xs: 'none', sm: 'flex' },
        width: { sm: 180, md: 220 },
        height: 40,
        px: 1.5,
        fontSize: '0.875rem',
        fontWeight: 400,
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 1),
        transition: (theme) =>
          theme.transitions.create(['width', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'text.secondary',
        },
        '&.Mui-focused': {
          width: { sm: 220, md: 260 },
          borderColor: 'secondary.main',
        },
        '& input::placeholder': {
          color: 'text.disabled',
          opacity: 1,
        },
      }}
    />
  );
}
