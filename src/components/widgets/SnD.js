import React, {useState} from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CustomButton from "./MaterialButton";
import Box from '@mui/material/Box';
import Alert from './Alert'; // assuming Alert.js is in the same directory

const SaveDelete = ({saveOnClick, deleteOnClick, sx, display, display2, disabled = false, ...props}) => {
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState(null); // To track which action is triggered

    const handleClickOpen = (action) => {
        setAction(action);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirmation = () => {
        if (action === 'update') {
            saveOnClick();
        } else if (action === 'delete') {
            deleteOnClick();
        }
        setOpen(false);
    };

    return (
        <div>
            <Box sx={{margin: '10px 15px 30px 15px', display: 'flex', justifyContent: 'space-between'}}>
                <CustomButton
                    label="Update"
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon/>}
                    onClick={() => handleClickOpen('update')} // Pass the handleClickOpen function with the action
                    size={"small"}
                    sx={sx}
                    display={display2}
                    disabled={disabled}
                />
                {/* <CustomButton
                    label="Delete"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleClickOpen('delete')} // Pass the handleClickOpen function with the action
                    size={"small"}
                    sx={sx}
                    display={display}
                    disabled = {disabled}
                /> */}
                <Alert open={open} onClose={handleClose} action={action} onConfirmation={handleConfirmation}/>
            </Box>
        </div>
    )
}

export default SaveDelete;
