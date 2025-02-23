// PendingApprovalCalendar.jsx

import React, {useContext, useEffect, useState} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import styles from "@/styles/scheduler.module.css";
import {Building2, Calendar, CheckCircle2, Clock, FileText, User, XCircle,} from "lucide-react";

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Popover,
    Snackbar,
} from "@mui/material";
import {Cancel, CheckCircle,} from "@mui/icons-material";
import ShiftApprovalTableBasic from "./ShiftApprovalTableBasic";
import MButton from "./MaterialButton";
import ColorContext from "@/contexts/ColorContext";
import CloseIcon from "@mui/icons-material/Close";

const PendingApprovalCalendar = () => {
    const [draftShifts, setDraftShifts] = useState([]);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedShifts, setSelectedShifts] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentShift, setCurrentShift] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogAction, setConfirmDialogAction] = useState(null);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);

    // State variable for the button text
    const [pendingApprovalButtonText, setPendingApprovalButtonText] =
        useState("Pending Approval");

    // State variables for Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        fetchPendingApprovalShifts();
        fetchUserRoles(
            "m_roster_approval",
            "Maintenance_Roster_Approval",
            setDisableSection
        );
    }, []);

    const calendarStyles = {
        ".fc": {
            "--fc-border-color": "rgba(229, 231, 235, 0.3)",
            "--fc-button-text-color": "#fff",
            "--fc-today-bg-color": "rgba(139, 92, 246, 0.1)",
            "--fc-page-bg-color": "transparent",
            fontFamily: "inherit",
        },

        ".fc .fc-button": {
            border: "none",
            padding: "0.625rem 1rem",
            borderRadius: "0.75rem",
            fontWeight: "500",
            fontSize: "0.875rem",
            transition: "all 0.2s",
        },

        ".fc .fc-button-primary": {
            backgroundColor: "rgb(139, 92, 246)",
            boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)",
        },

        ".fc .fc-button-primary:hover": {
            backgroundColor: "rgb(124, 58, 237)",
            transform: "translateY(-1px)",
        },

        ".fc .fc-button-active": {
            backgroundColor: "rgb(109, 40, 217) !important",
        },

        ".fc .fc-toolbar-title": {
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "rgb(17, 24, 39)",
        },

        ".fc-event": {
            borderRadius: "0.5rem",
            padding: "0.25rem",
            border: "none",
            backgroundColor: "rgb(139, 92, 246)",
            color: "#fff",
            boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)",
        },

        ".fc th": {
            padding: "1rem",
            fontWeight: "600",
            color: "rgb(107, 114, 128)",
            borderColor: "rgba(229, 231, 235, 0.3)",
        },

        ".fc td": {
            borderColor: "rgba(229, 231, 235, 0.3)",
        },

        ".fc .fc-day-today": {
            backgroundColor: "rgba(139, 92, 246, 0.1) !important",
        },
    };

    const fetchPendingApprovalShifts = async () => {
        try {
            const data = await fetchData("/api/getPendingApprovalShifts");
            if (data && data.success) {
                const formattedEvents = data.data.map((shift) => ({
                    title: `${shift.WorkerFirstName} ${shift.WorkerLastName}`,
                    start: shift.ShiftStart,
                    end: shift.ShiftEnd,
                    extendedProps: {
                        serviceDescription: shift.ServiceDescription, // Include ServiceDescription
                        rosterID: shift.RosterID,
                        clientID: shift.ClientID,
                        clientName: `${shift.ClientFirstName} ${shift.ClientLastName}`,
                        workerFullName: `${shift.WorkerFirstName} ${shift.WorkerLastName}`,
                        shiftID: shift.ShiftID,
                    },
                    classNames: [getShiftClassName(shift.ShiftStart, shift.ShiftEnd)],
                }));

                setEvents(formattedEvents);
                setDraftShifts(data.data);
            } else {
                console.error("Data format is incorrect:", data);
            }
        } catch (error) {
            console.error("Error fetching pending approval shifts:", error);
        }
    };

    // Update the button text when draftShifts changes
    useEffect(() => {
        setPendingApprovalButtonText(
            `Pending Approval${
                draftShifts.length > 0 ? " (" + draftShifts.length + ")" : ""
            }`
        );
    }, [draftShifts]);

    const handleShiftAction = async (action, shiftIDs) => {
        if (!shiftIDs || shiftIDs.length === 0) {
            console.error("No Shift IDs are defined.");
            return;
        }

        try {
            const url =
                action === "approve" ? "/api/approveShift" : "/api/bulkRejectShifts";
            const response = await postData(url, {
                shifts: shiftIDs.map((id) => ({ShiftID: id})),
            });
            if (response && response.success) {
                console.log(response);
                console.log(`Shifts ${shiftIDs.join(", ")} ${action}d successfully.`);
                //   sendNotification(response.insertRowId);
                setAnchorEl(null);
                fetchPendingApprovalShifts();

                // Set the snackbar message and open it with appropriate severity
                const message =
                    action === "approve"
                        ? "Shifts approved successfully."
                        : "Shifts rejected successfully.";
                const severity = action === "approve" ? "success" : "error";
                setSnackbarMessage(message);
                setSnackbarSeverity(severity);
                setSnackbarOpen(true);
            } else {
                console.error(`Failed to ${action} shifts ${shiftIDs.join(", ")}.`);

                // Set the snackbar message and open it as an error
                const message = `Failed to ${action} shifts.`;
                setSnackbarMessage(message);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error(`Error ${action}ing shifts ${shiftIDs.join(", ")}:`, error);

            // Set the snackbar message and open it as an error
            const message = `Error ${action}ing shifts.`;
            setSnackbarMessage(message);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const sendNotification = (id) => {
        const data = {
            rowId: id,
            action: "approve-reject",
            to: "wk-cl-tl-rm",
        };

        console.log(data);
        postData("/api/sendShiftNotification", data)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleApprove = (shiftIDs) =>
        handleShiftAction(
            "approve",
            Array.isArray(shiftIDs) ? shiftIDs : [shiftIDs]
        );
    const handleReject = (shiftIDs) =>
        handleShiftAction(
            "reject",
            Array.isArray(shiftIDs) ? shiftIDs : [shiftIDs]
        );

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleEventClick = (clickInfo) => {
        console.log("Event clicked:", clickInfo.event);
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
        if (!date) return "";
        const options = {hour: "numeric", minute: "2-digit", hour12: true};
        return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    };

    const formatDate = (date) => {
        if (!date) return "";
        const options = {month: "short", day: "numeric", year: "numeric"};
        return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    };

    const openConfirmDialog = (action) => {
        setConfirmDialogAction(action);
        setConfirmDialogOpen(true);
    };

    const closeConfirmDialog = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmAction = () => {
        if (confirmDialogAction === "approve") {
            if (selectedShifts.length > 0) {
                handleApprove(selectedShifts);
            } else {
                handleApprove(currentShift.shiftID);
            }
        } else if (confirmDialogAction === "reject") {
            if (selectedShifts.length > 0) {
                handleReject(selectedShifts);
            } else {
                handleReject(currentShift.shiftID);
            }
        }
        closeConfirmDialog();
    };

    // Handle Snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <div className="min-h-screen gradient-background pt-24">
            <FullCalendar
                className={calendarStyles}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                headerToolbar={{
                    left: "prev,next today,pendingApprovalButton",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                customButtons={{
                    pendingApprovalButton: {
                        text: pendingApprovalButtonText,
                        click: openModal,
                        // Add the custom class to apply the icon via :global in CSS Modules
                        classNames: ["pendingApprovalButton"],
                    },
                }}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                }}
                buttonText={{
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
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

            {/* Dialog for Pending Approval Shifts */}
            <Dialog
                open={isModalOpen}
                onClose={closeModal}
                maxWidth="lg"
                fullWidth
                scroll="paper"
                className={styles.minimalDialog}
            >
                <DialogTitle className={styles.minimalDialogTitle}>


                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openConfirmDialog("approve")}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-4 w-4"/>
                            <span>Approve Selected</span>
                        </button>

                        <button
                            onClick={() => openConfirmDialog("reject")}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <XCircle className="h-4 w-4"/>
                            <span>Reject Selected</span>
                        </button>
                    </div>
                    <div className={styles.minimalDialogTitleText}>
                        Shifts Pending For Approval
                    </div>
                </DialogTitle>
                <DialogContent className={styles.minimalDialogContent} dividers={true}>
                    <ShiftApprovalTableBasic
                        draftShifts={draftShifts}
                        onApprove={handleApprove}
                        disable={disableSection}
                        onReject={handleReject}
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
                        startIcon={
                            <CloseIcon style={{marginRight: "-6px", fontSize: "16px"}}/>
                        }
                    />
                </DialogActions>
            </Dialog>

            {/* Popover for Shift Details */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                {currentShift && (
                    // <div className="fixed z-50">
                    // <div className="fixed inset-0" onClick={handleClosePopover} />

                    <div>
                        <div className="max-w-md glass rounded-md ">
                            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-purple-500"/>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            Shift Details
                                        </h3>
                                    </div>
                                    <div
                                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                        Pending Approval
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                                {/* IDs Section */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <FileText className="h-4 w-4"/>
                                        <span>
                      Roster ID: {currentShift?.extendedProps.rosterID}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Building2 className="h-4 w-4"/>
                                        <span>
                      Client ID: {currentShift?.extendedProps.clientID}
                    </span>
                                    </div>
                                </div>

                                {/* Worker Info */}
                                <div
                                    className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-purple-500"/>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {currentShift?.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Worker
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Time & Service */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="h-4 w-4 text-purple-500"/>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Time
                      </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatTime(currentShift.start)} -{" "}
                                            {formatTime(currentShift.end)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {formatDate(currentShift.start)}
                                        </p>
                                    </div>

                                    <div
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText className="h-4 w-4 text-purple-500"/>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Service
                      </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentShift.extendedProps.serviceDescription}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => openConfirmDialog("approve")}
                                        disabled={disableSection}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="h-4 w-4"/>
                                        <span>Approve</span>
                                    </button>

                                    <button
                                        onClick={() => openConfirmDialog("reject")}
                                        disabled={disableSection}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        <XCircle className="h-4 w-4"/>
                                        <span>Reject</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* {currentShift && (
          <div style={{ padding: '15px', maxWidth: '350px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Event fontSize="small" style={{ marginRight: '8px' }} />
              <Typography variant="body2" color="textSecondary">
                {currentShift.extendedProps.rosterID} | Client ID: {currentShift.extendedProps.clientID}
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Person fontSize="small" style={{ marginRight: '8px' }} />
              <Typography variant="body2" color="textSecondary">
                {currentShift.title}
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <AccessTime fontSize="small" style={{ marginRight: '8px' }} />
              <Typography variant="body2" color="textSecondary">
                {formatTime(currentShift.start)} - {formatTime(currentShift.end)} |{' '}
                {formatDate(currentShift.start)}
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Assignment fontSize="small" style={{ marginRight: '8px' }} />
              <Typography variant="body2" color="textSecondary">
                {currentShift.extendedProps.serviceDescription}
              </Typography>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button
                style={{ backgroundColor: "blue" }}
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
        )} */}
            </Popover>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={closeConfirmDialog}
                className={styles.customConfirmDialog}
            >
                <DialogTitle className={styles.customConfirmDialogTitle}>
                    {confirmDialogAction === "approve" ? (
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
                        Are you sure you want to{" "}
                        {confirmDialogAction === "approve" ? "approve" : "reject"} this
                        shift?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeConfirmDialog}
                        color="primary"
                        style={{backgroundColor: "yellow", color: "#fff"}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        color="primary"
                        style={{backgroundColor: "blue", color: "#fff"}}
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for feedback messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{width: "100%"}}
                    elevation={6}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PendingApprovalCalendar;
