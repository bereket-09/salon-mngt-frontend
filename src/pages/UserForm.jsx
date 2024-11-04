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

export default function UserForm({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({ id: '', username: '', email: '', password: '', status: '', role: '' });
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        username: initialData.username || '',
        email: initialData.email || '',
        password: initialData.password || '',
        status: initialData.status || '',
        role: initialData.role || '',
      });
    } else {
      setFormData({ id: '', username: '', email: '', password: '', status: '', role: '' });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.username) tempErrors.username = 'Username is required';
    if (!formData.email) tempErrors.email = 'Email is required';
    if (!formData.password) tempErrors.password = 'Password is required';
    if (!formData.status) tempErrors.status = 'Status is required';
    if (!formData.role) tempErrors.role = 'Role is required';
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
      <DialogTitle>{initialData ? 'Edit User' : 'Create User'}</DialogTitle>
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
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          error={!!errors.username}
          helperText={errors.username}
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          margin="dense"
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          error={!!errors.password}
          helperText={errors.password}
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
        <FormControl margin="dense" fullWidth error={!!errors.role}>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
          {errors.role && <p style={{ color: 'red' }}>{errors.role}</p>}
        </FormControl>
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
