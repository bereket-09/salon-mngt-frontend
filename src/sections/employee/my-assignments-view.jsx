import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Chip,
    Stack,
    Avatar,
    Button,
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

// ─── Editorial Luxury shared style tokens ───────────────────────────────
const microLabel = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    lineHeight: 1.6,
    color: 'text.secondary',
};

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

    const hairline = alpha(theme.palette.divider, 0.18) || alpha(theme.palette.grey[500], 0.18);

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
                <Stack direction="row" alignItems="center" spacing={{ xs: 2, md: 3 }} mb={5}>
                    <Skeleton variant="circular" sx={{ width: { xs: 52, md: 64 }, height: { xs: 52, md: 64 }, flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" sx={{ fontSize: '2rem', maxWidth: 240 }} />
                        <Skeleton variant="text" sx={{ fontSize: '0.7rem', maxWidth: 140 }} />
                    </Box>
                </Stack>
                <Divider sx={{ borderColor: hairline, mb: 4 }} />
                <Stack spacing={0}>
                    {[1, 2, 3].map((n) => (
                        <Box key={n} sx={{ py: 3, borderBottom: '1px solid', borderColor: hairline }}>
                            <Skeleton variant="text" sx={{ fontSize: '1.5rem', maxWidth: 280 }} />
                            <Skeleton variant="text" sx={{ fontSize: '0.85rem', maxWidth: 180 }} />
                            <Skeleton variant="rounded" height={48} sx={{ borderRadius: '6px', mt: 2 }} />
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    }

    const activeJobs = assignments.filter(a => a.status === 'in_progress');
    const pausedJobs = assignments.filter(a => a.status === 'waiting');
    const queueJobs = assignments.filter(a => ['assigned', 'pending'].includes(a.status));
    const completedJobs = assignments.filter(a => a.status === 'completed');

    // Reusable flat card style: white, hairline border, ~6 radius, no shadow.
    const flatCard = {
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: hairline,
        borderRadius: '6px',
        boxShadow: 'none',
    };

    // Section header (serif) with a quiet micro-label count.
    const SectionHeader = ({ title, count }) => (
        <Stack spacing={0.5} sx={{ mb: 2.5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>{title}</Typography>
            {count !== undefined && (
                <Typography sx={microLabel}>{count} {count === 1 ? 'job' : 'jobs'}</Typography>
            )}
        </Stack>
    );

    // Collapsible section trigger — flat, hairline, touch-friendly.
    const CollapseHeader = ({ title, count, open, onToggle, icon }) => (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            onClick={onToggle}
            sx={{
                cursor: 'pointer',
                py: 2,
                borderBottom: '1px solid',
                borderColor: hairline,
                minHeight: 56,
            }}
        >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    {icon && <Iconify icon={icon} sx={{ color: 'secondary.main', width: 20, height: 20 }} />}
                    <Typography variant="h4" sx={{ color: 'primary.main', fontSize: { xs: '1.15rem', md: '1.35rem' } }} noWrap>{title}</Typography>
                </Stack>
                {count !== undefined && (
                    <Typography sx={{ ...microLabel, ml: icon ? '32px' : 0 }}>{count} total</Typography>
                )}
            </Stack>
            <IconButton sx={{ color: 'text.secondary', width: 44, height: 44 }}>
                <Iconify icon={open ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} />
            </IconButton>
        </Stack>
    );

    return (
        <Box>
            {/* ─── Editorial greeting header ─── */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ pb: 4 }}
            >
                <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar
                        src={user?.avatarUrl}
                        sx={{
                            width: { xs: 52, md: 64 }, height: { xs: 52, md: 64 }, flexShrink: 0,
                            bgcolor: 'primary.main', color: 'secondary.main',
                            fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' },
                            border: '1px solid', borderColor: hairline,
                        }}
                    >
                        {user?.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ ...microLabel, mb: 0.5 }}>Your workboard · today</Typography>
                        <Typography variant="h3" sx={{ color: 'primary.main', fontSize: { xs: '1.6rem', md: '2.25rem' } }} noWrap>
                            Selam, {user?.name}
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
            <Divider sx={{ borderColor: hairline }} />

            {/* ─── Currently working — the hero block ─── */}
            {activeJobs.map(job => (
                <Box key={job.id} sx={{ mt: 4, mb: 5 }}>
                    <Card sx={{ ...flatCard, p: { xs: 2.5, md: 4 } }}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'secondary.main', flexShrink: 0 }} />
                            <Typography sx={{ ...microLabel, color: 'secondary.main' }}>Currently working</Typography>
                            <Typography sx={{ ...microLabel }}>· #SID-{job.CustomerSessionId}</Typography>
                        </Stack>

                        <Typography
                            variant="h3"
                            sx={{ color: 'primary.main', mb: 2, fontSize: { xs: '1.75rem', md: '2.75rem' }, lineHeight: 1.1 }}
                        >
                            {job.Services?.map(s => s.name).join(' + ')}
                        </Typography>

                        <Stack spacing={1} sx={{ mb: { xs: 3, md: 3.5 } }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Iconify icon="solar:user-linear" sx={{ color: 'secondary.main', width: 20, height: 20 }} />
                                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.05rem', md: '1.35rem' } }}>
                                    {job.CustomerSession?.Customer?.name || 'Customer'}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pl: '4px' }}>
                                <Iconify icon="solar:phone-linear" sx={{ color: 'text.secondary', width: 14, height: 14 }} />
                                <Typography sx={microLabel}>{job.CustomerSession?.Customer?.phone || 'No phone'}</Typography>
                            </Stack>
                        </Stack>

                        <Divider sx={{ borderColor: hairline, mb: { xs: 2.5, md: 3 } }} />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <Button
                                fullWidth variant="contained" color="primary" size="large"
                                onClick={() => handleActionClick(job.id, 'completed')}
                                sx={{ minHeight: 52, borderRadius: '6px', fontWeight: 600, fontSize: '1rem', boxShadow: 'none' }}
                                startIcon={<Iconify icon="solar:check-circle-linear" />}
                            >
                                Finish job
                            </Button>
                            <Button
                                fullWidth variant="outlined" color="inherit" size="large"
                                onClick={() => handleActionClick(job.id, 'waiting')}
                                sx={{ minHeight: 52, borderRadius: '6px', fontWeight: 600, fontSize: '1rem', borderColor: hairline, color: 'text.primary' }}
                                startIcon={<Iconify icon="solar:pause-linear" />}
                            >
                                Pause
                            </Button>
                        </Stack>
                    </Card>
                </Box>
            ))}

            {/* ─── Waiting queue — editorial numbered list ─── */}
            <Box sx={{ mt: activeJobs.length ? 0 : 4, mb: 5 }}>
                <SectionHeader title="Waiting queue" count={queueJobs.length} />
                {queueJobs.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center', borderTop: '1px solid', borderColor: hairline }}>
                        <Typography sx={microLabel}>No jobs in your queue</Typography>
                    </Box>
                ) : (
                    <Box sx={{ borderTop: '1px solid', borderColor: hairline }}>
                        {queueJobs.map((job, idx) => (
                            <Box
                                key={job.id}
                                sx={{ py: { xs: 2.5, md: 3 }, borderBottom: '1px solid', borderColor: hairline }}
                            >
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    spacing={{ xs: 2, sm: 2 }}
                                >
                                    <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="flex-start" sx={{ minWidth: 0 }}>
                                        <Typography
                                            variant="h4"
                                            sx={{ color: 'secondary.main', fontWeight: 500, lineHeight: 1, flexShrink: 0, fontSize: { xs: '1.5rem', md: '1.75rem' }, fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {String(idx + 1).padStart(2, '0')}
                                        </Typography>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
                                                {job.Services?.map(s => s.name).join(' + ')}
                                            </Typography>
                                            <Typography sx={{ ...microLabel, mt: 0.5 }}>
                                                {job.CustomerSession?.Customer?.name} · {job.CustomerSession?.Customer?.phone} · #SID-{job.CustomerSessionId}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Button
                                        variant="outlined" color="inherit"
                                        fullWidth={isMobile}
                                        disabled={activeJobs.length > 0}
                                        onClick={() => handleActionClick(job.id, 'in_progress')}
                                        startIcon={<Iconify icon="solar:play-linear" />}
                                        sx={{
                                            flexShrink: 0, minHeight: { xs: 48, sm: 44 }, borderRadius: '6px',
                                            fontWeight: 600, borderColor: 'secondary.main', color: 'secondary.main',
                                            '&:hover': { borderColor: 'secondary.dark', bgcolor: alpha(theme.palette.secondary.main, 0.04) },
                                        }}
                                    >
                                        Start
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* ─── Paused jobs ─── */}
            {pausedJobs.length > 0 && (
                <Box sx={{ mb: 5 }}>
                    <SectionHeader title="Paused" count={pausedJobs.length} />
                    <Box sx={{ borderTop: '1px solid', borderColor: hairline }}>
                        {pausedJobs.map(job => (
                            <Box key={job.id} sx={{ py: { xs: 2.5, md: 3 }, borderBottom: '1px solid', borderColor: hairline }}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    spacing={{ xs: 2, sm: 2 }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
                                            {job.Services?.map(s => s.name).join(' + ')}
                                        </Typography>
                                        <Typography sx={{ ...microLabel, mt: 0.5 }}>
                                            {job.CustomerSession?.Customer?.name} · {job.CustomerSession?.Customer?.phone} · #SID-{job.CustomerSessionId}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained" color="primary"
                                        fullWidth={isMobile}
                                        onClick={() => handleActionClick(job.id, 'in_progress')}
                                        startIcon={<Iconify icon="solar:play-linear" />}
                                        sx={{ flexShrink: 0, minHeight: { xs: 48, sm: 44 }, borderRadius: '6px', fontWeight: 600, boxShadow: 'none' }}
                                    >
                                        Resume
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* ─── Active customers in salon (self-assign) — collapsible ─── */}
            <Box sx={{ mb: 5 }}>
                <CollapseHeader
                    title="Active customers in salon"
                    count={activeSessions.length}
                    open={showActiveBoard}
                    onToggle={() => setShowActiveBoard(!showActiveBoard)}
                    icon="solar:users-group-rounded-linear"
                />
                {showActiveBoard && (
                    <Box sx={{ pt: 1 }}>
                        {activeSessions.length === 0 ? (
                            <Box sx={{ py: 5, textAlign: 'center' }}>
                                <Typography sx={microLabel}>No active customers at the moment</Typography>
                            </Box>
                        ) : (
                            activeSessions.map((sess) => (
                                <Box
                                    key={sess.id}
                                    sx={{ py: { xs: 2, md: 2.5 }, borderBottom: '1px solid', borderColor: hairline }}
                                >
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: 'stretch', sm: 'center' }}
                                        spacing={{ xs: 1.5, sm: 2 }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
                                                {sess.Customer?.name}
                                            </Typography>
                                            <Typography sx={{ ...microLabel, mt: 0.5 }}>#SID-{sess.id}</Typography>
                                        </Box>
                                        <Button
                                            variant="outlined" color="inherit"
                                            fullWidth={isMobile}
                                            onClick={(e) => { e.stopPropagation(); setOpenAdd({ open: true, sessionId: sess.id }); }}
                                            startIcon={<Iconify icon="solar:add-circle-linear" />}
                                            sx={{
                                                flexShrink: 0, minHeight: { xs: 48, sm: 44 }, borderRadius: '6px',
                                                fontWeight: 600, borderColor: 'secondary.main', color: 'secondary.main',
                                                '&:hover': { borderColor: 'secondary.dark', bgcolor: alpha(theme.palette.secondary.main, 0.04) },
                                            }}
                                        >
                                            Add task
                                        </Button>
                                    </Stack>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            {/* ─── Done today — collapsible ─── */}
            <Box sx={{ mb: 5 }}>
                <CollapseHeader
                    title="Done today"
                    count={completedJobs.length}
                    open={showDoneToday}
                    onToggle={() => setShowDoneToday(!showDoneToday)}
                    icon="solar:check-circle-linear"
                />
                {showDoneToday && (
                    <Box sx={{ pt: 1 }}>
                        {completedJobs.length === 0 ? (
                            <Box sx={{ py: 5, textAlign: 'center' }}>
                                <Typography sx={microLabel}>No jobs completed yet</Typography>
                            </Box>
                        ) : (
                            completedJobs.slice(0, 5).map(job => (
                                <Box
                                    key={job.id}
                                    sx={{ py: 2, borderBottom: '1px solid', borderColor: hairline, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 600 }} noWrap>
                                            {job.Services?.map(s => s.name).join(' + ')}
                                        </Typography>
                                        <Typography sx={{ ...microLabel, mt: 0.25 }}>{dayjs(job.completedAt).format('h:mm A')}</Typography>
                                    </Box>
                                    <Iconify icon="solar:verified-check-linear" sx={{ color: 'secondary.main', flexShrink: 0, width: 22, height: 22 }} />
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            <ConfirmDialog
                open={confirm.open}
                title="Are you sure?"
                content={`Do you want to change the status of this job?`}
                confirmLabel="Yes, Update"
                onConfirm={executeUpdate}
                onClose={() => setConfirm({ open: false, id: null, status: '' })}
            />

            {/* ─── Add job dialog ─── */}
            <Dialog
                open={openAdd.open}
                onClose={() => setOpenAdd({ open: false, sessionId: null })}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: '6px', border: '1px solid', borderColor: hairline, boxShadow: 'none' } }}
            >
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Typography sx={{ ...microLabel, mb: 0.75 }}>Self-assign</Typography>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>What service are you doing?</Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select the services you will perform for this customer.
                    </Typography>
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
                                        <Chip key={val} label={services.find(s => s.id === val)?.name} size="small" sx={{ fontWeight: 600, borderRadius: '4px' }} />
                                    ))}
                                </Box>
                            )}
                        >
                            {services.map((s) => (
                                <MenuItem key={s.id} value={s.id} sx={{ fontWeight: 500 }}>
                                    {s.name} ({s.price} Br)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAdd({ open: false, sessionId: null })} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button
                        onClick={handleSelfAssign}
                        variant="contained" color="primary"
                        disabled={!selectedServices.length}
                        sx={{ fontWeight: 600, px: 4, borderRadius: '6px', boxShadow: 'none' }}
                    >
                        Start this job
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
