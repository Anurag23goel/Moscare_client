import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function ControlTextBox({label}) {
    return (
        <Box
            component="form"
            sx={{'& > :not(style)': {width: '25ch'}}}
            noValidate
            autoComplete="off"
        >
            <TextField id="outlined-basic" label={label} variant="outlined"/>
        </Box>
    );
}
