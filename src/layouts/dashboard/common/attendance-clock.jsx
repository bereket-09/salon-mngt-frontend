/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Stack, alpha, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Iconify from 'src/components/iconify';
import config from 'src/config';

export default function AttendanceClock() {
    const [status, setStatus] = useState(null); // Full attendance record
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState('00:00:00');

    // Dialog state
    const [dialog, setDialog] = useState({ open: false, type: '' });

    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('authToken');
    const selectedBranchId = localStorage.getItem('selectedBranchId');

    const fetchStatus = useCallback(async () => {
        if (!userData || !token) return;
        try {
            const res = await fetch(`${config.BASE_URL}/attendance/status/${userData.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setStatus(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [userData?.id, token]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        let interval;
        if (status?.checkInTime && !status?.checkOutTime && status?.status !== 'on_break') {
            interval = setInterval(() => {
                const start = new Date(status.checkInTime);
                const now = new Date();
                const diff = (now - start) - ((status.breakMinutes || 0) * 60000);

                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);

                setTimer(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const getCoords = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ lat: null, lng: null });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve({ lat: null, lng: null }),
                { timeout: 5000 }
            );
        });
    };

    const handleAction = async (action) => {
        setLoading(true);
        setDialog({ open: false, type: '' });
        try {
            const endpoint = action || 'check-in';
            const { lat, lng } = await getCoords();

            const branchId = (selectedBranchId && selectedBranchId !== 'all')
                ? selectedBranchId
                : (userData.branches?.[0]?.id || userData.BranchId);

            const res = await fetch(`${config.BASE_URL}/attendance/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userData.id, branchId, lat, lng })
            });
            if (res.ok) {
                await fetchStatus();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!userData) return null;

    const isClockedIn = status?.checkInTime && !status?.checkOutTime;
    const isOnBreak = status?.status === 'on_break';
    const isFinished = status?.checkOutTime;

    const openConfirm = (type) => setDialog({ open: true, type });

    return (
        <Box sx={{ px: 2, py: 3, mt: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Box sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#1B1F3A', 0.4),
                border: '1px solid',
                borderColor: isClockedIn ? (isOnBreak ? 'warning.main' : 'secondary.main') : (isFinished ? 'success.main' : 'rgba(255, 255, 255, 0.08)'),
                boxShadow: isClockedIn && !isOnBreak ? '0 0 20px rgba(200, 151, 42, 0.1)' : 'none',
                transition: 'all 0.4s ease'
            }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 1 }}>
                            {isOnBreak ? 'ON BREAK' : (isFinished ? 'SHIFT ENDED' : 'SHIFT STATUS')}
                        </Typography>
                        {isClockedIn && !isOnBreak && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main', animation: 'pulse 2s infinite' }} />
                        )}
                        {isFinished && (
                            <Iconify icon="solar:check-circle-bold-duotone" width={16} sx={{ color: 'success.main' }} />
                        )}
                    </Stack>

                    {isClockedIn ? (
                        <Box>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                                {isOnBreak ? 'PAUSED' : timer}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                {isOnBreak ? `Break started ${new Date(status.lastBreakStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `Active Work Time (Excl. Breaks)`}
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body2" sx={{ color: isFinished ? 'success.main' : 'text.disabled', fontWeight: 700 }}>
                                {isFinished ? `Today: ${status.totalHours} Hrs Logged` : 'Ready to start your day?'}
                            </Typography>
                            {isFinished && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    Ended at {new Date(status.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Stack spacing={1}>
                        {!isClockedIn && !isFinished && (
                            <Button
                                fullWidth variant="contained" color="secondary"
                                onClick={() => openConfirm('check-in')} disabled={loading}
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:play-bold-duotone" />}
                                sx={{ fontWeight: 900, borderRadius: 1.5, py: 1.2 }}
                            >
                                CLOCK IN
                            </Button>
                        )}

                        {isClockedIn && (
                            <>
                                <Button
                                    fullWidth variant="soft" color={isOnBreak ? "warning" : "info"}
                                    onClick={() => openConfirm('toggle-break')} disabled={loading}
                                    startIcon={<Iconify icon={isOnBreak ? "solar:restart-bold-duotone" : "solar:coffee-bold-duotone"} />}
                                    sx={{ fontWeight: 900, borderRadius: 1.5, py: 1 }}
                                >
                                    {isOnBreak ? 'END BREAK' : 'START BREAK'}
                                </Button>
                                <Button
                                    fullWidth variant="soft" color="error"
                                    onClick={() => openConfirm('check-out')} disabled={loading}
                                    startIcon={<Iconify icon="solar:stop-bold-duotone" />}
                                    sx={{ fontWeight: 900, borderRadius: 1.5, py: 1 }}
                                >
                                    CLOCK OUT
                                </Button>
                            </>
                        )}

                        {isFinished && (
                            <Button
                                fullWidth variant="soft" color="inherit"
                                onClick={() => openConfirm('undo-checkout')} disabled={loading}
                                startIcon={<Iconify icon="solar:undo-left-bold-duotone" />}
                                sx={{ fontWeight: 900, borderRadius: 1.5, py: 1, color: 'text.primary', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                UNDO END
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>

            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, type: '' })} PaperProps={{ sx: { borderRadius: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900, p: 3 }}>
                    {dialog.type === 'check-in' && 'Start Work Shift?'}
                    {dialog.type === 'toggle-break' && (isOnBreak ? 'Resume Work?' : 'Go on Break?')}
                    {dialog.type === 'check-out' && 'End Work Shift?'}
                    {dialog.type === 'undo-checkout' && 'Mistakenly Ended?'}
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2 }}>
                    <DialogContentText sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {dialog.type === 'check-in' && 'Confirm starting your shift? GPS location will be captured.'}
                        {dialog.type === 'toggle-break' && (isOnBreak ? 'Confirm resuming your productive work hours?' : 'Confirm starting your break? Work timer will pause.')}
                        {dialog.type === 'check-out' && 'Confirm completion of your shift? Geolocation will be saved for verification.'}
                        {dialog.type === 'undo-checkout' && 'Did you stop your session by mistake? This will restore your session so you can continue working.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialog({ open: false, type: '' })} sx={{ fontWeight: 800 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={dialog.type === 'undo-checkout' ? 'secondary' : (dialog.type === 'check-out' ? 'error' : (isOnBreak ? 'info' : 'secondary'))}
                        onClick={() => handleAction(dialog.type)}
                        autoFocus sx={{ fontWeight: 900, px: 3, borderRadius: 1 }}
                    >
                        {dialog.type === 'check-in' && 'START SESSION'}
                        {dialog.type === 'toggle-break' && (isOnBreak ? 'RESUME NOW' : 'START BREAK')}
                        {dialog.type === 'check-out' && 'CLOCK OUT'}
                        {dialog.type === 'undo-checkout' && 'RESUME SESSION'}
                    </Button>
                </DialogActions>
            </Dialog>

            <style>
                {`
                    @keyframes pulse {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(200, 151, 42, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(200, 151, 42, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(200, 151, 42, 0); }
                    }
                `}
            </style>
        </Box>
    );
}
