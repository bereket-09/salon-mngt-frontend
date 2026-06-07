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

// Uppercase tracked micro-label
const microLabel = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    lineHeight: 1.5,
};

export default function ActiveSessionsBoard({ employees, services, token, onSelectCustomer }) {
    const [sessions, setSessions] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState({ open: false, id: null, status: '' });
    const theme = useTheme();
    const hairline = alpha(theme.palette.divider, 0.18);

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
                cache: 'no-store'
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

    // Per-assignment status visuals
    const statusVisual = (status) => {
        if (status === 'completed') return { icon: 'solar:check-circle-linear', color: theme.palette.success.main };
        if (status === 'in_progress') return { icon: 'solar:play-circle-linear', color: theme.palette.secondary.main };
        return { icon: 'solar:clock-circle-linear', color: theme.palette.text.disabled };
    };

    return (
        <Box>
            {/* Section header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
                sx={{ pb: 2.5, mb: 4, borderBottom: '1px solid', borderColor: hairline }}
            >
                <Box>
                    <Typography variant="h4" sx={{ color: 'text.primary' }}>
                        Live Sessions
                    </Typography>
                    <Typography sx={{ ...microLabel, color: 'text.secondary', mt: 0.5 }}>
                        Customers in the salon now
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            px: 1.5,
                            py: 0.75,
                            border: '1px solid',
                            borderColor: hairline,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                        }}
                    >
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                        <Typography sx={{ ...microLabel, color: 'text.primary' }}>
                            {sessions.length} Active
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={() => { setRefreshKey(k => k + 1); setLoading(true); }}
                            sx={{
                                width: 44,
                                height: 44,
                                border: '1px solid',
                                borderColor: hairline,
                                borderRadius: 1.5,
                                color: 'secondary.main',
                            }}
                        >
                            <Iconify icon="solar:refresh-linear" width={20} className={loading ? 'animate-spin' : ''} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {sessions.length === 0 && !loading && (
                <Box
                    sx={{
                        py: { xs: 8, md: 12 },
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: hairline,
                    }}
                >
                    <Iconify icon="solar:cup-hot-linear" width={48} sx={{ color: alpha(theme.palette.secondary.main, 0.4), mb: 2 }} />
                    <Typography variant="h4" sx={{ color: 'text.primary', mb: 1 }}>
                        A quiet floor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No customers are in the salon right now.
                    </Typography>
                </Box>
            )}

            {loading && sessions.length === 0 ? (
                <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
                    <CircularProgress color="secondary" size={40} thickness={3} />
                </Box>
            ) : (
                <Grid container spacing={{ xs: 2.5, md: 3 }}>
                    {sessions.map(({ customer, session, assignments }) => {
                        const progress = calculateProgress(assignments);
                        const isDone = progress === 100 && assignments.length > 0;

                        return (
                            <Grid item xs={12} sm={6} md={6} lg={4} key={session.id}>
                                <Card
                                    sx={{
                                        p: 0,
                                        overflow: 'hidden',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 1.5,
                                        border: '1px solid',
                                        borderColor: hairline,
                                        boxShadow: 'none',
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    {/* Top progress bar (thin bronze / ink) */}
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 3,
                                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: isDone ? theme.palette.success.main : theme.palette.secondary.main,
                                            },
                                        }}
                                    />

                                    {/* Customer header */}
                                    <Box
                                        sx={{
                                            px: { xs: 2.5, md: 3 },
                                            py: { xs: 2.5, md: 3 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1.5,
                                            borderBottom: '1px solid',
                                            borderColor: hairline,
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Avatar
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: 'transparent',
                                                    color: 'text.primary',
                                                    border: '1px solid',
                                                    borderColor: hairline,
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    fontFamily: "'Fraunces', serif",
                                                }}
                                            >
                                                {customer.name[0]}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    noWrap
                                                    sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: 'text.primary' }}
                                                >
                                                    {customer.name}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Iconify icon="solar:phone-linear" width={12} sx={{ color: 'text.disabled' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {customer.phone}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="Open">
                                                <IconButton
                                                    onClick={() => onSelectCustomer(customer)}
                                                    sx={{ width: 40, height: 40, border: '1px solid', borderColor: hairline, borderRadius: 1.5, color: 'secondary.main' }}
                                                >
                                                    <Iconify icon="solar:arrow-right-up-linear" width={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel Session">
                                                <IconButton
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    sx={{ width: 40, height: 40, border: '1px solid', borderColor: hairline, borderRadius: 1.5, color: theme.palette.error.main }}
                                                >
                                                    <Iconify icon="solar:trash-bin-trash-linear" width={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>

                                    {/* Assignment rows (hairline separated) */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        {assignments.map((a, idx) => {
                                            const v = statusVisual(a.status);
                                            return (
                                                <Box
                                                    key={a.id}
                                                    sx={{
                                                        px: { xs: 2.5, md: 3 },
                                                        py: 2,
                                                        borderBottom: idx === assignments.length - 1 ? 'none' : '1px solid',
                                                        borderColor: hairline,
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                        <Iconify icon={v.icon} width={20} sx={{ color: v.color, mt: 0.25, flexShrink: 0 }} />
                                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: a.status === 'completed' ? 'text.disabled' : 'text.primary',
                                                                    textDecoration: a.status === 'completed' ? 'line-through' : 'none',
                                                                }}
                                                            >
                                                                {(a.Services || []).map(s => `${s.code ? '[' + s.code + '] ' : ''}${s.name}`).join(', ') || 'Bespoke service'}
                                                            </Typography>
                                                            <Typography sx={{ ...microLabel, fontSize: 10, color: 'text.secondary', mt: 0.5 }}>
                                                                {a.Employee?.name || 'Not assigned'}
                                                            </Typography>

                                                            {a.status !== 'completed' && (
                                                                <Stack direction="row" flexWrap="wrap" sx={{ gap: 1, mt: 1.5 }}>
                                                                    <Button
                                                                        size="small"
                                                                        disableElevation
                                                                        variant={a.status === 'assigned' ? 'contained' : 'outlined'}
                                                                        color="inherit"
                                                                        onClick={() => handleStatusClick(a.id, 'assigned')}
                                                                        sx={{
                                                                            minHeight: 44,
                                                                            px: 1.5,
                                                                            ...microLabel,
                                                                            fontSize: 10,
                                                                            borderRadius: 1,
                                                                            borderColor: hairline,
                                                                            color: a.status === 'assigned' ? 'primary.contrastText' : 'text.secondary',
                                                                            bgcolor: a.status === 'assigned' ? 'primary.main' : 'transparent',
                                                                        }}
                                                                    >Wait</Button>
                                                                    <Button
                                                                        size="small"
                                                                        disableElevation
                                                                        variant={a.status === 'in_progress' ? 'contained' : 'outlined'}
                                                                        color="secondary"
                                                                        onClick={() => handleStatusClick(a.id, 'in_progress')}
                                                                        sx={{
                                                                            minHeight: 44,
                                                                            px: 1.5,
                                                                            ...microLabel,
                                                                            fontSize: 10,
                                                                            borderRadius: 1,
                                                                            borderColor: hairline,
                                                                            color: a.status === 'in_progress' ? 'secondary.contrastText' : 'secondary.main',
                                                                        }}
                                                                    >Start</Button>
                                                                    <Button
                                                                        size="small"
                                                                        disableElevation
                                                                        variant="outlined"
                                                                        color="success"
                                                                        onClick={() => handleStatusClick(a.id, 'completed')}
                                                                        sx={{
                                                                            minHeight: 44,
                                                                            px: 1.5,
                                                                            ...microLabel,
                                                                            fontSize: 10,
                                                                            borderRadius: 1,
                                                                        }}
                                                                    >Done</Button>
                                                                </Stack>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            );
                                        })}
                                        {assignments.length === 0 && (
                                            <Box sx={{ px: { xs: 2.5, md: 3 }, py: 4, textAlign: 'center' }}>
                                                <Iconify icon="solar:hourglass-linear" width={28} sx={{ color: alpha(theme.palette.warning.main, 0.5), mb: 1 }} />
                                                <Typography sx={{ ...microLabel, fontSize: 10, color: 'text.secondary' }}>
                                                    Waiting for services
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Footer: check-in time + progress / complete */}
                                    <Box
                                        sx={{
                                            px: { xs: 2.5, md: 3 },
                                            py: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 1,
                                            borderTop: '1px solid',
                                            borderColor: hairline,
                                        }}
                                    >
                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Iconify icon="solar:clock-circle-linear" width={14} sx={{ color: 'text.disabled' }} />
                                            <Typography sx={{ ...microLabel, fontSize: 10, color: 'text.secondary' }} noWrap>
                                                In {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {progress === 100 && (
                                                <Button
                                                    size="small"
                                                    disableElevation
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleCompleteSession(session.id)}
                                                    sx={{ minHeight: 44, px: 1.5, ...microLabel, fontSize: 10, borderRadius: 1 }}
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                            <Chip
                                                label={progress === 100 ? 'Settled' : `${Math.round(progress)}%`}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    ...microLabel,
                                                    fontSize: 10,
                                                    borderRadius: 1,
                                                    height: 26,
                                                    borderColor: hairline,
                                                    color: isDone ? theme.palette.success.main : 'secondary.main',
                                                }}
                                            />
                                        </Stack>
                                    </Box>
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
