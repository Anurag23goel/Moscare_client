import React, {useEffect, useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MButton from "../../../widgets/MaterialButton";
import {fetchData, postData} from "../../../../utility/api_utility"
import Header from "@/components/widgets/Header";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";

const Dashboard = () => {

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [columns, setColumns] = useState([])
    const [selectedDateStart, setSelectedDateStart] = useState(dayjs(new Date()));
    const [selectedDateEnd, setSelectedDateEnd] = useState(dayjs(new Date()));
    const [rows, setRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [open, setOpen] = useState(false);

    const getNdisFundings = async () => {
        try {
            const data = await fetchData(`/api/getNdisFunding`, window.location.href);
            setRows(data);
            // setColumns(getColumns(data))
        } catch (error) {
            console.error("Error fetching NDIS fundings:", error);
        }
    };

    useEffect(() => {
        getNdisFundings();
    }, []);

    const filteredRows = rows.filter((row) => {
        const periodStart = dayjs(row.PeriodStart).valueOf();
        const selectedStart = selectedDate.valueOf();

        return periodStart >= selectedStart;
    });


    const handleDateChangeStart = (newDate) => {
        setSelectedDateStart(newDate);
    };

    const handleDateChangeEnd = (newDate) => {
        setSelectedDateEnd(newDate);
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const handleRowSelected = (selectedRows) => {
        console.log("Selected rows:", selectedRows);
        setSelectedRows(selectedRows);
    };


    const handleReload = () => {
        getNdisFundings();
    };


    const handleBulkCreate = () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one row.");
            return;
        }
        setOpen(true);
    };

    const handleConfirm = async () => {
        if (selectedRows.length > 0) {
            try {
                const newEntries = selectedRows.map((selectedRow) => ({
                    ClientID: selectedRow.ClientID,
                    PeriodStart: selectedDateStart,
                    PeriodEnd: selectedDateEnd,
                    FundingAmount: selectedRow.FundingAmount
                }));

                const promises = newEntries.map(async (entry) => {
                    const endpoint = `/api/insertNdisFunding/${entry.ClientID}`;
                    const response = await postData(endpoint, {data: entry});

                    if (!response) {
                        throw new Error("Failed to create new NDIS funding entry for ClientID: " + entry.ClientID);
                    }
                });

                await Promise.all(promises);

                console.log("New entries created successfully for ClientIDs:", newEntries.map(e => e.ClientID));

            } catch (error) {
                console.error("Error creating new NDIS funding entries:", error);
            }
        } else {
            console.error("No rows selected for bulk creation");
        }
    };
    // const {colors} = useContext(ColorContext);


    return (
        <>
            <Box sx={{padding: "0 1.8rem"}}>
                <Header title={"Bulk Ndis"} style={{marginLeft: "4rem"}}/>
            </Box>
            <Box sx={{padding: 3, marginTop: "1rem"}}>
                {/* Top Section: Date Picker and Reload Button */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={1}>
                        <MButton label="Reload" style={{backgroundColor: "blue"}} variant="contained"
                                 onClick={handleReload}/>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <div style={{display: "flex", gap: "1.5rem", marginTop: "1.5rem"}} className="mb-4">
                    <MButton label="Bulk Create" style={{backgroundColor: "blue"}} variant="contained"
                             onClick={handleBulkCreate}/>
                    <MButton label="Bulk Email" style={{backgroundColor: "blue"}} variant="contained"
                             onClick={() => {
                             }}/>
                    <MButton label="Bulk Statement" style={{backgroundColor: "blue"}} variant="contained"
                             onClick={() => {
                             }}/>
                    <MButton
                        label="Bulk Funding Breakdown Report"
                        variant="contained"
                        style={{backgroundColor: "blue"}}
                        onClick={() => {
                        }}
                    />
                    <MButton label="Bulk Add to Doc" style={{backgroundColor: "blue"}} variant="contained"
                             onClick={() => {
                             }}/>
                </div>

                {/* Data Table */}

                <Box sx={{marginTop: 8}}>
                    <AgGridDataTable
                        rows={filteredRows}
                        columns={columns}
                        rowSelected={handleRowSelected}
                    />
                </Box>

                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Confirm Bulk Create</DialogTitle>
                    <div>
                        <DialogContent>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="New Period Start"
                                    value={selectedDateStart}
                                    onChange={handleDateChangeStart}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                            <br/>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="New Period End"
                                    value={selectedDateEnd}
                                    onChange={handleDateChangeEnd}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </DialogContent>
                    </div>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} variant="contained">Confirm</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default Dashboard;
