import {fetchData, postData} from "@/utility/api_utility";
import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@mui/material';
import {format} from 'date-fns';
import MListingDataTable from '../../../widgets/MListingDataTable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CodeIcon from '@mui/icons-material/Code';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

const ActivityListRM = ({startDate, endDate, status, activities, setSelectedItems}) => {
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedRowDetails, setSelectedRowDetails] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        const formattedRows = activities.flatMap(activity =>
            activity.items
                .filter(item => item.status === status)
                .map(item => ({
                    ShiftId: item.shift,
                    StartDate: format(new Date(item.shiftStartDate), 'dd MMMM, yyyy'),
                    TsId: item.TsId,
                    Hours: item.hours,
                    WorkerRemarks: item.WorkerRemarks,
                    Km: item.Kilometers,
                    PayRate: item.payRate,
                    PayAmount: item.hours * item.payRate,
                    ChargeRate: item.chargeRate,
                    ChargeAmount: item.hours * item.chargeRate,
                    TlStatus: item.tlStatus,
                    RmStatus: item.status
                }))
        );

        const columns = [
            {field: 'StartDate', headerName: 'Start Date', width: 160},
            {field: 'WorkerRemarks', headerName: 'Worker Remarks', width: 150},
            {field: 'Hours', headerName: 'Hours', width: 100},
            {field: 'Km', headerName: 'Km', width: 80},
        ];

        setRows(formattedRows);
        setColumns(columns);
    }, [activities, startDate, endDate, status]);

    const handleRowSelected = async (row) => {
        setSelectedItems((prev) => {
            if (prev.includes(row.id)) {
                return prev.filter((id) => id !== row.id);
            } else {
                return [...prev, row.id];
            }
        });

        setLoading(true);
        try {
            const response = await fetchData(`/api/getTimesheetDetailDataByShiftId/${row.ShiftId}`, '/auth/login');
            if (response && response.data) {
                setSelectedRowDetails(response.data);
                setCurrentItem(row);
                setOpenDialog(true);
            }
        } catch (error) {
            console.error("Error fetching timesheet details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReject = async (action) => {
        if (!currentItem) return;
        console.log('Handling approve/reject for:', currentItem);

        const endpoint = action === 'A'
            ? '/api/approveTimesheetDetailDataRM'
            : '/api/rejectTimesheetDetailDataRM';

        const payload = {
            ShiftId: currentItem.ShiftId,
            TsId: currentItem.TsId,
            ...(action === 'R' && {rejectionRemarksRm: remarks})
        };

        try {
            const response = await postData(endpoint, payload, '/auth/login');
            console.log('API response:', response);
            if (response.success) {
                setOpenDialog(false);
                setRemarks('');
            } else {
                console.error('Failed to update status:', response.message);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedRowDetails([]);
        setRemarks('');
    };

    return (
        <>
            <MListingDataTable
                rows={rows}
                columns={columns}
                rowSelected={handleRowSelected}
                getRowClassName={(params) => (params.row.status === 'approved' ? 'approved-row' : '')}
            />

            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentItem ? `Details for Shift ${currentItem.ShiftId}` : 'Timesheet Details'}
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Typography variant="body1" style={{textAlign: 'center', margin: '20px 0', color: '#666'}}>
                            <CheckCircleIcon style={{verticalAlign: 'middle', marginRight: '8px', color: '#4caf50'}}/>
                            Loading details...
                        </Typography>
                    ) : selectedRowDetails.length > 0 ? (
                        selectedRowDetails.map((detail, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '15px',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #c8e6c9',
                                    textAlign: 'left',
                                }}
                            >
                                <Typography variant="body2"
                                            style={{marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                    <CodeIcon style={{verticalAlign: 'middle', marginRight: '8px', color: '#1976d2'}}/>
                                    Service Code: {detail.ServiceCode}
                                </Typography>
                                <Typography variant="body2"
                                            style={{marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                    <AccountCircleIcon
                                        style={{verticalAlign: 'middle', marginRight: '8px', color: '#1976d2'}}/>
                                    Client ID: {detail.ClientId}
                                </Typography>
                                <Typography variant="body2"
                                            style={{marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                    <DateRangeIcon
                                        style={{verticalAlign: 'middle', marginRight: '8px', color: '#1976d2'}}/>
                                    Shift Start Date: {format(new Date(detail.ShiftStartDate), 'dd MMMM, yyyy')}
                                </Typography>
                                <Typography variant="body2"
                                            style={{marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                    <DateRangeIcon
                                        style={{verticalAlign: 'middle', marginRight: '8px', color: '#1976d2'}}/>
                                    Shift End Date: {format(new Date(detail.ShiftEndDate), 'dd MMMM, yyyy')}
                                </Typography>
                                <Typography variant="body2"
                                            style={{marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                    <AccessTimeIcon
                                        style={{verticalAlign: 'middle', marginRight: '8px', color: '#1976d2'}}/>
                                    TL Remarks: {detail.TlRemarks}
                                </Typography>
                                <Typography variant="body2"
                                            style={{marginBottom: '5px', color: '#333', fontWeight: 'bold'}}>
                                    <TravelExploreIcon
                                        style={{verticalAlign: 'middle', marginRight: '8px', color: '#1976d2'}}/>
                                    Travel Note: {detail.TravelNote}
                                </Typography>
                            </div>
                        ))
                    ) : (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            style={{textAlign: 'center', margin: '20px 0', color: '#666'}}
                        >
                            <ErrorIcon style={{verticalAlign: 'middle', marginRight: '8px', color: '#f44336'}}/>
                            No details available.
                        </Typography>
                    )}
                    {currentItem && currentItem.RmStatus === 'P' && (
                        <TextField
                            label="Rejection Remarks"
                            multiline
                            rows={4}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    {currentItem && currentItem.TlStatus == 'A' && currentItem.RmStatus == 'P' && (
                        <>
                            <Button onClick={() => handleApproveReject('A')} color="primary">
                                Approve
                            </Button>
                            <Button onClick={() => handleApproveReject('R')} color="secondary">
                                Reject
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ActivityListRM;
