import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Typography} from '@mui/material';
import {useRouter} from 'next/router';
import {fetchData} from '@/utility/api_utility';
import MListingDataTable from '@/components/widgets/MListingDataTable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {DatePicker} from '@mui/x-date-pickers/DatePicker'; // Import DatePicker
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {isWithinInterval} from 'date-fns';

const ReportView = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(null); // State for start date
    const [endDate, setEndDate] = useState(null);
    const [filteredData, setFilteredData] = useState([]);

    const formatDateTime = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return new Date(dateString).toLocaleString('en-US', options);
    };

    const fetchWorkerServicesData = async () => {
        try {
            const data = await fetchData(`/api/getWorkerServiceReportById/${WorkerID}`, window.location.href);

            if (data.success) {
                const filteredData = data.data.map((item) => ({
                    Client: `${item.FirstName} ${item.LastName}`,
                    payRate: item.PayRate,
                    ShiftStart: item.ShiftStart,
                    ShiftHrs: item.ShiftHrs,
                    FundingType: item.Type,
                    ServiceCode: item.ServiceCode,
                    Description: item.Description,
                    Km: item.Km,
                    ShiftExtended: item.ExtendedMinutes > 0.0 ? 'True' : 'False',
                }));

                setRowData(filteredData);
                setFilteredData(filteredData);
            } else {
                console.error('Failed to fetch data:', data.error);
            }
        } catch (error) {
            console.error('Error fetching worker services data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterDataByDate = () => {
        if (!startDate || !endDate) {
            setFilteredData(rowData); // Show all data if no date range is selected
        } else {
            const filtered = rowData.filter((item) => {
                const shiftStartDate = new Date(item.ShiftStart); // Convert ShiftStart to Date object
                return isWithinInterval(shiftStartDate, {
                    start: startDate.toDate(), // Convert Dayjs to Date
                    end: endDate.toDate(), // Convert Dayjs to Date
                });
            });
            setFilteredData(filtered);
        }
    };
    useEffect(() => {
        filterDataByDate();
    }, [startDate, endDate, rowData]); // Trigger whenever startDate, endDate, or rowData changes


    useEffect(() => {
        if (WorkerID) {
            fetchWorkerServicesData();
        }
    }, [WorkerID]);

    const columns = [
        {field: 'ClientId', headerName: 'Client ID'},
        {field: 'payRate', headerName: 'Pay Rate'},
        {field: 'ShiftStart', headerName: 'Shift Start', renderCell: (params) => formatDateTime(params.value)},
        {field: 'ShiftHrs', headerName: 'Shift Hours'},
    ];

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text('Worker Service Report', 20, 20);

        // Worker details
        doc.setFontSize(12);
        doc.text(`Worker ID: ${WorkerID}`, 20, 30);

        // Add table header
        const tableColumn = ['Client', 'ServiceCode', 'Description', 'Pay Rate', 'Shift Start', 'Shift Hours'];
        const tableRows = [];

        // Prepare table data from rowData
        rowData.forEach(item => {
            const row = [
                `${item.FirstName} ${item.LastName}`,
                item.ServiceCode,
                item.Description,
                item.payRate,
                formatDateTime(item.ShiftStart), ,
                item.ShiftHrs,
            ];
            tableRows.push(row);
        });

        // Add table to PDF
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        // Save the PDF
        doc.save(`Worker_Service_Report_${WorkerID}.pdf`);
    };

    return (
        <Box sx={{padding: '20px', maxWidth: '1500px', margin: '0 auto'}}>
            <Typography variant="h6" gutterBottom>
                Service Report Details
            </Typography>
            <Divider sx={{marginBottom: '20px'}}/>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{display: 'flex', gap: 2, marginBottom: '20px'}}>
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </Box>
            </LocalizationProvider>

            {!loading ? (
                <>
                    <MListingDataTable rows={filteredData} columns={columns}/>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={downloadPDF}
                        sx={{marginTop: '20px'}}
                    >
                        Download PDF
                    </Button>
                </>
            ) : (
                <Typography variant="body2">Loading...</Typography>
            )}
        </Box>
    );
};

export default ReportView;
