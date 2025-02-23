import React from 'react';
import {Box, Button, Divider, Typography} from '@mui/material';
import {useRouter} from 'next/router';

const ReportLayout = () => {
    const router = useRouter();
    const {WorkerID} = router.query;

    const handleViewClick = () => {
        if (WorkerID) {
            router.push(`/worker/report/${WorkerID}`);
        }
    };

    return (
        <Box sx={{padding: '20px', maxWidth: '1500px', margin: '0 auto'}}>
            <Typography variant="h6" gutterBottom>
                Report
            </Typography>
            <Divider sx={{marginBottom: '20px'}}/>

            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="body1">Services Provided</Typography>
                <Button variant="outlined" onClick={handleViewClick}>
                    View
                </Button>
            </Box>

            <Divider sx={{marginTop: '20px', marginBottom: '20px'}}/>
        </Box>
    );
};

export default ReportLayout;
