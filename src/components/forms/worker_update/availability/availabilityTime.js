import React, {useEffect, useState} from 'react';
import {addDays, format, format as formatTime, parse, startOfDay, startOfWeek} from 'date-fns';
import styles from "@/styles/workeravailability.module.css";
import {Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField} from '@mui/material';
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch} from "react-redux";
import {upsertData} from "@/redux/worker/availabilitySlice";
import {useRouter} from "next/router";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {Copy, Save, Users} from 'lucide-react';
// Removed safeJSONParse as it's no longer needed
// const safeJSONParse = (str) => {
//   try {
//     return JSON.parse(str);
//   } catch (e) {
//     console.error("JSON parse error:", e, "Input:", str);
//     return [];
//   }
// };

const WorkerAvailability = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const dispatch = useDispatch();

    const [availability, setAvailability] = useState(Array(14).fill('Unavailable'));
    const [partialAvailability, setPartialAvailability] = useState(Array(14).fill([]));
    const [selectedDays, setSelectedDays] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);
    const [copiedAvailability, setCopiedAvailability] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [timePickerIndex, setTimePickerIndex] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);

    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');

    const getCurrentDateRangeStart = () => {
        const today = new Date();
        const startDate = startOfWeek(today, {weekStartsOn: 1}); // Start from Monday
        return startDate;
    };

    const startDate = getCurrentDateRangeStart();

    // Function to handle removing a specific time range
    const handleRemoveTimeRange = (dayIndex, timeIndex) => {
        const updatedPartialAvailability = [...partialAvailability];
        updatedPartialAvailability[dayIndex].splice(timeIndex, 1);

        if (updatedPartialAvailability[dayIndex].length === 0) {
            const updatedAvailability = [...availability];
            updatedAvailability[dayIndex] = 'Unavailable'; // Or another default status
            setAvailability(updatedAvailability);
            dispatch(upsertData(updatedAvailability));
        }

        setPartialAvailability(updatedPartialAvailability);
    };

    // Fetch worker availability data and set it to state
    const fetchDataAsync = async () => {
        try {
            const availabilityData = await fetchData(`/api/getWorkerAvailabilityTimeData/${WorkerID}`, window.location.href);

            console.log("Fetched Availability Data:", availabilityData.data[0]);

            const fetchedAvailability = {
                CurrentMo: availabilityData.data[0]?.CurrentMo || [],
                CurrentTu: availabilityData.data[0]?.CurrentTu || [],
                CurrentWe: availabilityData.data[0]?.CurrentWe || [],
                CurrentTh: availabilityData.data[0]?.CurrentTh || [],
                CurrentFr: availabilityData.data[0]?.CurrentFr || [],
                CurrentSa: availabilityData.data[0]?.CurrentSa || [],
                CurrentSu: availabilityData.data[0]?.CurrentSu || [],
                NextMo: availabilityData.data[0]?.NextMo || [],
                NextTu: availabilityData.data[0]?.NextTu || [],
                NextWe: availabilityData.data[0]?.NextWe || [],
                NextTh: availabilityData.data[0]?.NextTh || [],
                NextFr: availabilityData.data[0]?.NextFr || [],
                NextSa: availabilityData.data[0]?.NextSa || [],
                NextSu: availabilityData.data[0]?.NextSu || []
            };

            setAvailability([
                availabilityData.data[0]?.CurrentMoStatus || 'Unavailable',
                availabilityData.data[0]?.CurrentTuStatus || 'Unavailable',
                availabilityData.data[0]?.CurrentWeStatus || 'Unavailable',
                availabilityData.data[0]?.CurrentThStatus || 'Unavailable',
                availabilityData.data[0]?.CurrentFrStatus || 'Unavailable',
                availabilityData.data[0]?.CurrentSaStatus || 'Unavailable',
                availabilityData.data[0]?.CurrentSuStatus || 'Unavailable',
                availabilityData.data[0]?.NextMoStatus || 'Unavailable',
                availabilityData.data[0]?.NextTuStatus || 'Unavailable',
                availabilityData.data[0]?.NextWeStatus || 'Unavailable',
                availabilityData.data[0]?.NextThStatus || 'Unavailable',
                availabilityData.data[0]?.NextFrStatus || 'Unavailable',
                availabilityData.data[0]?.NextSaStatus || 'Unavailable',
                availabilityData.data[0]?.NextSuStatus || 'Unavailable'
            ]);

            setPartialAvailability([
                fetchedAvailability.CurrentMo,
                fetchedAvailability.CurrentTu,
                fetchedAvailability.CurrentWe,
                fetchedAvailability.CurrentTh,
                fetchedAvailability.CurrentFr,
                fetchedAvailability.CurrentSa,
                fetchedAvailability.CurrentSu,
                fetchedAvailability.NextMo,
                fetchedAvailability.NextTu,
                fetchedAvailability.NextWe,
                fetchedAvailability.NextTh,
                fetchedAvailability.NextFr,
                fetchedAvailability.NextSa,
                fetchedAvailability.NextSu
            ]);
        } catch (error) {
            console.error("Error fetching availability data:", error);
        }
    };

    // Save availability data
    const handleSaveAvailability = async () => {
        const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

        const availabilityData = {};

        daysOfWeek.forEach((day, index) => {
            availabilityData[`Current${day}Status`] = availability[index];
            availabilityData[`Current${day}`] =
                availability[index] === 'As Below' ? partialAvailability[index] : [];

            availabilityData[`Next${day}Status`] = availability[7 + index];
            availabilityData[`Next${day}`] =
                availability[7 + index] === 'As Below' ? partialAvailability[7 + index] : [];
        });

        console.log('Data being sent to backend:', availabilityData); // Log to verify structure

        await putData(`/api/updateWorkerAvailabilityTimeData/${WorkerID}`, {
            data: availabilityData,
        });
        alert('Availability updated successfully!');
    };

    // Handling availability changes
    const handleAvailabilityChange = (index, status) => {
        // Do not allow changes for past dates
        const dayDate = addDays(startDate, index);
        const isPast = dayDate < startOfDay(today);
        if (isPast) return;

        const updatedAvailability = [...availability];
        updatedAvailability[index] = status;
        setAvailability(updatedAvailability);
        dispatch(upsertData(updatedAvailability)); // Update redux store
    };

    // Convert 24-hour time to 12-hour format
    const convertTo12HourFormat = (timeString) => {
        const time24 = parse(timeString, "HH:mm", new Date());
        return formatTime(time24, "hh:mm a");
    };

    // Handle partial availability change
    const savePartialAvailability = () => {
        if (!startTime || !endTime) {
            alert("Please select both start and end times.");
            return;
        }

        if (startTime >= endTime) {
            alert("Start time must be before end time.");
            return;
        }

        const existingRanges = partialAvailability[timePickerIndex] || [];

        // Validate overlapping time ranges
        const isValid = isValidTimeRange(startTime, endTime, existingRanges);
        if (!isValid) {
            alert("The time range overlaps with an existing range.");
            return;
        }

        const newTimeRange = `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(endTime)}`;

        const updatedPartialAvailability = [...partialAvailability];
        if (!updatedPartialAvailability[timePickerIndex]) {
            updatedPartialAvailability[timePickerIndex] = [];
        }
        updatedPartialAvailability[timePickerIndex].push(newTimeRange); // Append new time range

        const updatedAvailability = [...availability];
        updatedAvailability[timePickerIndex] = 'As Below'; // Ensure status is "As Below"

        setAvailability(updatedAvailability);
        setPartialAvailability(updatedPartialAvailability);
        setDialogOpen(false);
    };

    // Function to validate overlapping time ranges
    const isValidTimeRange = (newStart, newEnd, existingRanges) => {
        const newStartTime = parse(newStart, "HH:mm", new Date());
        const newEndTime = parse(newEnd, "HH:mm", new Date());

        for (let range of existingRanges) {
            const [start, end] = range.split(" - ");
            const startTime = parse(start, "hh:mm a", new Date());
            const endTimeParsed = parse(end, "hh:mm a", new Date());

            // Check for overlap
            if (
                (newStartTime >= startTime && newStartTime < endTimeParsed) ||
                (newEndTime > startTime && newEndTime <= endTimeParsed) ||
                (newStartTime <= startTime && newEndTime >= endTimeParsed)
            ) {
                return false;
            }
        }
        return true;
    };

    // Copy availability for a specific day
    const handleCopyAvailability = (index) => {
        const dayDate = addDays(startDate, index);
        const isPast = dayDate < startOfDay(today);
        if (isPast) return;

        setCopiedAvailability({
            status: availability[index],
            time: [...partialAvailability[index]], // Deep copy the array
        });
        setSnackbarOpen(true);
    };

    // Paste availability to a specific day
    const handlePasteAvailability = (index) => {
        const dayDate = addDays(startDate, index);
        const isPast = dayDate < startOfDay(today);
        if (isPast) return;

        if (copiedAvailability) {
            const updatedAvailability = [...availability];
            updatedAvailability[index] = copiedAvailability.status;
            setAvailability(updatedAvailability);

            const updatedPartialAvailability = [...partialAvailability];
            updatedPartialAvailability[index] = [...copiedAvailability.time];
            setPartialAvailability(updatedPartialAvailability);
            dispatch(upsertData(updatedAvailability));
        }
    };

    const handleBulkAction = (status) => {
        const updatedAvailability = [...availability];
        const updatedPartialAvailability = [...partialAvailability];

        // Ensure selected days are marked as the chosen status ('Available' or 'Unavailable')
        selectedDays.forEach((index) => {
            const dayDate = addDays(startDate, index);
            const isPast = dayDate < startOfDay(today);
            if (isPast) return;

            updatedAvailability[index] = status;
            if (status !== 'As Below') {
                updatedPartialAvailability[index] = []; // Clear partial availability if status is not 'As Below'
            }
        });

        setAvailability(updatedAvailability);
        setPartialAvailability(updatedPartialAvailability);
        setSelectedDays([]);
        setBulkMode(false);
        dispatch(upsertData(updatedAvailability));
    };

    // Toggle selection of a day for bulk action
    const handleDayToggle = (index) => {
        const dayDate = addDays(startDate, index);
        const isPast = dayDate < startOfDay(today);
        if (isPast) return;

        if (selectedDays.includes(index)) {
            setSelectedDays(selectedDays.filter((day) => day !== index));
        } else {
            setSelectedDays([...selectedDays, index]);
        }
    };

    // Handle partial availability dialog
    const handlePartialAvailability = (index) => {
        const dayDate = addDays(startDate, index);
        const isPast = dayDate < startOfDay(today);
        if (isPast) return;

        setTimePickerIndex(index);
        setStartTime("");
        setEndTime("");
        setDialogOpen(true);
    };

    // Autofill next week's availability with the first week's data
    const handleAutoFill = () => {
        const firstWeek = availability.slice(0, 7);
        const updatedAvailability = [...firstWeek, ...firstWeek];

        const firstWeekPartial = partialAvailability.slice(0, 7);
        const updatedPartialAvailability = [...firstWeekPartial, ...firstWeekPartial];

        setAvailability(updatedAvailability);
        setPartialAvailability(updatedPartialAvailability);
        dispatch(upsertData(updatedAvailability));
        console.log('Autofill availability:', updatedAvailability);
    };

    // Fetch user roles to disable sections if necessary
    // Fetch data and roles on component mount
    useEffect(() => {
        if (WorkerID) {
            fetchDataAsync();
            fetchUserRoles('m_wprofile', 'Worker_Profile_Availability', setDisableSection);
        }
    }, [WorkerID]);

    return (
        <div className="">

            <div className="px-4 pt-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Worker Availability
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Set and manage worker availability for the next 14 days
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveAvailability}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <Save className="h-4 w-4"/>
                            <span>Save Availability</span>
                        </button>

                        <button
                            onClick={() => setBulkMode(true)}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Users className="h-4 w-4"/>
                            <span>Bulk Update</span>
                        </button>

                        <button
                            onClick={handleAutoFill}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Copy className="h-4 w-4"/>
                            <span>Copy to Next Week</span>
                        </button>
                    </div>
                </div>

                <div className={styles.calendarGrid}>
                    {Array.from({length: 14}).map((_, index) => {
                        const dayDate = addDays(startDate, index);
                        const dayFormatted = format(dayDate, 'yyyy-MM-dd');
                        const isToday = startOfDay(dayDate).getTime() === startOfDay(today).getTime();
                        const isPast = dayDate < startOfDay(today);

                        const dayLabel = format(dayDate, 'EEE');
                        const dateLabel = format(dayDate, 'dd/MM/yyyy');

                        return (
                            <div
                                key={index}
                                className={`${styles.dayCard} 
      ${availability[index].toLowerCase() === 'available' ? styles.available : ''} 
      ${availability[index].toLowerCase() === 'unavailable' ? styles.unavailable : ''} 
      ${availability[index].toLowerCase() === 'as below' ? styles.partiallyAvailable : ''} 
      ${isToday ? styles.todayCard : ''} 
      ${isPast ? styles.disabledDay : ''}`}
                            >
                                <div className={styles.dayLabel}>{dayLabel}</div>
                                <div className={styles.dateLabel}>{dateLabel}</div>
                                <div className={styles.buttonGroup}>
                                    <button
                                        className={styles.statusButton}
                                        onClick={() => handleAvailabilityChange(index, 'Available')}
                                        disabled={disableSection || isPast}
                                    >
                                        Available
                                    </button>
                                    <button
                                        className={styles.statusButton}
                                        onClick={() => handleAvailabilityChange(index, 'Unavailable')}
                                        disabled={disableSection || isPast}
                                    >
                                        Unavailable
                                    </button>
                                    <button
                                        className={styles.statusButton}
                                        onClick={() => handlePartialAvailability(index)}
                                        disabled={disableSection || isPast}
                                    >
                                        Partial
                                    </button>
                                </div>
                                {availability[index].toLowerCase() === 'as below' && partialAvailability[index].length > 0 && (
                                    <div className={styles.timeLabel}>
                                        {partialAvailability[index].map((time, idx) => (
                                            <div key={`${index}-${idx}`} className={styles.timeRange}>
                                                {time}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveTimeRange(index, idx)}
                                                    disabled={disableSection}
                                                    aria-label="Remove time range"
                                                    sx={{
                                                        padding: '2px',
                                                        color: '#f44336',
                                                        '&:hover': {
                                                            backgroundColor: 'transparent',
                                                            color: '#d32f2f',
                                                        },
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small"/>
                                                </IconButton>
                                            </div>
                                        ))}
                                        <button
                                            className={styles.addTimeButton}
                                            onClick={() => handlePartialAvailability(index)}
                                            disabled={disableSection || isPast}
                                        >
                                            Add Time
                                        </button>
                                    </div>
                                )}
                                <div className={styles.copyPasteGroup}>
                                    <button className={styles.copyPasteButton}
                                            onClick={() => handleCopyAvailability(index)}
                                            disabled={disableSection || isPast}>
                                        Copy
                                    </button>
                                    <button className={styles.copyPasteButton}
                                            onClick={() => handlePasteAvailability(index)}
                                            disabled={disableSection || isPast}>
                                        Paste
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {bulkMode && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3 className={styles.modalTitle}>Mark Bulk Availability</h3>

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Day</th>
                                        <th>Select</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {Array.from({length: 14}).map((_, index) => {
                                        const dayDate = addDays(startDate, index);
                                        const isPast = dayDate < startOfDay(today);

                                        return (
                                            <tr key={index}>
                                                <td>{format(dayDate, 'dd/MM/yyyy')}</td>
                                                <td>{format(dayDate, 'EEE')}</td>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleDayToggle(index)}
                                                        checked={selectedDays.includes(index)}
                                                        disabled={disableSection || isPast}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.modalButtons}>
                                <button className={styles.bulkActionButton}
                                        onClick={() => handleBulkAction('Available')} disabled={disableSection}>
                                    Available
                                </button>
                                <button className={styles.bulkActionButton}
                                        onClick={() => handleBulkAction('Unavailable')} disabled={disableSection}>
                                    Unavailable
                                </button>
                                <button className={styles.bulkActionButton} onClick={() => setBulkMode(false)}
                                        disabled={disableSection}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Select Time Range</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Start Time"
                            type="time"
                            fullWidth
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            InputLabelProps={{shrink: true}}
                            inputProps={{step: 300}}
                            margin="normal"
                        />
                        <TextField
                            label="End Time"
                            type="time"
                            fullWidth
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            InputLabelProps={{shrink: true}}
                            inputProps={{step: 300}}
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <button className={styles.dialogButton} onClick={savePartialAvailability}>
                            Save
                        </button>
                        <button className={styles.dialogButton} onClick={() => setDialogOpen(false)}>
                            Cancel
                        </button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={() => setSnackbarOpen(false)}
                    message="Availability copied"
                />
            </div>
        </div>
    );
};

export default WorkerAvailability;