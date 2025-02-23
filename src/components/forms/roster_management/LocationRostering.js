import React, {useContext, useEffect, useState} from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Typography,
} from "@mui/material";
import LocationRosterCalendar from "./LocationRosterCalendar";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import {useRouter} from "next/router";
import Cookies from "js-cookie";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const LocationRosterPage = () => {
    const [rows, setRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoster, setSelectedRoster] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newLocation, setNewLocation] = useState("");
    const [locations, setLocations] = useState([]);
    const [rosteredLocationIDs, setRosteredLocationIDs] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [message, setMessage] = useState("");
    const [userRole, setUserRole] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // 'error', 'success', 'info', 'warning'
    const router = useRouter();
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        // Roles check
        fetchUserRoles(
            "m_location_rostering",
            "Maintenance_Location_Roster",
            setDisableSection
        );
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // 1) Fetch user info
    const fetchUserInfo = async () => {
        try {
            const User_ID = Cookies.get("User_ID");
            if (!User_ID) throw new Error("User_ID is not in cookies.");

            const response = await postData("/api/getUserInfo", {User_ID});
            if (
                response &&
                ["Rostering Clerk", "Super Admin", "All"].includes(response.UserGroup)
            ) {
                setUserRole(response.UserGroup);
            } else {
                setMessage("Roster management data is only visible to Rostering Clerks.");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            setMessage("An error occurred while fetching user info.");
        }
    };

    // 2) Fetch data on component mount
    useEffect(() => {
        fetchRosterAndLocationData();
    }, []);

    // 3) Fetch roster + location data in parallel
    const fetchRosterAndLocationData = async () => {
        try {
            const [rosterData, locationData] = await Promise.all([
                fetchData("/api/getLocRosterMasterData"),
                fetchData("/api/getActiveLocationProfile"),
            ]);

            if (rosterData.data && locationData.data) {
                // Build array of LocationIDs that already have rosters
                const existingRosterLocationIDs = rosterData.data.map(
                    (roster) => roster.LocationID
                );
                setRosteredLocationIDs(existingRosterLocationIDs);

                // Merge data
                const mergedData = rosterData.data.map((roster) => {
                    const location = locationData.data.find(
                        (loc) => loc.ID === roster.LocationID
                    );
                    return {
                        ID: roster.ID,
                        RosterID: roster.RosterID,
                        MasterID: roster.MasterID,
                        Code: location?.Code || "",
                        Area: location?.Area || "",
                        Timezone: location?.Timezone || "",
                        CaseManager: location?.CaseManager || "",
                        Publish: roster.Publish,
                        Description: location?.Description || "",
                        id: roster.MasterID,
                    };
                });
                setRows(mergedData);
            } else {
                console.error("Unexpected data format:", rosterData, locationData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // 4) Action: push to /LocationRostering
    const handleViewClick = (row) => {
        router.push({
            pathname: `LocationRostering/${row.RosterID}`,
            query: {LocationID: row.ID},
        });
    };

    // 5) Open create-dialog, fetch location data
    const handleDialogOpen = () => {
        setOpenDialog(true);
        fetchLocations();
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setNewLocation("");
        setErrorMessage("");
    };

    // 6) Create new roster
    const handleCreateRoster = async () => {
        const selectedLocation = locations.find((loc) => loc.ID === newLocation);
        if (!selectedLocation) {
            setSnackbarMessage("Please select a valid location.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        // If the location already has a roster
        if (rosteredLocationIDs.includes(selectedLocation.ID)) {
            setSnackbarMessage("Roster already exists for the selected location.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        const newRoster = {
            LocationID: selectedLocation.ID,
            RosterTimeZone: "TimeZonePlaceholder",
            Publish: 1,
        };

        try {
            const response = await postData("/api/insertLocRosterMasterData", newRoster);
            if (response.success) {
                // Refresh
                fetchRosterAndLocationData();
                handleDialogClose();
                setSnackbarMessage("Roster created successfully.");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
            } else {
                console.error("Failed to create roster:", response.error);
                setSnackbarMessage(response.error || "Failed to create roster.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error("Error creating roster:", error);
            setSnackbarMessage("Unexpected error while creating the roster.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }
    };

    // 7) Fetch locations
    const fetchLocations = async () => {
        try {
            const locationData = await fetchData("/api/getActiveLocationProfile");
            if (locationData && locationData.data) {
                // Filter out locations that already have rosters
                const availableLocations = locationData.data.filter(
                    (loc) => !rosteredLocationIDs.includes(loc.ID)
                );
                setLocations(availableLocations);
            } else {
                console.error("Unexpected data format:", locationData);
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    // 8) Table columns
    const columns = [
        {field: "ID", headerName: "Location ID", width: 150},
        {field: "RosterID", headerName: "Roster ID", width: 150},
        {field: "MasterID", headerName: "Master ID", width: 150},
        {field: "Code", headerName: "Location Code", width: 150},
        {field: "Area", headerName: "Area", width: 150},
        {field: "Timezone", headerName: "Time Zone", width: 150},
        {field: "CaseManager", headerName: "Case Manager", width: 150},
        {field: "Publish", headerName: "Publish Status", width: 150},
        {field: "Description", headerName: "Description", width: 250},
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleViewClick(params.row)}
                >
                    View
                </Button>
            ),
        },
    ];

    // 9) Handle Snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") return;
        setOpenSnackbar(false);
    };

    return (
        <>
            {userRole ? (
                <div>
                    {!selectedRoster ? (
                        <>
                            <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
                                <div className="pl-2 mb-2"><CustomBreadcrumbs /></div>
                                <div
                                    className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                                    <CustomAgGridDataTable2
                                        title="Location Roster"
                                        primaryButton={{
                                            label: "Create New Location Roster",
                                            icon: <PlusCircle className="h-4 w-4"/>,
                                            onClick: handleDialogOpen,
                                        }}
                                        rows={rows}
                                        columns={columns}
                                        pageSize={5}
                                        rowsPerPageOptions={[5, 10, 25]}
                                        disableSelectionOnClick
                                        isLocationRoster={true}
                                        rowSelected={handleViewClick}
                                    />

                                    {/* Create Roster Dialog */}
                                    <Dialog
                                        fullWidth
                                        maxWidth="xs"
                                        open={openDialog}
                                        onClose={handleDialogClose}
                                    >
                                        <DialogTitle>Create New Location Roster</DialogTitle>
                                        <DialogContent>
                                            {locations.length > 0 ? (
                                                <FormControl fullWidth margin="normal">
                                                    <InputLabel>Location</InputLabel>
                                                    <Select
                                                        value={newLocation}
                                                        onChange={(e) => setNewLocation(e.target.value)}
                                                        label="Location"
                                                    >
                                                        {locations.map((location) => (
                                                            <MenuItem key={location.ID} value={location.ID}>
                                                                {location.Description} ({location.Code})
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <Typography variant="body1" color="error">
                                                    All locations already have rosters or no locations found.
                                                </Typography>
                                            )}
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose} color="secondary">
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleCreateRoster}
                                                color="primary"
                                                disabled={locations.length === 0 || !newLocation}
                                            >
                                                Create
                                            </Button>
                                        </DialogActions>
                                    </Dialog>

                                    {/* Snackbar */}
                                    <Snackbar
                                        open={openSnackbar}
                                        autoHideDuration={6000}
                                        onClose={handleSnackbarClose}
                                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                                    >
                                        <Alert
                                            onClose={handleSnackbarClose}
                                            severity={snackbarSeverity}
                                            sx={{width: "100%"}}
                                        >
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Show the calendar if a row has been selected
                        <LocationRosterCalendar roster={selectedRoster}/>
                    )}
                </div>
            ) : (
                <Typography variant="h6" style={{textAlign: "center", marginTop: "20px"}}>
                    {message || "You do not have access to this page."}
                </Typography>
            )}
        </>
    );
};

export default LocationRosterPage;
