import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  Stack,
  Chip,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
  CircularProgress,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/config';
import Iconify from 'src/components/iconify';
import ConfirmDialog from 'src/components/confirm-dialog/confirm-dialog';

const EMPTY_FORM = { name: '', parentId: '', icon: '', color: '#9A7B4F' };

export default function ServiceCategoriesPage() {
  const theme = useTheme();
  const [tree, setTree] = useState([]); // supers with nested Children
  const [form, setForm] = useState(EMPTY_FORM);
  const [edit, setEdit] = useState(null); // { id, name, parentId, ... }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem('authToken');
  const authHeaders = useCallback(
    (json = false) => ({
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.BASE_URL}/service-categories?tree=1`, {
        headers: authHeaders(),
        cache: 'no-store',
      });
      const data = await res.json();
      setTree(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchTree error:', err);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await fetch(`${config.BASE_URL}/service-categories`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      setForm(EMPTY_FORM);
      await fetchTree();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!edit?.name?.trim()) return;
    setSaving(true);
    try {
      await fetch(`${config.BASE_URL}/service-categories/${edit.id}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ name: edit.name, icon: edit.icon, color: edit.color }),
      });
      setEdit(null);
      await fetchTree();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      const res = await fetch(`${config.BASE_URL}/service-categories/${target.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        alert(e.error || 'Could not delete category');
      }
      await fetchTree();
    } catch (err) {
      console.error(err);
    }
  };

  const supers = tree;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Service Categories</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Group services under super-categories (e.g. <b>Hair</b> → Haircut, Coloring, Wash).
          </Typography>
        </Box>
        <IconButton onClick={fetchTree} disabled={loading} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), width: 44, height: 44 }}>
          {loading
            ? <CircularProgress size={18} sx={{ color: 'secondary.main' }} />
            : <Iconify icon="solar:restart-linear" sx={{ color: 'secondary.main' }} />}
        </IconButton>
      </Stack>

      <Grid container spacing={4}>
        {/* ADD FORM */}
        <Grid item xs={12} lg={4}>
          <Card sx={{
            p: 4, borderRadius: 2.5, boxShadow: theme.customShadows.z12,
            position: { lg: 'sticky' }, top: 24,
            border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1),
            bgcolor: alpha(theme.palette.background.neutral, 0.4),
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <Box sx={{ p: 1, bgcolor: '#1A1A1A', borderRadius: 1.5, color: '#9A7B4F' }}>
                <Iconify icon="solar:widget-add-linear" width={28} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Add Category</Typography>
            </Stack>

            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 800 }}>Type</InputLabel>
                <Select
                  value={form.parentId} label="Type"
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' }}
                >
                  <MenuItem value=""><b>Super-category</b> (top level)</MenuItem>
                  {supers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>Sub-category of {s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Category Name"
                fullWidth
                placeholder={form.parentId ? 'e.g. Coloring' : 'e.g. Hair'}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700, bgcolor: 'background.paper' } }}
              />

              {!form.parentId && (
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Icon (optional)"
                    fullWidth
                    placeholder="solar:hair-dryer"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    InputProps={{ sx: { borderRadius: 1.5, fontWeight: 600, bgcolor: 'background.paper' } }}
                  />
                  <TextField
                    label="Color"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    sx={{ width: 90, '& input': { height: 40, p: 0.5, cursor: 'pointer' } }}
                  />
                </Stack>
              )}

              <Button
                variant="contained" color="secondary" fullWidth
                onClick={handleCreate}
                disabled={saving || !form.name.trim()}
                startIcon={saving ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : null}
                sx={{ height: 56, fontWeight: 900, borderRadius: 1.5 }}
              >
                {saving ? 'Saving…' : 'Add Category'}
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* TREE */}
        <Grid item xs={12} lg={8}>
          {supers.length === 0 && !loading && (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 2.5, borderStyle: 'dashed', border: '1px dashed', borderColor: 'divider' }}>
              <Iconify icon="solar:widget-5-linear" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={800}>No categories yet</Typography>
              <Typography variant="body2" color="text.secondary">Create your first super-category (e.g. Hair) to get started.</Typography>
            </Card>
          )}

          <Stack spacing={3}>
            {supers.map((sup) => (
              <Card key={sup.id} sx={{ p: 3, borderRadius: 2.5, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(sup.color || theme.palette.secondary.main, 0.12), color: sup.color || 'secondary.main' }}>
                      <Iconify icon={sup.icon || 'solar:widget-5-linear'} width={24} />
                    </Box>
                    {edit?.id === sup.id ? (
                      <TextField
                        size="small" autoFocus value={edit.name}
                        onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      />
                    ) : (
                      <Typography variant="h6" fontWeight={800}>{sup.name}</Typography>
                    )}
                    <Chip size="small" label={`${(sup.Children || []).length} sub`} variant="soft" color="default" sx={{ fontWeight: 800 }} />
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    {edit?.id === sup.id ? (
                      <>
                        <IconButton size="small" color="secondary" onClick={handleUpdate} disabled={saving}><Iconify icon="solar:check-circle-linear" /></IconButton>
                        <IconButton size="small" onClick={() => setEdit(null)}><Iconify icon="solar:close-circle-linear" /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton size="small" onClick={() => setEdit({ id: sup.id, name: sup.name, icon: sup.icon, color: sup.color })} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}><Iconify icon="solar:pen-linear" width={18} /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteTarget(sup)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main' }}><Iconify icon="solar:trash-bin-trash-linear" width={18} /></IconButton>
                      </>
                    )}
                  </Stack>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(sup.Children || []).length === 0 && (
                    <Typography variant="caption" color="text.disabled" fontWeight={700}>No sub-categories yet — add one on the left.</Typography>
                  )}
                  {(sup.Children || []).map((child) => (
                    <Chip
                      key={child.id}
                      label={child.name}
                      onDelete={() => setDeleteTarget(child)}
                      deleteIcon={<Iconify icon="solar:close-circle-linear" width={16} />}
                      variant="soft" color="warning"
                      sx={{ fontWeight: 800, borderRadius: 1 }}
                    />
                  ))}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category?"
        content={
          deleteTarget?.parentId
            ? `Delete "${deleteTarget?.name}"? Services in it become uncategorized.`
            : `Delete "${deleteTarget?.name}"? You must remove its sub-categories first.`
        }
      />
    </Box>
  );
}
