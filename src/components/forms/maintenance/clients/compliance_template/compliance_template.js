import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";
import ModalHeader from "@/components/widgets/ModalHeader";
import InfoOutput from "@/components/widgets/InfoOutput";
import {deleteData, fetchData, getColumns, postData, putData} from "@/utility/api_utility";
import {Col, Container, Row} from "react-bootstrap";
import {Checkbox, List, ListItem, ListItemIcon, ListItemText, TextField} from "@mui/material";
import EditModal from "@/components/widgets/EditModal";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import {ChevronDown, Download, Filter, Plus, Search, Shield, Trash2, UserMinus, Users} from 'lucide-react';

Modal.setAppElement("#__next");

const ComplianceTemplate = () => {
    const [showForm, setShowForm] = useState(false);
    const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
    const [showAddComplianceItemForm, setShowAddComplianceItemForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        TemplateName: "",
    });
    const [error, setError] = useState("");

    const [templateNames, setTemplateNames] = useState([]);
    const [selectedTemplateID, setSelectedTemplateID] = useState([]);
    const [complianceTemplateData, setComplianceTemplateData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [complianceItems, setComplianceItems] = useState([]);
    const [selectedComplianceItems, setSelectedComplianceItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedTemplate, setSelectedTemplate] = useState({});
    const [disableSection, setDisableSection] = useState(false);
    const [isTemplateSelected, setIsTemplateSelected] = useState(false);
    const [columns, setColumns] = useState([])
    const [alreadyAddedComplianceItems, setAlreadyAddedComplianceItems] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const fetchComplianceTemplateData = async (templateId) => {
        try {
            const data = await fetchData(
                `/api/getComplianceTemplateData/${templateId}`,
                window.location.href
            );
            console.log("Fetched data:", data);
            return data;
        } catch (error) {
            console.error("Error fetching complianceTemplate data:", error);
        }
    };

    useEffect(() => {
        let mounted = true;
        const fetchTemplateNames = async () => {
            const results = await fetchData("/api/fetchComplianceTemplateNames", window.location.href);
            console.log("results : ", results)
            if (mounted) {
                setTemplateNames(results.data);
            }
        };
        fetchTemplateNames();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (selectedTemplateID) {
            const fetchAndSetComplianceTemplateData = async () => {
                console.log("Selected Template ID:", selectedTemplateID);
                const data = await fetchComplianceTemplateData(selectedTemplateID);
                setComplianceTemplateData(data);
                setColumns(getColumns(data))
            };
            fetchAndSetComplianceTemplateData();
        }
    }, [selectedTemplateID]);

    useEffect(() => {
        let mounted = true;
        const fetchComplianceItems = async () => {
            const results = await fetchData("/api/getWorkerComplianceData", window.location.href);
            if (mounted) {
                setComplianceItems(results.data);
                console.log("Compliance Items:", results.data);
            }
        };
        fetchComplianceItems();
        return () => {
            mounted = false;
        };
    }, []);

    const getCookieValue = (name) => {
        if (typeof document === "undefined") {
            return null; // Return null if document is not defined
        }
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null; // Return null if cookie is not found
    };

    const userId = getCookieValue("User_ID");

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );

            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            const specificRead = WriteData.filter(
                (role) => role.Menu_ID === "m_maint_client_comp_temp" && role.ReadOnly === 0
            );

            // If length 0 then No write permission Only Read, thus set disableSection to true else false
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
        fetchUserRoles();
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // const handleChange = (event) => {
    //   const { id, type, checked, value } = event.target;
    //   setForm((prevData) => ({
    //     ...prevData,
    //     [id]: type === "checkbox" ? checked : value,
    //   }));
    // };

    const handleNewTemplateSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const email = sessionStorage.getItem("email");

        const formData = {
            TemplateName: form.TemplateName,
            MakerUser: email,
            MakerDate: new Date().toISOString(),
        };

        if (templateNames.some((template) => template.TemplateName === form.TemplateName)) {
            setError("Template name already exists.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await postData(
                "/api/createNewComplianceTemplate",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Compliance Template added successfully");
                clearForm();
                setShowNewTemplateForm(false);
                const results = await fetchData("/api/fetchComplianceTemplateNames", window.location.href);
                setTemplateNames(results.data);
            } else {
                setOutput("Failed to add Compliance Template");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitAddComplianceItems = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const email = sessionStorage.getItem("email");

        const formData = {
            ID: selectedTemplateID,
            WorkerComplianceID: JSON.stringify(
                selectedComplianceItems.map((item) => item.ComplianceID)
            ),
            UpdateUser: email,
            UpdateDate: new Date().toISOString(),
        };

        console.log("Add Compliance Items:", formData);

        try {
            const response = await putData(
                "/api/putComplianceTemplateData",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Compliance Items added successfully");
                clearForm();
                setShowAddComplianceItemForm(false);
                const data = await fetchComplianceTemplateData(selectedTemplateID);
                setComplianceTemplateData(data);
                setAlreadyAddedComplianceItems(data.data.map((item) => item.ComplianceID));
                console.log("Already Added Compliance Items:", alreadyAddedComplianceItems);
            } else {
                setOutput("Failed to add Compliance Items");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setError("");
        setForm({
            TemplateName: "",
        });
        setSelectedComplianceItems([]);
        setSearchTerm("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
        setShowNewTemplateForm(false);
        setShowAddComplianceItemForm(false);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleComplianceItemClick = (item) => {
        setSelectedComplianceItems((prevItems) =>
            prevItems.includes(item)
                ? prevItems.filter((i) => i !== item)
                : [...prevItems, item]
        );
    };

    const filteredComplianceItems = complianceItems
        .filter((item) => !alreadyAddedComplianceItems.some(addedItem => addedItem === item.ComplianceID))
        .filter((item) =>
            item.Description.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleSelectRowClick = (row) => {
        console.log("Selected Row:", row);
        setSelectedRowData(row);
        setShowModal(true)
    };

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleDelete = async () => {
        if (!selectedTemplate.ID) {
            alert("Please select a template name to delete");
            return;
        }
        try {
            const data = await deleteData(
                "/api/deleteComplianceTemplateData",
                {
                    ID: selectedTemplate.ID,
                },
                window.location.href
            );
            console.log("Delete response:", data);
            handleClearForm();
            const results = await fetchData("/api/fetchComplianceTemplateNames", window.location.href);
            setTemplateNames(results.data);
            setSelectedTemplate({});
            setIsTemplateSelected(false);
            setComplianceTemplateData([]);
        } catch (error) {
            console.error("Error deleting complianceTemplate data:", error);
        }
    };

    const handleClearForm = () => {
        setIsTemplateSelected(false);
        setSelectedTemplate({});
        setSelectedTemplateID(null);
        setComplianceTemplateData([]);
        setAlreadyAddedComplianceItems([]);
    };

    const setTemplateName = async (value) => {
        const selectedTemplate = templateNames.find((template) => template.ID === value);
        setSelectedTemplate(selectedTemplate);
        setIsTemplateSelected(true);
        setSelectedTemplateID(value);
        const data = await fetchComplianceTemplateData(value);
        setComplianceTemplateData(data);
        console.log("Compliance Template Data:", data);
        setAlreadyAddedComplianceItems(data.data.map((item) => item.ComplianceID));
    };

    const handleAddComplianceItems = () => {
        setShowAddComplianceItemForm(true);
    };

    const fields = [{
        type: "text",
        id: "TemplateName",
        label: "Template Name:",
        value: form.TemplateName,
    }];

    const handleInputChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    return (
        <div>
            <div className="min-h-screen pt-24 gradient-background">
                {/* <PatternBackground /> */}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                                    <Shield className="h-6 w-6 text-white"/>
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Compliance Templates
                                </h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage compliance templates and requirements
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowNewTemplateForm(true)}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
                            >
                                <Plus className="h-4 w-4"/>
                                <span>Add Template</span>
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-red-200/50 dark:border-red-700/50 text-red-600 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4"/>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Template Name
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTemplate.TemplateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    disabled={disableSection}
                                    className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                >
                                    <option value="">Select Template</option>
                                    {templateNames?.map((template) => (
                                        <option key={template.ID} value={template.ID}>
                                            {template.TemplateName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>
                    </div>

                    {/* Template Content */}
                    {isTemplateSelected && (
                        <div
                            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <button
                                    onClick={handleAddComplianceItems}
                                    disabled={disableSection}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4"/>
                                    <span>Add Compliance Item</span>
                                </button>

                                <button
                                    onClick={handleAddComplianceItems}
                                    disabled={disableSection}
                                    className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                                >
                                    <Users className="h-4 w-4"/>
                                    <span>Add Clients</span>
                                </button>

                                <button
                                    onClick={() => setShowForm(true)}
                                    disabled={disableSection}
                                    className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                                >
                                    <UserMinus className="h-4 w-4"/>
                                    <span>Remove Client</span>
                                </button>
                            </div>

                            {/* Data Grid */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="relative flex-1 max-w-xs">
                                        <input
                                            type="text"
                                            placeholder="Search items..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <Filter className="h-5 w-5 text-gray-600"/>
                                        </button>

                                        <button
                                            className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <Download className="h-5 w-5 text-gray-600"/>
                                        </button>
                                    </div>
                                </div>

                                <AgGridDataTable
                                    rows={complianceTemplateData?.data}
                                    columns={columns}
                                    rowSelected={handleSelectRowClick}
                                    handleRowUnselected={handleRowUnselected}
                                    showEditButton={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Modal
                style={{
                    content: {
                        maxWidth: "500px",
                        margin: "0 auto",
                        maxHeight: "80vh",
                        overflow: "auto",
                        marginTop: "10vh",
                        borderRadius: "15px",
                    },
                    overlay: {
                        zIndex: "10",
                    },
                }}
                isOpen={showNewTemplateForm}
                contentLabel="Add Compliance Template"
            >
                <ModalHeader
                    title={"Add new compliance template"}
                    onCloseButtonClick={handleModalCancel}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleNewTemplateSubmit}
                >
                    <Container>
                        <Row className="mt-2">
                            <Col>
                                <InputField
                                    id="TemplateName"
                                    label="Template Name:"
                                    value={form.TemplateName}
                                    type={"text"}
                                    // onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        {error && (
                            <Row className="mt-2">
                                <Col>
                                    <div style={{color: "red"}}>{error}</div>
                                </Col>
                            </Row>
                        )}
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    type="submit"
                                    label="Create"
                                    variant="contained"
                                    disabled={isSubmitting}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col>
                                <h5>Existing Templates:</h5>
                                <ul>
                                    {templateNames.map((template) => (
                                        <li key={template.ID}>{template.TemplateName}</li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>
                        <InfoOutput output={output}/>
                    </Container>
                </form>
            </Modal>
            <EditModal
                show={showNewTemplateForm}
                onClose={handleModalCancel}
                onSave={handleNewTemplateSubmit}
                modalTitle="Add new compliance template"
                fields={fields}
                data={form}
                onChange={handleInputChange}
            />

            {/* Edit Modal */}
            <EditModal
                show={showModal}
                onClose={handleModalCancel}
                onSave={handleNewTemplateSubmit}
                modalTitle="Edit new compliance template"
                fields={fields}
                data={form}
                onChange={handleInputChange}
            />

            <Modal
                style={{
                    content: {
                        maxWidth: "650px", // Slightly reduced modal width
                        margin: "0 auto",
                        maxHeight: "80vh", // Adjusted for compactness
                        overflow: "auto",
                        marginTop: "5vh",
                        borderRadius: "8px", // Less border radius for minimalism
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        padding: "1rem", // Reduced padding for minimal space usage
                        backgroundColor: "#fff",
                    },
                    overlay: {
                        zIndex: 10,
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                    },
                }}
                isOpen={showAddComplianceItemForm}
                contentLabel="Add Compliance Items"
            >
                <ModalHeader
                    title="Add Compliance Items"
                    onCloseButtonClick={handleModalCancel}
                    style={{
                        fontSize: "1.2rem", // Smaller title font
                        fontWeight: "500",
                        marginBottom: "1rem", // Less space below title
                        textAlign: "center",
                    }}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.3s"}} // Reduced padding for the form
                    onSubmit={handleSubmitAddComplianceItems}
                >
                    <Container>
                        <div
                            style={{
                                maxHeight: "350px", // Reduced height for the list box
                                overflowY: "auto",
                                overflowX: "hidden",
                                border: "1px solid #ddd", // Light border
                                padding: "10px", // Less padding
                                borderRadius: "6px", // Small border radius
                            }}
                        >
                            <Row className="mb-2">
                                <Col>
                                    <TextField
                                        label="Search"
                                        variant="outlined"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        InputProps={{
                                            style: {
                                                borderRadius: "6px", // Small border radius
                                                padding: "8px", // Compact padding for input
                                                fontSize: "0.9rem", // Smaller font size for input
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <List style={{padding: "0"}}>
                                        {filteredComplianceItems.map((item) => (
                                            <ListItem
                                                button
                                                key={item.ComplianceID}
                                                onClick={() => handleComplianceItemClick(item)}
                                                style={{
                                                    borderRadius: "6px", // Small border radius
                                                    marginBottom: "5px", // Reduced margin between items
                                                    backgroundColor: "#f9f9f9",
                                                    padding: "8px", // Compact padding
                                                    fontSize: "0.85rem", // Smaller font size for list items
                                                    transition: "background 0.2s",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.backgroundColor = "#f0f0f0")
                                                }
                                                onMouseOut={(e) =>
                                                    (e.currentTarget.style.backgroundColor = "#f9f9f9")
                                                }
                                            >
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={selectedComplianceItems.includes(item)}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        style={{
                                                            color: "#007BFF",
                                                            padding: "0", // Minimal padding for checkbox
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.Description}
                                                    style={{fontSize: "0.85rem"}} // Compact text
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Col>
                            </Row>
                        </div>

                        {/* Selected Compliance Items */}
                        <Row className="mt-3">
                            <Col>
                                <h5 style={{marginBottom: "0.5rem", fontSize: "1rem"}}>Selected Compliance Items:</h5>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap", // Keep flex wrap
                                        gap: "8px", // Reduced spacing between items
                                    }}
                                >
                                    {selectedComplianceItems.map((item) => (
                                        <div
                                            key={item.ComplianceID}
                                            style={{
                                                backgroundColor: "#f0f0f0",
                                                padding: "8px 10px", // Compact padding
                                                borderRadius: "6px",
                                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                                flex: "0 0 23%", // Fit four items per row
                                                fontSize: "0.85rem", // Smaller font size
                                                textAlign: "left",
                                            }}
                                        >
                                            <span>{item.Description}</span>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </Row>

                        {/* Submit Button */}
                        <Row className="mt-3">
                            <Col>
                                <Button
                                    type="submit"
                                    label="Save"
                                    variant="contained"
                                    disabled={isSubmitting}
                                    style={{
                                        backgroundColor: "#007BFF",
                                        color: "#fff",
                                        borderRadius: "6px", // Small border radius for button
                                        padding: "10px 16px", // Reduced padding
                                        fontSize: "0.9rem", // Smaller font size
                                        width: "100%",
                                        transition: "background 0.3s",
                                    }}
                                    onMouseOver={(e) =>
                                        (e.currentTarget.style.backgroundColor = "#0056b3")
                                    }
                                    onMouseOut={(e) =>
                                        (e.currentTarget.style.backgroundColor = "#007BFF")
                                    }
                                >
                                    Save
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </form>
            </Modal>


        </div>
    );
};

export default ComplianceTemplate;
