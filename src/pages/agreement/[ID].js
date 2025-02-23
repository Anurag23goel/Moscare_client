import {useRouter} from "next/router";
import {Alert, Box, Card, CircularProgress, Fade, Snackbar, Typography,} from "@mui/material";
import Row from "@/components/widgets/utils/Row";
import React, {useCallback, useEffect, useRef, useState,} from "react";
import InputField from "@/components/widgets/InputField";
import MButton from "@/components/widgets/MaterialButton";
import Checkbox from "@mui/material/Checkbox";
import {FileText, Plus, Save} from 'lucide-react';
import InputAdornment from "@mui/material/InputAdornment";
import {fetchData, fetchUserRoles, postData, putData,} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/generalSlice";
import Modal from "@mui/material/Modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import jsPDF from "jspdf";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CHKMListingDataTable from "@/components/widgets/CHKMListingDataTable";
import {Col, Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import "jspdf-autotable"; // Import the autoTable plugin
import {AgGridReact} from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import EditModal from "@/components/widgets/EditModal";
import SearchIcon from "@mui/icons-material/Search";
import {v4 as uuidv4} from "uuid";
import ValidationBar from "@/components/widgets/ValidationBar";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

const AgreementForm = () => {
    const router = useRouter();
    const {ID} = router.query;
    console.log("ID : ", ID);

    // const {colors, loading} = useContext(ColorContext);
    const [prompt, setPrompt] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openServiceMapModal, setOpenServiceMapModal] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tableOf, setTableOf] = useState("");
    const [columns, setColumns] = useState([]);
    const [newcolumns, setNewColumns] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [loadings, setLoadings] = useState(false);
    const [agreementServiceMapData, setAgreementServiceMapData] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [filterServiceData, setFilterServiceData] = useState([]);
    const mapdata = useRef([]);
    const dateStartandEnd = useRef([]);
    const [childServices, setChildServices] = useState([]);
    const [selectedServicesToInsert, setSelectedServicesToInsert] = useState([]);
    const [selectedServicesToDelete, setSelectedServicesToDelete] = useState([]);
    const [addServicesButtonDisabled, setAddServicesButtonDisabled] =
        useState(true);
    const [deleteServicesButtonDisabled, setDeleteServicesButtonDisabled] =
        useState(true);
    const [agreementDateRange, setAgreementDateRange] = useState([null, null]);
    const [openDialog, setOpenDialog] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [activeTab, setActiveTab] = useState("Agreement");
    const [selectedServices, setSelectedServices] = useState([]);
    const [show, setShow] = useState(false);
    const dispatch = useDispatch();
    const [detailsForm, setDetailsForm] = useState([]);
    const [dateList, setDateList] = useState([]);
    const [payer, setPayer] = useState([]);
    const [area, setArea] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedServiceModal, setSelectedServiceModal] = useState(false);
    const [rowSelectionModal, setRowSelectionModal] = useState([]);
    const [dataTosend, setDataToSend] = useState([]);
    const [parentService, setParentServices] = useState([]);
    const [validationMessages, setValidationMessages] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "",
    });

    const defaultAgreementForm = useSelector(
        (state) => state.agreement.agreementForm
    );

    const [agreementForm, setAgreementForm] = useState(defaultAgreementForm);
    const [disableSection, setDisableSection] = useState(false);

    const mergeProfileData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const agreementCodeGenerator = async (ID) => {
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear().toString().slice(2, 4);

        const response = await fetchData(
            `/api/getClientMasterData/${ID}`,
            window.location.href
        );
        const FirstName = response.data[0].FirstName;
        const LastName = response.data[0].LastName;

        //console.log("YOLO : ", FirstName, LastName);

        return `${FirstName.charAt(0)}${LastName.charAt(
            0
        )}${day}${month}${year}${hours}${minutes}${seconds}`;
    };

    useEffect(() => {
        console.log("selected services", selectedServices);
    }, []);
    const fetchDataAsync = async () => {
        if (ID) {
            if (isNaN(ID.charAt(0))) {
                const data = await fetchData(
                    `/api/getClientAgreementDataByID/${ID}`,
                    window.location.href
                );

                dateStartandEnd.current.push({
                    startDate: data[0]?.StartDate || "",
                    endDate: data[0]?.EndDate || "",
                });

                // console.log(data[0].StartDate);
                // console.log(data[0].EndDate);

                setAgreementForm(mergeProfileData(defaultAgreementForm, data[0]));
                await fetchAgreementServiceMaps();
            } else {
                const agreementCode = await agreementCodeGenerator(ID);
                setAgreementForm(
                    mergeProfileData(defaultAgreementForm, {
                        AgreementCode: agreementCode,
                        ClientID: ID,
                    })
                );
                await fetchAgreementServiceMaps();
            }
        }
    };

    const fetchModalTableDataAsync = async (tableFor) => {
        if (tableFor === "Area") {
            const response = await fetchData(
                "/api/getAreaData",
                window.location.href
            );
            console.log("Area : ", response);
            setTableData(response.data);
        } else if (tableFor === "Payer" || tableFor === "KMPayer") {
            const response = await fetchData("/api/getPayer");
            setTableData(response.data);
        }
    };

    const fetchPayerDetails = async () => {
        const response = await fetchData("/api/getPayer");
        console.log("getPayer : ", response.data);
        setPayer(response.data);
    };
    const fetchAreaDetails = async () => {
        const response = await fetchData("/api/getAreaData");
        console.log("getAreaData : ", response.data);
        setArea(response.data);
    };

    useEffect(() => {
        fetchPayerDetails();
        fetchAreaDetails();
    }, []);

    useEffect(() => {
        if (agreementForm.AgreementCode) {
            fetchAgreementServiceMaps();
        }
    }, [agreementForm.AgreementCode]); // Only re-run if AgreementCode changes

    const fetchAgreementServiceMaps = async () => {
        console.log("fetchAgreementServiceMaps Called");
        console.log("AgreementCoded", agreementForm.agreementCode);
        try {
            const data = await fetchData(
                `/api/getClientAgreementServicesMaps/${agreementForm.AgreementCode}`,
                window.location.href
            );
            console.log("getClientAgreementServicesMaps : ", data);

            if (
                data &&
                data.data &&
                Array.isArray(data.data) &&
                data.data.length > 0
            ) {
                console.log("getClientAgreementServicesMaps: ", data);

                // Proceed with mapping columns only if data.data is an array and has elements
                const columns = Object.keys(data.data[0]).map((key) => ({
                    field: key,
                    headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Format camel case to readable string
                }));

                // Use the columns
                console.log("Columns: ", columns);
                setColumns(columns);
            } else {
                console.error("Invalid data format or empty data array");
            }
            const filterData = data?.data?.filter((data) => !data.Parent_Code);
            setAgreementServiceMapData(filterData);
            BudgetSum(filterData);
        } catch (error) {
            console.error("Error fetching agreement service maps:", error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                    fetchDataAsync();
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                    fetchDataAsync();
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    const BudgetSum = (agreementServiceMapData) => {
        console.log("BudgetSum called", agreementServiceMapData);
        if (agreementServiceMapData?.length === 0) {
            return;
        }

        let budgetSum = 0;
        let budgetHourSum = 0;
        agreementServiceMapData?.forEach((service) => {
            budgetSum += service.Budget;
            budgetHourSum += service.BudgetHour;
        });

        console.log("BudgetSum", budgetSum);
        console.log("BudgetHourSum", budgetHourSum);

        //agreementForm.Budget = budgetSum;
        //agreementForm.BudgetHours = budgetHourSum;

        setAgreementForm((prevState) => ({
            ...prevState,
            Budget: budgetSum,
            BudgetHours: budgetHourSum,
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            if (ID) {
                await fetchDataAsync();
            } else {
                console.log("ID not available");
            }
        };
        fetchData();
        fetchUserRoles("m_agreements", "Client_Agreement", setDisableSection);
    }, [ID]);

    useEffect(() => {
        if (agreementForm.StartDate && agreementForm.EndDate) {
            setAgreementDateRange([agreementForm.StartDate, agreementForm.EndDate]);
        }

        //BudgetSum();
    }, [agreementForm]);

    const handleChange = (event) => {
        const value =
            event.target.type === "checkbox"
                ? event.target.checked
                : event.target.value;

        console.log("print type and value", event.target.id, event.target.value);

        if (event.target.id == "StartDate") {
            setAgreementDateRange((prevState) => [event.target.value, prevState[1]]);
        }
        if (event.target.id == "EndDate") {
            setAgreementDateRange((prevState) => [prevState[0], event.target.value]);
        }

        setAgreementForm((prevState) => {
            const updatedState = {...prevState, [event.target.id]: value};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleServiceSave = async () => {
        const validationErrors = [];
        if (selectedServices.length === 0) {
            validationErrors.push(`No services selected`);
        }

        // Validate all date fields and other fields
        selectedServices.forEach((item, index) => {
            if (!item.StartDate) {
                validationErrors.push(
                    `Start Date is missing for Service Id ${item.Service_ID}`
                );
            } else if (!dateValidation("StartDate", item.StartDate, index)) {
                validationErrors.push(`Invalid Start Date for item ${index + 1}`);
            }

            if (!item.EndDate) {
                validationErrors.push(`End Date is missing for item ${index + 1}`);
            } else if (!dateValidation("EndDate", item.EndDate, index)) {
                validationErrors.push(`Invalid End Date for item ${index + 1}`);
            }

            if (item.Budget == null || item.Budget < 0) {
                validationErrors.push(
                    `Budget must be a non-negative number for item ${index + 1}`
                );
            }

            if (item.BudgetHour == null || item.BudgetHour < 0) {
                validationErrors.push(
                    `Budget Hour must be a non-negative number for item ${index + 1}`
                );
            }
        });

        if (validationErrors.length > 0) {
            alert(`${validationErrors.join("\n")}`);
            return;
        }

        const mappingPayload = dataTosend.map((item) => ({
            AgreementCode: agreementForm.AgreementCode,
            ServiceCode: item.Service_Code,
        }));

        console.log("MappingPayload ", mappingPayload);
        console.log("AgreementCode ", agreementForm.AgreementCode);
        mappingPayload.forEach(async (item) => {
            const map = {
                AgreementCode: item.AgreementCode,
                ServiceCode: item.ServiceCode,
            };
            putData(
                "/api/insertClientAgreementServicesMap",
                map,
                window.location.href
            );
        });

        // Prepare budget data for posting to postServiceBudget
        const budgetPayload = dataTosend.map((item) => ({
            ServiceCode: item.Service_Code,
            AgreementCode: agreementForm.AgreementCode,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            Budget: item.Budget,
            BudgetHour: item.BudgetHour,
        }));

        console.log("budgetPayload ", budgetPayload);

        // Post service budgets
        try {
            const budgetResponse = await postData(
                "/api/postServiceBudget",
                budgetPayload, // sending the budgetPayload to your API
                window.location.href
            );
            console.log("Service Budget Response: ", budgetResponse);
            if (budgetResponse.success) {
                // alert("Services saved successfully!");
                setSnackbar({
                    open: true,
                    message: "Services saved successfully!",
                    severity: "success",
                });
                // Handle success, navigate or show message
            } else {
                // alert("Failed to save service budgets.");
                setSnackbar({
                    open: true,
                    message: "Failed to save service budgets.",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Error saving service budgets: ", error);
            // alert(error.data.error);
            setSnackbar({open: true, message: error.data.error, severity: "error"});
        }
        setActiveTab("Agreement");
        setSelectedServices([]);
        fetchAgreementServiceMaps();
        setShow(false);
    };

    const AgreementSaveFunction = async () => {
        if (
            agreementDateRange[0] == null ||
            agreementDateRange[0] == "" ||
            agreementDateRange[1] == null ||
            agreementDateRange[1] == ""
        ) {
            // setOpenDialog(true);
            console.log("Please Enter Agreement Start and End Date ");
            setSnackbar({
                open: true,
                message: "Please Enter Agreement Start and End Date",
                severity: "error",
            });

            return null;
        }

        if (isDateRangeExists(agreementDateRange[0], agreementDateRange[1])) {
            // setOpenDialog(true);
            console.log("Date range already exists");
            setSnackbar({
                open: true,
                message: "Date range already exists",
                severity: "error",
            });
            return null;
        }

        putData(
            `/api/upsertClientAgreementDataByClientID`,
            agreementForm,
            window.location.href
        )
            .then((response) => {
                console.log(response);
                if (response.success) {
                    // alert("Data Inserted Successfully");
                    addValidationMessage("Agreement Added Successfully", "success");
                }
            })
            .catch((error) => {
                console.error("Error saving agreement data: ", error);
                addValidationMessage("Error saving agreement data:", "error");
            });
    };

    const bulkUploadFunction = async () => {
        // Check if data is available
        if (!parsedData || parsedData.length === 0) {
            console.log("No data to upload");
            return;
        }
        const serviceBudgetData = parsedData.map((item) => ({
            AgreementCode: agreementForm.AgreementCode,
            Service_Code: item.Service_Code,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            Budget: item.Budget,
            BudgetHour: item.BudgetHour,
        }));

        const agreementServiceMappingData = parsedData.map((item) => ({
            AgreementCode: agreementForm.AgreementCode,
            Service_Code: item.Service_Code,
        }));

        console.log(serviceBudgetData, serviceBudgetData);
        console.log(agreementServiceMappingData, agreementServiceMappingData);
        // Prepare the payload to be sent to the backend
        const payload = {serviceBudgetData, agreementServiceMappingData};

        try {
            const response = await postData("/api/bulkUploadData", payload);
            if (response.success) {
                // alert("Data Inserted Successfully");
                addValidationMessage("Data Inserted Successfully", "success");
            }
            await fetchAgreementServiceMaps();
            console.log(response);
        } catch (err) {
            // alert(err?.data?.message);
            console.log("Error uploading data:", err);
            addValidationMessage(
                `Error uploading data : ${err?.data?.message}`,
                "error"
            );
        }
    };

    const handleSaveButton = async () => {
        await AgreementSaveFunction();
        if (selectedServices && selectedServices.length > 0) {
            await handleServiceSave();
        }
        if (parsedData && parsedData.length > 0) {
            await bulkUploadFunction();
        }
    };

    const isDateRangeExists = (startDate, endDate) => {
        if (!agreementServiceMapData || agreementServiceMapData?.length === 0) {
            return false;
        }
        return agreementServiceMapData?.some(
            (service) =>
                service.StartDate === startDate && service.EndDate === endDate
        );
    };

    const handleAddServicesButtonClick = async () => {
        if (!agreementForm.StartDate && !agreementForm.EndDate) {
            // alert("Please Enter Start Date and End Date");
            setSnackbar({
                open: true,
                message: "Please Enter Start Date and End Date",
                severity: "info",
            });
            handleTabChange("Agreement");
        }
        console.log("agreementDateRange ", agreementDateRange);
        if (
            agreementDateRange[0] == null ||
            agreementDateRange[0] == "" ||
            agreementDateRange[1] == null ||
            agreementDateRange[1] == ""
        ) {
            setOpenDialog(true);
            console.log("Please Enter Agreement Start and End Date ");

            return null;
        }

        if (isDateRangeExists(agreementDateRange[0], agreementDateRange[1])) {
            setOpenDialog(true);
            console.log("Date range already exists");
            return null;
        }

        // if (!agreementServiceMapData) handleSaveButton();
        setServicesLoading(true);
        console.log("getActiveServices ", window.location.href);
        if (servicesData.length === 0) {
            const response = await fetchData(
                "/api/getActiveServices",
                window.location.href
            );
            console.log(response);
            // Filter the servicesData to only include rows where Parent_Code is not defined
            const filteredServicesData = response.data.filter(
                (row) => !row.Parent_Code
            );
            setFilterServiceData(filteredServicesData);
            setServicesData(response.data);
        }

        // setOpenServiceMapModal(true);
        setServicesLoading(false);
    };

    const handleDownloadButtonClick = () => {
        // Define the CSV headers
        const headers = [
            "Service_Code",
            "Budget",
            "BudgetHour",
            "StartDate",
            "EndDate",
        ];

        // Combine headers and rows
        const csvData = [headers]
            .map((row) => row.join(",")) // Join columns with a comma
            .join("\n"); // Join rows with a newline

        // Create a Blob for the CSV data
        const blob = new Blob([csvData], {type: "text/csv;charset=utf-8;"});

        // Create a link and trigger the download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", "servicesTemplate.csv"); // File name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const csvContent = e.target.result;
            parseCsvData(csvContent);

            // Reset the file input to allow re-uploading the same file
            event.target.value = null;
        };

        if (file) {
            reader.readAsText(file);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({open: false, message: "", severity: ""});
    };

    const parseCsvData = (csvContent) => {
        const rows = csvContent.split("\n");
        const parsedHeaders = rows[0].split(",").map((header) => header.trim());
        const parsedData = rows.slice(1).map((row) =>
            row.split(",").reduce((obj, value, index) => {
                obj[parsedHeaders[index]] = value.trim();
                return obj;
            }, {})
        );

        // Filter out rows with empty or invalid data
        const filteredData = parsedData.filter(
            (row) =>
                row.Service_Code &&
                row.StartDate &&
                row.EndDate &&
                row.Budget &&
                row.BudgetHour
        );

        // Set Columns for AgGrid
        const gridColumns = parsedHeaders.map((header) => ({
            headerName: header.replace(/([a-z])([A-Z])/g, "$1 $2"),
            field: header,
        }));

        if (filteredData.length > 0) {
            // alert("File Processed Successfully ");
            setSnackbar({
                open: true,
                message: "File Processed Successfully",
                severity: "success",
            });
        }

        console.log("Parsed Headers:", gridColumns);
        console.log("Filtered Data:", filteredData);

        // Update State
        setColumns(gridColumns);
        setParsedData(filteredData);
        // handleSave(filteredData);
    };

    const handleUploadButtonClick = () => {
        document.getElementById("csvInput").click();
    };

    const handleSave = async (parsedData) => {
        const data = parsedData;

        // Check if data is available
        if (!data || data.length === 0) {
            console.log("No data to upload");
            return;
        }

        // Split data into serviceBudgetData and agreementServiceMappingData
        const serviceBudgetData = data.map((item) => ({
            AgreementCode: agreementForm.AgreementCode,
            Service_Code: item.Service_Code,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            Budget: item.Budget,
            BudgetHour: item.BudgetHour,
        }));

        const agreementServiceMappingData = data.map((item) => ({
            AgreementCode: agreementForm.AgreementCode,
            Service_Code: item.Service_Code,
        }));

        console.log(serviceBudgetData, agreementServiceMappingData);
        // Prepare the payload to be sent to the backend
        const payload = {serviceBudgetData, agreementServiceMappingData};

        try {
            const response = await postData("/api/bulkUploadData", payload);
            if (response.success) {
                // alert("Data Inserted Successfully");
                validationMessages("Data Inserted Successfully", "Success");
            }
            console.log(response);
        } catch (err) {
            // alert(err.data.message);
            validationMessages(err.data.message, "error");
            console.log("Error uploading data:", err);
        }
        fetchAgreementServiceMaps();
    };

    const addValidationMessage = useCallback((content, type = "info") => {
        const id = uuidv4();
        setValidationMessages((prev) => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);

    const handleModalTableRowClick = (row) => {
        setAgreementForm((prevState) => {
            // if the tableOf is Payer or KMPayer, set the Area to the Area of the selected Payer
            if (tableOf === "Payer" || tableOf === "KMPayer") {
                const payer = row.Code;
                const updatedState = {...prevState, [`${tableOf}Code`]: payer};
                dispatch(upsertData(updatedState));
                return updatedState;
            } else if (tableOf === "Area") {
                const area = row.AreaCode;
                const updatedState = {...prevState, AreaCode: area};
                dispatch(upsertData(updatedState));
                return updatedState;
            }
        });
    };

    const handleRowSelectionModelChange = (selectedIDs) => {
        console.log("selectedIDs :", selectedIDs);

        // Step 1: Get the selected services based on the IDs
        const selectedData = servicesData.filter((row) =>
            selectedIDs.includes(row.Service_ID)
        );

        console.log("Directly Selected Data:", selectedData);

        // Step 2: Collect children of the selected services
        const selectedServiceCodes = selectedData.map((row) => row.Service_Code);

        // Find children of the selected services
        const childServices = servicesData.filter((row) =>
            selectedServiceCodes.includes(row.Parent_Code)
        );

        console.log("Child Services:", childServices);

        // Combine selected services and their children
        const allSelectedData = [...selectedData, ...childServices];

        // Remove duplicates in case a service is both selected directly and as a child
        const uniqueSelectedData = Array.from(
            new Map(allSelectedData.map((item) => [item.Service_ID, item])).values()
        );

        console.log("All Selected Data (with children):", uniqueSelectedData);
        setChildServices(childServices);
        setSelectedServices(selectedData);
    };

    const handleTransfer = (ClientID, AgreementCode) => {
        router.push(
            `/agreement/transfer?ClientID=${ClientID}&AgreementCode=${AgreementCode}`
        );
    };

    const handleRowDeleteSelectionModelChange = (selectedIDs) => {
        setSelectedServicesToDelete(selectedIDs);
        if (selectedIDs.length > 0) {
            setDeleteServicesButtonDisabled(false);
        } else {
            setDeleteServicesButtonDisabled(true);
        }
    };

    const handleAddSelectedServicesButtonClick = () => {
        // console.log("selectedSer : " , selectedServices)
        if (selectedServices.length > 0) {
            setShow(true);
        } else {
            setShow(false);
        }
    };

    useEffect(() => {
        console.log("Show : ", show);
    }, [show]);

    const handleDeleteSelectedServicesButtonClick = async () => {
        console.log("selectedServicesToDelete:", selectedServicesToDelete);

        // Check if there are services selected for deletion
        if (selectedServicesToDelete.length === 0) {
            console.log("No services selected for deletion.");
            return;
        }

        // Iterate over selected services and delete them
        const deletePromises = selectedServicesToDelete.map(async (ServiceCode) => {
            const service = agreementServiceMapData.find(
                (item) => item.Service_Code === ServiceCode
            );

            if (service) {
                const map = {
                    AgreementCode: agreementForm.AgreementCode, // Correct agreement code
                    ServiceCode: ServiceCode, // Correctly assign the ServiceCode
                };

                console.log("Removing:", map);

                // Call the API to delete the service map (parent + child services will be handled in the backend)
                try {
                    await putData(
                        "/api/deleteClientAgreementServicesMap",
                        map,
                        window.location.href
                    );
                    console.log(`Successfully deleted service: ${service.Service_Code}`);
                    setSnackbar({
                        open: true,
                        message: `ServiceCode ${ServiceCode} is deleted Successfully`,
                        severity: "success",
                    });
                } catch (error) {
                    console.error(
                        `Failed to delete service: ${service.Service_Code}`,
                        error
                    );
                }
            } else {
                console.error(`ServiceCode ${ServiceCode} not found in data.`);
                setSnackbar({
                    open: true,
                    message: `ServiceCode ${ServiceCode} not found in data.`,
                    severity: "error",
                });
            }
        });

        // Wait for all deletions to complete
        await Promise.all(deletePromises);

        // Refresh the grid data after deletion
        try {
            await fetchAgreementServiceMaps();
            console.log("Grid data refreshed.");
        } catch (error) {
            console.error("Failed to refresh grid data:", error);
        }

        // Clear selected services and disable delete button
        setSelectedServicesToDelete([]);
        setDeleteServicesButtonDisabled(true);
    };

    const handleAgreementClone = async () => {
        if (window.confirm("Are you sure you want to clone this agreement?")) {
            console.log("Cloning Agreement", agreementForm.ClientID);
            const agreementCode = await agreementCodeGenerator(
                agreementForm.ClientID
            );
            const clonedAgreement = {
                ...agreementForm,
                AgreementCode: agreementCode,
            };

            putData(
                "/api/upsertClientAgreementDataByClientID",
                clonedAgreement,
                window.location.href
            )
                .then((response) => {
                    console.log(response);
                    router.push(`/agreement/${ID}`);
                })
                .catch((error) => {
                    console.error("Error cloning agreement: ", error);
                });
        } else {
            console.log("Clone Cancelled");
        }
    };

    const handleNewAgreementClick = () => {
        window.open(`/agreement/${ClientID}`, "_blank", "noopener,noreferrer");
    };

    // Function to update the selected service in the parent state
    const onUpdateService = (updatedService) => {
        console.log("updatedService ;", updatedService);
        setSelectedServices((prevServices) =>
            prevServices.map((service) =>
                service.Service_ID === updatedService.Service_ID
                    ? {...service, ...updatedService}
                    : service
            )
        );
        setSelectedServiceModal(false);
    };

    const handleRowSelected = (selectedRows) => {
        console.log("Selected rows:", selectedRows);
        setSelectedRows(selectedRows);
        setSelectedServiceModal(true);
    };

    const handleAgreementDownload = async () => {
        setLoadings(true);

        try {
            // Fetch Agreement Details
            const agreementResponse = await fetchData(
                `/api/getAgreementDetailsByClientAndAgreementId/${agreementForm.ClientID}/${agreementForm.AgreementCode}`
            );
            console.log("agreementResponse : ", agreementResponse);
            const agreementData = agreementResponse[0];

            // Fetch Services Data
            const servicesResponse = await fetchData(
                `/api/getClientAgreementServicesMaps/${agreementForm.AgreementCode}`
            );

            // Prepare the PDF
            const doc = new jsPDF();
            doc.setFont("Metropolis");
            doc.setFontSize(12);

            // Title for Agreement Details
            doc.text("AGREEMENT", 105, 10, {align: "center"});

            // Agreement Details Table
            const agreementTableData = [
                [
                    "Client First Name",
                    agreementData?.FirstName || "N/A",
                    "Client Last Name",
                    agreementData?.LastName || "N/A",
                ],
                [
                    "Agreement Code",
                    agreementData?.AgreementCode || "N/A",
                    "Agreement Type",
                    agreementData?.AgreementType || "N/A",
                ],
                [
                    "MMM Level",
                    agreementData?.MMMLevel || "N/A",
                    "Charge Rate / NDIS Region",
                    agreementData?.ChargeRate || "N/A",
                ],
                [
                    "NDIS Funding Management",
                    agreementData?.FundingManagement || "N/A",
                    "NDIS Activity Type",
                    agreementData?.ActivityType || "N/A",
                ],
                [
                    "Budget Period",
                    agreementForm?.BudgetPeriod || "N/A",
                    "Budget",
                    agreementForm?.Budget || "N/A",
                ],
                [
                    "Budget Hour",
                    agreementForm?.BudgetHour || "N/A",
                    "Start Date",
                    agreementData?.StartDate || "N/A",
                ],
                [
                    "End Date",
                    agreementData?.EndDate || "N/A",
                    "Alert Date",
                    agreementData?.AlertDate || "N/A",
                ],
                [
                    "Km Payer Name",
                    agreementData?.KmPayerName || "N/A",
                    "Override KM Charge Rate",
                    agreementData?.OverrideKMChargeRate || "N/A",
                ],
                ["Payer Name", agreementData?.PayerName || "N/A", "", ""],
                [
                    "Reference 1",
                    agreementData?.Reference1 || "N/A",
                    "Reference 2",
                    agreementData?.Reference2 || "N/A",
                ],
                [
                    "Reference 3",
                    agreementData?.Reference3 || "N/A",
                    "Notes",
                    agreementData?.Notes || "N/A",
                ],
            ];

            doc.autoTable({
                // head: [[]],
                body: agreementTableData,
                startY: 20,
                styles: {
                    fontSize: 8, // Reduced font size for better fit
                    cellPadding: {top: 3, right: 4, bottom: 3, left: 4}, // Reduce padding
                    overflow: "linebreak", // Allow content wrapping
                    halign: "center",
                    valign: "middle", // Vertically align text in the middle
                },
                columnStyles: {
                    0: {fontStyle: "bold"},
                    2: {fontStyle: "bold"},
                },
                // theme: "plain",
            });

            // Add Title for Services Table
            const servicesStartY = doc.previousAutoTable.finalY + 10;
            doc.text("Services", 105, servicesStartY, {align: "center"});

            // Services Table
            const servicesTableData = servicesResponse?.data?.map((service) => [
                service.Shift_Type,
                service.Service_Code,
                service.Description,
                service.Charge_Rate_1,
                service.Pay_Rate_1,
                service.Budget,
                service.BudgetHour,
            ]);

            doc.autoTable({
                head: [
                    [
                        "Type",
                        "Service Code",
                        "Service",
                        "Charge Rate",
                        "Pay Rate",
                        "Budget",
                        "Budget Hours",
                    ],
                ],
                body: servicesTableData,
                startY: servicesStartY + 10,
                styles: {
                    fontSize: 8, // Reduced font size for better fit
                    cellPadding: {top: 3, right: 4, bottom: 3, left: 4}, // Reduce padding
                    overflow: "linebreak", // Allow content wrapping
                    halign: "center",
                    valign: "middle", // Vertically align text in the middle
                },
                headStyles: {
                    fillColor: "blue", // Header background color
                    fontSize: 8, // Slightly larger font size for headers
                    halign: "center", // Center-align header text
                    fontStyle: "bold", // Bold headers
                    cellPadding: {top: 2, right: 2, bottom: 2, left: 2}, // Match padding for consistency
                },
                columnStyles: {
                    0: {cellWidth: 20}, // Set width for "Type"
                    1: {cellWidth: 40}, // Set width for "Service Code"
                    2: {cellWidth: 40}, // Set width for "Service"
                    3: {cellWidth: 25}, // Set width for "Charge Rate"
                    4: {cellWidth: 20}, // Set width for "Pay Rate"
                    5: {cellWidth: 20}, // Set width for "Budget"
                    6: {cellWidth: 25}, // Set width for "Budget Hours"
                },
            });

            // Save the PDF
            doc.save("Agreement.pdf");
        } catch (error) {
            console.error("Error fetching data:", error);
            // alert("Failed to download the agreement. Please try again.");
            setSnackbar({
                open: true,
                message: "Failed to download the agreement. Please try again",
                severity: "error",
            });
            addValidationMessage(
                "Failed to download the agreement. Please try again.",
                "error"
            );
        } finally {
            setLoadings(false);
        }
    };

    const Aggridcolumns = [
        {
            headerName: "Select",
            checkboxSelection: true, // Add checkbox for selection
            headerCheckboxSelection: true, // Add checkbox in the header for "Select All"
            flex: 1,
        },
        {field: "Service_ID", headerName: "Service Id", flex: 1}, // Adjust flex for responsive columns
        {field: "Service_Code", headerName: "Service Code", flex: 1},
        {field: "Description", headerName: "Description", flex: 2},
        {field: "Budget", headerName: "Budget", flex: 1},
        {field: "BudgetHour", headerName: "Budget Hours", flex: 1},
        {field: "StartDate", headerName: "Start Date", flex: 1},
        {field: "EndDate", headerName: "End Date", flex: 1},
    ];
    const selectedServiceColumns = [
        {field: "Service_ID", headerName: "Service Id", flex: 1}, // Adjust flex for responsive columns
        {field: "Service_Code", headerName: "Service Code", flex: 1},
        {field: "Description", headerName: "Description", flex: 2},
        {field: "Budget", headerName: "Budget", flex: 1},
        {field: "BudgetHour", headerName: "Budget Hours", flex: 1},
        {field: "StartDate", headerName: "Start Date", flex: 1},
        {field: "EndDate", headerName: "End Date", flex: 1},
    ];

    useEffect(() => {
        const data = [...selectedServices, ...childServices];
        console.log("MergedData", data);
        setDataToSend(data);
    }, [selectedServices]);

    const handleInputChange = ({id, value}) => {
        console.log("Field: ", id, "Value: ", value);

        // Update the parent service in the selectedRows state
        setSelectedRows((prevRows) => {
            const updatedRows = {
                ...prevRows,
                [id]: value, // Update the parent service with the id and value
            };

            // Now, update the child services directly
            setChildServices((prevChildServices) => {
                const updatedChildServices = prevChildServices.map((childServ) => {
                    // Correct condition: Check if Parent_Code in child matches the updated parent Service_Code
                    if (childServ.Parent_Code === updatedRows.Service_Code) {
                        console.log("Updating child service: ", childServ);
                        // Update the child service with the new value
                        return {
                            ...childServ,
                            Budget: 0,
                            BudgetHour: 0,
                            [id]: value, // Update the child field (same id as in parent)
                        };
                    }
                    // Return the child service unchanged if it doesn't match
                    return childServ;
                });

                console.log("Updated Child Services: ", updatedChildServices);
                console.log("Updated Parent Services: ", updatedRows);

                // Combine the parent and child data into dataToSend
                const dataToSend = [
                    updatedRows, // Parent data
                    ...updatedChildServices.filter(
                        (childServ) => childServ.Parent_Code === updatedRows.Service_Code // Include only associated children
                    ),
                ];

                console.log("Data to Send: ", dataToSend);

                // Update the dataToSend state
                setDataToSend(dataToSend);

                return updatedChildServices;
            });

            console.log("Updated Parent Service: ", updatedRows);
            return updatedRows;
        });
    };

    const fields = [
        {
            type: "number",
            label: "Budget $",
            id: "Budget",
        },
        {
            type: "number",
            label: "Budget Hour",
            id: "BudgetHour",
        },
        {
            type: "date",
            label: "Service Start Date",
            id: "StartDate",
        },
        {
            type: "date",
            label: "Service End Date",
            id: "EndDate",
        },
    ];

    useEffect(() => {
        console.log("selectedServices : ", selectedServices);
    }, [selectedServices]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const dateValidation = (field, value, index) => {
        if (!value) {
            // alert(`${field} cannot be empty.`);
            setSnackbar({
                open: true,
                message: `${field} cannot be empty.`,
                severity: "error",
            });
            handleInputChange(index, field, null);
            return false;
        }

        console.log(dateList);
        const startDateLimit = new Date(dateList.StartDate);
        const endDateLimit = new Date(dateList.EndDate);
        const selectedDate = new Date(value);

        const startDate = detailsForm[index]?.StartDate
            ? new Date(detailsForm[index].StartDate)
            : null;
        const endDate = detailsForm[index]?.EndDate
            ? new Date(detailsForm[index].EndDate)
            : null;

        if (field === "StartDate") {
            if (selectedDate < startDateLimit) {
                // alert("Start Date is earlier than the agreement's Start Date.");
                setSnackbar({
                    open: true,
                    message: `Start Date is earlier than the agreement',severity: 'error'});
        handleInputChange(index, field, null);
        return false;
      } else if (endDate && selectedDate > endDate) {
        // alert("Start Date cannot be later than the End Date.");
        setSnackbar({open: true, message:'StartDate cannot be later than the End Date',severity: 'error`,
                });
                handleInputChange(index, "EndDate", null);
                return false;
            }
        }

        if (field === "EndDate") {
            if (selectedDate > endDateLimit) {
                // alert("End Date is later than the agreement's End Date.");
                setSnackbar({
                    open: true,
                    message: "End Date is later than the agreement's End Date.",
                    severity: "error",
                });
                handleInputChange(index, field, null);
                return false;
            } else if (startDate && selectedDate < startDate) {
                // alert("End Date cannot be earlier than the Start Date.");
                setSnackbar({
                    open: true,
                    message: "End Date cannot be earlier than the Start Date.",
                    severity: "error",
                });
                handleInputChange(index, field, null);
                return false;
            }
        }

        return true;
    };

    const handleExport = () => {
        if (!rows || rows.length === 0) {
            console.error("No data available for export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GridData");
        XLSX.writeFile(workbook, "grid_data.xlsx");
    };

    // Handle selection changes in the grid
    // Handle selection changes
    const onSelectionChanged = (params) => {
        const selectedNodes = params.api.getSelectedNodes(); // Get the selected rows
        const selectedServiceIDs = selectedNodes.map(
            (node) => node.data.Service_Code
        ); // Map to `Service_ID` field
        console.log("Params : ", selectedServiceIDs);
        console.log("Selected Service IDs: ", selectedServiceIDs);
        setSelectedServicesToDelete(selectedServiceIDs); // Store the selected Service_IDs
        setDeleteServicesButtonDisabled(selectedServiceIDs.length === 0); // Enable/Disable button
    };


    const handleSearchService = async (e) => {
        const val = e.target.value.trim(); // Get trimmed value from input
        console.log("Search Value:", val);

        // If the search field is empty, reset the data or call the handleAddServicesButtonClick function
        if (!val) {
            const response = await fetchData(
                "/api/getActiveServices",
                window.location.href
            );
            // Filter the servicesData to only include rows where Parent_Code is not defined
            const filteredServicesData = response.data.filter(
                (row) => !row.Parent_Code // Only keep rows where Parent_Code is undefined or null
            );
            console.log("filteredServicesData : ", filteredServicesData);
            setFilterServiceData(filteredServicesData);
            return;
        }
        console.log("outside service");
        // Filter the service data based on Service_Code or Service_ID
        const filterService = filterServiceData.filter((service) =>
            service.Description?.toString().toLowerCase().includes(val.toLowerCase())
        );

        // Update the filtered data state
        setFilterServiceData(filterService);

        console.log("Filtered Service Data:", filterService);
    };

    return (
        <div className="min-h-screen gradient-background">
            {/*<Navbar />*/}

            <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div
                    className="glass  dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Agreement Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage client agreement information
                            </p>
                        </div>

                        <button
                            onClick={() => handleSaveButton()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
                        >
                            <Save className="h-4 w-4"/>
                            <span>Save Agreement</span>
                        </button>
                    </div>
                    <Modal
                        open={openModal}
                        onClose={() => {
                            setOpenModal(false);
                            setTableData([]);
                        }}
                    >
                        <Fade in={openModal}>
                            <Box sx={style}>
                                <ModalHeader
                                    onCloseButtonClick={() => {
                                        setOpenModal(false);
                                        setTableData([]);
                                    }}
                                />
                                <MListingDataTable
                                    rows={tableData}
                                    rowSelected={(row) => {
                                        handleModalTableRowClick(row);
                                    }}
                                />
                            </Box>
                        </Fade>
                    </Modal>

                    <Container>
                        <ValidationBar
                            messages={validationMessages}
                            onClose={handleCloseMessage}
                        />
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <button
                                    onClick={() => handleTabChange("Agreement")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                        activeTab === "Agreement"
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                            : 'glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                    }`}
                                >
                                    <FileText className="h-4 w-4"/>
                                    <span>Agreement</span>
                                </button>

                                <button
                                    onClick={() => {
                                        handleTabChange("Add Services");
                                        handleAddServicesButtonClick();
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                        activeTab === "Add Services"
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                            : 'glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                    }`}
                                >
                                    <Plus className="h-4 w-4"/>
                                    <span>Add Services</span>
                                </button>
                            </div>
                        </div>

                        {activeTab === "Agreement" ? (
                            <Box>
                                <div style={{padding: "20px"}}>
                                    <Box
                                        sx={{
                                            borderRadius: "20px",
                                            border: "1px solid black",
                                            padding: "1rem",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "1rem",
                                                marginLeft: "1rem",
                                                fontWeight: "600",
                                            }}
                                        >
                                            Agreement Details <span style={{color: "red"}}>*</span>
                                        </h3>
                                        <Row className="mb-3">
                                            <Col>
                                                <InputField
                                                    label="Agreement Code"
                                                    onChange={handleChange}
                                                    value={agreementForm.AgreementCode}
                                                    id="AgreementCode"
                                                    disabled
                                                />
                                            </Col>
                                            <Col>
                                                <InputField
                                                    label="Client ID"
                                                    id="ClientID"
                                                    onChange={handleChange}
                                                    value={agreementForm.ClientID}
                                                    disabled
                                                />
                                            </Col>
                                            <Col>
                                                <InputField
                                                    id="AgreementType"
                                                    type="select"
                                                    label="Agreement Type"
                                                    value={agreementForm.AgreementType}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    options={[
                                                        {label: "CHSP", value: "CHSP"},
                                                        {label: "Core Supports", value: "Core Supports"},
                                                        {label: "CoS", value: "CoS"},
                                                        {
                                                            label: "CoS - Self Managed",
                                                            value: "CoS - Self Managed",
                                                        },
                                                        {label: "CSIA", value: "CSIA"},
                                                        {label: "CVS Home", value: "CVS Home"},
                                                        {label: "DVA1", value: "DVA1"},
                                                        {label: "Family Support", value: "Family Support"},
                                                        {label: "HACC", value: "HACC"},
                                                        {
                                                            label: "Home Care Package",
                                                            value: "Home Care Package",
                                                        },
                                                        {label: "Hospital", value: "Hospital"},
                                                        {label: "Insurance", value: "Insurance"},
                                                        {label: "LTC - NSW", value: "LTC - NSWC"},
                                                        {label: "NDIS", value: "NDIS"},
                                                        {
                                                            label: "NDIS Agency Manage 2",
                                                            value: "NDIS Agency Manage 2",
                                                        },
                                                        {label: "Nursing Home", value: "Nursing Home"},
                                                        {label: "Office", value: "Office"},
                                                        {label: "Others", value: "Others"},
                                                    ]}
                                                />
                                            </Col>
                                            <Col>
                                                <InputField
                                                    id="BudgetPeriod"
                                                    type="select"
                                                    label="Budget Period"
                                                    value={agreementForm.BudgetPeriod}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    options={[
                                                        {label: "DAILY", value: "DAILY"},
                                                        {label: "WEEKLY", value: "WEEKLY"},
                                                        {label: "FORTNIGHTLY", value: "FORTNIGHTLY"},
                                                        {label: "MONTHLY", value: "MONTHLY"},
                                                        {label: "QUARTERLY", value: "QUARTERLY"},
                                                        {label: "6 MONTHLY", value: "6 MONTHLY"},
                                                        {label: "YEARLY", value: "YEARLY"},
                                                        {label: "18 MONTHS", value: "18 MONTHS"},
                                                        {label: "2 YEARS", value: "2 YEARS"},
                                                        {label: "3 YEARS", value: "3 YEARS"},
                                                    ]}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col>
                                                <InputField
                                                    id="Budget"
                                                    label="Budget"
                                                    value={agreementForm.Budget}
                                                    onChange={handleChange}
                                                    placeholder="Enter Budget"
                                                    disabled
                                                    startIcon={<InputAdornment position="start">$</InputAdornment>}
                                                    type="number"
                                                />

                                            </Col>

                                            <Col>
                                                <InputField
                                                    onChange={handleChange}
                                                    type="number"
                                                    id="BudgetHours"
                                                    label="Budget Hours"
                                                    value={agreementForm.BudgetHours}
                                                    /* disabled = {disableSection} */
                                                    disabled
                                                />
                                            </Col>
                                            <Col>
                                                <InputField
                                                    label="KM"
                                                    onChange={handleChange}
                                                    id="KM"
                                                    value={agreementForm.KM}
                                                    disabled={disableSection}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <InputField
                                                    type="date"
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    label="Start Date"
                                                    id="StartDate"
                                                    value={agreementForm.StartDate}
                                                    required={true}
                                                />
                                            </Col>
                                            <Col>
                                                <InputField
                                                    type="date"
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    label="End Date"
                                                    id="EndDate"
                                                    value={agreementForm.EndDate}
                                                    required={true}
                                                />
                                            </Col>

                                            <Col>
                                                <InputField
                                                    type="date"
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    label="Alert Date"
                                                    id="AlertDate"
                                                    value={agreementForm.AlertDate}
                                                />
                                            </Col>
                                        </Row>
                                    </Box>

                                    <Box
                                        sx={{
                                            borderRadius: "20px",
                                            border: "1px solid black",
                                            padding: "1rem",
                                            marginTop: "1rem",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "1rem",
                                                marginLeft: "1rem",
                                                fontWeight: "600",
                                            }}
                                        >
                                            Payer Details
                                        </h3>
                                        <Row className="mb-3">
                                            <Col>
                                                <InputField
                                                    id="PayerCode"
                                                    type="select"
                                                    label="Payer"
                                                    value={agreementForm.PayerCode}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    options={payer.map((p) => ({
                                                        value: p.ID,
                                                        label: p.Description,
                                                    }))}
                                                />
                                            </Col>

                                            <Col>
                                                <InputField
                                                    id="AreaCode"
                                                    type="select"
                                                    label="Area"
                                                    value={agreementForm.AreaCode}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    options={area.map((p) => ({
                                                        value: p.ID,
                                                        label: p.Area,
                                                    }))}
                                                />
                                            </Col>
                                        </Row>
                                    </Box>

                                    <Box
                                        sx={{
                                            borderRadius: "20px",
                                            border: "1px solid black",
                                            padding: "1rem",
                                            marginTop: "1rem",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "1rem",
                                                marginLeft: "1rem",
                                                fontWeight: "600",
                                            }}
                                        >
                                            Other Details
                                        </h3>
                                        <Row>
                                            <Col>
                                                <Col>
                                                    {agreementForm.AgreementType === "NDIS" ? (
                                                        <>
                                                            <Row className="mb-3">
                                                                <div style={{flex: "1", minWidth: "250px"}}>
                                                                    <InputField
                                                                        id="ChangeRateNDISRegion"
                                                                        type="select"
                                                                        label="Change Rate / NDIS Region"
                                                                        value={agreementForm.ChangeRateNDISRegion}
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        options={[
                                                                            {
                                                                                label: "Charge Rate 1 / National",
                                                                                value: "Charge Rate 1 / National",
                                                                            },
                                                                            {
                                                                                label: "Charge Rate 2 / National Remote",
                                                                                value: "Charge Rate 2 / National Remote",
                                                                            },
                                                                            {
                                                                                label:
                                                                                    "Charge Rate 3 / National Very Remote",
                                                                                value:
                                                                                    "Charge Rate 3 / National Very Remote",
                                                                            },
                                                                        ]}
                                                                    />
                                                                </div>
                                                                <div style={{flex: "1", minWidth: "250px"}}>
                                                                    <InputField
                                                                        id="NDISActivityType"
                                                                        type="select"
                                                                        label="NDIS Activity Type"
                                                                        value={agreementForm.NDISActivityType}
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        options={[
                                                                            {
                                                                                label: "Direct / 1:1",
                                                                                value: "Direct / 1:1",
                                                                            },
                                                                            {label: "RATIO", value: "RATIO"},
                                                                            {label: "GROUP", value: "GROUP"},
                                                                            {
                                                                                label: "Set ratio when rostering",
                                                                                value: "Set ratio when rostering",
                                                                            },
                                                                        ]}
                                                                    />
                                                                </div>
                                                                <div style={{flex: "1", minWidth: "250px"}}>
                                                                    <InputField
                                                                        id="NDISFundingManagement"
                                                                        type="select"
                                                                        label="NDIS Funding Management"
                                                                        value={agreementForm.NDISFundingManagement}
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        options={[
                                                                            {label: "NONE", value: ""},
                                                                            {
                                                                                label: "NDIS - Agency Managed",
                                                                                value: "AGENCY",
                                                                            },
                                                                            {
                                                                                label: "NDIS - PLAN Managed",
                                                                                value: "PLAN",
                                                                            },
                                                                            {
                                                                                label: "NDIS - SELF Managed",
                                                                                value: "SELF",
                                                                            },
                                                                        ]}
                                                                    />
                                                                </div>
                                                            </Row>
                                                            <Row className="mb-3">
                                                                <div style={{flex: "1", minWidth: "250px"}}>
                                                                    <InputField
                                                                        id="MMMLevel"
                                                                        type="select"
                                                                        label="MMM Level"
                                                                        value={agreementForm.MMMLevel}
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        options={[
                                                                            {label: "MMM 1", value: "MMM 1"},
                                                                            {label: "MMM 2", value: "MMM 2"},
                                                                            {label: "MMM 3", value: "MMM 3"},
                                                                            {label: "MMM 4", value: "MMM 4"},
                                                                            {label: "MMM 5", value: "MMM 5"},
                                                                            {label: "MMM 6", value: "MMM 6"},
                                                                            {label: "MMM 7", value: "MMM 7"},
                                                                        ]}
                                                                    />
                                                                </div>
                                                                <div style={{flex: "1", minWidth: "250px"}}>
                                                                    <InputField
                                                                        label="Override KM Code for NDIS"
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        id="OvdKMCodeNDIS"
                                                                        value={agreementForm.OvdKMCodeNDIS}
                                                                    />
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        flex: "1",
                                                                        minWidth: "250px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={agreementForm.CnvrtKMToTime}
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        value={agreementForm.CnvrtKMToTime}
                                                                        id="CnvrtKMToTime"
                                                                    />
                                                                    Convert KM to Time
                                                                </div>
                                                            </Row>

                                                            <Row className="mb-3">
                                                                <Col>
                                                                    <InputField
                                                                        label="Reference 1"
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        id="Reference1"
                                                                        value={agreementForm.Reference1}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    <InputField
                                                                        label="Reference 2"
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        id="Reference2"
                                                                        value={agreementForm.Reference2}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    <InputField
                                                                        label="Reference 3"
                                                                        onChange={handleChange}
                                                                        disabled={disableSection}
                                                                        id="Reference3"
                                                                        value={agreementForm.Reference3}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    ) : (
                                                        <div></div>
                                                    )}
                                                </Col>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <InputField
                                                    id="KMPayerCode"
                                                    type="select"
                                                    label="KM Payer"
                                                    value={agreementForm.KMPayerCode}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    options={area.map((p) => ({
                                                        value: p.ID,
                                                        label: p.Area,
                                                    }))}
                                                />
                                            </Col>

                                            <Col>
                                                <InputField
                                                    type="text"
                                                    onChange={handleChange}
                                                    id="Note"
                                                    value={agreementForm.Note}
                                                    label="Note"
                                                    disabled={disableSection}
                                                />
                                            </Col>
                                            <Col>
                                                <InputField
                                                    id="OvdKMChargeCode"
                                                    type="select"
                                                    label="Override KM Charge Code"
                                                    value={agreementForm.OvdKMChargeCode}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    options={[
                                                        {label: "Public Holiday", value: "Public Holiday"},
                                                        {label: "Sunday", value: "Sunday"},
                                                    ]}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col style={{fontSize: "12px"}} md={4}>
                                                <Checkbox
                                                    checked={agreementForm.CHKExcldHoliday}
                                                    onChange={handleChange}
                                                    disabled={disableSection}
                                                    value={agreementForm.CHKExcldHoliday}
                                                    id="CHKExcldHoliday"
                                                />
                                                Exclude public holiday when rostering
                                            </Col>
                                        </Row>
                                    </Box>

                                    <Row className="mb-3">
                                        <Col>
                                            <div style={{flex: "0.2", minWidth: "250px"}}>
                                                {agreementForm.AgreementType === "CHSP" ? (
                                                    <InputField
                                                        id="ClientContributionPayer"
                                                        type="select"
                                                        label="Client Contribution Payer"
                                                        value={agreementForm.ClientContributionPayer}
                                                        onChange={handleChange}
                                                        disabled={disableSection}
                                                        options={[
                                                            {
                                                                label: "Not Exporting Client Contribution",
                                                                value: "CHSP",
                                                            },
                                                            {
                                                                label: "Export Client Contribution to Payer",
                                                                value: "Export Client Contribution to Payer",
                                                            },
                                                            {
                                                                label:
                                                                    "Export Client Contribution to Client Payer",
                                                                value:
                                                                    "Export Client Contribution to Client Payer",
                                                            },
                                                            {
                                                                label:
                                                                    "Export Client Contribution to Client Accounting Code",
                                                                value:
                                                                    "Export Client Contribution to Client Accounting Code",
                                                            },
                                                        ]}
                                                    />
                                                ) : (
                                                    <div></div>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <Box
                                    sx={{display: "flex", justifyContent: "center", gap: "1rem"}}
                                >
                                    <button
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                            activeTab === "Agreement"
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                                : 'glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                        }`}
                                        onClick={handleAgreementDownload}
                                    >
                                        Download Agreement
                                    </button>
                                    <button
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                            activeTab === "Agreement"
                                                ? ' text-black shadow-lg'
                                                : 'glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                        }`}
                                        onClick={() => {
                                            setOpenServiceMapModal(true), fetchAgreementServiceMaps();
                                        }}
                                    >
                                        Show Services
                                    </button>
                                </Box>
                            </Box>
                        ) : (
                            <>
                                {servicesLoading ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <CircularProgress/>
                                    </Box>
                                ) : (
                                    <>
                                        {show ? (
                                            <>
                                                <div
                                                    style={{
                                                        marginTop: "3rem",
                                                        display: "flex",
                                                        gap: "1.5rem",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            width: "700px",
                                                        }}
                                                    >
                                                        <Box sx={{display: "flex", alignItems: "center"}}>
                                                            <NavigateBeforeIcon
                                                                fontSize="large"
                                                                cursor="pointer"
                                                                onClick={() => setShow(false)}
                                                            />
                                                            <h4 style={{fontWeight: "600"}}>
                                                                Selected Services
                                                            </h4>
                                                        </Box>
                                                        <span
                                                            style={{
                                                                fontSize: "13px",
                                                                marginLeft: "2rem",
                                                                color: "#555555",
                                                            }}
                                                        >
                            Click on the edit button in the table below, then
                            fill the details and click on "Done." If you have
                            filled the details for all services, click on "Save
                            Agreement Button" to save the services.
                          </span>
                                                    </Box>

                                                    {/* <Box sx={{marginRight:"5rem",}}>
                  <button  onClick={handleServiceSave} className={styles.newUIButton} style = {{backgroundColor:"blue",color:"#fff",marginRight:"1rem",width:"130px"}}>Save</button>
                  <button  onClick={() => setShow(false)} className={styles.newUIButton} style = {{backgroundColor:"yellow",color:"#fff",width:"130px"}}>Cancel</button>

                  </Box> */}
                                                </div>

                                                <AgGridDataTable
                                                    rows={selectedServices}
                                                    columns={selectedServiceColumns}
                                                    rowSelected={(row) => handleRowSelected(row)}
                                                    //  showEditButton = {false}
                                                    //  showActionColumn = {false}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        marginTop: "3rem",
                                                    }}
                                                >
                                                    <Box sx={{position: "relative"}}>
                                                        <SearchIcon
                                                            sx={{
                                                                position: "absolute",
                                                                top: "10px",
                                                                left: "5px",
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Search for services"
                                                            onChange={(e) => handleSearchService(e)}
                                                            style={{
                                                                padding: "10px 30px",
                                                                width: "400px",
                                                                borderRadius: "5px",
                                                                border: "1px solid black",
                                                                fontSize: "13px",
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "right",
                                                            gap: "1rem",
                                                            marginBottom: "1rem",
                                                        }}
                                                    >
                                                        <button
                                                            className={styles.newUIButton}
                                                            style={{
                                                                backgroundColor: "blue",
                                                                color: "#fff",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                            }}
                                                            onClick={handleAddSelectedServicesButtonClick}
                                                            disabled={
                                                                selectedServices.length > 0 ? false : true
                                                            }
                                                        >
                                                            Add Selected Service
                                                        </button>

                                                        <button
                                                            onClick={handleDownloadButtonClick}
                                                            className={styles.newUIButton}
                                                            style={{
                                                                backgroundColor: "red",
                                                                color: "#fff",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            Download Template
                                                        </button>

                                                        <button
                                                            onClick={handleUploadButtonClick}
                                                            className={styles.newUIButton}
                                                            style={{
                                                                backgroundColor: "orange",
                                                                color: "#fff",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            Upload Csv
                                                        </button>
                                                        <input
                                                            id="csvInput"
                                                            type="file"
                                                            accept=".csv"
                                                            style={{display: "none"}}
                                                            onChange={handleFileChange}
                                                        />
                                                    </Box>
                                                </Box>

                                                <CHKMListingDataTable
                                                    rows={filterServiceData.filter(
                                                        (row) =>
                                                            !agreementServiceMapData?.some(
                                                                (mapItem) =>
                                                                    mapItem.Service_Code === row.Service_Code
                                                            )
                                                    )}
                                                    handleRowSelectionModelChange={(selectedRowIndexes) => {
                                                        // Filter the rows to match the data passed to the table
                                                        const filteredRows = filterServiceData.filter(
                                                            (row) =>
                                                                !agreementServiceMapData?.some(
                                                                    (mapItem) =>
                                                                        mapItem.Service_Code === row.Service_Code
                                                                )
                                                        );

                                                        const selectedServiceIds = selectedRowIndexes.map(
                                                            (index) => filteredRows[index]?.Service_ID // Access filtered rows
                                                        );
                                                        // Pass the extracted service IDs to your function if needed
                                                        handleRowSelectionModelChange(selectedServiceIds);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Container>

                    <Card>
                        <EditModal
                            show={selectedServiceModal}
                            onClose={() => setSelectedServiceModal(false)}
                            onSave={() => onUpdateService(selectedRows)}
                            modalTitle={selectedRows.Description}
                            fields={fields}
                            data={selectedRows || {}} // Pass selectedRowData with fallback to an empty object
                            onChange={handleInputChange}
                            showDoneButton={true}
                        />

                        <>
                            {/* <MButton
                style={{ margin: "20px 15px 30px 15px" }}
                label="Add Services"
                variant="outlined"
                color={"primary"}
                onClick={handleAddServicesButtonClick}
                disabled={disableSection}
              />
              <MButton
                style={{ margin: "20px 15px 30px 15px" }}
                label="Download Template"
                variant="outlined"
                color={"primary"}
                onClick={handleDownloadButtonClick}
                disabled={disableSection}
              />
              <MButton
                style={{ margin: "20px 15px 30px 15px" }}
                label="Upload Csv"
                variant="outlined"
                color={"primary"}
                onClick={handleUploadButtonClick}
                disabled={disableSection}
              />
              <input
                id="csvInput"
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              /> */}
                        </>

                        {/* <MButton
            style={{ margin: "20px 15px 30px 15px" }}
            label="Remove Services"
            variant="outlined"
            color={"error"}
            disabled={deleteServicesButtonDisabled || disableSection}
            onClick={handleDeleteSelectedServicesButtonClick}
          /> */}
                        {/* {openDialog && (
            <DialogBox
              open={openDialog}
              onClose={closeDialog}
              title="Missing Input Field"
            >
              Please Enter Agreement Start and End Date
            </DialogBox>
          )} */}
                        <Modal
                            open={openServiceMapModal}
                            onClose={() => {
                                setOpenServiceMapModal(false);
                            }}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div
                                className="ag-theme-material"
                                style={{
                                    height: "600px", // Overall modal height
                                    width: "70%", // Modal width
                                    background: "#fff", // Background for better visibility
                                    borderRadius: "8px", // Optional rounded corners
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)", // Optional shadow
                                    padding: "1rem", // Spacing inside the modal
                                    display: "flex",
                                    flexDirection: "column", // Ensures proper stacking of elements
                                }}
                            >
                                <MButton
                                    style={{margin: "20px 15px 30px 15px", width: "200px"}}
                                    label="Remove Services"
                                    variant="outlined"
                                    color={"error"}
                                    disabled={deleteServicesButtonDisabled || disableSection}
                                    onClick={handleDeleteSelectedServicesButtonClick}
                                />
                                <Typography
                                    sx={{
                                        fontSize: "1.2rem",
                                        marginLeft: "1rem",
                                        fontWeight: "600",
                                        marginBottom: "1rem", // Add some space below the title
                                    }}
                                >
                                    Existing Services
                                </Typography>
                                <div
                                    style={{
                                        flex: 1, // Fills available vertical space
                                        overflowY: "auto", // Prevents overflowing content
                                    }}
                                >
                                    <AgGridReact
                                        rowData={agreementServiceMapData}
                                        columnDefs={Aggridcolumns}
                                        rowSelection="multiple"
                                        onSelectionChanged={onSelectionChanged}
                                        pagination={true}
                                        paginationPageSize={20}
                                        headerHeight={55}
                                        rowHeight={50}
                                        suppressRowHoverHighlight={true}
                                        domLayout="autoHeight" // Ensures proper height adjustment
                                    />
                                </div>
                            </div>
                        </Modal>
                    </Card>
                </div>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        sx={{width: "100%"}}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default AgreementForm;
