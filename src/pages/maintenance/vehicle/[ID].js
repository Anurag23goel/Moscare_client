import {Col, Container, Form, Row} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
import React, {useEffect, useState} from "react";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, putData,} from "@/utility/api_utility";
import {useRouter} from "next/router";
import styles from "@/styles/style.module.css";
import {Box, Card, Divider, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import Vehicle_document from "./Vehicle_document";
import Vehicle_Notes from "./Vehicle_Notes";
import Vehicle_Forms from "./Vehicle_Forms";

// Importing icons
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import NoteIcon from "@mui/icons-material/Note";
import Header from "@/components/widgets/Header";


const VehicleForm = () => {
    const router = useRouter();
    const {ID} = router.query; // Access the dynamic route parameter
    const [vehicleData, setVehicleData] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState({});
    const [disableSection, setDisableSection] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState("General");
    // const {colors} = useContext(ColorContext);

    console.log(ID);
    useEffect(() => {
        if (router.query.data) {
            const parsedData = JSON.parse(router.query.data); // Parse the row data from query
            setSelectedRowData(parsedData);
            console.log("parsedData : ", parsedData);
        }
    }, [router.query.data]);

    const handleSave = async () => {
        try {
            const payload = {
                ...selectedRowData,
                IsActive: selectedRowData.IsActive === "N" ? "N" : "Y",
                DeleteStatus: selectedRowData.DeleteStatus === "N" ? "N" : "Y",
            };
            const data = await putData(
                "/api/updateVehicle",
                payload,
                window.location.href
            );
            if (data.success) {
                alert("Vehicle updated successfully");
                setTimeout(() => {
                    router.push({pathname: "/maintenance/vehicle"});
                }, 1500);
            }
        } catch (error) {
            console.error("Error updating vehicle data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteVehicle",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            // setVehicleData(await fetchVehicleData());
        } catch (error) {
            console.error("Error deleting vehicle data:", error);
        }
    };
    const handleInputChange = (e) => {
        // Check if the event is a native event (which has e.target)
        if (e && e.target) {
            const {id, value, type, checked} = e.target;
            if (type === "checkbox") {
                // For native checkbox events, use e.target.checked and convert to "Y"/"N"
                const intendedValue = checked ? "Y" : "N";
                setSelectedRowData((prevState) => ({
                    ...prevState,
                    [id]: intendedValue,
                }));
            } else {
                // For text and other input types, update the state normally
                setSelectedRowData((prevState) => ({
                    ...prevState,
                    [id]: value,
                }));
            }
        } else {
            // Fallback for custom objects (like those you might pass for checkboxes)
            const {id, value, type} = e;
            if ((id === "IsActive" || id === "DeleteStatus") && type === "checkbox") {
                const intendedValue = value ? "Y" : "N";
                setSelectedRowData((prevState) => ({
                    ...prevState,
                    [id]: intendedValue,
                }));
            } else {
                setSelectedRowData((prevState) => ({
                    ...prevState,
                    [id]: value,
                }));
            }
        }
    };


    const transmissionOptions = [
        "Automatic transmission",
        "Manual transmission",
        "Continuously variable transmission (CVT) ",
    ];
    const vehicleType = ["Company", "Personal"];

    const drawerItems = [
        {
            text: "General",
            icon: <PersonIcon/>,
        },
        {text: "Documents", icon: <InsertDriveFileIcon/>},
        {text: "Forms", icon: <DescriptionIcon/>},
        {text: "Notes", icon: <NoteIcon/>},
    ];
    // const drawerItems = ["General","Documents", "Forms", "Notes"];

    const handleButtonClick = (info) => {
        setSelectedComponent(info);
    };

    const initialColumns = [
        {Header: "ID", accessor: "id"},
        {Header: "category", accessor: "category"},
        {Header: "Document Name", accessor: "doc_name"},
        {Header: "timestamp", accessor: "timestamp"},
        {Header: "lock", accessor: "lock"},
    ];

    const RowData = [
        {
            id: 1,
            category: "John Doe",
            doc_name: 30,
            timestamp: "john.doe@example.com",
            lock: false
        },
    ];

    return (
        <div>
            {/* <Navbar /> */}
            <Box sx={{
                marginTop: "3rem",
                display: "flex",
                justifyContent: "center",
                flexDirection: "row",
                gap: "1rem",
                padding: " 0 3rem"
            }}>
                <Card
                    style={{
                        borderRadius: "15px",
                        width: "220px",
                        maxWidth: "220px",
                        maxHeight: "70vh",
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "thin",
                        scrollBehavior: "smooth",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        background: "linear-gradient(145deg, #f3f3f3, #e2e2e2)",
                        padding: "10px",
                    }}
                >
                    {drawerItems.map((item, index) => (

                        <div key={index}>
                            <ListItem
                                key={item.text}
                                sx={{
                                    backgroundColor:
                                        selectedComponent === item.text
                                            ? "blue"
                                            : "transparent",
                                    color:
                                        selectedComponent === item.text
                                            ? "white"
                                            : "#4a4a4a",
                                    borderRadius: "8px",
                                    padding: "12px 16px",
                                    marginBottom: "6px", // Keep spacing tight
                                    transition: "all 0.3s ease",
                                    position: "relative", // For hover indicator
                                    "&:hover": {
                                        backgroundColor:
                                            selectedComponent === item.text
                                                ? "blue"
                                                : "#f5f5f5",
                                        boxShadow:
                                            selectedComponent === item.text
                                                ? "none"
                                                : "0px 2px 6px rgba(0, 0, 0, 0.08)", // Light shadow on hover
                                    },
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "70%",
                                        width: "3px",
                                        backgroundColor:
                                            selectedComponent === item.text
                                                ? "white"
                                                : "transparent",
                                        borderRadius: "2px",
                                        transition: "background-color 0.3s ease",
                                    },
                                    cursor: "pointer",
                                }}
                                onClick={() => handleButtonClick(item.text)}
                            >
                                <ListItemIcon
                                    sx={{
                                        color:
                                            selectedComponent === item.text
                                                ? "white"
                                                : "blue",
                                        minWidth: "40px",
                                        marginRight: "10px", // Adjust spacing
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        textAlign: "start",
                                        fontWeight:
                                            selectedComponent === item.text
                                                ? "bold"
                                                : "normal",
                                        fontSize: "16px",
                                    }}
                                />
                            </ListItem>
                            {index < drawerItems.length - 1 && (
                                <Divider
                                    sx={{
                                        backgroundColor: "#dcdcdc", // Light divider
                                        margin: "0 16px",
                                    }}
                                />
                            )}
                        </div>

                    ))}
                </Card>

                {
                    selectedComponent == "General" &&

                    <Container className={styles.MainContainer} style={{
                        marginTop: "0",
                        marginRight: "1rem",
                        border: "1px solid",
                        padding: " 1rem 2rem"
                    }}>
                        <Box className={styles.spaceBetween} style={{paddingBottom: "1rem",}}>
                            <Header title={"General"}/>
                            <SaveDelete
                                saveOnClick={handleSave}
                                deleteOnClick={handleDelete}
                                disabled={disableSection}
                            />
                        </Box>

                        <Row>
                            <Col>
                                <Form.Check
                                    type="checkbox"
                                    id="IsActive"
                                    label="IsActive"
                                    // Convert "Y" to true, anything else to false
                                    checked={selectedRowData.IsActive === "Y"}
                                    onChange={(e) =>
                                        handleInputChange({
                                            id: "IsActive",
                                            value: e.target.checked,
                                            type: "checkbox"
                                        })
                                    }
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="DeleteStatus"
                                    label="Delete"
                                    checked={selectedRowData.DeleteStatus === "Y"}
                                    onChange={(e) =>
                                        handleInputChange({
                                            id: "DeleteStatus",
                                            value: e.target.checked,
                                            type: "checkbox"
                                        })
                                    }
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="Make"
                                    label="Make"
                                    value={selectedRowData.Make}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="Model"
                                    label="Model"
                                    value={selectedRowData.Model}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="Year"
                                    label="Year"
                                    value={selectedRowData.Year}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="Capacity"
                                    label="Capacity"
                                    value={selectedRowData.Capacity}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="Registration"
                                    label="Registration"
                                    value={selectedRowData.Registration}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="bodyType"
                                    label="body Type"
                                    value={selectedRowData.bodyType}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="type"
                                    label="Type"
                                    value={selectedRowData.type}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="insurance_type"
                                    label="Insurance Type"
                                    value={selectedRowData.insurance_type}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="insurance_policy"
                                    label="Insurance Policy"
                                    value={selectedRowData.insurance_policy}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="licence_type"
                                    label="Licence Type"
                                    value={selectedRowData.licence_type}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="color"
                                    label="Color"
                                    value={selectedRowData.color}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="no_of_doors"
                                    label="Number of Doors"
                                    value={selectedRowData.no_of_doors}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    type="select"
                                    id="transmission"
                                    label="Transmission"
                                    options={transmissionOptions.map((trans) => ({
                                        value: trans,
                                        label: trans,
                                    }))}
                                    value={selectedRowData.transmission || ""}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="kilometers"
                                    label="Kilometers"
                                    value={selectedRowData.kilometers}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    id="km_last_sighted"
                                    type="date"
                                    label="KM Last Sighted"
                                    value={selectedRowData.km_last_sighted}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>
                            <Col md={3} className="mt-3">
                                <InputField
                                    type="select"
                                    id="vehicle_type"
                                    label="Vehicle Type"
                                    options={vehicleType.map((vehicle) => ({
                                        value: vehicle,
                                        label: vehicle,
                                    }))}
                                    value={selectedRowData.vehicle_type || ""}
                                    onChange={(e) => handleInputChange(e)}
                                    disabled={disableSection}
                                />
                            </Col>

                            {/* <Col>
                <Form.Check
                  id="wheel_chair_access"
                  type="checkbox"
                  label="Wheelchair Access"
                  checked={selectedRowData.wheel_chair_access}
                  value={selectedRowData.wheel_chair_access}
                  onChange={(e) => handleInputChange(e)}
                />
              </Col> */}

                            {/* <Col>
                <Form.Check
                  type="checkbox"
                  id="btwn_charge"
                  label="Between charge but no pay"
                  checked={selectedRowData.btwn_charge}
                  value={selectedRowData.btwn_charge}
                  onChange={(e) => handleInputChange(e)}
                />
              </Col> */}
                        </Row>
                    </Container>
                }


                {selectedComponent == "Documents" && <Vehicle_document selectedComponent={selectedComponent} ID={ID}/>}

                {selectedComponent == "Forms" && <Vehicle_Forms selectedComponent={selectedComponent} ID={ID}/>}

                {selectedComponent == "Notes" && <Vehicle_Notes selectedComponent={selectedComponent} ID={ID}/>}

            </Box>
        </div>
    );
};

export default VehicleForm;
