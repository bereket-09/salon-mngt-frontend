import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fShortenNumber } from 'src/utils/format-number';
import CountUp from 'react-countup';

// ----------------------------------------------------------------------

export default function AppWidgetSummary({ title, dev, icon, color = 'primary', sx, url, ...other }) {
  const cardContent = (
    <Card
      component={Stack}
      spacing={3}
      direction="row"
      sx={{
        px: 3,
        py: 6,
        borderRadius: 3,
        mb: 4,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        cursor: url ? 'pointer' : 'default',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`
            : `linear-gradient(135deg, ${theme.palette[color].dark} 0%, ${theme.palette[color].main} 100%)`,
        // color: '#fff', // Removed to prevent invisible text on light glass backgrounds
        color: (theme) => theme.palette.text.primary,
        '&:hover': {
          transform: url ? 'scale(1.05)' : 'none',
          boxShadow: 6,
        },
        ...sx,
      }}
      {...other}
    >
      {icon && <Box sx={{ width: 64, height: 64 }}>{icon}</Box>}

      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          <CountUp end={dev} duration={1.5} separator="," />
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
  url: PropTypes.string,
};
