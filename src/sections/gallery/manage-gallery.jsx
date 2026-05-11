import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  IconButton,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import config from 'src/config';

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.url) {
    return img.url.startsWith('/') ? `${config.BASE_URL}${img.url}` : img.url;
  }
  return `${config.BASE_URL}/gallery/${img.id}/image`;
};

const isLocalUpload = (img) => !img?.url || img.url.startsWith('/');

export default function ManageGallery() {
  const theme = useTheme();
  const [images, setImages] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${config.BASE_URL}/gallery`, { cache: 'no-store' });
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleUpload = async () => {
    if (!file && !url) {
      setNotification({ open: true, message: 'Please select a file or enter a URL', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      } else {
        formData.append('url', url);
      }
      formData.append('title', title);
      formData.append('description', description);

      const res = await fetch(`${config.BASE_URL}/gallery`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setNotification({ open: true, message: 'Image added successfully', severity: 'success' });
        setOpen(false);
        setFile(null);
        setUrl('');
        setTitle('');
        setDescription('');
        fetchImages();
      } else {
        const err = await res.json();
        setNotification({ open: true, message: err.error || 'Failed to add image', severity: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: 'Network error', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${config.BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification({ open: true, message: 'Image deleted', severity: 'success' });
        await fetchImages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Gallery Management</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>Manage portraits and portfolio images for the landing page.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined" color="inherit"
            onClick={fetchImages} disabled={fetching}
            startIcon={fetching ? <CircularProgress size={16} /> : <Iconify icon="solar:restart-bold-duotone" />}
            sx={{ fontWeight: 800, height: 48, px: 3, borderRadius: 1.5 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained" color="secondary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setOpen(true)}
            sx={{ fontWeight: 900, height: 48, px: 3, borderRadius: 1.5 }}
          >
            Add New Image
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {images.map((img) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
            <Card sx={{
              borderRadius: 2.5, overflow: 'hidden', position: 'relative',
              boxShadow: theme.customShadows.z12,
              '&:hover .actions': { opacity: 1 }
            }}>
              <Box component="img" 
                   src={img.url.startsWith('/') ? `${config.BASE_URL}${img.url}` : img.url} 
                   sx={{ width: '100%', height: 240, objectFit: 'cover' }} />
              
              <Box className="actions" sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                bgcolor: alpha('#000', 0.5), opacity: 0, transition: '0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2
              }}>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(img.id)} sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} noWrap>{img.title || 'Untitled Portait'}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{img.url.startsWith('/') ? 'Local Upload' : 'External URL'}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
        {images.length === 0 && (
            <Grid item xs={12}>
                <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.background.neutral, 0.4), borderRadius: 3, border: '2px dashed', borderColor: 'divider' }}>
                    <Iconify icon="solar:gallery-bold-duotone" width={80} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h5" color="text.disabled" fontWeight={800}>No Images Yet</Typography>
                    <Typography variant="body2" color="text.disabled" fontWeight={600}>Click 'Add New Image' to start customizing your gallery.</Typography>
                </Box>
            </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Portfolio Image</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
                <Typography variant="caption" fontWeight={900} color="text.secondary" display="block" mb={1}>OPTION 1: UPLOAD FILE</Typography>
                <Button
                    component="label" variant="outlined" fullWidth
                    startIcon={<Iconify icon="solar:upload-bold" />}
                    sx={{ height: 56, borderRadius: 1.5, borderStyle: 'dashed' }}
                >
                    {file ? file.name : 'Select Image File'}
                    <input type="file" hidden accept="image/*" onChange={(e) => { setFile(e.target.files[0]); setUrl(''); }} />
                </Button>
            </Box>

            <Divider>OR</Divider>

            <Box>
                <Typography variant="caption" fontWeight={900} color="text.secondary" display="block" mb={1}>OPTION 2: EXTERNAL URL</Typography>
                <TextField 
                    fullWidth placeholder="https://images.unsplash.com/..." 
                    value={url} onChange={(e) => { setUrl(e.target.value); setFile(null); }}
                    InputProps={{ sx: { borderRadius: 1.5 } }}
                />
            </Box>

            <TextField 
                label="Portrait Title (Optional)" fullWidth 
                value={title} onChange={(e) => setTitle(e.target.value)}
                InputProps={{ sx: { borderRadius: 1.5 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="soft" color="inherit" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" fullWidth onClick={handleUpload} disabled={loading}>
            {loading ? 'Adding...' : 'Add Image'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} autoHideDuration={4000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} variant="filled" sx={{ fontWeight: 700 }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}
