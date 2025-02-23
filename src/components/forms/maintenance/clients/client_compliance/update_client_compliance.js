import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, postData, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import {Checkbox, Snackbar} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiAlert from "@mui/material/Alert";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CancelIcon from "@mui/icons-material/Cancel";
import GppBadIcon from '@mui/icons-material/GppBad'; // Alert component for the Snackbar
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {Link, Plus, Unlink, UserPlus, Users} from "lucide-react";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const fetchClientComplianceData = async () => {
    try {
        const data = await fetchData(
            "/api/getComplianceDataAll",
            window.location.href
        );
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Mandatory: !!item.Mandatory,
                NoExpiryDate: !!item.NoExpiryDate,
                NoStartDate: !!item.NoStartDate,
            })),
        };
        return transformedData;
    } catch (error) {
        console.error("Error fetching clientCompliance data:", error);
    }
};

// Fetch funding types data from the table 'maint_client_funding_type'
const fetchFundingTypeData = async () => {
    try {
        const response = await fetchData("/api/getFundingType", window.location.href);
        return response.data; // Assuming response.data is an array
    } catch (error) {
        console.error("Error fetching funding type data:", error);
        return [];
    }
};

const UpdateClientCompliance = ({
                                    clientComplianceData,
                                    setClientComplianceData,
                                    setShowForm,
                                }) => {

    const [selectedRowData, setSelectedRowData] = useState({
        Description: "",
        ExpiryDays: "",
        WarningDays: "",
        Mandatory: false,
        NoExpiryDate: false,
        NoStartDate: false,
        FundingType: "", IsActive: "",
      Delete: "",
    });

    console.log("Selected Row Data:", selectedRowData);

    const [disableSection, setDisableSection] = useState(false);
    const [showFundingTypeModal, setShowFundingTypeModal] = useState(false);
    const [showRemoveFundingTypeModal, setShowRemoveFundingTypeModal] = useState(false);
    const [fundingTypes, setFundingTypes] = useState([]);
    const [selectedFundingTypes, setSelectedFundingTypes] = useState([]);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    // Open the modal and fetch funding types
    const handleOpenFundingTypeModal = async () => {
        setSelectedFundingTypes([]);
        const types = await fetchFundingTypeData();
        setFundingTypes(types);
        setSelectedFundingTypes(selectedRowData.FundingType?.split(",") || []);
        setShowFundingTypeModal(true);
    };

    // Open the modal for removing funding types
    const handleOpenRemoveFundingTypeModal = () => {
        setShowRemoveFundingTypeModal(true);
    };

    // Close the modal
    const handleCloseFundingTypeModal = () => {
        setShowFundingTypeModal(false);
    };

    // Close the modal for removing funding types
    const handleCloseRemoveFundingTypeModal = () => {
        setShowRemoveFundingTypeModal(false);
    };

    // Handle selection of funding types (checkbox)
    const handleFundingTypeCheckboxChange = (checked, fundingType) => {
        if (checked) {
            setSelectedFundingTypes([...selectedFundingTypes, fundingType]);
        } else {
            setSelectedFundingTypes(selectedFundingTypes.filter(type => type !== fundingType));
        }
    };


    useEffect(() => {
        const fetchAndSetClientComplianceData = async () => {
            const data = await fetchClientComplianceData();
            setClientComplianceData(data);
            setColumns(getColumns(data))

        };
        fetchAndSetClientComplianceData();
        fetchUserRoles('m_maint_client_comp', "Maintainence_Client_Compliance", setDisableSection);
    }, [setClientComplianceData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
            ...row,
            //Mandatory: !!row.Mandatory,
            //NoExpiryDate: !!row.NoExpiryDate,
            //NoStartDate: !!row.NoStartDate,
        IsActive: row.IsActive,
            Delete: row.Delete,
        });
        setShowModal(true);

        console.log("Selected Row Data:", row)
    };

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleSave = async () => {
        try {
            const payload = {
          ...selectedRowData,
          // Ensure the payload values are "Y" or "N"
          IsActive: selectedRowData.IsActive === "N" ? "N" : "Y",
          Delete: selectedRowData.Delete === "N" ? "N" : "Y",
        };

            constdata = await putData(
                "/api/putComplianceData",
                payload,
                window.location.href
            );
            setClientComplianceData(await fetchClientComplianceData());
            // setSnackbar({ open: true, message: 'Data saved successfully!', severity: 'success' });
            addValidationMessage("Client Compliance updated successfully", "success");

            handleClearForm();
        } catch (error) {
            console.error("Error saving clientCompliance data:", error);
            // setSnackbar({ open: true, message: 'Error saving data!', severity: 'error' });
            addValidationMessage("Failed to update Client Compliance data ", "error");

        }

        setShowModal(false);

    };
    const handleCloseModal = () => setShowModal(false);

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteComplianceData",
                selectedRowData,
                window.location.href
            );
            handleClearForm();
            setClientComplianceData(await fetchClientComplianceData());
            setSnackbar({open: true, message: 'Data deleted successfully!', severity: 'success'});
        } catch (error) {
            console.error("Error deleting clientCompliance data:", error);
            setSnackbar({open: true, message: 'Error deleting data!', severity: 'error'});
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Description: "",
            ExpiryDays: "",
            WarningDays: "",
            Mandatory: false,
            NoExpiryDate: false,
            NoStartDate: false,
        IsActive: "",
            Delete: "",
        });
    };

    // const handleInputChange = (event) => {
    //   const { id, type, checked, value } = event.target;
    //   setSelectedRowData((prevData) => ({
    //     ...prevData,
    //     [id]: type === "checkbox" ? checked : value,
    //   }));
    // };

    const handleInputChange = ({id, value, type}) => {
      if ((id === "IsActive" || id === "Delete") && type === "checkbox") {
        // value is a boolean
        const intendedValue = value ? "Y" : "N"; // Convert boolean to "Y"/"N"
        let message = "";
        if (id === "IsActive") {
          message = value
            ? "Are you sure you want to activate this address?"
            : "Are you sure you want to deactivate this address?";
        } else if (id === "Delete") {
          message = value
            ? "Are you sure you want to mark this address as deleted?"
            : "Are you sure you want to restore this address?";
        }

        setConfirmDialog({ open: true, field: id, message, newValue: intendedValue });
      } else {
          setSelectedRowData((prevState) => ({...prevState, [id]: value}));
      }
    };

    // Add Funding Type to the compliance record
    const handleAddFundingType = async () => {
        try {
            const fundingTypeString = selectedFundingTypes.join(","); // Combine selected funding types into a string
            const dataToSend = {
                ...selectedRowData,
                FundingType: fundingTypeString, // Assign the selected funding types to the FundingType field
            };
            const response = await putData(
                "/api/putComplianceData",
                dataToSend,
                window.location.href
            );
            if (response.success) {
                setSnackbar({open: true, message: 'Funding type added successfully!', severity: 'success'});
                setClientComplianceData(await fetchClientComplianceData()); // Re-render the table with updated data
            } else {
                throw new Error('Failed to update funding types');
            }
        } catch (error) {
            console.error("Error adding funding type:", error);
            setSnackbar({open: true, message: 'Failed to add funding type!', severity: 'error'});
        }
        setShowFundingTypeModal(false);
    };

    // Remove all funding types from the compliance record
    const handleRemoveFundingType = async () => {
        try {
            const dataToSend = {
                ...selectedRowData,
                FundingType: "", // Clear all funding types
            };
            const response = await putData(
                "/api/putComplianceData",
                dataToSend,
                window.location.href
            );
            if (response.success) {
                setSnackbar({open: true, message: 'Funding types removed successfully!', severity: 'success'});
                setClientComplianceData(await fetchClientComplianceData()); // Re-render the table with updated data
            } else {
                throw new Error('Failed to remove funding types');
            }
        } catch (error) {
            console.error("Error removing funding types:", error);
            setSnackbar({open: true, message: 'Failed to remove funding types!', severity: 'error'});
        }
        setShowRemoveFundingTypeModal(false);
    };

    const handleSnackbarClose = () => {
        setSnackbar({...snackbar, open: false});
    };

    const handleAddToAllClients = async () => {
        try {
            const data = {
                ComplianceID: selectedRowData.ID
            };
            const response = await postData('/api/addClientComplianceToAllClients', data, window.location.href);
            if (response.success) {
                //setDialog({open: true, title: 'Success', message: 'Added to all clients successfully.'});
                console.log("Added to all clients successfully")
            } else {
                throw new Error('Failed to add to all clients');
            }
        } catch (error) {
            console.error("Error adding to all clients:", error);
            //setDialog({open: true, title: 'Error', message: 'Failed to add to all clients. ' + error.message});
        }
    }

    const handleAddToClientsByFundingType = async () => {
        try {
            const data = {
                ComplianceID: selectedRowData.ID
            };
            const response = await postData('/api/addClientComplianceToFundingTypes', data, window.location.href);
            if (response.success) {
                //setDialog({open: true, title: 'Success', message: 'Added to all clients successfully.'});
                console.log("Added to clients by funding type successfully");
            } else {
                throw new Error('Failed to add to clients by funding type');
            }
        } catch (error) {
            console.error("Error adding to clients:", error);
            //setDialog({open: true, title: 'Error', message: 'Failed to add to all clients. ' + error.message});
        }
    }

    const modalFields = [
        {id: "Description", label: "Description", type: "text"},
        {id: "ExpiryDays", label: "Expiry Days", type: "number"},
        {id: "WarningDays", label: "Warning Days", type: "number"},
        {id: "Mandatory", label: "Mandatory", type: "checkbox"},
        {id: "NoStartDate", label: "No Start Date", type: "checkbox"},
        {id: "NoExpiryDate", label: "No Expiry Date", type: "checkbox"},
        {
            id: "IsActive",
        label: "Active",
        type: "checkbox",
        value: selectedRowData.IsActive, // now a boolean
      },
      {
        id: "Delete",
        label: "Mark as Deleted",
        type: "checkbox",
        value: selectedRowData.Delete, // now a boolean
      },
    ];


    return (
        <>
            <div className="min-h-screen gradient-background">

                <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Client Compliance
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage compliance requirements and funding types
                            </p>
                        </div>

                        <button
                            onClick={() => setShowForm(true)}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4"/>
                            <span>Add Compliance</span>
                        </button>
                    </div>

                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setShowFundingTypeModal(true)}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                            >
                                <Link className="h-4 w-4"/>
                                <span>Link Funding Type</span>
                            </button>

                            <button
                                onClick={() => setShowRemoveFundingTypeModal(true)}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                            >
                                <Unlink className="h-4 w-4"/>
                                <span>Remove Funding Type</span>
                            </button>

                            <button
                                onClick={handleAddToClientsByFundingType}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                            >
                                <UserPlus className="h-4 w-4"/>
                                <span>Add to Clients by Funding</span>
                            </button>

                            <button
                                onClick={handleAddToAllClients}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                            >
                                <Users className="h-4 w-4"/>
                                <span>Add to All Clients</span>
                            </button>
                        </div>
                    </div>


                    <CustomAgGridDataTable2


                        rows={clientComplianceData?.data}
                        rowSelected={handleSelectRowClick}
                        handleRowUnselected={handleRowUnselected}
                        columns={columns}
                    />
                </div>
            </div>
            {/* Funding Type Modal */}
            <Dialog open={showFundingTypeModal} onClose={handleCloseFundingTypeModal} maxWidth="md" fullWidth>
                <DialogTitle>Select Funding Types</DialogTitle>
                <DialogContent>
                    <div style={{display: "flex", flexDirection: "column", marginBottom: "1rem"}}>
                        {fundingTypes.map(fundingType => (
                            <FormControlLabel
                                key={fundingType.ID}
                                control={
                                    <Checkbox
                                        checked={selectedFundingTypes.includes(fundingType.ID)}
                                        onChange={e => handleFundingTypeCheckboxChange(e.target.checked, fundingType.ID)}
                                    />
                                }
                                label={fundingType.Type}
                            />
                        ))}
                    </div>
                    <div>
                        <strong>Selected Funding Types:</strong>
                        <ul>
                            {selectedRowData.FundingTypeDesc?.split(",").map(fundingType => (
                                <li key={fundingType}>{fundingType}</li>
                            ))}
                        </ul>
                    </div>
                </DialogContent>
                <DialogActions>
                    {/* <MButton label={"Cancel"} onClick={handleCloseFundingTypeModal} color="secondary">Cancel</MButton>
          <MButton label={"Add"} style={{ margin: "20px 15px 30px 15px" }} onClick={handleAddFundingType} color="primary">Add Funding Type</MButton> */}
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
                        onClick={handleCloseFundingTypeModal}
                        size="small"
                    />

                    <MButton
                        style={{
                            backgroundColor: "blue",
                            padding: "5px 12px",
                        }}
                        label="Add Funding Type"
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleIcon/>}
                        onClick={handleAddFundingType}
                        size="small"
                    />
                </DialogActions>
            </Dialog>

            {/* Remove Funding Type Modal */}
            <Dialog open={showRemoveFundingTypeModal} onClose={handleCloseRemoveFundingTypeModal} maxWidth="md"
                    fullWidth>
                <DialogTitle>Remove All Funding Types</DialogTitle>
                <DialogContent>
                    <div>
                        <p>
                            The following funding types will be removed:
                        </p>
                        <ul>
                            {selectedRowData.FundingTypeDesc?.split(",").map(fundingType => (
                                <li key={fundingType}>{fundingType}</li>
                            ))}
                        </ul>
                    </div>
                </DialogContent>
                <DialogActions>
                    {/* <MButton label={"Cancel"} onClick={handleCloseRemoveFundingTypeModal} color="secondary">Cancel</MButton>
          <MButton label={"Remove"}  onClick={handleRemoveFundingType} color="primary">Remove Funding Types</MButton> */}
                    <MButton
                        style={{
                            backgroundColor: "yellow",
                            padding: "5px 12px",
                            marginRight: "0.5rem",
                        }}
                        label="Cancel"
                        variant="contained"
                        color="primary"
                        startIcon={<CancelIcon/>}
                        onClick={handleCloseRemoveFundingTypeModal}
                        size="small"
                    />

                    <MButton
                        style={{
                            backgroundColor: "blue",
                            padding: "5px 12px",
                        }}
                        label="Remove Funding Types"
                        variant="contained"
                        color="primary"
                        startIcon={<GppBadIcon/>}
                        onClick={handleRemoveFundingType}
                        size="small"

                    />
                </DialogActions>
            </Dialog>

            {/* Snackbar for Success/Error Messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Compliance Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />


        </>
    );
};

  export default UpdateClientCompliance;
