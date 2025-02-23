import React, {useState} from 'react';
import {DateRangePicker} from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {Box, Container, Typography} from '@mui/material';
import {endOfWeek, startOfWeek} from 'date-fns';
import MButton from "../../../widgets/MaterialButton";
import "../../../../styles/style.module.css"


const MyComponent = ({onDateSelect}) => {
    const [selectionRange, setSelectionRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [error, setError] = useState('');

    const handleSelect = (ranges) => {
        const selectedDate = ranges.selection.startDate;
        const startDate = startOfWeek(selectedDate, {weekStartsOn: 0}); // weekStartsOn: 0 indicates Sunday as the start of the week
        const endDate = endOfWeek(selectedDate, {weekStartsOn: 0});

        setSelectionRange({
            startDate: startDate,
            endDate: endDate,
            key: 'selection',
        });
        setError('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const {startDate, endDate} = selectionRange;

        if (!startDate || !endDate || startDate > endDate) {
            setError('Please select a valid date range.');
            return;
        }
        if (onDateSelect) {
            onDateSelect({startDate, endDate});
        }
    };

    return (
        <Container maxWidth="sm" sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
        }}>
            <Typography variant="h5" gutterBottom align="center">
                Select Date Range
            </Typography>
            <Box sx={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: '300px'
            }}>
                <DateRangePicker
                    ranges={[selectionRange]}
                    onChange={handleSelect}
                    months={1}
                    direction="horizontal"
                    showSelectionPreview={true}
                    moveRangeOnFirstSelection={false}
                    staticRanges={[]}
                    inputRanges={[]}
                    className="rdrDefinedRangesWrapper hideDefinedRange"
                />
                {error && <Typography color="error" sx={{mt: 2, textAlign: 'center'}}>{error}</Typography>}
                <form onSubmit={handleSubmit} style={{marginTop: '20px', textAlign: 'center'}}>
                    <MButton
                        type="submit"
                        label="Select Week"
                        variant="contained"
                        color="primary"
                        backgroundColor="primary.main"
                        width="100%"
                    />
                </form>
            </Box>
        </Container>
    );
};

export default MyComponent;
