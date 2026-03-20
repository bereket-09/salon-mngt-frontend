import PropTypes from 'prop-types';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, Typography } from '@mui/material';

export default function ConfirmDialog({ open, onConfirm, onClose, title, content, confirmLabel = "Confirm", cancelLabel = "Cancel", color = "primary" }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>{title}</DialogTitle>
            <DialogContent sx={{ px: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    {content}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ fontWeight: 800 }}>{cancelLabel}</Button>
                <Button onClick={onConfirm} variant="contained" color={color} sx={{ fontWeight: 900, px: 3 }}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ConfirmDialog.propTypes = {
    open: PropTypes.bool,
    onConfirm: PropTypes.func,
    onClose: PropTypes.func,
    title: PropTypes.string,
    content: PropTypes.string,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    color: PropTypes.string,
};
