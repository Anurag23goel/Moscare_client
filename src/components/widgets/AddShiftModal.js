import React, {useCallback, useEffect, useRef, useState} from "react";
import InputField from "@/components/widgets/InputField";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {Alert, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Tooltip, Typography} from "@mui/material";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import styles from "@/styles/scheduler.module.css";
import styleFont from "@/styles/style.module.css";
import {fetchData, postData, putData} from "@/utility/api_utility";
import {FaEye, FaTrash, FaUndo} from "react-icons/fa"; // Import FaUndo
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MButton from "@/components/widgets/MaterialButton";
import dayjs from "dayjs"; // Import dayjs for date formatting
import CategoryBox from "./CategoryBox.tsx"
import FormField from "./FormField.tsx"
import {
    AlertCircle,
    AlertTriangle,
    Calendar as CalendarIcon,
    CalendarDays,
    CalendarRange,
    CheckCircle2,
    Circle,
    Clock,
    Coffee,
    DollarSign,
    FileText,
    HelpCircle,
    Info,
    Layers,
    Loader2,
    Minus,
    Plus,
    Repeat,
    RotateCcw,
    Save,
    Settings,
    Users,
    XCircle,
} from 'lucide-react';

const AssignShiftModal = ({
    showModal,
    setShowModal,
    clientId,
    rosterId,
    onAddValidationMessage,
    data,
    onUpdate,
}) => {
    const [previewDates, setPreviewDates] = useState([]);
    const [shiftStartDate, setShiftStartDate] = useState(null);
    const [shiftStartTime, setShiftStartTime] = useState(null);
    const [shiftEndDate, setShiftEndDate] = useState(null);
    const [shiftEndTime, setShiftEndTime] = useState(null);
    const [isOvertimeShift, setIsOvertimeShift] = useState(0);
    const [overtimeHours, setOvertimeHours] = useState(0);
    const [cccOutput, setCccOutput] = useState("");
    const [shouldFetchCCC, setShouldFetchCCC] = useState(true);
    const [chargeRateOutput, setChargeRateOutput] = useState("");
    const [allServices, setAllServices] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [chkExcldHoliday, setChkExcldHoliday] = useState(null);
    // const [publicHolidays, setPublicHolidays] = useState([]);
    const [disableSubmit, setDisableSubmit] = useState(false); // Submit Button Disabled State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingShiftId, setEditingShiftId] = useState(null); // ID of the shift being edited
    const [allWorkers, setAllWorkers] = useState([]);
    const [rosterCategory, setRosterCategory] = useState([]);
    const [service, setService] = useState([]);
    const [workerCount, setWorkerCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [output, setOutput] = useState("");
    const [activeTab, setActiveTab] = useState("general");
    const [hoveredCard, setHoveredCard] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [incompleteFields, setIncompleteFields] = useState({});
    const [showAdditionalWorkers, setShowAdditionalWorkers] = useState(false);
    const [showWorkerModal, setShowWorkerModal] = useState(false);
    const [workerOutputMessage, setWorkerOutputMessage] = useState("");
    const [publicHolidays, setPublicHolidays] = useState([]); // Array of 'YYYY-MM-DD' strings
    const [isPublicHolidaySelected, setIsPublicHolidaySelected] = useState(false); // Tracks if a selected date is a public holiday    
    // const { colors } = useContext(ColorContext);

    const [ccc, setCcc] = useState(0);
    const cardRef = useRef(null);
    const buttonRef = useRef(null);

    const isSubmitDisabled = Object.keys(incompleteFields).length > 0 || disableSubmit;
    const tabs = [
        { id: 'general', label: 'General', icon: CalendarIcon },
        { id: 'splitShift', label: 'Split Shift', icon: Layers },
        { id: 'repeats', label: 'Shift Repeat', icon: Repeat }
      ];
      const weekDays = ["W_MO", "W_TU", "W_WE", "W_TH", "W_FR", "W_SA", "W_SU"];
      const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const repeatTypes = [
        {
          id: 'Daily',
          title: 'Daily',
          description: 'Repeat this shift every day or every few days',
          icon: CalendarIcon,
          gradient: 'from-blue-500 to-cyan-600',
          pattern: 'from-blue-400/20 to-cyan-400/20'
        },
        {
          id: 'Weekly',
          title: 'Weekly',
          description: 'Repeat on specific days of the week',
          icon: CalendarRange,
          gradient: 'from-purple-500 to-pink-600',
          pattern: 'from-purple-400/20 to-pink-400/20'
        },
        {
          id: 'Monthly',
          title: 'Monthly',
          description: 'Repeat on specific days of the month',
          icon: CalendarDays,
          gradient: 'from-amber-500 to-orange-600',
          pattern: 'from-amber-400/20 to-orange-400/20'
        }
      ];
      const handleTypeSelect = (type) => {
        setFormState(prev => ({
          ...prev,
          TYPE: prev.TYPE === type ? null : type,
          selectedOption: "",
          AfterEndDate: "",
          AfterEndNumber: null
        }));
      };
    const [formState, setFormState] = useState({
        ClientID: clientId,
        RosterID: rosterId,
        IsLocationRoster: false,
        ServiceCode: "",
        ServiceDescription: "",
        PayRate: 0,
        ChargeRate: 0,
        RosterCategory: "",
        FixedFeeService: "",
        CenterCapitalCosts: false,
        shiftStartDate: null,
        shiftStartTime: null,
        shiftEndDate: null,
        shiftEndTime: null,
        ShiftOccurOverTwo: false,
        CheckList: "",
        OrderNumber: "",
        SupportWorker1: null,
        SupportWorker2: null,
        SupportWorker3: null,
        SupportWorker4: null,
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
        selectedOption1: "",
        selectedOption2: "",
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
            },
            {
                splitNo: 2,
                service: "",
                hours: "",
                startTime: "",
                endTime: "",
                chargeRate: "",
                payRate: "",
                checked: false,
            },
            {
                splitNo: 3,
                service: "",
                hours: "",
                startTime: "",
                endTime: "",
                chargeRate: "",
                payRate: "",
                checked: false,
            },
            {
                splitNo: 4,
                service: "",
                hours: "",
                startTime: "",
                endTime: "",
                chargeRate: "",
                payRate: "",
                checked: false,
            },
        ],
        splitShift: false,
        checkNotes: false,
        durationHours: 0,
        ShiftEndDateMin: "",
        ShiftEndDateMax: "",
    });

        const clearForm = () => {
            setFormState({
                ClientID: clientId,
                RosterID: rosterId,
                IsLocationRoster: false,
                ServiceCode: "",
                PayRate: 0,
                ChargeRate: 0,
                RosterCategory: "",
                FixedFeeService: "",
                CenterCapitalCosts: false,
                shiftStartDate: null,
                shiftStartTime: null,
                shiftEndDate: null,
                shiftEndTime: null,
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
                selectedOption1: "",
                selectedOption2: "",
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
                    },
                    {
                        splitNo: 2,
                        service: "",
                        hours: "",
                        startTime: "",
                        endTime: "",
                        chargeRate: "",
                        payRate: "",
                        checked: false,
                    },
                    {
                        splitNo: 3,
                        service: "",
                        hours: "",
                        startTime: "",
                        endTime: "",
                        chargeRate: "",
                        payRate: "",
                        checked: false,
                    },
                    {
                        splitNo: 4,
                        service: "",
                        hours: "",
                        startTime: "",
                        endTime: "",
                        chargeRate: "",
                        payRate: "",
                        checked: false,
                    },
                ],
                splitShift: false,
                checkNotes: false,
                durationHours: 0,
                ShiftEndDateMin: "",
                ShiftEndDateMax: "",
            });
            setShiftStartDate(null);
            setShiftStartTime(null);
            setShiftEndDate(null);
            setShiftEndTime(null);
            setShowAdditionalWorkers(false);
            setCccOutput("");
            setCcc(0);
            setChargeRateOutput("");
        };

        const openEditModal = (shift) => {
            if (!shift) {
                clearForm();
                return;
            }
            console.log("Editing Shift Data:", shift);
            setEditingShiftId(shift.ShiftID);
            setIsEditMode(true);

            const shiftStartDateTime = shift.ShiftStart ? new Date(shift.ShiftStart) : null;
            const shiftEndDateTime = shift.ShiftEnd ? new Date(shift.ShiftEnd) : null;

            const shiftStartDate = shiftStartDateTime ? new Date(
                shiftStartDateTime.getFullYear(),
                shiftStartDateTime.getMonth(),
                shiftStartDateTime.getDate()
            ) : null;

            const shiftStartTime = shiftStartDateTime ? new Date(
                shiftStartDateTime.getFullYear(),
                shiftStartDateTime.getMonth(),
                shiftStartDateTime.getDate(),
                shiftStartDateTime.getHours(),
                shiftStartDateTime.getMinutes(),
                0,
                0
            ) : null;

            const shiftEndDate = shiftEndDateTime ? new Date(
                shiftEndDateTime.getFullYear(),
                shiftEndDateTime.getMonth(),
                shiftEndDateTime.getDate()
            ) : null;

            const shiftEndTime = shiftEndDateTime ? new Date(
                shiftEndDateTime.getFullYear(),
                shiftEndDateTime.getMonth(),
                shiftEndDateTime.getDate(),
                shiftEndDateTime.getHours(),
                shiftEndDateTime.getMinutes(),
                0,
                0
            ) : null;

            setFormState({
                ...formState,
                ClientID: shift.ClientID,
                RosterID: shift.RosterID,
                IsLocationRoster: shift.IsLocationRoster || false,
                ServiceCode: shift.ServiceCode || "",
                PayRate: shift.PayRate || 0,
                ChargeRate: shift.ChargeRate || 0,
                RosterCategory: shift.RosterCategory || "",
                FixedFeeService: shift.FixedFeeService || false,
                CenterCapitalCosts: shift.CenterCapitalCosts || false,
                shiftStartDate: shiftStartDate,
                shiftStartTime: shiftStartTime,
                shiftEndDate: shiftEndDate,
                shiftEndTime: shiftEndTime,
                ShiftOccurOverTwo: shift.ShiftOccurOverTwo || false,
                SupportWorker1: shift.SupportWorker1 || "UNALLOCATED",
                SupportWorker2: shift.SupportWorker2 || "",
                SupportWorker3: shift.SupportWorker3 || "",
                SupportWorker4: shift.SupportWorker4 || "",
                OrderNumber: shift.OrderNumber || "",
                BreakStart: shift.BreakStart || "",
                BreakDuration: shift.BreakDuration || "",
                AppNote: shift.AppNote || "",
                PrivateNote: shift.PrivateNote || "",
                ExcludePublicHoliday: shift.ExcludePublicHoliday || false,
                AfterEndDate: shift.AfterEndDate || "",
                AfterEndNumber: shift.AfterEndNumber || null,
                TYPE: shift.TYPE || "",
                D_Day: shift.D_Day || null,
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
                W_Week: shift.W_Week || 1,
                W_MO: shift.W_MO || false,
                W_TU: shift.W_TU || false,
                W_WE: shift.W_WE || false,
                W_TH: shift.W_TH || false,
                W_FR: shift.W_FR || false,
                W_SA: shift.W_SA || false,
                W_SU: shift.W_SU || false,
                M_Occurance: shift.M_Occurance || null,
                M_Occ_Day: shift.M_Occ_Day || null,
                M_Occ_Month: shift.M_Occ_Month || null,
                M_Day: shift.M_Day || null,
                M_Month: shift.M_Month || null,
                RosterTimeZone: shift.TimeZone || "",
                RestrictedAccess: shift.RestrictedAccess || false,
                Completed: shift.Completed || 0,
                Publish: shift.Publish || 1,
                number: "1",
                month: "1",
                selectedOption: "",
                selectedOption1: "",
                selectedOption2: "",
                days: "",
                Status: shift.Status || "P",
                splitShiftDetails: shift.splitShiftDetails
                    ? shift.splitShiftDetails.map((detail) => ({
                        splitNo: detail.splitNo || 1,
                        service: detail.service || "",
                        hours: detail.hours || "",
                        startTime: formatDateTimeLocal(new Date(detail.startTime)),
                        endTime: formatDateTimeLocal(new Date(detail.endTime)),
                        chargeRate: detail.chargeRate || "",
                        payRate: detail.payRate || "",
                        checked: detail.checked || false,
                    }))
                    : [
                        {
                            splitNo: 1,
                            service: "",
                            hours: "",
                            startTime: "",
                            endTime: "",
                            chargeRate: "",
                            payRate: "",
                            checked: false,
                        },
                        {
                            splitNo: 2,
                            service: "",
                            hours: "",
                            startTime: "",
                            endTime: "",
                            chargeRate: "",
                            payRate: "",
                            checked: false,
                        },
                        {
                            splitNo: 3,
                            service: "",
                            hours: "",
                            startTime: "",
                            endTime: "",
                            chargeRate: "",
                            payRate: "",
                            checked: false,
                        },
                        {
                            splitNo: 4,
                            service: "",
                            hours: "",
                            startTime: "",
                            endTime: "",
                            chargeRate: "",
                            payRate: "",
                            checked: false,
                        },
                    ],
                splitShift: false,
                checkNotes: false,
                durationHours: 0,
                ShiftEndDateMin: "",
                ShiftEndDateMax: "",
                ShiftStartDateMin: "",
                ShiftStartDateMax: "",
            });

            setShiftStartDate(shiftStartDate);
            setShiftStartTime(shiftStartTime);
            setShiftEndDate(shiftEndDate);
            setShiftEndTime(shiftEndTime);
        };

        const [snackbar, setSnackbar] = useState({
            open: false,
            message: "",
            severity: "success",
        });

        const [resetShiftModal, setResetShiftModal] = useState({
            open: false,
            index: null,
        });

        const weekDaysStyle = {
            padding: "4px",
            marginRight: "2px",
            borderRadius: "6px",
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

        useEffect(() => {
            const validateWorkers = async () => {
                const workers = [
                    formState.SupportWorker1,
                    formState.SupportWorker2,
                    formState.SupportWorker3,
                    formState.SupportWorker4,
                ].filter(workerId => workerId && workerId !== "UNALLOCATED");

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
        }, [
            formState.SupportWorker1,
            formState.SupportWorker2,
            formState.SupportWorker3,
            formState.SupportWorker4,
        ]);

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

        const handleTabChange = (tab) => {
            setActiveTab(tab);
        };

        const handleMouseEnter = (cardId) => {
            setHoveredCard(cardId);
        };

        const handleMouseLeave = () => {
            setHoveredCard(null);
        };

        // **1. Separate Merging and Formatting Functions**
        const mergeDateAndTime = (date, time) => {
            if (!date || !time) return null;

            const combined = new Date(date);
            combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
            return combined;
        };

        const formatDateTimeLocal = (dateObj) => {
            if (!dateObj) return null;
            return dayjs(dateObj).format("YYYY-MM-DD HH:mm:ss");
        };

        const handleServiceChange = async (index, serviceCode) => {
            // Update the service for the split shift at the given index
            setFormState((prevState) => {
                const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
                updatedSplitShiftDetails[index].service = serviceCode;
                return {
                    ...prevState,
                    splitShiftDetails: updatedSplitShiftDetails,
                };
            });

            // Fetch payRate and chargeRate based on the selected service
            try {
                const workerId = formState.SupportWorker1;
                const shiftStartTime = formState.splitShiftDetails[index].startTime;

                if (!workerId || !shiftStartTime) {
                    // Show warning if worker or start time is not set
                    setSnackbar({
                        open: true,
                        message: "Please ensure a worker is selected and the start time is set before choosing a service.",
                        severity: "warning",
                    });
                    return;
                }

                const data = {
                    workerId,
                    shiftStartDateTime: shiftStartTime,
                    serviceCode,
                };

                // Make API call to fetch PayRate and ChargeRate
                const response = await postData("/api/getPayRateAndChargeRate", data);

                if (response && response.PayRate !== undefined && response.ChargeRate !== undefined) {
                    const payRate = parseFloat(response.PayRate);
                    const chargeRate = parseFloat(response.ChargeRate);

                    // Update the payRate and chargeRate for the split shift
                    setFormState((prevState) => {
                        const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
                        updatedSplitShiftDetails[index].payRate = isNaN(payRate) ? 0 : payRate;
                        updatedSplitShiftDetails[index].chargeRate = isNaN(chargeRate) ? 0 : chargeRate;
                        return {
                            ...prevState,
                            splitShiftDetails: updatedSplitShiftDetails,
                        };
                    });

                    // Recalculate total pay and charge based on updated split shifts
                    recalculateTotalPayAndCharge(formState.splitShiftDetails);
                } else {
                    console.error("Invalid response from getPayRateAndChargeRate API:", response);
                    setSnackbar({
                        open: true,
                        message: "Failed to retrieve rates for the selected service.",
                        severity: "error",
                    });
                }
            } catch (error) {
                console.error("Error fetching PayRate and ChargeRate:", error);
                setSnackbar({
                    open: true,
                    message: "An error occurred while fetching rates. Please try again.",
                    severity: "error",
                });
            }
        };

        const fetchChkExcldHoliday = useCallback(async () => {
            if (!clientId) return;

            try {
                const response = await fetchData(`/api/getChkExcHolidayByClientID/${clientId}`);

                if (response && response.CHKExcldHoliday !== undefined) {
                    setChkExcldHoliday(response.CHKExcldHoliday);
                    console.log(`CHKExcldHoliday for ClientID ${clientId}: ${response.CHKExcldHoliday}`);
                } else {
                    console.log(`No CHKExcldHoliday data found for ClientID ${clientId}`);
                }
            } catch (error) {
                console.error("Error fetching CHKExcldHoliday:", error);
            }
        }, [clientId]);


        // **Fetch Public Holidays when shiftStartDate changes**
        const fetchPublicHolidays = async (year) => {
            try {
                const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AU`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch public holidays: ${response.statusText}`);
                }
                const holidays = await response.json();
                const holidayDates = holidays.map((holiday) => holiday.date); // 'YYYY-MM-DD'
                setPublicHolidays((prevHolidays) => [...prevHolidays, ...holidayDates]);
                console.log(`Fetched public holidays for ${year}:`, holidayDates);
            } catch (error) {
                console.error("Error fetching public holidays:", error);
                setSnackbar({
                    open: true,
                    message: "Failed to fetch public holidays.",
                    severity: "error",
                });
            }
        };

        const isDatePublicHoliday = (date) => {
            const dateString = dayjs(date).format("YYYY-MM-DD");
            return publicHolidays.includes(dateString);
        };

        if (shiftStartDate) {
            const year = shiftStartDate.getFullYear();
            // Avoid refetching the same year's holidays
            if (!publicHolidays.some((date) => date.startsWith(`${year}-`))) {
                fetchPublicHolidays(year);
            }
        }

    // **2. Call fetchChkExcldHoliday when the component mounts**
    // useEffect(() => {
    //     fetchChkExcldHoliday();
    // }, [fetchChkExcldHoliday, fetchPublicHolidays]);

        // render public holidays as the component mounts
        useEffect(() => {
            fetchPublicHolidays(new Date().getFullYear());
        }, []);

        useEffect(() => {
            if (clientId) {
                fetchChkExcldHoliday();
            }
        }, [clientId]);

    // **Handler for Shift Start Date Change**
    const handleShiftStartDateChange = (date) => {
        
        if (!date) {
            setShiftStartDate(null);
            setDisableSubmit(false);
            return;
        }

            const isHoliday = isDatePublicHoliday(date);

            if (isHoliday) {
                if (chkExcldHoliday === 1) {
                    setSnackbar({
                        open: true,
                        message: "Cannot create a shift on a public holiday as per client's agreement.",
                        severity: "error",
                    });
                    setDisableSubmit(true);
                    setShiftStartDate(null); // Reset the selected date
                } else {
                    // Allow selection if chkExcldHoliday is 0
                    setShiftStartDate(date);
                    setDisableSubmit(false);
                }
            } else {
                setShiftStartDate(date);
                setDisableSubmit(false);
            }
        };

        const handleShiftEndDateChange = (date) => {
            if (!date) {
                setShiftEndDate(null);
                setDisableSubmit(true);
                return;
            }

            const isHoliday = isDatePublicHoliday(date);

            if (isHoliday) {
                if (chkExcldHoliday === 1) {
                    setSnackbar({
                        open: true,
                        message: "Cannot create a shift on a public holiday as per client's agreement.",
                        severity: "error",
                    });
                    setDisableSubmit(true);
                    setShiftEndDate(null); // Reset the selected date
                } else {
                    // Allow selection if chkExcldHoliday is 0
                    setShiftEndDate(date);
                    setDisableSubmit(false);
                }
            } else {
                setShiftEndDate(date);
                setDisableSubmit(false);
            }
        };

        // **2. Update handleTogglePreview Function**
        const handleTogglePreview = async () => {
            const ShiftStart = mergeDateAndTime(shiftStartDate, shiftStartTime);
            const ShiftEnd = mergeDateAndTime(
                shiftEndDate || shiftStartDate,
                shiftEndTime || shiftStartTime
            );

            const data = {
                ExcludePublicHoliday: formState.ExcludePublicHoliday,
                AfterEndDate: formState.AfterEndDate,
                AfterEndNumber: parseInt(formState.AfterEndNumber),
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
                ShiftStart: formatDateTimeLocal(ShiftStart),
                ShiftEnd: formatDateTimeLocal(ShiftEnd),
                ShiftOccurOverTwo: formState.ShiftOccurOverTwo,
            };
            console.log(data);
            try {
                if (!data.ShiftStart || !data.ShiftEnd) {
                    setOutput(
                        "Please select a valid shift start and end date to get a preview."
                    );
                    return;
                }

                const result = await postData("/api/previewShiftRepeat", data);
                console.log(result.dates);
                setPreviewDates(result.dates);
                setShowPreview(!showPreview);
                setOutput("");
            } catch (error) {
                console.log(error);
            } finally {
                console.log("done");
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
            if (clientId != null && rosterId != null) {
                setFormState((prevState) => ({
                    ...prevState,
                    ClientID: clientId,
                    RosterID: rosterId,
                }));
            }
        }, [clientId, rosterId]);

        useEffect(() => {
            if (shiftStartTime && shiftEndTime) {
                const duration = (shiftEndTime - shiftStartTime) / (1000 * 60 * 60); // Convert ms to hours
                if (duration > 8) {
                    setIsOvertimeShift(1);
                    setOvertimeHours(parseFloat((duration - 8).toFixed(1))); // Round to one decimal
                    // Replace alert with snackbar
                    setSnackbar({
                        open: true,
                        message: "This is an overtime shift.",
                        severity: "info",
                    });
                } else {
                    setIsOvertimeShift(0);
                    setOvertimeHours(0);
                }
            }
        }, [shiftStartTime, shiftEndTime]);

        const getWorkers = async () => {
            try {
                const allWorkersData = await fetchData("api/getActiveWorkerMasterData");
                if (allWorkersData && allWorkersData.data) {
                    setAllWorkers(allWorkersData.data);
                } else {
                    console.error("Unexpected data format:", allWorkersData);
                }
            } catch (error) {
                console.error("Error fetching workers data:", error);
            }
        };

        const getRosters = async () => {
            try {
                const allRosterData = await fetchData("/api/getRosterCategory"); // Corrected API endpoint string
                if (allRosterData && allRosterData.data) {
                    setRosterCategory(allRosterData.data);
                } else {
                    console.error("Unexpected data format:", allRosterData);
                }
            } catch (error) {
                console.error("Error fetching roster data:", error);
            }
        };


    const handleCardClick = (index) => {
        setFormState((prevState) => {
          const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
          updatedSplitShiftDetails[index].checked = !updatedSplitShiftDetails[index].checked;
          return {
            ...prevState,
            splitShiftDetails: updatedSplitShiftDetails,
          };
        });
      };
    

    // Consolidated public holiday check and shift type determination
    const publicHolidaysCache = {};
    const isPublicHoliday = async (date) => {
        const year = date.getFullYear();
        if (!publicHolidaysCache[year]) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => {
                    controller.abort();
                }, 5000); // 5-second timeout

                    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AU`, {
                        signal: controller.signal,
                    });

                    clearTimeout(timeout);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch public holidays: ${response.statusText}`);
                    }

                    const holidays = await response.json();
                    publicHolidaysCache[year] = holidays;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.error(`Fetching public holidays for year ${year} timed out.`);
                    } else {
                        console.error(`Error fetching public holidays for year ${year}:`, error);
                    }
                    // Decide how to handle errors: return false or throw

                    publicHolidaysCache[year] = [];
                }
            }
            const holidays = publicHolidaysCache[year];
            const dateString = dayjs(date).format("YYYY-MM-DD");
            return holidays.some((holiday) => holiday.date === dateString);
        };

        const getShiftType = async (shiftStartDateTime) => {
            const date = new Date(shiftStartDateTime);
            const day = date.getDay(); // 0 = Sunday, 6 = Saturday
            const hour = date.getHours();
            let shiftType;

            try {
                const isHoliday = await isPublicHoliday(date);
                if (isHoliday) {
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
            } catch (error) {
                console.error("Error determining shift type:", error);
                // Default to standard shift type or handle as needed
                shiftType = "standard";
            }

            return shiftType;
        };

        const getParentServiceCode = (serviceCode) => {
            const suffixPattern = /_(\d+)$/;
            const match = serviceCode.match(suffixPattern);
            if (match) {
                return serviceCode.replace(suffixPattern, "").trim().toLowerCase();
            }
            return serviceCode.trim().toLowerCase();
        };

        // Function to split the shift into segments based on shift type boundaries
        const splitShiftByShiftTypes = async (start, end) => {
            const segments = [];
            let current = new Date(start);
            let iterations = 0;
            const maxIterations = 1000; // Safeguard against infinite loops

            while (current < end && iterations < maxIterations) {
                const shiftType = await getShiftType(current);
                let boundary;

                if (shiftType === "standard") {
                    // Next boundary is 6 PM same day
                    boundary = new Date(current);
                    boundary.setHours(18, 0, 0, 0);
                } else if (shiftType === "night") {
                    // Next boundary is 6 AM next day
                    boundary = new Date(current);
                    boundary.setDate(boundary.getDate() + 1);
                    boundary.setHours(6, 0, 0, 0);
                } else if (["saturday", "sunday", "public_holiday"].includes(shiftType)) {
                    // For weekends and public holidays, set boundary to shift end
                    boundary = new Date(end);
                } else {
                    console.error(`Unknown shift type: ${shiftType}. Defaulting to 6 PM boundary.`);
                    boundary = new Date(current);
                    boundary.setHours(18, 0, 0, 0);
                }

                // Prevent boundary from being set in the past or same as current
                if (boundary <= current) {
                    if (["saturday", "sunday", "public_holiday"].includes(shiftType)) {
                        // Already set boundary to shift end
                        boundary = new Date(end);
                    } else {
                        console.error(`Boundary time (${boundary}) is not after current time (${current}). Breaking loop.`);
                        break;
                    }
                }

                // If boundary exceeds shift end, set it to shift end
                if (boundary > end) {
                    boundary = new Date(end);
                }

                const durationMs = boundary - current;
                const durationHours = durationMs / (1000 * 60 * 60);

                segments.push({
                    shiftType,
                    startTime: new Date(current),
                    endTime: new Date(boundary),
                    durationHours,
                });

                current = new Date(boundary);
                iterations += 1;
            }

            if (iterations >= maxIterations) {
                console.error("splitShiftByShiftTypes reached maximum iterations. Possible infinite loop.");
            }

            return segments;
        };

    const calculatePayAndChargeRates = async () => {
        // If there are incomplete fields for the worker, skip rate calculation.
        if (Object.keys(incompleteFields).length > 0) {
            console.warn("Incomplete worker fields exist. Skipping rate calculation.");
            // Optionally, you could clear any previously calculated rates here
            setIsCalculating(false);
            return;
        }
        setIsCalculating(true); // Start loading indicator
        if (
            shiftStartDate &&
            shiftStartTime &&
            shiftEndDate &&
            shiftEndTime &&
            formState.ServiceCode &&
            formState.SupportWorker1 &&
            formState.SupportWorker1 !== "UNALLOCATED" &&
            clientId &&
            allServices.length > 0
        ) {
            try {
                const ShiftStart = mergeDateAndTime(shiftStartDate, shiftStartTime);
                const ShiftEnd = mergeDateAndTime(shiftEndDate, shiftEndTime);

                    console.log("Shift Start DateTime:", ShiftStart);
                    console.log("Shift End DateTime:", ShiftEnd);

                    if (ShiftEnd <= ShiftStart) {
                        console.error("Shift end time must be after start time.");
                        setSnackbar({
                            open: true,
                            message: "Shift end time must be after start time.",
                            severity: "warning",
                        });
                        setIsCalculating(false); // Stop loading
                        return;
                    }

                    // Split shift into segments
                    const segments = await splitShiftByShiftTypes(ShiftStart, ShiftEnd);
                    console.log("Shift Segments:", segments);

                    if (segments.length === 0) {
                        console.warn("No shift segments created. Please check shift times and types.");
                        setSnackbar({
                            open: true,
                            message: "No shift segments created. Please check shift times and types.",
                            severity: "warning",
                        });
                        setIsCalculating(false); // Stop loading
                        return;
                    }

                    // Prepare all API calls concurrently
                    const payChargePromises = segments.map(async (segment, index) => {
                        const {shiftType, startTime, endTime, durationHours} = segment;

                        // Fetch PayRate and ChargeRate for this segment
                        const data = {
                            workerId: formState.SupportWorker1,
                            serviceCode: formState.ServiceCode,
                            shiftStartDateTime: formatDateTimeLocal(startTime),
                        };
                        console.log("Fetching PayRate and ChargeRate with data:", data);
                        const response = await postData("/api/getPayRateAndChargeRate", data);
                        console.log("API Response:", response);

                        let payRate = 0;
                        let chargeRate = 0;

                        if (response && response.PayRate !== undefined && response.ChargeRate !== undefined) {
                            payRate = parseFloat(response.PayRate);
                            chargeRate = parseFloat(response.ChargeRate);

                            // If shiftType is night, fetch night rates
                            if (shiftType === "night") {
                                const parentServiceCode = getParentServiceCode(formState.ServiceCode);
                                console.log("Parent Service Code:", parentServiceCode);

                                if (parentServiceCode) {
                                    // Find night service
                                    const nightService = allServices.find(
                                        (svc) =>
                                            svc.Parent_Code?.trim().toLowerCase() === parentServiceCode &&
                                            svc.Shift_Type?.trim().toLowerCase() === "night"
                                    );
                                    console.log("Night Service:", nightService); // Debugging

                                    if (nightService) {
                                        const nightServiceCode = nightService.Service_Code;
                                        console.log("Found Night Service Code:", nightServiceCode);

                                        // Fetch night rates
                                        const nightData = {
                                            workerId: formState.SupportWorker1,
                                            serviceCode: nightServiceCode,
                                            shiftStartDateTime: formatDateTimeLocal(startTime),
                                        };
                                        console.log(
                                            "Fetching Night PayRate and ChargeRate with data:",
                                            nightData
                                        );
                                        const nightResponse = await postData(
                                            "/api/getPayRateAndChargeRate",
                                            nightData
                                        );
                                        console.log("Night API Response:", nightResponse);

                                        if (
                                            nightResponse &&
                                            nightResponse.PayRate !== undefined &&
                                            nightResponse.ChargeRate !== undefined
                                        ) {
                                            payRate = parseFloat(nightResponse.PayRate);
                                            chargeRate = parseFloat(nightResponse.ChargeRate);
                                        } else {
                                            console.error(
                                                "Invalid response from getPayRateAndChargeRate for night service",
                                                nightResponse
                                            );
                                            // Fallback to standard rates
                                        }
                                    } else {
                                        console.error(
                                            "Night service not found for parent service code:",
                                            parentServiceCode
                                        );
                                        // Fallback to standard rates
                                    }
                                } else {
                                    console.error("Parent service code not found.");
                                    // Fallback to standard rates
                                }
                            }

                            const periodPay = payRate * durationHours;
                            const periodCharge = chargeRate * durationHours;

                            console.log(
                                `Segment (${shiftType}): ${durationHours} hours * PayRate: ${payRate} = ${periodPay}, ChargeRate: ${chargeRate} = ${periodCharge}`
                            );

                            return {periodPay, periodCharge};
                        } else {
                            console.error(
                                "Invalid response from getPayRateAndChargeRate",
                                response
                            );
                            return {periodPay: 0, periodCharge: 0};
                        }
                    });

                    // Execute all API calls concurrently
                    const results = await Promise.all(payChargePromises);

                    let totalPay = 0;
                    let totalCharge = 0;

                    results.forEach(({periodPay, periodCharge}) => {
                        totalPay += periodPay;
                        totalCharge += periodCharge;
                    });

                    setChargeRateOutput("")
                    console.log("CCC checked ? : ", formState.CenterCapitalCosts);
                    if (formState.CenterCapitalCosts) {
                        console.log("CCC value: ", ccc);
                        const cccCharge = ccc * (ShiftEnd - ShiftStart) / (1000 * 60 * 60);
                        console.log("CCC calc", cccCharge)
                        ccc > 0 ? setChargeRateOutput(`Charge Rate: $${totalCharge.toFixed(2)} + CCC: $${cccCharge.toFixed(2)}`) : setChargeRateOutput(`Charge Rate: $${totalCharge.toFixed(2)}`)
                        totalCharge += cccCharge;
                    }

                    console.log("Total Pay:", totalPay);
                    console.log("Total Charge:", totalCharge);

                    // Update form state with calculated totals
                    setFormState((prevState) => ({
                        ...prevState,
                        PayRate: parseFloat(totalPay.toFixed(2)), // Set as number
                        ChargeRate: parseFloat(totalCharge.toFixed(2)), // Set as number
                        durationHours: (ShiftEnd - ShiftStart) / (1000 * 60 * 60),
                    }));
                    console.log("Updated formState with rates:", {
                        ...formState,
                        PayRate: parseFloat(totalPay.toFixed(2)),
                        ChargeRate: parseFloat(totalCharge.toFixed(2)),
                        durationHours: (ShiftEnd - ShiftStart) / (1000 * 60 * 60),
                    });
                } catch (error) {
                    console.error("Error fetching PayRate and ChargeRate", error);
                    setSnackbar({
                        open: true,
                        message: "An error occurred while calculating rates.",
                        severity: "error",
                    });
                } finally {
                    setIsCalculating(false); // Stop loading indicator
                }
            } else {
                console.warn("Conditions not met for calculating pay and charge rates");
            }
        };

        useEffect(() => {
            calculatePayAndChargeRates();
        }, [
            shiftStartDate,
            shiftStartTime,
            shiftEndDate,
            shiftEndTime,
            formState.ServiceCode,
            formState.SupportWorker1,
            allServices,
            clientId,
        ]);

        const getService = async () => {
            try {
                if (!shiftStartDate || !shiftStartTime || !clientId) {
                    return;
                }

                const ShiftStart = mergeDateAndTime(shiftStartDate, shiftStartTime);
                const shiftType = await getShiftType(ShiftStart);
                console.log("Fetching services for shift type:", shiftType);

                const response = await fetchData(`/api/getServiceAsPerAgreement/${clientId}/${shiftType}`);

                console.log("API Response:", response);

                if (response?.success && response.data) {
                    setService(response.data);
                    setAllServices(response.data);
                    console.log("Service data:", response.data);
                } else {
                    console.warn("Validation Message:", response?.error);

                    if (response?.error) {
                        onAddValidationMessage(`The client's agreement has expired. Shift cannot be created. Kindly renew the agreement.`, "error");
                    } else {
                        onAddValidationMessage("The client's agreement has expired. Shift cannot be created. Kindly renew the agreement.", "error");
                    }
                }
            } catch (error) {
                console.error("Error fetching service data:", error);

                // Handle 400 errors properly
                if (error?.response && error.response.status === 400) {
                    onAddValidationMessage(`The client's agreement has expired. Shift cannot be created. Kindly renew the agreement.`, "error");
                } else {
                    onAddValidationMessage("The client's agreement has expired. Shift cannot be created. Kindly renew the agreement.", "error");
                }
            }
        };


        // Call getService when dependencies change
        useEffect(() => {
            getWorkers();
            getRosters();
            if (shiftStartDate && shiftStartTime) {
                getService();
            }
        }, [clientId, shiftStartDate, shiftStartTime]);


        const handleServiceSelect = (selectedServiceCode) => {
            // Find the selected service in the service list
            const selectedService = service.find(serv => serv.Service_Code === selectedServiceCode);

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
            if (formState.ShiftStartDateTime && formState.ShiftOccurOverTwo) {
                const minEndDate = new Date(formState.ShiftStartDateTime);
                const maxEndDate = new Date(formState.ShiftStartDateTime);
                maxEndDate.setDate(maxEndDate.getDate() + 1); // Add 1 day

                setFormState((prevState) => ({
                    ...prevState,
                    ShiftEndDateMin: minEndDate,
                    ShiftEndDateMax: maxEndDate,
                }));
            } else if (formState.ShiftStartDateTime) {
                setFormState((prevState) => ({
                    ...prevState,
                    ShiftEndDateMin: formState.ShiftStartDateTime,
                    ShiftEndDateMax: formState.ShiftStartDateTime,
                    ShiftEndDateTime: formState.ShiftStartDateTime,
                }));
            }
        }, [formState.ShiftStartDateTime, formState.ShiftOccurOverTwo,]);

        const fetchCCC = async () => {
            setChargeRateOutput("");
            setCcc(0)
            if (formState.CenterCapitalCosts && formState.ServiceCode) {
                const selectedService = service.find((service) => service.Service_Code === formState.ServiceCode);
                if (selectedService) {
                    setCccOutput("Loading...");

                    const res = await fetchData(`/api/getCCCOfServiceSelected/${selectedService.Service_Code}`);

                    if (res.success) {
                        const cccValue = parseFloat(res.data.Charge_Rate_1);
                        setCcc(cccValue);
                        console.log("Fetched CCC: ", cccValue);
                        setCccOutput(`Centre Capital Costs: $${cccValue} will be applied per hour additionally to the service charge rate`);
                    } else {
                        setShouldFetchCCC(false);
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
            }
        };

    const handleFormChange = async (event) => {
        event.preventDefault();
        if (!event || !event.target) return;

            const {id, value, type, checked} = event.target;

            if (type === "checkbox") {
                setFormState((prevState) => ({
                    ...prevState,
                    [id]: checked,
                }));

                // Handle specific checkboxes
                if (id === "ShiftOccurOverTwo") {
                    if (!checked) {
                        setShiftEndDate(shiftStartDate);
                        setShiftEndTime(shiftStartTime);
                    } else {
                        setShiftEndDate(null);
                        setShiftEndTime(null);
                    }
                }

                if (id === "CenterCapitalCosts") {
                    if (checked) {
                        setShouldFetchCCC(true);
                    } else {
                        setShouldFetchCCC(false);
                        setCccOutput("");
                        setCcc(0);
                        setChargeRateOutput("");
                    }
                }
            } else {
                setFormState((prevState) => ({
                    ...prevState,
                    [id]: value,
                }));

                if (id === "shiftStartDate" && !formState.ShiftOccurOverTwo) {
                    setShiftEndDate(value);
                }
                if (id === "shiftStartTime" && !formState.ShiftOccurOverTwo) {
                    setShiftEndTime(value);
                }
            }
        };

        useEffect(() => {
            fetchCCC();
        }, [formState.ServiceCode, formState.CenterCapitalCosts]);

        useEffect(() => {
            if (formState.CenterCapitalCosts !== null) {
                calculatePayAndChargeRates();
            }
        }, [formState.CenterCapitalCosts, ccc]);

        const resetCCC = () => {
            setFormState((prevState) => ({
                ...prevState,
                CenterCapitalCosts: false,
            }));
            setCccOutput("");
            setCcc(0);
            setChargeRateOutput("");
        };

        useEffect(() => {
            resetCCC();
        }, [shiftStartDate, shiftStartTime, shiftEndDate, shiftEndTime]);

        const addWorker = () => {
            if (workerCount < 4) {
                setWorkerCount(workerCount + 1);
            }
        };

        const removeWorker = (index) => {
            setFormState((prevState) => {
                const newState = {...prevState};
                for (let i = index; i < 4; i++) {
                    newState[`SupportWorker${i}`] = newState[`SupportWorker${i + 1}`];
                }
                newState[`SupportWorker4`] = "";
                return newState;
            });
            setWorkerCount(workerCount - 1);
        };

        const mergeDateAndTimeLocal = (date, time) => {
            if (!date || !time) return null;

            // Combine Date object and Time object into a single Date object
            const combined = new Date(date);
            combined.setHours(time.getHours(), time.getMinutes(), 0, 0);

            return combined;
        };

        // Update split shift start time when shiftStartDate or shiftStartTime changes
        useEffect(() => {
            if (shiftStartDate && shiftStartTime) {
                const formattedShiftStart = mergeDateAndTimeLocal(
                    shiftStartDate,
                    shiftStartTime
                );
                // Update split 1 startTime in splitShiftDetails
                setFormState((prevState) => ({
                    ...prevState,
                    splitShiftDetails: prevState.splitShiftDetails.map((split, index) =>
                        index === 0 ? {...split, startTime: formatDateTimeLocal(formattedShiftStart)} : split
                    ),
                }));
            }
        }, [shiftStartDate, shiftStartTime]);

        useEffect(() => {
            if (shiftStartDate && !formState.ShiftOccurOverTwo) {
                setShiftEndDate(shiftStartDate);
            }
        }, [shiftStartDate, formState.ShiftOccurOverTwo]);

        useEffect(() => {
            if (shiftStartTime && !formState.ShiftOccurOverTwo) {
                let newShiftEndTime = new Date(shiftStartTime);
                newShiftEndTime.setHours(newShiftEndTime.getHours() + 1);
                setShiftEndTime(newShiftEndTime);
            }
        }, [shiftStartTime, formState.ShiftOccurOverTwo]);

        useEffect(() => {
            if (data) {
                openEditModal(data); // Populate form with shift data
            } else {
                clearForm(); // Clear form for adding a new shift
            }
        }, [data]);

        // Function to check worker availability
        const checkWorkerAvailability = async (workerId, startTime, endTime) => {
            try {
                const data = {workerId, shiftStart: startTime, shiftEnd: endTime};
                const result = await postData("/api/isWorkerAvailable", data);
                return result;
            } catch (error) {
                console.error("Error checking worker availability:", error);
                return {success: false, message: "Error checking availability."};
            }
        };

        const areWorkersUnallocated = () => {
            return (
                formState.SupportWorker1 === "UNALLOCATED" &&
                formState.SupportWorker2 === "UNALLOCATED" &&
                formState.SupportWorker3 === "UNALLOCATED" &&
                formState.SupportWorker4 === "UNALLOCATED"
            );
        };

        const workerOptions = [
            {value: null, label: "Unallocated"}, // Placeholder option
            ...allWorkers.map((worker) => ({
                value: worker.WorkerID,
                label: worker.FirstName,
            })),
        ];

        const getSupportWorkers = (formState) => {
            const workers = [];
            if (formState.SupportWorker1 && formState.SupportWorker1 !== "UNALLOCATED") workers.push(formState.SupportWorker1);
            if (formState.SupportWorker2 && formState.SupportWorker2 !== "UNALLOCATED") workers.push(formState.SupportWorker2);
            if (formState.SupportWorker3 && formState.SupportWorker3 !== "UNALLOCATED") workers.push(formState.SupportWorker3);
            if (formState.SupportWorker4 && formState.SupportWorker4 !== "UNALLOCATED") workers.push(formState.SupportWorker4);
            return workers;
        };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        // Check if the form should be disabled
        if (isSubmitDisabled || isSubmitting || disableSubmit) {
            let message = "Please complete all required fields before submitting.";

            if (Object.keys(incompleteFields).length > 0) {
                const workerMessages = Object.entries(incompleteFields).map(
                    ([workerId, fields]) =>
                        `Worker ID ${workerId} needs to complete the following fields: ${fields.join(", ")}`
                );
                message = workerMessages.join("\n");
            }
            setSnackbar({
                open: true,
                message: message,
                severity: "warning",
            });
            setIsSubmitting(false);
            return;
        }

        // **** Additional Mandatory Validations ****
        // Check that the shift start date and time are provided
        if (!shiftStartDate || !shiftStartTime) {
            setSnackbar({
                open: true,
                message: "Shift start date and time are required.",
                severity: "error",
            });
            setIsSubmitting(false);
            return;
        }

        // Check that the shift end date and time are provided
        if (!shiftEndDate || !shiftEndTime) {
            setSnackbar({
                open: true,
                message: "Shift end date and time are required.",
                severity: "error",
            });
            setIsSubmitting(false);
            return;
        }

        // Check that a service is selected.
        // (Adjust the property name if your service field is named differently.)
        if (!formState.ServiceCode) {
            setSnackbar({
                open: true,
                message: "Service selection is required.",
                severity: "error",
            });
            setIsSubmitting(false);
            return;
        }

        // Process worker allocation
        const supportWorker1 =
            formState.SupportWorker1 === null ? "UNALLOCATED" : formState.SupportWorker1;

        // Combine date and time into Date objects (since shift start and end are now mandatory, we can pass them directly)
        const ShiftStart = mergeDateAndTime(shiftStartDate, shiftStartTime);
        const ShiftEnd = mergeDateAndTime(shiftEndDate, shiftEndTime);

        // Determine if any split shifts are enabled
        const splitShiftExists = formState.splitShiftDetails.some(
            (shift) => shift.checked
        );

        // Check if ShiftStart or ShiftEnd is on a public holiday
        const startIsHoliday = isDatePublicHoliday(ShiftStart);
        const endIsHoliday = isDatePublicHoliday(ShiftEnd);

        if (chkExcldHoliday === 1 && (startIsHoliday || endIsHoliday)) {
            setSnackbar({
                open: true,
                message:
                    "Cannot create a shift on a public holiday as per client's agreement.",
                severity: "error",
            });
            setIsSubmitting(false);
            return;
        }

        if (chkExcldHoliday === 0 && (startIsHoliday || endIsHoliday)) {
            setSnackbar({
                open: true,
                message:
                    "According to the client's agreement, shifts on public holidays are restricted.",
                severity: "error",
            });
            // You may choose to return here if you do not want to proceed.
        }

        // Prepare split shift details; only include details for each shift (enabled or not)
        const formattedSplitShiftDetails = formState.splitShiftDetails
            .filter(shift => shift.checked)
            .reduce((acc, curr) => {
                const splitNo = curr.splitNo;
                acc[`s${splitNo}_service_code`] = curr.service;
                acc[`s${splitNo}_charge_rate`] = parseFloat(curr.chargeRate) || 0;
                acc[`s${splitNo}_pay_rate`] = parseFloat(curr.payRate) || 0;
                acc[`s${splitNo}_start_time`] = formatDateTimeLocal(new Date(curr.startTime));
                acc[`s${splitNo}_end_time`] = formatDateTimeLocal(new Date(curr.endTime));
                acc[`s${splitNo}_hours`] = parseFloat(curr.hours) || 0;
                return acc;
            }, {});

        const status = areWorkersUnallocated() ? "Not Started" : "Not Started"; 

        const dataToSend = {
            ...formState,
            PayRate: parseFloat(formState.PayRate), 
            ChargeRate: parseFloat(formState.ChargeRate), 
            AfterEndNumber: parseInt(formState.AfterEndNumber),
            splitShiftExists,
            ShiftStatus: status,
            ShiftStart: formatDateTimeLocal(ShiftStart), 
            ShiftEnd: formatDateTimeLocal(ShiftEnd),
            SupportWorker1: supportWorker1,
            isOvertimeShift,
            overtimeHours,
            CCC: ccc,
            ...formattedSplitShiftDetails,
        };


        // Validate data if necessary before sending

        const supportWorkers = getSupportWorkers(formState);
        for (const workerId of supportWorkers) {
            const result = await checkWorkerAvailability(
                workerId,
                formatDateTimeLocal(ShiftStart),
                formatDateTimeLocal(ShiftEnd)
            );
            console.log("Worker availability result:", result);
            if (result && result.success === false) {
                setWorkerOutputMessage(`${result.workerName} ${result.message}`);
                setShowWorkerModal(true);
                setIsSubmitting(false);
                return;
            }
        }

        console.log("Data to send:", dataToSend);

        try {
            let response;

            if (isEditMode) {
                // **Update Existing Shift**
                response = await putData(
                    `/api/updateShift/${editingShiftId}`,
                    dataToSend,
                    window.location.href
                );
                if (response.success) {
                    // Notify Scheduler to refresh data
                    if (onUpdate) {
                        onUpdate();
                    }
                 
                }
            } else {
                // **Determine if Shift is Repeated**
                const isRepeatShift = activeTab === "repeats" && dataToSend.TYPE;

                if (isRepeatShift) {
                    // **Create Repeated Shift**
                    response = await postData(
                        "/api/insertShiftMainDataRepeated",
                        dataToSend,
                        window.location.href
                    );
                } else {
                    // **Create New Shift**
                    response = await postData(
                        "/api/insertShiftMainData",
                        dataToSend,
                        window.location.href
                    );
                }

                if (response.success) {
                    if (isRepeatShift) {
                        onAddValidationMessage("Repeated Shift Created Successfully", "success");
                        sendNotification(response.insertedShiftID);
                    } else {
                        onAddValidationMessage("Shift Created Successfully", "success");
                        console.log("Shift ID:", response.insertedShiftID);
                        sendNotification(response.insertedShiftID);
                    }
                    clearForm();
                } else {
                    onAddValidationMessage(`Failed to create Shift`, "error");
                }
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.message) {
                onAddValidationMessage(
                    `Shift Creation Failed: ${error.response.data.message}`,
                    "error"
                );
            } else if (error.data && error.data.response) {
                onAddValidationMessage(
                    `Shift Creation Failed: ${error.data.response}`,
                    "error"
                );
            } else {
                onAddValidationMessage(`Shift Creation Failed: ${error.message}`, "error");
            }
        } finally {
            console.log("done");
            setIsSubmitting(false);
        }

        setShowModal(false);
    };


        const handleContinue = async () => {
            setShowWorkerModal(false);
            setIsSubmitting(true);

            // Combine date and time into Date objects
            const ShiftStart = mergeDateAndTime(shiftStartDate, shiftStartTime);
            const ShiftEnd = mergeDateAndTime(
                shiftEndDate || shiftStartDate,
                shiftEndTime || shiftStartTime
            );

            // Determine if any split shifts are enabled
            const splitShiftExists = formState.splitShiftDetails.some(
                (shift) => shift.checked
            );

        // Prepare split shift details, only include enabled shifts
        const formattedSplitShiftDetails = formState.splitShiftDetails
            .filter(shift => shift.checked)
            .reduce((acc, curr) => {
                const splitNo = curr.splitNo;
                acc[`s${splitNo}_service_code`] = curr.service;
                acc[`s${splitNo}_charge_rate`] = parseFloat(curr.chargeRate) || 0;
                acc[`s${splitNo}_pay_rate`] = parseFloat(curr.payRate) || 0;
                acc[`s${splitNo}_start_time`] = formatDateTimeLocal(new Date(curr.startTime));
                acc[`s${splitNo}_end_time`] = formatDateTimeLocal(new Date(curr.endTime));
                acc[`s${splitNo}_hours`] = parseFloat(curr.hours) || 0;
                return acc;
            }, {});

        // Prepare data for submission
        const dataToSend = {
            ...formState, // Spread in all properties from formState
            PayRate: parseFloat(formState.PayRate), // Make sure these are numbers
            ChargeRate: parseFloat(formState.ChargeRate),
            AfterEndNumber: parseInt(formState.AfterEndNumber),
            splitShiftExists, // A flag indicating if any split shifts are enabled
            ShiftStatus: "Not Started",
            ShiftStart: formatDateTimeLocal(ShiftStart), // Formatted start datetime
            ShiftEnd: formatDateTimeLocal(ShiftEnd),     // Formatted end datetime
            isOvertimeShift,
            overtimeHours,
            CCC: ccc,
            ...formattedSplitShiftDetails, // Merge only the enabled split shift details
        };

            try {
                let response;
                const isRepeatShift = activeTab === "repeats" && dataToSend.TYPE;

                if (isRepeatShift) {
                    response = await postData(
                        "/api/insertShiftMainDataRepeated",
                        dataToSend,
                        window.location.href
                    );
                } else {
                    response = await postData(
                        "/api/insertShiftMainData",
                        dataToSend,
                        window.location.href
                    );
                }

                if (response.success) {
                    console.log(response);
                    onAddValidationMessage("Shift Created Successfully", "success");
                    sendNotification(response.insertedShiftID);
                    clearForm();
                } else {
                    onAddValidationMessage(`Failed to create Shift`, "error");
                }
            } catch (error) {
                console.error(error);
                onAddValidationMessage(`Failed to create Shift: ${error.message}`, "error");
            } finally {
                console.log("done");
                setIsSubmitting(false);
            }
        };

        const handleSnackbarClose = () => {
            setSnackbar({...snackbar, open: false});
        };

        const sendNotification = (id) => {
            const data = {
                rowId: id,
                action: "create",
                to: "wk-cl-tl-rm",
            };

            console.log(data);
            postData("/api/sendShiftNotification", data)
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        // **1. Handle Split Shift Checkbox Change**
        const handleSplitShiftCheckboxChange = (index) => {
            setFormState((prevState) => {
                const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
                const currentSplit = updatedSplitShiftDetails[index];
                const isBeingChecked = !currentSplit.checked;

                if (isBeingChecked) {
                    // Check if previous split is checked and has endTime
                    if (index > 0) {
                        const prevSplit = updatedSplitShiftDetails[index - 1];
                        if (!prevSplit.checked || !prevSplit.endTime) {
                            // Cannot check this split, show a warning
                            setSnackbar({
                                open: true,
                                message: `Cannot enable Split Shift ${index + 1} because Split Shift ${index} is not enabled or has no end time.`,
                                severity: "warning",
                            });
                            return prevState; // No change
                        }
                        // Set startTime based on previous split's endTime
                        currentSplit.startTime = prevSplit.endTime;
                    } else {
                        // First split, set startTime based on shiftStartDate and shiftStartTime
                        if (shiftStartDate && shiftStartTime) {
                            const formattedShiftStart = mergeDateAndTimeLocal(
                                shiftStartDate,
                                shiftStartTime
                            );
                            currentSplit.startTime = formatDateTimeLocal(formattedShiftStart);
                        } else {
                            currentSplit.startTime = null; // Or set to null and show a warning
                            setSnackbar({
                                open: true,
                                message: "Shift Start Date and Time must be set before enabling the first Split Shift.",
                                severity: "warning",
                            });
                            return prevState; // No change
                        }
                    }

                    // Now, set checked to true
                    currentSplit.checked = true;
                } else {
                    // Being unchecked, reset the split's fields
                    currentSplit.service = "";
                    currentSplit.hours = "";
                    currentSplit.startTime = "";
                    currentSplit.endTime = "";
                    currentSplit.chargeRate = "";
                    currentSplit.payRate = "";
                    currentSplit.checked = false;

                    // Reset all subsequent splits
                    for (let i = index + 1; i < updatedSplitShiftDetails.length; i++) {
                        updatedSplitShiftDetails[i] = {
                            splitNo: updatedSplitShiftDetails[i].splitNo,
                            service: "",
                            hours: "",
                            startTime: "",
                            endTime: "",
                            chargeRate: "",
                            payRate: "",
                            checked: false,
                        };
                    }
                }

                // Recalculate pay and charge
                recalculateTotalPayAndCharge(updatedSplitShiftDetails);

                return {
                    ...prevState,
                    splitShiftDetails: updatedSplitShiftDetails,
                };
            });
        };

        // **2. Reset Split Shift Functionality**
        const resetSplitShift = (index) => {
            // Instead of window.confirm, open a confirmation modal
            setResetShiftModal({open: true, index});
        };

        // **3. Handle Shift Hours Change**
        const handleShiftHoursChange = (index, hours) => {
            const parsedHours = parseFloat(hours);
            const validHours = isNaN(parsedHours) ? 0 : parsedHours;

            const newSplitShiftDetails = [...formState.splitShiftDetails];

            // Update the hours for the current shift
            newSplitShiftDetails[index].hours = validHours;

            // Log startTime and hours for debugging
            console.log(
                "startTime:",
                newSplitShiftDetails[index].startTime,
                "hours:",
                validHours
            );

            // Calculate the end time for the current shift
            const currentStartTime = new Date(newSplitShiftDetails[index].startTime);
            if (currentStartTime) {
                const endTime = calculateEndTime(currentStartTime, validHours);
                newSplitShiftDetails[index].endTime = formatDateTimeLocal(endTime);

                // Set the start time for the next shift, if there is a next shift
                if (index + 1 < newSplitShiftDetails.length) {
                    newSplitShiftDetails[index + 1].startTime = formatDateTimeLocal(endTime);
                }

                // After updating hours and endTime, recalculate total pay and charge
                recalculateTotalPayAndCharge(newSplitShiftDetails);
            } else {
                console.error("Start time is not set for shift:", index + 1);
            }

            setFormState((prevState) => ({
                ...prevState,
                splitShiftDetails: newSplitShiftDetails,
            }));
        };

        // Function to recalculate total pay and charge based on split shifts
        const recalculateTotalPayAndCharge = (splitShiftDetails) => {
            let totalPay = 0;
            let totalCharge = 0;

            splitShiftDetails.forEach((shift) => {
                const payRate = parseFloat(shift.payRate) || 0;
                const chargeRate = parseFloat(shift.chargeRate) || 0;
                const hours = parseFloat(shift.hours) || 0;

                if (Number.isFinite(payRate) && Number.isFinite(chargeRate) && Number.isFinite(hours)) {
                    totalPay += payRate * hours;
                    totalCharge += chargeRate * hours;
                }
            });

            setFormState((prevState) => ({
                ...prevState,
                PayRate: parseFloat(totalPay.toFixed(2)), // Ensure it's a number
                ChargeRate: parseFloat(totalCharge.toFixed(2)), // Ensure it's a number
            }));
        };

        // Function to calculate end time based on start time and hours
        const calculateEndTime = (startTime, hours) => {
            const end = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
            return end;
        };

        // Helper function to check if a given date is today
        const isToday = (someDate) => {
            const today = new Date();
            return (
                someDate.getDate() === today.getDate() &&
                someDate.getMonth() === today.getMonth() &&
                someDate.getFullYear() === today.getFullYear()
            );
        };

        // Helper function to get the current time rounded up to the next 5 minutes
        const getRoundedCurrentTime = () => {
            const now = new Date();
            const minutes = now.getMinutes();
            const roundedMinutes = Math.ceil(minutes / 5) * 5;
            now.setMinutes(roundedMinutes, 0, 0);
            return now;
        };

        // **4. Confirmation Modal Handlers**
        const handleConfirmResetSplitShift = () => {
            const {index} = resetShiftModal;
            if (index !== null) {
                setFormState((prevState) => {
                    const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
                    // Reset the current split
                    updatedSplitShiftDetails[index] = {
                        splitNo: updatedSplitShiftDetails[index].splitNo,
                        service: "",
                        hours: "",
                        startTime: "",
                        endTime: "",
                        chargeRate: "",
                        payRate: "",
                        checked: false,
                    };
                    // Reset all subsequent splits
                    for (let i = index + 1; i < updatedSplitShiftDetails.length; i++) {
                        updatedSplitShiftDetails[i] = {
                            splitNo: updatedSplitShiftDetails[i].splitNo,
                            service: "",
                            hours: "",
                            startTime: "",
                            endTime: "",
                            chargeRate: "",
                            payRate: "",
                            checked: false,
                        };
                    }
                    // Recalculate pay and charge
                    recalculateTotalPayAndCharge(updatedSplitShiftDetails);
                    return {...prevState, splitShiftDetails: updatedSplitShiftDetails};
                });

                // Visual feedback
                setSnackbar({
                    open: true,
                    message: `Split Shift ${index + 1} has been reset.`,
                    severity: "info",
                });
            }
            setResetShiftModal({open: false, index: null});
        };

        const handleCancelResetSplitShift = () => {
            setResetShiftModal({open: false, index: null});
        };

        return (
            <>
                {/* Snackbar for Success/Error Messages */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{vertical: "top", horizontal: "center"}} // Positioning the Snackbar
                >
                    <Alert
                        sx={{width: "100%"}}
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            {/* Confirmation Modal for Reset Split Shift */}
            <Dialog
                open={resetShiftModal.open}
                onClose={handleCancelResetSplitShift}
                aria-labelledby="reset-split-shift-confirmation-dialog"
            >
                <DialogTitle id="reset-split-shift-confirmation-dialog">Confirm Reset</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to reset this split shift? Resetting this will reset the following
                        shifts too.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelResetSplitShift} color="secondary"
                            style={{backgroundColor: "yellow", color: "#fff"}}>
                        No
                    </Button>
                    <Button onClick={handleConfirmResetSplitShift} color="primary"
                            style={{backgroundColor: "blue", color: "#fff"}}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

                <Dialog
                    open={showModal}
                    fullWidth
                    maxWidth="lg"
                    onClose={() => setShowModal(false)}
                    contentLabel="Assign Shift"
                >
                    <DialogContent>
                        <Dialog
                            open={showWorkerModal}
                            maxWidth="xs"
                            fullWidth
                            onClose={() => setShowWorkerModal(false)}
                            contentLabel="Worker Availability"
                        >
                            <div style={{padding: "20px", textAlign: "center"}}>
                                <h2 style={{fontSize: "16px", marginBottom: "16px"}}>
                                    Worker Availability
                                </h2>
                                <p style={{fontSize: "14px", marginBottom: "24px"}}>
                                    {workerOutputMessage}
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "10px",
                                    }}
                                >
                                    <button
                                        onClick={handleContinue}
                                        style={{
                                            flex: 1,
                                            backgroundColor: "#4caf50",
                                            color: "#fff",
                                            border: "none",
                                            padding: "8px",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Proceed
                                    </button>
                                    <button
                                        onClick={() => setShowWorkerModal(false)}
                                        style={{
                                            flex: 1,
                                            backgroundColor: "#f44336",
                                            color: "#fff",
                                            border: "none",
                                            padding: "8px",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </Dialog>

                   <div className="relative">
          {/* <div className="absolute inset-x-0 bottom-0 h-px bg-gray-200/50 dark:bg-gray-700/50" /> */}
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }
                  `}
                >
                  <tab.icon className={`h-4 w-4 ${
                    activeTab === tab.id ? 'text-white' : 'text-purple-500'
                  }`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

                    <Form onSubmit={handleSubmit}>
                        {activeTab === "general" && (
                              <div className="">
                              {/* Public Holiday Warning */}
                               <div className="flex flex-row   gap-2 text-amber-700 dark:text-amber-300">
                                  <AlertTriangle className="" />
                                  <p className="text-sm">Red dates indicate public holidays</p>
                                </div>
                              
                        
                              {/* Main Form Content */}
                              <div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
                                {/* Left Column */}
                                <div className="space-y-6 ">
                                  {/* Shift Timing */}
                                  <CategoryBox title="Shift Timing"  icon={CalendarIcon}>
                                    <div className="space-y-4">
                                      {/* Start Date/Time */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Start Date" required>
                                        <DatePicker
                                                    selected={shiftStartDate}
                                                    portalId="root" 
                                                    onChange={handleShiftStartDateChange}
                                                    // className=" fontSize13"
                                                    className="w-full z-50 relative px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    dateFormat="dd/MM/yyyy"
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    minDate={new Date()} // Prevent selecting past dates
                                                    dayClassName={(date) => (isDatePublicHoliday(date) ? styles.publicHoliday : undefined)}
                                                    onCalendarOpen={fetchChkExcldHoliday} // **Fetch the chkExcldHoliday value**
                                                    filterDate={(date) => {
                                                        if (chkExcldHoliday === 0) {
                                                            return true; // All dates selectable, including public holidays
                                                        }

                                                        if (chkExcldHoliday === 1 && isDatePublicHoliday(date)) {
                                                            return false; // Disable public holidays
                                                        }

                                                        return true; // Non-holiday dates are selectable
                                                    }}
                                                    renderCustomHeader={({
                                                                             date,
                                                                             decreaseMonth,
                                                                             increaseMonth,
                                                                             prevMonthButtonDisabled,
                                                                             nextMonthButtonDisabled,
                                                                         }) => (
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            padding: "0.5em"
                                                        }}>
                                                            <button
                                                                type="button"
                                                                onClick={decreaseMonth}
                                                                disabled={prevMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8592; {/* Left Arrow */}
                                                            </button>
                                                            <span>{date.toLocaleString("default", {
                                                                month: "long",
                                                                year: "numeric"
                                                            })}</span>
                                                            <button
                                                                type="button"
                                                                onClick={increaseMonth}
                                                                disabled={nextMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8594; {/* Right Arrow */}
                                                            </button>
                                                        </div>
                                                    )}
                                                />
                                        </FormField>
                        
                                        <FormField label="Start Time" required>
                                        <DatePicker
                                                    selected={shiftStartTime}
                                                    onChange={(time) => setShiftStartTime(time)}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    showTimeSelect
                                                    portalId="root" 
                                                    showTimeSelectOnly
                                                    timeIntervals={5}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="Select Start Time"
                                                    minTime={
                                                        shiftStartDate && isToday(shiftStartDate)
                                                            ? getRoundedCurrentTime()
                                                            : new Date().setHours(0, 0, 0, 0)
                                                    }
                                                    maxTime={new Date().setHours(23, 55, 0, 0)} // Optional: Set maximum time to 11:55 PM
                                                />
                                        </FormField>
                                      </div>
                        
                                      {/* Shift Over Two Days */}
                                      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                        <input
                                          type="checkbox"
                                          id="ShiftOccurOverTwo"
                                          checked={formState.ShiftOccurOverTwo}
                                          onChange={handleFormChange}
                                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                        />
                                        <label htmlFor="ShiftOccurOverTwo" className="text-sm text-gray-700 dark:text-gray-300">
                                          Shift Occurs Over Two Days
                                        </label>
                                      </div>
                        
                                      {/* End Date/Time */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField label="End Date" required>
                                        <DatePicker
                                                    selected={shiftEndDate}
                                                    portalId="root" 
                                                    onChange={handleShiftEndDateChange}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Select End Date"
                                                    minDate={shiftStartDate} // Ensure end date is not before start date
                                                    maxDate={
                                                        shiftStartDate && formState.ShiftOccurOverTwo
                                                            ? new Date(shiftStartDate.getTime() + 24 * 60 * 60 * 1000)
                                                            : shiftStartDate
                                                    }
                                                    disabled={!formState.ShiftOccurOverTwo}
                                                    dayClassName={(date) => (isDatePublicHoliday(date) ? styles.publicHoliday : undefined)}
                                                    onCalendarOpen={fetchChkExcldHoliday} // **Fetch the chkExcldHoliday value**
                                                    filterDate={(date) => {
                                                        // Disable public holidays only if chkExcldHoliday is 1
                                                        if (chkExcldHoliday === 1 && isDatePublicHoliday(date)) {
                                                            return false;
                                                        }
                                                        return true;
                                                    }}
                                                    renderCustomHeader={({
                                                                             date,
                                                                             decreaseMonth,
                                                                             increaseMonth,
                                                                             prevMonthButtonDisabled,
                                                                             nextMonthButtonDisabled,
                                                                         }) => (
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            padding: "0.5em"
                                                        }}>
                                                            <button
                                                                type="button"
                                                                onClick={decreaseMonth}
                                                                disabled={prevMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8592; {/* Left Arrow */}
                                                            </button>
                                                            <span>{date.toLocaleString("default", {
                                                                month: "long",
                                                                year: "numeric"
                                                            })}</span>
                                                            <button
                                                                type="button"
                                                                onClick={increaseMonth}
                                                                disabled={nextMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8594; {/* Right Arrow */}
                                                            </button>
                                                        </div>
                                                    )}
                                                />
                                        </FormField>
                        
                                        <FormField label="End Time" required>
                                        <DatePicker
                                                    selected={shiftEndTime}
                                                    onChange={(date) => setShiftEndTime(date)}
                                                    className="w-full z-50 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    showTimeSelect
                                                    portalId="root" 
                                                    showTimeSelectOnly
                                                    timeIntervals={5}
                                                    timeCaption="End Time"
                                                    dateFormat="h:mm aa"
                                                    filterTime={
                                                        !formState.ShiftOccurOverTwo
                                                            ? (time) => {
                                                                // Disable times before the start time
                                                                if (shiftStartTime) {
                                                                    return time > shiftStartTime;
                                                                }
                                                                return true;
                                                            }
                                                            : undefined // No filter if shiftOccurOverTwo is true
                                                    }
                                                />
                                        </FormField>
                                      </div>
                                    </div>
                                  </CategoryBox>
                        
                                  {/* Service Details */}
                                  <CategoryBox title="Service Details" icon={FileText}>
                                    <div className="space-y-4">
                                      <FormField label="Service" required>
                                        <select
                                          id="ServiceCode"
                                          value={formState.ServiceCode}
                                          onChange={(e) => {
                                            const selectedServiceCode = e.target.value;
                                            handleServiceSelect(selectedServiceCode); // Call the service selection handler
                                            handleFormChange(e); // Call the original form change handler if needed
                                        }}
                                          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                          <option value="">Select Service</option>
                                          {service.map(serv => (
                                            <option key={serv.Service_Code} value={serv.Service_Code}>
                                              {serv.Description}
                                            </option>
                                          ))}
                                        </select>
                                      </FormField>
                        
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Pay Rate">
                                          <div className="relative">
                                            <input
                                              type="number"
                                              value={Number.isFinite(formState.PayRate) ? formState.PayRate.toFixed(2) : "0.00"}
                                              disabled
                                              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50"
                                            />
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                          </div>
                                        </FormField>
                        
                                        <FormField label="Charge Rate">
                                          <div className="relative">
                                            <input
                                              type="number"
                                              value={Number.isFinite(formState.ChargeRate) ? formState.ChargeRate.toFixed(2) : "0.00"}

                                              disabled
                                              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50"
                                            />
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                          </div>
                                          {chargeRateOutput && (
                                            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                                              <Info className="h-4 w-4" />
                                              {chargeRateOutput}
                                            </p>
                                          )}
                                        </FormField>
                                      </div>
                                    </div>
                                  </CategoryBox>
                                </div>
                        
                                {/* Right Column */}
                                <div className="space-y-6">
                                  {/* Worker Assignment */}
                                  <CategoryBox title="Worker Assignment" icon={Users}>
                                    <div className="space-y-4">
                                      <FormField label="Primary Worker" required>
                                        <select
                                          id="SupportWorker1"
                                          value={formState.SupportWorker1}
                                          onChange={handleFormChange}
                                          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                          <option value="UNALLOCATED">Select Worker</option>
                                          {workerOptions.map(worker => (
                                            <option key={worker.value} value={worker.value}>
                                              {worker.label}
                                            </option>
                                          ))}
                                        </select>
                                      </FormField>
                        
                                      {/* Additional Workers */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id="addswrkr"
                                            checked={showAdditionalWorkers}
                                            onChange={() => setShowAdditionalWorkers(!showAdditionalWorkers)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                          />
                                          <label htmlFor="addswrkr" className="text-sm text-gray-700 dark:text-gray-300">
                                            Add Additional Workers
                                          </label>
                                        </div>
                                        
                                        {showAdditionalWorkers && (
                                          <button
                                            onClick={addWorker}
                                            disabled={workerCount >= 4}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                          >
                                            <Plus className="h-4 w-4 text-purple-600" />
                                          </button>
                                        )}
                                      </div>
                        
                                      {showAdditionalWorkers && Array.from({ length: workerCount - 1 }).map((_, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                          <div className="flex-1">
                                            <FormField label={`Additional Worker ${index + 2}`}>
                                              <select
                                                id={`SupportWorker${index + 2}`}
                                                value={formState[`SupportWorker${index + 2}`]}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                              >
                                                <option value="">Select Worker</option>
                                                {allWorkers.map(worker => (
                                                  <option key={worker.WorkerID} value={worker.WorkerID}>
                                                    {worker.FirstName} {worker.LastName}
                                                  </option>
                                                ))}
                                              </select>
                                            </FormField>
                                          </div>
                                          <button
                                            onClick={() => removeWorker(index + 2)}
                                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors mt-6"
                                          >
                                            <Minus className="h-4 w-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </CategoryBox>
                        
                                  {/* Break Settings */}
                                  <CategoryBox title="Break Settings" icon={Coffee}>
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id="ShiftHasBreak"
                                          checked={formState.ShiftHasBreak}
                                          onChange={handleFormChange}
                                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                        />
                                        <label htmlFor="ShiftHasBreak" className="text-sm text-gray-700 dark:text-gray-300">
                                          Shift Has Break
                                        </label>
                                      </div>
                        
                                      {formState.ShiftHasBreak && (
                                        <div className="grid grid-cols-2 gap-4">
                                          <FormField label="Break Start">
                                            <input
                                              label="Break Start"
                                              type="time"
                                            //   className="fontSize13"
                                              id="BreakStart"
                                              value={formState.BreakStart}
                                              onChange={handleFormChange}
                                              className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            />
                                          </FormField>
                        
                                          <FormField label="Break Duration (minutes)">
                                            <input
                                              type="number"
                                              id="BreakDuration"
                                              value={formState.BreakDuration}
                                              onChange={handleFormChange}
                                              min="0"
                                              step="5"
                                              className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            />
                                          </FormField>
                                        </div>
                                      )}
                                    </div>
                                  </CategoryBox>
                        
                                  {/* Additional Settings */}
                                  <CategoryBox title="Additional Settings" icon={Settings}>
                                    <div className="space-y-4">
                                      <FormField label="Roster Category">
                                        <select
                                          id="RosterCategory"
                                          value={formState.RosterCategory}
                                          onChange={handleFormChange}
                                          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                          <option value="">Select Category</option>
                                          {rosterCategory.map(roster => (
                                            <option key={roster.ID} value={roster.ID}>
                                              {roster.Description}
                                            </option>
                                          ))}
                                        </select>
                                      </FormField>
                        
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id="CenterCapitalCosts"
                                            checked={formState.CenterCapitalCosts}
                                            onChange={handleFormChange}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                          />
                                          <label htmlFor="CenterCapitalCosts" className="text-sm text-gray-700 dark:text-gray-300">
                                            Centre Capital Costs
                                          </label>
                                        </div>
                        
                                        <div className="flex items-center gap-2">
                                          
                                          <input
                                            type="checkbox"
                                            id="FixedFeeService"
                                            checked={formState.FixedFeeService}
                                            onChange={handleFormChange}
                                            disabled
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                          />
                                          <label htmlFor="FixedFeeService" className="text-sm text-gray-700 dark:text-gray-300">
                                            Fixed Fee Service
                                          </label>
                                          
                                          <HelpCircle 
                                            className="h-4 w-4 text-gray-400 cursor-help"
                                            data-tip="Fixed rate service with specified charge rate at invoicing. Pay rate still multiplies by hours worked."
                                          />
                                        </div>
                                      </div>
                        
                                      {/* Notes Section */}
                                      <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id="checkNotes"
                                            checked={formState.checkNotes}
                                            onChange={handleFormChange}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                          />
                                          <label htmlFor="checkNotes" className="text-sm text-gray-700 dark:text-gray-300">
                                            Add Notes
                                          </label>
                                        </div>
                        
                                        {formState.checkNotes && (
                                          <>
                                            <FormField label="App Notes">
                                              <textarea
                                                id="AppNote"
                                                value={formState.AppNote}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                rows={3}
                                                placeholder="Notes visible in the app"
                                              />
                                            </FormField>
                        
                                            <FormField label="Private Notes">
                                              <textarea
                                                id="PrivateNote"
                                                value={formState.PrivateNote}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                rows={3}
                                                placeholder="Internal notes"
                                              />
                                            </FormField>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </CategoryBox>
                                </div>
                              </div>
                            </div>
                        )}

                        {/* Split Shift Tab */}
                        {activeTab === "splitShift" && (
                            <div className="space-y-6">
                            {/* Info Alert */}
                            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50">
                              <div className="flex items-center gap-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                In split shifts, Pay and Charge Rates depend on worker schedules and services. Editing them won’t impact time-based calculations.
                                </div>
                              </div>
                            </div>
                      
                            {/* Split Shifts */}
                            <div className="space-y-6">
                              <div className="flex items-center justify-between mb-6">
                                
                                
                              </div>
                      
                              {/* 2x2 Grid Layout */}
                              <CategoryBox title="Split Shift Details" icon={CalendarDays}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formState.splitShiftDetails.map((shift, index) => (
                                  <div 
                                    key={index}
                                    onClick={() => handleCardClick(index)}
                                    className={`relative glass dark:glass-dark rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                                      shift.checked 
                                        ? 'border-purple-500 ring-2 ring-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20' 
                                        : 'border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/50'
                                    }`}
                                  >
                                    {/* Selection Indicator */}
                                    <div className={`absolute top-4 left-4 transition-colors ${
                                      shift.checked ? 'text-purple-600' : 'text-gray-400'
                                    }`}>
                                      
                                    </div>
                      
                                    <div className="p-6">
                                      <div className="space-y-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                        {shift.checked ? (
                                        <CheckCircle2 className="items-center h-6 w-6 " />
                                      ) : (
                                        <Circle className="items-center h-6 w-6" />
                                      )}
                                          <div className={`text-lg mx-2 font-semibold ${
                                            shift.checked 
                                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' 
                                              : 'text-gray-700 dark:text-gray-300'
                                          }`}>
                                            Split {index + 1}
                                          </div>
                                          
                                          </div>

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              resetSplitShift(index);
                                            }}
                                            disabled={!shift.checked}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors disabled:opacity-50"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                            <span className="text-sm">Reset</span>
                                          </button>
                                        </div>
                      
                                        {/* Service Selection */}
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Service
                                          </label>
                                          <select
                                            value={shift.service}
                                            onChange={(e) => handleServiceChange(index, e.target.value)}
                                            disabled={!shift.checked}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <option value="">Select Service</option>
                                            {service.map((serv) => (
                                              <option key={serv.Service_Code} value={serv.Service_Code}>
                                                {serv.Description}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                      
                                        {shift.service && (
                                          <>
                                            {/* Rates */}
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                  Pay Rate
                                                </label>
                                                <div className="relative">
                                                  <input
                                                    type="number"
                                                    value={shift.payRate}
                                                    onChange={(e) => {
                                                      e.stopPropagation();
                                                      const {value} = e.target;
                                                      const parsedValue = parseFloat(value);
                                                      setFormState((prevState) => {
                                                        const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
                                                        updatedSplitShiftDetails[index].payRate = isNaN(parsedValue) ? 0 : parsedValue;
                                                        recalculateTotalPayAndCharge(updatedSplitShiftDetails);
                                                        return {
                                                          ...prevState,
                                                          splitShiftDetails: updatedSplitShiftDetails,
                                                        };
                                                      });
                                                    }}
                                                    disabled={!shift.checked}
                                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                </div>
                                              </div>
                      
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                  Charge Rate
                                                </label>
                                                <div className="relative">
                                                  <input
                                                    type="number"
                                                    value={shift.chargeRate}
                                                    onChange={(e) => {
                                                      e.stopPropagation();
                                                      const {value} = e.target;
                                                      const parsedValue = parseFloat(value);
                                                      setFormState((prevState) => {
                                                        const updatedSplitShiftDetails = [...prevState.splitShiftDetails];
                                                        updatedSplitShiftDetails[index].chargeRate = isNaN(parsedValue) ? 0 : parsedValue;
                                                        recalculateTotalPayAndCharge(updatedSplitShiftDetails);
                                                        return {
                                                          ...prevState,
                                                          splitShiftDetails: updatedSplitShiftDetails,
                                                        };
                                                      });
                                                    }}
                                                    disabled={!shift.checked}
                                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                </div>
                                              </div>
                                            </div>
                      
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Shift Hours
                                              </label>
                                              <div className="relative">
                                                <input
                                                  type="number"
                                                  value={shift.hours}
                                                  onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleShiftHoursChange(index, e.target.value);
                                                  }}
                                                  disabled={!shift.checked}
                                                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                  step="0.5"
                                                  min="0"
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                              </div>
                                            </div>
                      
                                            {/* Times Display */}
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                  Start Time
                                                </label>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                                  {new Date(shift.startTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </div>
                                              </div>
                      
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                  End Time
                                                </label>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                                                  {new Date(shift.endTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </div>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              </CategoryBox>
                            </div>
                      
                            {/* Note */}
                            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
                              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              <div className="text-sm text-amber-700 dark:text-amber-300">
                                Shift end time is ignored on split shifts
                              </div>
                            </div>
                          </div>
                        ) }


                        {/* Shift Repeat Tab */}
                        {activeTab === "repeats" && (
                             <div className={`space-y-8 ${showPreview ? 'filter blur-sm transition-all duration-300' : ''}`}>
                             {/* Repeat Type Selection */}
                             <div className="space-y-6">
                               <div className="flex items-center gap-2 mb-4">
                                 <Repeat className="h-5 w-5 text-purple-500" />
                                 <div className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                   Choose Repeat Pattern
                                 </div>
                               </div>
                       
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {repeatTypes.map((type) => (
                                   <div
                                     key={type.id}
                                     onClick={() => handleTypeSelect(type.id)}
                                     className={`relative group h-[180px] rounded-2xl glass dark:glass-dark border-2 transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02] ${
                                       formState.TYPE === type.id
                                         ? 'border-purple-500 ring-4 ring-purple-500/20'
                                         : 'border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/50'
                                     }`}
                                   >
                                     {/* Background Pattern */}
                                     <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${type.pattern}`} />
                                     
                                     {/* Selection Indicator */}
                                     {formState.TYPE === type.id && (
                                       <div className="absolute top-4 right-4 text-purple-600">
                                         <CheckCircle2 className="h-6 w-6" />
                       
                       </div>
                       )}
                       
                       {/* Content */}
                       <div className="relative h-full p-6 flex flex-col">
                         <div className={`p-3 rounded-xl bg-gradient-to-br ${type.gradient} w-fit mb-4`}>
                           <type.icon className="h-6 w-6 text-white" />
                         </div>
                       
                         <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                           {type.title}
                         </h3>
                       
                         <p className="text-gray-600 dark:text-gray-400 text-sm">
                           {type.description}
                         </p>
                       
                         {/* Selected State Overlay */}
                         {formState.TYPE === type.id && (
                           <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-purple-500/10 to-transparent" />
                         )}
                       </div>
                       </div>
                       ))}
                       </div>
                       
                       {/* Configuration Forms */}
                       {formState.TYPE && (
                       <div className="mt-8 glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                       {/* Daily Configuration */}
                       {formState.TYPE === 'Daily' && (
                       <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Every
                             </label>
                             <div className="flex items-center gap-3">
                               <input
                                 type="number"
                                 id="D_Day"
                                 value={formState.D_Day}
                                 onChange={(e) => setFormState(prev => ({ ...prev, D_Day: e.target.value }))}
                                 min="1"
                                 className="w-24 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                               />
                               <span className="text-gray-600 dark:text-gray-400">day(s)</span>
                             </div>
                           </div>
                         </div>
                       
                         <div className="grid grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End After
                             </label>
                             <input
                               type="number"
                               id="AfterEndNumber"
                               value={formState.AfterEndNumber}
                               onChange={(e) => setFormState(prev => ({ ...prev, AfterEndNumber: e.target.value }))}
                               min="1"
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                       
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End Date
                             </label>
                             <input
                               type="date"
                               id="AfterEndDate"
                               value={formState.AfterEndDate}
                               onChange={(e) => setFormState(prev => ({ ...prev, AfterEndDate: e.target.value }))}
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                         </div>
                       </div>
                       )}
                       
                       {/* Weekly Configuration */}
                       {formState.TYPE === 'Weekly' && (
                       <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Every
                             </label>
                             <div className="flex items-center gap-3">
                               <input
                                 type="number"
                                 id="W_Week"
                                 value={formState.W_Week}
                                 onChange={(e) => setFormState(prev => ({ ...prev, W_Week: e.target.value }))}
                                 min="1"
                                 className="w-24 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                               />
                               <span className="text-gray-600 dark:text-gray-400">week(s)</span>
                             </div>
                           </div>
                         </div>
                       
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                             Repeat on
                           </label>
                           <div className="flex flex-wrap gap-2">
                             {weekDays.map((day, index) => (
                               <button
                                 key={day}
                                 onClick={() => setFormState(prev => ({ ...prev, [day]: !prev[day] }))}
                                 className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                                   formState[day]
                                     ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                     : 'glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:border-purple-500/50'
                                 }`}
                               >
                                 {weekDayLabels[index]}
                               </button>
                             ))}
                           </div>
                         </div>
                       
                         <div className="grid grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End After
                             </label>
                             <input
                               type="number"
                               id="AfterEndNumber"
                               value={formState.AfterEndNumber}
                               onChange={(e) => setFormState(prev => ({ ...prev, AfterEndNumber: e.target.value }))}
                               min="1"
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                       
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End Date
                             </label>
                             <input
                               type="date"
                               id="AfterEndDate"
                               value={formState.AfterEndDate}
                               onChange={(e) => setFormState(prev => ({ ...prev, AfterEndDate: e.target.value }))}
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                         </div>
                       </div>
                       )}
                       
                       {/* Monthly Configuration */}
                       {formState.TYPE === 'Monthly' && (
                       <div className="space-y-6">
                         <div className="grid grid-cols-3 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Every
                             </label>
                             <select
                               value={formState.monthlyOccurrence}
                               onChange={e => setFormState(prev => ({ ...prev, monthlyOccurrence: e.target.value }))}
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             >
                               <option value="1">First</option>
                               <option value="2">Second</option>
                               <option value="3">Third</option>
                               <option value="4">Fourth</option>
                               <option value="-1">Last</option>
                             </select>
                           </div>
                       
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Day
                             </label>
                             <select
                               value={formState.monthlyDay}
                               onChange={e => setFormState(prev => ({ ...prev, monthlyDay: e.target.value }))}
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             >
                               {weekDays.map((day, index) => (
                                 <option key={day} value={index + 1}>
                                   {weekDayLabels[index]}
                                 </option>
                               ))}
                             </select>
                           </div>
                       
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Month
                             </label>
                             <input
                               type="number"
                               value={formState.monthlyInterval}
                               onChange={e => setFormState(prev => ({ ...prev, monthlyInterval: e.target.value }))}
                               min="1"
                               max="12"
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                         </div>
                       
                         <div className="grid grid-cols-2 gap-6">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End After
                             </label>
                             <input
                               type="number"
                               id="AfterEndNumber"
                               value={formState.AfterEndNumber}
                               onChange={(e) => setFormState(prev => ({ ...prev, AfterEndNumber: e.target.value }))}
                               min="1"
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                       
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End Date
                             </label>
                             <input
                               type="date"
                               id="AfterEndDate"
                               value={formState.AfterEndDate}
                               onChange={(e) => setFormState(prev => ({ ...prev, AfterEndDate: e.target.value }))}
                               className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                             />
                           </div>
                         </div>
                       </div>
                       )}
                       </div>
                       )}
                       </div>
                       </div>
                        )}

                        {/* Submit and Cancel Buttons */}
                        <Row>
                            <Col
                            className="mt-4"
                                style={{ justifyContent: "flex-end", display: "flex" }}
                                sm={12}
                            >
                                {activeTab === "repeats" && formState.TYPE && (
                                     <MButton
                                         variant="secondary"
                                         ref={buttonRef}
                                         onClick={handleTogglePreview}
                                         className="flex  items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                                         label={"Preview"}
                                         style={{
                                             backgroundColor: "red",
                                             fontSize: "12px",
                                             textTransform: "none",
                                             color: "white",
                                             marginRight: "10px",
                                         }}
                                     >
                                         <FaEye style={{ marginRight: "5px" }} />
                                     </MButton>
                                )}
                                <button
                                    // variant="secondary"
                                    onClick={() => {
                                        clearForm();
                                        setShowModal(false);
                                    }}
                                    // label={"Cancel"}
                                    // size={"small"}
                                    className="flex mx-2 items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
            
                                ><XCircle className="h-4 w-4" />
              <span>Cancel</span></button>

                                <button
                                onClick={handleSubmit}
                                    // variant="primary"
                                    // type="submit"
                                    // label={isEditMode ? "Update" : "Submit"} // Change label based on mode
                                    // size={"small"}
                                    // // Remove the `disabled` prop
                                    // style={{
                                    //     backgroundColor: isSubmitDisabled || disableSubmit ? "gray" : "blue",
                                    //     fontSize: "12px",
                                    //     textTransform: "none",
                                    //     color: isSubmitDisabled || disableSubmit ? "black" : "white",
                                    //     cursor: isSubmitDisabled || disableSubmit ? "not-allowed" : "pointer",
                                    //     opacity: isSubmitDisabled || disableSubmit || isSubmitting ? 0.6 : 1, // Optional: reduce opacity for disabled state
                                    // }}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
            
                                >
                                    {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{data ? 'Update' : 'Create'} Shift</span>
                </>)}
                                </button>


                                {showPreview && (
                                    <Card
                                        ref={cardRef}
                                        style={{
                                            position: "fixed",
                                            bottom: "110px",
                                            right: "410px",
                                            width: "300px",
                                            zIndex: 1000,
                                        }}
                                    >
                                        <Card.Header>Preview</Card.Header>
                                        <Card.Body>
                                            <Calendar
                                                tileContent={({ date, view }) => {
                                                    if (view === "month") {
                                                        const dateString = dayjs(date).format("YYYY-MM-DD");
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
                            </Col>
                        </Row>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
    return (
        <>
            {/* Snackbar for Success/Error Messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }} // Positioning the Snackbar
            >
                <Alert
                    sx={{ width: "100%" }}
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Confirmation Modal for Reset Split Shift */}
            <Dialog
                open={resetShiftModal.open}
                onClose={handleCancelResetSplitShift}
                aria-labelledby="reset-split-shift-confirmation-dialog"
            >
                <DialogTitle id="reset-split-shift-confirmation-dialog">Confirm Reset</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to reset this split shift? Resetting this will reset the following
                        shifts too.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelResetSplitShift} color="secondary"
                            style={{backgroundColor: "yellow", color: "#fff"}}>
                        No
                    </Button>
                    <Button onClick={handleConfirmResetSplitShift} color="primary"
                            style={{backgroundColor: "blue", color: "#fff"}}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showModal}
                fullWidth
                maxWidth="lg"
                onClose={() => setShowModal(false)}
                contentLabel="Assign Shift"
            >
                <DialogContent>
                    <Dialog
                        open={showWorkerModal}
                        maxWidth="xs"
                        fullWidth
                        onClose={() => setShowWorkerModal(false)}
                        contentLabel="Worker Availability"
                    >
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>
                                Worker Availability
                            </h2>
                            <p style={{ fontSize: "14px", marginBottom: "24px" }}>
                                {workerOutputMessage}
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                }}
                            >
                                <button
                                    onClick={handleContinue}
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#4caf50",
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Proceed
                                </button>
                                <button
                                    onClick={() => setShowWorkerModal(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#f44336",
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Dialog>

                   <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gray-200/50 dark:bg-gray-700/50" />
          
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }
                  `}
                >
                  <tab.icon className={`h-4 w-4 ${
                    activeTab === tab.id ? 'text-white' : 'text-purple-500'
                  }`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

                        <Form onSubmit={handleSubmit}>
                            {activeTab === "general" && (
                                <Row>
                                    <Row>
                                        <Col>
                                            <Typography variant="h6" className={styleFont.fontSize13}>
                                                {isEditMode ? "Edit Shift" : "Create Shift"}
                                            </Typography>
                                        </Col>
                                    </Row>
                                    <Col style={{padding: "15px 15px"}}>
                                        <Row>
                                            <p style={{color: 'red', fontSize: '12px'}}>* Red Dates are for public
                                                holidays</p>
                                        </Row>
                                        {/* Shift Start */}
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col sm={3}>
                                                <Typography
                                                    variant="subtitle1"
                                                    className={styleFont.fontSize13}
                                                >
                                                    Shift Start
                                                </Typography>
                                            </Col>
                                            <Col sm={4}>
                                                <DatePicker
                                                    selected={shiftStartDate}
                                                    onChange={handleShiftStartDateChange}
                                                    value={formState.ShiftStartDateTime}
                                                    className="form-control fontSize13"
                                                    dateFormat="dd/MM/yyyy"
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    minDate={new Date()} // Prevent selecting past dates
                                                    dayClassName={(date) => (isDatePublicHoliday(date) ? styles.publicHoliday : undefined)}
                                                    onCalendarOpen={fetchChkExcldHoliday} // **Fetch the chkExcldHoliday value**
                                                    filterDate={(date) => {
                                                        if (chkExcldHoliday === 0) {
                                                            return true; // All dates selectable, including public holidays
                                                        }

                                                        if (chkExcldHoliday === 1 && isDatePublicHoliday(date)) {
                                                            return false; // Disable public holidays
                                                        }

                                                        return true; // Non-holiday dates are selectable
                                                    }}
                                                    renderCustomHeader={({
                                                                             date,
                                                                             decreaseMonth,
                                                                             increaseMonth,
                                                                             prevMonthButtonDisabled,
                                                                             nextMonthButtonDisabled,
                                                                         }) => (
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            padding: "0.5em"
                                                        }}>
                                                            <button
                                                                type="button"
                                                                onClick={decreaseMonth}
                                                                disabled={prevMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8592; {/* Left Arrow */}
                                                            </button>
                                                            <span>{date.toLocaleString("default", {
                                                                month: "long",
                                                                year: "numeric"
                                                            })}</span>
                                                            <button
                                                                type="button"
                                                                onClick={increaseMonth}
                                                                disabled={nextMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
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
                                                    onChange={(time) => setShiftStartTime(time)}
                                                    className="form-control fontSize13"
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={5}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="Select Start Time"
                                                    minTime={
                                                        shiftStartDate && isToday(shiftStartDate)
                                                            ? getRoundedCurrentTime()
                                                            : new Date().setHours(0, 0, 0, 0)
                                                    }
                                                    maxTime={new Date().setHours(23, 55, 0, 0)} // Optional: Set maximum time to 11:55 PM
                                                />
                                            </Col>
                                        </Row>

                                        {/* Shift Occur Over Two Days */}
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col md={5}>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="ShiftOccurOverTwo"
                                                    label={
                                                        <span className={styleFont.fontSize13}>
                                                        Shift Occur Over 2 Days
                                                    </span>
                                                    }
                                                    checked={formState.ShiftOccurOverTwo}
                                                    onChange={handleFormChange}
                                                />
                                            </Col>
                                        </Row>

                                        {/* Shift End */}
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col sm={3}>
                                                <Typography
                                                    variant="subtitle1"
                                                    className={styleFont.fontSize13}
                                                >
                                                    Shift End
                                                </Typography>
                                            </Col>
                                            <Col sm={4}>
                                                <DatePicker
                                                    selected={shiftEndDate}
                                                    onChange={handleShiftEndDateChange}
                                                    className="form-control fontSize13"
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Select End Date"
                                                    minDate={shiftStartDate} // Ensure end date is not before start date
                                                    maxDate={
                                                        shiftStartDate && formState.ShiftOccurOverTwo
                                                            ? new Date(shiftStartDate.getTime() + 24 * 60 * 60 * 1000)
                                                            : shiftStartDate
                                                    }
                                                    disabled={!formState.ShiftOccurOverTwo}
                                                    dayClassName={(date) => (isDatePublicHoliday(date) ? styles.publicHoliday : undefined)}
                                                    onCalendarOpen={fetchChkExcldHoliday} // **Fetch the chkExcldHoliday value**
                                                    filterDate={(date) => {
                                                        // Disable public holidays only if chkExcldHoliday is 1
                                                        if (chkExcldHoliday === 1 && isDatePublicHoliday(date)) {
                                                            return false;
                                                        }
                                                        return true;
                                                    }}
                                                    renderCustomHeader={({
                                                                             date,
                                                                             decreaseMonth,
                                                                             increaseMonth,
                                                                             prevMonthButtonDisabled,
                                                                             nextMonthButtonDisabled,
                                                                         }) => (
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            padding: "0.5em"
                                                        }}>
                                                            <button
                                                                type="button"
                                                                onClick={decreaseMonth}
                                                                disabled={prevMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8592; {/* Left Arrow */}
                                                            </button>
                                                            <span>{date.toLocaleString("default", {
                                                                month: "long",
                                                                year: "numeric"
                                                            })}</span>
                                                            <button
                                                                type="button"
                                                                onClick={increaseMonth}
                                                                disabled={nextMonthButtonDisabled}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize: "16px",
                                                                }}
                                                            >
                                                                &#8594; {/* Right Arrow */}
                                                            </button>
                                                        </div>
                                                    )}
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
                                                    timeCaption="End Time"
                                                    dateFormat="h:mm aa"
                                                    filterTime={
                                                        !formState.ShiftOccurOverTwo
                                                            ? (time) => {
                                                                // Disable times before the start time
                                                                if (shiftStartTime) {
                                                                    return time > shiftStartTime;
                                                                }
                                                                return true;
                                                            }
                                                            : undefined // No filter if shiftOccurOverTwo is true
                                                    }
                                                />
                                            </Col>
                                        </Row>

                                        <Row style={{marginBottom: "25px", alignItems: "center"}}>
                                            <Col md={3}>
                                                <Typography variant="subtitle1" className={styleFont.fontSize13}>
                                                    Service
                                                </Typography>
                                            </Col>
                                            <Col md={8}>
                                                <InputField
                                                    id="ServiceCode"
                                                    label="Service Code"
                                                    className={styleFont.fontSize13}
                                                    type="select"
                                                    disabled={false}
                                                    options={[
                                                        ...service.map((serv) => ({
                                                            value: serv.Service_Code,
                                                            label: serv.Description,
                                                        })),
                                                    ]}
                                                    value={formState.ServiceCode}
                                                    onChange={(e) => {
                                                        const selectedServiceCode = e.target.value;
                                                        handleServiceSelect(selectedServiceCode); // Call the service selection handler
                                                        handleFormChange(e); // Call the original form change handler if needed
                                                    }}
                                                />
                                            </Col>
                                        </Row>

                                        <Row style={{marginBottom: "25px", alignItems: "center"}}>
                                            <Col md={3}>
                                                <Typography variant="subtitle1" className={styleFont.fontSize13}>
                                                    Rate
                                                </Typography>
                                            </Col>
                                            <Col md={4}>
                                                <InputField
                                                    label="Pay Rate"
                                                    type="number"
                                                    id="PayRate"
                                                    disabled
                                                    className="fontSize13"
                                                    value={Number.isFinite(formState.PayRate) ? formState.PayRate.toFixed(2) : "0.00"}
                                                />
                                            </Col>

                                            <Col md={4}>
                                                <InputField
                                                    label="Charge Rate"
                                                    type="number"
                                                    id="ChargeRate"
                                                    disabled
                                                    className="fontSize13"
                                                    value={Number.isFinite(formState.ChargeRate) ? formState.ChargeRate.toFixed(2) : "0.00"}
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


                                        {/* Select Worker */}
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col sm={3}>
                                                <Typography
                                                    variant="subtitle1"
                                                    className={styleFont.fontSize13}
                                                >
                                                    Select Worker
                                                </Typography>
                                            </Col>
                                            <Col md={8}>
                                                <InputField
                                                    id="SupportWorker1"
                                                    label="Support Worker"
                                                    type="select"
                                                    className="fontSize13"
                                                    value={formState.SupportWorker1}
                                                    onChange={handleFormChange}
                                                    options={workerOptions} // Use the updated options
                                                />
                                            </Col>
                                        </Row>

                                        {/* Shift Has Break */}
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col md={3}>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="ShiftHasBreak"
                                                    label={
                                                        <span className={styleFont.fontSize13}>
                                                        Shift Has Break
                                                    </span>
                                                    }
                                                    checked={formState.ShiftHasBreak}
                                                    onChange={handleFormChange}
                                                />
                                            </Col>

                                            <Col>
                                                {formState.ShiftHasBreak && (
                                                    <>
                                                        <Row>
                                                            <Col md={5}>
                                                                <LocalizationProvider
                                                                    dateAdapter={AdapterDayjs}
                                                                >
                                                                    <InputField
                                                                        label="Break Start"
                                                                        type="time"
                                                                        className="fontSize13"
                                                                        id="BreakStart"
                                                                        value={formState.BreakStart}
                                                                        onChange={handleFormChange}
                                                                    />
                                                                </LocalizationProvider>
                                                            </Col>
                                                            <Col md={5}>
                                                                <InputField
                                                                    label="Break Duration (minutes)"
                                                                    type="number"
                                                                    id="BreakDuration"
                                                                    className="fontSize13"
                                                                    value={formState.BreakDuration}
                                                                    onChange={handleFormChange}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </>
                                                )}
                                            </Col>
                                        </Row>

                                        {/* Add Additional Workers */}
                                    </Col>
                                    {/* Left side end */}

                                    {/* Right side start */}
                                    <Col style={{padding: "15px 15px"}}>
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col md={4}>
                                                {/* Commented for now may use in future */}
                                                {/* <InputField
                        label="Order / Request Number"
                        type="text"
                        className="fontSize13"
                        id="OrderNumber"
                        value={formState.OrderNumber}
                        onChange={handleFormChange}
                        style={{ margin: 0 }}
                      /> */}
                                            </Col>
                                            <Col md={4}>
                                                <InputField
                                                    id="RosterCategory"
                                                    label="Roster Category"
                                                    type="select"
                                                    className="fontSize13"
                                                    options={rosterCategory.map((roster) => ({
                                                        value: roster.ID,
                                                        label: roster.Description,
                                                    }))}
                                                    value={formState.RosterCategory}
                                                    onChange={handleFormChange}
                                                />
                                            </Col>
                                        </Row>

                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col md={4}>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="CenterCapitalCosts"
                                                    label={
                                                        <span className="fontSize13">
                                                        Centre Capital Cost
                                                    </span>
                                                    }
                                                    checked={formState.CenterCapitalCosts}
                                                    onChange={handleFormChange}
                                                />
                                                {cccOutput ? (
                                                    <Typography variant="subtitle1" className={styleFont.fontSize13}>
                                                        {cccOutput}
                                                    </Typography>
                                                ) : null}
                                            </Col>
                                            <Col md={4}>
                                                <Tooltip
                                                    title={
                                                        <span className="fontSize13">
                                                        Fixed will mean that the charge rate is fixed at
                                                        the rate specified at the same time of invoicing
                                                        <br/>
                                                        <br/>
                                                        The Pay Rate will still be multiplied by the
                                                        hours worked when exporting timesheets.
                                                    </span>
                                                    }
                                                    arrow
                                                    placement="bottom-start"
                                                >
                                                    <Form.Check
                                                        type="checkbox"
                                                        id="FixedFeeService"
                                                        label={<span className="fontSize13">Fixed Fee</span>}
                                                        checked={formState.FixedFeeService}
                                                        onChange={handleFormChange}
                                                        disabled
                                                    />
                                                </Tooltip>
                                            </Col>
                                        </Row>

                                        {/* Notes Section */}
                                        <Row
                                            style={{marginBottom: "25px", alignItems: "center"}}
                                        >
                                            <Col md={4}>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="checkNotes"
                                                    label={<span className="fontSize13">Notes</span>}
                                                    checked={formState.checkNotes}
                                                    onChange={handleFormChange}
                                                />
                                            </Col>
                                        </Row>

                                        {formState.checkNotes && (
                                            <>
                                                <Col>
                                                    <InputField
                                                        type="textarea"
                                                        id="AppNote"
                                                        label="Notes - This flows through to app"
                                                        value={formState.AppNote}
                                                        onChange={handleFormChange}
                                                        className="fontSize13"
                                                    />
                                                </Col>
                                                <Col style={{marginTop: "25px"}}>
                                                    <InputField
                                                        type="textarea"
                                                        id="PrivateNote"
                                                        label="Notes - Private"
                                                        value={formState.PrivateNote}
                                                        onChange={handleFormChange}
                                                        className="fontSize13"
                                                    />
                                                </Col>
                                            </>
                                        )}

                                        <Row
                                            style={{
                                                marginTop: "25px",
                                                marginBottom: "25px",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Col md={4}>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="addswrkr"
                                                    className="fontSize13"
                                                    label="Add Additional Workers"
                                                    checked={showAdditionalWorkers}
                                                    onChange={() =>
                                                        setShowAdditionalWorkers(!showAdditionalWorkers)
                                                    }
                                                />
                                            </Col>

                                            {showAdditionalWorkers && (
                                                <>
                                                    {/* Support Worker 2 (first additional worker) */}
                                                    <Col md={4}>
                                                        <InputField
                                                            id="SupportWorker2"
                                                            label="Support Worker 2"
                                                            type="select"
                                                            className="fontSize13"
                                                            options={allWorkers.map((worker) => ({
                                                                value: worker.WorkerID,
                                                                label: worker.FirstName,
                                                            }))}
                                                            value={formState.SupportWorker2}
                                                            onChange={handleFormChange}
                                                        />
                                                    </Col>

                                                    {/* Trash button for Support Worker 2 */}
                                                    <Col
                                                        md={1}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <Tooltip title="Remove Support Worker">
                                                            <Button
                                                                style={{
                                                                    backgroundColor: "red",
                                                                    border: "none",
                                                                }}
                                                                onClick={() => removeWorker(2)}
                                                                size="sm"
                                                                disabled={formState.SupportWorker2 === "UNALLOCATED"}
                                                            >
                                                                <FaTrash/>
                                                            </Button>
                                                        </Tooltip>
                                                    </Col>

                                                    {/* Button to add additional workers */}
                                                    <Col
                                                        md={3}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <MButton
                                                            variant="contained"
                                                            style={{
                                                                fontSize: "13px",
                                                                textTransform: "capitalize",
                                                                backgroundColor: "blue",
                                                            }}
                                                            label={"Add Worker"}
                                                            size={"small"}
                                                            onClick={addWorker}
                                                            disabled={workerCount >= 4}
                                                        />
                                                    </Col>
                                                </>
                                            )}
                                        </Row>

                                        {/* Dynamically added workers (Support Worker 3, Support Worker 4, etc.) */}
                                        {showAdditionalWorkers &&
                                            workerCount > 2 &&
                                            [...Array(workerCount - 2)].map((_, index) => (
                                                <Row
                                                    style={{
                                                        marginBottom: "25px",
                                                        alignItems: "center",
                                                    }}
                                                    key={index}
                                                >
                                                    <Col md={4}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            className={styleFont.fontSize13}
                                                        >
                                                            Support Worker {index + 3}
                                                        </Typography>
                                                    </Col>
                                                    <Col md={4}>
                                                        <InputField
                                                            id={`SupportWorker${index + 3}`}
                                                            label={`Support Worker ${index + 3}`}
                                                            type="select"
                                                            className="fontSize13"
                                                            options={allWorkers.map((worker) => ({
                                                                value: worker.WorkerID,
                                                                label: worker.FirstName,
                                                            }))}
                                                            value={formState[`SupportWorker${index + 3}`]}
                                                            onChange={handleFormChange}
                                                        />
                                                    </Col>
                                                    <Col
                                                        md={2}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <Tooltip title={`Remove Support Worker ${index + 3}`}>
                                                            <Button
                                                                style={{
                                                                    backgroundColor: "red",
                                                                    border: "none",
                                                                }}
                                                                onClick={() => removeWorker(index + 3)}
                                                                size="sm"
                                                                disabled={formState[`SupportWorker${index + 3}`] === "UNALLOCATED"}
                                                            >
                                                                <FaTrash/>
                                                            </Button>
                                                        </Tooltip>
                                                    </Col>
                                                </Row>
                                            ))}
                                    </Col>
                                </Row>
                            )}

                        {/* Split Shift Tab */}
                        {activeTab === "splitShift" && (
                            <Row style={{ justifyContent: "center" }}>
                                <Col md={12}>
                                    {/* Informational Notice */}
                                    <Row>
                                        <Col>
                                            <Alert severity="info" className="fontSize13">
                                                In split shifts, the Pay Rate and Charge Rate are based on
                                                worker schedules and services. Editing these rates will not
                                                affect calculations based on shift timing or duration.
                                            </Alert>
                                        </Col>
                                    </Row>

                                        {formState.splitShiftDetails.map((shift, index) => (
                                            <Row
                                                key={index}
                                                className="justify-content-center"
                                                style={{marginBottom: "20px"}}
                                            >
                                                {/* Shift Checkbox */}
                                                <Col md={1}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={`Shift ${index + 1}`}
                                                        checked={shift.checked}
                                                        className="fontSize13"
                                                        onChange={() => handleSplitShiftCheckboxChange(index)}
                                                    />
                                                </Col>

                                                {/* Service Selection */}
                                                <Col md={3}>
                                                    <InputField
                                                        id={`shiftSelect-${index}`}
                                                        label="Select Service"
                                                        type="select"
                                                        className="fontSize13"
                                                        options={service.map((serv) => ({
                                                            value: serv.Service_Code,
                                                            label: serv.Description,
                                                        }))}
                                                        value={shift.service}
                                                        onChange={(e) =>
                                                            handleServiceChange(index, e.target.value)
                                                        }
                                                        disabled={!shift.checked} // Disable if shift not checked
                                                    />
                                                    {shift.service && (
                                                        <Row className="mt-2">
                                                            {/* Editable Pay Rate */}
                                                            <Col>
                                                                <InputField
                                                                    label="Pay Rate"
                                                                    type="number"
                                                                    id={`splitShiftDetails-${index}-payRate`}
                                                                    className="fontSize13"
                                                                    value={shift.payRate}
                                                                    onChange={(e) => {
                                                                        const {value} = e.target;
                                                                        const parsedValue = parseFloat(value);
                                                                        setFormState((prevState) => {
                                                                            const updatedSplitShiftDetails = [
                                                                                ...prevState.splitShiftDetails,
                                                                            ];
                                                                            updatedSplitShiftDetails[index].payRate =
                                                                                isNaN(parsedValue) ? 0 : parsedValue;
                                                                            // Recalculate total pay and charge
                                                                            recalculateTotalPayAndCharge(updatedSplitShiftDetails);
                                                                            return {
                                                                                ...prevState,
                                                                                splitShiftDetails: updatedSplitShiftDetails,
                                                                            };
                                                                        });
                                                                    }}
                                                                    disabled={!shift.checked}
                                                                />
                                                            </Col>
                                                            {/* Editable Charge Rate */}
                                                            <Col>
                                                                <InputField
                                                                    label="Charge Rate"
                                                                    type="number"
                                                                    id={`splitShiftDetails-${index}-chargeRate`}
                                                                    className="fontSize13"
                                                                    value={shift.chargeRate}
                                                                    onChange={(e) => {
                                                                        const {value} = e.target;
                                                                        const parsedValue = parseFloat(value);
                                                                        setFormState((prevState) => {
                                                                            const updatedSplitShiftDetails = [
                                                                                ...prevState.splitShiftDetails,
                                                                            ];
                                                                            updatedSplitShiftDetails[index].chargeRate =
                                                                                isNaN(parsedValue) ? 0 : parsedValue;
                                                                            // Recalculate total pay and charge
                                                                            recalculateTotalPayAndCharge(updatedSplitShiftDetails);
                                                                            return {
                                                                                ...prevState,
                                                                                splitShiftDetails: updatedSplitShiftDetails,
                                                                            };
                                                                        });
                                                                    }}
                                                                    disabled={!shift.checked}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )}
                                                </Col>

                                                {/* Shift Hours and Times */}
                                                <Col md={3}>
                                                    <InputField
                                                        id={`shiftLength-${index}`}
                                                        label="Shift (hours)"
                                                        type="number"
                                                        className="fontSize13"
                                                        value={shift.hours}
                                                        onChange={(e) =>
                                                            handleShiftHoursChange(index, e.target.value)
                                                        }
                                                        disabled={!shift.checked}
                                                    />
                                                    {shift.hours && (
                                                        <Row>
                                                            <Col>
                                                                <p className="fontSize13">
                                                                    Start:{" "}
                                                                    {new Date(shift.startTime).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </p>
                                                            </Col>
                                                            <Col>
                                                                <p className="fontSize13">
                                                                    End:{" "}
                                                                    {new Date(shift.endTime).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </p>
                                                            </Col>
                                                        </Row>
                                                    )}
                                                </Col>

                                                {/* 3. Reset Button Column with UX Enhancements */}
                                                <Col md={1} className="d-flex align-items-center">
                                                    <Tooltip title="Reset Split Shift">
                                                    <span>
                                                        <Button
                                                            variant="link"
                                                            onClick={() => resetSplitShift(index)}
                                                            style={{color: "red"}}
                                                            title="Reset Split Shift"
                                                            disabled={!shift.checked} // Disable if shift not checked
                                                        >
                                                            <FaUndo/>
                                                        </Button>
                                                    </span>
                                                    </Tooltip>
                                                </Col>
                                            </Row>
                                        ))}
                                        <Row className="justify-content-center">
                                            <Col className="text-center">
                                                <Typography sx={{fontSize: "0.7rem"}}>
                                                    *Shift end time is ignored on split shifts
                                                </Typography>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            )}


                            {/* Shift Repeat Tab */}
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
                                                            checked={formState.selectedOption1 === "firstOption"}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormState({
                                                                        ...formState,
                                                                        selectedOption1: "firstOption",
                                                                        M_Occurance: "",
                                                                        M_Occ_Day: "",
                                                                        M_Occ_Month: "",
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
                                                            disabled={formState.selectedOption1 !== "firstOption"}
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
                                                            disabled={formState.selectedOption1 !== "firstOption"}
                                                        />
                                                    </Col>
                                                    <Col sm={3}>
                                                        <InputField
                                                            label="Month"
                                                            id="M_Month"
                                                            type="number"
                                                            value={formState.M_Month || ""}
                                                            onChange={handleFormChange}
                                                            disabled={formState.selectedOption1 !== "firstOption"}
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
                                                            checked={formState.selectedOption1 === "secondOption"}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormState({
                                                                        ...formState,
                                                                        selectedOption1: "secondOption",
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
                                                            disabled={formState.selectedOption1 !== "secondOption"}
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
                                                            disabled={formState.selectedOption1 !== "secondOption"}
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

                        {/* Submit and Cancel Buttons */}
                        <Row>
                            <Col
                                style={{ justifyContent: "flex-end", display: "flex" }}
                                sm={12}
                            >
                                {activeTab === "repeats" && formState.TYPE && (
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
                                        <FaEye style={{ marginRight: "5px" }} />
                                    </MButton>
                                )}
                                <button
                                    // variant="secondary"
                                    onClick={() => {
                                        clearForm();
                                        setShowModal(false);
                                    }}
                                    // label={"Cancel"}
                                    // size={"small"}
                                    className="flex mx-2 items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
            
                                ><XCircle className="h-4 w-4" />
              <span>Cancel</span></button>

                                <button
                                onClick={handleSubmit}
                                    // variant="primary"
                                    // type="submit"
                                    // label={isEditMode ? "Update" : "Submit"} // Change label based on mode
                                    // size={"small"}
                                    // // Remove the `disabled` prop
                                    // style={{
                                    //     backgroundColor: isSubmitDisabled || disableSubmit ? "gray" : "blue",
                                    //     fontSize: "12px",
                                    //     textTransform: "none",
                                    //     color: isSubmitDisabled || disableSubmit ? "black" : "white",
                                    //     cursor: isSubmitDisabled || disableSubmit ? "not-allowed" : "pointer",
                                    //     opacity: isSubmitDisabled || disableSubmit || isSubmitting ? 0.6 : 1, // Optional: reduce opacity for disabled state
                                    // }}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
            
                                >
                                    {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{data ? 'Update' : 'Create'} Shift</span>
                </>)}
                                </button>


                                    {showPreview && (
                                        <Card
                                            ref={cardRef}
                                            style={{
                                                position: "fixed",
                                                bottom: "110px",
                                                right: "410px",
                                                width: "300px",
                                                zIndex: 1000,
                                            }}
                                        >
                                            <Card.Header>Preview</Card.Header>
                                            <Card.Body>
                                                <Calendar
                                                    tileContent={({date, view}) => {
                                                        if (view === "month") {
                                                            const dateString = dayjs(date).format("YYYY-MM-DD");
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
                                </Col>
                            </Row>
                        </Form>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
;

export default AssignShiftModal;


// Select Popup

// <Dialog
//       open={show}
//       onClose={onHide}
//       fullWidth
//       maxWidth="md"
//     >
//       <div className="relative">
//         <PatternBackground />
        
//         <div className="p-6">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 Select Client
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Choose a client and roster to proceed
//               </p>
//             </div>
//             <button
//               onClick={onHide}
//               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
//             >
//               <X className="h-5 w-5 text-gray-500" />
//             </button>
//           </div>

//           {/* Search - Optional */}
//           <div className="relative mb-6">
//             <input
//               type="text"
//               placeholder="Search by client name or ID..."
//               className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
//             />
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>

//           {/* Client List */}
//           <div className="max-h-[400px] overflow-y-auto">
//             {filteredClients.length > 0 ? (
//               <div className="space-y-4">
//                 {filteredClients.map((client) => (
//                   <div
//                     key={client.ClientID}
//                     className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div>
//                         <h3 className="font-medium text-gray-900 dark:text-white">
//                           {client.FirstName} {client.LastName}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Client ID: {client.ClientID}
//                         </p>
//                       </div>
//                       <div className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
//                         {client.shiftCount} Shifts
//                       </div>
//                     </div>

//                     {/* Roster Selection */}
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Select Roster
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {client.RosterIDs.length > 0 ? (
//                           client.RosterIDs.map((roster) => (
//                             <button
//                               key={roster.RosterID}
//                               onClick={() => handleClientRosterSelect(client, roster.RosterID)}
//                               className="px-3 py-1 rounded-lg text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90 transition-opacity flex items-center gap-2"
//                             >
//                               <Calendar className="h-4 w-4" />
//                               {roster.RosterID}
//                             </button>
//                           ))
//                         ) : (
//                           <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
//                             <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
//                             <span className="text-sm text-amber-700 dark:text-amber-300">
//                               No Rosters Available
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <div className="relative w-24 h-24 mb-4">
//                   <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse" />
//                   <div className="absolute inset-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
//                   <div className="absolute inset-8 bg-gradient-to-bl from-purple-600/20 to-pink-600/20 rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <Users className="h-10 w-10 text-purple-500/50" />
//                   </div>
//                 </div>
//                 <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
//                   No Clients Found
//                 </p>
//                 <p className="text-sm text-gray-500 text-center max-w-xs">
//                   Try adjusting your search criteria
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Dialog>