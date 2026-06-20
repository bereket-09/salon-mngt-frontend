import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  MenuItem,
  ListSubheader,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  alpha,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';
import { withBranch, getSelectedBranchName } from 'src/utils/branch';

export default function ServicesPage() {
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]); // tree: supers with nested Children
  const [form, setForm] = useState({
    name: '',
    type: 'Styling',
    price: '',
    status: 'active',
    BranchId: '',
    categoryId: '',
    gender: 'both',
    estimatedDuration: 30,
    commissionEnabled: false,
    commissionRate: 10,
    code: '',
  });
  const [editService, setEditService] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'grid' | 'table' — Tree is the default
  const [collapsed, setCollapsed] = useState({}); // tree node key -> true when collapsed (default open)
  const [addOpen, setAddOpen] = useState(true); // "Add New Service" panel expanded?
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' };
      const [svcRes, brRes, catRes] = await Promise.all([
        // Scope to the selected branch: withBranch('?') appends "?branchId=<id>"
        // for a specific branch, or nothing when "All Branches" is selected.
        // The backend returns that branch's services + global (all-branch) ones,
        // hiding services that belong to OTHER branches.
        fetch(`${config.BASE_URL}/services${withBranch('?')}`, auth),
        fetch(`${config.BASE_URL}/branches`, auth),
        fetch(`${config.BASE_URL}/service-categories?tree=1`, auth),
      ]);
      const svcData = await svcRes.json();
      const brData = await brRes.json();
      const catData = await catRes.json();
      setServices(Array.isArray(svcData) ? svcData : []);
      setBranches(Array.isArray(brData) ? brData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.price) return;
    setCreating(true);
    try {
      const rate = Math.max(1, Math.min(99, Math.round(Number(form.commissionRate || 10))));
      const payload = {
        ...form,
        price: parseFloat(form.price),
        commissionRate: form.commissionEnabled ? rate : null,
        estimatedDuration: parseInt(form.estimatedDuration, 10),
      };
      await fetch(`${config.BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setForm({ name: '', type: 'Styling', price: '', status: 'active', BranchId: '', categoryId: '', gender: 'both', estimatedDuration: 30, commissionEnabled: false, commissionRate: 10, code: '' });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editService) return;
    setSaving(true);
    try {
      const rate = Math.max(1, Math.min(99, Math.round(Number(editService.commissionRate || 10))));
      const payload = {
        ...editService,
        price: parseFloat(editService.price),
        commissionRate: editService.commissionEnabled ? rate : null,
        estimatedDuration: parseInt(editService.estimatedDuration, 10),
        BranchId: editService.BranchId || null,
      };
      await fetch(`${config.BASE_URL}/services/${editService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setEditService(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  // Flatten the category tree into <ListSubheader> + indented <MenuItem> options.
  // Selectable values: each super-category and each of its sub-categories.
  const renderCategoryOptions = () => {
    const out = [<MenuItem key="none" value=""><em>Uncategorized</em></MenuItem>];
    categories.forEach((sup) => {
      out.push(<ListSubheader key={`h-${sup.id}`} sx={{ fontWeight: 900, color: 'secondary.main', lineHeight: '36px' }}>{sup.name}</ListSubheader>);
      out.push(<MenuItem key={`s-${sup.id}`} value={sup.id} sx={{ fontWeight: 800 }}>All {sup.name}</MenuItem>);
      (sup.Children || []).forEach((child) => {
        out.push(<MenuItem key={`c-${child.id}`} value={child.id} sx={{ pl: 4 }}>{child.name}</MenuItem>);
      });
    });
    return out;
  };

  // Human label for a service's category (sub with parent context, or super).
  const categoryLabel = (svc) => {
    if (!svc.Category) return null;
    return svc.Category.Parent ? `${svc.Category.Parent.name} › ${svc.Category.name}` : svc.Category.name;
  };

  const genderLabel = (g) => (g === 'male' ? 'Men' : g === 'female' ? 'Women' : 'Unisex');

  // Edit/delete buttons, reused by every view.
  const ServiceActions = ({ s }) => (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => setEditService(s)} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
          <Iconify icon="solar:pen-linear" width={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => confirmDelete(s.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-linear" width={18} />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  // Tree view data: super-category → (direct services + sub-categories with their services).
  // Only categories that actually contain services are kept, plus an "Uncategorized" bucket.
  const treeData = useMemo(() => {
    const groups = categories
      .map((sup) => {
        const direct = services.filter((s) => s.Category && s.Category.id === sup.id);
        const subs = (sup.Children || [])
          .map((child) => ({ sub: child, items: services.filter((s) => s.Category && s.Category.id === child.id) }))
          .filter((x) => x.items.length > 0);
        const count = direct.length + subs.reduce((n, x) => n + x.items.length, 0);
        return { sup, direct, subs, count };
      })
      .filter((g) => g.count > 0);
    const uncategorized = services.filter((s) => !s.Category);
    return { groups, uncategorized };
  }, [categories, services]);

  const isOpen = (key) => collapsed[key] !== true; // default expanded
  const toggleNode = (key) => setCollapsed((c) => ({ ...c, [key]: c[key] !== true }));

  // Compact leaf row used inside the tree view.
  const renderTreeRow = (s) => (
    <Stack
      key={s.id}
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ py: 1.25, px: 1.5, borderRadius: 1, '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.04) } }}
    >
      <Iconify icon="solar:tag-horizontal-linear" width={16} sx={{ color: 'text.disabled' }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={800} noWrap>{s.name}</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap sx={{ display: 'block' }}>
          {(s.code || 'NO CODE')} · {genderLabel(s.gender)} · {s.estimatedDuration || 30} min · {s.Branch?.name || 'All Branches'}
        </Typography>
      </Box>
      {s.commissionEnabled && (
        <Tooltip title="Commission">
          <Chip
            size="small" variant="soft" color="success"
            icon={<Iconify icon="solar:hand-money-linear" width={14} />}
            label={`${Number(s.commissionRate || 0).toFixed(0)}%`}
            sx={{ fontWeight: 800, height: 22 }}
          />
        </Tooltip>
      )}
      <Typography fontWeight={900} sx={{ whiteSpace: 'nowrap' }}>
        {s.price} <Typography component="span" variant="caption" color="text.secondary">ETB</Typography>
      </Typography>
      <ServiceActions s={s} />
    </Stack>
  );

  const executeDelete = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`${config.BASE_URL}/services/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Service List</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Managing{' '}
            <Box component="span" sx={{ color: 'secondary.main', fontWeight: 800 }}>
              {getSelectedBranchName() ? getSelectedBranchName().toUpperCase() : 'ALL BRANCHES'}
            </Box>
            {' '}— services and staff commissions.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            sx={{
              height: 44, bgcolor: 'background.paper', borderRadius: 1.5, p: 0.5,
              '& .MuiToggleButton-root': { border: 0, borderRadius: '8px !important', px: 1.5, fontWeight: 800 },
              '& .Mui-selected': { bgcolor: 'secondary.main !important', color: 'common.white !important' },
            }}
          >
            <ToggleButton value="grid"><Tooltip title="Grid view"><Iconify icon="solar:widget-4-linear" width={20} /></Tooltip></ToggleButton>
            <ToggleButton value="table"><Tooltip title="Table view"><Iconify icon="solar:list-linear" width={20} /></Tooltip></ToggleButton>
            <ToggleButton value="tree"><Tooltip title="Tree view (by category)"><Iconify icon="solar:siderbar-linear" width={20} /></Tooltip></ToggleButton>
          </ToggleButtonGroup>
          <Chip
            label={`${services.length} Active Services`}
            color="secondary"
            sx={{ fontWeight: 800, borderRadius: 1.5, px: 2, height: 44, display: { xs: 'none', sm: 'flex' } }}
          />
          <IconButton onClick={fetchData} disabled={loading} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 44, height: 44 }}>
            {loading
              ? <CircularProgress size={18} sx={{ color: 'secondary.main' }} />
              : <Iconify icon="solar:restart-linear" sx={{ color: 'secondary.main' }} />}
          </IconButton>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* ADD NEW SERVICE */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            position: 'sticky', top: 24, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
            bgcolor: alpha(theme.palette.background.neutral, 0.4)
          }}>
            <Stack
              direction="row" spacing={2} alignItems="center"
              onClick={() => setAddOpen((o) => !o)}
              sx={{ cursor: 'pointer', mb: addOpen ? 4 : 0 }}
            >
              <Box sx={{ p: 1, bgcolor: '#1A1A1A', borderRadius: 1.5, color: '#9A7B4F' }}>
                <Iconify icon="solar:box-minimalistic-linear" width={28} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, flexGrow: 1 }}>Add New Service</Typography>
              <Iconify icon={addOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width={22} sx={{ color: 'text.secondary' }} />
            </Stack>

            <Collapse in={addOpen}>
            <Stack spacing={3}>
              <TextField
                label="Service Name"
                fullWidth
                placeholder="e.g. Hair Cut"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                InputProps={{
                  sx: { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }
                }}
              />

              <TextField
                label="Service Code (Optional)"
                fullWidth
                placeholder="e.g. CUT-01"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                InputProps={{
                  sx: { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' },
                  startAdornment: <InputAdornment position="start"><Iconify icon="solar:hashtag-linear" sx={{ color: 'secondary.main', mr: 1 }} /></InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Service Category</InputLabel>
                <Select
                  value={form.categoryId} label="Service Category"
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                  startAdornment={<InputAdornment position="start"><Iconify icon="solar:widget-5-linear" sx={{ color: 'secondary.main', mr: 1 }} /></InputAdornment>}
                >
                  {renderCategoryOptions()}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 800 }}>Gender</InputLabel>
                    <Select
                      value={form.gender} label="Gender"
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="male">For Men</MenuItem>
                      <MenuItem value="female">For Women</MenuItem>
                      <MenuItem value="both">Unisex (Male &amp; Female)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={800}>Br</Typography></InputAdornment>,
                      sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: 'background.paper' }
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Duration (Minutes)"
                type="number"
                fullWidth
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Iconify icon="solar:clock-circle-linear" sx={{ color: 'secondary.main', mr: 1 }} /></InputAdornment>,
                  sx: { borderRadius: 1.5, fontWeight: 800, bgcolor: 'background.paper' }
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Select Branch</InputLabel>
                <Select
                  value={form.BranchId} label="Select Branch"
                  onChange={(e) => setForm({ ...form, BranchId: e.target.value })}
                  sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name.toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>

              <Box sx={{ p: 2, bgcolor: '#1A1A1A', borderRadius: 2, border: '1px solid', borderColor: alpha('#9A7B4F', 0.1) }}>
                <FormControlLabel
                  control={<Switch checked={form.commissionEnabled} color="secondary" onChange={(e) => setForm({ ...form, commissionEnabled: e.target.checked })} />}
                  label={<Typography variant="caption" fontWeight={800} color="#9A7B4F">ENABLE COMMISSION</Typography>}
                />
                {form.commissionEnabled && (
                  <TextField
                    label="Commission Percent"
                    type="number" fullWidth size="small"
                    sx={{ mt: 2, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 1, fontWeight: 800 } }}
                    placeholder="10"
                    helperText="Whole number between 1 and 99 (e.g. 10 means 10%)"
                    inputProps={{ min: 1, max: 99, step: 1 }}
                    value={form.commissionRate}
                    onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight={800}>%</Typography></InputAdornment> }}
                  />
                )}
              </Box>

              <Button
                variant="contained" color="secondary" fullWidth
                onClick={handleCreate}
                disabled={creating}
                startIcon={creating ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : null}
                sx={{ height: 64, fontWeight: 900, borderRadius: 1.5, fontSize: '1.1rem' }}
              >
                {creating ? 'Saving…' : 'Save Service'}
              </Button>
            </Stack>
            </Collapse>
          </Card>
        </Grid>

        {/* SERVICE VIEWS */}
        <Grid item xs={12} lg={8}>
          {services.length === 0 ? (
            <Card sx={{ p: 8, textAlign: 'center', borderRadius: 2.5, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.3) }}>
              <Iconify icon="solar:box-minimalistic-linear" width={56} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={800} color="text.secondary">No services in this view</Typography>
              <Typography variant="body2" color="text.disabled" fontWeight={600}>Add one using the form, or switch branch.</Typography>
            </Card>
          ) : viewMode === 'grid' ? (
            /* ── GRID VIEW ── */
            <Grid container spacing={3}>
              {services.map((s) => (
                <Grid item xs={12} sm={6} key={s.id}>
                  <Card sx={{
                    borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.customShadows.z12, borderColor: 'secondary.main' }
                  }}>
                    <Box sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                            {categoryLabel(s) && (
                              <Chip
                                label={categoryLabel(s)}
                                size="small" color="warning" variant="soft"
                                icon={<Iconify icon="solar:widget-5-linear" width={14} />}
                                sx={{ fontWeight: 800, borderRadius: 0.5 }}
                              />
                            )}
                            <Chip
                              label={genderLabel(s.gender)}
                              size="small" color={s.gender === 'male' ? 'info' : 'secondary'} variant="soft"
                              sx={{ fontWeight: 800, borderRadius: 0.5 }}
                            />
                            <Chip label={`${s.estimatedDuration || 30} min`} variant="soft" color="default" size="small" sx={{ fontWeight: 800, borderRadius: 0.5 }} />
                          </Stack>
                          <Typography variant="h6" fontWeight={800} noWrap>{s.name.toUpperCase()}</Typography>
                          <Typography variant="caption" color="secondary.main" fontWeight={900} sx={{ display: 'block', mt: -0.5, mb: 0.5 }}>{s.code || 'NO CODE'}</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block' }}>Branch: {s.Branch?.name?.toUpperCase() || 'All Branches'}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" fontWeight={900} color="#1A1A1A">{s.price}</Typography>
                          <Typography variant="caption" fontWeight={800} color="text.secondary">ETB</Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          {s.commissionEnabled ? (
                            <Typography variant="caption" fontWeight={800} color="success.main">Commission: {Number(s.commissionRate || 0).toFixed(0)}%</Typography>
                          ) : (
                            <Typography variant="caption" color="text.disabled" fontWeight={800}>No Commission</Typography>
                          )}
                        </Box>
                        <ServiceActions s={s} />
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : viewMode === 'table' ? (
            /* ── TABLE VIEW ── */
            <TableContainer component={Card} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 900, bgcolor: alpha(theme.palette.background.neutral, 0.6), whiteSpace: 'nowrap' } }}>
                    <TableCell>Service</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>For</TableCell>
                    <TableCell align="center">Duration</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Commission</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800}>{s.name}</Typography>
                        <Typography variant="caption" color="secondary.main" fontWeight={800}>{s.code || 'NO CODE'}</Typography>
                      </TableCell>
                      <TableCell>
                        {categoryLabel(s) || <Typography variant="caption" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="soft" color={s.gender === 'male' ? 'info' : 'secondary'} label={genderLabel(s.gender)} sx={{ fontWeight: 800, borderRadius: 0.5 }} />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{s.estimatedDuration || 30} min</TableCell>
                      <TableCell><Typography variant="caption" fontWeight={700}>{s.Branch?.name || 'All Branches'}</Typography></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography component="span" fontWeight={900}>{s.price}</Typography>{' '}
                        <Typography component="span" variant="caption" color="text.secondary">ETB</Typography>
                      </TableCell>
                      <TableCell>
                        {s.commissionEnabled
                          ? <Typography variant="caption" fontWeight={800} color="success.main">{Number(s.commissionRate || 0).toFixed(0)}%</Typography>
                          : <Typography variant="caption" color="text.disabled" fontWeight={700}>—</Typography>}
                      </TableCell>
                      <TableCell align="right"><ServiceActions s={s} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* ── TREE VIEW (super-category → sub-category → services) ── */
            <Stack spacing={2}>
              {treeData.groups.map(({ sup, direct, subs, count }) => {
                const supKey = `sup-${sup.id}`;
                return (
                  <Card key={sup.id} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), overflow: 'hidden' }}>
                    <Stack
                      direction="row" alignItems="center" spacing={1.5}
                      onClick={() => toggleNode(supKey)}
                      sx={{ p: 2.5, cursor: 'pointer', bgcolor: alpha(theme.palette.background.neutral, 0.5), '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.06) } }}
                    >
                      <Iconify icon={isOpen(supKey) ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} width={18} />
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: alpha(sup.color || theme.palette.secondary.main, 0.15), color: sup.color || theme.palette.secondary.main }}>
                        <Iconify icon={sup.icon || 'solar:widget-5-linear'} width={18} />
                      </Box>
                      <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>{sup.name}</Typography>
                      <Chip size="small" label={`${count}`} sx={{ fontWeight: 800 }} />
                    </Stack>
                    <Collapse in={isOpen(supKey)} unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        {direct.map((s) => renderTreeRow(s))}
                        {subs.map(({ sub, items }) => {
                          const subKey = `sub-${sub.id}`;
                          return (
                            <Box key={sub.id} sx={{ mb: 0.5 }}>
                              <Stack
                                direction="row" alignItems="center" spacing={1}
                                onClick={() => toggleNode(subKey)}
                                sx={{ py: 1, px: 1.5, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) } }}
                              >
                                <Iconify icon={isOpen(subKey) ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} width={16} sx={{ color: 'text.secondary' }} />
                                <Iconify icon="solar:folder-2-linear" width={16} sx={{ color: 'secondary.main' }} />
                                <Typography variant="subtitle2" fontWeight={800}>{sub.name}</Typography>
                                <Chip size="small" variant="soft" label={items.length} sx={{ fontWeight: 800, height: 18 }} />
                              </Stack>
                              <Collapse in={isOpen(subKey)} unmountOnExit>
                                <Box sx={{ pl: 3, borderLeft: '1px dashed', borderColor: alpha(theme.palette.divider, 0.4), ml: 1.5 }}>
                                  {items.map((s) => renderTreeRow(s))}
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        })}
                      </Box>
                    </Collapse>
                  </Card>
                );
              })}
              {treeData.uncategorized.length > 0 && (
                <Card sx={{ borderRadius: 2.5, border: '1px dashed', borderColor: alpha(theme.palette.divider, 0.3) }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1, px: 1.5, color: 'text.secondary' }}>Uncategorized</Typography>
                    {treeData.uncategorized.map((s) => renderTreeRow(s))}
                  </Box>
                </Card>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* EDIT MODAL */}
      <Dialog open={!!editService} onClose={() => setEditService(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: '#1A1A1A', color: 'white' }}>Edit Service</DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {editService && (
            <Stack spacing={3}>
              <TextField fullWidth label="Service Name" value={editService.name} onChange={(e) => setEditService({ ...editService, name: e.target.value })} />
              <TextField fullWidth label="Service Code" placeholder="Leave empty for auto-generation" value={editService.code || ''} onChange={(e) => setEditService({ ...editService, code: e.target.value })} />

              <FormControl fullWidth>
                <InputLabel>Service Category</InputLabel>
                <Select
                  value={editService.categoryId || ''} label="Service Category"
                  onChange={(e) => setEditService({ ...editService, categoryId: e.target.value })}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                >
                  {renderCategoryOptions()}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select value={editService.gender} label="Gender" onChange={(e) => setEditService({ ...editService, gender: e.target.value })}>
                      <MenuItem value="male">Men</MenuItem>
                      <MenuItem value="female">Women</MenuItem>
                      <MenuItem value="both">Unisex (Male &amp; Female)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Price" type="number" value={editService.price} onChange={(e) => setEditService({ ...editService, price: e.target.value })} />
                </Grid>
              </Grid>
              <TextField fullWidth label="Duration (min)" type="number" value={editService.estimatedDuration} onChange={(e) => setEditService({ ...editService, estimatedDuration: e.target.value })} />

              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={editService.BranchId || ''}
                  label="Branch"
                  onChange={(e) => setEditService({ ...editService, BranchId: e.target.value || null })}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ p: 2, bgcolor: '#1A1A1A', borderRadius: 2 }}>
                <FormControlLabel
                  control={<Switch checked={editService.commissionEnabled} color="secondary" onChange={(e) => setEditService({ ...editService, commissionEnabled: e.target.checked })} />}
                  label={<Typography variant="caption" fontWeight={800} color="#9A7B4F">Enable Commission</Typography>}
                />
                {editService.commissionEnabled && (
                  <TextField
                    label="Commission Percent"
                    type="number" fullWidth size="small"
                    sx={{ mt: 2, bgcolor: 'background.paper' }}
                    placeholder="10"
                    helperText="Whole number between 1 and 99"
                    inputProps={{ min: 1, max: 99, step: 1 }}
                    value={editService.commissionRate ?? ''}
                    onChange={(e) => setEditService({ ...editService, commissionRate: e.target.value })}
                  />
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="soft" color="inherit" fullWidth onClick={() => setEditService(null)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" color="secondary" fullWidth
            onClick={handleUpdate}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : null}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={executeDelete}
        onClose={() => setConfirmOpen(false)}
        title="Delete Service?"
        content="Are you sure you want to delete this service?"
      />
    </Box>
  );
}
