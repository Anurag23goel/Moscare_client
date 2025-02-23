import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Card, Col, Form, Row} from "react-bootstrap";
import {fetchData, fetchUserRoles, postData, putData} from "@/utility/api_utility";
import CloseIcon from "@mui/icons-material/Close";
import styles from "@/styles/scheduler.module.css";
import style from "@/styles/style.module.css";
import styleFont from "@/styles/style.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import {useRouter} from "next/router";
import InputField from "@/components/widgets/InputField";
import LocRosterCalendarComp from "@/components/widgets/LocRosterCalendarComp";
import {FaEye} from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Cookies from "js-cookie";
import MButton from "@/components/widgets/MaterialButton";
import ColorContext from "@/contexts/ColorContext";
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';

const LocationRosterCalendar = ({rosterData, availableRosters, onAddValidationMessage}) => {
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [service, setService] = useState("");
    const [breakStartTime, setBreakStartTime] = useState(null);
    const [breakDuration, setBreakDuration] = useState("");
    const [workerHasBreak, setWorkerHasBreak] = useState(false);
    const [dexCategory, setDexCategory] = useState("");
    const [dexActivity, setDexActivity] = useState("");
    const [transportQuantity, setTransportQuantity] = useState("");
    const [transportCost, setTransportCost] = useState("");
    const [mealQuantity, setMealQuantity] = useState("");
    const [mealCost, setMealCost] = useState("");
    const [alignment, setAlignment] = React.useState("Worker");
    const [activeTab, setActiveTab] = useState("general");
    const [workers, setWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [isTwoDayShift, setIsTwoDayShift] = useState(false); // Checkbox state
    const [showPreview, setShowPreview] = useState(false);
    const [shiftStartDate, setShiftStartDate] = useState(null);
    const [shiftStartTime, setShiftStartTime] = useState(null);
    const [shiftEndDate, setShiftEndDate] = useState(null);
    const [shiftEndTime, setShiftEndTime] = useState(null);
    const [clientIDs, setClientIDs] = useState([]);
    const [notesFlowsThrough, setNotesFlowsThrough] = useState(""); // State for Notes flows through
    const [notesPrivate, setNotesPrivate] = useState(""); // State for Notes (private)
    const [workersRatio, setWorkersRatio] = useState("");
    const [clientsRatio, setClientsRatio] = useState("");
    const [clients, setClients] = useState([]); // Initialize as an array
    const [error, setError] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [selectedRoster, setSelectedRoster] = useState("");
    const router = useRouter();
    const [services, setServices] = useState([]); // State to store services
    const [loading, setLoading] = useState(false); // Loading state
    const [payRate, setPayRate] = useState(""); // Pay Rate
    const [chargeRate, setChargeRate] = useState(""); // Charge Rate
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {LocationID} = router.query;
    const {RosterID} = router.query;
    const [rosterCategory, setRosterCategory] = useState([]);
    const buttonRef = useRef(null);
    const cardRef = useRef(null);
    const [previewDates, setPreviewDates] = useState([]);
    const [message, setMessage] = useState("");
    const [userRole, setUserRole] = useState("");
    const [calculatedPayRate, setCalculatedPayRate] = useState(0);
    const [calculatedChargeRate, setCalculatedChargeRate] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [locations, setLocations] = useState([]);
    const [incompleteFields, setIncompleteFields] = useState({});
    const [disableSubmit, setDisableSubmit] = useState(false);
    const [validationMessages, setValidationMessages] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);
    const isSubmitDisabled = Object.keys(incompleteFields).length > 0 || disableSubmit;
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentShiftID, setCurrentShiftID] = useState(null);
    const [refreshToggle, setRefreshToggle] = useState(false); // For refreshing the calendar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chargeRateOutput, setChargeRateOutput] = useState("");
    const [cccOutput, setCccOutput] = useState("");
    const [alertInfo, setAlertInfo] = useState({});
    const [ccc, setCcc] = useState(0);

    const handleShiftClick = (shiftData) => {
        const now = new Date();
        const shiftEnd = new Date(shiftData.ShiftEnd);

        // Allow editing only if the shift is current or in the future
        if (shiftEnd < now) {
            addValidationMessage("Past shifts cannot be edited.", "info");
            return;
        }

        // Populate form data with shiftData
        setFormData({
            LocationName: shiftData.LocationName || "",
            LocationAddress: shiftData.LocationAddress || "",
            Phone: shiftData.Phone || "",
            Email: shiftData.Email || "",
            CaseManager: shiftData.CaseManager || "",
            LocationId: shiftData.LocationId || "",
            ShiftId: shiftData.ShiftID || "",
            ShiftStart: shiftData.ShiftStart || "",
            ShiftEnd: shiftData.ShiftEnd || "",
            Workers: shiftData.Workers || [],
            Clients: shiftData.Clients || [],
            ServiceCode: shiftData.ServiceCode || "",
            PayRate: shiftData.PayRate || "",
            ChargeRate: shiftData.ChargeRate || "",
            RosterCategory: shiftData.RosterCategory || "",
            FixedFeeService: shiftData.FixedFeeService || false,
            CenterCapitalCosts: shiftData.CenterCapitalCosts || false,
        });

        setFormState({
            ...formState,
            ServiceCode: shiftData.ServiceCode || "",
            PayRate: shiftData.PayRate || "",
            ChargeRate: shiftData.ChargeRate || "",
            RosterCategory: shiftData.RosterCategory || "",
            FixedFeeService: shiftData.FixedFeeService || false,
            CenterCapitalCosts: shiftData.CenterCapitalCosts || false,
            Workers: shiftData.Workers || [],
            Clients: shiftData.Clients || [],
            isEditMode: true,
            showForm: true,
            isSubmitting: false,
            isDialogOpen: false,
            currentShiftID: shiftData.ShiftId,
        });

        setSelectedWorkers(shiftData.Workers || []); // Now an array of objects
        setSelectedClients(shiftData.Clients || []); // Now an array of objects
        setShiftStartDate(shiftData.ShiftStart ? new Date(shiftData.ShiftStart) : null);
        setShiftStartTime(shiftData.ShiftStart ? new Date(shiftData.ShiftStart) : null);
        setShiftEndDate(shiftData.ShiftEnd ? new Date(shiftData.ShiftEnd) : null);
        setShiftEndTime(shiftData.ShiftEnd ? new Date(shiftData.ShiftEnd) : null);
        setService(shiftData.ServiceCode || "");
        setBreakStartTime(shiftData.BreakStart ? new Date(shiftData.BreakStart) : null);
        setBreakDuration(shiftData.BreakDuration || "");
        setWorkerHasBreak(shiftData.OnBreak || false);
        setDexCategory(shiftData.DexCategory || "");
        setDexActivity(shiftData.DexActivity || "");
        setTransportQuantity(shiftData.TransportQty || "");
        setTransportCost(shiftData.TransportCost || "");
        setMealQuantity(shiftData.MealQty || "");
        setMealCost(shiftData.MealCost || "");
        setNotesFlowsThrough(shiftData.AppNote || "");
        setNotesPrivate(shiftData.PrivateNote || "");
        setSelectedDate(shiftData.ShiftDate || "");
        setCurrentShiftID(shiftData.ShiftID); /// Track the shift being edited
        setIsEditMode(true);
        setShowForm(true);
    };

    const handleServiceSelect = (selectedServiceCode) => {
        // Find the selected service in the service list
        const selectedService = services.find(serv => serv.Service_Code === selectedServiceCode);

        setService(selectedServiceCode);

        if (selectedService) {
            const isSleepover = selectedService.Is_Sleepover === "1";
            setFormState((prevState) => ({
                ...prevState,
                ServiceCode: selectedServiceCode, // Update selected service code
                FixedFeeService: isSleepover, // Update Fixed Fee checkbox state
            }));
        }
    };

    useEffect(() => {
        if (clientIDs.length > 0 && shiftStartDate && shiftStartTime) {
            fetchServices();
        }
        getRosters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientIDs, shiftStartDate, shiftStartTime]);


    const triggerRefresh = () => {
        setRefreshToggle((prev) => !prev);
    };

    const [formData, setFormData] = useState({
        LocationName: "",
        LocationAddress: "",
        Phone: "",
        Email: "",
        CaseManager: "",
        LocationId: "", // Initialize as empty, will set later
    });

    const [formState, setFormState] = useState({
        IsLocationRoster: false,
        ServiceCode: "",
        PayRate: "",
        ChargeRate: "",
        RosterCategory: "",
        FixedFeeService: false,
        CenterCapitalCosts: false,
        ShiftStart: "",
        ShiftEnd: "",
        ShiftOccurOverTwo: false,
        CheckList: "",
        OrderNumber: "",
        SupportWorker1: "UNALLOCATED",
        SupportWorker2: "",
        SupportWorker3: "",
        SupportWorker4: "",
        BreakStart: "",
        BreakDuration: "",
        AppNote: "",
        PrivateNote: "",
        ExcludePublicHoliday: false,
        AfterEndDate: "",
        AfterEndNumber: null,
        TYPE: "",
        D_Day: null,
        repeatOptions: {
            daily: {
                endDate: "",
                occurrences: null,
            },
            weekly: {
                endDate: "",
                occurrences: null,
            },
            monthly: {
                endDate: "",
                occurrences: null,
            },
        },
        W_Week: null,
        W_MO: false,
        W_TU: false,
        W_WE: false,
        W_TH: false,
        W_FR: false,
        W_SA: false,
        W_SU: false,
        M_Occurance: null,
        M_Occ_Day: null,
        M_Occ_Month: null,
        M_Day: null,
        M_Month: null,
        monthlyOption: "firstOption",
        endConditionMonthly: "occurrences",
        RosterTimeZone: "",
        RestrictedAccess: false,
        Completed: 0,
        Publish: 1,
        number: "1",
        month: "1",
        selectedOption: "firstOption",
        days: "",
        Status: "P",
        ActivityFee: 0,
        OnBreak: false,
        SeriesParentID: null,
        Version: 1,
    });

    const weekDaysStyle = {
        padding: "4px",
        marginRight: "2px",
        borderRadius: "6px",
    };

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const addValidationMessage = useCallback((content, type = 'info') => {
        const id = uuidv4();
        setValidationMessages(prev => [...prev, {id, type, content}]);
        setTimeout(() => {
            setValidationMessages(prev => prev.filter(msg => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    // const calculatePayAndChargeRates = async () => {
    //   console.log("Services:", service);
    //   console.log("Selected Workers:", selectedWorkers);
    //   console.log("Selected Clients:", selectedClients);
    //   console.log("Shift Start Date:", shiftStartDate);
    //   console.log("Shift Start Time:", shiftStartTime);
    //   console.log("Shift End Date:", shiftEndDate);
    //   console.log("Shift End Time:", shiftEndTime);
    //   console.log("Workers Ratio:", workersRatio);
    //   console.log("Clients Ratio:", clientsRatio);

    //   try {
    //     // Detailed validation
    //     if (selectedWorkers.length === 0) {
    //       console.warn("No workers selected.");
    //       return;
    //     }
    //     if (selectedClients.length === 0) {
    //       console.warn("No clients selected.");
    //       return;
    //     }
    //     if (!service) {
    //       console.warn("Service not selected.");
    //       return;
    //     }
    //     if (!shiftStartDate || !shiftStartTime) {
    //       console.warn("Shift start date or time missing.");
    //       return;
    //     }
    //     if (!shiftEndDate || !shiftEndTime) {
    //       console.warn("Shift end date or time missing.");
    //       return;
    //     }
    //     if (typeof workersRatio !== 'number' || workersRatio <= 0) {
    //       console.warn("Invalid workersRatio:", workersRatio);
    //       return;
    //     }
    //     if (typeof clientsRatio !== 'number' || clientsRatio <= 0) {
    //       console.warn("Invalid clientsRatio:", clientsRatio);
    //       return;
    //     }

    //     // Merge date and time for shift start and end
    //     const ShiftStart = mergeDateAndTimeLocal(shiftStartDate, shiftStartTime);
    //     const ShiftEnd = mergeDateAndTimeLocal(shiftEndDate, shiftEndTime);

    //     // Calculate WtoCRatio
    //     const WtoCRatio = calcGCD(workersRatio, clientsRatio);
    //     if (!WtoCRatio || WtoCRatio.includes('NaN')) {
    //       console.error("Calculated WtoCRatio is invalid:", WtoCRatio);
    //       setSnackbar({
    //         open: true,
    //         severity: "error",
    //         message: "Invalid Worker-to-Client Ratio. Please check the ratios.",
    //       });
    //       return;
    //     }

    //     // Prepare data for API call
    //     const requestData = {
    //       WorkerIds: selectedWorkers.map((worker) => worker.WorkerID),
    //       ClientIds: selectedClients.map((client) => client.ClientID),
    //       ServiceCode: service,
    //       ShiftStart: ShiftStart,
    //       ShiftEnd: ShiftEnd,
    //       WtoCRatio: WtoCRatio,
    //     };

    //     // Log request data for debugging
    //     console.log("Request Data:", requestData);

    //     // Call the API
    //     const response = await postData('/api/calculatePayChargeRates', requestData);

    //     console.log("API Response:", response);

    //     if (response.success) {
    //       setCalculatedPayRate(response.totalPayRate);
    //       setCalculatedChargeRate(response.totalChargeRate);
    //     } else {
    //       setSnackbar({
    //         open: true,
    //         severity: "error",
    //         message: `Failed to calculate rates: ${response.message || 'Unknown error'}`,
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Error calculating pay and charge rates:', error);
    //     setSnackbar({
    //       open: true,
    //       severity: "error",
    //       message: "An unexpected error occurred while calculating rates.",
    //     });
    //   }
    // };

    useEffect(() => {
        if (RosterID && LocationID) {
            console.log("RosterID:", RosterID);
            console.log("LocationID:", LocationID);
            // You can set these IDs into state or use them directly
            setFormData((prev) => ({
                ...prev,
                LocationId: LocationID, // Ensure consistency with data types
                RosterID: RosterID,     // Assuming RosterID is needed in formData
            }));

            // If needed, fetch additional data based on these IDs
            // fetchRosterData(RosterID, LocationID);
        }
    }, [RosterID, LocationID]);


    // const isFirstRun = useRef(true);

    // useEffect(() => {
    //   if (isFirstRun.current) {
    //     isFirstRun.current = false;
    //     return;
    //   }

    //   calculatePayAndChargeRates();
    // }, [
    //   selectedWorkers,
    //   selectedClients,
    //   service,
    //   shiftStartDate,
    //   shiftStartTime,
    //   shiftEndDate,
    //   shiftEndTime,
    //   workersRatio,
    //   clientsRatio,
    // ]);

    useEffect(() => {
        if (clientIDs.length > 0 && shiftStartDate && shiftStartTime) {
            fetchServices();
        }
        getRosters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientIDs, shiftStartDate, shiftStartTime]);


    const fetchCCC = async () => {
        setChargeRateOutput("");
        setCcc(0)
        if (formState.CenterCapitalCosts && formState.ServiceCode) {

            if (selectedWorkers.length === 0 || selectedClients.length === 0) {
                setCccOutput("Please select workers and clients first");
                return;
            }

            if (!shiftStartDate || !shiftStartTime || !shiftEndDate || !shiftEndTime) {
                setCccOutput("Please select shift start and end date/time first");
                return;
            }

            const selectedService = services.find((service) => service.Service_Code === formState.ServiceCode);
            if (selectedService) {
                setCccOutput("Loading...");

                const res = await fetchData(`/api/getCCCOfServiceSelected/${selectedService.Service_Code}`);

                if (res.success) {
                    const cccValue = parseFloat(res.data.Charge_Rate_1);
                    setCcc(cccValue);
                    console.log("Fetched CCC: ", cccValue);
                    setCccOutput(`Centre Capital Costs: $${cccValue} will be applied per hour additionally to the service charge rate`);
                } else {
                    setFormState((prevState) => ({
                        ...prevState,
                        CenterCapitalCosts: false,
                    }));
                    if (res.error === 'NO_CCC_FOR_SELECTED_SERVICE') {
                        setCccOutput("Centre Capital Costs are not assigned to this service\n kindly assign in maintenance");
                    }
                    setCcc(0);
                }
            } else {
                setCccOutput("Please select a service first");
                setFormState((prevState) => ({
                    ...prevState,
                    CenterCapitalCosts: false,
                }));
                setChargeRateOutput("");
            }
        } else {
            setCccOutput("");
            setChargeRateOutput("");
        }
    };

    const calculatePayAndChargeRates = async () => {
        console.log("Services : ", service)
        try {
            if (
                selectedWorkers.length === 0 ||
                selectedClients.length === 0 ||
                !service ||
                !shiftStartDate ||
                !shiftStartTime ||
                !shiftEndDate ||
                !shiftEndTime
            ) {
                return;
            }

            // Merge date and time for shift start and end
            const ShiftStart = mergeDateAndTimeLocal(shiftStartDate, shiftStartTime);
            const ShiftEnd = mergeDateAndTimeLocal(shiftEndDate, shiftEndTime);

            // Prepare data for API call
            const requestData = {
                WorkerIds: selectedWorkers.map((worker) => worker.WorkerID),
                ClientIds: selectedClients.map((client) => client.ClientID),
                ServiceCode: service,
                ShiftStart: ShiftStart,
                ShiftEnd: ShiftEnd,
                WtoCRatio: calcGCD(workersRatio, clientsRatio), // Use your existing function to get ratio
            };

            // Call the API
            const response = await postData('/api/calculatePayChargeRates', requestData);

            if (response.success) {
                let totalChargeRate = response.totalChargeRate;
                console.log("Total Charge Rate: ", totalChargeRate);
                setChargeRateOutput("")
                console.log("CCC checked ? : ", formState.CenterCapitalCosts);
                if (formState.CenterCapitalCosts) {
                    console.log("CCC value: ", ccc);
                    // Convert ShiftStart and ShiftEnd to Date objects
                    const shiftStartDate = new Date(ShiftStart);
                    const shiftEndDate = new Date(ShiftEnd);
                    // Calculate the difference in hours
                    const cccCharge = ccc * (shiftEndDate - shiftStartDate) / (1000 * 60 * 60);
                    console.log("CCC calc", cccCharge)
                    ccc > 0 ? setChargeRateOutput(`Charge Rate: $${totalChargeRate.toFixed(2)} + CCC: $${cccCharge.toFixed(2)}`) : setChargeRateOutput(`Charge Rate: $${totalChargeRate.toFixed(2)}`)
                    totalChargeRate += cccCharge;
                    console.log("CCC Total Charge Rate: ", totalChargeRate);
                }
                setCalculatedPayRate(response.totalPayRate);
                setCalculatedChargeRate(totalChargeRate);
            } else {

            }
        } catch (error) {
            console.error('Error calculating pay and charge rates:', error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An unexpected error occurred while calculating rates.",
            });
        }
    };

    useEffect(() => {
        fetchCCC();
    }, [service, formState.CenterCapitalCosts]);

    useEffect(() => {
        if (formState.CenterCapitalCosts !== null) {
            calculatePayAndChargeRates();
        }
    }, [formState.CenterCapitalCosts, ccc]);

    useEffect(() => {
        calculatePayAndChargeRates();
    }, [
        selectedWorkers,
        selectedClients,
        service,
        shiftStartDate,
        shiftStartTime,
        shiftEndDate,
        shiftEndTime,
        workersRatio,
        clientsRatio,

    ]);


    useEffect(() => {
        fetchUserRoles(
            "m_location_rostering",
            "Maintenance_location_Roster",
            setDisableSection
        );
    }, []);

    useEffect(() => {
        if (router.isReady && LocationID) {
            console.log("LocationID from router.query:", LocationID);
            setFormData((prev) => ({
                ...prev,
                LocationId: LocationID,
            }));
        }
    }, [router.isReady, LocationID]);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        const ids = selectedClients.map((client) => client.ClientID);
        setClientIDs(ids);
    }, [selectedClients]);

    useEffect(() => {
        if (rosterData) {
            setFormData((prev) => ({
                ...prev,
                LocationName: rosterData.Description || "",
                LocationAddress: rosterData.Area || "",
                CaseManager: rosterData.CaseManager || "",
                RosterID: rosterData.RosterID || "",
                LocationId: rosterData.LocationID || prev.LocationId,
            }));
        }
    }, [rosterData]);

    useEffect(() => {
        const validateWorkers = async () => {
            const workers = selectedWorkers.map(worker => worker.WorkerID);
            if (workers.length === 0) {
                setIncompleteFields({});
                return;
            }
            const newIncompleteFields = {};

            for (const workerId of workers) {
                const incomplete = await fetchIncompleteFields(workerId);
                if (incomplete.length > 0) {
                    newIncompleteFields[workerId] = incomplete;
                }
            }

            setIncompleteFields(newIncompleteFields);
        };

        validateWorkers();
    }, [selectedWorkers]);

    useEffect(() => {
        if (clientIDs.length > 0 && shiftStartDate && shiftStartTime) {
            fetchServices();
        }
        getRosters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientIDs, shiftStartDate, shiftStartTime]);

    useEffect(() => {
        setWorkersRatio(selectedWorkers.length.toString());
    }, [selectedWorkers]);

    useEffect(() => {
        setClientsRatio(selectedClients.length.toString()); // Set the client count here
    }, [selectedClients]);

    useEffect(() => {
        fetchServices();
        getRosters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientIDs]);

    useEffect(() => {
        // Set a timeout to delay the execution
        const timer = setTimeout(() => {
            if (
                shiftStartDate &&
                shiftStartTime &&
                services.length === 0 &&
                clientIDs.length > 0
            ) {
                setSnackbar({
                    open: true,
                    severity: "warning",
                    message: "No common services available for the selected clients.",
                });
            }
        }, 1000); // Delay of 1000 milliseconds (1 second)

        // Cleanup the timeout if dependencies change or component unmounts
        return () => clearTimeout(timer);
    }, [services, shiftStartDate, shiftStartTime, clientIDs]);


    useEffect(() => {
        setShiftEndDate(shiftStartDate);
    }, [shiftStartDate]);

    useEffect(() => {
        if (Object.keys(incompleteFields).length > 0) {
            const messages = Object.entries(incompleteFields).map(
                ([workerId, fields]) => `Worker ID ${workerId} needs to complete the following fields: ${fields.join(", ")}`
            ).join("\n");

            setSnackbar({
                open: true,
                message: messages,
                severity: "warning",
            });
        } else {
            setSnackbar(prev => ({
                ...prev,
                open: false,
                message: "",
            }));
        }
    }, [incompleteFields]);

    useEffect(() => {
        if (showPreview) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPreview]);

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        if (showForm && !isEditMode) {
            fetchMappedClients();
        }
    }, [showForm, isEditMode]);


    // Function to fetch user info and assign role
    const fetchUserInfo = async () => {
        try {
            const User_ID = Cookies.get("User_ID"); // Retrieve User_ID from the cookie
            if (!User_ID) {
                throw new Error("User_ID is not defined or missing in cookies.");
            }

            const response = await postData("/api/getUserInfo", {User_ID});
            if (
                response &&
                (response.UserGroup === "Rostering Clerk" ||
                    response.UserGroup === "Super Admin" ||
                    response.UserGroup === "All")
            ) {
                setUserRole(response.UserGroup);
            } else {
                addValidationMessage("Roster Management data is only visible to Rostering Clerks!", "info");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            addValidationMessage("An error occurred while fetching user info.", "error");
        }
    };

    const handleWorkersChange = (event) => {
        const value = event.target.value;
        if (/^\d*$/.test(value)) {
            setWorkersRatio(value);
            setError(false);
        } else {
            setError(true);
        }
    };

    const handleClientsChange = (event) => {
        const value = event.target.value;
        if (/^\d*$/.test(value)) {
            setClientsRatio(value); // Directly set the number in the input
            setError(false);
        } else {
            setError(true);
        }
    };

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
        fetchWorkers();
        fetchClients();
        setIsEditMode(false); // Ensure creation mode
    };


    const handleDateClick = (info) => {
        console.log("Date clicked:", info.dateStr);
        setSelectedDate(info.dateStr);
        setIsEditMode(false); // Ensure creation mode
        setShowForm(true);
        clearForm();
    };

    const handleClose = () => {
        setShowForm(false); // Hide the modal
        clearForm();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleFormChange = (event) => {
        const {id, type, checked, value} = event.target;
        console.log("Type : ", type, "checked : ", checked);
        if (id === "ShiftOccurOverTwo") {
            if (!checked) {
                // If "Shift Occur Over Two Days" is unchecked, set ShiftEndDate and ShiftEndTime to ShiftStartDate and ShiftStartTime
                setShiftEndDate(shiftStartDate);
                // setShiftEndTime(shiftStartTime);
            }
        }

        if (type === "checkbox") {
            if (["Daily", "Weekly", "Monthly"].includes(id)) {
                setFormState((prevState) => ({
                    ...prevState,
                    TYPE: prevState.TYPE === id ? "" : id, // Toggle off if already selected
                }));
            } else if (id.startsWith("W_")) {
                // Handle checkboxes starting with 'W'
                setFormState((prevState) => ({
                    ...prevState,
                    [id]: checked,
                }));
            } else if (id.startsWith("occurrences")) {
                const frequency = id.replace("occurrences", "").toLowerCase();
                setFormState((prevState) => ({
                    ...prevState,
                    repeatOptions: {
                        ...prevState.repeatOptions,
                        [frequency]: {
                            ...prevState.repeatOptions[frequency],
                            occurrences: value,
                        },
                    },
                }));
            } else if (id.startsWith("endDate")) {
                const frequency = id.replace("endDate", "").toLowerCase();
                setFormState((prevState) => ({
                    ...prevState,
                    repeatOptions: {
                        ...prevState.repeatOptions,
                        [frequency]: {
                            ...prevState.repeatOptions[frequency],
                            endDate: value,
                        },
                    },
                }));
            } else {
                setFormState((prevState) => ({
                    ...prevState,
                    [id]: checked,
                }));
                console.log("Center Capital Costs : ", formState.CenterCapitalCosts);
            }
        } else {
            setFormState((prevState) => ({
                ...prevState,
                [id]: value,
            }));
        }
    };

    const fetchIncompleteFields = async (workerId) => {
        if (!workerId) return [];

        try {
            const response = await fetchData(
                `/api/getImpWorkerIncompleteFields/${workerId}`,
                window.location.href
            );

            if (response.success && response.data) {
                // Transform the data object into an array of { name, isFilled } objects
                const transformedData = Object.entries(response.data).map(([name, isFilled]) => ({
                    name,
                    isFilled,
                }));
                // Return only the fields that are not filled
                return transformedData.filter(field => !field.isFilled).map(field => field.name);
            }
        } catch (err) {
            console.error(`Error fetching incomplete fields for WorkerID ${workerId}:`, err);
            return ["Unknown Error"];
        }

        return [];
    };

    const fetchWorkers = async () => {
        try {
            const workerData = await fetchData(
                "/api/getWorkerMasterSpecificDataAll"
            );
            if (workerData && workerData.data) {
                setWorkers(workerData.data);
            } else {
                console.error("Unexpected data format:", workerData);
                setSnackbar({
                    open: true,
                    severity: "error",
                    message: "Failed to fetch worker data.",
                });
            }
        } catch (error) {
            console.error("Error fetching worker data:", error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An error occurred while fetching worker data.",
            });
        }
    };

    const fetchClients = async () => {
        try {
            const clientData = await fetchData(
                "/api/getClientMasterSpecificDataAll"
            );
            if (clientData && clientData.data) {
                setClients(clientData.data); // Store client data in an array
            } else {
                console.error("Unexpected data format:", clientData);
                setSnackbar({
                    open: true,
                    severity: "error",
                    message: "Failed to fetch client data.",
                });
            }
        } catch (error) {
            console.error("Error fetching client data:", error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An error occurred while fetching client data.",
            });
        }
    };

    // Modify fetchServices function to remove the check for shiftStartDate and shiftStartTime
    const fetchServices = async () => {
        try {
            if (clientIDs.length === 0) {
                setServices([]);
                return;
            }

            const shiftStartDateTime = mergeDateAndTimeLocal(
                shiftStartDate,
                shiftStartTime
            );
            const shiftType = await getShiftType(shiftStartDateTime);

            // Fetch services for each client with shiftType
            const servicesArray = await Promise.all(
                clientIDs.map(async (clientId) => {
                    const serviceData = await fetchData(
                        `/api/getServiceAsPerAgreement/${clientId}/${shiftType}`
                    );
                    return serviceData.data || [];
                })
            );

            // Find common services among all clients
            const commonServices = servicesArray.reduce((common, services) => {
                return common.filter((service) =>
                    services.some((s) => s.Service_Code === service.Service_Code)
                );
            }, servicesArray[0] || []);

            setServices(commonServices);
        } catch (error) {
            console.error("Error fetching services:", error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An error occurred while fetching services.",
            });
        }
    };

    const getRosters = async () => {
        try {
            const allRosterData = await fetchData(`api/getRosterCategory`);
            if (allRosterData && allRosterData.data) {
                setRosterCategory(allRosterData.data);
            } else {
                console.error("Unexpected data format:", allRosterData);
                setSnackbar({
                    open: true,
                    severity: "error",
                    message: "Failed to fetch roster categories.",
                });
            }
        } catch (error) {
            console.error("Error fetching roster data:", error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An error occurred while fetching roster categories.",
            });
        }
    };

    const fetchLocations = async () => {
        try {
            const locationData = await fetchData(`/api/getLocationProfileGeneralDataByID/${LocationID}`);
            if (locationData && locationData.data) {
                setLocations(locationData.data); // Assuming the data is in the expected format
            } else {
                console.error("Unexpected data format:", locationData);
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    const fetchMappedClients = async () => {
        try {
            const response = await fetchData(`/api/getLocProfClientDataById/${LocationID}`); // Use the provided id
            console.log("Response:", response);
            if (response.success) {
                console.log("ClientId : ", response)
                setSelectedClients(response.data);
            } else {
                console.error('Error fetching mapped clients');
            }
        } catch (error) {
            console.error('Error fetching mapped clients:', error);
        }
    };

    const getCardStyle = (type) => ({
        borderRadius: "12px",
        boxShadow:
            formState.TYPE === type
                ? "0 0 8px rgba(11, 94, 215, 0.5)"
                : "0 0 5px rgba(0, 0, 0, 0.2)",
        backgroundColor: "#fff",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        height: "100%",
    });

    // Function to check if a date is a public holiday in Australia
    const checkPublicHoliday = async (date) => {
        try {
            const year = date.getFullYear();
            const response = await fetch(
                `https://date.nager.at/api/v3/PublicHolidays/${year}/AU`
            );

            // Check if the response is OK (status code 200-299)
            if (!response.ok) {
                console.error('Error fetching public holidays:', response.statusText);
                return false;
            }

            const holidays = await response.json();

            // Check if holidays is an array
            if (!Array.isArray(holidays)) {
                console.error('Invalid holidays data:', holidays);
                return false;
            }

            console.log("Response:", response);
            if (response.success) {

                addValidationMessage("Shift created successfully!", "success")
                clearForm();
                setShowForm(false);
                // Optionally, refresh the calendar or update state
            }
        } catch (error) {
            console.error("Error creating shift:", error);

        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to determine the shift type based on date and time
    const getShiftType = async (dateTime) => {
        const date = new Date(dateTime);
        const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
        const hour = date.getHours();
        let shiftType;

        // Check for public holiday
        const isPublicHoliday = await checkPublicHoliday(date);
        if (isPublicHoliday) {
            shiftType = "public_holiday";
        } else if (day === 6) {
            shiftType = "saturday";
        } else if (day === 0) {
            shiftType = "sunday";
        } else if (hour >= 18 || hour < 6) {
            shiftType = "night";
        } else {
            shiftType = "standard";
        }

        return shiftType;
    };

    const mergeDateAndTimeLocal = (date, time) => {
        if (!date || !time) return null;

        // Get the date components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(date.getDate()).padStart(2, "0");

        // Get the time components
        const hours = String(time.getHours()).padStart(2, "0");
        const minutes = String(time.getMinutes()).padStart(2, "0");

        // Construct the date-time string
        const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}`;

        return dateTimeString;
    };

    const handleSelectWorker = (worker) => {
        setSelectedWorkers((prevSelected) => {
            // Check if the worker is already selected
            const isSelected = prevSelected.some(
                (selected) => selected.WorkerID === worker.WorkerID
            );

            if (isSelected) {
                // If selected, remove the worker from the array
                return prevSelected.filter(
                    (selected) => selected.WorkerID !== worker.WorkerID
                );
            } else {
                // If not selected, add the worker to the array
                return [...prevSelected, worker];
            }
        });
    };

    // Function to handle client selection
    const handleSelectClient = (client) => {
        setSelectedClients((prevSelected) => {
            // Check if the client is already selected
            const isSelected = prevSelected.some(
                (selected) => selected.ClientID === client.ClientID
            );

            if (isSelected) {
                // If selected, remove the client from the array
                return prevSelected.filter(
                    (selected) => selected.ClientID !== client.ClientID
                );
            } else {
                // If not selected, add the client to the array
                return [...prevSelected, client];
            }
        });
    };

    // Function to handle navigation to a selected roster
    const handleRosterChange = (event) => {
        const rosterId = event.target.value;
        console.log("RosterID : ", rosterId);
        setSelectedRoster(rosterId);
        if (rosterId) {
            router.push({
                pathname: `/RosterManagement/LocationRostering/${rosterId}`, // Use absolute path
                query: {LocationID: LocationID}, // Pass query parameters
            });
        }
    };

    const handleServiceChange = (event) => {
        const selectedServiceCode = event.target.value;
        setService(selectedServiceCode);

        // Find the selected service to extract PayRate and ChargeRate
        const selectedService = services.find(
            (serv) => serv.Service_Code === selectedServiceCode
        );
        if (selectedService) {
            setPayRate(selectedService.Pay_Rate_1 || 0); // Assuming Pay_Rate_1 is the correct field for pay rate
            setChargeRate(selectedService.Charge_Rate_1 || 0); // Assuming Charge_Rate_1 is the correct field for charge rate
        } else {
            setPayRate(0);
            setChargeRate(0);
        }
    };

    const mergeDateAndTime = (date, time) => {
        if (!date || !time) return null;

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
        );
    };

    const formatDateTimeISO = (date) => {
        const pad = (n) => (n < 10 ? "0" + n : n);
        return (
            date?.getFullYear() +
            "-" +
            pad(date?.getMonth() + 1) +
            "-" +
            pad(date?.getDate()) +
            "T" +
            pad(date?.getHours()) +
            ":" +
            pad(date?.getMinutes()) +
            ":" +
            pad(date?.getSeconds())
        );
    };

    const clearForm = () => {
        setFormState({
            ClientID: clientIDs,
            IsLocationRoster: false,
            ServiceCode: "",
            PayRate: "",
            ChargeRate: "",
            RosterCategory: "",
            FixedFeeService: false,
            CenterCapitalCosts: false,
            ShiftEndDateMin: "",
            ShiftEndDateMax: "",
            ShiftOccurOverTwo: false,
            CheckList: "",
            OrderNumber: "",
            SupportWorker1: "",
            SupportWorker2: "",
            SupportWorker3: "",
            SupportWorker4: "",
            BreakStart: "",
            BreakDuration: "",
            AppNote: "",
            PrivateNote: "",
            ExcludePublicHoliday: false,
            AfterEndDate: "",
            AfterEndNumber: null,
            TYPE: "",
            D_Day: null,
            repeatOptions: {
                daily: {
                    endDate: "",
                    occurrences: null,
                },
                weekly: {
                    endDate: "",
                    occurrences: null,
                },
                monthly: {
                    endDate: "",
                    occurrences: null,
                },
            },
            W_Week: 1,
            W_MO: false,
            W_TU: false,
            W_WE: false,
            W_TH: false,
            W_FR: false,
            W_SA: false,
            W_SU: false,
            M_Occurance: null,
            M_Occ_Day: null,
            M_Occ_Month: null,
            M_Day: null,
            M_Month: null,
            RosterTimeZone: "",
            RestrictedAccess: false,
            Completed: 0,
            Publish: 1,
            number: "1",
            month: "1",
            selectedOption: "",
            days: "",
            Status: "P",
            splitShiftDetails: [
                {
                    splitNo: 1,
                    service: "",
                    hours: "",
                    startTime: "",
                    endTime: "",
                    chargeRate: "",
                    payRate: "",
                    checked: false,
                }, // Split 1
                {
                    splitNo: 2,
                    service: "",
                    hours: "",
                    startTime: "",
                    endTime: "",
                    chargeRate: "",
                    payRate: "",
                    checked: false,
                }, // Split 2
                {
                    splitNo: 3,
                    service: "",
                    hours: "",
                    startTime: "",
                    endTime: "",
                    chargeRate: "",
                    payRate: "",
                    checked: false,
                }, // Split 3
                {
                    splitNo: 4,
                    service: "",
                    hours: "",
                    startTime: "",
                    endTime: "",
                    chargeRate: "",
                    payRate: "",
                    checked: false,
                }, // Split 4
            ],
            splitShift: false,
            checkNotes: false,
            ActivityFee: 0, // Reset ActivityFee
            OnBreak: false, // Reset OnBreak
            SeriesParentID: null, // Reset SeriesParentID
            Version: 1, // Reset Version
        });
        setSelectedClients([]); // Clear selected clients
        setSelectedWorkers([]); // Clear selected workers
        setPayRate("");
        setChargeRate("");
        setShiftStartDate(null);
        setShiftStartTime(null);
        setShiftEndDate(null);
        setShiftEndTime(null);
        setService("");
        setBreakStartTime(null);
        setBreakDuration("");
        setWorkerHasBreak(false);
        setDexCategory("");
        setDexActivity("");
        setTransportQuantity("");
        setTransportCost("");
        setMealQuantity("");
        setMealCost("");
        setNotesFlowsThrough("");
        setNotesPrivate("");
        setSnackbar({
            open: false,
            severity: "",
            message: "",
        });
    };

    const calcGCD = (workerRatio, clientsRatio) => {
        const MworkersRatio = parseInt(workersRatio, 10);
        const MclientsRatio = parseInt(clientsRatio, 10);
        if (isNaN(MworkersRatio) || isNaN(MclientsRatio)) return "1:1";
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const ratioGcd = gcd(MworkersRatio, MclientsRatio);
        const workersRatioReduced = MworkersRatio / ratioGcd;
        const clientsRatioReduced = MclientsRatio / ratioGcd;
        return `${workersRatioReduced}:${clientsRatioReduced}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        // Check if the form should be disabled
        if (isSubmitDisabled || isSubmitting || disableSubmit) {
            let message = "Please complete all required fields before submitting.";

            if (Object.keys(incompleteFields).length > 0) {
                const workerMessages = Object.entries(incompleteFields).map(
                    ([workerId, fields]) => `Worker ID ${workerId} needs to complete the following fields: ${fields.join(", ")}`
                );
                message = workerMessages.join("\n");
            }

            setSnackbar({
                open: true,
                severity: "warning",
                message: message,
            });

            setIsSubmitting(false);
            return;
        }

        // Get User_ID from cookies
        const User_ID = Cookies.get("User_ID");
        if (!User_ID) {
            setSnackbar({
                open: true,
                severity: "error",
                message: "User_ID is missing. Please login again.",
            });
            setIsSubmitting(false);
            return;
        }

        // Validate shift start and end dates and times
        if (!shiftStartDate || !shiftStartTime || !shiftEndDate || !shiftEndTime) {
            setSnackbar({
                open: true,
                severity: "error",
                message: "Please select both a shift start and end date/time.",
            });
            setIsSubmitting(false);
            return;
        }

        // Merge date and time
        const ShiftStart = mergeDateAndTimeLocal(shiftStartDate, shiftStartTime);
        const ShiftEnd = mergeDateAndTimeLocal(shiftEndDate, shiftEndTime);

        if (!ShiftStart || !ShiftEnd) {
            setSnackbar({
                open: true,
                severity: "error",
                message: "Invalid shift start or end date/time.",
            });
            setIsSubmitting(false);
            return;
        }

        // Validate LocationId
        const locationId = parseInt(formData.LocationId, 10);
        if (!locationId || isNaN(locationId)) {
            setSnackbar({
                open: true,
                severity: "error",
                message: "LocationId is missing or invalid. Please check and try again.",
            });
            setIsSubmitting(false);
            return;
        }

        if (!service) {
            setSnackbar({
                open: true,
                severity: "error",
                message: "Please select a service.",
            });
            setIsSubmitting(false);
            return;
        }

        // For shift repeats, ensure an end condition is provided
        let AfterEndDate = "";
        let AfterEndNumber = null;

        if (activeTab === "repeats" && formState.TYPE) {
            switch (formState.TYPE) {
                case "Daily":
                    AfterEndDate = formState.AfterEndDate;
                    AfterEndNumber = formState.AfterEndNumber;
                    break;
                case "Weekly":
                    AfterEndDate = formState.AfterEndDate;
                    AfterEndNumber = formState.AfterEndNumber;
                    break;
                case "Monthly":
                    AfterEndDate = formState.AfterEndDate;
                    AfterEndNumber = formState.AfterEndNumber;
                    break;
                default:
                    AfterEndDate = "";
                    AfterEndNumber = null;
            }

            if (!AfterEndDate && !AfterEndNumber) {
                setSnackbar({
                    open: true,
                    severity: "error",
                    message: "Please specify either an end date or a number of occurrences for the shift repeats.",
                });
                setIsSubmitting(false);
                return;
            }
        }

        // Format dates into ISO strings
        const MakerDate = formatDateTimeISO(new Date());
        const UpdateDate = formatDateTimeISO(new Date());

        // Merge BreakStart if applicable
        const breakStart = workerHasBreak
            ? mergeDateAndTime(shiftStartDate, breakStartTime)
            : null;
        const BreakStart = workerHasBreak ? formatDateTimeISO(breakStart) : null;

        // Build Entities array
        const Entities = [
            ...selectedWorkers.map((worker) => ({
                EntityType: "W",
                EntityId: worker.WorkerID,
            })),
            ...selectedClients.map((client) => ({
                EntityType: "C",
                EntityId: client.ClientID,
            })),
        ];

        const ratioString = calcGCD(workersRatio, clientsRatio);

        // For edit mode
        if (isEditMode) {
            const updateData = {
                ShiftID: currentShiftID,
                RosterID: RosterID, // Include RosterID in the payload
                LocationId: locationId,
                ServiceCode: service,
                PayRate: calculatedPayRate,
                ChargeRate: calculatedChargeRate,
                FixedFeeService: formState.FixedFeeService,
                CenterCapitalCosts: formState.CenterCapitalCosts,
                ShiftStart: ShiftStart,
                ShiftEnd: ShiftEnd,
                ShiftOccurOverTwo: isTwoDayShift,
                BreakStart: workerHasBreak ? mergeDateAndTime(shiftStartDate, breakStartTime) : null,
                BreakDuration: breakDuration,
                AppNote: notesFlowsThrough,
                PrivateNote: notesPrivate,
                RosterCategory: formState.RosterCategory,
                DexCategory: dexCategory,
                DexActivity: dexActivity,
                TransportQty: transportQuantity,
                TransportCost: transportCost,
                MealQty: mealQuantity,
                MealCost: mealCost,
                ShiftStatus: "Not Started",
                ShiftStatusReason: "",
                ShiftDate: selectedDate,
                Status: "P",
                OnBreak: formState.OnBreak || false,
                SeriesParentID: formState.SeriesParentID || null,
                Version: formState.Version || 1,
                MakerUser: User_ID,
                MakerDate: MakerDate,
                UpdateUser: User_ID,
                UpdateDate: UpdateDate,
                Entities: Entities,
                WtoCRatio: ratioString,
                ActivityFee: formState.ActivityFee || 0,
            };

            try {
                const response = await putData('/api/updateLocRosterShiftMainData', updateData, window.location.href);
                if (response.success) {
                    addValidationMessage("Shift updated successfully!", "success");
                    clearForm();
                    setShowForm(false);
                    setIsEditMode(false);
                    setCurrentShiftID(null);
                    triggerRefresh(); // Refresh calendar
                } else {
                    addValidationMessage("Failed to update shift!", "error");
                }
            } catch (error) {
                console.error("Error updating shift:", error);
                setSnackbar({
                    open: true,
                    severity: "error",
                    message: "An error occurred while updating the shift.",
                });
            } finally {
                setIsSubmitting(false);
            }
            return;
        }
        // Build requestData for new shift creation
        const requestData = {
            RosterID: RosterID, // Include RosterID in the payload
            LocationId: locationId,
            ServiceCode: service,
            FixedFeeService: formState.FixedFeeService,
            CenterCapitalCosts: formState.CenterCapitalCosts,
            CCC: ccc || 0,
            ShiftStart: ShiftStart,
            ShiftEnd: ShiftEnd,
            ShiftOccurOverTwo: isTwoDayShift,
            BreakStart: BreakStart,
            BreakDuration: breakDuration,
            AppNote: notesFlowsThrough,
            PrivateNote: notesPrivate,
            RosterCategory: formState.RosterCategory,
            DexCategory: dexCategory,
            DexActivity: dexActivity,
            TransportQty: transportQuantity,
            TransportCost: transportCost,
            MealQty: mealQuantity,
            MealCost: mealCost,
            ShiftStatus: "Not Started",
            ShiftStatusReason: "",
            ShiftDate: selectedDate,
            Status: "P",
            OnBreak: formState.OnBreak || false,
            SeriesParentID: formState.SeriesParentID || null,
            Version: formState.Version || 1,
            MakerUser: User_ID,
            MakerDate: MakerDate,
            UpdateUser: User_ID,
            UpdateDate: UpdateDate,
            Entities: Entities,
            WtoCRatio: ratioString,
            ActivityFee: formState.ActivityFee || 0,
            PayRate: calculatedPayRate,
            ChargeRate: calculatedChargeRate,
        };

        // Add repeat-specific data if applicable
        if (activeTab === "repeats" && formState.TYPE) {
            requestData.AfterEndDate = AfterEndDate;
            requestData.AfterEndNumber = AfterEndNumber
                ? parseInt(AfterEndNumber, 10)
                : null;
            requestData.TYPE = formState.TYPE;

            if (formState.TYPE === "Daily") {
                requestData.D_Day = parseInt(formState.D_Day, 10) || 1;
            } else if (formState.TYPE === "Weekly") {
                requestData.W_Week = parseInt(formState.W_Week, 10) || 1;
                requestData.W_MO = formState.W_MO;
                requestData.W_TU = formState.W_TU;
                requestData.W_WE = formState.W_WE;
                requestData.W_TH = formState.W_TH;
                requestData.W_FR = formState.W_FR;
                requestData.W_SA = formState.W_SA;
                requestData.W_SU = formState.W_SU;
            } else if (formState.TYPE === "Monthly") {
                requestData.M_Month = parseInt(formState.M_Month, 10) || 1;
                if (formState.monthlyOption === "firstOption") {
                    requestData.M_Occurance = formState.M_Occurance;
                    requestData.M_Occ_Day = formState.M_Occ_Day;
                } else if (formState.selectedOption === "secondOption") {
                    requestData.M_Day = parseInt(formState.M_Day, 10);
                }
            }
        }

        try {
            let response;
            if (activeTab === "repeats" && formState.TYPE) {
                response = await postData(
                    `/api/insertLocRosterShiftRepeat`,
                    requestData,
                    window.location.href
                );
            } else {
                response = await postData(
                    `/api/postLocRosterShiftMainData`,
                    requestData,
                    window.location.href
                );
            }

            if (response.success) {
                addValidationMessage("Shift created successfully!", "success");
                clearForm();
                setShowForm(false);
            } else {
                addValidationMessage("Failed to create shift!", "error");
            }
        } catch (error) {
            console.error("Error creating shift:", error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An error occurred while creating the shift.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleTogglePreview = async () => {
        let AfterEndDate = "";
        let AfterEndNumber = null;

        // Merge shift start and end times using your existing mergeDateAndTime function
        const shiftStart = mergeDateAndTime(shiftStartDate, shiftStartTime);
        const shiftEnd = mergeDateAndTime(shiftEndDate, shiftEndTime);
        const ShiftStart = formatDateTimeISO(shiftStart);
        const ShiftEnd = formatDateTimeISO(shiftEnd);

        if (activeTab === "repeats" && formState.TYPE) {
            switch (formState.TYPE) {
                case "Daily":
                    AfterEndDate = formState.AfterEndDate;
                    AfterEndNumber = formState.AfterEndNumber;
                    break;
                case "Weekly":
                    AfterEndDate = formState.AfterEndDate;
                    AfterEndNumber = formState.AfterEndNumber;
                    break;
                case "Monthly":
                    AfterEndDate = formState.AfterEndDate;
                    AfterEndNumber = formState.AfterEndNumber;
                    break;
                default:
                    AfterEndDate = "";
                    AfterEndNumber = null;
            }
            if (!AfterEndDate && !AfterEndNumber) {
                setSnackbar({
                    open: true,
                    severity: "error",
                    message:
                        "Please specify either an end date or a number of occurrences for the shift repeats.",
                });
                return;
            }
        }

        const formatDateTime = (date) => {
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(',', '');
        };

        const data = {
            ExcludePublicHoliday: formState.ExcludePublicHoliday,
            AfterEndDate: AfterEndDate ? formatDateTime(new Date(AfterEndDate)) : null,
            AfterEndNumber: AfterEndNumber,
            D_Day: formState.D_Day,
            W_Week: formState.W_Week,
            W_MO: formState.W_MO,
            W_TU: formState.W_TU,
            W_WE: formState.W_WE,
            W_TH: formState.W_TH,
            W_FR: formState.W_FR,
            W_SA: formState.W_SA,
            W_SU: formState.W_SU,
            M_Occurance: formState.M_Occurance,
            M_Occ_Day: formState.M_Occ_Day,
            M_Occ_Month: formState.M_Occ_Month,
            M_Day: formState.M_Day,
            M_Month: formState.M_Month,
            TYPE: formState.TYPE,
            ShiftStart: ShiftStart ? formatDateTime(new Date(ShiftStart)) : null,
            ShiftEnd: ShiftEnd ? formatDateTime(new Date(ShiftEnd)) : null,
            ShiftOccurOverTwo: formState.ShiftOccurOverTwo,
        };

        console.log("Preview Data:", data);

        try {
            const res = await postData("/api/previewShiftRepeat", data);
            setShowPreview(!showPreview);
            setPreviewDates(res.dates);
            console.log("Preview API Response:", res);
        } catch (error) {
            console.error("Error fetching preview dates:", error);
            setSnackbar({
                open: true,
                severity: "error",
                message: "An error occurred while fetching preview dates.",
            });
        }
    };

    const handleClickOutside = (event) => {
        if (
            cardRef.current &&
            !cardRef.current.contains(event.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target)
        ) {
            setShowPreview(false);
        }
    };

    const handleMouseLeave = () => {
        setHoveredCard(null);
    };

    const handleMouseEnter = () => {
        setHoveredCard(true);
    };


    return (
        <>
            {/*<DashMenu />*/}
            <ValidationBar
                messages={validationMessages}
                onClose={handleCloseMessage}
            />
            {userRole ? (
                <div className={style.locationContainer}>
                    <Row style={{display: "flex", justifyContent: "start", alignItems: "center"}}>
                        {/* Location Name */}
                        <Col>
                            <TextField
                                fullWidth
                                label="Location Name"
                                variant="outlined"
                                size="small"
                                type="text"
                                disabled
                                value={formData.LocationName}
                                onChange={(e) => setFormData({...formData, LocationName: e.target.value})}
                                sx={{fontFamily: "Metropolis"}} // Set the font family

                            />
                        </Col>

                        {/* Location Address */}
                        <Col>
                            <TextField
                                fullWidth
                                label="Location Address"
                                variant="outlined"
                                size="small"
                                type="text"
                                disabled
                                value={formData.LocationAddress}
                                onChange={(e) => setFormData({...formData, LocationAddress: e.target.value})}
                                sx={{fontFamily: "Metropolis"}}

                            />
                        </Col>

                        {/* Phone */}
                        <Col>
                            <TextField
                                fullWidth
                                label="Phone"
                                variant="outlined"
                                size="small"
                                type="text"
                                disabled
                                value={formData.Phone}
                                onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                                sx={{fontFamily: "Metropolis"}}

                            />
                        </Col>

                        {/* Email */}
                        <Col>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                size="small"
                                type="email"
                                disabled
                                value={formData.Email}
                                onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                sx={{fontFamily: "Metropolis"}}

                            />
                        </Col>

                        {/* Case Manager */}
                        <Col>
                            <TextField
                                fullWidth
                                label="Case Manager"
                                variant="outlined"
                                size="small"
                                type="text"
                                disabled
                                value={formData.CaseManager}
                                onChange={(e) => setFormData({...formData, CaseManager: e.target.value})}
                                sx={{fontFamily: "Metropolis"}}

                            />
                        </Col>
                    </Row>

                    <Row style={{display: "flex", justifyContent: "start", alignItems: "center", marginTop: "25px"}}>
                        {/* Timezone */}
                        <Col md={3}>
                            <FormControl fullWidth size="small" variant="outlined" disabled>
                                <InputLabel>Timezone</InputLabel>
                                <Select
                                    defaultValue=""
                                    label="Timezone"
                                >
                                    <MenuItem value="Australia/Brisbane">Australia/Brisbane</MenuItem>
                                    <MenuItem value="Redland">Redland</MenuItem>
                                </Select>
                            </FormControl>
                        </Col>
                    </Row>

                    <Row style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '25px',
                        marginBottom: '25px'
                    }}>
                        {/* Left-aligned buttons */}
                        <Col>
                            <Stack direction="row" spacing={2}>
                                {/* Commented may use in future */}
                                {/* <Button variant="contained" color="primary" size="small">
                  Report
                </Button>
                <Button variant="contained" color="secondary" size="small">
                  Audit
                </Button>
                <Button variant="contained" color="primary" size="small">
                  Print Roster
                </Button>
                */}
                            </Stack>
                        </Col>

                        {/* Right-aligned dropdown and buttons */}
                        <Col style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                            <Stack direction="row" spacing={2}>
                                <Select
                                    value={selectedRoster}
                                    onChange={handleRosterChange}
                                    displayEmpty
                                    variant="outlined"
                                    size="small"
                                    style={{minWidth: 150}}
                                >
                                    <MenuItem value="" disabled>
                                        Open Another Location
                                    </MenuItem>
                                    {availableRosters?.map((roster) => (
                                        <MenuItem key={roster.RosterID} value={roster.RosterID}>
                                            {roster.RosterID} - {roster.Description} ({roster.Code})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Col>


                        {/* {locations.map(loc => (
              <p>{loc.Timezone}</p>
            ))} */}

                    </Row>

                    {/* <Row>
            <Col style={{ marginBottom: "25px" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.Publish === 1}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        Publish: e.target.checked ? 1 : 0,
                      }))
                    }
                    color="primary"
                  />
                }
                label="Publish"
              />
            </Col>
          </Row> */}

                    <LocRosterCalendarComp
                        locationId={LocationID}
                        onDateClick={handleDateClick}
                        onShiftClick={handleShiftClick}
                        disable={disableSection}
                        refreshToggle={refreshToggle}
                    />


                    {/* Snackbar for Preview Errors */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={6000}
                        onClose={() => setSnackbar({...snackbar, open: false})}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    >
                        <Alert
                            onClose={() => setSnackbar({...snackbar, open: false})}
                            severity={snackbar.severity}
                            sx={{width: '100%'}}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>

                    <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth="lg">
                        <DialogContent sx={{padding: "10px 24px", overflowY: "scroll", overflowX: "hidden"}}>
                            <div className={styles.tabsShiftCreate}>
                                <div className={styles.tabContainer}>
                                    <button
                                        variant={activeTab === "general" ? "primary" : "secondary"}
                                        onClick={() => handleTabChange("general")}
                                        className={`${styles.RosterTab_button} ${activeTab === "general" ? styles.active : ""}`}
                                    >
                                        General
                                    </button>
                                    <button
                                        variant={activeTab === "repeats" ? "primary" : "secondary"}
                                        onClick={() => handleTabChange("repeats")}
                                        className={`${styles.RosterTab_button} ${activeTab === "repeats" ? styles.active : ""}`}
                                    >
                                        Shift Repeat
                                    </button>
                                </div>
                            </div>
                            <Form onSubmit={handleSubmit}>
                                {activeTab === "general" && (
                                    <Row>
                                        <Col>
                                            <Row
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "start",
                                                    alignItems: "center",
                                                    marginBottom: "25px", // Reduced margin for a cleaner look
                                                }}
                                            >
                                                <Col md={3}>
                                                    <Typography variant="subtitle1" className={style.fontSize13}>
                                                        Type
                                                    </Typography>
                                                </Col>
                                                <Col sm={4} style={{display: 'flex', alignItems: 'center'}}>

                                                    <ToggleButtonGroup
                                                        value={alignment}
                                                        exclusive
                                                        onChange={(event, newAlignment) => {
                                                            if (newAlignment !== null) {
                                                                setAlignment(newAlignment);
                                                            }
                                                        }}
                                                        fullWidth
                                                        sx={{
                                                            '& .MuiToggleButton-root': {
                                                                fontSize: '12px', // Smaller font size
                                                                padding: '5px 24px', // Reduced padding for a minimalistic feel
                                                                textTransform: 'none', // Maintain normal text case for a cleaner design
                                                                transition: 'background-color 0.3s ease',
                                                                color: '#9b9b9b',
                                                                '&.Mui-selected': {
                                                                    backgroundColor: "blue", // Custom color for selected state
                                                                    color: '#fff',
                                                                    '&:hover': {
                                                                        backgroundColor: "blue",

                                                                    },
                                                                },
                                                                '&:hover': {
                                                                    backgroundColor: '#e0e0e0', // Hover effect for better UX
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <ToggleButton value="Worker">Worker</ToggleButton>
                                                        <ToggleButton value="Client">Client</ToggleButton>
                                                    </ToggleButtonGroup>

                                                    {/* Tooltip Icon */}
                                                    <Tooltip
                                                        title="Toggle to select Worker or Client, then click 'Select' to choose."
                                                        arrow
                                                    >
                                                        <IconButton size="small" sx={{marginLeft: '8px',}}>
                                                            <InfoIcon fontSize="small" sx={{color: '#9b9b9b'}}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Col>
                                            </Row>

                                            {/* On This Shift */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col sm={3}>
                                                    <Typography sx={{fontFamily: 'Metropolis'}}
                                                                className={style.fontSize13}>On this shift</Typography>
                                                </Col>

                                                <Col sm={4} style={{display: 'flex', alignItems: 'center'}}>
                                                    <Button variant="contained" className={style.fontSize13}
                                                            style={{backgroundColor: "blue", color: '#fff'}}
                                                            size="small" onClick={handleOpenDialog}>
                                                        Select
                                                    </Button>
                                                    <Tooltip
                                                        title="Switch the toggle to either 'Worker' or 'Client' to make your selection. The selected workers or clients will be displayed below."
                                                        arrow
                                                    >
                                                        <IconButton size="small" sx={{marginLeft: '8px',}}>
                                                            <InfoIcon fontSize="small" sx={{color: '#9b9b9b'}}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Col>

                                                <Row style={{marginTop: "0px", alignItems: "center"}}>
                                                    {(selectedWorkers.length > 0 || selectedClients.length > 0) && (
                                                        <Box mt={4} display="flex" justifyContent="space-between">
                                                            {selectedWorkers.length > 0 && (
                                                                <Box flex={1} mr={2} style={{
                                                                    width: "200px !important", // Explicit width
                                                                    flexShrink: 0,  // Prevents shrinking if flexbox is applied
                                                                }}>
                                                                    <Typography style={{
                                                                        fontSize: '16px',
                                                                        fontWeight: '500',
                                                                        color: '#1976d2',
                                                                        marginBottom: '15px'
                                                                    }}>
                                                                        Selected Workers
                                                                    </Typography>
                                                                    <Stack spacing={1} divider={<Divider flexItem/>}>
                                                                        {selectedWorkers.map((worker) => (
                                                                            <Box key={worker.WorkerID} display="flex"
                                                                                 alignItems="center"
                                                                                 justifyContent="space-between" py={0}>
                                                                                <Typography variant="body1">
                                                                                    {worker.FirstName} {worker.LastName}
                                                                                </Typography>
                                                                                <IconButton size="small" color="error"
                                                                                            onClick={() => handleSelectWorker(worker)}>
                                                                                    <CloseIcon fontSize="small"/>
                                                                                </IconButton>
                                                                            </Box>
                                                                        ))}
                                                                    </Stack>
                                                                </Box>
                                                            )}

                                                            {selectedClients.length > 0 && (
                                                                <Box flex={1} ml={2} mb={3}>
                                                                    <Typography style={{
                                                                        fontSize: '16px',
                                                                        fontWeight: '500',
                                                                        color: '#1976d2',
                                                                        marginBottom: '15px'
                                                                    }}>
                                                                        Selected Clients
                                                                    </Typography>
                                                                    <Stack spacing={1} divider={<Divider flexItem/>}>
                                                                        {selectedClients.map((client) => (
                                                                            <Box key={client.ClientID} display="flex"
                                                                                 alignItems="center"
                                                                                 justifyContent="space-between" py={0}>
                                                                                <Typography variant="body1">
                                                                                    {client.FirstName} {client.LastName}
                                                                                </Typography>
                                                                                <IconButton size="small" color="error"
                                                                                            onClick={() => handleSelectClient(client)}>
                                                                                    <CloseIcon fontSize="small"/>
                                                                                </IconButton>
                                                                            </Box>
                                                                        ))}
                                                                    </Stack>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Row>
                                            </Row>

                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col sm={3}>
                                                    <Typography sx={{fontFamily: 'Metropolis'}}
                                                                className={style.fontSize13}>Shift Start</Typography>
                                                </Col>

                                                <Col sm={4}>
                                                    <DatePicker
                                                        selected={shiftStartDate}
                                                        onChange={(date) => setShiftStartDate(date)}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Select Start Date"
                                                        className="form-control fontSize13"
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select" // Allows selecting month/year from dropdowns
                                                        renderCustomHeader={({
                                                                                 date,
                                                                                 decreaseMonth,
                                                                                 increaseMonth,
                                                                                 prevMonthButtonDisabled,
                                                                                 nextMonthButtonDisabled,
                                                                             }) => (
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    padding: "0.5em",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={decreaseMonth}
                                                                    disabled={prevMonthButtonDisabled}
                                                                >
                                                                    &#8592; {/* Left Arrow */}
                                                                </button>
                                                                <span>
                                  {date.toLocaleString("default", {
                                      month: "long",
                                      year: "numeric",
                                  })}
                                </span>
                                                                <button
                                                                    onClick={increaseMonth}
                                                                    disabled={nextMonthButtonDisabled}
                                                                >
                                                                    &#8594; {/* Right Arrow */}
                                                                </button>
                                                            </div>
                                                        )}
                                                    />
                                                </Col>
                                                <Col sm={4}>
                                                    <DatePicker
                                                        selected={shiftStartTime}
                                                        onChange={(date) => setShiftStartTime(date)}
                                                        className="form-control fontSize13"
                                                        showTimeSelect
                                                        placeholderText="Select Start Time"
                                                        showTimeSelectOnly
                                                        timeIntervals={5}
                                                        timeCaption="Time"
                                                        dateFormat="h:mm aa"
                                                    />
                                                </Col>
                                                <Col sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={formState.ShiftOccurOverTwo}
                                                                onChange={handleFormChange}
                                                                id="ShiftOccurOverTwo"
                                                            />
                                                        }
                                                        label={<Typography className={style.fontSize13}>This shift
                                                            occurs over 2 days</Typography>}
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Shift End */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col sm={3}>
                                                    <Typography sx={{fontFamily: 'Metropolis'}}
                                                                className={style.fontSize13}>Shift End</Typography>
                                                </Col>

                                                <Col sm={4}>
                                                    <DatePicker
                                                        selected={shiftEndDate}
                                                        onChange={(date) => setShiftEndDate(date)}
                                                        className="form-control fontSize13"
                                                        sx={{zIndex: 100}}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Select End Date"
                                                        minDate={shiftStartDate} // Ensure end date is not before start date
                                                        maxDate={
                                                            shiftStartDate && formState.ShiftOccurOverTwo
                                                                ? new Date(
                                                                    shiftStartDate.getTime() + 24 * 60 * 60 * 1000
                                                                )
                                                                : shiftStartDate
                                                        }
                                                        disabled={!formState.ShiftOccurOverTwo}
                                                    />
                                                </Col>


                                                <Col sm={4}>
                                                    <DatePicker
                                                        selected={shiftEndTime}
                                                        onChange={(date) => setShiftEndTime(date)}
                                                        className="form-control fontSize13"
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={5}
                                                        placeholderText="Select End Time"
                                                        timeCaption="End Time"
                                                        dateFormat="h:mm aa"
                                                        filterTime={
                                                            !formState.ShiftOccurOverTwo
                                                                ? (time) => {
                                                                    // Disable times before the start time
                                                                    return time > shiftStartTime;
                                                                }
                                                                : undefined // No filter if shiftOccurOverTwo is false
                                                        }
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Workers/Clients Ratio and Service */}
                                            <Row
                                                style={{marginBottom: "20px", alignItems: "center", marginTop: "35px"}}>
                                                <Col md={3}>
                                                    <Typography sx={{fontFamily: "Metropolis"}}
                                                                className={style.fontSize13}>
                                                        Service
                                                    </Typography>
                                                </Col>
                                                <Col sm={4}>
                                                    <Box display="flex" alignItems="end">
                                                        <TextField
                                                            label="Workers"
                                                            value={workersRatio}
                                                            onChange={handleWorkersChange}
                                                            error={error}
                                                            placeholder="Enter Workers"
                                                            className={style.fontSize13}
                                                            InputLabelProps={{
                                                                style: {fontSize: "14px"}, // Set label font size
                                                            }}
                                                            InputProps={{
                                                                style: {fontSize: "14px", fontFamily: "Metropolis"}, // Set input font size and font family
                                                            }}
                                                            sx={{
                                                                flexGrow: 1,
                                                                marginRight: "8px",
                                                                height: "46px",
                                                                "& input::placeholder": {color: "#666"}, // Change placeholder colour
                                                            }}
                                                        />
                                                        <Typography variant="h6">:</Typography>
                                                        <TextField
                                                            label="Clients"
                                                            className={style.fontSize13}
                                                            value={clientsRatio}
                                                            onChange={handleClientsChange}
                                                            error={error}
                                                            placeholder="Enter Clients"
                                                            InputLabelProps={{
                                                                style: {fontSize: "14px"}, // Set label font size
                                                            }}
                                                            InputProps={{
                                                                style: {fontSize: "14px", fontFamily: "Metropolis"}, // Set input font size and font family
                                                            }}
                                                            sx={{
                                                                flexGrow: 1,
                                                                marginLeft: "8px",
                                                                height: "46px",
                                                                "& input::placeholder": {color: "#666"}, // Change placeholder colour
                                                            }}
                                                        />
                                                    </Box>
                                                    {error && (
                                                        <Typography variant="caption" color="error">
                                                            Please enter valid numbers for both fields.
                                                        </Typography>
                                                    )}
                                                    {workersRatio && clientsRatio && (
                                                        <Typography style={{fontSize: "10px"}} color="primary">
                                                            GCD: {calcGCD(parseInt(workersRatio, 10), parseInt(clientsRatio, 10))}
                                                        </Typography>
                                                    )}
                                                </Col>
                                                <Col sm={4} style={{marginBottom: "15px"}}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel
                                                            id="service-select-label"
                                                            className={style.fontSize13}
                                                            style={{fontSize: "14px"}} // Set label font size
                                                        >
                                                            Service
                                                        </InputLabel>
                                                        {loading ? (
                                                            <CircularProgress size={24}/>
                                                        ) : (
                                                            <Select
                                                                labelId="service-select-label"
                                                                value={service}
                                                                onChange={(e) => {
                                                                    const selectedServiceCode = e.target.value;
                                                                    handleServiceSelect(selectedServiceCode); // Call the service selection handler
                                                                    handleFormChange(e); // Call the original form change handler if needed
                                                                }}
                                                                label="Service"
                                                                sx={{
                                                                    height: "38px",
                                                                    borderRadius: "10px",
                                                                    // Set font size for the selected value
                                                                    "& .MuiSelect-select": {
                                                                        fontSize: "14px",
                                                                        fontFamily: "Metropolis",
                                                                        color: service ? "inherit" : "#666", // Color based on selection
                                                                    },
                                                                    // Optional: Adjust the dropdown icon size if needed
                                                                    "& .MuiSvgIcon-root": {
                                                                        fontSize: "20px",
                                                                    },
                                                                }}
                                                                inputProps={{
                                                                    style: {fontSize: "14px", fontFamily: "Metropolis"}, // Set select input font size and font family
                                                                }}
                                                            >
                                                                {/* Placeholder MenuItem */}
                                                                <MenuItem value="" disabled>
                                                                    <em style={{fontSize: "14px"}}>Select a Service</em>
                                                                </MenuItem>
                                                                {/* Render available services */}
                                                                {services.length > 0 ? (
                                                                    services.map((serviceItem) => (
                                                                        <MenuItem
                                                                            key={serviceItem.Service_Code}
                                                                            value={serviceItem.Service_Code}
                                                                            sx={{
                                                                                fontSize: "14px",
                                                                                fontFamily: "Metropolis"
                                                                            }} // Set font size and family for MenuItem
                                                                        >
                                                                            {serviceItem.Description}
                                                                        </MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled sx={{
                                                                        fontSize: "14px",
                                                                        fontFamily: "Metropolis"
                                                                    }}>
                                                                        No Services Available
                                                                    </MenuItem>
                                                                )}
                                                            </Select>
                                                        )}
                                                    </FormControl>
                                                </Col>

                                            </Row>

                                            {/* Checkboxes and Pay/Charge Rate */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col sm={3}>
                                                    <Typography variant="subtitle1" className={style.fontSize13}>
                                                        Rate
                                                    </Typography>
                                                </Col>
                                                <Col sm={4}>
                                                    <TextField
                                                        label="Pay Rate"
                                                        value={calculatedPayRate.toFixed(2)} // Display calculated pay rate
                                                        onChange={(e) => setCalculatedPayRate(parseFloat(e.target.value) || 0)}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment
                                                                position="start">$</InputAdornment>,
                                                            style: {fontSize: "14px", fontFamily: "Metropolis"}, // Set input font size and font family
                                                        }}
                                                        InputLabelProps={{
                                                            style: {fontSize: "14px"}, // Set label font size
                                                        }}
                                                        placeholder="Enter Pay Rate"
                                                        sx={{
                                                            flexGrow: 1,
                                                            minWidth: "100%",
                                                            height: "46px",
                                                            borderRadius: "10px",
                                                            "& input::placeholder": {color: "#666"}, // Change placeholder colour
                                                        }}
                                                        size="small"
                                                    />
                                                </Col>
                                                <Col sm={4}>
                                                    <TextField
                                                        label="Charge Rate"
                                                        value={calculatedChargeRate.toFixed(2)} // Display calculated charge rate
                                                        onChange={(e) => setCalculatedChargeRate(parseFloat(e.target.value) || 0)}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment
                                                                position="start">$</InputAdornment>,
                                                            style: {fontSize: "14px", fontFamily: "Metropolis"}, // Set input font size and font family
                                                        }}
                                                        InputLabelProps={{
                                                            style: {fontSize: "14px"}, // Set label font size
                                                        }}
                                                        placeholder="Enter Charge Rate"
                                                        sx={{
                                                            flexGrow: 1,
                                                            minWidth: "100%",
                                                            height: "46px",
                                                            borderRadius: "10px",
                                                            "& input::placeholder": {color: "#666"}, // Change placeholder colour
                                                        }}
                                                        size="small"
                                                    />
                                                    {chargeRateOutput ? (
                                                        <Typography
                                                            variant="subtitle1"
                                                            className={styleFont.fontSize13}
                                                        >
                                                            {chargeRateOutput}
                                                        </Typography>
                                                    ) : null}
                                                </Col>
                                            </Row>


                                            {/* Modal for worker or client selection */}
                                            <Dialog
                                                open={isDialogOpen}
                                                onClose={() => setIsDialogOpen(false)}
                                                fullWidth
                                                maxWidth="lg"
                                                PaperProps={{
                                                    style: {
                                                        zIndex: 1300,
                                                        boxShadow: 'none',
                                                        borderRadius: '10px',
                                                        width: "500px",
                                                        height: "500px"
                                                    }
                                                }}
                                            >
                                                <DialogTitle sx={{
                                                    backgroundColor: '#f5f5f5',
                                                    padding: '16px',
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    fontFamily: 'Metropolis'
                                                }}>
                                                    Select {alignment === "Worker" ? "Workers" : "Clients"}
                                                </DialogTitle>

                                                <DialogContent sx={{padding: '16px', backgroundColor: '#fafafa'}}>
                                                    <TableContainer component={Paper} elevation={0} sx={{
                                                        boxShadow: 'none',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e0e0e0',
                                                    }}>
                                                        <Table>
                                                            <TableHead sx={{
                                                                backgroundColor: '#f5f5f5',
                                                                fontFamily: 'Metropolis',
                                                            }}>
                                                                <TableRow
                                                                    sx={{fontFamily: 'Metropolis', fontSize: '14px'}}>
                                                                    <TableCell sx={{
                                                                        fontFamily: 'Metropolis',
                                                                        fontSize: '14px'
                                                                    }}>Select</TableCell>
                                                                    <TableCell sx={{
                                                                        fontFamily: 'Metropolis',
                                                                        fontSize: '14px'
                                                                    }}>{alignment === "Worker" ? "Worker ID" : "Client ID"}</TableCell>
                                                                    <TableCell sx={{
                                                                        fontFamily: 'Metropolis',
                                                                        fontSize: '14px'
                                                                    }}>{alignment === "Worker" ? "Worker Name" : "Client Name"}</TableCell>
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody>
                                                                {alignment === "Worker"
                                                                    ? workers && workers.length > 0 && workers.map((worker) => (
                                                                    <TableRow
                                                                        className={styles.fontSize13}
                                                                        key={worker.WorkerID}
                                                                        hover
                                                                        sx={{
                                                                            '&:nth-of-type(odd)': {backgroundColor: '#f9f9f9'},
                                                                            '&:nth-of-type(even)': {backgroundColor: '#fff'},
                                                                        }}
                                                                    >
                                                                        <TableCell>
                                                                            <Checkbox
                                                                                checked={selectedWorkers.some((selected) => selected.WorkerID === worker.WorkerID)} // Compare by WorkerID
                                                                                onChange={() => handleSelectWorker(worker)}
                                                                                value={worker.WorkerID}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>{worker.WorkerID}</TableCell>
                                                                        <TableCell>{worker.FirstName} {worker.LastName}</TableCell>
                                                                    </TableRow>
                                                                ))
                                                                    : clients && clients.length > 0 && clients.map((client) => (
                                                                    <TableRow
                                                                        key={client.ClientID}
                                                                        hover
                                                                        sx={{
                                                                            '&:nth-of-type(odd)': {backgroundColor: '#f9f9f9'},
                                                                            '&:nth-of-type(even)': {backgroundColor: '#fff'},
                                                                        }}
                                                                    >
                                                                        <TableCell>
                                                                            <Checkbox
                                                                                checked={selectedClients.some((selected) => selected.ClientID === client.ClientID)} // Compare by ClientID
                                                                                onChange={() => handleSelectClient(client)}
                                                                                value={client.ClientID}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>{client.ClientID}</TableCell>
                                                                        <TableCell>{client.FirstName} {client.LastName}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </DialogContent>


                                                <DialogActions sx={{backgroundColor: '#f5f5f5'}}>
                                                    <Button onClick={() => setIsDialogOpen(false)} variant="contained"
                                                            color="primary">
                                                        Done
                                                    </Button>
                                                    <Button onClick={() => setIsDialogOpen(false)} variant="contained"
                                                            color="secondary">
                                                        Close
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>

                                            {/* Fixed Fee Service and Centre Capital Cost */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col sm={3}></Col>
                                                <Col sm={8}>
                                                    <div style={{
                                                        display: "flex",
                                                        gap: "1.5rem",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={formState.FixedFeeService}
                                                                    onChange={handleFormChange}
                                                                    id="FixedFeeService"
                                                                    disabled={true}
                                                                />
                                                            }
                                                            label={<Typography variant="caption">Fixed Fee
                                                                Service</Typography>}
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={formState.CenterCapitalCosts}
                                                                    onChange={handleFormChange}
                                                                    id="CenterCapitalCosts"
                                                                />
                                                            }
                                                            label={<Typography variant="caption">Centre Capital
                                                                Cost</Typography>}
                                                        />
                                                        {cccOutput ? (
                                                            <Typography variant="subtitle1"
                                                                        className={styleFont.fontSize13}>
                                                                {cccOutput}
                                                            </Typography>
                                                        ) : null}
                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* Shift Occurs over 2 Days */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col sm={3}></Col>
                                            </Row>
                                            {/* Selected Workers and Clients */}
                                        </Col>

                                        <Col>
                                            {/* Workers have break */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col md={4}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={workerHasBreak}
                                                                onChange={(e) => setWorkerHasBreak(e.target.checked)}
                                                                size="small"
                                                            />
                                                        }
                                                        label={<Typography className={style.fontSize13}
                                                                           variant="caption">Workers have
                                                            break</Typography>}
                                                    />
                                                </Col>
                                                {workerHasBreak && (
                                                    <>
                                                        <Col style={{zIndex: 9}} md={4}>
                                                            <DatePicker
                                                                placeholderText="Select Time"
                                                                selected={startDate}
                                                                onChange={(date) => setStartDate(date)}
                                                                className="form-control"
                                                                showTimeSelect
                                                                showTimeSelectOnly
                                                                timeIntervals={5}
                                                                timeCaption="Time"
                                                                dateFormat="h:mm aa"
                                                                wrapperClassName="date-picker-wrapper"
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '46px',
                                                                    padding: '10px',
                                                                    fontSize: '12px',
                                                                    borderRadius: '10px'
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={4}>
                                                            <TextField
                                                                label="Break Duration (Minutes)"
                                                                type="number"
                                                                value={breakDuration}
                                                                onChange={(e) => setBreakDuration(e.target.value)}
                                                                size="small"
                                                                fullWidth
                                                                sx={{height: '46px', borderRadius: '10px'}}
                                                            />
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>

                                            {/* Roster Category, Dex Category, and Dex Activity */}
                                            <Row style={{marginBottom: "45px", alignItems: "center"}}>
                                                <Col md={4}>
                                                    <FormControl fullWidth size="small" variant="outlined"
                                                                 sx={{height: '38px'}}>
                                                        {/* <InputLabel className={style.fontSize13}>Roster Category</InputLabel> */}
                                                        <InputField
                                                            id="RosterCategory"
                                                            label="Roster Category"
                                                            className="fontSize13"
                                                            type="select"
                                                            options={rosterCategory.map((roster) => ({
                                                                value: roster.Description,
                                                                label: roster.Description,
                                                            }))}
                                                            value={formState.RosterCategory}
                                                            onChange={handleFormChange}
                                                        />

                                                    </FormControl>
                                                </Col>

                                                {/* Commented for now will use in future */}
                                                {/* <Col md={4}>
                          <FormControl fullWidth size="small" variant="outlined" sx={{ height: '38px' }}>
                          <InputField
                              id="DexCategory"
                              label="Dex Category"
                              className="fontSize13"
                              type="select"
                              options={DexCategory.map((dCat) => ({
                                value: dCat.value,
                                label: dCat.label,
                              }))}
                              value={dexCategory}
                              onChange={(e) => setDexCategory(e.target.value)}

                            />

                            {/* <InputLabel className={style.fontSize13}>Dex Category</InputLabel>
                            <Select
                              value={dexCategory}
                              onChange={(e) => setDexCategory(e.target.value)}
                              label="Dex Category"
                              sx={{ height: '46px', borderRadius: '10px' }}
                            >
                              <MenuItem value="Category1">No Category</MenuItem>
                            </Select> */}
                                                {/* </FormControl>
                        </Col> */}
                                                {/*make dynamic*/}

                                                {/* <Col md={4}>
                          <FormControl fullWidth size="small" variant="outlined" sx={{ height: '38px' }}>
                          <InputField
                              id="DexActivity"
                              label="Dex Activity"
                              className="fontSize13"
                              type="select"
                              options={DexActivity.map((dAct) => ({
                                value: dAct.value,
                                label: dAct.label,
                              }))}
                              value={dexActivity}
                              onChange={(e) => setDexActivity(e.target.value)}

                            />
                            {/* <InputLabel className={style.fontSize13}>Dex Activity</InputLabel>
                            <Select
                              value={dexActivity}
                              onChange={(e) => setDexActivity(e.target.value)}
                              label="Dex Activity"
                              sx={{ height: '46px', borderRadius: '10px' }}
                            >

                              <MenuItem value="Activity1">No Activity</MenuItem>
                            </Select> */}
                                                {/* </FormControl>
                        </Col> */}


                                            </Row>

                                            {/* Transport Quantity and Transport Cost */}
                                            <Row
                                                style={{marginBottom: "20px", alignItems: "center", marginTop: "3rem"}}>
                                                <Col sm={6}>
                                                    <InputField
                                                        placeholder={"Transport Quantity"}
                                                        fullWidth
                                                        id="Transport Quantity"
                                                        label="Transport Quantity"
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        value={transportQuantity}
                                                        className={style.fontSize13}
                                                        onChange={(e) => setTransportQuantity(e.target.value)}
                                                        sx={{height: '46px', minWidth: '100%', borderRadius: '10px'}}
                                                    />
                                                </Col>
                                                <Col sm={6}>
                                                    <InputField
                                                        placeholder={"Transport Cost"}
                                                        fullWidth
                                                        id="Transport Cost"
                                                        label="Transport Cost"
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        value={transportCost}
                                                        className={style.fontSize13}
                                                        onChange={(e) => setTransportCost(e.target.value)}
                                                        sx={{
                                                            height: '46px',
                                                            minWidth: '100%',
                                                            borderRadius: '10px',
                                                            fontSize: "13px"
                                                        }}
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Meal Quantity and Cost */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col md={6}>
                                                    <InputField
                                                        placeholder={"Meal Quantity"}
                                                        fullWidth
                                                        id="Meal Quantity"
                                                        label="Meal Quantity"
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        value={mealQuantity}
                                                        onChange={(e) => setMealQuantity(e.target.value)}
                                                        sx={{height: '46px', borderRadius: '10px'}}
                                                    />
                                                </Col>
                                                <Col md={6}>
                                                    <InputField
                                                        placeholder={"Meal Cost"}
                                                        fullWidth
                                                        id="Meal Cost"
                                                        label="Meal Cost"
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        value={mealCost}
                                                        onChange={(e) => setMealCost(e.target.value)}
                                                        sx={{height: '46px', borderRadius: '10px'}}
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Notes flows through and Notes private */}
                                            <Row style={{marginBottom: "20px", alignItems: "center"}}>
                                                <Col md={6}>
                                                    <InputField
                                                        placeholder={"Notes flows through"}
                                                        fullWidth
                                                        id="Notes flows through"
                                                        label="Notes flows through"
                                                        variant="outlined"
                                                        size="small"
                                                        multiline
                                                        rows={3}
                                                        value={notesFlowsThrough}
                                                        onChange={(e) => setNotesFlowsThrough(e.target.value)}
                                                        sx={{height: '50px', borderRadius: '10px'}}
                                                    />
                                                </Col>
                                                <Col md={6}>
                                                    <InputField
                                                        placeholder={"Notes (private)"}
                                                        fullWidth
                                                        id="Notes (Private)"
                                                        label="Notes (private)"
                                                        variant="outlined"
                                                        size="small"
                                                        multiline
                                                        rows={3}
                                                        value={notesPrivate}
                                                        onChange={(e) => setNotesPrivate(e.target.value)}
                                                        sx={{height: '50px', borderRadius: '10px'}}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>

                                )}
                                {/* Repeat Shift Tab */}
                                {activeTab === "repeats" && (
                                    <Row
                                        style={{
                                            padding: "15px 15px",
                                            ...(showPreview
                                                ? {filter: "blur(5px)", transition: "filter 0.3s ease"}
                                                : {}),
                                        }}
                                    >
                                        <Col md={4}>
                                            <Card style={getCardStyle("Daily")}>
                                                <Card.Body>
                                                    <Col>
                                                        <Form.Check
                                                            type="checkbox"
                                                            id="Daily"
                                                            label="Daily"
                                                            style={{
                                                                textDecoration: "underline",
                                                                fontSize: "15px",
                                                                fontWeight: "700",
                                                            }}
                                                            name="repeatType"
                                                            checked={formState.TYPE === "Daily"}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormState({
                                                                        ...formState,
                                                                        TYPE: "Daily",
                                                                        selectedOption: "",
                                                                        AfterEndDate: "",
                                                                        AfterEndNumber: null,
                                                                    });
                                                                } else {
                                                                    setFormState({
                                                                        ...formState,
                                                                        TYPE: "",
                                                                        selectedOption: "",
                                                                        AfterEndDate: "",
                                                                        AfterEndNumber: null,
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    <hr style={{marginBottom: "20px"}}/>
                                                    <Row className="mt-2">
                                                        <Col>
                                                            <InputField
                                                                label="Every"
                                                                type="number"
                                                                id="D_Day"
                                                                className="fontSize13"
                                                                value={formState.D_Day}
                                                                onChange={handleFormChange}
                                                                disabled={formState.TYPE !== "Daily"}
                                                            />
                                                        </Col>
                                                        <Col className="mt-2">
                                                            <h6>
                                                                <b className="fontSize13">Day(s)</b>
                                                            </h6>
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-3">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="occurrencesRadioDaily"
                                                                name="repeatOptionsDaily"
                                                                className="fontSize13"
                                                                checked={formState.selectedOption === "occurrencesDaily"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState({
                                                                            ...formState,
                                                                            AfterEndDate: "",
                                                                            selectedOption: "occurrencesDaily",
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={11}>
                                                            <InputField
                                                                label="After"
                                                                type="number"
                                                                id="AfterEndNumber"
                                                                className="fontSize13"
                                                                value={formState.AfterEndNumber}
                                                                onChange={handleFormChange}
                                                                disabled={
                                                                    formState.selectedOption !== "occurrencesDaily"
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-3">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="endDateRadioDaily"
                                                                name="repeatOptionsDaily"
                                                                className="fontSize13"
                                                                checked={formState.selectedOption === "endDateDaily"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState({
                                                                            ...formState,
                                                                            AfterEndNumber: "",
                                                                            selectedOption: "endDateDaily",
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={11}>
                                                            <InputField
                                                                label="End Date"
                                                                type="date"
                                                                className="fontSize13"
                                                                id="AfterEndDate"
                                                                value={formState.AfterEndDate}
                                                                onChange={handleFormChange}
                                                                disabled={formState.selectedOption !== "endDateDaily"}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        <Col md={4}>
                                            <Card
                                                style={getCardStyle("Weekly")}
                                                onMouseEnter={() => handleMouseEnter("Weekly")}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <Card.Body>
                                                    <Col className="mb-3">
                                                        <Form.Check
                                                            type="checkbox"
                                                            id="Weekly"
                                                            label="Weekly"
                                                            style={{fontSize: "15px", fontWeight: "700"}}
                                                            name="repeatType"
                                                            checked={formState.TYPE === "Weekly"}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormState({
                                                                        ...formState,
                                                                        TYPE: "Weekly",
                                                                        selectedOption: "",
                                                                        AfterEndDate: "",
                                                                        AfterEndNumber: null,
                                                                    });
                                                                } else {
                                                                    setFormState({
                                                                        ...formState,
                                                                        TYPE: "",
                                                                        selectedOption: "",
                                                                        AfterEndDate: "",
                                                                        AfterEndNumber: null,
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    <hr style={{marginBottom: "20px"}}/>
                                                    <Row className="mt-2">
                                                        <Col sm={5}>
                                                            <InputField
                                                                label="Every"
                                                                type="number"
                                                                className="fontSize13"
                                                                id="W_Week"
                                                                value={formState.W_Week}
                                                                onChange={handleFormChange}
                                                                disabled={formState.TYPE !== "Weekly"}
                                                            />
                                                        </Col>
                                                        <Col className="mt-2">
                                                            <h6>
                                                                <b className="fontSize13">Week(s) on</b>
                                                            </h6>
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-2">
                                                        {["W_MO", "W_TU", "W_WE", "W_TH", "W_FR", "W_SA", "W_SU"].map((day) => (
                                                            <Col
                                                                key={day}
                                                                style={{
                                                                    ...weekDaysStyle,
                                                                    backgroundColor: formState[day] ? "#e6f8fd" : "white",
                                                                }}
                                                            >
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id={day}
                                                                    checked={formState[day]}
                                                                    label={day.split("_")[1]}
                                                                    className="fontSize13"
                                                                    onChange={handleFormChange}
                                                                />
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                    <Row className="mt-2">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="occurrencesRadioWeekly"
                                                                name="repeatOptionsWeekly"
                                                                className="fontSize13"
                                                                checked={formState.selectedOption === "occurrencesWeekly"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState({
                                                                            ...formState,
                                                                            AfterEndDate: "",
                                                                            selectedOption: "occurrencesWeekly",
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={11}>
                                                            <InputField
                                                                label="After"
                                                                type="number"
                                                                id="AfterEndNumber"
                                                                className="fontSize13"
                                                                value={formState.AfterEndNumber}
                                                                onChange={handleFormChange}
                                                                disabled={
                                                                    formState.selectedOption !== "occurrencesWeekly"
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-3">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="endDateRadioWeekly"
                                                                name="repeatOptionsWeekly"
                                                                className="fontSize13"
                                                                checked={formState.selectedOption === "endDateWeekly"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState({
                                                                            ...formState,
                                                                            AfterEndNumber: "",
                                                                            selectedOption: "endDateWeekly",
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={11}>
                                                            <InputField
                                                                label="End Date"
                                                                type="date"
                                                                className="fontSize13"
                                                                id="AfterEndDate"
                                                                value={formState.AfterEndDate}
                                                                onChange={handleFormChange}
                                                                disabled={formState.selectedOption !== "endDateWeekly"}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        <Col md={4}>
                                            <Card
                                                style={getCardStyle("Monthly")}
                                                onMouseEnter={() => handleMouseEnter("Monthly")}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <Card.Body>
                                                    {/* Monthly Checkbox */}
                                                    <Col className="mb-3">
                                                        <Form.Check
                                                            type="checkbox"
                                                            id="Monthly"
                                                            label="Monthly"
                                                            name="repeatType"
                                                            style={{fontSize: "15px", fontWeight: "700"}}
                                                            checked={formState.TYPE === "Monthly"}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormState({
                                                                        ...formState,
                                                                        TYPE: "Monthly",
                                                                        selectedOption1: "",
                                                                        selectedOption2: "",
                                                                        AfterEndDate: "",
                                                                        AfterEndNumber: null,
                                                                    });
                                                                } else {
                                                                    setFormState({
                                                                        ...formState,
                                                                        TYPE: "",
                                                                        selectedOption1: "",
                                                                        selectedOption2: "",
                                                                        AfterEndDate: "",
                                                                        AfterEndNumber: null,
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    <hr style={{marginBottom: "20px"}}/>

                                                    {/* First Radio Group */}
                                                    <Row className="mt-3">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="firstOption"
                                                                name="monthlyOptionGroup1"
                                                                checked={formState.monthlyOption === "firstOption"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState({
                                                                            ...formState,
                                                                            monthlyOption: "firstOption",
                                                                            M_Occurance: "",
                                                                            M_Occ_Day: "",
                                                                            M_Month: "",
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={4}>
                                                            <InputField
                                                                label="Every"
                                                                type="select"
                                                                id="M_Occurance"
                                                                value={formState.M_Occurance || ""}
                                                                onChange={handleFormChange}
                                                                options={[
                                                                    {value: 1, label: "First"},
                                                                    {value: 2, label: "Second"},
                                                                    {value: 3, label: "Third"},
                                                                    {value: 4, label: "Fourth"},
                                                                    {value: 5, label: "Last"},
                                                                ]}
                                                                disabled={formState.monthlyOption !== "firstOption"}
                                                            />
                                                        </Col>
                                                        <Col sm={4}>
                                                            <InputField
                                                                label="Day Of Every"
                                                                type="select"
                                                                id="M_Occ_Day"
                                                                value={formState.M_Occ_Day || ""}
                                                                onChange={handleFormChange}
                                                                options={[
                                                                    {value: 1, label: "Monday"},
                                                                    {value: 2, label: "Tuesday"},
                                                                    {value: 3, label: "Wednesday"},
                                                                    {value: 4, label: "Thursday"},
                                                                    {value: 5, label: "Friday"},
                                                                    {value: 6, label: "Saturday"},
                                                                    {value: 7, label: "Sunday"},
                                                                ]}
                                                                disabled={formState.monthlyOption !== "firstOption"}
                                                            />
                                                        </Col>
                                                        <Col sm={3}>
                                                            <InputField
                                                                label="Month"
                                                                id="M_Month"
                                                                type="number"
                                                                value={formState.M_Month || ""}
                                                                onChange={handleFormChange}
                                                                disabled={formState.monthlyOption !== "firstOption"}
                                                            />
                                                        </Col>
                                                    </Row>

                                                    {/* Second Radio Group */}
                                                    <Row className="mt-4">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="secondOption"
                                                                name="monthlyOptionGroup1"
                                                                className="fontSize13"
                                                                checked={formState.monthlyOption === "secondOption"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState({
                                                                            ...formState,
                                                                            monthlyOption: "secondOption",
                                                                            M_Day: "",
                                                                            M_Month: "",
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={5}>
                                                            <InputField
                                                                label="Day Of Every"
                                                                className="fontSize13"
                                                                type="number"
                                                                id="M_Day"
                                                                value={formState.M_Day || ""}
                                                                onChange={handleFormChange}
                                                                disabled={formState.monthlyOption !== "secondOption"}
                                                            />
                                                        </Col>
                                                        <Col sm={5}>
                                                            <InputField
                                                                label="Month"
                                                                type="number"
                                                                className="fontSize13"
                                                                id="M_Month"
                                                                value={formState.M_Month || ""}
                                                                onChange={handleFormChange}
                                                                disabled={formState.monthlyOption !== "secondOption"}
                                                            />
                                                        </Col>
                                                    </Row>

                                                    {/* End Date or After Occurrences */}
                                                    <Row className="mt-3">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="occurrencesRadioMonthly"
                                                                name="monthlyOptionGroup2"
                                                                className="fontSize13"
                                                                checked={formState.selectedOption2 === "occurrencesMonthly"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState((prevState) => ({
                                                                            ...prevState,
                                                                            AfterEndDate: "",
                                                                            selectedOption2: "occurrencesMonthly",
                                                                        }));
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={11}>
                                                            <InputField
                                                                label="After"
                                                                type="number"
                                                                id="AfterEndNumber"
                                                                className="fontSize13"
                                                                value={formState.AfterEndNumber || ""}
                                                                onChange={handleFormChange}
                                                                disabled={formState.selectedOption2 !== "occurrencesMonthly"}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-3">
                                                        <Col sm={1}>
                                                            <Form.Check
                                                                type="radio"
                                                                id="endDateRadioMonthly"
                                                                name="monthlyOptionGroup2"
                                                                className="fontSize13"
                                                                checked={formState.selectedOption2 === "endDateMonthly"}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormState((prevState) => ({
                                                                            ...prevState,
                                                                            AfterEndNumber: "",
                                                                            selectedOption2: "endDateMonthly",
                                                                        }));
                                                                    }
                                                                }}
                                                                style={{
                                                                    transform: "scale(1.5)",
                                                                    marginRight: "10px",
                                                                    marginTop: "10px",
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={11}>
                                                            <InputField
                                                                label="End Date"
                                                                className="fontSize13"
                                                                type="date"
                                                                id="AfterEndDate"
                                                                value={formState.AfterEndDate || ""}
                                                                onChange={handleFormChange}
                                                                disabled={formState.selectedOption2 !== "endDateMonthly"}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{display: "flex", justifyContent: "flex-end"}}>

                                        {showPreview && (
                                            <Card
                                                ref={cardRef}
                                                style={{
                                                    position: "fixed",
                                                    bottom: "110px",
                                                    right: "410px",
                                                    width: "320px",
                                                    zIndex: 1500,
                                                }}
                                            >
                                                <Card.Header>Preview</Card.Header>
                                                <Card.Body>
                                                    <Calendar
                                                        tileContent={({date, view}) => {
                                                            if (view === "month") {
                                                                const dateString = date
                                                                    .toLocaleString("en-CA")
                                                                    .split(",")[0];
                                                                if (previewDates.includes(dateString)) {
                                                                    return (
                                                                        <div
                                                                            style={{
                                                                                backgroundColor: "#ffcc00",
                                                                                borderRadius: "50%",
                                                                                width: "10px", // Adjust the size of the highlight if needed
                                                                                height: "10px", // Adjust the size of the highlight if needed
                                                                                margin: "auto", // Centers the highlight
                                                                            }}
                                                                        />
                                                                    );
                                                                }
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        )}
                                        {activeTab == "repeats" &&
                                            <Box sx={{
                                                display: "flex",
                                                paddingBottom: "1rem",
                                                paddingTop: "1rem",
                                                justifyContent: "flex-end",
                                                gap: "20px",
                                                marginRight: "2rem"
                                            }}>
                                                <MButton
                                                    variant="secondary"
                                                    ref={buttonRef}
                                                    onClick={handleTogglePreview}
                                                    label={"Preview"}
                                                    style={{
                                                        backgroundColor: "red",
                                                        fontSize: "12px",
                                                        textTransform: "none",
                                                        color: "white",
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                    <FaEye style={{marginRight: "5px"}}/>
                                                    Preview
                                                </MButton>
                                                <MButton
                                                    variant="secondary"
                                                    onClick={() => {
                                                        clearForm();
                                                        handleClose()
                                                    }}
                                                    label={"Cancel"}
                                                    size={"small"}
                                                    style={{
                                                        backgroundColor: "red",
                                                        fontSize: "12px",
                                                        textTransform: "none",
                                                        color: "white",
                                                        marginRight: "10px",

                                                    }}
                                                >
                                                </MButton>
                                                <MButton
                                                    variant="primary"
                                                    type="submit"
                                                    label={"Submit"}
                                                    size={"small"}
                                                    style={{
                                                        backgroundColor: isSubmitDisabled || disableSubmit ? "gray" : "blue",
                                                        fontSize: "12px",
                                                        textTransform: "none",
                                                        color: isSubmitDisabled || disableSubmit ? "black" : "white",
                                                        cursor: isSubmitDisabled || disableSubmit ? "not-allowed" : "pointer",
                                                        opacity: isSubmitDisabled || disableSubmit ? 0.6 : 1, // Optional: reduce opacity for disabled state
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ?
                                                        <CircularProgress size={20} color="inherit"/> : "Submit"}
                                                </MButton>

                                            </Box>
                                        }
                                        {
                                            activeTab == 'general' &&
                                            <Box sx={{
                                                display: "flex",
                                                paddingBottom: "1rem",
                                                paddingTop: "1rem",
                                                justifyContent: "flex-end",
                                                gap: "20px",
                                                marginRight: "2rem"
                                            }}>

                                                <MButton
                                                    variant="secondary"
                                                    onClick={() => {
                                                        clearForm();
                                                        handleClose()
                                                    }}
                                                    label={"Cancel"}
                                                    size={"small"}
                                                    style={{
                                                        backgroundColor: "red",
                                                        fontSize: "12px",
                                                        textTransform: "none",
                                                        color: "white",
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                </MButton>
                                                <MButton
                                                    variant="primary"
                                                    type="submit"
                                                    label={"Submit"}
                                                    size={"small"}
                                                    style={{
                                                        backgroundColor: isSubmitDisabled || disableSubmit ? "gray" : "blue",
                                                        fontSize: "12px",
                                                        textTransform: "none",
                                                        color: isSubmitDisabled || disableSubmit ? "#696969" : "white",
                                                        cursor: isSubmitDisabled || disableSubmit ? "not-allowed" : "pointer",
                                                        opacity: isSubmitDisabled || disableSubmit ? 0.6 : 1, // Optional: reduce opacity for disabled state
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ?
                                                        <CircularProgress size={20} color="inherit"/> : "Submit"}
                                                </MButton>
                                            </Box>
                                        }
                                    </div>
                                </div>
                                <Divider/>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <Typography variant="h6" style={{textAlign: 'center', marginTop: '20px'}}>
                    {message || 'You do not have access to this page.'}
                </Typography>
            )}
        </>
    );
};

export default LocationRosterCalendar;
