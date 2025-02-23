import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function Loader() {
    return (
        <Box sx={{width: "100%", height: "100vh", display: 'flex', justifyContent: "center", alignItems: "center"}}>
            <CircularProgress size="50px"/>
        </Box>
    );
}

export default Loader;
