import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function ApproveDialog({open, onClose, onSubmit, actionType}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>
                Are you sure you want to {actionType === 'approve' ? 'approve' : 'approve selected'} this activity?
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit} color="primary">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}
