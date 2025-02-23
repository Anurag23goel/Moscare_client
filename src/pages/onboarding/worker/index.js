// Import necessary modules and components
import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField"; // Importing InputField component
// import {Button as MuButton} from "@/components/widgets/Button"; // Importing Button component
import {deleteData, fetchData, postData, putData,} from "@/utility/api_utility"; // Importing utility functions for API requests
// import Modal from "@mui/material/Modal"; // Importing Modal component for displaying details
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap"; // Importing Row component for layout
import generateNamePassword from "@/utility/passwords/generator";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {CheckCircle2, Save, UserPlus, X,} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";
// Function to fetch worker onboarding data from the server
const fetchWorkerOnboards = async () => {
    const data = await fetchData(
        "/api/getWorkerOnboardingData",
        window.location.href
    );
    console.log("Fetched data:", data);
    return data.data;
};

// Main component for the Onboarding Page
const OnboardingPage = () => {
    // Accessing colors and loading state from ColorContext
    // const {colors, loading} = useContext(ColorContext);
    // State variables
    const [columns, setColumns] = useState([]);
    const [formData, setFormData] = useState({});
    const [workerOnboards, setWorkerOnboards] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [originalStatus, setOriginalStatus] = useState(""); // Track the original status
    const [isRowClicked, setIsRowClicked] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [openModal, setOpenModal] = useState(false);
    const [openAddWorkerModal, setOpenAddWorkerModal] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [workerInfo, setWorkerInfo] = useState({name: "", email: ""});
    const [password, setPassword] = useState("");
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

    useEffect(() => {
        const data = fetchWorkerOnboards();
        data.then((data) => {
            setOriginalData(data);
            if (statusFilter === "all") {
                setWorkerOnboards(data);
            } else {
                setWorkerOnboards(data.filter((row) => row.Status === statusFilter));
            }
        });
    }, [statusFilter]);

    // useEffect hook to fetch columns and initialize form data
    useEffect(() => {
        const fetchWorkerOnboardingColumns = async () => {
            const data = await fetchData("/api/getWorkerOnboardingColumns", window.location.href);
            const fetchedColumns = data.data.map((column) => ({
                headerName: column.COLUMN_NAME,
                field: column.COLUMN_NAME,
            }));
            setColumns(fetchedColumns);
            console.log("Extracted Columns", fetchedColumns)

            const initialFormData = {};
            data.data.forEach((column) => {
                initialFormData[column.COLUMN_NAME] = "";
            });
            setFormData(initialFormData);
        };
        fetchWorkerOnboardingColumns();
    }, []);

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(`/api/getRolesUser/${userId}`, window.location.href);
            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            const specificRead = WriteData.filter(
                (role) => role.Menu_ID === "m_onboarding_worker" && role.ReadOnly === 0
            );
            setDisableSection(specificRead.length === 0);
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    useEffect(() => {
        const data = fetchWorkerOnboards();
        data.then((data) => setWorkerOnboards(data));
        fetchUserRoles();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const validateForm = () => {
        const requiredFields = columns
            .map((column) => column.headerName)
            .filter(
                (column) => column !== "ID" && column !== "MakerUser" && column !== "MakerDate" && column !== "password"
            );
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill the ${field} field`);
                return false;
            }
        }
        // validate email
        if (formData.Email) {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
            if (!emailPattern.test(formData.Email)) {
                alert("Please enter a valid email address.");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        console.log("formData : ", formData)
        if (!validateForm()) {
            return;
        }
        setLoadingOperation(true)
        try {
            // add a new field makerUser in the formData
            formData.MakerUser = userId;
            if (originalStatus === 'BOARD' || formData.Status === "BOARD") {
                if (!formData.ID) {
                    // New Worker case
                    const addResponse = await postData(
                        "/api/insertWorkerOnboarding",
                        formData,
                        window.location.href
                    );
                    if (!addResponse.success) {
                        throw new Error("Failed to add onboarding data.");
                    } else {
                        formData.ID = addResponse.uid; // Save the new ID
                    }
                    setWorkerInfo({
                        name: formData.FirstName + " " + formData.LastName,
                        email: formData.Email,
                    });
                    const generatedPassword = generateNamePassword(formData.FirstName);
                    console.log(generatedPassword)
                    setPassword(generatedPassword); // Set the generated password in state
                    setOpenPasswordModal(true); // Show password modal for new clients
                } else {
                    // Existing Worker case
                    setWorkerInfo({
                        name: formData.FirstName + " " + formData.LastName,
                        email: formData.Email,
                    });
                    console.log("Worker info:", workerInfo);
                    const generatedPassword = generateNamePassword(formData.FirstName);
                    console.log(generatedPassword)
                    setPassword(generatedPassword); // Set the generated password in state
                    setOpenPasswordModal(true); // Show password modal for existing clients
                }
            } else {
                // For other statuses, simply perform data operations
                await performDataOperations();
            }
            // // Clear form and reset state after successful submission
            // setFormData({});
            // setIsRowClicked(false);
            // setOpenModal(false);
        } catch (error) {
            console.error("Error during submission:", error);
            if (error.data.error) {
                alert(error.data.error);
            } else {
                alert("An error occurred during submission.");
            }
        } finally {
            setLoadingOperation(false)
        }
    };

    const handlePasswordSubmit = async () => {
        console.log("Daata : ", formData)
        if (!password) {
            alert("Password cannot be empty.");
            return;
        }
        setLoadingOperation(true)
        formData.MakerUser = userId;
        try {
            if (!formData.ID) {
                // Insert worker into onboarding table first
                const addResponse = await postData(
                    "/api/insertWorkerOnboarding",
                    formData,
                    window.location.href
                );
                if (!addResponse.success) {
                    throw new Error("Failed to add onboarding data.");
                } else {
                    formData.ID = addResponse.uid; // Save the new ID
                }
            } else {
                // Update worker in onboarding table
                const updateResponse = await putData(
                    "/api/updateWorkerOnboardingStatus",
                    formData,
                    window.location.href
                );
                if (!updateResponse || !updateResponse.success) {
                    throw new Error("Failed to update onboarding data.");
                } else {
                    console.log("Worker updated successfully");
                }
            }

            // Create user in Firebase
            await handleFirebaseUserCreation(password);

            // Transfer worker to master table
            const transferResponse = await postData(
                "/api/transferWorkerToMaster",
                formData,
                window.location.href
            );
            if (!transferResponse) {
                throw new Error("Failed to transfer worker to master.");
            }

            // Send login details
            await sendLoginDetails(
                workerInfo.name,
                workerInfo.email,
                password
            );

            // Close the password modal
            setOpenPasswordModal(false);

            // Fetch updated worker data
            const updatedWorkerOnboards = await fetchWorkerOnboards();
            setWorkerOnboards(updatedWorkerOnboards);
            setFormData({});
            setIsRowClicked(false);
            setOpenModal(false);
            setOpenAddWorkerModal(false);
            setPassword("");
            alert("Worker added and boarded successfully.");
        } catch (error) {
            console.error("Error during password submission:", error.message);
            alert(error.message);
        } finally {
            setLoadingOperation(false)
            setWorkerInfo({name: "", email: ""});
            setPassword("");
            setOpenModal(false);
            setIsRowClicked(false);
            setOpenPasswordModal(false);
            setOpenAddWorkerModal(false);
        }
    };

    // Function to send login details to the specified endpoint
    const sendLoginDetails = async (name, email, password) => {
        try {
            const response = await postData(
                "/api/sendLoginDetails",
                {name, email, password}
            );
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
            const firebaseResponse = await postData("/api/createWorkerFirebase", {
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
            // Update worker status in the formData
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
            throw error; // Re-throw the error if necessary for further handling
        }
    };

    const performDataOperations = async () => {
        setLoadingOperation(true)
        try {
            if (formData.ID) {
                const updateResponse = await putData(
                    "/api/updateWorkerOnboardingStatus",
                    formData,
                    window.location.href
                );
                if (!updateResponse || !updateResponse.success) {
                    throw new Error("Failed to update onboarding data.");
                }
            } else {
                const addResponse = await postData(
                    "/api/insertWorkerOnboarding",
                    formData,
                    window.location.href
                );
                if (!addResponse.success) {
                    throw new Error("Failed to add onboarding data.");
                }
                formData.ID = addResponse.uid;
            }
            console.log(formData.Status)
            if (formData.Status === "BOARD") {
                const transferResponse = await postData(
                    "/api/transferWorkerToMaster",
                    formData,
                    window.location.href
                );
                if (!transferResponse || !transferResponse.success) {
                    throw new Error("Failed to transfer worker to master.");
                }
            }
            // Clear form and reset state after successful data operations
            setFormData({});
            setIsRowClicked(false);
            setOpenModal(false);
            setOpenAddWorkerModal(false);
            setPassword("");
            const data = fetchWorkerOnboards();
            data.then((data) => setWorkerOnboards(data));
            alert("Worker onboarding data updated successfully.");
        } catch (error) {
            console.error("Error during data operations:", error.data.error);
            throw error;
        } finally {
            setLoadingOperation(false)
        }
    };

    const handleDeleteRow = () => {
        if (formData.ID) {
            const confirmDelete = window.confirm(
                "Are you sure you want to delete this item?"
            );
            if (confirmDelete) {
                deleteData(
                    "/api/deleteWorkerOnboarding",
                    formData,
                    window.location.href
                ).then((data) => {
                    if (data.success) {
                        alert("Data deleted successfully");
                        setFormData({});
                        const data = fetchWorkerOnboards();
                        data.then((data) => setWorkerOnboards(data));
                        setOpenModal(false);
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

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        handleClearForm();
        setOpenModal(false);
        setOpenAddWorkerModal(false);
        setIsRowClicked(false);
    };
    const handleRowClick = (row) => {
        console.log("Row clicked:", row);
        setFormData(row);
        setOriginalStatus(row.Status ? row.Status.toUpperCase() : ""); // Track original status
        setIsRowClicked(true);
        handleOpenModal();
    };

    const handleClearForm = () => setFormData({});
    const handleClosePasswordModal = () => {
        setOpenPasswordModal(false);
        setWorkerInfo({name: "", email: ""});
        setPassword("");
    };

    useEffect(() => {
        console.log("columns : ", columns)
    }, [openModal])
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
                                Worker Onboarding
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage all Worker Onboarding. Click on Edit to update their Worker Onboarding.
                            </p>
                        </div>

                        <button
                            onClick={() => setOpenAddWorkerModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <UserPlus className="h-4 w-4"/>
                            <span>Add Worker</span>
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
                    <CustomBreadcrumbs />
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                        <CustomAgGridDataTable2
                            rows={workerOnboards}
                            columns={columns.filter((col) => !['password', 'MakerUser', 'MakerDate'].includes(col.headerName))}
                            rowSelected={handleRowClick}
                        />
                    </div>
                </div>

                {/* Add/Edit Client Modal */}
                {(openModal || openAddWorkerModal) && (
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
                                        {openAddWorkerModal ? "Add New Client" : "Edit Client"}
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
