import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function RejectDialog({open, onClose, onSubmit, remarks, setRemarks}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Reject Activity</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Remarks"
                    type="text"
                    fullWidth
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit} color="primary">Submit</Button>
            </DialogActions>
        </Dialog>
    );
}
