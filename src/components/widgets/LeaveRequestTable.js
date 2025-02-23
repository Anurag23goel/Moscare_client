import React, {useEffect, useState} from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    Tooltip,
} from '@mui/material';
import {Cancel, CheckCircle} from '@mui/icons-material';
import {fetchData, putData} from '@/utility/api_utility'; // Ensure these are defined in your project
import styles from '@/styles/scheduler.module.css'; // Adjust or remove if not using CSS modules

const LeaveRequestTable = () => {
    // State variables
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('FromDate');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogRequestID, setConfirmDialogRequestID] = useState(null);
    const [confirmDialogAction, setConfirmDialogAction] = useState(null);

    // Use color context for button colors (optional)
    // const {colors} = useContext(ColorContext);

    // Fetch leave requests when the component mounts
    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            const data = await fetchData('/api/getWorkerLeaveRequest');
            if (data && data.success) {
                // Assumes your API returns an array of leave requests in data.data
                setLeaveRequests(data.data);
            } else {
                console.error('Data format is incorrect:', data);
            }
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        }
    };

    // --- Sorting Logic ---
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedLeaveRequests = leaveRequests.slice().sort((a, b) => {
        // If sorting by dates
        if (orderBy === 'FromDate' || orderBy === 'ToDate') {
            return order === 'asc'
                ? new Date(a[orderBy]) - new Date(b[orderBy])
                : new Date(b[orderBy]) - new Date(a[orderBy]);
        }
        // Special handling for worker name (combining first and last name)
        else if (orderBy === 'Worker') {
            const workerA = `${a.WorkerFirstName || ''} ${a.WorkerLastName || ''}`;
            const workerB = `${b.WorkerFirstName || ''} ${b.WorkerLastName || ''}`;
            return order === 'asc'
                ? workerA.localeCompare(workerB)
                : workerB.localeCompare(workerA);
        }
        // Fallback for strings and numbers
        else if (typeof a[orderBy] === 'string') {
            return order === 'asc'
                ? a[orderBy].localeCompare(b[orderBy])
                : b[orderBy].localeCompare(a[orderBy]);
        } else {
            return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
        }
    });

    // --- Selection Logic ---
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = leaveRequests.map((req) => req.LeaveRequestID);
            setSelectedRequests(newSelecteds);
            return;
        }
        setSelectedRequests([]);
    };

    const handleSelectClick = (RequestID) => {
        const selectedIndex = selectedRequests.indexOf(RequestID);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedRequests, RequestID);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedRequests.slice(1));
        } else if (selectedIndex === selectedRequests.length - 1) {
            newSelected = newSelected.concat(selectedRequests.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedRequests.slice(0, selectedIndex),
                selectedRequests.slice(selectedIndex + 1)
            );
        }
        setSelectedRequests(newSelected);
    };

    const isSelected = (RequestID) => selectedRequests.indexOf(RequestID) !== -1;

    // --- Approve/Reject Logic with Confirmation Dialog ---
    const handleApproveClick = (RequestID) => {
        console.log("Leave ID being approved:", RequestID); // Debugging
        setConfirmDialogAction('approve');
        setConfirmDialogRequestID(RequestID);
        setConfirmDialogOpen(true);
    };


    const handleRejectClick = (RequestID) => {
        setConfirmDialogAction('reject');
        setConfirmDialogRequestID(RequestID);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
        setConfirmDialogRequestID(null);
        setConfirmDialogAction(null);
    };

    const handleConfirmDialogConfirm = async () => {
        if (confirmDialogAction === 'approve') {
            await handleApproveLeave(confirmDialogRequestID);
        } else if (confirmDialogAction === 'reject') {
            await handleRejectLeave(confirmDialogRequestID);
        }
        handleConfirmDialogClose();
    };

    const handleApproveLeave = async (RequestID) => {
        try {
            // Call your API endpoint to approve the leave request
            const response = await putData(`/api/approveWorkerLeaveRequest/${RequestID}`, {RequestID});
            if (response && response.success) {
                console.log(`Approved leave request ${RequestID}`);
                // Optionally refresh the list
                fetchLeaveRequests();
            } else {
                console.error('Failed to approve leave request:', response);
            }
        } catch (error) {
            console.error('Error approving leave request:', error);
        }
    };

    const handleRejectLeave = async (RequestID) => {
        try {
            // Call your API endpoint to reject the leave request
            const response = await putData(`/api/rejectWorkerLeaveRequest/${RequestID}`, {RequestID});
            if (response && response.success) {
                console.log(`Rejected leave request ${RequestID}`);
                // Optionally refresh the list
                fetchLeaveRequests();
            } else {
                console.error('Failed to reject leave request:', response);
            }
        } catch (error) {
            console.error('Error rejecting leave request:', error);
        }
    };

    // --- Helper to Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div style={{padding: '20px'}}>
            <h2>Leave Requests</h2>
            <Table className={styles.table}>
                <TableHead>
                    <TableRow>
                        {/* Selection Checkbox */}
                        <TableCell padding="checkbox" className={styles.tableHeader}>
                            <Checkbox
                                indeterminate={
                                    selectedRequests.length > 0 &&
                                    selectedRequests.length < leaveRequests.length
                                }
                                checked={
                                    leaveRequests.length > 0 &&
                                    selectedRequests.length === leaveRequests.length
                                }
                                onChange={handleSelectAllClick}
                            />
                        </TableCell>
                        {/* ID Column */}
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'LeaveRequestID'}
                                direction={orderBy === 'LeaveRequestID' ? order : 'asc'}
                                onClick={() => handleRequestSort('LeaveRequestID')}
                            >
                                ID
                            </TableSortLabel>
                        </TableCell>
                        {/* Worker Column */}
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'Worker'}
                                direction={orderBy === 'Worker' ? order : 'asc'}
                                onClick={() => handleRequestSort('Worker')}
                            >
                                Worker
                            </TableSortLabel>
                        </TableCell>
                        {/* Leave Type Column */}
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'LeaveTypeCode'}
                                direction={orderBy === 'LeaveTypeCode' ? order : 'asc'}
                                onClick={() => handleRequestSort('LeaveTypeCode')}
                            >
                                Leave Type
                            </TableSortLabel>
                        </TableCell>
                        {/* From Date Column */}
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'FromDate'}
                                direction={orderBy === 'FromDate' ? order : 'asc'}
                                onClick={() => handleRequestSort('FromDate')}
                            >
                                From Date
                            </TableSortLabel>
                        </TableCell>
                        {/* To Date Column */}
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'ToDate'}
                                direction={orderBy === 'ToDate' ? order : 'asc'}
                                onClick={() => handleRequestSort('ToDate')}
                            >
                                To Date
                            </TableSortLabel>
                        </TableCell>
                        {/* Remarks Column */}
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'Remarks'}
                                direction={orderBy === 'Remarks' ? order : 'asc'}
                                onClick={() => handleRequestSort('Remarks')}
                            >
                                Remarks
                            </TableSortLabel>
                        </TableCell>
                        {/* Approve/Reject Column */}
                        <TableCell align="center" className={styles.tableHeader}>
                            Approve/Reject
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedLeaveRequests.length > 0 ? (
                        sortedLeaveRequests.map((request) => {
                            const isItemSelected = isSelected(request.LeaveRequestID);
                            const workerName =
                                request.WorkerFirstName && request.WorkerLastName
                                    ? `${request.WorkerFirstName} ${request.WorkerLastName}`
                                    : request.WorkerID;
                            return (
                                <TableRow
                                    key={request.LeaveRequestID}
                                    hover
                                    selected={isItemSelected}
                                    onClick={() => handleSelectClick(request.LeaveRequestID)}
                                >
                                    <TableCell padding="checkbox" className={styles.tableCell}>
                                        <Checkbox
                                            checked={isItemSelected}
                                            onChange={() => handleSelectClick(request.LeaveRequestID)}
                                        />
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {request.LeaveRequestID}
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>{workerName}</TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {request.LeaveTypeCode}
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {formatDate(request.FromDate)}
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {formatDate(request.ToDate)}
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        <Tooltip title={request.Remarks || ''} placement="top">
                                            <span>
                                                {request.Remarks && request.Remarks.length > 30
                                                    ? request.Remarks.slice(0, 30) + '...'
                                                    : request.Remarks}
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center" className={styles.tableCell}>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row selection
                                                handleApproveClick(request.RequestID);
                                            }}
                                        >
                                            <CheckCircle style={{color: "blue" || 'green'}}/>
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRejectClick(request.RequestID);
                                            }}
                                        >
                                            <Cancel style={{color: "red" || 'red'}}/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                No leave requests available.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
                <DialogTitle>
                    {confirmDialogAction === 'approve'
                        ? 'Approve Leave Request'
                        : 'Reject Leave Request'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to{' '}
                        {confirmDialogAction === 'approve' ? 'approve' : 'reject'} this leave
                        request?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleConfirmDialogClose}
                        style={{
                            backgroundColor: "yellow" || '#f0ad4e',
                            color: '#fff',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDialogConfirm}
                        autoFocus
                        style={{
                            backgroundColor: "blue" || '#337ab7',
                            color: '#fff',
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LeaveRequestTable;
