import React, {useContext, useState} from 'react';
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
import styles from '@/styles/scheduler.module.css'; // Import the CSS module
import ColorContext from '@/contexts/ColorContext';

const ShiftApprovalTableBasic = ({
                                     disable,
                                     draftShifts,
                                     onApprove,
                                     onReject,
                                     onSelectChange,
                                 }) => {
    const [selectedShifts, setSelectedShifts] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('ShiftStart');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogShiftID, setConfirmDialogShiftID] = useState(null);
    const [confirmDialogAction, setConfirmDialogAction] = useState(null);
    // const {colors} = useContext(ColorContext);

    // --- Utility functions for date/time formatting ---
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // This will produce something like "1:00 PM"
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // This will produce something like "Jan 28, 2025"
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    // ---

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = draftShifts.map((shift) => shift.ShiftID);
            setSelectedShifts(newSelecteds);
            onSelectChange(newSelecteds);
            return;
        }
        setSelectedShifts([]);
        onSelectChange([]);
    };

    const handleSelectClick = (shiftID) => {
        const selectedIndex = selectedShifts.indexOf(shiftID);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedShifts, shiftID);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedShifts.slice(1));
        } else if (selectedIndex === selectedShifts.length - 1) {
            newSelected = newSelected.concat(selectedShifts.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedShifts.slice(0, selectedIndex),
                selectedShifts.slice(selectedIndex + 1)
            );
        }

        setSelectedShifts(newSelected);
        onSelectChange(newSelected);
    };

    const isSelected = (shiftID) => selectedShifts.indexOf(shiftID) !== -1;

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedShifts = draftShifts.sort((a, b) => {
        if (orderBy === 'ShiftStart' || orderBy === 'ShiftEnd') {
            return order === 'asc'
                ? new Date(a[orderBy]) - new Date(b[orderBy])
                : new Date(b[orderBy]) - new Date(a[orderBy]);
        } else if (typeof a[orderBy] === 'string') {
            return order === 'asc'
                ? a[orderBy].localeCompare(b[orderBy])
                : b[orderBy].localeCompare(a[orderBy]);
        } else {
            return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
        }
    });

    const handleApproveClick = (shiftID) => {
        setConfirmDialogAction('approve');
        setConfirmDialogShiftID(shiftID);
        setConfirmDialogOpen(true);
    };

    const handleRejectClick = (shiftID) => {
        setConfirmDialogAction('reject');
        setConfirmDialogShiftID(shiftID);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
        setConfirmDialogShiftID(null);
        setConfirmDialogAction(null);
    };

    const handleConfirmDialogConfirm = () => {
        if (confirmDialogAction === 'approve') {
            onApprove(confirmDialogShiftID);
        } else if (confirmDialogAction === 'reject') {
            onReject(confirmDialogShiftID);
        }
        handleConfirmDialogClose();
    };

    return (
        <>
            <Table className={styles.table}>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" className={styles.tableHeader}>
                            <Checkbox
                                indeterminate={
                                    selectedShifts.length > 0 &&
                                    selectedShifts.length < sortedShifts.length
                                }
                                checked={
                                    sortedShifts.length > 0 &&
                                    selectedShifts.length === sortedShifts.length
                                }
                                onChange={handleSelectAllClick}
                            />
                        </TableCell>
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'Shift ID'}
                                direction={orderBy === 'Shift ID' ? order : 'asc'}
                                onClick={() => handleRequestSort('Shift ID')}
                            >
                                ID
                            </TableSortLabel>
                        </TableCell>
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'Client'}
                                direction={orderBy === 'Client' ? order : 'asc'}
                                onClick={() => handleRequestSort('Client')}
                            >
                                Client
                            </TableSortLabel>
                        </TableCell>
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'Worker'}
                                direction={orderBy === 'Worker' ? order : 'asc'}
                                onClick={() => handleRequestSort('Worker')}
                            >
                                Worker
                            </TableSortLabel>
                        </TableCell>
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'ServiceDescription'}
                                direction={orderBy === 'ServiceDescription' ? order : 'asc'}
                                onClick={() => handleRequestSort('ServiceDescription')}
                            >
                                Service
                            </TableSortLabel>
                        </TableCell>
                        <TableCell className={styles.tableHeader}>
                            <TableSortLabel
                                active={orderBy === 'ShiftStart'}
                                direction={orderBy === 'ShiftStart' ? order : 'asc'}
                                onClick={() => handleRequestSort('ShiftStart')}
                            >
                                Shift Timing
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" className={styles.tableHeader}>
                            Approve/Reject
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedShifts.length > 0 ? (
                        sortedShifts.map((shift) => {
                            const isItemSelected = isSelected(shift.ShiftID);

                            // Safeguard for ServiceDescription
                            const serviceDescription =
                                shift.ServiceDescription || 'No description provided';

                            return (
                                <TableRow
                                    key={shift.ShiftID}
                                    hover
                                    selected={isItemSelected}
                                    onClick={() => handleSelectClick(shift.ShiftID)}
                                >
                                    <TableCell padding="checkbox" className={styles.tableCell}>
                                        <Checkbox
                                            checked={isItemSelected}
                                            onChange={() => handleSelectClick(shift.ShiftID)}
                                        />
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {shift.ShiftID}
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {shift.ClientFirstName}
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {shift.WorkerFirstName}
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.tableCell} ${styles.ellipsis}`}
                                    >
                                        <Tooltip title={serviceDescription} placement="top">
                      <span>
                        {serviceDescription.slice(0, 30)}
                          {serviceDescription.length > 30 && '...'}
                      </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className={styles.tableCell}>
                                        {/* Display time in 12-hour format, plus the date in "Jan 28, 2025" style */}
                                        {formatTime(shift.ShiftStart)} - {formatTime(shift.ShiftEnd)}
                                        &nbsp;
                                        <span style={{marginLeft: '8px'}}>
                      {formatDate(shift.ShiftStart)}
                    </span>
                                    </TableCell>
                                    <TableCell align="center" className={styles.tableCell}>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row selection
                                                handleApproveClick(shift.ShiftID);
                                            }}
                                            disabled={disable}
                                        >
                                            <CheckCircle
                                                style={disable ? {} : {color: 'green'}}
                                            />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row selection
                                                handleRejectClick(shift.ShiftID);
                                            }}
                                            disabled={disable}
                                        >
                                            <Cancel style={disable ? {} : {color: 'red'}}/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No draft shifts available.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
                <DialogTitle>
                    {confirmDialogAction === 'approve'
                        ? 'Approve Shift'
                        : 'Reject Shift'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to{' '}
                        {confirmDialogAction === 'approve' ? 'approve' : 'reject'} this
                        shift?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleConfirmDialogClose}
                        color="primary"
                        style={{backgroundColor: "yellow", color: '#fff'}}
                    >
                        Cancel
                    </Button>
                    <Button
                        style={{backgroundColor: "blue", color: '#fff'}}
                        onClick={handleConfirmDialogConfirm}
                        color="primary"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ShiftApprovalTableBasic;
