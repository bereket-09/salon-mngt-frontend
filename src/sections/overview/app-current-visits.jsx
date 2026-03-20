import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import Chart, { useChart } from 'src/components/chart';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;
const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function AppCurrentVisits({ title, subheader, chart = {}, ...other }) {
  const theme = useTheme();
  const { colors = [], series = [], options = {} } = chart;

  // Handle empty or undefined series
  if (!series || series.length === 0) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} sx={{ mb: 5 }} />
        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          No data available
        </Typography>
      </Card>
    );
  }

  const chartSeries = series.map((i) => i.value || 0);
  const chartLabels = series.map((i) => i.label || '');

  const chartOptions = useChart({
    chart: {
      sparkline: { enabled: true },
    },
    colors: colors.length ? colors : series.map(() => theme.palette.primary.main),
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
    },
    tooltip: {
      fillSeriesColor: true,
      y: {
        formatter: (value) => fNumber(value),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: { show: true, total: { show: true, label: 'Total', formatter: () => chartSeries.reduce((a, b) => a + b, 0) } },
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 5 }} />
      <StyledChart
        dir="ltr"
        type="pie"
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={280}
      />
    </Card>
  );
}

AppCurrentVisits.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
