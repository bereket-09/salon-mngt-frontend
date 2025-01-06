import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fShortenNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function AppWidgetSummary({ title, dev, icon, color = 'primary', sx, url, ...other }) {
  const cardContent = (
    <Card
    component={Stack}
    spacing={3}
    direction="row"
    sx={{
      px: 3,
      py: 7,
      borderRadius: 2,
      mb: 4,
      ...sx,
      cursor: url ? 'pointer' : 'default', // Change cursor to pointer if url is provided
      transition: 'transform 0.3s ease-in-out', // Smooth transition for the hover effect
      '&:hover': {
        transform: url ? 'scale(1.05)' : 'none', // Scale the card slightly on hover if url is provided
      },
    }}
    {...other}
  >
    {icon && <Box sx={{ width: 64, height: 64 }}>{icon}</Box>}

    <Stack spacing={0.5}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
        {dev}
      </Typography>
    </Stack>
  </Card>
  );

  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      {cardContent}
    </a>
  ) : (
    cardContent
  );
}

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  dev: PropTypes.number,
  url: PropTypes.string, // New optional prop
};
  