import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Alert } from '@mui/material';

export default function ApplicationForm({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    id: '',
    app_name: '',
    title: '',
    description: '',
    developer_name: '',
    application_url: '',
    status: '',
    icon_name: ''
  });
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        app_name: initialData.app_name || '',
        title: initialData.title || '',
        description: initialData.description || '',
        developer_name: initialData.developer_name || '',
        application_url: initialData.application_url || '',
        status: initialData.status || '',
        icon_name: initialData.icon_name || ''
      });
    } else {
      setFormData({
        id: '',
        app_name: '',
        title: '',
        description: '',
        developer_name: '',
        application_url: '',
        status: '',
        icon_name: ''
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.app_name) tempErrors.app_name = 'Application Name is required';
    if (!formData.title) tempErrors.title = 'Title is required';
    if (!formData.description) tempErrors.description = 'Description is required';
    if (!formData.developer_name) tempErrors.developer_name = 'Developer Name is required';
    if (!formData.application_url) tempErrors.application_url = 'Application URL is required';
    if (!formData.status) tempErrors.status = 'Status is required';
    if (!formData.icon_name) tempErrors.icon_name = 'Icon Name is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    setFormSubmitted(true);
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Edit Application' : 'Create Application'}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="ID"
          name="id"
          value={formData.id}
          fullWidth
          disabled
        />
        <TextField
          margin="dense"
          label="Application Name"
          name="app_name"
          value={formData.app_name}
          onChange={handleChange}
          fullWidth
          error={!!errors.app_name}
          helperText={errors.app_name}
        />
        <TextField
          margin="dense"
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          error={!!errors.title}
          helperText={errors.title}
        />
        <TextField
          margin="dense"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          error={!!errors.description}
          helperText={errors.description}
        />
        <TextField
          margin="dense"
          label="Developer Name"
          name="developer_name"
          value={formData.developer_name}
          onChange={handleChange}
          fullWidth
          error={!!errors.developer_name}
          helperText={errors.developer_name}
        />
        <TextField
          margin="dense"
          label="Application URL"
          name="application_url"
          value={formData.application_url}
          onChange={handleChange}
          fullWidth
          error={!!errors.application_url}
          helperText={errors.application_url}
        />
        <FormControl margin="dense" fullWidth error={!!errors.status}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
          </Select>
          {errors.status && <p style={{ color: 'red' }}>{errors.status}</p>}
        </FormControl>
        <TextField
          margin="dense"
          label="Icon Name"
          name="icon_name"
          value={formData.icon_name}
          onChange={handleChange}
          fullWidth
          error={!!errors.icon_name}
          helperText={errors.icon_name}
        />
        {formSubmitted && Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the errors above
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{initialData ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
}
