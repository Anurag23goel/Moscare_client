import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import {deleteData, fetchData, postData, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import {Col, Modal, Row} from "react-bootstrap";
import ColorContext from "@/contexts/ColorContext";
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined'; // import Button from "@/components/widgets/Button";
import {Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar,} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientComplianceData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientComplianceDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched client compliance data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Completed: item.Completed ? true : false,
            })),
        };

    const columns = Object.keys(transformedData.data[0] || {}).map((key) => ({
      field: key,
      headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
    }));
    // columns.push({
    //   headerName: "Actions",
    //   width: 120,
    //   cellRenderer: (params) => (
    //     <div className="flex items-center justify-center gap-2">
    //       <button
    //         onClick={() => handleRowSelected(params.data)}
    //         className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
    //       >
    //         <Edit className="h-4 w-4" />
    //       </button>
    //       <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
    //         <MoreHorizontal className="h-4 w-4" />
    //       </button>
    //     </div>
    //   ),
    //   suppressMenu: true,
    //   sortable: false,
    //   filter: false,
    //   cellStyle: { display: "flex", justifyContent: "center" },
    // });
    console.log("Extracted columns:", columns);

        return {...transformedData, columns};
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
        Mandotary: null,
        StartDate: "",
        AlertDate: "",
        ExpiryDate: "",
        Message: "",
        Note: "",
        Other: "",
        Completed: false,
        Document: "",
        Upload: "",
        MakeUser: "",
        MakerDate: "",
        UpdateUser: "",
        UpdateTime: "",
        Bucket: "",
        Folder: "",
        File: "",
    });

    const [complianceOptions, setComplianceOptions] = useState([]);
    const [complianceData, setComplianceData] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])

    // State for the confirmation dialog
    const [openConfirmDialogByFundingType, setOpenConfirmDialogByFundingType] =
        useState(false);

    // State for Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };
    const userId = getCookieValue("User_ID");
    console.log("User_ID", userId);

    // const {colors} = useContext(ColorContext);

    const fetchAndSetClientComplianceData = async () => {
        const data = await fetchClientComplianceData(ClientID);
        setClientComplianceData(data);
        const compliancedata = await fetchData(
            "/api/getComplianceDataAll",
            window.location.href
        );
        setComplianceOptions(compliancedata.data);
        // setComplianceData(data.data);
        setColumns(data.columns);
    };

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );
            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            const specificRead = WriteData.filter(
                (role) => role.Menu_ID === "m_cprofile" && role.ReadOnly === 0
            );
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    useEffect(() => {
        fetchAndSetClientComplianceData();
        fetchUserRoles(
            "m_cprofile",
            "Client_Profile_Compliance",
            setDisableSection
        );
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true); // Open modal on row click
    };

    const handleSave = async () => {
        // Save the updated compliance data
        try {
            const data = await putData(
                "/api/putClientComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientComplianceData(await fetchClientComplianceData(ClientID));
            handleClearForm();
            setShowModal(false); // Close modal after saving
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        // Confirm delete action
        if (
            !window.confirm("Are you sure you want to delete this compliance record?")
        ) {
            return;
        }
        try {
            const data = await deleteData(
                "/api/deleteClientComplianceData",
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
            ClientID: ClientID,
            Compliance: "",
            Mandotary: null,
            StartDate: "",
            AlertDate: "",
            ExpiryDate: "",
            Message: "",
            Note: "",
            Other: "",
            Completed: false,
            Document: "",
            Upload: "",
            MakeUser: "",
            MakerDate: "",
            UpdateUser: "",
            UpdateTime: "",
            Bucket: "",
            Folder: "",
            File: "",
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

    // Handle "Add Compliance by Funding Type" functionality
    const handleAddComplianceByFundingType = async () => {
        // Open the confirmation dialog
        setOpenConfirmDialogByFundingType(true);
    };

    const confirmAddComplianceByFundingType = async () => {
        setOpenConfirmDialogByFundingType(false); // Close the dialog
        try {
            // Fetch client's general profile data to get funding type
            const profileDataResponse = await fetchData(
                `/api/getClientGeneralProfileDataAll`,
                window.location.href
            );

            console.log("Client general profile data:", profileDataResponse);

            if (profileDataResponse && profileDataResponse.data) {
                // Ensure ClientID is of the same type
                const clientIDStr = ClientID.toString();

                // Find the client in the data
                const clientProfile = profileDataResponse.data.find((item) => {
                    console.log("Comparing:", item.ClientID, "with", clientIDStr);
                    return item.ClientID.toString() === clientIDStr;
                });

                if (!clientProfile) {
                    alert("Client profile not found.");
                    return;
                }

                console.log("Found client profile:", clientProfile);

                const fundingTypes = clientProfile.FundingType;
                if (!fundingTypes) {
                    alert("No funding type assigned to this client.");
                    return;
                }

                // Convert fundingTypes to an array
                let fundingTypeArray = [];
                if (Array.isArray(fundingTypes)) {
                    fundingTypeArray = fundingTypes;
                } else if (typeof fundingTypes === "string") {
                    fundingTypeArray = fundingTypes.split(",").map((type) => type.trim());
                } else {
                    fundingTypeArray = [fundingTypes.toString()];
                }

                console.log("Client's funding types:", fundingTypeArray);

                // Fetch funding type data
                const fundingTypeDataResponse = await fetchData(
                    "/api/getFundingType",
                    window.location.href
                );
                if (fundingTypeDataResponse && fundingTypeDataResponse.data) {
                    const fundingTypeItems = fundingTypeDataResponse.data;
                    // Map funding type IDs to Types
                    const fundingTypeMap = {};
                    fundingTypeItems.forEach((item) => {
                        fundingTypeMap[item.ID.toString()] = item.Type;
                    });

                    console.log("Funding type map:", fundingTypeMap);

                    // Fetch all compliance items from the API
                    const complianceDataResponse = await fetchData(
                        "/api/getComplianceDataAll",
                        window.location.href
                    );
                    if (complianceDataResponse && complianceDataResponse.data) {
                        const complianceItems = complianceDataResponse.data;

                        console.log("Compliance items:", complianceItems);

                        // Filter compliances based on the client's funding types
                        const filteredCompliances = complianceItems.filter((item) => {
                            let complianceFundingTypes = [];
                            if (item.FundingType) {
                                try {
                                    // Assuming FundingType in compliance is a comma-separated string of IDs
                                    complianceFundingTypes = item.FundingType.split(",").map(
                                        (id) => id.trim()
                                    );
                                } catch (e) {
                                    console.error("Error parsing FundingType:", e);
                                    complianceFundingTypes = [];
                                }
                            }

                            // Convert IDs to strings for comparison
                            const complianceFundingTypeIDs = complianceFundingTypes.map(
                                (id) => id.toString()
                            );
                            return fundingTypeArray.some((typeID) =>
                                complianceFundingTypeIDs.includes(typeID)
                            );
                        });

                        console.log("Filtered compliances:", filteredCompliances);

                        if (filteredCompliances.length === 0) {
                            alert(
                                "No compliance items found for the client's funding types."
                            );
                            return;
                        }

                        // Keep track of compliances that were already present
                        let duplicates = [];

                        // Assign filtered compliances to the client
                        for (const compliance of filteredCompliances) {
                            // Check if compliance is already present
                            const complianceAlreadyExists = clientComplianceData.data.some(
                                (item) => item.Compliance === compliance.Description
                            );

                            if (complianceAlreadyExists) {
                                duplicates.push(compliance.Description);
                                continue;
                            }

                            const dataToSave = {
                                Compliance: compliance.Description, // Corrected field name
                                Mandotary: compliance.Mandotary || null,
                                StartDate: "",
                                AlertDate: "",
                                ExpiryDate: "",
                                Message: "",
                                Note: "",
                                Other: "",
                                Completed: false,
                                Document: "",
                                Upload: "",
                                MakeUser: userId,
                                MakerDate: new Date(),
                                UpdateUser: "",
                                UpdateTime: "",
                                Bucket: "",
                                File: "",
                                Folder: "",
                            };

                            // Insert into client_compliance table
                            await postData(
                                `/api/postClientComplianceData/${ClientID}`,
                                dataToSave,
                                window.location.href
                            );
                        }

                        // After assigning compliances, refresh the client's compliance data
                        await fetchAndSetClientComplianceData();

                        if (duplicates.length > 0) {
                            alert(
                                `The following compliances were already present and were not added: ${duplicates.join(
                                    ", "
                                )}`
                            );
                        } else {
                            alert("Compliances assigned by funding type successfully.");
                        }
                    } else {
                        alert("Failed to fetch compliance data.");
                    }
                } else {
                    alert("Failed to fetch funding type data.");
                }
            } else {
                alert("Failed to fetch client profile data.");
            }
        } catch (error) {
            console.error("Error in confirmAddComplianceByFundingType:", error);
            alert("An error occurred while assigning compliances by funding type.");
        }
    };

    const cancelAddComplianceByFundingType = () => {
        setOpenConfirmDialogByFundingType(false); // Close the dialog
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Generate columns dynamically based on the data
    const generateColumns = () => {
        if (
            clientComplianceData &&
            clientComplianceData.data &&
            clientComplianceData.data.length > 0
        ) {
            return Object.keys(clientComplianceData.data[0]).map((key) => ({
                Header: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Camel case to spaced
                accessor: key,
                hide: false,
            }));
        }
        return [];
    };

    // const columns = generateColumns();
    const rowData = Array.isArray(clientComplianceData.data)
        ? clientComplianceData.data
        : [];

  return (
   <>
     <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
       
        {/* AG Grid DataTable */}
       
        <CustomAgGridDataTable2 
        title="Compliance"
        primaryButton={{
          label: "Add Client Compliance",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          // disabled: disableSection,
        }}
        secondaryButton={{
          label: "Add Compliance by Funding Type",
          icon: <MonetizationOnOutlinedIcon/>,
          onClick: handleAddComplianceByFundingType
          // disabled: disableSection,
        }}
        rows={rowData}
        columns={columns}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
        />
      </div>
      {/* Modal for editing selected row data */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered style={{ backgroundColor: "rgba(255,255,255,0.75)" }}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Compliance Data</Modal.Title>
        </Modal.Header>
        <Modal.Body 
       
        >
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
                label="Start Date:"
                value={selectedRowData.StartDate}
                type="date"
                onChange={handleInputChange}
                disabled={disableSection}
              />
            </Col>
            <Col>
              <InputField
                id="AlertDate"
                label="Alert Date:"
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
                label="Expiry Date:"
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
            <Col>
              <Checkbox
                id="Completed"
                checked={selectedRowData.Completed}
                onChange={handleInputChange}
                disabled={disableSection}
                name="checkbox"
                sx={{fontSize:"0.9rem"}}
              /> 
              Completed
            </Col>
          </Row>
        </Modal.Body>

                    <Row style={{padding: "20px"}}>
                        <Col className="d-flex justify-content-end gap-3">

                            <MButton
                                style={{
                                    backgroundColor: "yellow",
                                    padding: "5px 12px",
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


                            {/* <Button onClick={() => setShowModal(false)}
                                    style={{
                                        backgroundColor: "darkgray",
                                        border: "none",
                                        borderRadius: "25px",
                                        padding: "8px 16px",
                                        fontSize: "12px",
                                        width: "115px"
                                    }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} 
                                    style={{
                                        backgroundColor: "blue",
                                        border: "none",
                                        borderRadius: "25px",
                                        padding: "8px 16px",
                                        fontSize: "12px",
                                        width: "115px"
                                    }}>
                                    Save Changes
                                </Button> */}
                        </Col>
                    </Row>
                </Modal>

                {/* Confirmation Dialog for Add Compliance by Funding Type */}
                <Dialog
                    open={openConfirmDialogByFundingType}
                    onClose={cancelAddComplianceByFundingType}
                >
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Do you want to assign compliance(s) by funding type?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <MButton
                            onClick={cancelAddComplianceByFundingType}
                            size="small"
                            label={"Cancel"}
                            style={{backgroundColor: "yellow", color: "white"}}
                        ></MButton>
                        <MButton
                            onClick={confirmAddComplianceByFundingType}
                            color="primary"
                            variant="contained"
                            size="small"
                            label={"Yes"}
                            autoFocus
                            style={{backgroundColor: "blue", color: "white"}}
                        ></MButton>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for messages */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />
            </div>
        </>
    );
};

export default UpdateCompliance;
