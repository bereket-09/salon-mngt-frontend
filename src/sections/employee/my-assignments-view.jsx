import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Chip,
    Stack,
    Avatar,
    Button,
    Grid,
    Divider,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import { useResponsive } from 'src/hooks/use-responsive';
import dayjs from 'dayjs';

export default function MyAssignmentsView() {
    const theme = useTheme();
    const isMobile = useResponsive('down', 'md');
    const [assignments, setAssignments] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState({ open: false, id: null, status: '' });
    const [openAdd, setOpenAdd] = useState({ open: false, sessionId: null });
    const [selectedServices, setSelectedServices] = useState([]);
    const [showActiveBoard, setShowActiveBoard] = useState(false);
    const [showDoneToday, setShowDoneToday] = useState(false);
    const userStr = localStorage.getItem('userData');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        if (user) {
            fetchMyAssignments();
            fetchActiveSessions();
            fetchServices();
        }
        const interval = setInterval(() => {
            fetchMyAssignments();
            fetchActiveSessions();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${config.BASE_URL}/services`, { headers: { Authorization: `Bearer ${token}` } });
            setServices(await res.json() || []);
        } catch (err) { console.error(err); }
    };

    const fetchActiveSessions = async () => {
        try {
            const res = await fetch(`${config.BASE_URL}/sessions/active`, { headers: { Authorization: `Bearer ${token}` } });
            setActiveSessions(await res.json() || []);
        } catch (err) { console.error(err); }
    };

    const fetchMyAssignments = async () => {
        try {
            const res = await fetch(`${config.BASE_URL}/assignments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const all = await res.json() || [];
            const myJobs = all.filter(a => a.employeeId === user?.id);
            setAssignments(myJobs);
        } catch (err) {
            console.error('MyAssignments fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelfAssign = async () => {
        if (!selectedServices.length) return;
        try {
            const res = await fetch(`${config.BASE_URL}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    sessionId: openAdd.sessionId,
                    employeeId: user.id,
                    serviceIds: selectedServices,
                    status: 'assigned'
                }),
            });
            if (res.ok) {
                setOpenAdd({ open: false, sessionId: null });
                setSelectedServices([]);
                fetchMyAssignments();
            }
        } catch (err) { console.error(err); }
    };

    const handleActionClick = (id, status) => {
        setConfirm({ open: true, id, status });
    };

    const executeUpdate = async () => {
        const { id, status } = confirm;
        setConfirm({ open: false, id: null, status: '' });
        try {
            const url = status === 'completed'
                ? `${config.BASE_URL}/assignments/${id}/complete`
                : `${config.BASE_URL}/assignments/${id}`;

            const method = status === 'completed' ? 'POST' : 'PUT';
            const body = status === 'completed' ? {} : { status };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: method === 'POST' ? null : JSON.stringify(body),
            });

            if (res.ok) fetchMyAssignments();
        } catch (err) {
            console.error('Status update error:', err);
        }
    };

    if (loading && !assignments.length) {
        return (
            <Box>
                <Stack direction="row" alignItems="center" spacing={{ xs: 2, md: 3 }} mb={4}>
                    <Skeleton variant="circular" sx={{ width: { xs: 56, md: 72 }, height: { xs: 56, md: 72 }, flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" sx={{ fontSize: '2rem', maxWidth: 240 }} />
                        <Skeleton variant="text" sx={{ fontSize: '0.75rem', maxWidth: 160 }} />
                    </Box>
                </Stack>
                <Skeleton variant="rounded" height={48} sx={{ borderRadius: 2, mb: 3 }} />
                <Stack spacing={2}>
                    {[1, 2, 3].map((n) => (
                        <Skeleton key={n} variant="rounded" sx={{ height: { xs: 120, md: 96 }, borderRadius: 2 }} />
                    ))}
                </Stack>
            </Box>
        );
    }

    const activeJobs = assignments.filter(a => a.status === 'in_progress');
    const pausedJobs = assignments.filter(a => a.status === 'waiting');
    const queueJobs = assignments.filter(a => ['assigned', 'pending'].includes(a.status));
    const completedJobs = assignments.filter(a => a.status === 'completed');

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4} spacing={1.5}>
                <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar
                        src={user?.avatarUrl}
                        sx={{
                            width: { xs: 48, md: 72 }, height: { xs: 48, md: 72 }, flexShrink: 0, bgcolor: '#1A1A1A', color: '#9A7B4F',
                            fontWeight: 900, border: '4px solid', borderColor: alpha('#9A7B4F', 0.2),
                        }}
                    >
                        {user?.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '2.125rem' } }} noWrap>Selam, {user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={900}>YOUR WORKBOARD TODAY</Typography>
                    </Box>
                </Stack>
                <Chip
                    label={`${activeJobs.length} WORKING`}
                    color="error"
                    sx={{ fontWeight: 900, borderRadius: 1, flexShrink: 0 }}
                />
            </Stack>

            {/* ACTIVE SALON BOARD FOR SELF-ASSIGN */}
            <Box sx={{ mb: 6 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => setShowActiveBoard(!showActiveBoard)}
                    sx={{
                        cursor: 'pointer',
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#1A1A1A', 0.03),
                        '&:hover': { bgcolor: alpha('#1A1A1A', 0.06) },
                        transition: '0.3s'
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Iconify icon="solar:users-group-rounded-linear" sx={{ color: 'secondary.main' }} />
                        Active Customers In Salon
                    </Typography>
                    <IconButton size="small" sx={{ bgcolor: showActiveBoard ? 'secondary.main' : alpha('#1A1A1A', 0.1), color: showActiveBoard ? 'white' : 'inherit' }}>
                        <Iconify icon={showActiveBoard ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} />
                    </IconButton>
                </Stack>

                {showActiveBoard && (
                    <Grid container spacing={2}>
                        {activeSessions.length === 0 && (
                            <Grid item xs={12}>
                                <Card sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.background.neutral, 0.4), border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="body2" color="text.disabled" fontWeight={800}>NO ACTIVE CUSTOMERS AT THE MOMENT</Typography>
                                </Card>
                            </Grid>
                        )}
                        {activeSessions.map((sess) => (
                            <Grid item xs={12} sm={6} md={4} key={sess.id}>
                                <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), transition: '0.3s', '&:hover': { borderColor: 'secondary.main', boxShadow: theme.customShadows.z8 } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={900}>{sess.Customer?.name?.toUpperCase()}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={800}>#SID-{sess.id}</Typography>
                                        </Box>
                                        <Button
                                            size="small" variant="soft" color="secondary"
                                            onClick={(e) => { e.stopPropagation(); setOpenAdd({ open: true, sessionId: sess.id }); }}
                                            sx={{ fontWeight: 800, borderRadius: 1 }}
                                            startIcon={<Iconify icon="solar:add-circle-bold" />}
                                        >
                                            ADD TASK
                                        </Button>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* WORKING NOW SECTION */}
            {activeJobs.map(job => (
                <Card key={job.id} sx={{ mb: 4, p: { xs: 2.5, md: 4 }, borderRadius: 3, border: '2px solid', borderColor: 'secondary.main' }}>
                    <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Typography variant="overline" color="error.main" fontWeight={900}>WORKING NOW</Typography>
                                <Chip label={`#SID-${job.CustomerSessionId}`} size="small" variant="soft" color="secondary" sx={{ fontWeight: 900, borderRadius: 0.5, height: 20, fontSize: '0.65rem' }} />
                            </Stack>
                            <Typography variant="h3" fontWeight={900} sx={{ mb: 1, fontSize: { xs: '1.6rem', md: '3rem' }, lineHeight: 1.1 }}>{job.Services?.map(s => s.name).join(' + ').toUpperCase()}</Typography>
                            <Stack spacing={0.5}>
                                <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="center">
                                    <Iconify icon="solar:user-linear" sx={{ color: 'text.secondary' }} />
                                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', md: '1.5rem' } }}>{job.CustomerSession?.Customer?.name || 'Customer'}</Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ ml: { xs: 3.5, md: 4 } }}>
                                    TEL: {job.CustomerSession?.Customer?.phone || 'NO PHONE'}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={{ xs: 1.5, md: 2 }}>
                                <Button
                                    fullWidth variant="contained" color="success" size="large"
                                    onClick={() => handleActionClick(job.id, 'completed')}
                                    sx={{ height: { xs: 52, md: 64 }, fontWeight: 900, fontSize: { xs: '1rem', md: '1.2rem' } }}
                                    startIcon={<Iconify icon="solar:check-circle-linear" />}
                                >
                                    FINISH JOB
                                </Button>
                                <Button
                                    fullWidth variant="soft" color="warning" size="large"
                                    onClick={() => handleActionClick(job.id, 'waiting')}
                                    sx={{ height: { xs: 48, md: 52 }, fontWeight: 900 }}
                                    startIcon={<Iconify icon="solar:pause-linear" />}
                                >
                                    PAUSE
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Card>
            ))}

            {/* PAUSED JOBS */}
            {pausedJobs.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Paused Jobs</Typography>
                    <Stack spacing={2}>
                        {pausedJobs.map(job => (
                            <Card key={job.id} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={{ xs: 2, sm: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="subtitle1" fontWeight={900}>{job.Services?.map(s => s.name).join(' + ')}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>#SID-{job.CustomerSessionId}</Typography>
                                        </Stack>
                                        <Typography variant="caption" fontWeight={700} display="block">{job.CustomerSession?.Customer?.name} • {job.CustomerSession?.Customer?.phone}</Typography>
                                    </Box>
                                    <Button
                                        variant="contained" color="warning"
                                        fullWidth={isMobile}
                                        onClick={() => handleActionClick(job.id, 'in_progress')}
                                        startIcon={<Iconify icon="solar:play-linear" />}
                                        sx={{ fontWeight: 900, height: { xs: 48, sm: 'auto' }, flexShrink: 0 }}
                                    >
                                        RESUME
                                    </Button>
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}

            <Grid container spacing={4}>
                {/* NEW JOBS LIST */}
                <Grid item xs={12} md={7}>
                    <Typography variant="h5" fontWeight={900} mb={3}>Waiting Jobs ({queueJobs.length})</Typography>
                    <Stack spacing={2}>
                        {queueJobs.map(job => (
                            <Card key={job.id} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, '&:hover': { transform: { md: 'translateX(8px)' } }, transition: '0.2s' }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={{ xs: 2, sm: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="h6" fontWeight={900}>{job.Services?.map(s => s.name).join(' + ')}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800 }}>#SID-{job.CustomerSessionId}</Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                                            Client: {job.CustomerSession?.Customer?.name} • {job.CustomerSession?.Customer?.phone}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="soft" color="secondary"
                                        fullWidth={isMobile}
                                        disabled={activeJobs.length > 0}
                                        onClick={() => handleActionClick(job.id, 'in_progress')}
                                        startIcon={<Iconify icon="solar:play-linear" />}
                                        sx={{ fontWeight: 900, height: { xs: 48, sm: 'auto' }, flexShrink: 0 }}
                                    >
                                        START
                                    </Button>
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Grid>

                {/* RECENTLY DONE */}
                <Grid item xs={12} md={5}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        onClick={() => setShowDoneToday(!showDoneToday)}
                        sx={{
                            cursor: 'pointer',
                            mb: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#1A1A1A', 0.03),
                            '&:hover': { bgcolor: alpha('#1A1A1A', 0.06) },
                            transition: '0.3s'
                        }}
                    >
                        <Typography variant="h5" fontWeight={900}>Done Today ({completedJobs.length})</Typography>
                        <IconButton size="small" sx={{ bgcolor: showDoneToday ? 'secondary.main' : alpha('#1A1A1A', 0.1), color: showDoneToday ? 'white' : 'inherit' }}>
                            <Iconify icon={showDoneToday ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} />
                        </IconButton>
                    </Stack>

                    {showDoneToday && (
                        <Stack spacing={2}>
                            {completedJobs.length === 0 && (
                                <Typography variant="body2" color="text.disabled" textAlign="center" py={4} fontWeight={800}>NO JOBS COMPLETED YET</Typography>
                            )}
                            {completedJobs.slice(0, 5).map(job => (
                                <Box key={job.id} sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1) }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={900}>{job.Services?.map(s => s.name).join(' + ')}</Typography>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">{dayjs(job.completedAt).format('h:mm A')}</Typography>
                                    </Box>
                                    <Iconify icon="solar:verified-check-linear" color="success.main" />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Grid>
            </Grid>

            <ConfirmDialog
                open={confirm.open}
                title="Are you sure?"
                content={`Do you want to change the status of this job?`}
                confirmLabel="Yes, Update"
                onConfirm={executeUpdate}
                onClose={() => setConfirm({ open: false, id: null, status: '' })}
            />

            {/* ADD JOB DIALOG */}
            <Dialog
                open={openAdd.open}
                onClose={() => setOpenAdd({ open: false, sessionId: null })}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>What service are you doing?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={3} fontWeight={700}>Select the services you will perform for this customer.</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Choose Services</InputLabel>
                        <Select
                            multiple
                            value={selectedServices}
                            onChange={(e) => setSelectedServices(e.target.value)}
                            label="Choose Services"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((val) => (
                                        <Chip key={val} label={services.find(s => s.id === val)?.name} size="small" sx={{ fontWeight: 800 }} />
                                    ))}
                                </Box>
                            )}
                        >
                            {services.map((s) => (
                                <MenuItem key={s.id} value={s.id} sx={{ fontWeight: 700 }}>
                                    {s.name} ({s.price} Br)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAdd({ open: false, sessionId: null })} color="inherit" sx={{ fontWeight: 900 }}>CANCEL</Button>
                    <Button
                        onClick={handleSelfAssign}
                        variant="contained" color="secondary"
                        disabled={!selectedServices.length}
                        sx={{ fontWeight: 900, px: 4 }}
                    >
                        START THIS JOB
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
