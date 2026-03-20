import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    Stack,
    Avatar,
    Typography,
    Chip,
    IconButton,
    Badge,
    LinearProgress,
    CircularProgress,
    alpha,
    Button,
    Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import config from 'src/config';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

export default function ActiveSessionsBoard({ employees, services, token, onSelectCustomer }) {
    const [sessions, setSessions] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState({ open: false, id: null, status: '' });
    const theme = useTheme();

    useEffect(() => {
        fetchActiveData();
        const interval = setInterval(fetchActiveData, 12000); // 12s real-time refresh
        return () => clearInterval(interval);
    }, [refreshKey]);

    const fetchActiveData = async () => {
        try {
            const branchId = localStorage.getItem('selectedBranchId');
            const branchQuery = (branchId && branchId !== 'all') ? `?branchId=${branchId}` : '';
            const res = await fetch(`${config.BASE_URL}/sessions/active${branchQuery}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const activeSessions = await res.json();
            if (!Array.isArray(activeSessions)) {
                setSessions([]);
                return;
            }

            const sessionData = activeSessions.map(s => ({
                customer: s.Customer,
                session: s,
                assignments: s.Assignments || []
            }));

            setSessions(sessionData);
        } catch (err) {
            console.error('ActiveSessionsBoard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleStatusClick = (id, status) => {
        setConfirm({ open: true, id, status });
    };

    const executeStatusUpdate = async () => {
        const { id, status } = confirm;
        setConfirm({ open: false, id: null, status: '' });
        try {
            await fetch(`${config.BASE_URL}/assignments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            fetchActiveData();
        } catch (err) {
            console.error(err);
        }
    };

    const calculateProgress = (assignments) => {
        if (!assignments?.length) return 0;
        const completed = assignments.filter(a => a.status === 'completed').length;
        return (completed / assignments.length) * 100;
    };

    const handleCompleteSession = async (sessionId) => {
        try {
            await fetch(`${config.BASE_URL}/sessions/${sessionId}/complete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchActiveData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to cancel this visit entirely?')) return;
        try {
            await fetch(`${config.BASE_URL}/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchActiveData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={6}>
                <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box sx={{
                        p: 1.5, bgcolor: '#0D0E1C', borderRadius: 2, color: '#C8972A',
                        display: 'flex', boxShadow: theme.customShadows.z12,
                        border: '1px solid', borderColor: alpha('#C8972A', 0.2)
                    }}>
                        <Iconify icon="solar:pulse-bold-duotone" width={32} />
                    </Box>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Active CLIENTS</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={800}>See current customers and their tasks.</Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                        label={`${sessions.length} ACTIVE CLIENTS`}
                        color="secondary"
                        sx={{ fontWeight: 900, borderRadius: 1.5, height: 44, px: 2, boxShadow: theme.customShadows.z8 }}
                    />
                    <IconButton
                        onClick={() => { setRefreshKey(k => k + 1); setLoading(true); }}
                        sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05), width: 44, height: 44, '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.1) } }}
                    >
                        <Iconify icon="solar:restart-bold" className={loading ? 'animate-spin' : ''} sx={{ color: '#C8972A' }} />
                    </IconButton>
                </Stack>
            </Stack>

            {sessions.length === 0 && !loading && (
                <Box sx={{
                    py: 15, textAlign: 'center', bgcolor: alpha('#1B1F3A', 0.02),
                    borderRadius: 4, border: '2px dashed', borderColor: alpha('#1B1F3A', 0.1)
                }}>
                    <Iconify icon="solar:users-group-rounded-bold-duotone" width={64} sx={{ color: alpha('#C8972A', 0.1), mb: 2 }} />
                    <Typography variant="h4" color="text.disabled" fontWeight={900}>No customers in salon</Typography>
                    <Typography variant="body1" color="text.disabled" fontWeight={700}>Everything is quiet right now.</Typography>
                </Box>
            )}

            {loading && sessions.length === 0 ? (
                <Box sx={{ py: 15, textAlign: 'center' }}><CircularProgress color="secondary" size={48} thickness={4} /></Box>
            ) : (
                <Grid container spacing={4}>
                    {sessions.map(({ customer, session, assignments }) => {
                        const progress = calculateProgress(assignments);
                        const isAtPay = progress === 100 && assignments.length > 0;

                        return (
                            <Grid item xs={12} sm={12} md={12} lg={6} xl={4} key={session.id}>
                                <Card sx={{
                                    p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                                    borderRadius: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08),
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.05)', transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    '&:hover': { transform: 'translateY(-10px)', boxShadow: theme.customShadows.z24 }
                                }}>
                                    <Box sx={{
                                        p: { xs: 2.5, md: 3.5 },
                                        bgcolor: isAtPay ? alpha('#4caf50', 0.03) : alpha('#0D0E1C', 0.01),
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05)
                                    }}>
                                        <Stack direction="row" spacing={2.5} alignItems="center">
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={<Box sx={{
                                                    width: 14, height: 14, bgcolor: '#4caf50', border: '2px solid white', borderRadius: '50%',
                                                }} />}
                                            >
                                                <Avatar sx={{
                                                    width: 56, height: 56,
                                                    bgcolor: isAtPay ? '#4caf50' : '#0D0E1C',
                                                    color: 'white', fontWeight: 900, fontSize: '1.4rem',
                                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                                }}>{customer.name[0]}</Avatar>
                                            </Badge>
                                            <Box>
                                                <Typography variant="h6" fontWeight={900} letterSpacing={-0.5}>{customer.name.toUpperCase()}</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={1}>{customer.phone}</Typography>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                onClick={() => onSelectCustomer(customer)}
                                                size="small"
                                                sx={{ bgcolor: alpha('#C8972A', 0.05), color: '#C8972A', '&:hover': { bgcolor: '#C8972A', color: 'white' } }}
                                            >
                                                <Iconify icon="solar:maximize-bold" width={20} />
                                            </IconButton>
                                            <Tooltip title="Cancel Session">
                                                <IconButton
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    size="small"
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.main, color: 'white' } }}
                                                >
                                                    <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>

                                    <Box sx={{ px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4 }, flexGrow: 1 }}>
                                        <Stack spacing={3}>
                                            {assignments.map((a, idx) => (
                                                <Box key={a.id} sx={{ position: 'relative', pl: 6 }}>
                                                    <Box sx={{
                                                        position: 'absolute', left: 0, top: 4, width: 32, height: 32,
                                                        borderRadius: 1.2,
                                                        bgcolor: a.status === 'completed' ? '#4caf50' : a.status === 'in_progress' ? '#C8972A' : alpha('#C8972A', 0.05),
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: a.status !== 'assigned' ? '0 8px 16px rgba(0,0,0,0.1)' : 'none'
                                                    }}>
                                                        <Iconify
                                                            icon={a.status === 'completed' ? 'solar:verified-check-bold' : a.status === 'in_progress' ? 'solar:play-bold' : 'solar:clock-circle-bold'}
                                                            sx={{ color: a.status === 'completed' || a.status === 'in_progress' ? 'white' : '#C8972A', width: 18 }}
                                                        />
                                                    </Box>
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="subtitle2" fontWeight={900} color={a.status === 'completed' ? 'text.disabled' : 'text.primary'} sx={{ textDecoration: a.status === 'completed' ? 'line-through' : 'none', fontSize: '0.85rem' }}>
                                                            {(a.Services || []).map(s => `${s.code ? '['+s.code+'] ' : ''}${s.name.toUpperCase()}`).join(', ') || 'BESPOKE SERVICE'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={800}>
                                                            DONE BY: {a.Employee?.name?.toUpperCase() || 'NOT ASSIGNED'}
                                                        </Typography>

                                                        {a.status !== 'completed' && (
                                                            <Stack direction="row" flexWrap="wrap" spacing={1} mt={1.5} sx={{ gap: 1 }}>
                                                                <Button
                                                                    size="small" variant={a.status === 'assigned' ? 'contained' : 'soft'} color="inherit"
                                                                    onClick={() => handleStatusClick(a.id, 'assigned')}
                                                                    sx={{ height: 28, fontSize: '0.7rem', fontWeight: 900, minWidth: 60, borderRadius: 1 }}
                                                                >WAIT</Button>
                                                                <Button
                                                                    size="small" variant={a.status === 'in_progress' ? 'contained' : 'soft'} color="warning"
                                                                    onClick={() => handleStatusClick(a.id, 'in_progress')}
                                                                    sx={{ height: 28, fontSize: '0.7rem', fontWeight: 900, minWidth: 60, borderRadius: 1, bgcolor: a.status === 'in_progress' ? '#C8972A' : '' }}
                                                                >START</Button>
                                                                <Button
                                                                    size="small" variant="soft" color="success"
                                                                    onClick={() => handleStatusClick(a.id, 'completed')}
                                                                    sx={{ height: 28, fontSize: '0.7rem', fontWeight: 900, minWidth: 60, borderRadius: 1 }}
                                                                >DONE</Button>
                                                            </Stack>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            ))}
                                            {assignments.length === 0 && (
                                                <Box sx={{ py: 3, textAlign: 'center', bgcolor: alpha('#ff9800', 0.05), borderRadius: 2, border: '1px dashed', borderColor: alpha('#ff9800', 0.2) }}>
                                                    <Typography variant="caption" color="#ff9800" fontWeight={900} letterSpacing={1}>WAITING FOR SERVICES</Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Box sx={{
                                        px: 3.5, py: 2.5, bgcolor: alpha('#0D0E1C', 0.02),
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <Typography variant="caption" fontWeight={900} color="text.disabled" letterSpacing={1}>
                                            IN AT: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {progress === 100 && (
                                                <Button
                                                    size="small" variant="contained" color="success"
                                                    onClick={() => handleCompleteSession(session.id)}
                                                    sx={{ fontWeight: 900, borderRadius: 1, height: 24, fontSize: '0.65rem' }}
                                                >
                                                    COMPLETE
                                                </Button>
                                            )}
                                            <Chip
                                                label={progress === 100 ? 'SETTLED' : `${Math.round(progress)}% PROGRESS`}
                                                color={progress === 100 ? 'success' : 'secondary'}
                                                variant="soft" size="small"
                                                sx={{ fontWeight: 900, borderRadius: 1, height: 24 }}
                                            />
                                        </Stack>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 6,
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: progress === 100 ? '#4caf50' : '#C8972A',
                                            },
                                            bgcolor: alpha('#C8972A', 0.1)
                                        }}
                                    />
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <ConfirmDialog
                open={confirm.open}
                title="Confirm Change"
                content={`Are you sure you want to change this to '${confirm.status.toUpperCase()}'?`}
                confirmLabel="YES, CHANGE"
                onConfirm={executeStatusUpdate}
                onClose={() => setConfirm({ open: false, id: null, status: '' })}
            />
        </Box>
    );
}
