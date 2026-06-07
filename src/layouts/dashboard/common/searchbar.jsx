import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function Searchbar() {
  return (
    <OutlinedInput
      size="small"
      placeholder="Search…"
      startAdornment={
        <InputAdornment position="start">
          <Iconify
            icon="eva:search-fill"
            sx={{ color: 'text.disabled', width: 20, height: 20 }}
          />
        </InputAdornment>
      }
      sx={{
        // Hidden on the smallest screens to keep the header uncluttered.
        display: { xs: 'none', sm: 'flex' },
        width: { sm: 200, md: 240 },
        fontWeight: 600,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'divider',
        },
        '&.Mui-focused': {
          width: { sm: 240, md: 280 },
        },
        transition: (theme) =>
          theme.transitions.create(['width'], {
            duration: theme.transitions.duration.shorter,
          }),
      }}
    />
  );
}
