import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function AppWebsiteVisits({ title, subheader, chart, ...other }) {
  const { labels, series, colors, options } = chart;

  const chartOptions = useChart({
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: 'smooth', width: 3 },
    colors: colors || ['#1976d2', '#00c853', '#ff6d00'],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => (val !== undefined ? `${val.toLocaleString()} Participants` : val),
      },
    },
    grid: { strokeDashArray: 3 },
    labels,
    xaxis: { type: 'category' },
    ...options,
  });

  return (
    <Card {...other} sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart type="line" series={series} options={chartOptions} height={364} width="100%" />
      </Box>
    </Card>
  );
}

AppWebsiteVisits.propTypes = {
  chart: PropTypes.object.isRequired,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
