// src/pages/SalonDashboard.jsx
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Stack, Box } from '@mui/material';
import Iconify from 'src/components/iconify';
import AppWidgetSummary from '../app-widget-summary';
import AppWebsiteVisits from '../app-website-visits';
import AppCurrentVisits from '../app-current-visits';
import AppConversionRates from '../app-conversion-rates';
import AppOrderTimeline from '../app-order-timeline';
import { faker } from '@faker-js/faker';

export default function SalonDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${config.BASE_URL}/reports/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Map backend report to what we need
        setDashboardData({
          overview: {
            totalCustomers: data.totalCustomers || 0,
            activeCheckins: data.activeSessions || 0,
            totalServices: data.totalServices || 0,
            totalCheckinUsers: data.totalStaff || 0,
          },
          // For now, keep some charts static or derive them if possible
          weeklyCheckins: {
            title: 'Weekly Check-ins',
            subheader: 'Salon visits this week',
            chart: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [{ name: 'Check-ins', data: [5, 8, 7, 6, 10, 12, 9] }],
              colors: ['#1B1F3A'],
            },
          },
          todaysCheckins: {
            title: "Visit Breakdown",
            chart: {
              series: [
                { label: 'Completed', value: data.completedAssignments || 5 },
                { label: 'In Progress', value: data.activeAssignments || 3 },
                { label: 'Pending', value: 2 },
              ],
              colors: ['#2e7d32', '#C8972A', '#1B1F3A'],
            },
          },
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress color="secondary" />
    </Box>
  );

  if (!dashboardData) return <Typography variant="h6">No dashboard data available.</Typography>;

  const { overview, weeklyCheckins, todaysCheckins, subscriptionRate, triviaTimeline } =
    dashboardData;

  const iconStyles = (bgColor) => ({
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    transform: 'scale(1.2)',
  });

  return (
    <Container maxWidth="xl" sx={{ py: 6, minHeight: '100vh' }}> {/* Background handled by global.css */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={6}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            Welcome back to <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Milana Salon</Box>
          </Typography>
        </Box>
        {/* Date/Time or Action Button could go here */}
      </Stack>

      {/* Top 4 Summary Cards - Glass Style */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Customers"
            dev={overview.totalCustomers}
            icon={<Iconify icon="fa6-solid:users" width={24} />}
            color="success"
            sx={{
              background: (theme) => theme.palette.gradients.glass,
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Active Check-ins"
            dev={overview.activeCheckins}
            icon={<Iconify icon="fluent:people-32-filled" width={24} />}
            color="info"
            sx={{
              background: (theme) => theme.palette.gradients.primary, // Featured Card
              color: '#fff',
              borderRadius: 4,
              boxShadow: '0 10px 20px rgba(76, 175, 80, 0.4)'
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Services"
            dev={overview.totalServices}
            icon={<Iconify icon="fa6-solid:scissors" width={24} />}
            color="warning"
            sx={{
              background: (theme) => theme.palette.gradients.glass,
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.6)'
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Check-in Users"
            dev={overview.totalCheckinUsers}
            icon={<Iconify icon="material-symbols:group" width={24} />}
            color="error"
            sx={{
              background: (theme) => theme.palette.gradients.glass,
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.6)'
            }}
          />
        </Grid>
      </Grid>

      {/* Glass Charts Area */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid xs={12} md={8}>
          <Box className="glass-panel" sx={{ p: 2, borderRadius: 4 }}>
            <AppWebsiteVisits
              title={weeklyCheckins.title}
              subheader={weeklyCheckins.subheader}
              chart={weeklyCheckins.chart}
            />
          </Box>
        </Grid>
        <Grid xs={12} md={4}>
          <Box className="glass-panel" sx={{ p: 2, borderRadius: 4, height: '100%' }}>
            <AppCurrentVisits title={todaysCheckins.title} chart={todaysCheckins.chart} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
