import React, {useContext, useEffect, useState} from "react";
import {Card, Checkbox} from "@mui/material";
import ColorContext from "@/contexts/ColorContext";
import MButton from "@/components/widgets/MaterialButton";
import InputField from "@/components/widgets/InputField";
import styles from "@/styles/style.module.css";
import {Col, Container, Row} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import {fetchData} from "@/utility/api_utility";

const generateTimeSlots = () => {
    const startHour = 14; // 2 PM
    const startMinute = 30;
    const timeSlots = [];

    let hour = startHour;
    let minute = startMinute;

    while (!(hour === 14 && minute === 15)) {
        const timeString = `${hour % 12 || 12}:${minute
            .toString()
            .padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
        timeSlots.push(timeString);

        minute += 15;
        if (minute === 60) {
            minute = 0;
            hour += 1;
        }

        if (hour === 24) {
            hour = 0;
        }
    }

    timeSlots.push("2:15 PM");
    return timeSlots;
};

const drawerStyles = {
    drawer: {
        width: "250px", // Set the width of the drawer
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
    },
    listItem: {
        padding: "10px 20px", // Adjust padding for list items
        "&:hover": {
            cursor: "pointer", // Change cursor on hover
            scale: "0.95",
        },
        "&:active": {
            backgroundColor: "rgba(197,197,197,0.5)", // Change background color on focus
        },
    },
};

const UpdateQuoteProfile = (props) => {
    const { colors, loading } = useContext(ColorContext);
    const [selectedComponent, setSelectedComponent] = useState("General ");
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [generalEdit, setGeneralEdit] = useState(false);
    const [detailsEdit, setDetailsEdit] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [clients, setClient] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const [area, setArea] = useState([]);
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedLoc, setSelectedLoc] = useState("");
    const [payer, setPayer] = useState([]);
    const [selectedPayer, setSelectedPayer] = useState("");
    const [selectedQuoteStatus, setSelectedQuoteStatus] = useState("");
    const [rosterCat, setRosterCat] = useState([]);
    const [selectedRosterCat, setSelectedRosterCat] = useState("");

    const getCookieValue = (name) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };

    const userId = getCookieValue("User_ID");

    // Fetch user roles
    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(`/api/getRolesUser/${userId}`, window.location.href);
            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            const specificRead = WriteData.filter(
                (role) => role.Menu_ID === "m_quotes" && role.ReadOnly === 0
            );
            console.log("Operation_Quotes Condition", specificRead);
            setDisableSection(specificRead.length === 0);
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    // Fetch quote services
    const fetchQuoteServices = async () => {
        try {
            const servicesData = await fetchData(`/api/getQuoteServices`, window.location.href);
            setServices(servicesData.data);
            console.log(servicesData.data);
        } catch (error) {
            console.error("Error fetching quote services:", error);
        }
    };

    // Fetch clients
    const fetchClients = async () => {
        try {
            const clientData = await fetchData(`/api/getActiveClientMasterData`, window.location.href);
            setClient(clientData.data);
            console.log(clientData.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    // Fetch client addresses
    const fetchClientsAddress = async () => {
        try {
            const clientArea = await fetchData(`/api/getClientDetailsAddressSpecificDataAll`, window.location.href);
            setArea(clientArea.data);
            console.log(clientArea.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    // Fetch payers
    const fetchPayer = async () => {
        try {
            const payerData = await fetchData(`/api/getPayer`, window.location.href);
            setPayer(payerData.data);
            console.log(payerData.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    // Fetch roster categories
    const fetchRosterCat = async () => {
        try {
            const rosterData = await fetchData(`/api/getRosterData`, window.location.href);
            setRosterCat(rosterData.data);
            console.log(rosterData.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    // Parallel execution in useEffect
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchQuoteServices(),
                    fetchClients(),
                    fetchClientsAddress(),
                    fetchPayer(),
                    fetchRosterCat(),
                    fetchUserRoles(), // Including this in parallel fetch
                ]);
            } catch (error) {
                console.error("Error in parallel data fetch:", error);
            }
        };

        fetchAllData();

        const handleBeforeUnload = (event) => {
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const handleButtonClick = (info) => {
        setSelectedComponent(info);
    };

    const handleModalCancel = () => {
        setShowForm(false);
    };

    return (
        <div>
            {/* <Navbar /> */}
            <div
                style={{
                    margin: "1rem",
                }}
            >
                <Card
                    style={{
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginInline: "1rem",
                            height: "5rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                                marginLeft: "10%",
                            }}
                        >
                            <MButton
                                variant="contained"
                                // onClick={handleSaveButton}
                                label={"Save"}
                                size={"small"}
                                style={{marginLeft: "1rem", marginRight: "1rem"}} // Added marginLeft property
                                disabled={disableSection}
                            />
                            <MButton
                                variant="contained"
                                onClick={() => setShowForm(true)}
                                label={"Direct Message"}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                            }}
                        >
                            <MButton
                                variant="contained"
                                color="primary"
                                label={"Conversations"}
                            />
                            <MButton
                                variant="contained"
                                color="primary"
                                disabled
                                label={"Delete"}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* DRAWER STYLE*/}

            <div
                style={{
                    position: "relative",
                    left: "-10rem",
                    top: "-4.6rem",
                }}
            >
                <MButton
                    variant="contained"
                    // onClick={handleSaveButton}
                    label={"Save"}
                    size={"small"}
                />
            </div>
            <Container className={styles.QuoteUpdateContainer}>
                <div style={{margin: "0px 30px 0px 30px"}}>
                    <Row className="mt-3">
                        <Col md={3}>
                            <InputField
                                label="Client/Lead"
                                type="select"
                                id="ClientLead"
                                disabled={disableSection}
                                // value={form.ClientLead}
                                value={selectedClient}
                                onChange={(e) => {
                                    setSelectedClient(e.target.value);
                                    setSelectedArea(e.target.value);
                                }}
                                options={clients.map((client) => ({
                                    value: client.ClientID,
                                    label: `${client.FirstName} ${client.LastName}`,
                                }))}
                            />
                        </Col>
                        <Col md={3}>
                            <InputField
                                label="Date Of Quote"
                                type="date"
                                id="DateOfQuote"
                                disabled={disableSection}
                                // value={form.DateOfQuote}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Client FirstName"
                                type="text"
                                id="ClientFirstName"
                                disabled={disableSection}
                                // value={form.ClientFirstName}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Client LastName"
                                type="text"
                                id="ClientLastName"
                                disabled={disableSection}
                                // value={form.ClientLastName}
                                // onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <InputField
                                label="Date Of Birth"
                                type="date"
                                id="DateOfBirth"
                                disabled={disableSection}
                                // value={form.DateOfBirth}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Phone1"
                                type="text"
                                id="Phone1"
                                disabled={disableSection}
                                // value={form.Phone1}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Email"
                                type="text"
                                id="Email"
                                disabled={disableSection}
                                // value={form.Email}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Quote Status"
                                type="select"
                                id="QuoteStatus"
                                disabled={disableSection}
                                // value={form.QuoteStatus}
                                value={selectedQuoteStatus}
                                onChange={(e) => setSelectedQuoteStatus(e.target.value)}
                                options={[
                                    {value: "lead", label: "Lead"},
                                    {value: "inProgress", label: "In Progress"},
                                    {value: "pending", label: "Pending"},
                                    {value: "won", label: "Won"},
                                    {value: "lost", label: "Lost"},
                                    {value: "superceded", label: "Superceded"},
                                    {value: "redundant", label: "Redundant"},
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <InputField
                                label="Client Address Line1"
                                type="text"
                                id="ClientAddressLine1"
                                disabled={disableSection}
                                // value={form.ClientAddressLine1}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Client Address Line2"
                                type="text"
                                id="ClientAddressLine2"
                                disabled={disableSection}
                                // value={form.ClientAddressLine2}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col md={3}>
                            <InputField
                                label="Location"
                                type="select"
                                disabled={disableSection}
                                id="Loaction"
                                // value={form.Loaction}
                                value={selectedLoc}
                                onChange={(e) => setSelectedLoc(e.target.value)}
                                options={area.map((area) => ({
                                    value: area.ClientID,
                                    label: area.State,
                                }))}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Payer"
                                type="select"
                                id="Payer"
                                disabled={disableSection}
                                // value={form.Payer}
                                value={selectedPayer}
                                onChange={(e) => setSelectedPayer(e.target.value)}
                                options={payer.map((pay) => ({
                                    value: pay.ID,
                                    label: pay.Description,
                                }))}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <InputField
                                label="Suburb"
                                type="text"
                                id="Suburb"
                                disabled={disableSection}
                                // value={form.Suburb}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col md={3}>
                            <InputField
                                label="Area"
                                type="select"
                                id="Area"
                                disabled={disableSection}
                                // value={form.Area}
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                options={area.map((area) => ({
                                    value: area.ClientID,
                                    label: area.AddressLine1,
                                }))}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="State"
                                type="text"
                                id="State"
                                disabled={disableSection}
                                // value={form.State}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="PostCode"
                                type="text"
                                id="PostCode"
                                disabled={disableSection}
                                // value={form.PostCode}
                                // onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <InputField
                                label="StartDate"
                                type="date"
                                id="StartDate"
                                disabled={disableSection}
                                // value={form.StartDate}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="EndDate"
                                type="date"
                                id="EndDate"
                                disabled={disableSection}
                                // value={form.EndDate}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="MyAgedCareNumber"
                                type="text"
                                id="MyAgedCareNumber"
                                disabled={disableSection}
                                // value={form.MyAgedCareNumber}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Follow Up Date"
                                type="date"
                                id="FollowUpDate"
                                disabled={disableSection}
                                // value={form.FollowUpDate}
                                // onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col md={3}>
                            <InputField
                                label="NdisNumber"
                                type="text"
                                disabled={disableSection}
                                id="NdisNumber"
                                // value={form.NdisNumber}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col md={3}>
                            <InputField
                                label="Funding Type"
                                type="select"
                                id="FundingType"
                                disabled={disableSection}
                                // value={form.FundingType}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col md={3}>
                            <InputField
                                label="QuoteName"
                                type="text"
                                id="QuoteName"
                                disabled={disableSection}
                                // value={form.QuoteName}
                                // onChange={handleChange}
                            />
                        </Col>
                        <Col md={3}>
                            <InputField
                                label="KM"
                                type="text"
                                disabled={disableSection}
                                id="KM"
                                // value={form.KM}
                                // onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <p style={{color: "red"}}>
                        In Accounting code fetch the data for select
                    </p>
                </div>
            </Container>

            <Container className={styles.QuoteUpdateContainer}>
                <div style={{margin: "0px 30px 0px 30px"}}>
                    <b>Public Holiday in selected period:</b>
                    <p>King’s Birthday (Monday, 07-10-2024)</p>
                </div>
            </Container>

            <Container className={styles.QuoteUpdateContainer}>
                <div style={{margin: "0px 30px 0px 30px"}}>
                    <Row className="mb-3">
                        <Col className="d-flex justify-content-between">
                            <MButton
                                style={{margin: "10px 10px 10px 10px"}}
                                label="Add Public Holiday as a Line Item"
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon/>}
                                disabled={disableSection}
                                // onClick={handleClickNew}
                                size={"small"}
                            />
                            <div style={{margin: "10px 10px 10px 10px"}}>
                                <Checkbox
                                    id="VisibleCarer"
                                    // checked={form.VisibleCarer}
                                    // onChange={handleChange}
                                    name="checkbox"
                                    disabled={disableSection}
                                />
                                Exclude Public Holidays
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col md={4}>
                            <Row>
                                <Col md={12} className="mt-3">
                                    <InputField
                                        label="Service"
                                        type="select"
                                        id="Service"
                                        disabled={disableSection}
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        options={services.map((service) => ({
                                            value: service.Service_ID,
                                            label: service.Description,
                                        }))}
                                    />
                                </Col>
                                <Col md={12} className="mt-3">
                                    <InputField
                                        label="Roster Category"
                                        type="select"
                                        id="RosterCategory"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        value={selectedRosterCat}
                                        onChange={(e) => setSelectedRosterCat(e.target.value)}
                                        options={rosterCat.map((area) => ({
                                            value: area.ID,
                                            label: area.Code,
                                        }))}
                                    />
                                </Col>
                                <Col md={12} className="mt-3">
                                    <InputField
                                        label="Description"
                                        type="textarea"
                                        id="Description"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col md={8}>
                            <Row className="mt-3">
                                <Col>
                                    <InputField
                                        label="Duration (in hours)"
                                        type="text"
                                        id="Duration"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                                <Col>
                                    <InputField
                                        label="Start Time"
                                        type="select"
                                        id="StartTime"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        options={timeSlots.map((time, index) => ({
                                            value: index,
                                            label: time,
                                        }))}
                                        value={selectedTime}
                                    />
                                </Col>
                                <Col>
                                    <InputField
                                        label="Finish Time"
                                        type="text"
                                        id="FinishTime"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                                <Col>
                                    <InputField
                                        label="Type"
                                        type="text"
                                        id="Type"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col>
                                    <InputField
                                        label="Until (Until end)"
                                        type="text"
                                        id="Duration"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                                <Col>
                                    <InputField
                                        label="Repeat Every"
                                        type="number"
                                        id="RepeatEvery"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                                <Col>
                                    <InputField
                                        label="Price"
                                        type="text"
                                        id="Price"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                                <Col>
                                    <InputField
                                        label="Budget"
                                        type="text"
                                        id="Budget"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col md={3}>
                                    <InputField
                                        label="Budget Utilised (in hours)"
                                        type="text"
                                        id="BudgetUtilised"
                                        disabled={disableSection}
                                        // value={form.ClientLead}
                                        // onChange={handleChange}
                                    />
                                </Col>
                                <Col md={3}>
                                    <p className="text-center">Per Shift</p>
                                </Col>
                                <Col md={3}>
                                    <p>Total Including Schedule</p>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={12}>
                            <Row className="mt-5 mb-5">
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Monday
                                </Col>
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Tuesday:
                                </Col>
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Wednesday
                                </Col>
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Thursday
                                </Col>
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Friday:
                                </Col>
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Saturday
                                </Col>
                                <Col>
                                    <Checkbox
                                        id="VisibleCarer"
                                        // checked={form.VisibleCarer}
                                        // onChange={handleChange}
                                        name="checkbox"
                                        disabled={disableSection}
                                    />
                                    Sunday
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Row className="mb-3">
                                <Col className="d-flex justify-content-between">
                                    <MButton
                                        type="submit"
                                        label="Copy"
                                        variant={"contained"}
                                        size={"small"}
                                        disabled={disableSection}
                                        // disabled={isSubmitting}
                                    />
                                    <MButton
                                        type="button"
                                        label="Remove"
                                        backgroundColor={"yellow"}
                                        variant={"contained"}
                                        size={"small"}
                                        disabled={disableSection}
                                        // onClick={clearForm}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Container>

            <Container className={styles.QuoteUpdateContainer}>
                <div style={{margin: "0px 30px 0px 30px"}}>
                    <Row>
                        <Col md={4}>
                            <h6>
                                Total Budget: <b>$0.00</b>
                            </h6>
                        </Col>
                        <Col md={4}>
                            <h6>
                                Total Scheduled Price: <b>$0.00</b>
                            </h6>
                        </Col>
                        <Col md={4}>
                            <h6>
                                Total Hours: <b>0</b>
                            </h6>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default UpdateQuoteProfile;
