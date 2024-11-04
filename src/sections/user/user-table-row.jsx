import Swal from 'sweetalert2';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import UserForm from 'src/pages/UserForm';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import config from 'src/config';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  name,
  avatarUrl,
  company,
  role,
  isVerified,
  status,
  handleClick,
  row
}) {
  const [open, setOpen] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // eslint-disable-next-line no-shadow
  const handleOpenDialog = (row) => {
    console.log(row)
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRow(null);
  };


  const handleRowDelete = async (rowData) => {
    // Show confirmation dialog with the user's name
    const result = await Swal.fire({
        title: `Are you sure? You want to delete ${rowData.username}`, // Use template literals here
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:4000/api/users/delete/${rowData.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'User deleted successfully',
                }).then(() => {
                    // Refresh the table data after deletion
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete user',
                    text: 'Please try again.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'An error occurred',
                text: 'Please try again.',
            });
        }
    }
};



  const handleSubmit = async (data) => {
    const url = selectedRow ? `${config.BASE_URL}/users/update/${selectedRow.id}` : `${config.BASE_URL}/users`;
    const method = selectedRow ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log(selectedRow ? 'User updated successfully' : 'User created successfully');
      handleCloseDialog();
      
    window.location.reload();
    } else {
      console.error(selectedRow ? 'Failed to update user' : 'Failed to create user');
    }
  };
  

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{company}</TableCell>

        <TableCell>{role}</TableCell>

        <TableCell align="center">{isVerified ? 'Yes' : 'No'}</TableCell>

        <TableCell>
          <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        {/* <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem> */}

<MenuItem onClick={() => handleOpenDialog(row)}>
        <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
        Edit
      </MenuItem>

      <MenuItem onClick={() => handleRowDelete(row)} sx={{ color: 'error.main' }}>
    <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
    Delete
</MenuItem>
        <UserForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialData={selectedRow}
      />
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
  row: PropTypes.any,
};
