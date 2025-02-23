import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
// import Button from "@/components/widgets/MaterialButton";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import {useRouter} from "next/router";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import styles from "@/styles/style.module.css";
import MButton from "@/components/widgets/MaterialButton";
import SubHeader from "@/components/widgets/SubHeader";

Modal.setAppElement("#__next");

const LocProfClients = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    const [showClientDialog, setShowClientDialog] = useState(false);
    const [clients, setClients] = useState([]);
    const [mappedClients, setMappedClients] = useState([]); // State for storing mapped clients
    const [selectedClients, setSelectedClients] = useState([]);
    const [output, setOutput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const {colors, loading} = useContext(ColorContext);

    // Fetch all clients from the API (for selection)
    const fetchClients = async () => {
        try {
            const clientData = await fetchData(
                "/api/getClientMasterSpecificDataAll",
                window.location.href
            );
            if (clientData && Array.isArray(clientData.data)) {
                setClients(clientData.data);
            } else {
                console.error("Fetched client data is not an array:", clientData);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    // Fetch clients mapped to the specific location
    const fetchMappedClients = async (id) => {
        try {
            const response = await fetchData(`/api/getLocProfClientDataById/${id}`); // Use the provided id
            console.log("Response:", response);
            if (response.success) {
                console.log("Response : ", response);
                setMappedClients(response.data);
            } else {
                console.error("Error fetching mapped clients");
            }
        } catch (error) {
            console.error("Error fetching mapped clients:", error);
        }
    };

    useEffect(() => {
        if (UpdateID) {
            fetchClients(); // Fetch all clients for selection
            fetchMappedClients(UpdateID); // Fetch mapped clients to display in the table
        }
    }, [UpdateID]);

    const handleClientSelection = (event, client) => {
        const {checked} = event.target;
        if (checked) {
            setSelectedClients((prev) => [...prev, client]);
        } else {
            setSelectedClients((prev) =>
                prev.filter((c) => c.ClientID !== client.ClientID)
            );
        }
    };


    const handleAddClient = async () => {
        setIsSubmitting(true);
        const selectedClientIds = selectedClients.map((client) => client.ClientID);

        const formData = {ClientIDs: selectedClientIds};
        try {
            const response = await postData(
                `/api/postLocProfClientData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Clients added successfully");
                setSelectedClients([]);
                setShowClientDialog(false);
                fetchMappedClients(UpdateID); // Refresh the mapped clients table after adding
            } else {
                setOutput("Failed to add clients");
            }
        } catch (error) {
            console.error("Error adding clients:", error);
            setOutput("An error occurred while adding clients");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveClient = async (clientID) => {
        try {
            const response = await postData(
                `/api/removeLocProfClientData/${UpdateID}`,
                {ClientIDs: [clientID]},
                window.location.href
            );
            if (response.success) {
                setOutput("Client removed successfully");
                fetchMappedClients(UpdateID); // Refresh the mapped clients table after removing
            } else {
                setOutput("Failed to remove client");
            }
        } catch (error) {
            console.error("Error removing client:", error);
            setOutput("An error occurred while removing client");
        }
    };

    const handleOpenClientDialog = () => {
        setShowClientDialog(true);
    };

    const handleCloseClientDialog = () => {
        setShowClientDialog(false);
        setSelectedClients([]);
    };

    const isClientMapped = (clientID) => {
        return mappedClients.some(
            (mappedClient) => mappedClient.ClientID === clientID
        );
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div
            style={{margin: "0rem 1.5rem", border: "1px solid", borderRadius: "15px"}}
            className={styles.MainContainer}
        >
            <div className={styles.spaceBetween}>
                <div>
                    <SubHeader title={"Clients"}/>
                </div>
                <div>

                    <Button
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }}
                        label="Select Clients "
                        variant="contained"
                        color="primary"
                        // startIcon={<AddIcon />}
                        onClick={() => handleOpenClientDialog()}
                        // disabled = {disableSection}
                        size={"small"}
                        className={styles.maintenanceBtn}
                    >Select Clients</Button>
                </div>
            </div>

            {/* Display Mapped Clients in a Table */}
            <Typography sx={{marginTop: "1rem", fontSize: "20px"}}>
                Mapped Clients for Location
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ClientID</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mappedClients.map((client) => (
                            <TableRow key={client.ClientID}>
                                <TableCell>{client.ClientID}</TableCell>
                                <TableCell>{`${client.FirstName} ${client.LastName}`}</TableCell>
                                <TableCell>

                                    {/* <Button   onClick={() => handleRemoveClient(client.ClientID)}  variant="contained" color="secondary" sx={{backgroundColor:"yellow"}}>
                   Remove
                          </Button> */}
                                    <MButton

                                        sx={{
                                            backgroundColor: "yellow",
                                            "&:hover": {
                                                backgroundColor: "yellow", // Replace this with your desired hover color
                                            },
                                        }}
                                        label="Remove"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleRemoveClient(client.ClientID)}
                                        size={"small"}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for selecting clients */}
            <Dialog
                open={showClientDialog}
                onClose={() => handleCloseClientDialog()}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    style: {
                        zIndex: 1300,
                        boxShadow: 'none',
                        borderRadius: '10px',
                        width: "500px",
                        height: "500px"
                    }
                }}
            >
                <DialogTitle sx={{backgroundColor: '#f5f5f5', padding: '16px', fontSize: '18px', fontWeight: 'bold'}}>
                    Select Clients
                </DialogTitle>

                <DialogContent sx={{padding: '16px', backgroundColor: '#fafafa'}}>
                    <TableContainer component={Paper} elevation={0} sx={{
                        boxShadow: 'none',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <Table>
                            <TableHead sx={{backgroundColor: '#f5f5f5'}}>
                                <TableRow>
                                    <TableCell>Select</TableCell>
                                    <TableCell>Client ID</TableCell>
                                    <TableCell>Client Name</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {
                                    clients && clients.length > 0 && clients.map((client) => (
                                        <TableRow
                                            key={client.ClientID}
                                            hover
                                            sx={{
                                                '&:nth-of-type(odd)': {backgroundColor: '#f9f9f9'},
                                                '&:nth-of-type(even)': {backgroundColor: '#fff'},
                                            }}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={
                                                        isClientMapped(client.ClientID) ||
                                                        selectedClients.some(
                                                            (c) => c.ClientID === client.ClientID
                                                        )
                                                    }
                                                    onChange={(event) =>
                                                        handleClientSelection(event, client)
                                                    }


                                                    disabled={isClientMapped(client.ClientID)}
                                                />
                                            </TableCell>
                                            <TableCell>{client.ClientID}</TableCell>
                                            <TableCell>{client.FirstName} {client.LastName}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>


                <DialogActions sx={{backgroundColor: '#f5f5f5'}}>
                    <Button onClick={handleAddClient} variant="contained" color="primary" sx={{
                        backgroundColor: "blue",
                        "&:hover": {
                            backgroundColor: "blue", // Replace this with your desired hover color
                        },
                    }}>
                        Add Clients
                    </Button>
                    <Button onClick={() => setShowClientDialog(false)} variant="contained" color="secondary" sx={{
                        backgroundColor: "yellow",
                        "&:hover": {
                            backgroundColor: "yellow", // Replace this with your desired hover color
                        },
                    }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LocProfClients;
