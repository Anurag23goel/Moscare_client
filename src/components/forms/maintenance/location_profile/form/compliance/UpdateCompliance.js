import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import Button from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Col, Container, Modal, Row} from "react-bootstrap";
import ColorContext from "@/contexts/ColorContext";
import {Checkbox} from "@mui/material";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import styles from "@/styles/style.module.css";
import SubHeader from "@/components/widgets/SubHeader";
import {ValidationContext} from "@/pages/_app";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

export const fetchClientComplianceData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfComplianceDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Completed: item.Completed ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching Client Compliance form data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateCompliance = ({
                              setClientComplianceData,
                              clientComplianceData,
                              setShowForm,
                              ClientID,
                          }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Compliance: "",
        Mandotary: "",
        StartDate: "",
        AlertDate: "",
        ExpiryDate: "",
        Message: "",
        Note: "",
        Document: "",
        Upload: "",
        Other: "",
        Completed: false,
    });

    const [complianceOptions, setComplianceOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    // const {colors, loading} = useContext(ColorContext);
    const [columns, setColumns] = useState([])
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetClientComplianceData = async () => {
        const data = await fetchClientComplianceData(ClientID);
        setClientComplianceData(data);
        setColumns(getColumns(data))
        const compliancedata = await fetchData(
            "/api/getComplianceDataAll",
            window.location.href
        );
        setComplianceOptions(compliancedata.data);
    };

    useEffect(() => {
        fetchAndSetClientComplianceData();
        fetchUserRoles(
            "m_location_profile",
            "Maintainence_LocationProfile_Compliance",
            setDisableSection
        );
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true); // Open modal on row click
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            addValidationMessage("Compliance updated successfully", "success");

            setClientComplianceData(await fetchClientComplianceData(ClientID));
            handleClearForm();
            setShowModal(false); // Close modal after saving
        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Compliance data ", "error");

        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocProfComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientComplianceData(await fetchClientComplianceData(ClientID));
            setShowModal(false); // Close modal after deleting
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Compliance: "",
            Mandotary: "",
            StartDate: "",
            AlertDate: "",
            ExpiryDate: "",
            Message: "",
            Note: "",
            Document: "",
            Upload: "",
            Other: "",
            Completed: false,
        });
    };

    const handleInputChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setSelectedRowData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedRowData((prevData) => ({
            ...prevData,
            Upload: file,
        }));
    };

    return (
        <Container style={{
            backgroundColor: "#f9f9f9",
            borderRadius: "15px",
            border: "1px solid",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "2rem",
            margin: "0 10px",
            width: "100%"
        }}>
            <div className={styles.spaceBetween}>
                <SubHeader title={"Compliance"}/>
                <div>
                    <Button

                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }}
                        label="Add Client Compliance"
                        variant="contained"
                        color="primary"
                        disabled={disableSection}
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>

            <AgGridDataTable
                rows={clientComplianceData.data}
                columns={columns.filter(
                    (col) =>
                        ![
                            'Update User',
                            'Update Time',
                            'Make User',
                            'Maker Date',
                        ].includes(col.headerName)
                )}
                rowSelected={handleSelectRowClick}
            />
            {/* Modal for editing selected row data */}
            <Modal show={showModal} centered onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Compliance Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mt-2">
                        <Col>
                            <InputField
                                id="Compliance"
                                label="Compliance:"
                                value={selectedRowData.Compliance}
                                type="text"
                                onChange={handleInputChange}
                                disabled={true}
                            />
                        </Col>
                        <Col>
                            <InputField
                                id="StartDate"
                                label="StartDate:"
                                value={selectedRowData.StartDate}
                                type="date"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                id="AlertDate"
                                label="AlertDate:"
                                value={selectedRowData.AlertDate}
                                type="date"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4">

                        <Col>
                            <InputField
                                id="ExpiryDate"
                                label="ExpiryDate:"
                                value={selectedRowData.ExpiryDate}
                                type="date"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                id="Note"
                                label="Note:"
                                value={selectedRowData.Note}
                                type="textarea"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                id="Other"
                                label="Other:"
                                value={selectedRowData.Other}
                                type="textarea"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4">

                    </Row>

                    <Row>
                        <Col>
                            <Checkbox
                                id="Completed"
                                checked={selectedRowData.Completed}
                                onChange={handleInputChange}
                                disabled={disableSection}
                                name="checkbox"
                            />
                            Completed
                        </Col>
                    </Row>
                </Modal.Body>

                <Row style={{padding: "20px"}}>
                    <Col className="d-flex justify-content-end">
                        {/* <Button
              type="submit"
              label="Update"
              backgroundColor={"blue"}
              onClick={handleSave}
              disabled={disableSection}
            />
            <Button
              type="button"
              label="Delete"
              backgroundColor={"yellow"}
              onClick={handleDelete}
              disabled={disableSection}
            /> */}

                        <MButton
                            style={{
                                backgroundColor: "yellow",
                                padding: "5px 12px",
                                marginRight: "1rem",
                            }}
                            label="Cancel"
                            variant="contained"
                            color="primary"
                            startIcon={<CancelIcon/>}
                            onClick={() => setShowModal(false)}
                            size="small"
                        />

                        <MButton
                            style={{
                                backgroundColor: "blue",
                                padding: "5px 12px",
                            }}
                            label=" Save Changes"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon/>}
                            onClick={handleSave}
                            size="small"
                        />
                    </Col>
                </Row>
            </Modal>
        </Container>
    );
};

export default UpdateCompliance;
