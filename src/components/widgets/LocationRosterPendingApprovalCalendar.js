import React, {useContext, useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {fetchData, fetchUserRoles, postData} from '@/utility/api_utility';
import styles from '@/styles/scheduler.module.css';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Popover,
    Typography,
} from '@mui/material';
import {AccessTime, Assignment, Cancel, CheckCircle, Event,} from '@mui/icons-material';
import ShiftApprovalTable from './ShiftApprovalTable';
import MButton from './MaterialButton';
import ColorContext from '@/contexts/ColorContext';
import CheckIcon from '@mui/icons-material/Check';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CloseIcon from '@mui/icons-material/Close';

const LocationRosterPendingApprovalCalendar = () => {
    const [draftShifts, setDraftShifts] = useState([]);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedShifts, setSelectedShifts] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentShift, setCurrentShift] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogAction, setConfirmDialogAction] = useState(null);
    const [disableSection, setDisableSection] = useState(false);
    const [pendingApprovalButtonText, setPendingApprovalButtonText] = useState('Pending Approval');
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        fetchPendingApprovalShifts();
        fetchUserRoles("m_location_roster_approval", "Maintenance_Location_Roster_Approval", setDisableSection);
    }, []);

    // Update the button text when draftShifts changes
    useEffect(() => {
        setPendingApprovalButtonText(
            `Pending Approval${draftShifts.length > 0 ? ' (' + draftShifts.length + ')' : ''}`
        );
    }, [draftShifts]);

    const fetchPendingApprovalShifts = async () => {
        try {
            const data = await fetchData('/api/getLocRosterPendingApprovalShiftMainData');
            if (data && data.success) {
                const formattedEvents = data.data.map((shift) => ({
                    title: shift.ServiceDescription,
                    start: shift.ShiftStart,
                    end: shift.ShiftEnd,
                    extendedProps: {
                        serviceDescription: shift.ServiceDescription,
                        shiftID: shift.ShiftID,
                        locationID: shift.LocationId,
                        locationName: shift.LocationDescription,
                        timezone: shift.LocationTimezone,
                        shiftDate: shift.ShiftDate,
                    },
                    classNames: [getShiftClassName(shift.ShiftStart, shift.ShiftEnd)],
                }));

                setEvents(formattedEvents);
                setDraftShifts(data.data);
            } else {
                console.error('Data format is incorrect:', data);
            }
        } catch (error) {
            console.error('Error fetching pending approval shifts:', error);
        }
    };

    const handleShiftAction = async (action, shiftIDs) => {
        if (!shiftIDs || shiftIDs.length === 0) {
            console.error('No Shift IDs are defined.');
            return;
        }

        console.log(`Attempting to ${action} shifts ${shiftIDs.join(', ')}.`);

        try {
            const url =
                action === 'approve'
                    ? '/api/approveLocRosterShiftMainData'
                    : '/api/rejectLocRosterShiftMainData';
            const response = await postData(url, {
                shifts: shiftIDs.map((id) => ({ShiftID: id})),
            });
            if (response && response.success) {
                console.log(`Shifts ${shiftIDs.join(', ')} ${action}d successfully.`);
                setAnchorEl(null);
                fetchPendingApprovalShifts();
            } else {
                console.error(`Failed to ${action} shifts ${shiftIDs.join(', ')}.`);
            }
        } catch (error) {
            console.error(`Error ${action}ing shifts ${shiftIDs.join(', ')}:`, error);
        } finally {
            setSelectedShifts([]);
        }
    };

    const handleApprove = (shiftIDs) =>
        handleShiftAction(
            'approve',
            Array.isArray(shiftIDs) ? shiftIDs : [shiftIDs]
        );
    const handleReject = (shiftIDs) =>
        handleShiftAction(
            'reject',
            Array.isArray(shiftIDs) ? shiftIDs : [shiftIDs]
        );

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleEventClick = (clickInfo) => {
        setCurrentShift({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            extendedProps: clickInfo.event.extendedProps,
            shiftID: clickInfo.event.extendedProps.shiftID,
        });
        setAnchorEl(clickInfo.el);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setCurrentShift(null);
    };

    const getShiftClassName = (start, end) => {
        const now = new Date();
        if (new Date(end) < now) {
            return styles.minimalShiftPast;
        } else if (new Date(start) <= now && new Date(end) >= now) {
            return styles.minimalShiftPresent;
        } else {
            return styles.minimalShiftFuture;
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        const options = {hour: 'numeric', minute: '2-digit', hour12: true};
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };

    const formatDate = (date) => {
        if (!date) return '';
        const options = {month: 'short', day: 'numeric', year: 'numeric'};
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };

    const openConfirmDialog = (action) => {
        setConfirmDialogAction(action);
        setConfirmDialogOpen(true);
    };

    const closeConfirmDialog = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmAction = () => {
        if (confirmDialogAction === 'approve') {
            if (selectedShifts.length > 0) {
                handleApprove(selectedShifts);
            } else {
                handleApprove(currentShift.shiftID);
            }
        } else if (confirmDialogAction === 'reject') {
            if (selectedShifts.length > 0) {
                handleReject(selectedShifts);
            } else {
                handleReject(currentShift.shiftID);
            }
        }
        closeConfirmDialog();
    };

    return (
        <div className={styles.minimalCalendarContainer}>
            <FullCalendar
                className={styles.minimalCalendar}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                headerToolbar={{
                    left: 'prev,next today,pendingApprovalButton',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                customButtons={{
                    pendingApprovalButton: {
                        text: pendingApprovalButtonText, // Use the state variable here
                        click: openModal,
                        className: styles.minimalButton,
                    },
                }}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                }}
                buttonText={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                }}
                eventClick={handleEventClick}
                eventContent={(arg) => (
                    <div className={`${styles.fcEventContent} ${arg.event.classNames}`}>
                        <div className={styles.fcEventTitle}>{arg.event.title}</div>
                        <div className={styles.fcEventTime}>
                            {formatTime(arg.event.start)} - {formatTime(arg.event.end)}
                        </div>
                    </div>
                )}
            />

            <Dialog
                open={isModalOpen}
                onClose={closeModal}
                maxWidth="lg"
                fullWidth
                scroll="paper"
                className={styles.minimalDialog}
            >
                <DialogTitle className={styles.minimalDialogTitle}>
                    <div className={styles.minimalButtonGroup}>
                        <MButton
                            label="Approve"
                            className={styles.approveButton} // Use the CSS class
                            disabled={disableSection}
                            onClick={() => openConfirmDialog('approve')}
                            size="small"
                            style={{backgroundColor: "blue", color: "white"}}
                            startIcon={
                                <CheckIcon
                                    style={{marginRight: '-6px', fontSize: '16px', alignItems: 'center'}}
                                />
                            }
                        />
                        <MButton
                            label="Reject"
                            className={styles.rejectButton} // Use the CSS class
                            disabled={disableSection}
                            onClick={() => openConfirmDialog('reject')}
                            style={{backgroundColor: "red", color: "white"}}
                            size="small"
                            startIcon={
                                <NotInterestedIcon
                                    style={{marginRight: '-3px', fontSize: '16px', alignItems: 'center'}}
                                />
                            }
                        />
                    </div>
                    <div className={styles.minimalDialogTitleText}>Shifts Pending For Approval</div>
                </DialogTitle>
                <DialogContent
                    className={styles.minimalDialogContent}
                    dividers={true}
                >
                    <ShiftApprovalTable
                        draftShifts={draftShifts}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        disable={disableSection}
                        onSelectChange={setSelectedShifts}
                    />
                </DialogContent>
                <DialogActions className={styles.minimalDialogActions}>
                    <MButton
                        label="Close"
                        className={styles.closeButton}
                        onClick={closeModal}
                        size="small"
                        style={{backgroundColor: "red", color: "white"}}
                        startIcon={<CloseIcon style={{marginRight: '-6px', fontSize: '16px'}}/>}
                    />
                </DialogActions>
            </Dialog>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {currentShift && (
                    <div style={{padding: '15px', maxWidth: '350px'}}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <Event fontSize="small" style={{marginRight: '8px'}}/>
                            <Typography variant="body2" color="textSecondary">
                                Shift ID: {currentShift.extendedProps.shiftID} | Location ID:{' '}
                                {currentShift.extendedProps.locationID}
                            </Typography>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <Assignment fontSize="small" style={{marginRight: '8px'}}/>
                            <Typography variant="body2" color="textSecondary">
                                {currentShift.extendedProps.serviceDescription}
                            </Typography>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <AccessTime fontSize="small" style={{marginRight: '8px'}}/>
                            <Typography variant="body2" color="textSecondary">
                                {formatTime(currentShift.start)} - {formatTime(currentShift.end)}{' '}
                                | {formatDate(currentShift.start)}
                            </Typography>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '10px',
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={disableSection}
                                onClick={() => openConfirmDialog('approve')}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                disabled={disableSection}
                                onClick={() => openConfirmDialog('reject')}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </Popover>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={closeConfirmDialog}
                className={styles.customConfirmDialog}
            >
                <DialogTitle className={styles.customConfirmDialogTitle}>
                    {confirmDialogAction === 'approve' ? (
                        <>
                            <CheckCircle className={styles.confirmIcon}/>
                            Approve Shift
                        </>
                    ) : (
                        <>
                            <Cancel
                                className={`${styles.confirmIcon} ${styles.rejectIcon}`}
                            />
                            Reject Shift
                        </>
                    )}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to{' '}
                        {confirmDialogAction === 'approve' ? 'approve' : 'reject'} this
                        shift?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog} color="primary"
                            style={{backgroundColor: "yellow", color: "#fff"}}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmAction} color="primary"
                            style={{backgroundColor: "blue", color: "#fff"}} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LocationRosterPendingApprovalCalendar;
