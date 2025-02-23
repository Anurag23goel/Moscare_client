import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import {deleteData, fetchData, fetchUserRoles, postData, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Col, Modal, Row} from "react-bootstrap";
import ColorContext from "@/contexts/ColorContext";
import styles from "@/styles/style.module.css";
import GroupsIcon from '@mui/icons-material/Groups';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar,} from "@mui/material";
import EditModal from "@/components/widgets/EditModal";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import EngineeringIcon from '@mui/icons-material/Engineering';

// Fetch compliance template data for the dropdown
export const fetchComplianceTemplateData = async () => {
    try {
        const data = await fetchData(
            "/api/getComplianceTemplateDataAll",
            window.location.href
        );
        console.log("Fetched compliance templates:", data);
        return data;
    } catch (error) {
        console.error("Error fetching compliance templates:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

// Fetch worker compliance data
export const fetchWorkerComplianceData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerComplianceDataByWorkerId/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched worker compliance data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Worker Compliance data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

// Fetch worker general profile data to get assigned roles
export const fetchWorkerGeneralProfileData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerGeneralProfileData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched worker general profile data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Worker General Profile data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

// Fetch worker finance details data to get worker types
export const fetchWorkerFinanceDetailsData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerFinanceDetailsData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched worker finance details data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Worker Finance Details data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateCompliance = ({WorkerID}) => {
    const [workerComplianceData, setWorkerComplianceData] = useState([]);
    const [complianceTemplates, setComplianceTemplates] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        Compliance: "",
        ComplianceName: "",
        Mandatory: "",
        StartDate: "",
        AlertDate: "",
        ExpiryDate: "",
        Message: "",
        Note: "",
        Document: "",
        Upload: "",
    });

    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showAddComplianceModal, setShowAddComplianceModal] = useState(false); // For "Add Single Compliance" modal

    // State for the confirmation dialogs
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openConfirmDialogByWorkerType, setOpenConfirmDialogByWorkerType] =
        useState(false);

    // State for the delete confirmation dialog
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);

    // State for Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    // const {colors} = useContext(ColorContext);

    // Fetch worker compliance data and compliance templates
    const fetchAndSetWorkerComplianceData = async () => {
        const data = await fetchWorkerComplianceData(WorkerID);
        if (data && data.data) {
            setWorkerComplianceData(data.data); // Assuming data.data contains an array of rows
        } else {
            setWorkerComplianceData([]); // Set to an empty array if no data is available
        }
    };

    const fetchAndSetComplianceTemplates = async () => {
        const data = await fetchComplianceTemplateData();
        if (data && data.data) {
            setComplianceTemplates(data.data); // Assuming data.data contains an array of templates
            console.log("Compliance templates:", data.data);
        } else {
            setComplianceTemplates([]); // Set to an empty array if no data is available
        }
    };

    useEffect(() => {
        fetchAndSetWorkerComplianceData();
        fetchAndSetComplianceTemplates();
        fetchUserRoles(
            "m_wprofile",
            "Worker_Profile_Compliance",
            setDisableSection
        );
    }, []);

    useEffect(() => {
        if (workerComplianceData && Array.isArray(workerComplianceData)) {
            console.log("Worker compliance data loaded:", workerComplianceData);
        } else {
            console.warn("No data available or data is not in array format.");
        }
    }, [workerComplianceData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true); // Open modal on row click
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putWorkerComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            await fetchAndSetWorkerComplianceData(); // Refresh data after saving
            handleClearForm();
            setShowModal(false); // Close modal after saving
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    // Save compliance selection from the "Add Single Compliance" modal
    const handleAddComplianceSave = async () => {
        try {
            // Find the selected compliance template by ID
            const selectedTemplate = complianceTemplates.find(
                (template) =>
                    template.ID.toString() === selectedRowData.ComplianceID.toString()
            );

            if (!selectedTemplate) {
                setSnackbarMessage("Please select a compliance.");
                setSnackbarOpen(true);
                return;
            }

            // Check if compliance is already present
            const complianceAlreadyExists = workerComplianceData.some(
                (item) => item.ComplianceName === selectedTemplate.Description
            );

            if (complianceAlreadyExists) {
                setSnackbarMessage("Compliance is already present.");
                setSnackbarOpen(true);
                return;
            }

            const dataToSave = {
                WorkerID: WorkerID,
                Compliance: selectedTemplate.Description, // Use Description instead of ComplianceID
            };

            const response = await postData(
                "/api/addComplianceForWorker", // API route for adding compliance
                dataToSave,
                window.location.href
            );
            console.log("Add Compliance Save clicked:", response);

            if (response.success) {
                await fetchAndSetWorkerComplianceData(); // Refresh data after saving
                handleClearForm();
                setShowAddComplianceModal(false); // Close modal after saving
            } else {
                console.error("Error saving compliance:", response.error);
            }
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    // Handle "Add Compliance by Role" functionality
    const handleAddComplianceByRole = async () => {
        // Open the confirmation dialog
        setOpenConfirmDialog(true);
    };

    const confirmAddComplianceByRole = async () => {
        setOpenConfirmDialog(false); // Close the dialog
        try {
            // Fetch worker's general profile data to get assigned role(s)
            const profileData = await fetchWorkerGeneralProfileData(WorkerID);
            if (profileData && profileData.data && profileData.data.length > 0) {
                const workerProfile = profileData.data[0]; // Access the first object in the array
                console.log("WorkerProfile:", workerProfile);

                const roleIDs = workerProfile.Role; // Assuming 'Role' contains the role ID(s)
                if (!roleIDs) {
                    alert("No role assigned to this worker.");
                    return;
                }

                // Convert roleIDs to an array
                let roleIDArray = [];
                if (Array.isArray(roleIDs)) {
                    roleIDArray = roleIDs;
                } else if (typeof roleIDs === "string") {
                    roleIDArray = roleIDs.split(",").map((roleID) => roleID.trim());
                } else if (typeof roleIDs === "number") {
                    roleIDArray = [roleIDs.toString()];
                } else {
                    roleIDArray = [roleIDs.toString()];
                }

                console.log("RoleIDArray:", roleIDArray);

                // Fetch all compliance items from the API
                const complianceDataResponse = await fetchData(
                    "/api/getWorkerComplianceData",
                    window.location.href
                );
                if (complianceDataResponse && complianceDataResponse.data) {
                    const complianceItems = complianceDataResponse.data;

                    // Filter compliances based on the worker's role(s)
                    const filteredCompliances = complianceItems.filter((item) => {
                        let complianceRoles = [];
                        if (item.WorkerRole) {
                            try {
                                complianceRoles = JSON.parse(item.WorkerRole);
                                if (!Array.isArray(complianceRoles)) {
                                    complianceRoles = [complianceRoles];
                                }
                            } catch (e) {
                                console.error("Error parsing WorkerRole JSON:", e);
                                complianceRoles = [];
                            }
                        }

                        // Convert role IDs to strings for comparison
                        const complianceRoleIDs = complianceRoles.map((id) =>
                            id.toString()
                        );
                        const workerRoleIDs = roleIDArray.map((id) => id.toString());

                        return workerRoleIDs.some((roleID) =>
                            complianceRoleIDs.includes(roleID)
                        );
                    });

                    if (filteredCompliances.length === 0) {
                        alert("No compliance items found for the worker's roles.");
                        return;
                    }

                    // Keep track of compliances that were already present
                    let duplicates = [];

                    // Assign filtered compliances to the worker
                    for (const compliance of filteredCompliances) {
                        // Check if compliance is already present
                        const complianceAlreadyExists = workerComplianceData.some(
                            (item) => item.Compliance === compliance.Description
                        );

                        if (complianceAlreadyExists) {
                            duplicates.push(compliance.Description);
                            continue;
                        }

                        const dataToSave = {
                            WorkerID: WorkerID,
                            Compliance: compliance.Description, // Use Description instead of ComplianceID
                        };
                        await postData(
                            "/api/addComplianceForWorker",
                            dataToSave,
                            window.location.href
                        );
                    }

                    // After assigning compliances, refresh the worker's compliance data
                    await fetchAndSetWorkerComplianceData();

                    if (duplicates.length > 0) {
                        setSnackbarMessage(
                            `The following compliances were already present and were not added: ${duplicates.join(
                                ", "
                            )}`
                        );
                        setSnackbarOpen(true);
                    } else {
                        alert("Compliances assigned by role successfully.");
                    }
                } else {
                    alert("Failed to fetch compliance data.");
                }
            } else {
                alert("Failed to fetch worker profile data.");
            }
        } catch (error) {
            console.error("Error in confirmAddComplianceByRole:", error);
            alert("An error occurred while assigning compliances by role.");
        }
    };

    const cancelAddComplianceByRole = () => {
        setOpenConfirmDialog(false); // Close the dialog
    };

    // Handle "Add Compliance by Worker Type" functionality
    const handleAddComplianceByWorkerType = async () => {
        // Open the confirmation dialog
        setOpenConfirmDialogByWorkerType(true);
    };

    const confirmAddComplianceByWorkerType = async () => {
        setOpenConfirmDialogByWorkerType(false); // Close the dialog
        try {
            // Fetch worker's finance details to get worker type(s)
            const financeData = await fetchWorkerFinanceDetailsData(WorkerID);
            if (financeData && financeData.data && financeData.data.length > 0) {
                const workerFinance = financeData.data[0]; // Access the first object in the array
                console.log("WorkerFinance:", workerFinance);

                const workerTypes = workerFinance.WorkerType; // Assuming 'WorkerType' contains the worker type(s)
                if (!workerTypes) {
                    alert("No worker type assigned to this worker.");
                    return;
                }

                // Convert workerTypes to an array
                let workerTypeArray = [];
                if (Array.isArray(workerTypes)) {
                    workerTypeArray = workerTypes;
                } else if (typeof workerTypes === "string") {
                    workerTypeArray = workerTypes.split(",").map((type) => type.trim());
                } else {
                    workerTypeArray = [workerTypes.toString()];
                }

                console.log("WorkerTypeArray:", workerTypeArray);

                // Fetch all compliance items from the API
                const complianceDataResponse = await fetchData(
                    "/api/getWorkerComplianceData",
                    window.location.href
                );
                if (complianceDataResponse && complianceDataResponse.data) {
                    const complianceItems = complianceDataResponse.data;

                    // Filter compliances based on the worker's type(s)
                    const filteredCompliances = complianceItems.filter((item) => {
                        let complianceWorkerTypes = [];
                        if (item.WorkerType) {
                            try {
                                complianceWorkerTypes = JSON.parse(item.WorkerType);
                                if (!Array.isArray(complianceWorkerTypes)) {
                                    complianceWorkerTypes = [complianceWorkerTypes];
                                }
                            } catch (e) {
                                console.error("Error parsing WorkerType JSON:", e);
                                complianceWorkerTypes = [];
                            }
                        }

                        // Convert types to strings for comparison
                        const complianceWorkerTypeIDs = complianceWorkerTypes.map((id) =>
                            id.toString()
                        );
                        const workerTypeIDs = workerTypeArray.map((id) => id.toString());

                        return workerTypeIDs.some((typeID) =>
                            complianceWorkerTypeIDs.includes(typeID)
                        );
                    });

                    if (filteredCompliances.length === 0) {
                        alert("No compliance items found for the worker's types.");
                        return;
                    }

                    // Keep track of compliances that were already present
                    let duplicates = [];

                    // Assign filtered compliances to the worker
                    for (const compliance of filteredCompliances) {
                        // Check if compliance is already present
                        const complianceAlreadyExists = workerComplianceData.some(
                            (item) => item.Compliance === compliance.Description
                        );

                        if (complianceAlreadyExists) {
                            duplicates.push(compliance.Description);
                            continue;
                        }

                        const dataToSave = {
                            WorkerID: WorkerID,
                            Compliance: compliance.Description, // Use Description instead of ComplianceID
                        };
                        await postData(
                            "/api/addComplianceForWorker",
                            dataToSave,
                            window.location.href
                        );
                    }

                    // After assigning compliances, refresh the worker's compliance data
                    await fetchAndSetWorkerComplianceData();

                    if (duplicates.length > 0) {
                        setSnackbarMessage(
                            `The following compliances were already present and were not added: ${duplicates.join(
                                ", "
                            )}`
                        );
                        setSnackbarOpen(true);
                    } else {
                        alert("Compliances assigned by worker type successfully.");
                    }
                } else {
                    alert("Failed to fetch compliance data.");
                }
            } else {
                alert("Failed to fetch worker finance data.");
            }
        } catch (error) {
            console.error("Error in confirmAddComplianceByWorkerType:", error);
            alert("An error occurred while assigning compliances by worker type.");
        }
    };

    const cancelAddComplianceByWorkerType = () => {
        setOpenConfirmDialogByWorkerType(false); // Close the dialog
    };

    // Modify handleDelete to open the confirmation dialog
    const handleDelete = () => {
        setOpenDeleteConfirmDialog(true);
    };

    // Confirm delete action
    const confirmDelete = async () => {
        setOpenDeleteConfirmDialog(false); // Close the delete confirmation dialog
        try {
            const data = await deleteData(
                "/api/deleteWorkerComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            await fetchAndSetWorkerComplianceData(); // Refresh data after deleting
            setShowModal(false); // Close modal after deleting
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    // Cancel delete action
    const cancelDelete = () => {
        setOpenDeleteConfirmDialog(false); // Close the delete confirmation dialog
    };

    const handleClearForm = () => {
        setSelectedRowData({
            WorkerID: WorkerID,
            Compliance: "",
            ComplianceName: "",
            Mandatory: "",
            StartDate: "",
            AlertDate: "",
            ExpiryDate: "",
            Message: "",
            Note: "",
            Document: "",
            Upload: "",
        });
    };

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedRowData((prevData) => ({
            ...prevData,
            Upload: file,
        }));
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const generateFolderPath = (company, compliance, filename) => {
        return `${company}/worker/${WorkerID}/compliance/${compliance}/${filename}`;
    };

    // Handle file upload from the Upload column
    const handleFileUpload = async (file, rowData) => {
        console.log(file);
        console.log(rowData);
        console.log(file.name)

        try {
            // Implement your file upload logic here
            console.log("Reached Here")
            const company = process.env.NEXT_PUBLIC_COMPANY; // Replace with logic to get company name
            const compliance = rowData.Compliance;
            const fileName = file.name;

            const FolderPath = generateFolderPath(company, compliance, fileName);
            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const response = await postData("/api/postS3Data", {
                FolderPath,
            });

            const {uploadURL} = response;

            if (!uploadURL) {
                console.error("Failed to get pre-signed URL.");
                //setIsSubmitting(false);
                return;
            }

            const uploadRes = await fetch(uploadURL, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (uploadRes.ok) {
                console.log("Till Here")
                console.log("File uploaded successfully!");
                const combinedData = {
                    ...rowData,
                    Folder: folderforDB,
                    Bucket: "moscaresolutions",
                    File: FileNameforDB,
                };

                const insertResponse = await putData(
                    "/api/putWorkerComplianceData",
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    console.error("Client Compliance added successfully");
                    clearForm();
                    await fetchAndSetWorkerComplianceData();
                } else {
                    console.error("Failed to add client Compliance");
                }

                // Optionally, refresh the data table to reflect any changes
            } /* else {
        // Handle error
        console.error("Error uploading file:");
        setSnackbarMessage(`Error uploading file`);
        setSnackbarOpen(true);
      } */
        } catch (error) {
            console.error("Error in handleFileUpload:", error);
            setSnackbarMessage("An error occurred while uploading the file.");
            setSnackbarOpen(true);
        }
    };

    // Dynamically generate columns based on the first data object
    const generateColumns = () => {
        if (workerComplianceData && workerComplianceData.length > 0) {
            return Object.keys(workerComplianceData[0]).map((key) => ({
                Header: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Camel case to spaced
                accessor: key,
                hide: false,
            }));
        }
        return [];
    };

    // Ensure workerComplianceData is always an array
    const columns = generateColumns();
    const rowData = Array.isArray(workerComplianceData)
        ? workerComplianceData
        : []; // Ensure rowData is an array

    // Map compliance templates to options
    const complianceOptions = complianceTemplates.map((template) => ({
        value: template.ID,
        label: template.Description,
    }));


    const fields = [
        {
            id: "Compliance",
            label: "Compliance",
            type: "select",
            value: selectedRowData.Compliance,
            onChange: handleInputChange,
            options: complianceTemplates.map((template) => ({
                value: template.ID,
                label: template.TemplateName,
            })),
            placeholder: "Select Compliance",
        },
    ];
    return (
        <>
            <div className="pt-5">

                <div className={styles.spaceBetween}>
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Compliance
                        </h2>
                    </div>

                    <div>
                        <Row style={{display: "flex", justifyContent: "start"}}>
                            <Col md="auto">
                                <button
                                    onClick={() => setShowAddComplianceModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <AddIcon/>
                                    <span>Add Single Compliance</span>
                                </button>


                            </Col>
                            <Col md="auto">
                                <button
                                    onClick={handleAddComplianceByRole}
                                    className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <GroupsIcon/>
                                    <span>Add Compliance by Role</span>
                                </button>

                            </Col>
                            <Col md="auto">
                                <button
                                    onClick={handleAddComplianceByWorkerType}
                                    className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <EngineeringIcon/>
                                    <span>Add Compliance by Worker Type</span>
                                </button>

                            </Col>
                        </Row>
                    </div>
                </div>

                {/* AG Grid DataTable */}
                <AgGridDataTable
                    rows={rowData}
                    columns={columns.filter(
                        (col) =>
                            ![
                                'Bucket',
                                'File',
                                'Folder',
                                'Update User',
                                'Make User',
                                'Maker Date',
                                'Upload',
                                'Update Time',
                                'Effective Competent',

                            ].includes(col.Header)
                    )}
                    rowSelected={handleSelectRowClick}
                    showUploadColumn={true} // Added this prop to display the Upload column
                    onUpload={handleFileUpload} // Added this handler to manage file uploads
                />
            </div>

            {/* Modal for editing selected row data */}
            <Modal show={showModal} centered sx={{backgroundColor: "#fff"}} onHide={() => setShowModal(false)}>
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

                        <Col md={4}>
                            <InputField
                                id="ExpiryDate"
                                label="Expiry Date:"
                                value={selectedRowData.ExpiryDate}
                                type="date"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col md={4}>
                            <InputField
                                id="Note"
                                label="Note:"
                                value={selectedRowData.Note}
                                type="textarea"
                                onChange={handleInputChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>

                </Modal.Body>

                <Row style={{padding: "20px"}}>


                    <Col className="d-flex justify-content-end gap-3">
                        <MButton
                            label="Cancel"
                            style={{
                                backgroundColor: "yellow",
                                padding: "5px 12px",
                                color: "#fff"
                            }}
                            onClick={handleSave}
                            disabled={disableSection}
                            startIcon={<CancelIcon/>}
                            size={"small"}
                        />
                        <MButton
                            label="Save Changes"
                            startIcon={<SaveIcon/>}
                            style={{
                                backgroundColor: "blue",
                                padding: "5px 12px",
                                color: "#fff"
                            }}
                            onClick={() => setShowModal(false)} // Open confirmation dialog
                            disabled={disableSection}
                            size={"small"}
                        />
                    </Col>
                </Row>
            </Modal>

            {/* Modal for Adding Single Compliance */}
            {/* <Modal
        show={showAddComplianceModal}
        onHide={() => setShowAddComplianceModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Single Compliance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Col} controlId="ComplianceID">
              <Form.Label>Compliance:</Form.Label>
              <Form.Control
                as="select"
                value={selectedRowData.ComplianceID}
                onChange={handleInputChange}
                id="ComplianceID"
              >
                <option value="">Select Compliance</option>
                {complianceTemplates.map((template) => (
                  <option key={template.ID} value={template.ID}>
                    {template.TemplateName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Row style={{ padding: "20px" }}>
          <Col className="d-flex justify-content-end">
            <MButton
              label="Save"
              style={{ backgroundColor: "blue", color: "white" }}
              onClick={handleAddComplianceSave} // Save compliance to worker
              size="small"
            />
          </Col>
        </Row>
      </Modal> */}
            <EditModal
                show={showAddComplianceModal}
                onClose={() => setShowAddComplianceModal(false)}
                onSave={() => handleAddComplianceSave()}
                modalTitle="Add Single Compliance"
                fields={fields}
                data={selectedRowData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />

            {/* Confirmation Dialog for Add Compliance by Role */}
            <Dialog open={openConfirmDialog} onClose={cancelAddComplianceByRole}>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to assign compliance(s) by role?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MButton
                        onClick={cancelAddComplianceByRole}
                        size="small"
                        label={"Cancel"}
                        style={{backgroundColor: "yellow", color: "white"}}
                    ></MButton>
                    <MButton
                        onClick={confirmAddComplianceByRole}
                        color="primary"
                        size="small"
                        label={"Yes"}
                        autoFocus
                        style={{backgroundColor: "blue", color: "white"}}
                    ></MButton>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog for Add Compliance by Worker Type */}
            <Dialog
                open={openConfirmDialogByWorkerType}
                onClose={cancelAddComplianceByWorkerType}
            >
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to assign compliance(s) by worker type?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MButton
                        onClick={cancelAddComplianceByWorkerType}
                        size="small"
                        label={"Cancel"}
                        style={{backgroundColor: "yellow", color: "white"}}
                    ></MButton>
                    <MButton
                        onClick={confirmAddComplianceByWorkerType}
                        color="primary"
                        variant="contained"
                        size="small"
                        label={"Yes"}
                        autoFocus
                        style={{backgroundColor: "blue", color: "white"}}
                    ></MButton>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog for Delete */}
            <Dialog open={openDeleteConfirmDialog} onClose={cancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this compliance?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MButton
                        onClick={cancelDelete}
                        size="small"
                        label={"Cancel"}
                        style={{backgroundColor: "yellow", color: "white"}}
                    ></MButton>
                    <MButton
                        onClick={confirmDelete}
                        color="primary"
                        variant="contained"
                        size="small"
                        label={"Yes"}
                        autoFocus
                        style={{backgroundColor: "blue", color: "white"}}
                    ></MButton>
                </DialogActions>
            </Dialog>

            {/* Snackbar for duplicate compliance message */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </>
    );
};

export default UpdateCompliance;
