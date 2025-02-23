// src/components/widgets/DroppableCell.js

import React, {useState} from 'react';
import {useDrop} from 'react-dnd';
import {Alert, Popover, Snackbar, Tooltip} from '@mui/material';
import styles from '@/styles/scheduler.module.css';
import WarningIcon from '@mui/icons-material/Warning';
import {doIntervalsOverlap} from '../widgets/utils/timeUtils';
import {isWithinInterval} from 'date-fns';

const DroppableCell = ({
                           disable,
                           dayIndex,
                           workerId,
                           date,
                           children,
                           setShiftData,
                           workerAvailability,
                           openShifts,
                           setOpenShifts,
                           setIsDraftEnabled,
                           setDraftShifts,
                           handleShiftsChanged,
                           workers,
                           shiftData,
                       }) => {
    const [{isOver, canDrop}, drop] = useDrop(
        () => ({
            accept: 'SHIFT',
            drop: (item, monitor) => {
                handleDrop(item, workerId, date);
            },
            canDrop: (item, monitor) => {
                if (workerId === 'openShifts') {
                    // Allow any shift to be dropped into openShifts
                    return true;
                }
                if (disable) return false;

                const dayAvailability = workerAvailability[dayIndex] || [];
                const hasAvailable = dayAvailability.some(
                    (availability) => availability.status === 'Available'
                );
                const hasPartiallyAvailable = dayAvailability.some(
                    (availability) => availability.status === 'Partially Available'
                );

                return hasAvailable || hasPartiallyAvailable;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [workerId, dayIndex, date, setShiftData, workerAvailability, openShifts]
    );

    const [popoverAnchor, setPopoverAnchor] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handlePopoverOpen = (event) => {
        setPopoverAnchor(event.currentTarget);
    };
    const handlePopoverClose = () => {
        setPopoverAnchor(null);
    };
    const handleSnackbarClose = () => {
        setErrorMessage('');
    };

    const isPopoverOpen = Boolean(popoverAnchor);

    // Determine the cell's availability status
    const cellAvailability = workerAvailability[dayIndex] || [];

    const hasAvailable = cellAvailability.some((a) => a.status === 'Available');
    const hasPartiallyAvailable = cellAvailability.some(
        (a) => a.status === 'Partially Available'
    );
    const isUnavailable = !hasAvailable && !hasPartiallyAvailable;

    // Determine the background color based on drag state and availability
    let backgroundColor = 'white'; // Default background

    if (isOver) {
        if (canDrop) {
            if (hasAvailable && !hasPartiallyAvailable) {
                backgroundColor = '#E0F8E0'; // Green for Available
            } else if (hasPartiallyAvailable && !hasAvailable) {
                backgroundColor = '#FFF9C4'; // Yellow for Partially Available
            } else if (hasAvailable && hasPartiallyAvailable) {
                backgroundColor = '#C5E1A5'; // Light Green for mixed availability
            }
        } else {
            backgroundColor = '#FFE4E2'; // Red for Unavailable or cannot drop
        }
    }

    // Helper function to parse time strings to Date objects
    function parseTimeStringToDate(timeString, date) {
        const [time, modifier] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        const parsedDate = new Date(date);
        parsedDate.setHours(hours, minutes, 0, 0);
        return parsedDate;
    }

    // Helper function to check if shift is within any availability period
    const isShiftWithinAvailability = (shiftStart, shiftEnd, availabilityPeriods) => {
        for (const period of availabilityPeriods) {
            if (period.status === 'Available') {
                // If the worker is fully available, any shift is acceptable
                return true;
            } else if (period.status === 'Partially Available') {
                const [startTime, endTime] = period.availability.split(' - ');
                const periodStart = parseTimeStringToDate(startTime, shiftStart);
                const periodEnd = parseTimeStringToDate(endTime, shiftEnd);

                // Check if the entire shift is within this availability period
                if (
                    isWithinInterval(shiftStart, {start: periodStart, end: periodEnd}) &&
                    isWithinInterval(shiftEnd, {start: periodStart, end: periodEnd})
                ) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleDrop = (item, targetWorkerId, date) => {
        console.log('Drop detected:', item, targetWorkerId, date);
        let sourceShift = null;
        let sourceWorkerId = null;
        const shiftDataCopy = {...shiftData};
        // Identify the source of the shift
        if (item.source === 'worker' || item.source === 'popover') {
            // Shifts dragged from a worker's cell or popover
            const shiftDataCopy = {...shiftData};
            for (const workerKey in shiftDataCopy) {
                const workerShifts = shiftDataCopy[workerKey];
                const shiftIndex = workerShifts.findIndex(
                    (shift) => shift.ShiftID === item.id
                );
                if (shiftIndex !== -1) {
                    sourceShift = {...workerShifts[shiftIndex]};
                    workerShifts.splice(shiftIndex, 1);
                    sourceWorkerId = workerKey;
                    break;
                }
            }
            if (!sourceShift) {
                console.error(`Source shift not found in shiftData for item ID: ${item.id}`);
                return;
            }
        } else if (item.source === 'openShifts') {
            // Shifts dragged from the unallocated area
            const index = openShifts.findIndex(
                (shift) => shift.ShiftID === item.id
            );
            if (index !== -1) {
                sourceShift = {...openShifts[index]};
                const newOpenShifts = [...openShifts];
                newOpenShifts.splice(index, 1);
                setOpenShifts(newOpenShifts);
            } else {
                console.error(`Source shift not found in openShifts for item ID: ${item.id}`);
                return;
            }
        }

        if (!sourceShift) {
            console.error(`Source shift not found for item ID: ${item.id}`);
            return;
        }

        // If target is 'openShifts', unassign the shift
        if (targetWorkerId === 'openShifts') {
            // Calculate shift duration
            const shiftDuration = new Date(sourceShift.ShiftEnd) - new Date(sourceShift.ShiftStart);

            // Set new ShiftStart based on drop date, preserving the original time
            const originalStart = new Date(sourceShift.ShiftStart);
            const newStart = new Date(date);
            newStart.setHours(
                originalStart.getHours(),
                originalStart.getMinutes(),
                originalStart.getSeconds(),
                0
            );
            const newEnd = new Date(newStart.getTime() + shiftDuration);

            // Update shift's SupportWorker1 to 'UNALLOCATED' and adjust dates
            const updatedShift = {
                ...sourceShift,
                SupportWorker1: 'UNALLOCATED',
                ShiftStart: newStart.toISOString(),
                ShiftEnd: newEnd.toISOString(),
                Status: 'D', // Mark as Draft
                Version: (sourceShift.Version || 0) + 1,
            };

            // Add to openShifts
            setOpenShifts((prevOpenShifts) => [...prevOpenShifts, updatedShift]);

            // Update draft shifts
            setDraftShifts((prevDraftShifts) => [
                ...prevDraftShifts.filter(
                    (shift) => shift.ShiftID !== updatedShift.ShiftID
                ),
                updatedShift,
            ]);

            // Enable draft saving
            setIsDraftEnabled(true);

            // Update schedule
            handleShiftsChanged();

            // Close the popover if the shift was dragged from popover
            if (item.source === 'popover') {
                handlePopoverClose();
            }

            return;
        }

        // Handle assigning to a worker
        // Update shift's start and end times based on drop date
        const shiftDuration = new Date(sourceShift.ShiftEnd) - new Date(sourceShift.ShiftStart);
        const newStart = new Date(date);
        newStart.setHours(
            new Date(sourceShift.ShiftStart).getHours(),
            new Date(sourceShift.ShiftStart).getMinutes(),
            new Date(sourceShift.ShiftStart).getSeconds(),
            0
        );
        const newEnd = new Date(newStart.getTime() + shiftDuration);

        // Check if the new shift falls within worker's availability
        const availabilityForDay = workerAvailability[dayIndex] || [];
        const isWithinAvailability = isShiftWithinAvailability(
            newStart,
            newEnd,
            availabilityForDay
        );

        if (!isWithinAvailability) {
            setErrorMessage('Worker is not available for the selected shift time.');
            // Re-add the shift back to its original source
            if (item.source === 'worker' || item.source === 'popover') {
                const prevWorkerId = sourceShift.SupportWorker1;
                if (!shiftDataCopy[prevWorkerId]) {
                    shiftDataCopy[prevWorkerId] = [];
                }
                shiftDataCopy[prevWorkerId].push(sourceShift);
            } else if (item.source === 'openShifts') {
                setOpenShifts((prevOpenShifts) => [...prevOpenShifts, sourceShift]);
            }
            return;
        }

        // Check for overlapping with existing shifts in the target cell

        const targetWorkerShifts = shiftDataCopy[workerId] || [];
        const hasOverlap = targetWorkerShifts.some((shift) => {
            const existingStart = new Date(shift.ShiftStart);
            const existingEnd = new Date(shift.ShiftEnd);
            return doIntervalsOverlap(newStart, newEnd, existingStart, existingEnd);
        });

        if (hasOverlap) {
            setErrorMessage('Shift overlaps with an existing shift.');
            // Re-add the shift back to its original source
            if (item.source === 'worker' || item.source === 'popover') {
                const prevWorkerId = sourceShift.SupportWorker1;
                if (!shiftDataCopy[prevWorkerId]) {
                    shiftDataCopy[prevWorkerId] = [];
                }
                shiftDataCopy[prevWorkerId].push(sourceShift);
            } else if (item.source === 'openShifts') {
                setOpenShifts((prevOpenShifts) => [...prevOpenShifts, sourceShift]);
            }
            return;
        }

        // Update the shift with new details
        sourceShift.SupportWorker1 = workerId;
        sourceShift.ShiftStart = newStart.toISOString();
        sourceShift.ShiftEnd = newEnd.toISOString();

        // Increment version number and mark as draft
        sourceShift.Version = (sourceShift.Version || 0) + 1;
        sourceShift.Status = 'D';

        // Add the updated shift to the new worker's shift list
        if (!shiftDataCopy[workerId]) {
            shiftDataCopy[workerId] = [];
        }
        shiftDataCopy[workerId].push(sourceShift);

        // Update shiftData state
        setShiftData(shiftDataCopy);

        // Update draft shifts to include the new version of the shift
        setDraftShifts((prevDraftShifts) => [
            ...prevDraftShifts.filter(
                (shift) => shift.ShiftID !== sourceShift.ShiftID
            ),
            sourceShift,
        ]);

        // Enable draft saving
        setIsDraftEnabled(true);

        // Update schedule
        handleShiftsChanged();

        // Close the popover if the shift was dragged from popover
        if (item.source === 'popover') {
            handlePopoverClose();
        }


    };

    // Define shiftsArray
    const shiftsArray = React.Children.toArray(children).sort((a, b) => {
        const aStart = new Date(a.props.shift.ShiftStart);
        const bStart = new Date(b.props.shift.ShiftStart);
        return aStart - bStart;
    });

    const shiftsInCell = shiftsArray.length;

    // Detect overlapping shifts only if not in openShifts
    const overlaps = workerId !== 'openShifts' ? checkForOverlaps(shiftsArray) : [];

    return (
        <div
            ref={drop}
            className={styles.schedulerCell}
            style={{
                backgroundColor,
                position: 'relative',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <div>
                {shiftsArray.slice(0, 2).map((child) => (
                    React.cloneElement(child, {key: child.props.shift.ShiftID}) // Use ShiftID as key
                ))}
            </div>
            {shiftsInCell > 2 && (
                <div
                    className={styles.moreShiftsIndicator}
                    onClick={handlePopoverOpen}
                >
                    +{shiftsInCell - 2} more
                </div>
            )}

            {/* Warning Indicator for Overlapping Shifts */}
            {workerId !== 'openShifts' && overlaps.length > 0 && (
                <Tooltip
                    title={`There are ${overlaps.length} overlapping shifts.`}
                    arrow
                >
                    <WarningIcon
                        color="error"
                        className={styles.warningIcon}
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            cursor: 'pointer',
                        }}
                    />
                </Tooltip>
            )}

            {/* Popover for showing all shifts when there are more than 2 */}
            <Popover
                open={isPopoverOpen}
                anchorEl={popoverAnchor}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                disablePortal
            >
                <div className={styles.popoverContent}>
                    {cellAvailability.map((availability, index) => {
                        if (availability.status === 'Partially Available') {
                            return (
                                <div key={index} className={styles.availabilityPeriod}>
                                    <strong>Available:</strong> {availability.availability}
                                </div>
                            );
                        }
                        return null;
                    })}
                    {shiftsArray.map((child) =>
                        React.cloneElement(child, {
                            key: child.props.shift.ShiftID, // Use ShiftID as key
                            source: 'popover', // Explicitly set source to 'popover'
                            onDragStartFromPopover: handlePopoverClose, // Pass the callback to close popover after drag starts
                        })
                    )}
                </div>
            </Popover>

            {/* Snackbar for displaying error messages */}
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="error"
                    sx={{width: '100%'}}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </div>
    );

    // Utility function to check for overlaps within the cell
    function checkForOverlaps(shifts) {
        const overlaps = [];
        for (let i = 0; i < shifts.length; i++) {
            for (let j = i + 1; j < shifts.length; j++) {
                const shiftA = shifts[i].props.shift;
                const shiftB = shifts[j].props.shift;
                const startA = new Date(shiftA.ShiftStart);
                const endA = new Date(shiftA.ShiftEnd);
                const startB = new Date(shiftB.ShiftStart);
                const endB = new Date(shiftB.ShiftEnd);

                if (doIntervalsOverlap(startA, endA, startB, endB)) {
                    overlaps.push([shiftA, shiftB]);
                }
            }
        }
        return overlaps;
    }
};

export default DroppableCell;
