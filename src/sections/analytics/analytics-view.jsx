import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Grid,
    Stack,
    Typography,
    Avatar,
    LinearProgress,
    Button,
    Chip,
    alpha,
    Popover,
    MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import config from 'src/config';
import Chart, { useChart } from 'src/components/chart';
import { useResponsive } from 'src/hooks/use-responsive';

export default function AnalyticsView() {
    const theme = useTheme();
    const isMobile = useResponsive('down', 'md');
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [services, setServices] = useState([]);
    const [branches, setBranches] = useState([]);
    const [period, setPeriod] = useState('month'); // today | week | month | year
    const [openPopover, setOpenPopover] = useState(null);
    const token = localStorage.getItem('authToken');

    const PERIOD_OPTIONS = [
        { value: 'today', label: 'Today', icon: 'solar:clock-circle-bold-duotone' },
        { value: 'week', label: 'This Week', icon: 'solar:calendar-bold-duotone' },
        { value: 'month', label: 'This Month', icon: 'solar:calendar-bold-duotone' },
        { value: 'year', label: 'This Year', icon: 'solar:calendar-date-bold-duotone' },
    ];

    const fetchData = React.useCallback(async () => {
        try {
            const currentBranchId = localStorage.getItem('selectedBranchId');
            const params = new URLSearchParams();
            if (currentBranchId && currentBranchId !== 'all') params.append('branchId', currentBranchId);
            
            // Calculate date range based on period
            const to = new Date().toISOString().split('T')[0];
            let from = '';
            const d = new Date();
            if (period === 'today') from = to;
            else if (period === 'week') { d.setDate(d.getDate() - d.getDay()); from = d.toISOString().split('T')[0]; }
            else if (period === 'month') { d.setDate(1); from = d.toISOString().split('T')[0]; }
            else if (period === 'year') { d.setMonth(0, 1); from = d.toISOString().split('T')[0]; }

            if (from) { params.append('from', from); params.append('to', to); }
            const query = params.toString();

            const auth = { headers: { Authorization: `Bearer ${token}` } };
            const [statsRes, revRes, perfRes, svcRes, brRes] = await Promise.all([
                fetch(`${config.BASE_URL}/reports/overview?${query}`, auth),
                fetch(`${config.BASE_URL}/reports/revenue?${query}`, auth),
                fetch(`${config.BASE_URL}/reports/performance?${query}`, auth),
                fetch(`${config.BASE_URL}/reports/services?${query}`, auth),
                fetch(`${config.BASE_URL}/reports/branches`, auth),
            ]);

            setStats(await statsRes.json() || {});
            setRevenue((await revRes.json()).daily || []);
            setPerformance((await perfRes.json()).performance || []);
            setServices(await svcRes.json() || []);
            setBranches(await brRes.json() || []);
        } catch (err) {
            console.error('Analytics fetchData error:', err);
        }
    }, [token, period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HOOKS MUST BE BEFORE ANY RETURN ---
    const revenueChartOptions = useChart({
        colors: [theme.palette.secondary.main],
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
            categories: (revenue || []).map(r => r.date || r.month || ''),
            labels: { style: { colors: theme.palette.text.disabled, fontWeight: 700 } }
        },
        tooltip: { y: { formatter: (val) => `${val} ETB` } }
    });

    const serviceChartOptions = useChart({
        labels: (services || []).slice(0, 5).map(s => (s.name || '').toUpperCase()),
        colors: [
            theme.palette.secondary.main,
            theme.palette.primary.main,
            theme.palette.info.main,
            theme.palette.success.main,
            theme.palette.warning.main,
        ],
        legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 700 },
        plotOptions: {
            pie: { donut: { size: '80%' } }
        }
    });

    // --- EARLY RETURN AFTER ALL HOOKS ---
    if (!stats) {
        return (
            <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Loading Dashboard...</Typography>
                <LinearProgress color="secondary" sx={{ height: 6, borderRadius: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
        );
    }

    const revenueSeries = [{ name: 'Income', data: (revenue || []).map(r => r.amount || 0) }];
    const serviceSeries = (services || []).slice(0, 5).map(s => s.timesBooked || 0);

    return (
        <Box sx={{ pb: 5 }}>
            {/* HEADER */}
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" mb={{ xs: 4, md: 6 }} spacing={3}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1, fontSize: { xs: '1.75rem', md: '3rem' } }}>Overview</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Track your salon's daily results and performance.</Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Button
                        variant="soft" color="secondary"
                        onClick={(e) => setOpenPopover(e.currentTarget)}
                        startIcon={<Iconify icon={PERIOD_OPTIONS.find(o => o.value === period)?.icon || 'solar:calendar-bold-duotone'} />}
                        sx={{ fontWeight: 800, height: 48, borderRadius: 1.5, px: 3, bgcolor: alpha(theme.palette.secondary.main, 0.1), flex: { xs: 1, sm: 'none' } }}
                    >
                        {PERIOD_OPTIONS.find(o => o.value === period)?.label}
                    </Button>
                    
                    <Popover
                        open={!!openPopover}
                        anchorEl={openPopover}
                        onClose={() => setOpenPopover(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ sx: { p: 1, mt: 1, width: 160, borderRadius: 1.5, boxShadow: theme.customShadows.z20 } }}
                    >
                        {PERIOD_OPTIONS.map((option) => (
                            <MenuItem 
                                key={option.value} 
                                selected={option.value === period}
                                onClick={() => { setPeriod(option.value); setOpenPopover(null); }}
                                sx={{ borderRadius: 1, fontWeight: 700, mb: 0.5 }}
                            >
                                <Iconify icon={option.icon} sx={{ mr: 2, color: 'secondary.main' }} />
                                {option.label}
                            </MenuItem>
                        ))}
                    </Popover>

                    <Button
                        variant="contained" color="secondary"
                        onClick={fetchData}
                        startIcon={<Iconify icon="solar:restart-bold-duotone" />}
                        sx={{ fontWeight: 800, height: 48, borderRadius: 1.5, flex: { xs: 1, sm: 'none' } }}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            {/* KEY NUMBERS */}
            <Grid container spacing={3} mb={5}>
                {[
                    { label: "Today's Income", value: stats.todayRevenue || 0, sub: 'ETB', icon: 'solar:wad-of-money-bold-duotone', color: '#1B1F3A', accent: '#C8972A' },
                    { label: 'Active Customers', value: stats.activeSessions || 0, sub: 'IN SALON', icon: 'solar:users-group-rounded-bold-duotone', color: '#1B1F3A', accent: '#2DD4BF' },
                    { label: 'Bookings', value: stats.pendingBookings || 0, sub: 'WAITING', icon: 'solar:calendar-bold-duotone', color: '#1B1F3A', accent: '#3B82F6' },
                    { label: 'Not Paid', value: stats.openInvoices || 0, sub: 'BILLS', icon: 'solar:bill-list-bold-duotone', color: '#1B1F3A', accent: '#F43F5E' },
                ].map((kpi, i) => (
                    <Grid item xs={12} sm={6} md={3} key={kpi.label}>
                        <Card sx={{
                            p: 2.5, borderRadius: 2, bgcolor: kpi.color, color: 'white',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.1, color: kpi.accent }}>
                                <Iconify icon={kpi.icon} width={80} />
                            </Box>
                            <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 800, letterSpacing: 1, fontSize: '0.65rem' }}>{kpi.label}</Typography>
                            <Stack direction="row" alignItems="baseline" spacing={1} mt={0.5}>
                                <Typography sx={{ fontWeight: 900, color: kpi.accent, fontSize: { xs: '1.75rem', lg: '2rem' } }}>{kpi.value}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, fontSize: '0.7rem' }}>{kpi.sub}</Typography>
                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* CHARTS */}
            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), overflow: 'hidden' }}>
                        <Typography variant="h6" fontWeight={800}>Income Trends</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>Money earned over time.</Typography>
                        <Chart type="area" series={revenueSeries} options={revenueChartOptions} height={isMobile ? 220 : 300} />
                    </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Card sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), overflow: 'hidden' }}>
                        <Typography variant="h6" fontWeight={800}>Popular Services</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>Most booked treatments.</Typography>
                        <Chart type="donut" series={serviceSeries} options={serviceChartOptions} height={isMobile ? 220 : 300} />
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* BRANCHES */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Typography variant="h6" fontWeight={800}>Branch Status</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 4 }}>Current activity at each location.</Typography>
                        <Stack spacing={3}>
                            {branches.map((b) => (
                                <Box key={b.id || b.name} sx={{ p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 1.5 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1.5} alignItems="center" spacing={1}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle2" fontWeight={800} noWrap>{b.name.toUpperCase()}</Typography>
                                            <Typography variant="caption" color="text.secondary">{b.staffCount || 0} Staff working</Typography>
                                        </Box>
                                        <Typography variant="h5" fontWeight={800} color="secondary.main" sx={{ flexShrink: 0, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>{b.activeCustomers || 0} Customers</Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(((b.activeCustomers || 0) / (b.staffCount || 1)) * 100, 100)}
                                        sx={{ height: 8, borderRadius: 1, bgcolor: alpha(theme.palette.secondary.main, 0.05), '& .MuiLinearProgress-bar': { borderRadius: 1, bgcolor: theme.palette.secondary.main } }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid>

                {/* STAFF */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Typography variant="h6" fontWeight={800}>Top Staff</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 4 }}>Highest earners today.</Typography>
                        <Stack spacing={2}>
                            {performance.slice(0, 5).map((p, i) => (
                                <Box key={p.employeeId || p.id || i} sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5,
                                    bgcolor: alpha(theme.palette.background.neutral, 0.3), borderRadius: 1.5,
                                    border: '1px solid', borderColor: i === 0 ? 'secondary.main' : alpha(theme.palette.divider, 0.05)
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: i === 0 ? 'secondary.main' : '#1B1F3A', color: 'white', fontWeight: 800 }}>{p.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800}>{p.name.toUpperCase()}</Typography>
                                            <Typography variant="caption" color="text.secondary">{p.completedAssignments || 0} jobs done</Typography>
                                        </Box>
                                    </Stack>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="subtitle1" fontWeight={800} color="secondary.main">{p.estimatedCommission || 0} Br</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
