import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, postData, putData} from "@/utility/api_utility";
import {Checkbox} from "@mui/material";
import Modal from "react-modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@/components/widgets/Button";
import LinkedItems from "@/components/forms/maintenance/workers/worker_compliance/LinkedItems";
import ColorContext from "@/contexts/ColorContext";
import DialogBox from "@/components/widgets/Dialog";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {Link, Plus, Unlink, UserPlus, Users} from "lucide-react";

export const fetchComplianceItemsData = async () => {
    try {
        const data = await fetchData("/api/getWorkerComplianceData", window.location.href);
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching area data:", error);
    }
};

const fetchWorkerRoles = async () => {
    try {
        const data = await fetchData("/api/getRole", window.location.href);
        return data.data;
    } catch (error) {
        console.error("Error fetching role data:", error);
        return []; // Return an empty array in case of error
    }
};

const UpdateWorkerCompliance = ({
                                    setComplianceItemsData,
                                    complianceItemsData,
                                    setShowForm,
                                }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        IsActive: "",
        Delete: "",
    });
    console.log("Selected Row Data:", selectedRowData);
    const [linkedRoles, setLinkedRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [showRoleLinkForm, setShowRoleLinkForm] = useState(false);
    const [workerRoles, setWorkerRoles] = useState([]);
    const [selectedWorkerTypes, setSelectedWorkerTypes] = useState([]);
    const [linkedWorkerTypes, setLinkedWorkerTypes] = useState([]);
    const [workerTypes, setWorkerTypes] = useState([]);
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [dialog, setDialog] = useState({open: false, title: "", message: ""});
    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([]);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetComplianceItemsData = async () => {
            try {
                const [
                    complianceData,
                    // No need to fetch roles here since it's done in another useEffect
                ] = await Promise.all([
                    fetchComplianceItemsData(),
                ]);
                setComplianceItemsData(complianceData);
                setColumns(getColumns(complianceData));
            } catch (error) {
                console.error("Error fetching compliance items:", error);
            }
        };
        fetchAndSetComplianceItemsData();
        fetchUserRoles("m_wrkr_compliance", "Maintainence_Worker_Compliance", setDisableSection);
    }, []);

    useEffect(() => {
        const fetchAndSetWorkerRoles = async () => {
            const rolesData = await fetchWorkerRoles();
            setWorkerRoles(rolesData);
        };
        fetchAndSetWorkerRoles();
    }, []);

    useEffect(() => {
        if (selectedRowData.ComplianceID) {
            fetchLinkedRoles();
        }
    }, [selectedRowData.ComplianceID]);

    useEffect(() => {
        if (selectedRowData.ComplianceID) {
            fetchLinkedTypes();
        }
    }, [selectedRowData.ComplianceID]);

    useEffect(() => {
        if (showRoleLinkForm || showTypeForm) {
            fetchLinkedRoles();
            fetchLinkedTypes();
        }
    }, [showRoleLinkForm, showTypeForm]);

    const fetchWorkerTypes = async () => {
        try {
            const response = await fetchData("/api/getWorkerTypes", window.location.href);
            if (response.success) {
                setWorkerTypes(response.data);
            }
        } catch (error) {
            console.error("Error fetching worker types:", error);
        }
    };

    const fetchLinkedRoles = async () => {
        if (!selectedRowData.ComplianceID) return;
        try {
            const response = await fetchData(
                `/api/getLinkedRoles/${selectedRowData.ComplianceID}`,
                window.location.href
            );
            if (response.success) {
                setLinkedRoles(response.data);
                setSelectedRoles(response.data.map((role) => role.RoleID));
            } else {
                setLinkedRoles([]);
                setSelectedRoles([]);
            }
        } catch (error) {
            console.error("Error fetching linked roles:", error);
            setLinkedRoles([]);
            setSelectedRoles([]);
        }
    };

    const fetchLinkedTypes = async () => {
        if (!selectedRowData.ComplianceID) return;
        try {
            const response = await fetchData(
                `/api/getLinkedWorkerTypes/${selectedRowData.ComplianceID}`,
                window.location.href
            );

            // Log the response for debugging
            console.log("API Response:", response);
            console.log("Linked Worker Types (data):", response.data);

            // If response.data is a string, split it into an array
            if (typeof response.data === "string") {
                const workerTypesArray = response.data
                    .split(",")
                    .map((type) => type.trim());
                setLinkedWorkerTypes(workerTypesArray); // Update linkedWorkerTypes
                setSelectedWorkerTypes(workerTypesArray); // Update selected worker types
            } else {
                console.error("Expected string, but received:", response.data);
                setLinkedWorkerTypes([]);
                setSelectedWorkerTypes([]);
            }
        } catch (error) {
            console.error("Error fetching linked worker types:", error);
            setLinkedWorkerTypes([]);
            setSelectedWorkerTypes([]);
        }
    };

    useEffect(() => {
        const workerTypes = [
            {ID: "Admin", Type: "Admin"},
            {ID: "Applicant", Type: "Applicant"},
            {ID: "Broker", Type: "Broker"},
            {ID: "Casual", Type: "Casual"},
            {ID: "Contractor", Type: "Contractor"},
            {ID: "Employee", Type: "Employee"},
            {ID: "Employee - Full Time", Type: "Employee - Full Time"},
            {ID: "Employee - Part Time", Type: "Employee - Part Time"},
            {ID: "Independent Support Worker", Type: "Independent Support Worker"},
            {ID: "Service Provider", Type: "Service Provider"},
            {ID: "Supplier", Type: "Supplier"},
            {ID: "Support Worker", Type: "Support Worker"},
            {ID: "Terminated", Type: "Terminated"},
            {ID: "Volunteer", Type: "Volunteer"},
            {ID: "* Unallocated", Type: "* Unallocated"},
        ];
        setWorkerTypes(workerTypes);
    }, []);

    const handleLinkRoles = async () => {
        try {
            const data = {
                ComplianceID: selectedRowData.ComplianceID,
                roles: selectedRoles,
            };
            console.log("Linking roles:", data);
            const response = await putData(
                "/api/insertRoleLinks",
                data,
                window.location.href
            );
            if (response.success) {
                setDialog({
                    open: true,
                    title: "Success",
                    message: "Roles linked successfully.",
                });
                setLinkedRoles(
                    await fetchData(
                        `/api/getLinkedRoles/${selectedRowData.ComplianceID}`,
                        window.location.href
                    )
                );
            }
            // fetch table data
            setComplianceItemsData(await fetchComplianceItemsData());
        } catch (error) {
            console.error("Error linking roles:", error);
            setDialog({
                open: true,
                title: "Error",
                message: "Failed to link roles.",
            });
        } finally {
            setShowRoleLinkForm(false);
        }
    };

    const handleLinkWorkerTypes = async () => {
        try {
            const data = {
                ComplianceID: selectedRowData.ComplianceID,
                workerTypes: selectedWorkerTypes,
            };
            const response = await putData(
                "/api/insertWorkerTypeLinks",
                data,
                window.location.href
            );
            if (response.success) {
                setLinkedWorkerTypes(
                    await fetchData(
                        `/api/getLinkedWorkerTypes/${selectedRowData.ComplianceID}`,
                        window.location.href
                    )
                );
                setDialog({
                    open: true,
                    title: "Success",
                    message: "Worker types linked successfully.",
                });
            } else {
                throw new Error("Failed to link worker types");
            }
            setComplianceItemsData(await fetchComplianceItemsData());
        } catch (error) {
            console.error("Error linking worker types:", error);
            setDialog({
                open: true,
                title: "Error",
                message: "Failed to link worker types. " + error.message,
            });
        } finally {
            setShowTypeForm(false);
        }
    };

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
            ...row,
            IsActive: row.IsActive,
            Delete: row.Delete,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...selectedRowData,
                // Ensure the payload values are "Y" or "N"
                IsActive: selectedRowData.IsActive ? "Y" : "N",
                Delete: selectedRowData.Delete ? "Y" : "N",
            };
            selectedRowData.UpdateUser = sessionStorage.getItem("email");
            selectedRowData.UpdateDate = new Date();
            const data = await putData(
                "/api/updateWorkerComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            addValidationMessage("Worker Compliance updated successfully", "success");

            setComplianceItemsData(await fetchComplianceItemsData());
        } catch (error) {
            addValidationMessage("Failed to update Worker Compliance data ", "error");

            console.error("Error fetching area data:", error);
        }
        setShowModal(false);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                `/api/deleteWorkerComplianceData/`,
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setComplianceItemsData(await fetchComplianceItemsData());
        } catch (error) {
            console.error("Error fetching area data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Description: "",
            ExpiryDays: "",
            WarningDays: "",
            Mandatory: "",
            NoExpiryDate: "",
            VisibleToWorker: "",
            NoStartDate: "",
            IsActive: "",
            Delete: "",
        });
    };

    // const handleInputChange = (event) => {
    //   const value =
    //     event.target.type === "checkbox"
    //       ? event.target.checked
    //       : event.target.value;
    //   setSelectedRowData({
    //     ...selectedRowData,
    //     [event.target.id]: value,
    //   });
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

            setConfirmDialog({open: true, field: id, message, newValue: intendedValue});
        } else {
            setSelectedRowData((prevState) => ({...prevState, [id]: value}));
        }
    };

    const handleCheckboxChange = (newSelectedRoles) => {
        setSelectedRoles(newSelectedRoles);
    };

    const handleCheckboxChangeWorkerTypes = (newSelectedWorkerTypes) => {
        setSelectedWorkerTypes(newSelectedWorkerTypes);
    };

    const handleDeleteRole = async (roleId) => {
        try {
            const data = {
                ComplianceID: selectedRowData.ComplianceID,
                RoleID: roleId,
            };
            const response = await deleteData(
                `/api/deleteRoleLink`,
                data,
                window.location.href
            );
            if (response.success) {
                const updatedRoles = await fetchData(
                    `/api/getLinkedRoles/${selectedRowData.ComplianceID}`,
                    window.location.href
                );
                setLinkedRoles(updatedRoles.data);
                setSelectedRoles(updatedRoles.data.map((role) => role.RoleID));
                setDialog({
                    open: true,
                    title: "Success",
                    message: "Role deleted successfully.",
                });
            } else {
                throw new Error("Failed to delete role");
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            setDialog({
                open: true,
                title: "Error",
                message: "Failed to delete role. " + error.message,
            });
        }
    };

    const handleDeleteWorkerType = async (workerTypeID) => {
        try {
            const data = {
                ComplianceID: selectedRowData.ComplianceID,
                WorkerType: workerTypes.find((type) => type.ID === workerTypeID).Type,
            };
            const response = await deleteData(
                `/api/deleteWorkerTypeLink`,
                data,
                window.location.href
            );
            if (response.success) {
                const updatedLinkedWorkerTypes = await fetchData(
                    `/api/getLinkedWorkerTypes/${selectedRowData.ComplianceID}`,
                    window.location.href
                );
                setLinkedWorkerTypes(updatedLinkedWorkerTypes.data);
                setSelectedWorkerTypes(
                    updatedLinkedWorkerTypes.data.map((type) => type.WorkerType)
                );
                setDialog({
                    open: true,
                    title: "Success",
                    message: "Worker type deleted successfully.",
                });
            } else {
                throw new Error("Failed to delete worker type");
            }
        } catch (error) {
            console.error("Error deleting worker type:", error);
            setDialog({
                open: true,
                title: "Error",
                message: "Failed to delete worker type. " + error.message,
            });
        }
    };

    const handleAddToWorkersByRole = async () => {
        try {
            const data = {
                ComplianceID: selectedRowData.ComplianceID,
            };
            const response = await postData(
                "/api/addWorkerComplianceToWorkersByRole",
                data,
                window.location.href
            );
            if (response.success) {
                setDialog({
                    open: true,
                    title: "Success",
                    message: "Added to workers by role successfully.",
                });
            } else {
                throw new Error("Failed to add to workers by role");
            }
        } catch (error) {
            console.error("Error adding to workers by role:", error);
            setDialog({
                open: true,
                title: "Error",
                message: "Failed to add to workers by role. " + error.message,
            });
        }
    };

    const handleAddToWorkersByType = async () => {
        console.error(
            "Add to workers by type, cant find worker type in the system"
        );
        // try {
        //     const data = {
        //         ComplianceID: selectedRowData.ComplianceID,
        //     };
        //     const response = await postData('/api/addWorkerComplianceToWorkersByWorkerType', data, window.location.href);
        //     if (response.success) {
        //         setDialog({open: true, title: 'Success', message: 'Added to workers by type successfully.'});
        //     } else {
        //         throw new Error('Failed to add to workers by type');
        //     }
        // } catch (error) {
        //     console.error("Error adding to workers by type:", error);
        //     setDialog({open: true, title: 'Error', message: 'Failed to add to workers by type. ' + error.message});
        // }
    };

    const handleAddToAllWorkers = async () => {
        try {
            const data = {
                ComplianceID: selectedRowData.ComplianceID,
            };
            const response = await postData(
                "/api/addWorkerComplianceToAllWorkers",
                data,
                window.location.href
            );
            if (response.success) {
                setDialog({
                    open: true,
                    title: "Success",
                    message: "Added to all workers successfully.",
                });
            } else {
                throw new Error("Failed to add to all workers");
            }
        } catch (error) {
            console.error("Error adding to all workers:", error);
            setDialog({
                open: true,
                title: "Error",
                message: "Failed to add to all workers. " + error.message,
            });
        }
    };

    const closeDialog = () => setDialog({...dialog, open: false});

    // if (loading) return <div>Loading...</div>;
    const modalFields = [
        {id: "Description", label: "Description", type: "text"},
        {id: "ExpiryDays", label: "Expiry Days", type: "number"},
        {id: "WarningDays", label: "Warning Days", type: "number"},
        {id: "Mandatory", label: "Mandatory", type: "checkbox"},
        {id: "NoExpiryDate", label: "No Expiry Date", type: "checkbox"},
        {id: "NoStartDate", label: "No Start Date", type: "checkbox"},
        {id: "VisibleToWorker", label: "Visible to Worker", type: "checkbox"},
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
        <div className="min-h-screen gradient-background">
            <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DialogBox open={dialog.open} onClose={closeDialog} title={dialog.title}>
                    {dialog.message}
                </DialogBox>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Worker Compliance
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
                        <span>Add Compliance Items</span>
                    </button>
                </div>

                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowRoleLinkForm(true)}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Link className="h-4 w-4"/>
                            <span>Role Link</span>
                        </button>

                        <button
                            onClick={() => setShowTypeForm(true)}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Unlink className="h-4 w-4"/>
                            <span>Worker Type Link</span>
                        </button>

                        <button
                            onClick={handleAddToWorkersByRole}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <UserPlus className="h-4 w-4"/>
                            <span>Add to workers by role</span>
                        </button>

                        <button
                            onClick={handleAddToWorkersByType}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Users className="h-4 w-4"/>
                            <span>Add to workers by type</span>
                        </button>

                        <button
                            onClick={handleAddToAllWorkers}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Users className="h-4 w-4"/>
                            <span>Add to all workers</span>
                        </button>
                    </div>
                </div>

                <div>
                    <CustomAgGridDataTable2
                        rows={
                            complianceItemsData?.data
                                ? complianceItemsData.data.map(({WorkerRole, ...item}) => ({
                                    ...item,
                                    Roles: item.Roles || "", // Ensure Roles is a string
                                }))
                                : []
                        }
                        rowSelected={handleSelectRowClick}
                        columns={columns}
                    />
                </div>
            </div>

            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Worker Compliance Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />

            {/* Role Link Modal */}
            <Modal
                isOpen={showRoleLinkForm}
                style={{
                    content: {
                        maxWidth: "40%",
                        margin: "0 auto",
                        overflow: "auto",
                        marginTop: "5vh",
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                onClose={() => setShowRoleLinkForm(false)}
            >
                <ModalHeader
                    title="Link Roles"
                    onCloseButtonClick={() => setShowRoleLinkForm(false)}
                />
                <br/>
                <CheckBoxItems
                    items={workerRoles}
                    selectedItems={selectedRoles}
                    linkedItems={[]} // Allow all checkboxes to be enabled
                    onCheckboxChange={handleCheckboxChange}
                    disabled={disableSection}
                />
                <hr/>
                <Button
                    variant={"contained"}
                    onClick={handleLinkRoles}
                    backgroundColor={"blue"}
                    label={"Link Roles"}
                    disabled={disableSection}
                />
                <LinkedItems
                    linkedItems={workerRoles.filter((role) =>
                        selectedRoles.includes(role.ID)
                    )}
                    onDeleteRole={handleDeleteRole}
                />
            </Modal>

            {/* Worker Type Link Modal */}
            <Modal
                isOpen={showTypeForm}
                style={{
                    content: {
                        maxWidth: "40%",
                        margin: "0 auto",
                        overflow: "auto",
                        marginTop: "5vh",
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                onClose={() => setShowTypeForm(false)}
            >
                <ModalHeader
                    title="Link Worker Types"
                    onCloseButtonClick={() => setShowTypeForm(false)}
                />
                <CheckBoxItems
                    items={workerTypes}
                    selectedItems={selectedWorkerTypes} // Properly reflect selected worker types by ID or Type
                    onCheckboxChange={handleCheckboxChangeWorkerTypes}
                    disabled={disableSection}
                />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "10px",
                    }}
                >
                    <Button
                        variant={"contained"}
                        onClick={handleLinkWorkerTypes}
                        backgroundColor={"blue"}
                        label={"Link Worker Types"}
                        disabled={disableSection}
                    />
                    <LinkedItems
                        linkedItems={workerTypes.filter((type) =>
                            selectedWorkerTypes.includes(type.ID)
                        )}
                        onDeleteRole={handleDeleteWorkerType}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default UpdateWorkerCompliance;

const CheckBoxItems = ({items, selectedItems, onCheckboxChange}) => {
    const handleCheckboxChange = (isChecked, id) => {
        if (isChecked) {
            onCheckboxChange([...selectedItems, id]);
        } else {
            onCheckboxChange(selectedItems.filter((item) => item !== id));
        }
    };

    return (
        <div style={{display: "flex", flexDirection: "column", margin: "10px 0"}}>
            {items.map((item) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectedItems.includes(item.ID)} // Ensure proper checking based on selected items
                            onChange={(e) => handleCheckboxChange(e.target.checked, item.ID)}
                        />
                    }
                    label={item.Role ? item.Role : item.Type}
                    key={item.ID ? item.ID : item.WorkerType}
                />
            ))}
        </div>
    );
};