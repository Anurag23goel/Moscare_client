import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const ClientAlert = ({
                         open,
                         onClose,
                         action,
                         onConfirmation,
                         selectedComponent,
                         activeGeneralTab,
                         setIsButtonClicked,
                         saveFunctions
                     }) => {
    //const {colors} = useContext(ColorContext)
    const handleClose = () => {
        onClose();
    };

    const handleSave = () => {
        onConfirmation()
        if (onConfirmation) {
            setIsButtonClicked(true); // Ensure this is called before anything else
            setTimeout(() => {
                const activeSaveFunction = saveFunctions[selectedComponent];
                console.log("activeSaveFunction: ", activeSaveFunction);

                if (activeSaveFunction) {
                    activeSaveFunction(); // Trigger the save function for the selected component
                } else {
                    console.warn("No save function registered for the current tab!");
                }
            }, 0); // Delay ensures state propagation
        }

        handleClose(); // Close the dialog after confirming
    };


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Confirm {action === 'update' ? 'Update' : 'Delete'}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to {action === 'update' ? 'update' : 'delete'} this row?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary" style={{backgroundColor: "yellow", color: "#fff"}}>
                    Cancel
                </Button>
                <Button style={{backgroundColor: "blue", color: "#fff"}} onClick={() => handleSave()}
                        color={action === 'update' ? 'primary' : 'error'} autoFocus>
                    {action === 'update' ? 'Update' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClientAlert;
