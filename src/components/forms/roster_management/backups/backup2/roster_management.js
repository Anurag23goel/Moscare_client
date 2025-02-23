import React, {useEffect, useState} from "react";
import Scheduler from "@/components/widgets/Scheduler";
import ClientCalendar from "@/components/widgets/ClientCalendar";
import {Button, Container, FormControl, InputGroup, ListGroup, Modal, Spinner} from "react-bootstrap";
import {fetchData, postData} from "@/utility/api_utility"; // Updated to include getData
import styles from "@/styles/ShiftDashboard.module.css"; // Updated CSS module
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import MButton from "@/components/widgets/MaterialButton";
import Cookies from "js-cookie";
import Typography from "@mui/material/Typography";

function ShiftDashboard() {
    const [activeTab, setActiveTab] = useState("workerScheduler");
    const [showClientModal, setShowClientModal] = useState(false);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedRosterID, setSelectedRosterID] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateRosterModal, setShowCreateRosterModal] = useState(false);
    const [isCreatingRoster, setIsCreatingRoster] = useState(false);
    const [rosterMasterData, setRosterMasterData] = useState([]);
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState('');
    // const { colors } = useContext(ColorContext);

    // New state variables for timezone
    const [clientTimezone, setClientTimezone] = useState(null);
    const [isLoadingTimezone, setIsLoadingTimezone] = useState(false);
    const [timezoneError, setTimezoneError] = useState(null);

    // Function to fetch user info and assign role
    const fetchUserInfo = async () => {
        try {
            const User_ID = Cookies.get("User_ID"); // Retrieve User_ID from the cookie
            if (!User_ID) {
                throw new Error("User_ID is not defined or missing in cookies.");
            }

            const response = await postData('/api/getUserInfo', { User_ID });
            if (response && (response.UserGroup === 'Rostering Clerk' || response.UserGroup === 'Team Lead' || response.UserGroup === 'Super Admin' || response.UserGroup === 'All')) {
                setUserRole(response.UserGroup);
            } else {
                setMessage('Roster management data is only visible to Rostering Clerks');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const clientData = await fetchData(
                    "/api/getClientMasterSpecificDataAll",
                    window.location.href
                );
                const shiftData = await fetchData(
                    "/api/getApprovedShifts",
                    window.location.href
                );
                const rosterMasterData = await fetchData(
                    "/api/getRosterMasterData",
                    window.location.href
                );

                setRosterMasterData(rosterMasterData.data);

                // Map roster data by ClientID
                const rosterDataByClientID = rosterMasterData.data.reduce(
                    (acc, roster) => {
                        if (!acc[roster.ClientID]) {
                            acc[roster.ClientID] = [];
                        }
                        acc[roster.ClientID].push(roster);
                        return acc;
                    },
                    {}
                );

                // Map shift data by ClientID to get shift counts
                const shiftCountByClientID = shiftData.data.reduce((acc, shift) => {
                    acc[shift.ClientID] = (acc[shift.ClientID] || 0) + 1;
                    return acc;
                }, {});

                // Combine client data with shift data and roster data
                const combinedData = clientData.data.map((client) => ({
                    ...client,
                    RosterIDs: rosterDataByClientID[client.ClientID] || [],
                    shiftCount: shiftCountByClientID[client.ClientID] || 0,
                }));

                setClients(combinedData);
                setFilteredClients(combinedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchClients();
    }, []);

    // New function to fetch client's timezone
    const fetchClientTimezone = async (clientId) => {
        setIsLoadingTimezone(true);
        setTimezoneError(null);
        setClientTimezone(null); // Reset previous timezone
        try {
            const token = Cookies.get("authToken"); // Adjust based on where you store the token
            const response = await fetchData(`/api/getClientTimezone?ClientID=${clientId}`, {
                'Authorization': `Bearer ${token}`,
            });

            if (response.success) {
                setClientTimezone(response.data.TimeZone);
            } else {
                setTimezoneError(response.error || 'Failed to fetch timezone.');
            }
        } catch (error) {
            console.error('Error fetching client timezone:', error);
            setTimezoneError('An error occurred while fetching timezone.');
        } finally {
            setIsLoadingTimezone(false);
        }
    };

    const handleTabClick = (tab) => {
        if (tab === "clientCalendar") {
            setShowClientModal(true);
        } else {
            setActiveTab(tab);
        }
    };

    const handleClientRosterSelect = (client, rosterID) => {
        setSelectedClient(client);
        setSelectedRosterID(rosterID);
        setShowClientModal(false);
        setActiveTab("clientCalendar");
        // Fetch the timezone for the selected client
        fetchClientTimezone(client.ClientID);
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = clients.filter(
            (client) =>
                client.FirstName.toLowerCase().includes(term) ||
                client.LastName.toLowerCase().includes(term) ||
                client.ClientID.toString().includes(term) ||
                (client.RosterIDs &&
                    client.RosterIDs.some((roster) =>
                        roster.RosterID.toLowerCase().includes(term)
                    ))
        );
        setFilteredClients(filtered);
    };

    // Handle Create Roster button click
    const handleCreateRosterClick = () => {
        setShowCreateRosterModal(true);
    };

    // Handle client selection for roster creation
    const handleClientSelectForRoster = async (client) => {
        setIsCreatingRoster(true);
        try {
            const rosterData = {
                ClientID: client.ClientID,
                RosterTimeZone: "UTC", // Adjust as needed or make it dynamic
                RestrictedAccess: false,
                Completed: false,
                Publish: false,
            };

            const token = Cookies.get("authToken"); // Adjust based on where you store the token
            const response = await postData(
                "/api/insertRosterMasterData",
                rosterData,
                {
                    'Authorization': `Bearer ${token}`,
                }
            );

            if (response.success) {
                // Refresh the roster data
                const updatedRosterMasterData = await fetchData(
                    "/api/getRosterMasterData",
                    window.location.href
                );

                setRosterMasterData(updatedRosterMasterData.data);

                // Map roster data by ClientID
                const rosterDataByClientID = updatedRosterMasterData.data.reduce(
                    (acc, roster) => {
                        if (!acc[roster.ClientID]) {
                            acc[roster.ClientID] = [];
                        }
                        acc[roster.ClientID].push(roster);
                        return acc;
                    },
                    {}
                );

                const updatedClients = clients.map((c) => ({
                    ...c,
                    RosterIDs: rosterDataByClientID[c.ClientID] || [],
                }));

                setClients(updatedClients);
                setFilteredClients(updatedClients);
                setShowCreateRosterModal(false);
                alert("Roster created successfully!");
            } else {
                alert("Failed to create roster.");
            }
        } catch (error) {
            console.error("Error creating roster:", error);
            alert("An error occurred while creating the roster.");
        } finally {
            setIsCreatingRoster(false);
        }
    };

    return (
        <div className="pt-24">
            {userRole ? (
                <>
                    <div className={styles.tabs}>
                        <div className={styles.tabContainer}>
                            <button
                                className={`${styles.SchedulerTab_button} ${activeTab === "workerScheduler" ? styles.active : ""
                                    }`}
                                onClick={() => handleTabClick("workerScheduler")}
                            >
                                Worker Roster
                            </button>
                            <Tooltip title="View the schedules of all Workers.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className={styles.tabContainer}>
                            <button
                                className={`${styles.RosterTab_button} ${activeTab === "clientCalendar" ? styles.active : ""
                                    }`}
                                onClick={() => handleTabClick("clientCalendar")}
                            >
                                Client Roster
                            </button>
                            <Tooltip title="Select a client to view their calendar. You can manage existing shifts and add new shifts directly from this calendar.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    <div className={styles.content}>
                        {activeTab === "workerScheduler" && <Scheduler />}
                        {activeTab === "clientCalendar" &&
                            selectedClient &&
                            selectedRosterID && (
                                <>
                                    <ClientCalendar
                                        cId={selectedClient.ClientID}
                                        clientName={`${selectedClient.FirstName} ${selectedClient.LastName}`}
                                        rId={selectedRosterID}
                                        timezone={clientTimezone}
                                    />
                                </>
                            )}
                    </div>

                    {/* Client Selection Modal */}
                    <Modal
                        show={showClientModal}
                        onHide={() => setShowClientModal(false)}
                        centered
                        size="lg"
                        className={styles.customModal}
                    >
                        <Modal.Header closeButton className={styles.modalHeader}
                                      style={{backgroundColor: "blue", color: "white"}}>
                            <Modal.Title>Select a Client</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Container>
                                <InputGroup className="mb-3">
                                    <FormControl
                                        placeholder="Search by Client ID, Name, or Roster ID"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </InputGroup>
                                <div className={styles.scrollableList}>
                                    <ListGroup>
                                        {filteredClients.length > 0 ? (
                                            filteredClients.map((client) => (
                                                <ListGroup.Item key={client.ClientID} className={styles.listGroupItem}>
                                                    <div className={styles.clientInfo}>
                                                        <div>
                                                            <strong>Client ID:</strong> {client.ClientID}
                                                        </div>
                                                        <div>
                                                            <strong>Name:</strong> {client.FirstName} {client.LastName}
                                                        </div>
                                                        <div>
                                                            <strong>Shifts:</strong> {client.shiftCount}
                                                        </div>
                                                        <div>
                                                            <strong>Rosters:</strong>
                                                            <div className={styles.rosterList}>
                                                                {client.RosterIDs.length > 0 ? (
                                                                    client.RosterIDs.map((roster) => (
                                                                        <Button
                                                                            key={roster.RosterID}
                                                                            variant="link"
                                                                            onClick={() => handleClientRosterSelect(client, roster.RosterID)}
                                                                            className={styles.rosterButton}
                                                                        >
                                                                            {roster.RosterID}
                                                                        </Button>
                                                                    ))
                                                                ) : (
                                                                    <span>No Rosters Available</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>No clients found.</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </div>
                            </Container>
                        </Modal.Body>
                        <Modal.Footer>
                            <MButton
                                variant="primary"
                                label={"Create Roster"}
                                size="small"
                                className={styles.createButton}
                                backgroundColor={"blue"}
                                onClick={handleCreateRosterClick}
                            />
                        </Modal.Footer>
                    </Modal>

                    {/* Create Roster Modal */}
                    <Modal
                        show={showCreateRosterModal}
                        onHide={() => setShowCreateRosterModal(false)}
                        centered
                        size="lg"
                        className={styles.customModal}
                    >
                        <Modal.Header
                            style={{backgroundColor: "blue", color: "white"}}
                            className={styles.modalHeader}
                        >
                            <Modal.Title>Create Roster for a Client</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Container>
                                <InputGroup className="mb-3">
                                    <FormControl
                                        placeholder="Search by Client ID or Name"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </InputGroup>
                                <div className={styles.scrollableList}>
                                    <ListGroup>
                                        {filteredClients.length > 0 ? (
                                            filteredClients.map((client) => (
                                                <ListGroup.Item
                                                    key={client.ClientID}
                                                    className={styles.listGroupItem}
                                                    action
                                                    onClick={() => handleClientSelectForRoster(client)}
                                                >
                                                    <div className={styles.clientInfo}>
                                                        <div>
                                                            <strong>Client ID:</strong> {client.ClientID}
                                                        </div>
                                                        <div>
                                                            <strong>Name:</strong> {client.FirstName} {client.LastName}
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>No clients found.</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </div>
                            </Container>
                        </Modal.Body>
                        <Modal.Footer>
                            <MButton
                                variant="primary"
                                label={"Close"}
                                size="small"
                                onClick={() => setShowCreateRosterModal(false)}
                                backgroundColor={"yellow"}
                                color="white"
                                className={styles.closeButton}
                            >
                                Close
                            </MButton>
                        </Modal.Footer>
                    </Modal>

                    {/* Loading Spinner for Roster Creation */}
                    {isCreatingRoster && (
                        <div className={styles.loadingOverlay}>
                            <Spinner animation="border" variant="primary" />
                            <span>Creating Roster...</span>
                        </div>
                    )}
                </>
            ) : (
                <Typography variant="h6" style={{ textAlign: 'center', marginTop: '20px' }}>
                    {message || 'You don’t have access to this page'}
                </Typography>
            )}
        </div>
    );
}

export default ShiftDashboard;
