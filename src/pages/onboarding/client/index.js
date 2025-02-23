// src/pages/onboarding/OnboardingPage.jsx

// Import necessary modules and components
import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField"; // Importing InputField component
import {deleteData, fetchData, postData, putData,} from "@/utility/api_utility"; // Importing utility functions for API requests
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap"; // Importing Row component for layout
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";

import {CheckCircle2, Save, UserPlus, X,} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";
// Define Australian Time Zones
const australianTimeZones = [
    // Western Australia
    {value: "Australia/Perth", label: "Perth (AWST) UTC+8"},

    // Central Western Australia (unofficial)
    {value: "Australia/Eucla", label: "Eucla (ACWST) UTC+8:45"},

    // Northern Territory and Central Australia
    {value: "Australia/Darwin", label: "Darwin (ACST) UTC+9:30"},

    // South Australia
    {value: "Australia/Adelaide", label: "Adelaide (ACST) UTC+9:30"},

    // New South Wales (Broken Hill)
    {value: "Australia/Broken_Hill", label: "Broken Hill (ACST) UTC+9:30"},

    // Queensland
    {value: "Australia/Brisbane", label: "Brisbane (AEST) UTC+10"}, // No DST

    // New South Wales, Victoria, Australian Capital Territory, Tasmania
    {value: "Australia/Sydney", label: "Sydney (AEST) UTC+10 / (AEDT) UTC+11"},
    {
        value: "Australia/Melbourne",
        label: "Melbourne (AEST) UTC+10 / (AEDT) UTC+11",
    },
    {value: "Australia/Hobart", label: "Hobart (AEST) UTC+10 / (AEDT) UTC+11"},
    {
        value: "Australia/Canberra",
        label: "Canberra (AEST) UTC+10 / (AEDT) UTC+11",
    },

    // Lord Howe Island
    {
        value: "Australia/Lord_Howe",
        label: "Lord Howe Island (LHST) UTC+10:30 / (LHDT) UTC+11",
    },

    // Norfolk Island
    {value: "Australia/Norfolk", label: "Norfolk Island (NFT) UTC+11"},

    // Additional Regions (if necessary)
    // { value: 'Australia/Lindeman', label: 'Lindeman (AEST) UTC+10' },
];

// Function to fetch client onboarding data from the server
const fetchClientOnboards = async () => {
    const data = await fetchData(
        "/api/getClientOnboardingData",
        window.location.href
    );
    console.log("Fetched data:", data);
    return data.data;
};

// Main component for the Onboarding Page
const OnboardingPage = () => {
    // Accessing colors and loading state from ColorContext
    // const {colors, loading} = useContext(ColorContext);
    // State variables for storing columns, form data, client onboards, row click status, and modal open state
    const [columns, setColumns] = useState([]);
    const [formData, setFormData] = useState({});
    const [clientOnboards, setClientOnboards] = useState([]);
    const [originalStatus, setOriginalStatus] = useState(""); // Track the original status
    const [originalData, setOriginalData] = useState([]);
    const [isRowClicked, setIsRowClicked] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [openModal, setOpenModal] = useState(false);
    const [openAddClientModal, setOpenAddClientModal] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [clientInfo, setClientInfo] = useState({name: "", email: ""});
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(true);
    const [msg, setMsg] = useState("");
    const [loadingOperation, setLoadingOperation] = useState(false);

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
    /*  console.log("User_ID", userId); */

    useEffect(() => {
        const data = fetchClientOnboards();
        data.then((data) => {
            setOriginalData(data);
            if (statusFilter === "all") {
                setClientOnboards(data);
            } else {
                setClientOnboards(
                    data.filter((row) => row.Status.toLowerCase() === statusFilter)
                );
            }
        });
    }, [statusFilter]);

    // useEffect hook to fetch client onboarding columns and initialize form data
    useEffect(() => {
        // Function to fetch client onboarding columns from the server
        const fetchClientOnboardingColumns = async () => {
            const data = await fetchData(
                "/api/getClientOnboardingColumns",
                window.location.href
            );
            const fetchedColumns = data.data.map((column) => ({
                headerName: column.COLUMN_NAME,
                field: column.COLUMN_NAME,
            }));
            setColumns(fetchedColumns);

            // Initializing form data with column names
            const initialFormData = {};
            data.data.forEach((column) => {
                initialFormData[column.COLUMN_NAME] = "";
            });
            setFormData(initialFormData);
        };
        fetchClientOnboardingColumns(); // Calling the fetchClientOnboardingColumns function
    }, []);

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );
            /* console.log(rolesData); */

            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            /* console.log(WriteData); */

            const ReadData = rolesData.filter((role) => role.ReadOnly === 1);
            /* console.log(ReadData); */

            const specificRead = WriteData.filter(
                (role) => role.Menu_ID === "m_onboarding_client" && role.ReadOnly === 0
            );
            console.log("Onboarding Client Condition", specificRead);

            //If length 0 then No write permission Only Read, thus set disableSection to true else false
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    // useEffect hook to fetch client onboards data
    useEffect(() => {
        const data = fetchClientOnboards(); // Fetching client onboards data
        data.then((data) => {
            setClientOnboards(data); // Setting client onboards data in state
        });
        fetchUserRoles();
    }, []);

    // If the page is still loading, display a loading message
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const validateForm = () => {
        // List of required fields
        const requiredFields = columns
            .map((column) => column.headerName)
            .filter(
                (column) =>
                    column !== "ID" &&
                    column !== "MakerUser" &&
                    column !== "MakerDate" &&
                    column !== "password"
            );

        // Include TimeZone as a required field
        requiredFields.push("TimeZone");

        console.log("Required fields:", requiredFields);

        // Check if all required fields are filled
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill the ${field} field`);
                return false;
            }
        }

        // Validate email
        if (formData.Email) {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
            if (!emailPattern.test(formData.Email)) {
                alert("Please enter a valid email address.");
                return false;
            }
        }

        // If all required fields are filled, return true
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        setLoadingOperation(true);
        formData.MakerUser = userId;
        try {
            console.log(formData);
            if (
                originalStatus === "BOARDED" ||
                formData.Status.toUpperCase() === "BOARD"
            ) {
                if (!formData.ID) {
                    // New Client case
                    const addResponse = await postData(
                        "/api/insertClientOnboarding",
                        formData,
                        window.location.href
                    );
                    if (!addResponse.success) {
                        throw new Error("Failed to add onboarding data.");
                        setMsg("Failed to add onboarding data");
                    } else {
                        formData.ID = addResponse.uid; // Save the new ID
                    }
                    setClientInfo({
                        name: formData.FirstName + " " + formData.LastName,
                        email: formData.Email,
                    });
                    const generatedPassword = generateRandomPassword();
                    console.log(generatedPassword);
                    setPassword(generatedPassword); // Set the generated password in state
                    setOpenPasswordModal(true); // Show password modal for new clients
                } else {
                    // Existing Client case
                    setClientInfo({
                        name: formData.FirstName + " " + formData.LastName,
                        email: formData.Email,
                    });
                    const generatedPassword = generateRandomPassword();
                    setPassword(generatedPassword); // Set the generated password in state
                    setOpenPasswordModal(true); // Show password modal for existing clients
                }
                await postData("/api/sendOnboardingEmail", {
                    type: "CLIENT_ONBOARDING_BOARDED",
                    id: null,
                    email: formData.Email,
                });
            } else {
                // For other statuses, simply perform data operations
                await performDataOperations();
            }
        } catch (error) {
            console.error("Error during submission:", error.message);
            if (error.data && error.data.error) {
                alert(error.data.error);
            } else {
                alert("An error occurred during submission.");
            }
        } finally {
            setLoadingOperation(false); // End loading
        }
    };

    const handlePasswordSubmit = async () => {
        setLoadingOperation(true);
        try {
            formData.MakerUser = userId;
            if (!formData.ID) {
                // Insert client into onboarding table first
                const addResponse = await postData(
                    "/api/insertClientOnboarding",
                    formData,
                    window.location.href
                );
                if (!addResponse || !addResponse.success) {
                    throw new Error("Failed to add onboarding data.");
                } else {
                    formData.ID = addResponse.uid; // Save the new ID
                }
            } else {
                // Update client in onboarding table
                const updateResponse = await putData(
                    "/api/updateClientOnboardingStatus",
                    formData,
                    window.location.href
                );
                if (!updateResponse || !updateResponse.success) {
                    throw new Error("Failed to update onboarding data.");
                } else {
                    console.log("Client updated successfully");
                }
            }

            // Create user in Firebase with the generated password
            await handleFirebaseUserCreation(password);

            console.log("Form Data before transfer:", formData); // Add this li

            setFormData((prevFormData) => ({
                ...prevFormData,
                MakerDate: new Date().toISOString(),
            }));
            // Transfer client to master table
            const transferResponse = await postData(
                "/api/transferClientToMaster",
                formData,
                window.location.href
            );
            if (!transferResponse || !transferResponse.success) {
                throw new Error("Failed to transfer client to master.");
            }

            // Send login details
            await sendLoginDetails(clientInfo.name, clientInfo.email, password);

            // Close the password modal
            setOpenPasswordModal(false);

            // Fetch updated client data
            const updatedClientOnboards = await fetchClientOnboards();
            setClientOnboards(updatedClientOnboards);
            setFormData({});
            setIsRowClicked(false);
            setOpenModal(false);
            setPassword("");
            alert("Client added and boarded successfully.");
        } catch (error) {
            console.error("Error during password submission:", error.message);
            alert(error.message);
        } finally {
            setLoadingOperation(false);
            setClientInfo({name: "", email: ""});
            setPassword("");
            setOpenModal(false);
            setIsRowClicked(false);
            setOpenPasswordModal(false);
            setOpenAddClientModal(false);
        }
    };

    // Function to send login details to the specified endpoint
    const sendLoginDetails = async (name, email, password) => {
        try {
            const response = await postData("/api/sendLoginDetails", {
                name,
                email,
                password,
            });
            if (!response) {
                console.error("Failed to send login details.");
            }
            console.log("Login details sent successfully.");
        } catch (error) {
            console.error("Error while sending login details:", error.message);
        }
    };

    const handleFirebaseUserCreation = async (generatedPassword) => {
        try {
            if (!formData.Email || !formData.ID) {
                throw new Error("Email or ID is missing for Firebase user creation.");
            }
            const firebaseResponse = await postData("/api/createClientFirebase", {
                uid: formData.ID,
                email: formData.Email,
                password: generatedPassword,
            });
            if (!firebaseResponse) {
                // send the response
                console.error("Failed to create Firebase user.");
                throw new Error(`Failed to create Firebase user: ${firebaseResponse}`);
            }
            console.log("Firebase user created successfully");

            // Update client status in the formData
            setFormData((prevFormData) => ({
                ...prevFormData,
                Status: "BOARD",
            }));
        } catch (error) {
            console.error("Error during Firebase user creation:", error.message);

            // Display the error message on the browser
            alert(
                `Error creating Firebase user: ${
                    error.response?.data?.message || error.message
                }`
            );
            console.log("Error creating Firebase user:", error);
            throw error; // Re-throw the error if necessary for further handling
        }
    };

    const performDataOperations = async () => {
        setLoadingOperation(true);
        formData.MakerUser = userId;
        try {
            if (formData.ID) {
                const updateResponse = await putData(
                    "/api/updateClientOnboardingStatus",
                    formData,
                    window.location.href
                );
                if (!updateResponse || !updateResponse.success) {
                    throw new Error("Failed to update onboarding data.");
                }
                if (formData.Status.toUpperCase() === "BLOCKED") {
                    await postData("/api/sendOnboardingEmail", {
                        type: "CLIENT_ONBOARDING_BLOCKED",
                        id: formData.ID,
                        email: formData.Email,
                    });
                }
            } else {
                const addResponse = await postData(
                    "/api/insertClientOnboarding",
                    formData,
                    window.location.href
                );
                if (!addResponse.success) {
                    throw new Error("Failed to add onboarding data.");
                }
                formData.ID = addResponse.uid;
            }
            console.log(formData.Status);
            if (formData.Status.toUpperCase() === "BOARD") {
                const transferResponse = await postData(
                    "/api/transferClientToMaster",
                    formData,
                    window.location.href
                );
                if (!transferResponse || !transferResponse.success) {
                    throw new Error("Failed to transfer client to master.");
                }
                await postData("/api/sendOnboardingEmail", {
                    type: "CLIENT_ONBOARDING_BOARDED",
                    id: null,
                    email: formData.Email,
                });
            }
            // Clear form and reset state after successful data operations
            setFormData({});
            setIsRowClicked(false);
            setOpenModal(false);
            setPassword("");
            const data = fetchClientOnboards();
            data.then((data) => setClientOnboards(data));
            alert("Client onboarding data updated successfully.");
        } catch (error) {
            console.error("Error during data operations:", error.message);
            throw error;
        } finally {
            setLoadingOperation(false);
        }
    };

    const handleDeleteRow = () => {
        if (formData.ID) {
            // Show a confirmation popup
            const confirmDelete = window.confirm(
                "Are you sure you want to delete this item?"
            );
            if (confirmDelete) {
                deleteData(
                    "/api/deleteClientOnboarding",
                    formData,
                    window.location.href
                ) // Deleting existing data
                    .then((data) => {
                        console.log("Data:", data);
                        if (data.success === true) {
                            alert("Data deleted successfully");
                            setFormData({});
                            const data = fetchClientOnboards(); // Fetching updated client onboards data
                            data.then((data) => {
                                setClientOnboards(data);
                            });
                            setOpenModal(false); // Closing the modal after successful update
                            setIsRowClicked(false);
                        } else {
                            alert("Data deletion failed");
                        }
                    });
            }
        } else {
            alert("Please select a row to delete");
        }
    };

    // Function to open the modal
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        handleClearForm();
        setOpenModal(false);
        setOpenAddClientModal(false);
        setIsRowClicked(false);
    };

    // Function to handle row click in the table
    const handleRowClick = (row) => {
        setFormData(row); // Set the selected row's data
        setIsRowClicked(true); // Mark a row as clicked
        setOriginalStatus(row.Status ? row.Status.toUpperCase() : ""); // Track the original status
        handleOpenModal(); // Open the modal

        // Disable section if client is already boarded
        if (row.Status && row.Status.toUpperCase() === "BOARD") {
            setDisableSection(true); // Disable editing
        } else {
            setDisableSection(false); // Allow editing if not boarded
        }
    };

    // Function to clear the form
    const handleClearForm = () => {
        setFormData({}); // Clearing form data
        setIsRowClicked(false); // Resetting row click status
    };

    // Function to close the password modal
    const handleClosePasswordModal = () => {
        setOpenPasswordModal(false);
        setClientInfo({name: "", email: ""});
        setPassword("");
    };

    // Rendering the JSX elements
    return (
        <>
            {/* <Navbar /> */}
            <div className="min-h-screen pt-24 gradient-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Client Onboarding
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage client onboarding process and status
                            </p>
                        </div>

                        <button
                            onClick={() => setOpenAddClientModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <UserPlus className="h-4 w-4"/>
                            <span>Add Client</span>
                        </button>
                    </div>

                    {/* Stats Grid */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold mt-2 bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-2xl p-3 bg-gradient-to-r ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div> */}
                    <div className="pl-2 mb-4"><CustomBreadcrumbs /></div>

                    {/* Status Tabs */}
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 mb-6 inline-flex gap-2">
                        {[
                            {id: "all", label: "All"},
                            {id: "on hold", label: "On Hold"},
                            {id: "board", label: "Board"},
                            {id: "blocked", label: "Blocked"},
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                    statusFilter === tab.id
                                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Data Grid */}
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                        <CustomAgGridDataTable2
                            rows={clientOnboards}
                            columns={columns.filter(
                                (col) =>
                                    !["password", "MakerUser", "MakerDate"].includes(
                                        col.headerName
                                    )
                            )}
                            rowSelected={handleRowClick}
                        />
                    </div>
                </div>

                {/* Add/Edit Client Modal */}
                {(openModal || openAddClientModal) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />

                        <div
                            className="relative w-full max-w-6xl bg-white mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {openAddClientModal ? "Add New Client" : "Edit Client"}
                                    </h2>
                                    <button
                                        onClick={handleCloseModal}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500"/>
                                    </button>
                                </div>

                                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
                                {/* Form fields */}
                                {columns
                                    .filter(
                                        (column) =>
                                            column.headerName !== "ID" &&
                                            column.headerName !== "password" &&
                                            column.headerName !== "MakerUser" &&
                                            column.headerName !== "MakerDate"
                                        // &&
                                        // column.headerName !== "Status" &&
                                        // column.headerName !== "TimeZone"
                                    )
                                    .reduce((acc, column, index) => {
                                        const rowIndex = Math.floor(index / 3); // Group 3 inputs per row
                                        if (!acc[rowIndex]) acc[rowIndex] = [];
                                        acc[rowIndex].push(column);
                                        return acc;
                                    }, [])
                                    .map((row, rowIndex) => (
                                        <Row key={rowIndex} className="mb-3">
                                            {row.map((column, colIndex) => (
                                                <Col
                                                    key={colIndex}
                                                    xs={12} // Full width on extra small screens
                                                    sm={6} // Half width on small screens
                                                    md={4} // 3 columns per row on medium screens and larger
                                                    style={{paddingRight: "10px"}}
                                                >
                                                    {column.headerName === "Status" ? (
                                                        <InputField
                                                            required
                                                            label="Status"
                                                            type="select"
                                                            value={formData.Status || "ON HOLD"}
                                                            onChange={(e) => {
                                                                setFormData({
                                                                    ...formData,
                                                                    Status: e.target.value,
                                                                });
                                                            }}
                                                            options={[
                                                                {value: "ON HOLD", label: "ON HOLD"},
                                                                {value: "BOARD", label: "BOARD"},
                                                                {value: "BLOCKED", label: "BLOCKED"},
                                                            ]}
                                                        />
                                                    ) : column.headerName === "TimeZone" ? (
                                                        <InputField
                                                            required
                                                            label="Time Zone"
                                                            type="select"
                                                            value={formData.TimeZone || ""}
                                                            onChange={(e) => {
                                                                setFormData({
                                                                    ...formData,
                                                                    TimeZone: e.target.value,
                                                                });
                                                            }}
                                                            options={australianTimeZones}
                                                        />
                                                    ) : (
                                                        <InputField
                                                            required
                                                            id={column.headerName}
                                                            label={column.headerName}
                                                            type={column.headerName}
                                                            value={formData[column.headerName] || ""}
                                                            onChange={(e) => {
                                                                setFormData({
                                                                    ...formData,
                                                                    [column.headerName]: e.target.value || "",
                                                                });
                                                            }}
                                                            placeholder={`Enter ${column.headerName}` || ""}
                                                            disabled={isRowClicked}
                                                        />
                                                    )}
                                                </Col>
                                            ))}

                                        </Row>
                                    ))}

                                <div
                                    className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4"/>
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success/Error Messages */}
                {msg && (
                    <div className="fixed bottom-4 right-4 z-50">
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-xl glass dark:glass-dark border border-green-200/50 dark:border-green-700/50 text-green-700 dark:text-green-300 shadow-lg">
                            <CheckCircle2 className="h-5 w-5"/>
                            <span>{msg}</span>
                            <button
                                onClick={() => setMsg("")}
                                className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors ml-2"
                            >
                                <X className="h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OnboardingPage;
