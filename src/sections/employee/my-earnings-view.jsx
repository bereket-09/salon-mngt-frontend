import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Box,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Grid,
    Stack,
    Avatar,
    TableContainer,
    Paper,
    Divider,
    LinearProgress,
    Chip,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import config from 'src/config';
import { useResponsive } from 'src/hooks/use-responsive';

export default function MyEarningsView() {
    const theme = useTheme();
    const isMobile = useResponsive('down', 'md');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const userStr = localStorage.getItem('userData');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        if (user) fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            // Updated to fallback to commission-report if needed, or the newly added alias
            const res = await fetch(`${config.BASE_URL}/users/commissions/${user.id}?from=${dayjs().startOf('month').format('YYYY-MM-DD')}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            // Map backend report to the view's expected format
            if (data && !data.error) {
                const history = [];
                if (data.sessions) {
                    data.sessions.forEach(session => {
                        session.assignments.forEach(assignment => {
                            const total = parseFloat(assignment.total || 0);
                            const commission = parseFloat(assignment.commission || 0);
                            const effectiveRate = total > 0 ? (commission / total) : 0;

                            history.push({
                                completedDate: assignment.completedAt,
                                serviceName: assignment.services.map(s => s.serviceName).join(' + '),
                                customerName: session.customer || 'Guest',
                                servicePrice: total.toFixed(2),
                                commissionAmount: commission.toFixed(2),
                                commissionRate: effectiveRate
                            });
                        });
                    });
                }

                setReport({
                    totalCommission: data.commissionAmount || 0,
                    totalRevenue: data.totalRevenue || 0,
                    history: history
                });
            }
        } catch (err) {
            console.error('MyEarnings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><LinearProgress color="secondary" sx={{ height: 4, borderRadius: 2, maxWidth: 300, mx: 'auto' }} /></Box>;

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: 4, md: 5 }} spacing={1.5}>
                <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{
                        p: 1.5, bgcolor: '#C8972A', borderRadius: 2, color: 'white', flexShrink: 0,
                        display: 'flex', border: '1px solid', borderColor: alpha('#C8972A', 0.2)
                    }}>
                        <Iconify icon="solar:safe-square-bold-duotone" width={32} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, fontSize: { xs: '1.5rem', md: '3rem' } }}>My Earnings</Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.8125rem', md: '1rem' } }}>Your performance results for this month.</Typography>
                    </Box>
                </Stack>
                <Chip
                    label={`${report?.history?.length || 0} Finished Jobs`}
                    color="secondary"
                    sx={{ fontWeight: 800, borderRadius: 1, px: { xs: 1, md: 2 }, height: 40, flexShrink: 0 }}
                />
            </Stack>

            <Grid container spacing={3} mb={5}>
                {[
                    { label: 'My Share', value: `${report?.totalCommission || 0} Br`, icon: 'solar:wad-of-money-bold-duotone', color: '#C8972A', desc: 'Money you earned' },
                    { label: 'Jobs Done', value: report?.history?.length || 0, icon: 'solar:verified-check-bold-duotone', color: '#2DD4BF', desc: 'Tasks completed' },
                    { label: 'Total Revenue', value: `${report?.totalRevenue || 0} Br`, icon: 'solar:chart-square-bold-duotone', color: '#3B82F6', desc: 'Generated for salon' },
                ].map((kpi, i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Card sx={{
                            p: 3.5, borderRadius: 2.5, border: '1px solid', borderColor: alpha(kpi.color, 0.1),
                            position: 'relative', overflow: 'hidden',
                            boxShadow: theme.customShadows.z12, bgcolor: alpha(kpi.color, 0.02),
                            transition: '0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.customShadows.z20, borderColor: kpi.color }
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                display: { xs: 'none', sm: 'flex' },
                                top: 0, right: 0,
                                p: 2.5, bgcolor: alpha(kpi.color, 0.1),
                                borderTopRightRadius: 0,
                                borderBottomLeftRadius: 24,
                                borderTopLeftRadius: 24,
                            }}>
                                <Iconify icon={kpi.icon} sx={{ width: 40, height: 40, color: kpi.color, opacity: 0.8 }} />
                            </Box>
                            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>{kpi.label}</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, color: kpi.color, fontSize: { xs: '1.75rem', md: '3rem' }, wordBreak: 'break-word' }}>{kpi.value}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mt: 0.5, display: 'block' }}>{kpi.desc}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card sx={{
                borderRadius: 2.5, boxShadow: theme.customShadows.z12,
                border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                overflow: 'hidden'
            }}>
                <Box sx={{
                    p: 3, bgcolor: '#1B1F3A', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Iconify icon="solar:history-bold-duotone" sx={{ color: '#C8972A' }} />
                        <Typography variant="h5" fontWeight={800} color="white">Recent Jobs</Typography>
                    </Stack>
                    <Chip label="Current Month" color="secondary" size="small" sx={{ fontWeight: 800, borderRadius: 0.5 }} />
                </Box>
                {/* MOBILE: stacked card list (xs–sm) */}
                {isMobile ? (
                    <Stack spacing={0} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                        {report?.history?.map((row, i) => (
                            <Box key={`${row.completedDate}-${i}`} sx={{ p: 2.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                                            {row.serviceName.toUpperCase()}
                                        </Typography>
                                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75, color: 'text.secondary', minWidth: 0 }}>
                                            <Iconify icon="solar:calendar-mark-bold-duotone" width={16} sx={{ color: 'secondary.main', flexShrink: 0 }} />
                                            <Typography variant="caption" fontWeight={800} noWrap sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, letterSpacing: 0 }}>
                                                {dayjs(row.completedDate).format('MMM DD').toUpperCase()} · {dayjs(row.completedDate).format('hh:mm A')}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                            <Iconify icon="solar:user-bold-duotone" width={16} />
                                            <Typography variant="caption" fontWeight={800} noWrap>
                                                {row.customerName.toUpperCase()}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Chip
                                        label="DONE" size="small" variant="soft" color="success"
                                        sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800, borderRadius: 0.5, flexShrink: 0 }}
                                    />
                                </Stack>

                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{
                                        mt: 2, pt: 1.5, borderTop: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.08),
                                    }}
                                >
                                    <Box>
                                        <Typography variant="caption" color="text.disabled" fontWeight={800} sx={{ display: 'block' }}>
                                            PRICE
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight={800}>{row.servicePrice} Br</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 900, lineHeight: 1.1 }}>
                                            + {row.commissionAmount} Br
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" fontWeight={800}>
                                            {(row.commissionRate * 100).toFixed(0)}% SHARE
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: alpha(theme.palette.background.neutral, 0.5) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800, py: 2.5 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Service</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Price</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }} align="right">My Earnings</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {report?.history?.map((row, i) => (
                                    <TableRow key={`${row.completedDate}-${i}`} hover>
                                        <TableCell sx={{ py: 2.5 }}>
                                            <Typography variant="subtitle2" fontWeight={800} color="secondary.main">
                                                {dayjs(row.completedDate).format('MMM DD').toUpperCase()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                                {dayjs(row.completedDate).format('hh:mm A')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={800}>{row.serviceName.toUpperCase()}</Typography>
                                            <Chip
                                                label="DONE" size="small" variant="soft" color="success"
                                                sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800, borderRadius: 0.5, mt: 0.5 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={800}>{row.customerName.toUpperCase()}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={800}>{row.servicePrice} Br</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 900 }}>
                                                + {row.commissionAmount} Br
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" fontWeight={800}>
                                                {(row.commissionRate * 100).toFixed(0)}% SHARE
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {!report?.history?.length && (
                    <Box sx={{ py: 15, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.01) }}>
                        <Iconify icon="solar:safe-bold-duotone" width={64} sx={{ color: 'text.disabled', opacity: 0.1, mb: 2 }} />
                        <Typography color="text.disabled" variant="h5" fontWeight={800}>No jobs found</Typography>
                        <Typography variant="body2" color="text.disabled" fontWeight={600}>Complete some services to see your earnings here.</Typography>
                    </Box>
                )}
            </Card>
        </Box>
    );
}

