import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  Box,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import config from 'src/config';

export default function CustomersManagePage() {
  const [customers, setCustomers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('authToken');

  const fetchCustomers = async () => {
    const res = await fetch(`${config.BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCustomers(data);
  };

  const fetchSessions = async (customerId) => {
    setSelectedCustomer(customerId);
    setAssignments([]);
    setInvoices([]);
    const res = await fetch(`${config.BASE_URL}/customers/sessions/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSessions(data);
  };

  const fetchAssignments = async (sessionId) => {
    setSelectedSession(sessionId);
    setInvoices([]);
    const res = await fetch(`${config.BASE_URL}/assignments/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAssignments(data);
  };

  const fetchInvoices = async (customerId) => {
    const res = await fetch(`${config.BASE_URL}/invoices/get/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setInvoices(data);
  };

  const resetView = () => {
    setSelectedCustomer(null);
    setSelectedSession(null);
    setSessions([]);
    setAssignments([]);
    setInvoices([]);
  };


  const redirectToOrder = async () => {
    // redirect user to the /
    window.location.href = '/customers';
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // filter customers based on search term
  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Customers</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={700}>Manage your customer list and history.</Typography>
        </Box>
        <Button
          variant="contained"
          onClick={redirectToOrder}
          startIcon={<Iconify icon="solar:user-plus-bold" />}
          sx={{ bgcolor: '#141312', color: 'white', fontWeight: 900, px: 3, height: 48, borderRadius: 1.5 }}
        >
          ADD NEW CUSTOMER
        </Button>
      </Stack>

      {!selectedCustomer && (
        <Card sx={{
          borderRadius: 3, border: '1px solid', borderColor: alpha('#141312', 0.05),
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
        }}>
          <Box sx={{ p: 3, bgcolor: alpha('#141312', 0.01), borderBottom: '1px solid', borderColor: alpha('#141312', 0.05) }}>
            <TextField
              fullWidth
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" sx={{ mr: 1.5, color: '#9A7B4F' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, bgcolor: 'white',
                  '& fieldset': { borderColor: alpha('#141312', 0.1) },
                  '&:hover fieldset': { borderColor: '#9A7B4F' },
                }
              }}
            />
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              {filteredCustomers.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: alpha('#141312', 0.05),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: '0.2s',
                    '&:hover': { bgcolor: alpha('#9A7B4F', 0.02), borderColor: '#9A7B4F' }
                  }}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar sx={{ width: 56, height: 56, bgcolor: '#141312', fontWeight: 900, color: 'white' }}>
                      {c.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>{c.name.toUpperCase()}</Typography>
                      <Stack direction="row" spacing={2} mt={0.5}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="solar:phone-bold" width={14} /> {c.phone}
                        </Typography>
                        <Chip
                          label={c.Branch?.name || 'MAIN SALON'}
                          size="small"
                          variant="soft"
                          sx={{ fontWeight: 900, fontSize: '0.65rem', borderRadius: 0.5 }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                  <Button
                    variant="soft" color="secondary"
                    onClick={() => fetchSessions(c.id)}
                    sx={{ fontWeight: 900, borderRadius: 1 }}
                    endIcon={<Iconify icon="solar:arrow-right-bold" />}
                  >
                    VIEW HISTORY
                  </Button>
                </Box>
              ))}

              {filteredCustomers.length === 0 && (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Iconify icon="solar:user-block-linear" width={64} sx={{ color: alpha('#141312', 0.1), mb: 2 }} />
                  <Typography variant="h6" color="text.disabled" fontWeight={800}>No customers found.</Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {selectedCustomer && (
        <Box>
          <Button
            onClick={resetView}
            startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
            sx={{ mb: 4, fontWeight: 900, color: '#9A7B4F' }}
          >
            BACK TO LIST
          </Button>

          <Card sx={{ mb: 5, borderRadius: 4, border: '1px solid', borderColor: alpha('#141312', 0.1) }}>
            <Box sx={{ p: 4, bgcolor: '#141312', color: 'white' }}>
              <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.7 }}>HISTORY</Typography>
              <Typography variant="h3" fontWeight={900}>Visit History</Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {sessions.map((s) => (
                  <Grid item xs={12} key={s.id}>
                    <Box sx={{
                      p: 3, borderRadius: 2.5, bgcolor: alpha('#9A7B4F', 0.03),
                      border: '1px solid', borderColor: alpha('#9A7B4F', 0.1)
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" fontWeight={900} mb={1}>Session #{s.id}</Typography>
                          <Stack direction="row" spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Iconify icon="solar:calendar-bold" width={18} color="#9A7B4F" />
                              <Typography variant="body2" fontWeight={800}>{new Date(s.checkInTime).toLocaleDateString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Iconify icon="solar:clock-circle-bold" width={18} color="#9A7B4F" />
                              <Typography variant="body2" fontWeight={800}>
                                {new Date(s.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={1.5}>
                          <Button
                            variant="contained"
                            onClick={() => fetchAssignments(s.id)}
                            sx={{ bgcolor: '#141312', fontWeight: 900, borderRadius: 1 }}
                          >
                            SERVICES
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => fetchInvoices(s.CustomerId)}
                            sx={{ borderColor: '#9A7B4F', color: '#9A7B4F', fontWeight: 900, borderRadius: 1 }}
                          >
                            INVOICE
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Assignments Modal/Section */}
          {assignments.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" fontWeight={900} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:clipboard-list-linear" sx={{ color: '#9A7B4F' }} />
                Services Done
              </Typography>
              <Grid container spacing={3}>
                {assignments.map((a) => (
                  <Grid item xs={12} md={6} key={a.id}>
                    <Card sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                      <Stack direction="row" justifyContent="space-between" mb={3}>
                        <Typography variant="overline" color="#9A7B4F" fontWeight={900} letterSpacing={2}>STATUS: {a.status.toUpperCase()}</Typography>
                        <Iconify icon="solar:check-circle-bold" color={a.status === 'completed' ? '#4caf50' : '#ff9800'} />
                      </Stack>
                      <Stack spacing={2}>
                        {a.Services?.map((srv) => (
                          <Box key={srv.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={800}>{srv.name.toUpperCase()}</Typography>
                            <Typography variant="subtitle1" fontWeight={900}>{srv.price} Br</Typography>
                          </Box>
                        ))}
                      </Stack>
                      {a.notes && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.divider, 0.3), borderRadius: 1.5 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.6 }}>NOTES</Typography>
                          <Typography variant="body2" fontWeight={700}>{a.notes}</Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Invoices Section */}
          {invoices.length > 0 && (
            <Box>
              <Typography variant="h5" fontWeight={900} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:wad-of-money-linear" sx={{ color: '#9A7B4F' }} />
                Payment Record
              </Typography>
              {invoices.map((inv) => (
                <Card key={inv.id} sx={{ p: 4, borderRadius: 4, mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                      <Typography variant="h4" fontWeight={900}>Invoice #{inv.id}</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={800}>PAYMENT RECEIPT</Typography>
                    </Box>
                    <Chip label={inv.status.toUpperCase()} color={inv.status === 'paid' ? 'success' : 'warning'} sx={{ fontWeight: 900, borderRadius: 1 }} />
                  </Stack>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2.5}>
                    {inv.InvoiceItems?.map((item) => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight={700}>{item.Service?.name.toUpperCase()}</Typography>
                        <Typography variant="h6" fontWeight={900}>{item.price} Br</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Box sx={{ mt: 4, p: 3, bgcolor: '#141312', color: 'white', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight={900}>GRAND TOTAL</Typography>
                    <Typography variant="h3" fontWeight={900}>{inv.totalAmount} Br</Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
