import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  alpha,
  Tooltip,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import { useResponsive } from 'src/hooks/use-responsive';

export default function Invoices() {
  const theme = useTheme();
  const isMobile = useResponsive('down', 'md');
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.BASE_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-bill');
    const originalContents = document.body.innerHTML;

    // We can use a simpler approach: window.print() and CSS media queries
    window.print();
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        mb={{ xs: 4, md: 6 }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box sx={{
            p: 1.5, bgcolor: '#0D0E1C', borderRadius: 2, color: '#C8972A',
            display: 'flex', boxShadow: theme.customShadows.z12,
            border: '1px solid', borderColor: alpha('#C8972A', 0.2)
          }}>
            <Iconify icon="solar:bill-list-bold-duotone" width={32} />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>Invoices</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={800}>Manage your salon bills and revenue.</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            onClick={fetchInvoices}
            startIcon={<Iconify icon="solar:restart-bold" />}
            fullWidth={isMobile}
            sx={{ fontWeight: 900, height: 48, px: 3, bgcolor: '#C8972A', '&:hover': { bgcolor: '#b08425' } }}
          >
            REFRESH DATA
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} mb={6}>
        {[
          { label: 'Total Invoiced', value: `${invoices.reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0).toLocaleString()} Br`, icon: 'solar:graph-up-bold-duotone', color: '#C8972A' },
          { label: 'Paid Revenue', value: `${invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(i.totalAmount || 0), 0).toLocaleString()} Br`, icon: 'solar:wad-of-money-bold-duotone', color: '#4caf50' },
          { label: 'Pending Bills', value: invoices.filter(i => i.status !== 'paid').length, icon: 'solar:clock-circle-bold-duotone', color: '#ff9800' },
          { label: 'Client Count', value: new Set(invoices.map(i => i.CustomerId)).size, icon: 'solar:users-group-rounded-bold-duotone', color: '#2196f3' },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: alpha(stat.color, 0.2), bgcolor: alpha(stat.color, 0.02), display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ p: 2, bgcolor: alpha(stat.color, 0.1), color: stat.color, borderRadius: 2, display: 'flex' }}>
                <Iconify icon={stat.icon} width={28} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, letterSpacing: 1 }}>{stat.label.toUpperCase()}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{stat.value}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MOBILE: stacked invoice cards (xs–sm) */}
      <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {invoices.map((inv) => (
          <Card
            key={inv.id}
            sx={{
              p: 2.5, borderRadius: 3, border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.12),
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)', bgcolor: 'background.paper'
            }}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={900} noWrap>
                  {inv.Customer?.name?.toUpperCase() || 'WALK-IN GUEST'}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: 'monospace' }}>
                  MIL-{inv.id.toString().padStart(5, '0')}
                </Typography>
              </Box>
              <Chip
                label={inv.status.toUpperCase()}
                color={inv.status === 'paid' ? 'success' : 'warning'}
                variant="soft"
                size="small"
                sx={{ fontWeight: 900, borderRadius: 1, height: 26, px: 1, flexShrink: 0 }}
              />
            </Stack>

            <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1.5} sx={{ mt: 2 }}>
              <Typography variant="h4" fontWeight={900} color="#0D0E1C">
                {inv.totalAmount}{' '}
                <Typography component="span" variant="caption" fontWeight={900} color="text.disabled">Br</Typography>
              </Typography>
              <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textAlign: 'right' }}>
                {new Date(inv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                {' • '}
                {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Stack>

            <Button
              variant="soft"
              color="inherit"
              fullWidth
              onClick={() => setSelectedInvoice(inv)}
              startIcon={<Iconify icon="solar:eye-bold" />}
              sx={{ mt: 2, fontWeight: 800, borderRadius: 1.5 }}
            >
              REVIEW &amp; PRINT
            </Button>
          </Card>
        ))}
        {invoices.length === 0 && (
          <Card sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.12) }}>
            <Typography color="text.disabled" variant="h6" fontWeight={900}>No Invoices Found</Typography>
          </Card>
        )}
      </Stack>

      {/* DESKTOP: table (md and up) */}
      <Card sx={{
        display: { xs: 'none', md: 'block' },
        borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
        boxShadow: '0 20px 60px rgba(0,0,0,0.05)', bgcolor: 'background.paper'
      }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha('#1B1F3A', 0.02) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, py: 3, letterSpacing: 0.5, color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900, letterSpacing: 0.5, color: 'text.secondary' }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 900, letterSpacing: 0.5, color: 'text.secondary' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 900, letterSpacing: 0.5, color: 'text.secondary' }}>AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 900, letterSpacing: 0.5, color: 'text.secondary' }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, letterSpacing: 0.5, color: 'text.secondary' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} hover sx={{ transition: '0.2s' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: inv.status === 'paid' ? '#4caf50' : '#ff9800' }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                        MIL-{inv.id.toString().padStart(5, '0')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={900}>{inv.Customer?.name?.toUpperCase() || 'WALK-IN GUEST'}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{inv.Customer?.phone || '+251 000 000'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>
                      {new Date(inv.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" fontWeight={700}>
                      {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h5" fontWeight={900} color="#0D0E1C">
                      {inv.totalAmount} <Typography variant="caption" fontWeight={900} color="text.disabled">ETB</Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status.toUpperCase()}
                      color={inv.status === 'paid' ? 'success' : 'warning'}
                      variant="soft"
                      size="small"
                      sx={{ fontWeight: 900, borderRadius: 1, height: 28, px: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="soft"
                      color="inherit"
                      onClick={() => setSelectedInvoice(inv)}
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      sx={{ fontWeight: 800, borderRadius: 1.5 }}
                    >
                      REVIEW
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 15 }}><Typography color="text.disabled" variant="h5" fontWeight={900}>No Invoices Found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* BILL DETAILS MODAL */}
      <Dialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: theme.customShadows.z24,
            border: '1px solid black',
            m: { xs: 1.5, sm: 4 },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
            maxWidth: { sm: 480 }
          }
        }}
      >
        <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
          {selectedInvoice && (
            <Box id="printable-bill" sx={{ p: { xs: 3, sm: 5 }, color: 'black', fontFamily: '"Outfit", sans-serif', fontVariantNumeric: 'tabular-nums' }}>
              <Box sx={{ pb: 3, mb: 4, textAlign: 'center' }}>
                <Typography variant="h2" fontWeight={900} letterSpacing={-2} sx={{ color: 'black', fontSize: { xs: '2.25rem', sm: '3.75rem' } }}>
                  MILANA<Box component="span" sx={{ color: '#C8972A' }}>.</Box>
                </Typography>
                <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: 5, display: 'block', mt: -1 }}>BOUTIQUE SALON</Typography>
                <Typography variant="caption" sx={{ color: 'grey.600', display: 'block', mt: 1 }}>OFFICIAL RECEIPT</Typography>
                <Box sx={{ height: 3, borderRadius: 3, bgcolor: '#C8972A', mt: 2.5 }} />
              </Box>

              <Stack spacing={4}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={900} color="grey.500">BILLED TO</Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ wordBreak: 'break-word' }}>{(selectedInvoice.Customer?.name || 'Valued Guest').toUpperCase()}</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedInvoice.Customer?.phone}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={900} color="grey.500">TRANSACTION</Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ wordBreak: 'break-word' }}>#MIL-{selectedInvoice.id}</Typography>
                    <Typography variant="body2" fontWeight={700}>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>

                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid black', pb: 1, mb: 1 }}>
                    <Typography variant="caption" fontWeight={900}>DESCRIPTION</Typography>
                    <Typography variant="caption" fontWeight={900}>AMOUNT (BR)</Typography>
                  </Box>
                  {selectedInvoice.InvoiceItems?.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ wordBreak: 'break-word' }}>{(item.Service?.name || item.serviceName || 'Treatment').toUpperCase()}</Typography>
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>Master Stylist Session</Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={900} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{Number(item.price).toLocaleString()}.00</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ pt: 3, borderTop: '2px solid black' }}>
                  <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>TOTAL DUE</Typography>
                    <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: '1.75rem', sm: '3rem' }, whiteSpace: 'nowrap' }}>
                      {Number(selectedInvoice.totalAmount).toLocaleString()}<Typography component="span" variant="caption" sx={{ fontWeight: 900, ml: 1 }}>ETB</Typography>
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{
                  p: 2, bgcolor: 'black', color: 'white',
                  textAlign: 'center', mt: 2
                }}>
                  <Typography variant="caption" fontWeight={900} sx={{ letterSpacing: 3 }}>
                    {selectedInvoice.status === 'paid' ? 'PAYMENT STATUS: SETTLED' : 'PAYMENT STATUS: PENDING'}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontStyle: 'italic', display: 'block' }}>
                    Luxury is attention to detail.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'grey.500', fontWeight: 600 }}>
                    Addis Ababa • Bole Road • 2026
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 4 }, gap: 1, bgcolor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
          <Button variant="outlined" color="inherit" fullWidth onClick={() => setSelectedInvoice(null)} sx={{ height: 56, fontWeight: 900 }}>CLOSE</Button>
          <Button variant="contained" color="primary" fullWidth onClick={handlePrint} startIcon={<Iconify icon="solar:printer-bold" />} sx={{ height: 56, fontWeight: 900, bgcolor: 'black', '&:hover': { bgcolor: '#222' } }}>PRINT BILL</Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-bill, #printable-bill * { visibility: visible; }
            #printable-bill {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
            }
            .MuiDialog-root { position: static !important; }
            .MuiBackdrop-root { display: none !important; }
            .MuiPaper-root { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
          }
        `}
      </style>
    </Box>
  );
}
