import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Table,
    Stack,
    Avatar,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    TableContainer,
    TablePagination,
    IconButton,
    Button,
    Chip,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Tooltip,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useResponsive } from 'src/hooks/use-responsive';
import config from 'src/config';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';
import BookingCalendar from '../booking-calendar';
import { TextField, MenuItem, Autocomplete, FormControl, InputLabel, Select } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function BookingsView() {
    const theme = useTheme();
    const isMobile = useResponsive('down', 'md');
    const [data, setData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState('pending');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [openCreate, setOpenCreate] = useState(false);
    const [newBooking, setNewBooking] = useState({
        customerName: '',
        phone: '',
        branchId: '',
        serviceIds: [],
        employeeId: '',
        preferredDate: dayjs().format('YYYY-MM-DD'),
        preferredTime: '10:00',
        status: 'pending',
        notes: ''
    });

    // Specialists eligible for the services chosen in the create dialog
    // (match by service category or its parent). Falls back to all staff.
    const bookingEligibleEmployees = (() => {
        const selected = services.filter((s) => newBooking.serviceIds.includes(s.id));
        if (!selected.length) return employees;
        const matched = employees.filter((emp) => {
            if (emp.role !== 'employee') return true; // keep admins/receptionists pickable
            const specs = (emp.Specialties || []).map((c) => c.id);
            if (!specs.length) return true;
            return selected.every((svc) => {
                const ids = [svc.categoryId, svc.Category?.parentId].filter(Boolean);
                if (!ids.length) return true;
                return ids.some((id) => specs.includes(id));
            });
        });
        return matched.length ? matched : employees;
    })();

    // Confirm Dialog State
    const [confirm, setConfirm] = useState({ open: false, type: '', id: null });

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchData();
        fetch(`${config.BASE_URL}/branches`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
            .then(r => r.json()).then(setBranches).catch(console.error);
        fetch(`${config.BASE_URL}/services`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
            .then(r => r.json()).then(setServices).catch(console.error);
        fetch(`${config.BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
            .then(r => r.json()).then(setEmployees).catch(console.error);
    }, [status]);

    const fetchData = async () => {
        const currentBranchId = localStorage.getItem('selectedBranchId');
        const branchParam = (currentBranchId && currentBranchId !== 'all') ? `&branchId=${currentBranchId}` : '';
        const url = `${config.BASE_URL}/bookings?status=${status === 'all' ? '' : status}${branchParam}`;
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            const result = await res.json();
            setData(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${config.BASE_URL}/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchData();
                setOpenModal(false);
                setConfirm({ open: false, type: '', id: null });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleConvertToSession = async (id) => {
        setIsConverting(true);
        try {
            const res = await fetch(`${config.BASE_URL}/bookings/${id}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ branchId: selectedBooking?.BranchId }),
            });
            if (res.ok) {
                fetchData();
                setOpenModal(false);
                setConfirm({ open: false, type: '', id: null });
            } else {
                const err = await res.json();
                alert(err.error || 'Check-in failed');
            }
        } catch (err) {
            console.error(err);
            alert('A network error occurred');
        } finally {
            setIsConverting(false);
        }
    };
    const handleCreateBooking = async () => {
        try {
            const res = await fetch(`${config.BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBooking),
            });
            if (res.ok) {
                setOpenCreate(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (s) => ({
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'error',
        completed: 'info'
    }[s] || 'default');

    const checkConflicts = (booking) => {
        if (!booking.preferredDate || !booking.preferredTime) return false;
        return data.filter(b =>
            b.id !== booking.id &&
            b.preferredDate === booking.preferredDate &&
            b.preferredTime === booking.preferredTime &&
            b.status !== 'cancelled'
        ).length > 0;
    };

    return (
        <Box>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
                spacing={2}
                mb={5}
            >
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900 }}>Appointments</Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>Manage your coming and past bookings.</Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                    <Button
                        variant="soft" color="inherit"
                        onClick={() => setViewMode(v => v === 'list' ? 'calendar' : 'list')}
                        startIcon={<Iconify icon={viewMode === 'list' ? "solar:calendar-linear" : "solar:list-linear"} />}
                        sx={{ fontWeight: 800, height: 48, borderRadius: 1.5, flex: { xs: 1, sm: 'none' } }}
                    >
                        {viewMode === 'list' ? 'CALENDAR VIEW' : 'LIST VIEW'}
                    </Button>
                    <Button
                        variant="contained" color="secondary"
                        onClick={() => setOpenCreate(true)}
                        startIcon={<Iconify icon="solar:add-circle-bold" />}
                        sx={{ fontWeight: 900, height: 48, borderRadius: 1.5, px: 3, flex: { xs: 1, sm: 'none' } }}
                    >
                        NEW RESERVATION
                    </Button>
                </Stack>
            </Stack>

            {viewMode === 'calendar' ? (
                <BookingCalendar 
                    user={JSON.parse(localStorage.getItem('userData'))} 
                    onSelectBooking={(b) => { setSelectedBooking(b); setOpenModal(true); }} 
                />
            ) : (
                <Card sx={{ borderRadius: 3, boxShadow: theme.customShadows.z12, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), overflow: 'hidden' }}>
                    {/* ... (TABS and Table) ... */}
                <Tabs
                    value={status}
                    onChange={(e, v) => setStatus(v)}
                    sx={{
                        px: 3,
                        bgcolor: alpha(theme.palette.background.neutral, 0.5),
                        '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0', bgcolor: 'secondary.main' },
                        '& .MuiTab-root': { fontWeight: 900, letterSpacing: 1, minHeight: 64 }
                    }}
                >
                    {['pending', 'confirmed', 'completed', 'cancelled', 'all'].map(s => (
                        <Tab key={s} value={s} label={s.toUpperCase()} />
                    ))}
                </Tabs>

                {isMobile ? (
                    <Stack spacing={2} sx={{ p: 2 }}>
                        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            const hasConflict = checkConflicts(row);
                            const conflicting = hasConflict && row.status !== 'cancelled';
                            return (
                                <Card
                                    key={row.id}
                                    onClick={() => { setSelectedBooking(row); setOpenModal(true); }}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        boxShadow: theme.customShadows.z8,
                                        border: '1px solid',
                                        borderColor: conflicting ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.divider, 0.1),
                                        bgcolor: conflicting ? alpha(theme.palette.warning.main, 0.04) : 'background.paper',
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{
                                            width: 44, height: 44, flexShrink: 0,
                                            bgcolor: conflicting ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                                            color: conflicting ? 'warning.main' : 'primary.main',
                                            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1)
                                        }}>
                                            <Iconify icon={conflicting ? "solar:danger-bold" : "solar:user-bold"} />
                                        </Avatar>
                                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={900} noWrap>{row.customerName.toUpperCase()}</Typography>
                                                {conflicting && (
                                                    <Box sx={{ p: 0.5, bgcolor: 'warning.main', borderRadius: 0.5, display: 'flex', flexShrink: 0 }}>
                                                        <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'white', width: 12, height: 12 }} />
                                                    </Box>
                                                )}
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }} noWrap>TEL: {row.phone}</Typography>
                                        </Box>
                                        <Chip
                                            label={row.status.toUpperCase()}
                                            variant="soft"
                                            color={getStatusColor(row.status)}
                                            sx={{ fontWeight: 900, borderRadius: 1, fontSize: '0.6rem', flexShrink: 0 }}
                                        />
                                    </Stack>
                                    <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: alpha(theme.palette.divider, 0.15) }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 1, fontWeight: 900, display: 'block' }}>BRANCH</Typography>
                                            <Typography variant="subtitle2" fontWeight={800} noWrap>{row.Branch?.name?.toUpperCase() || 'MAIN BRANCH'}</Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 1, fontWeight: 900, display: 'block' }}>WHEN</Typography>
                                            <Typography variant="subtitle2" fontWeight={900} noWrap>{row.preferredDate || 'DATE TBD'}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>{row.preferredTime || '-'}</Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            );
                        })}
                        {data.length === 0 && (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.disabled" fontWeight={800}>NO RESERVATIONS</Typography>
                            </Box>
                        )}
                    </Stack>
                ) : (
                <Scrollbar>
                    <TableContainer sx={{ minWidth: 800 }}>
                        <Table>
                            <TableBody>
                                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                    const hasConflict = checkConflicts(row);
                                    return (
                                        <TableRow
                                            hover
                                            key={row.id}
                                            onClick={() => { setSelectedBooking(row); setOpenModal(true); }}
                                            sx={{
                                                cursor: 'pointer',
                                                transition: '0.2s',
                                                bgcolor: hasConflict && row.status !== 'cancelled' ? alpha(theme.palette.warning.main, 0.03) : 'inherit',
                                                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.02) }
                                            }}
                                        >
                                            <TableCell sx={{ pl: 4 }}>
                                                <Avatar sx={{
                                                    width: 48, height: 48,
                                                    bgcolor: hasConflict && row.status !== 'cancelled' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
                                                    color: hasConflict && row.status !== 'cancelled' ? 'warning.main' : 'primary.main',
                                                    border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1)
                                                }}>
                                                    <Iconify icon={hasConflict && row.status !== 'cancelled' ? "solar:danger-bold" : "solar:user-bold"} />
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Typography variant="subtitle1" fontWeight={900} noWrap>{row.customerName.toUpperCase()}</Typography>
                                                    {hasConflict && row.status !== 'cancelled' && (
                                                        <Tooltip title="SCHEDULING CONFLICT DETECTED">
                                                            <Box sx={{ p: 0.5, bgcolor: 'warning.main', borderRadius: 0.5, display: 'flex' }}>
                                                                <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'white', width: 12, height: 12 }} />
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>TEL: {row.phone}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={800}>{row.Branch?.name?.toUpperCase() || 'MAIN BRANCH'}</Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: 1, fontWeight: 900 }}>BRANCH</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={900}>{row.preferredDate || 'DATE TBD'}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>{row.preferredTime || '-'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status.toUpperCase()}
                                                    variant="soft"
                                                    color={getStatusColor(row.status)}
                                                    sx={{ fontWeight: 900, borderRadius: 1, fontSize: '0.65rem' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: 4 }}>
                                                <IconButton>
                                                    <Iconify icon="solar:alt-arrow-right-linear" sx={{ color: 'text.disabled' }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
                )}

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}
                />
                </Card>
            )}

            {/* ARTISTIC RESERVATION DETAILS */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                {selectedBooking && (
                    <>
                        <DialogTitle sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: '#1A1A1A', color: 'white' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 900 }}>Appointment Info</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800 }}>ABOUT THE CUSTOMER</Typography>
                                </Box>
                                <Chip
                                    label={selectedBooking.status.toUpperCase()}
                                    color={getStatusColor(selectedBooking.status)}
                                    variant="soft"
                                    sx={{ fontWeight: 900, borderRadius: 1 }}
                                />
                            </Stack>
                        </DialogTitle>
                        <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, mt: 2 }}>
                            <Grid container spacing={{ xs: 3, sm: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="overline" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 2 }}>CLIENT INFO</Typography>
                                    <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>{selectedBooking.customerName.toUpperCase()}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={700}>{selectedBooking.phone}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedBooking.email || 'NO EMAIL'}</Typography>
                                    {selectedBooking.Specialist && (
                                        <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                                            <Iconify icon="solar:star-fall-bold" sx={{ color: '#9A7B4F' }} />
                                            <Typography variant="subtitle2" fontWeight={900}>ASSIGNED: {selectedBooking.Specialist.name.toUpperCase()}</Typography>
                                        </Stack>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="overline" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 2 }}>WHEN & WHERE</Typography>
                                    <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>{selectedBooking.Branch?.name?.toUpperCase() || 'NO BRANCH'}</Typography>
                                    <Typography variant="body2" color="text.primary" fontWeight={800}>{selectedBooking.preferredDate}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedBooking.preferredTime}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="overline" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 2 }}>SERVICES NEEDED</Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1.5} mt={1.5}>
                                        {selectedBooking.serviceIds?.map(sid => {
                                            const s = services.find(x => x.id === sid);
                                            return (
                                                <Chip
                                                    key={sid}
                                                    label={s ? `${s.code ? '['+s.code+'] ' : ''}${s.name.toUpperCase()}` : `IDENTIFIER: ${sid}`}
                                                    variant="soft"
                                                    color="secondary"
                                                    sx={{ fontWeight: 900, borderRadius: 1 }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                </Grid>
                                {selectedBooking.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="overline" color="text.disabled" fontWeight={900} sx={{ letterSpacing: 2 }}>NOTES</Typography>
                                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.neutral, 0.4), borderLeft: '4px solid', borderColor: 'secondary.main', borderRadius: 1, mt: 1.5 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ fontStyle: 'italic' }}>"{selectedBooking.notes}"</Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: alpha(theme.palette.background.neutral, 0.4), gap: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, '& > :not(style)': { m: '0 !important' } }}>
                            {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                                <Button
                                    color="error"
                                    variant="soft"
                                    fullWidth
                                    onClick={() => setConfirm({ open: true, type: 'cancel', id: selectedBooking.id })}
                                    sx={{ height: 56, fontWeight: 900, borderRadius: 2 }}
                                >
                                    CANCEL BOOKING
                                </Button>
                            )}
                            {selectedBooking.status === 'pending' && (
                                <Button
                                    variant="contained" color="secondary" fullWidth
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                                    sx={{ height: 56, fontWeight: 900, borderRadius: 2, boxShadow: theme.customShadows.z20 }}
                                >
                                    CONFIRM BOOKING
                                </Button>
                            )}
                            {selectedBooking.status === 'confirmed' && (
                                <Button
                                    variant="contained" color="success" fullWidth
                                    onClick={() => setConfirm({ open: true, type: 'convert', id: selectedBooking.id })}
                                    disabled={isConverting}
                                    sx={{ height: 56, fontWeight: 900, borderRadius: 2, boxShadow: theme.customShadows.z20 }}
                                    startIcon={isConverting ? <Iconify icon="solar:refresh-bold" className="animate-spin" /> : <Iconify icon="solar:check-read-bold" />}
                                >
                                    {isConverting ? 'PROCESSING...' : 'CHECK IN NOW'}
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <ConfirmDialog
                open={confirm.open}
                title={confirm.type === 'cancel' ? "Cancel Booking?" : "Check In Customer?"}
                content={confirm.type === 'cancel'
                    ? "Are you sure you want to cancel this booking?"
                    : "This will start an active session for the customer in the salon."
                }
                confirmLabel={confirm.type === 'cancel' ? "Yes, Cancel" : "Check In Now"}
                color={confirm.type === 'cancel' ? "error" : "success"}
                onConfirm={() => {
                    if (confirm.type === 'cancel') handleUpdateStatus(confirm.id, 'cancelled');
                    else handleConvertToSession(confirm.id);
                }}
                onClose={() => setConfirm({ open: false, type: '', id: null })}
            />

            {/* CREATE BOOKING DIALOG */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DialogTitle sx={{ fontWeight: 900, p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        New Manual Reservation
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Customer Name" value={newBooking.customerName} onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Phone Number" value={newBooking.phone} onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Branch</InputLabel>
                                    <Select value={newBooking.branchId} label="Branch" onChange={(e) => setNewBooking({ ...newBooking, branchId: e.target.value })}>
                                        {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Initial Status</InputLabel>
                                    <Select value={newBooking.status} label="Initial Status" onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })}>
                                        <MenuItem value="pending">PENDING</MenuItem>
                                        <MenuItem value="confirmed">CONFIRMED (FAST TRACK)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Preferred Date" sx={{ width: '100%' }}
                                    value={dayjs(newBooking.preferredDate)}
                                    onChange={(v) => setNewBooking({ ...newBooking, preferredDate: v.format('YYYY-MM-DD') })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TimePicker
                                    label="Preferred Time" sx={{ width: '100%' }}
                                    value={dayjs(`2000-01-01T${newBooking.preferredTime}`)}
                                    onChange={(v) => setNewBooking({ ...newBooking, preferredTime: v.format('HH:mm') })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Assign Specialist</InputLabel>
                                    <Select value={newBooking.employeeId} label="Assign Specialist" onChange={(e) => setNewBooking({ ...newBooking, employeeId: e.target.value })}>
                                        <MenuItem value="">NOT ASSIGNED</MenuItem>
                                        {bookingEligibleEmployees.map(e => (
                                            <MenuItem key={e.id} value={e.id}>
                                                {e.name} ({e.role})
                                                {e.Specialties?.length ? ` — ${e.Specialties.map(c => c.name).join(', ')}` : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={services}
                                    getOptionLabel={(o) => `${o.code ? '['+o.code+'] ' : ''}${o.name.toUpperCase()}`}
                                    onChange={(e, v) => setNewBooking({ ...newBooking, serviceIds: v.map(sid => sid.id) })}
                                    renderInput={(params) => <TextField {...params} variant="outlined" label="Select Services" />}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={3} label="Staff Notes" value={newBooking.notes} onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 2.5, sm: 4 }, gap: 2, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                        <Button variant="soft" color="inherit" fullWidth onClick={() => setOpenCreate(false)} sx={{ m: '0 !important', height: 48 }}>CANCEL</Button>
                        <Button variant="contained" color="secondary" fullWidth onClick={handleCreateBooking} sx={{ m: '0 !important', height: 48 }}>SAVE RESERVATION</Button>
                    </DialogActions>
                </LocalizationProvider>
            </Dialog>
        </Box>
    );
}
