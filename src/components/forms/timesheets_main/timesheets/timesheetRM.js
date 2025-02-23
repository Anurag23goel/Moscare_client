import React, {useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Badge from '@mui/material/Badge';
import {fetchData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import ArrowBack from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import MyComponent from './Calendar';
import ActivityListRM from "./ActivityListRM";

const TimesheetsMainRM = () => {
    const [value, setValue] = useState('pending');
    const [datesSelected, setDatesSelected] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
    const [activities, setActivities] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const getCookieValue = (name) => {
        if (typeof document === 'undefined') {
            return null;
        }
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const userId = getCookieValue('User_ID');

    const fetchUserRoles = async () => {
        if (!userId) {
            console.error("User_ID is not available");
            return;
        }
        try {
            const rolesData = await fetchData(`/api/getRolesUser/${userId}`, window.location.href);
            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            const specificRead = WriteData.filter((role) => role.Menu_ID === 'm_subtimesheet' && role.ReadOnly === 0);
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    const fetchTimesheetData = async () => {
        try {
            if (!startDate || !endDate) {
                throw new Error('Invalid date range selected');
            }

            const params = new URLSearchParams({
                startDate: startDate.toISOString().split('T')[0], // Ensure date is in the correct format (YYYY-MM-DD)
                endDate: endDate.toISOString().split('T')[0],
                rmId: '2'
            });

            const url = `/api/getTimesheetMasterDataAll?${params.toString()}`;
            const timesheetData = await fetchData(url);

            if (timesheetData && Array.isArray(timesheetData.data)) {
                console.log('Fetched data:', timesheetData.data); // Add this log
            }
            if (timesheetData.success) {
                const formattedData = timesheetData.data.map(item => ({
                    startDate: item.ShiftStartDate,
                    endDate: item.ShiftStartDate,
                    clientId: item.ClientId,
                    items: [
                        {
                            id: item.ShiftId,
                            TsId: item.TsId,
                            shift: item.ShiftId,
                            workerId: item.WorkerId,
                            hours: item.ShiftHrs,
                            payRate: item.PayRate,
                            chargeRate: item.ChargeRate,
                            shiftStartDate: item.ShiftStartDate,
                            Kilometers: item.Km,
                            tlStatus: item.TlStatus,
                            status: item.RmStatus,
                            WorkerRemarks: item.WorkerRemarks,
                            TlRemarks: item.TlRemarks
                        }
                    ]
                }));
                setActivities(formattedData);
            }
        } catch (error) {
            console.error('Error fetching timesheet data:', error);
        }
    };

    useEffect(() => {
        fetchUserRoles();
        fetchTimesheetData();
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleDateSelection = ({startDate, endDate}) => {
        setStartDate(startDate);
        setEndDate(endDate);
        setDatesSelected(true);
        setShowCalendar(false);
    };

    const handleGoBack = () => {
        setShowCalendar(true);
        setDatesSelected(false);
    };

    const filterActivitiesByDateRange = (activities, startDate, endDate) => {
        return activities.filter((activity) => {
            const activityStart = new Date(activity.startDate);
            const activityEnd = new Date(activity.endDate);
            const selectedStart = new Date(startDate);
            const selectedEnd = new Date(endDate);
            return (activityStart <= selectedEnd && activityEnd >= selectedStart);
        });
    };

    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate);

    // Filtering logic based on TlStatus and RmStatus
    const pendingItems = filteredActivities.flatMap(activity =>
        activity.items.filter(item => (item.tlStatus === 'A' || item.tlStatus === 'R') && item.status === 'P')
    );

    const approvedItems = filteredActivities.flatMap(activity =>
        activity.items.filter(item => item.status === 'A')
    );

    const rejectedItems = filteredActivities.flatMap(activity =>
        activity.items.filter(item => item.status === 'R')
    );

    return (
        <>
            {showCalendar ? (
                <Box sx={{flex: '1', padding: 2}}>
                    <MyComponent onDateSelect={handleDateSelection}/>
                </Box>
            ) : (
                <Box sx={{flex: '2', padding: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <MButton
                            variant="outlined"
                            color="primary"
                            onClick={handleGoBack}
                            startIcon={<ArrowBack/>}
                            label="Back to Calendar"
                            sx={{marginRight: 2}}
                        />
                        <MButton
                            variant="contained"
                            color="primary"
                            onClick={fetchTimesheetData}
                            startIcon={<RefreshIcon/>}
                            label="Refresh"
                            sx={{marginLeft: 'auto'}}
                        />
                    </Box>
                    <h1 style={{textAlign: 'center'}}>Timesheets</h1>
                    <Box sx={{width: '100%', typography: 'body1'}}>
                        <TabContext value={value}>
                            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                <TabList onChange={handleChange} aria-label="lab API tabs example">
                                    <Tab
                                        label={
                                            <Badge
                                                badgeContent={pendingItems.length}
                                                color="primary"
                                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                            >
                                                Pending
                                            </Badge>
                                        }
                                        value="pending"
                                    />
                                    <Tab
                                        label={
                                            <Badge
                                                badgeContent={approvedItems.length}
                                                color="primary"
                                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                            >
                                                Approved
                                            </Badge>
                                        }
                                        value="approved"
                                    />
                                    <Tab
                                        label={
                                            <Badge
                                                badgeContent={rejectedItems.length}
                                                color="primary"
                                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                            >
                                                Rejected
                                            </Badge>
                                        }
                                        value="rejected"
                                    />
                                </TabList>
                            </Box>
                            <TabPanel value="pending">
                                <ActivityListRM
                                    startDate={startDate}
                                    endDate={endDate}
                                    status="P"
                                    activities={filteredActivities}
                                    setSelectedItems={setSelectedItems}
                                />
                            </TabPanel>
                            <TabPanel value="approved">
                                <ActivityListRM
                                    startDate={startDate}
                                    endDate={endDate}
                                    status="A"
                                    activities={filteredActivities}
                                    setSelectedItems={setSelectedItems}
                                />
                            </TabPanel>
                            <TabPanel value="rejected">
                                <ActivityListRM
                                    startDate={startDate}
                                    endDate={endDate}
                                    status="R"
                                    activities={filteredActivities}
                                    setSelectedItems={setSelectedItems}
                                />
                            </TabPanel>
                        </TabContext>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default TimesheetsMainRM;
