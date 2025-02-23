// src/components/widgets/DraggableShift.js
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDrag} from 'react-dnd';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import styles from '@/styles/scheduler.module.css';
import {fetchData, postData} from '@/utility/api_utility';


// Cache for shift colors so they’re only fetched once per file.
let cachedShiftColors = null;
let cachedShiftColorsPromise = null;

const DraggableShift = ({
                            disable,
                            shift,
                            source,
                            onShiftClick,
                            onDragStartFromPopover, // Callback to close popover on drag start
                            isCompactView,
                            draftShifts,
                        }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null); // Context menu anchor
    const [openDialog, setOpenDialog] = useState(false);
    const dragStartPos = useRef(null);
    // const {colors} = useContext(ColorContext);
    const [shiftColors, setShiftColors] = useState({});

    // Fetch shift colors only once and cache them
    useEffect(() => {
        if (cachedShiftColors) {
            setShiftColors(cachedShiftColors);
        } else if (cachedShiftColorsPromise) {
            cachedShiftColorsPromise.then((data) => setShiftColors(data));
        } else {
            cachedShiftColorsPromise = fetchData(`/api/getShiftColors`)
                .then((data) => {
                    cachedShiftColors = data.data;
                    setShiftColors(cachedShiftColors);
                    return cachedShiftColors;
                })
                .catch((error) => {
                    console.error('Error fetching shift colors:', error);
                    cachedShiftColors = {};
                    setShiftColors({});
                });
        }
    }, []); // Run only once

    // Precompute shift start, end, and now.
    const shiftStartDate = useMemo(() => new Date(shift.ShiftStart), [shift.ShiftStart]);
    const shiftEndDate = useMemo(() => new Date(shift.ShiftEnd), [shift.ShiftEnd]);
    const now = useMemo(() => new Date(), []);

    // Compute the shift time string.
    const shiftTimeString = useMemo(() => {
        return `${shiftStartDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })} - ${shiftEndDate.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}`;
    }, [shiftStartDate, shiftEndDate]);

    // Determine background color using memoization.
    const bgColor = useMemo(() => {
        if (shift.Status === 'A' && shift.SupportWorker1 === 'UNALLOCATED') {
            return shiftColors.unallocatedColor || "#cdcdcd";
        } else if (shift.Status === 'D') {
            return shiftColors.draftColor;
        } else if (shift.Status === 'P') {
            return shiftColors.pendingForApprovalColor;
        } else if (shift.ShiftStatus === 'Completed-Early' || shift.ShiftStatus === 'Completed-Late' || now.getTime() > shiftEndDate.getTime()) {
            return shiftColors.pastColor;
        } else if (shift.Status === 'A' && now.getTime() >= shiftStartDate.getTime() && now.getTime() <= shiftEndDate.getTime() && shift.ShiftStatus === 'In Progress') {
            return shiftColors.ongoingColor;
        } else if (shift.Status === 'A' && now.getTime() >= shiftStartDate.getTime() && now.getTime() <= shiftEndDate.getTime() && shift.ShiftStatus === 'Not Started') {
            return shiftColors.notStartedColor;
        } else if (shiftStartDate.getTime() > now.getTime()) {
            return shiftColors.futureColor;
        } else if (shift.ShiftStatus === 'Not Started' && now.getTime() < shiftStartDate.getTime()) {
            return shiftColors.notStartedColor;
        }
        return '';
    }, [shift, shiftColors, now, shiftStartDate, shiftEndDate]);

    // Setup drag using useDrag.
    const [{opacity}, drag, preview] = useDrag({
        type: 'SHIFT',
        item: useCallback(() => {
            if (source === 'popover' && onDragStartFromPopover) {
                console.log('Dragging from popover, closing popover');
                onDragStartFromPopover();
            }
            return {id: shift.ShiftID, source};
        }, [source, shift.ShiftID, onDragStartFromPopover]),
        canDrag: !disable && shift.Status !== 'P' && shiftEndDate.getTime() >= now.getTime(),
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.5 : 1,
        }),
        end: () => setIsDragging(false),
    });

    // Context menu handlers.
    const handleRightClick = useCallback((e) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
    }, []);

    const handleCloseContextMenu = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleOpenDialog = useCallback(() => {
        setOpenDialog(true);
        handleCloseContextMenu();
    }, [handleCloseContextMenu]);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
    }, []);

    // Approval handler.
    const handleApproval = useCallback(async () => {
        try {
            const response = await postData('/api/submitForApproval', {shiftId: shift.ShiftID});
            if (response.success) {
                console.log('Shift sent for approval successfully');
            } else {
                console.error('Failed to send shift for approval');
            }
        } catch (error) {
            console.error('Error sending shift for approval:', error);
        } finally {
            handleCloseDialog();
        }
    }, [shift.ShiftID, handleCloseDialog]);

    // Mouse event handlers.
    const handleMouseDown = useCallback((e) => {
        if (disable) return;
        dragStartPos.current = {x: e.clientX, y: e.clientY};
    }, [disable]);

    const handleMouseUp = useCallback((e) => {
        if (dragStartPos.current) {
            const dragEndPos = {x: e.clientX, y: e.clientY};
            const distance = Math.sqrt(
                Math.pow(dragEndPos.x - dragStartPos.current.x, 2) +
                Math.pow(dragEndPos.y - dragStartPos.current.y, 2)
            );
            if (!isDragging && distance < 5) {
                onShiftClick(e, shift, shift);
            }
            dragStartPos.current = null;
        }
    }, [isDragging, onShiftClick, shift]);

    // Tooltip content for the shift.
    const tooltipContent = useMemo(() => (
        <div>
            <strong>{shift.ClientFirstName} {shift.ClientLastName}</strong>
            <br/>
            <span>{shift.ServiceDescription}</span>
            <br/>
            <span>{shiftTimeString}</span>
        </div>
    ), [shift.ClientFirstName, shift.ClientLastName, shift.ServiceDescription, shiftTimeString]);

    return (
        <div
            ref={(node) => {
                if (node && !disable) {
                    drag(preview(node));
                }
            }}
            onContextMenu={handleRightClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
                opacity,
                cursor: disable || shift.Status === 'P' || shiftEndDate.getTime() < now.getTime() ? 'not-allowed' : 'move',
                backgroundColor: bgColor,
            }}
            className={styles.shiftStrip}
        >
            <div className={styles.shiftTime}>{shiftTimeString}</div>
            <div className={styles.shiftClient}>{`${shift.ClientFirstName} ${shift.ClientLastName}`}</div>
            <div className={styles.shiftDescription}>
                {shift.ServiceDescription.length > 27
                    ? `${shift.ServiceDescription.substring(0, 27)}...`
                    : shift.ServiceDescription}
            </div>
            {isCompactView && (
                <Tooltip title={tooltipContent} arrow>
                    <InfoTwoToneIcon fontSize="small" className={styles.shiftIcon}/>
                </Tooltip>
            )}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseContextMenu}
            >
                <MenuItem onClick={handleOpenDialog}>Send for Approval</MenuItem>
            </Menu>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    <SendIcon fontSize="small" style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                    Send Shift for Approval?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to send this shift for approval?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary"
                            style={{backgroundColor: "yellow", color: "#fff"}}>
                        Cancel
                    </Button>
                    <Button onClick={handleApproval} color="primary"
                            style={{backgroundColor: "blue", color: "#fff"}} autoFocus>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DraggableShift;
