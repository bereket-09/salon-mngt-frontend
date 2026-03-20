import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Stack,
    Avatar,
    Chip,
    Grid,
    IconButton,
    LinearProgress,
    Container,
    alpha,
    Divider,
    Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import config from 'src/config';

export default function SpecialistBoard() {
    const [employees, setEmployees] = useState([]);
    const [loadData, setLoadData] = useState({});
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchStaffLoad(), 15000); // Pulse every 15s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const branchId = localStorage.getItem('selectedBranchId');
            const branchQuery = (branchId && branchId !== 'all') ? `&branchId=${branchId}` : '';
            const auth = { headers: { Authorization: `Bearer ${token}` } };
            const empRes = await fetch(`${config.BASE_URL}/users?role=employee&status=active${branchQuery}`, auth);
            const emps = await empRes.json() || [];

            const specializedRoles = ['barber', 'hairdresser', 'nail_specialist', 'spa_therapist', 'employee'];
            const filteredEmps = emps.filter(e => specializedRoles.includes(e.role));
            setEmployees(filteredEmps);

            await fetchStaffLoad(filteredEmps, branchId);
        } catch (err) {
            console.error('SpecialistBoard initial fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffLoad = async (targetEmps = employees, branchId = localStorage.getItem('selectedBranchId')) => {
        if (!targetEmps.length) return; 
        try {
            const branchQuery = (branchId && branchId !== 'all') ? `?branchId=${branchId}` : '';
            const auth = { headers: { Authorization: `Bearer ${token}` } };
            const activeRes = await fetch(`${config.BASE_URL}/assignments/active${branchQuery}`, auth);
            const activeAssignments = await activeRes.json() || [];

            const grouped = {};
            targetEmps.forEach(emp => {
                grouped[emp.id] = activeAssignments.filter(a =>
                    a.employeeId === emp.id &&
                    a.status !== 'completed' &&
                    a.status !== 'rejected'
                );
            });
            setLoadData(grouped);
        } catch (err) {
            console.error('SpecialistBoard refresh error:', err);
        }
    };

    if (loading) return <Box sx={{ p: 5 }}><LinearProgress color="secondary" sx={{ height: 6, borderRadius: 3 }} /></Box>;

    const totalEngaged = Object.values(loadData).filter(tasks => tasks.some(t => t.status === 'in_progress')).length;
    const totalQueued = Object.values(loadData).reduce((sum, tasks) => sum + tasks.filter(t => t.status === 'pending').length, 0);

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* HEADER */}
            <Paper sx={{
                p: 4, mb: 6, borderRadius: 2.5, bgcolor: '#1B1F3A', color: 'white',
                boxShadow: theme.customShadows.z24, position: 'relative', overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
                    <Iconify icon="solar:transmission-bold-duotone" width={240} />
                </Box>
                <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={4}>
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                            <Box sx={{ p: 1, bgcolor: alpha('#C8972A', 0.2), borderRadius: 1.5, color: '#C8972A' }}>
                                <Iconify icon="solar:users-group-rounded-bold-duotone" width={32} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Staff Board</Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ color: 'grey.400', fontWeight: 600 }}>See who is working and who is waiting.</Typography>
                    </Box>

                    <Stack direction="row" spacing={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight={900} color="secondary.main">{totalEngaged}</Typography>
                            <Typography variant="caption" fontWeight={900} sx={{ opacity: 0.6 }}>WORKING</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight={900}>{totalQueued}</Typography>
                            <Typography variant="caption" fontWeight={900} sx={{ opacity: 0.6 }}>WAITING</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                        <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', width: 56, height: 56 }} onClick={() => fetchData()}>
                            <Iconify icon="solar:restart-bold-duotone" />
                        </IconButton>
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={3}>
                {employees.map((emp) => {
                    const tasks = loadData[emp.id] || [];
                    const activeTask = tasks.find(t => t.status === 'in_progress');
                    const queueTasks = tasks.filter(t => t.status !== 'in_progress');

                    const isBusy = !!activeTask;
                    const loadPercentage = Math.min((tasks.length / 3) * 100, 100);

                    return (
                        <Grid item xs={12} md={6} lg={4} key={emp.id}>
                            <Card sx={{
                                p: 0, overflow: 'hidden', height: '100%',
                                borderRadius: 2.5, border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.1),
                                transition: '0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.customShadows.z20, borderColor: 'secondary.main' }
                            }}>
                                <Box sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2.5} alignItems="center" mb={4}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar sx={{
                                                width: 64, height: 64,
                                                bgcolor: '#1B1F3A', color: 'white',
                                                fontWeight: 800, fontSize: '1.4rem',
                                                border: '2px solid',
                                                borderColor: isBusy ? 'error.main' : 'success.main'
                                            }}>
                                                {emp.name[0]}
                                            </Avatar>
                                            <Box sx={{
                                                position: 'absolute', bottom: 2, right: 2, width: 16, height: 16,
                                                bgcolor: isBusy ? 'error.main' : tasks.length > 0 ? 'warning.main' : 'success.main',
                                                border: '3px solid white', borderRadius: '50%',
                                                animation: isBusy ? 'pulse 2s infinite' : 'none'
                                            }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" fontWeight={800}>{emp.name.toUpperCase()}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                                                {emp.role.replace('_', ' ')}
                                            </Typography>
                                            <Stack direction="row" spacing={1} mt={1}>
                                                <Chip
                                                    label={isBusy ? 'WORKING' : tasks.length > 0 ? 'WAITING' : 'AVAILABLE'}
                                                    size="small"
                                                    color={isBusy ? 'error' : tasks.length > 0 ? 'warning' : 'success'}
                                                    sx={{ fontWeight: 800, borderRadius: 0.5, height: 22, fontSize: '0.65rem' }}
                                                />
                                            </Stack>
                                        </Box>
                                    </Stack>

                                    {/* CURRENT JOB */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="overline" color="text.disabled" fontWeight={800}>Current Job</Typography>
                                        {activeTask ? (
                                            <Box sx={{
                                                p: 2.5, mt: 1, borderRadius: 1.5,
                                                bgcolor: alpha(theme.palette.error.main, 0.02),
                                                border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1),
                                                position: 'relative', overflow: 'hidden'
                                            }}>
                                                <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, bgcolor: 'error.main' }} />
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle2" fontWeight={800} color="error.main">
                                                        {activeTask.CustomerSession?.Customer?.name?.toUpperCase() || 'Customer'}
                                                    </Typography>
                                                    <Iconify icon="solar:fire-bold-duotone" width={18} sx={{ color: 'error.main' }} />
                                                </Stack>
                                                <Stack spacing={0.5}>
                                                    {activeTask.Services?.map(s => (
                                                        <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Iconify icon="solar:check-circle-bold-duotone" width={12} sx={{ color: 'error.main' }} />
                                                            <Typography variant="caption" fontWeight={700}>{s.name.toUpperCase()}</Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                p: 3, mt: 1, borderRadius: 1.5, textAlign: 'center',
                                                border: '2px dashed', borderColor: alpha(theme.palette.success.main, 0.1),
                                                bgcolor: alpha(theme.palette.success.main, 0.01)
                                            }}>
                                                <Typography variant="caption" color="success.main" fontWeight={800}>Ready for customers</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* WAITING JOBS */}
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="overline" color="text.disabled" fontWeight={800}>Waiting Jobs</Typography>
                                            <Chip label={`${queueTasks.length}`} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                                        </Stack>
                                        <Stack spacing={1.5}>
                                            {queueTasks.length > 0 ? queueTasks.map((task) => (
                                                <Box key={task.id} sx={{
                                                    p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.background.neutral, 0.5),
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    border: '1px solid', borderColor: alpha(theme.palette.divider, 0.05)
                                                }}>
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={800}>
                                                            {task.CustomerSession?.Customer?.name?.toUpperCase() || 'Customer'}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.2 }}>
                                                            {task.Services?.map(s => (
                                                                <Typography key={s.id} variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem' }}>
                                                                    • {s.name}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                    <Iconify icon="solar:clock-circle-bold-duotone" sx={{ color: 'warning.main', width: 16 }} />
                                                </Box>
                                            )) : (
                                                <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textAlign: 'center', display: 'block' }}>No waiting jobs.</Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 'auto' }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={loadPercentage}
                                        sx={{
                                            height: 6, bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: loadPercentage > 80 ? 'error.main' : loadPercentage > 50 ? 'warning.main' : 'success.main',
                                            }
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
            <style>
                {`
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.8; }
                        50% { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(0.95); opacity: 0.8; }
                    }
                `}
            </style>
        </Container>
    );
}
