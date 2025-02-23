import React, {useState} from 'react';
import {DateRangePicker} from 'react-date-range';
import {Box, Button, Divider, Paper, Typography} from '@mui/material';
import {addWeeks, endOfWeek, format, startOfWeek} from 'date-fns'; // Import addWeeks here
import 'react-date-range/dist/styles.css'; // Import the DateRangePicker styles
import 'react-date-range/dist/theme/default.css'; // Import theme styles

const DateRangePickerModal = ({onDateSelect, currentRange}) => {
    const [selectionRange, setSelectionRange] = useState({
        startDate: currentRange.startDate || new Date(),
        endDate: currentRange.endDate || new Date(),
        key: 'selection',
    });

    // Handles manual date selection from the calendar
    const handleSelect = (ranges) => {
        const selectedDate = ranges.selection.startDate;
        const startDate = startOfWeek(selectedDate, {weekStartsOn: 0});
        const endDate = endOfWeek(selectedDate, {weekStartsOn: 0});
        setSelectionRange({
            startDate: startDate,
            endDate: endDate,
            key: 'selection',
        });
    };

    // Submits the selected date range
    const handleSubmit = () => {
        onDateSelect(selectionRange);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                backgroundColor: '#fff',
                borderRadius: '12px',
                maxWidth: '600px', // Increased width for more space
                width: '100%',
                mx: 'auto',
                mt: '5%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1, // Reduced gap between elements
                boxShadow: 24,
                height: 'auto',
            }}
        >
            {/* Title */}
            <Typography variant="h6" align="center" gutterBottom sx={{fontWeight: 600}}>
                Choose Your Date Range
            </Typography>

            {/* Selected Date Range Display (Above the Calendar, Smaller Font) */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    my: 1, // Reduced margin
                }}
            >
                <Box sx={{textAlign: 'center', flex: 1}}>
                    <Typography color="textSecondary" sx={{fontWeight: 500, fontSize: '0.90rem'}}>
                        Start Date
                    </Typography>
                    <Typography variant="body1" color="primary" sx={{fontWeight: 500, fontSize: '1rem'}}>
                        {format(selectionRange.startDate, 'MMM dd, yyyy')}
                    </Typography>
                </Box>
                <Box sx={{textAlign: 'center', flex: 1}}>
                    <Typography color="textSecondary" sx={{fontWeight: 500, fontSize: '0.90rem'}}>
                        End Date
                    </Typography>
                    <Typography variant="body1" color="primary" sx={{fontWeight: 500, fontSize: '1rem'}}>
                        {format(selectionRange.endDate, 'MMM dd, yyyy')}
                    </Typography>
                </Box>
            </Box>

            <Divider/>

            {/* Date Range Picker with Custom Filters */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    my: 1, // Reduced gap between date picker and button
                }}
            >
                <DateRangePicker
                    ranges={[selectionRange]}
                    onChange={handleSelect}
                    months={1} // Show only 1 month to keep it compact
                    direction="horizontal"
                    showDateDisplay={false}
                    rangeColors={['#3f51b5']}
                    staticRanges={[
                        {
                            label: 'Last Week',
                            range: () => ({
                                startDate: startOfWeek(addWeeks(new Date(), -1), {weekStartsOn: 0}),
                                endDate: endOfWeek(addWeeks(new Date(), -1), {weekStartsOn: 0}),
                            }),
                            isSelected: () => false,
                        },
                        {
                            label: 'This Week',
                            range: () => ({
                                startDate: startOfWeek(new Date(), {weekStartsOn: 0}),
                                endDate: endOfWeek(new Date(), {weekStartsOn: 0}),
                            }),
                            isSelected: () => false,
                        },
                        {
                            label: 'Next Week',
                            range: () => ({
                                startDate: startOfWeek(addWeeks(new Date(), 1), {weekStartsOn: 0}),
                                endDate: endOfWeek(addWeeks(new Date(), 1), {weekStartsOn: 0}),
                            }),
                            isSelected: () => false,
                        },
                    ]}
                    inputRanges={[]} // Removed unnecessary input ranges like "Days up to today"
                />
            </Box>

            <Divider/>

            {/* Apply Button */}
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 1}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{px: 2, py: 1, textTransform: 'none'}} // Reduced padding for a more compact button
                >
                    Apply Date Range
                </Button>
            </Box>
        </Paper>
    );
};

export default DateRangePickerModal;
