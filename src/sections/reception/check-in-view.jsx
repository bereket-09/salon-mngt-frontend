import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Grid,
    Card,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Autocomplete,
    Avatar,
    Divider,
    CircularProgress,
    Paper,
    Switch,
    FormControlLabel,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import config from 'src/config';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

export default function CheckInView() {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [showAllStaff, setShowAllStaff] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        serviceIds: [],
        employeeId: '',
        notes: '',
    });

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const currentBranchId = localStorage.getItem('selectedBranchId');
            const branchQuery = (currentBranchId && currentBranchId !== 'all') ? `&branchId=${currentBranchId}` : '';
            const auth = { headers: { Authorization: `Bearer ${token}` } };
            const [custRes, svcRes, empRes] = await Promise.all([
                fetch(`${config.BASE_URL}/customers?status=active`, auth),
                fetch(`${config.BASE_URL}/services?status=active${branchQuery}`, auth),
                fetch(`${config.BASE_URL}/users?role=employee&status=active${branchQuery}`, auth),
            ]);
            setCustomers(await custRes.json() || []);
            setServices(await svcRes.json() || []);
            setEmployees(await empRes.json() || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleConfirmCheckIn = () => {
        if (!form.phone || !form.firstName) return;
        setConfirmOpen(true);
    };

    const executeCheckIn = async () => {
        setConfirmOpen(false);
        setLoading(true);
        try {
            const currentBranchId = localStorage.getItem('selectedBranchId');
            let session;
            if (selectedCustomer) {
                const sRes = await fetch(`${config.BASE_URL}/customers/${selectedCustomer.id}/check-in`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ branchId: currentBranchId }),
                });
                session = await sRes.json();
            } else {
                const cRes = await fetch(`${config.BASE_URL}/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        name: `${form.firstName} ${form.lastName}`,
                        phone: form.phone,
                        branchId: currentBranchId,
                        checkIn: true,
                    }),
                });
                const newCust = await cRes.json();
                const sListRes = await fetch(`${config.BASE_URL}/customers/${newCust.id}/sessions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const sessions = await sListRes.json();
                session = sessions[0];
            }

            if (form.serviceIds.length > 0 && form.employeeId) {
                const aRes = await fetch(`${config.BASE_URL}/assignments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        sessionId: session.id,
                        employeeId: form.employeeId,
                        notes: form.notes,
                    }),
                });
                const assignment = await aRes.json();
                await fetch(`${config.BASE_URL}/assignments/${assignment.id}/services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ serviceIds: form.serviceIds }),
                });
            }

            setForm({ firstName: '', lastName: '', phone: '', serviceIds: [], employeeId: '', notes: '' });
            setSelectedCustomer(null);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalEstimated = form.serviceIds.reduce((acc, id) => {
        const s = services.find(x => x.id === id);
        return acc + (Number(s?.price) || 0);
    }, 0);

    const totalDuration = form.serviceIds.reduce((acc, id) => {
        const s = services.find(x => x.id === id);
        return acc + (Number(s?.estimatedDuration) || 30);
    }, 0);

    // ── Specialist matching ──────────────────────────────────────────────
    // A service is covered by an employee whose specialties include the
    // service's category OR its parent super-category.
    const serviceMatchIds = (svc) => {
        const ids = [];
        if (svc?.categoryId) ids.push(svc.categoryId);
        if (svc?.Category?.parentId) ids.push(svc.Category.parentId);
        return ids;
    };
    const selectedServices = services.filter((s) => form.serviceIds.includes(s.id));
    const employeeQualifies = (emp) => {
        if (!selectedServices.length) return true;
        const specs = (emp.Specialties || []).map((c) => c.id);
        if (!specs.length) return true; // no specialties set => generalist
        return selectedServices.every((svc) => {
            const match = serviceMatchIds(svc);
            if (!match.length) return true; // uncategorized service
            return match.some((id) => specs.includes(id));
        });
    };
    const qualified = employees.filter(employeeQualifies);
    const noQualified = selectedServices.length > 0 && qualified.length === 0;
    const displayedEmployees = (showAllStaff || noQualified) ? employees : qualified;

    return (
        <Box>
            {/* HEADER */}
            <Paper sx={{
                p: 4, mb: 6, borderRadius: 2.5, bgcolor: '#1B1F3A', color: 'white',
                boxShadow: theme.customShadows.z24, position: 'relative', overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.1 }}>
                    <Iconify icon="solar:ticket-bold-duotone" width={200} />
                </Box>
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Box sx={{ p: 2, bgcolor: alpha('#C8972A', 0.2), borderRadius: 2, color: '#C8972A' }}>
                        <Iconify icon="solar:user-plus-bold-duotone" width={40} />
                    </Box>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Customer Check-In</Typography>
                        <Typography variant="body1" sx={{ color: 'grey.400', fontWeight: 600 }}>Register new and existing customers.</Typography>
                    </Box>
                </Stack>
            </Paper>

            <Grid container spacing={4}>
                {/* LEFT: CUSTOMER INFO */}
                <Grid item xs={12} lg={7}>
                    <Card sx={{ p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                            <Iconify icon="solar:shield-user-bold-duotone" sx={{ color: 'secondary.main' }} width={28} />
                            <Typography variant="h5" fontWeight={800}>Find Customer</Typography>
                        </Stack>

                        <Autocomplete
                            fullWidth
                            options={customers}
                            getOptionLabel={(option) => `${option.name} (${option.phone})`}
                            onChange={(e, val) => {
                                setSelectedCustomer(val);
                                if (val) setForm({
                                    ...form,
                                    firstName: val.name.split(' ')[0],
                                    lastName: val.name.split(' ').slice(1).join(' ') || '',
                                    phone: val.phone
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search by name or phone..."
                                    variant="outlined"
                                    sx={{
                                        mb: 4,
                                        '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700, bgcolor: alpha(theme.palette.background.neutral, 0.4) }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: <Iconify icon="solar:magnifier-bold-duotone" sx={{ mr: 1, color: 'secondary.main' }} />,
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ py: 1.5, px: 2, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.05) }}>
                                    <Avatar sx={{ mr: 2, bgcolor: '#1B1F3A', color: '#C8972A', fontWeight: 800, width: 36, height: 36 }}>{option.name[0]}</Avatar>
                                    <Box flexGrow={1}>
                                        <Typography fontWeight={800} variant="body2">{option.name.toUpperCase()}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Phone: {option.phone}</Typography>
                                    </Box>
                                    <Stack alignItems="flex-end">
                                        <Chip label="Member" size="small" variant="soft" color="info" sx={{ fontWeight: 800, height: 20, mb: 0.5 }} />
                                        {option.Branch && (
                                            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 900, fontSize: '0.6rem' }}>
                                                LAST: {option.Branch.name.toUpperCase()}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            )}
                        />

                        <Divider sx={{ my: 4, borderStyle: 'dashed' }}>
                            <Typography variant="overline" color="text.disabled" fontWeight={800} sx={{ letterSpacing: 1 }}>OR ADD NEW CUSTOMER</Typography>
                        </Divider>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="First Name"
                                    placeholder="Enter first name"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.2, fontWeight: 700 } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Last Name"
                                    placeholder="Enter last name"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.2, fontWeight: 700 } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Phone Number"
                                    placeholder="+251..."
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.2, fontWeight: 700 } }}
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* RIGHT: SERVICE & STAFF */}
                <Grid item xs={12} lg={5}>
                    <Card sx={{
                        p: 4, borderRadius: 2.5, height: '100%',
                        bgcolor: alpha(theme.palette.background.neutral, 0.3),
                        border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                            <Iconify icon="solar:clipboard-check-bold-duotone" sx={{ color: 'secondary.main' }} width={28} />
                            <Typography variant="h5" fontWeight={800}>Service Details</Typography>
                        </Stack>

                        <Stack spacing={3}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontWeight: 800 }}>Select Services</InputLabel>
                                <Select
                                    multiple
                                    value={form.serviceIds}
                                    label="Select Services"
                                    onChange={(e) => setForm({ ...form, serviceIds: e.target.value })}
                                    sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((val) => (
                                                <Chip key={val} label={services.find(s => s.id === val)?.name} size="small" variant="soft" color="secondary" sx={{ fontWeight: 800 }} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {services.map((s) => (
                                        <MenuItem key={s.id} value={s.id}>
                                            <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center">
                                                <Typography variant="body2" fontWeight={800}>{s.name}</Typography>
                                                <Typography variant="caption" fontWeight={800} sx={{ p: 0.5, px: 1, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 0.5 }}>{s.price} Br</Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ fontWeight: 800 }}>Select Staff</InputLabel>
                                    <Select
                                        value={form.employeeId}
                                        label="Select Staff"
                                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                                        sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                                    >
                                        <MenuItem value="" sx={{ fontWeight: 700 }}>Auto-assign</MenuItem>
                                        {displayedEmployees.map((e) => (
                                            <MenuItem key={e.id} value={e.id}>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#1B1F3A', color: 'white', fontWeight: 800 }}>{e.name[0]}</Avatar>
                                                    <Typography variant="body2" fontWeight={700} sx={{ flexGrow: 1 }}>{e.name}</Typography>
                                                    {(e.Specialties || []).slice(0, 2).map((c) => (
                                                        <Chip key={c.id} label={c.name} size="small" variant="soft" color="warning" sx={{ fontWeight: 800, height: 20, fontSize: '0.6rem' }} />
                                                    ))}
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {selectedServices.length > 0 && (
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, px: 0.5 }}>
                                        <Typography variant="caption" fontWeight={700} color={noQualified ? 'error.main' : 'text.secondary'}>
                                            {noQualified
                                                ? 'No specialist matches all selected services — showing everyone.'
                                                : `Showing ${qualified.length} specialist(s) for the selected service(s).`}
                                        </Typography>
                                        {!noQualified && (
                                            <FormControlLabel
                                                sx={{ m: 0 }}
                                                control={<Switch size="small" color="secondary" checked={showAllStaff} onChange={(e) => setShowAllStaff(e.target.checked)} />}
                                                label={<Typography variant="caption" fontWeight={800}>All staff</Typography>}
                                            />
                                        )}
                                    </Stack>
                                )}
                            </Box>

                            <TextField
                                fullWidth multiline rows={2}
                                label="Notes"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Any special requests or details..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' } }}
                            />

                            <Box sx={{ p: 2.5, bgcolor: '#1B1F3A', borderRadius: 2, border: '1px solid', borderColor: alpha('#C8972A', 0.1) }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="secondary.main" fontWeight={800}>TOTAL PRICE</Typography>
                                        <Typography variant="h4" fontWeight={900} color="white">{totalEstimated} <Typography variant="caption" sx={{ opacity: 0.5 }}>Br</Typography></Typography>
                                    </Grid>
                                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="grey.500" fontWeight={800}>TIME</Typography>
                                        <Typography variant="h4" fontWeight={900} color="white">{totalDuration} <Typography variant="caption" sx={{ opacity: 0.5 }}>MIN</Typography></Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={handleConfirmCheckIn}
                                disabled={loading || !form.phone || !form.firstName}
                                sx={{ height: 64, fontWeight: 900, fontSize: '1.1rem', borderRadius: 1.5 }}
                            >
                                {loading ? <CircularProgress size={28} color="inherit" /> : 'Check In Now'}
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            {/* CONFIRMATION */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirm Check-In"
                content={`Register ${form.firstName} ${form.lastName} for the selected services?`}
                confirmLabel="Yes, Check In"
                onConfirm={executeCheckIn}
                onClose={() => setConfirmOpen(false)}
            />
        </Box>
    );
}
