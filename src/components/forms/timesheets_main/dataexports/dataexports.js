// src/components/forms/timesheets_main/dataexports/DataExport.jsx

import React, {useContext, useEffect, useMemo, useState} from "react";
import {Avatar, Box, Button, Menu, MenuItem as DropdownMenuItem, Modal, Typography} from "@mui/material";
import {ChevronDown, DollarSign, FileSpreadsheet, FileText, Loader2, Receipt, RefreshCw} from "lucide-react";
import {addDays, differenceInCalendarDays, format, isValid, parse, startOfWeek} from "date-fns";
import {fetchData} from "@/utility/api_utility";
import CHKMListingDataTable from "@/components/widgets/CHKMListingDataTable";
import {
    exportExpenseToXeroApi,
    exportInvoiceToXeroApi,
    exportKmToXeroApi,
    exportReimbursementToXeroApi,
    exportTimesheetToXeroApi
} from "@/components/forms/timesheets_main/dataexports/export_utils/xero";
import ColorContext from "@/contexts/ColorContext";

// ----------- ADD THESE IMPORTS FOR MUI ICONS --------------
import VisibilityIcon from "@mui/icons-material/Visibility";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import {Col, Row} from "react-bootstrap";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

// ------------- PLACEHOLDER DEFINITIONS ---------------------
const isLocationRoster = false;
const isDataExportAudit = false;
const showEditButton = false;
const isExtraButton = false;
const handleViewClick = () => {
};
const rowSelected = () => {
};
const handleShowMap = () => {
};

// ------------- MODAL STYLES ---------------
const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40%",
    maxHeight: "80%",
    overflowY: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2
};

// ------------- RENDERERS AND HELPERS ---------------
const AvatarComp = (a) => {
    console.log("AvatarComp : ", a);
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%"
            }}
        >
            <Avatar
                alt="Remy Sharp"
                src={a.value}
                sx={{
                    width: 30,
                    height: 30
                }}
            />
        </div>
    );
};

const actionCellRenderer = (params) => (
    <div style={{width: "500px"}} className="action-cell">
        {(isLocationRoster || isDataExportAudit) && (
            <Button
                variant="contained"
                size="small"
                sx={{
                    fontSize: "12px",
                    padding: "3px 4px",
                    textTransform: "none",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#1565c0"
                    }
                }}
                onClick={() => {
                    if (isLocationRoster) {
                        handleViewClick(params.data);
                    }
                    rowSelected(params.data);
                }}
                endIcon={<VisibilityIcon fontSize="small"/>}
            >
                View
            </Button>
        )}

        {showEditButton && !isLocationRoster && !isDataExportAudit && (
            <Button
                color="primary"
                size="large"
                onClick={() => rowSelected(params.data)}
                className="agGridEditButton"
                endIcon={<BorderColorOutlinedIcon className="endicon" fontSize="small"/>}
            >
                Edit
            </Button>
        )}

        {isExtraButton && (
            <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleShowMap(params.data)}
                className="agGridEditButton"
                style={{marginTop: "5px"}}
                endIcon={<VisibilityIcon className="endicon" fontSize="small"/>}
            >
                Show Map
            </Button>
        )}
    </div>
);

const columnDefs = [
    {
        field: "TsDId",
        headerName: "Client Profile",
        cellRenderer: AvatarComp
    },
    {field: "FirstName", headerName: "First Name"},
    {field: "LastName", headerName: "Last Name"},
    {field: "Email", headerName: "Email"},
    {field: "Phone", headerName: "Phone"},
    {field: "ClientType", headerName: "Client Type"},
    {field: "Action", headerName: "Action", cellRenderer: actionCellRenderer}
];

// ------------- DATE RANGE GENERATION -------------
const generateDateRanges = (startDate, endDate, gap) => {
    let ranges = [];
    let currentStartDate = new Date(startDate);
    while (currentStartDate < new Date(endDate)) {
        let currentEndDate = addDays(currentStartDate, gap);
        ranges.push({
            start: format(currentStartDate, "yyyy-MM-dd"),
            end: format(currentEndDate, "yyyy-MM-dd")
        });
        currentStartDate = addDays(currentEndDate, 1);
    }
    return ranges;
};

// ------------- SHIFT GROUPING FOR TIMESHEETS -------------
const groupShiftsByEmployeeAndService = (shifts, weekStartDate) => {
    if (!Array.isArray(shifts)) {
        console.error("Invalid shifts data provided");
        return [];
    }
    const startOfWeekDate = startOfWeek(new Date(weekStartDate), {weekStartsOn: 1});
    const employeeMap = new Map();
    shifts.forEach(shift => {
        const {WorkerID, PayRollCode, ShiftDate, ActualHours, WorkerNumber, ClientID, Workers, Accounting_Code} = shift;
        if (!ShiftDate || isNaN(new Date(ShiftDate).getTime())) {
            console.warn(`Invalid ShiftDate: ${ShiftDate} for shift:`, shift);
            return;
        }
        const shiftDate = new Date(ShiftDate);
        const dayIndex = differenceInCalendarDays(shiftDate, startOfWeekDate);
        if ((dayIndex < 0 || dayIndex > 6) && ClientID > 0) return;
        const shiftHours = Number(ActualHours);
        if (!Number.isFinite(shiftHours) && ClientID > 0) {
            console.warn(`Invalid ActualHours: ${ActualHours} for shift:`, shift);
            return;
        }
        // Process Client-based shifts
        if (ClientID > 0) {
            if (!employeeMap.has(WorkerID)) {
                employeeMap.set(WorkerID, {
                    workerID: WorkerID,
                    employeeID: WorkerNumber,
                    accountingCode: PayRollCode,
                    items: []
                });
            }
            const employee = employeeMap.get(WorkerID);
            let serviceItem = employee.items.find(item => item.serviceCode === PayRollCode);
            if (!serviceItem) {
                serviceItem = {serviceCode: PayRollCode, hours: [0, 0, 0, 0, 0, 0, 0]};
                employee.items.push(serviceItem);
            }
            serviceItem.hours[dayIndex] += shiftHours;
        }
        // Process Location-based shifts (ClientID === 0)
        if (ClientID === 0 && Workers) {
            let shiftHoursNum = Number(ActualHours);
            let parsedWorkers = [];
            try {
                parsedWorkers = typeof Workers === "string" ? JSON.parse(Workers) : Workers;
            } catch (e) {
                console.error(`Failed to parse Workers field: ${Workers}`, e);
                return;
            }
            parsedWorkers.forEach(worker => {
                const {WorkerID: ParsedWorkerID, WorkerNumber: ParsedWorkerNumber} = worker;
                if (!employeeMap.has(ParsedWorkerID)) {
                    employeeMap.set(ParsedWorkerID, {
                        workerID: ParsedWorkerID,
                        employeeID: ParsedWorkerNumber,
                        accountingCode: PayRollCode,
                        items: []
                    });
                }
                const employee = employeeMap.get(ParsedWorkerID);
                let serviceItem = employee.items.find(item => item.serviceCode === PayRollCode);
                if (!serviceItem) {
                    serviceItem = {serviceCode: PayRollCode, hours: [0, 0, 0, 0, 0, 0, 0]};
                    employee.items.push(serviceItem);
                }
                serviceItem.hours[dayIndex] += shiftHoursNum;
            });
        }
    });

    console.log("Grouped Timesheet Data:", Array.from(employeeMap.values()));
    return Array.from(employeeMap.values());
};

// ------------- SHIFT GROUPING FOR INVOICES -------------
function groupShiftsByClientAndService(shifts) {
    const clientMap = new Map();
    for (const shift of shifts) {
        const {
            ClientID,
            Clients,
            Description,
            ActualHours,
            ChargeRate,
            KM,
            ShiftDate,
            ShiftId,
            TsDId,
            ClientName,
            AccountingCode,
            ClientNDISNumber,
            FixedFeeService
        } = shift;

        function addShiftToClient(clientID, cName, cAccountingCode, cNDISNumber, cChargeRate, cShiftHours) {
            if (!clientMap.has(clientID)) {
                clientMap.set(clientID, {
                    clientID,
                    clientName: cName || "",
                    accountingCode: cAccountingCode || "",
                    ndisNumber: cNDISNumber || "",
                    services: [],
                    shiftIds: new Set()
                });
            }
            const clientEntry = clientMap.get(clientID);
            if (!clientEntry.shiftIds.has(ShiftId)) {
                clientEntry.services.push({
                    description: Description,
                    shiftId: ShiftId,
                    tsId: TsDId,
                    totalHours: FixedFeeService ? 1 : cShiftHours || ActualHours,
                    chargeRate: cChargeRate || ChargeRate,
                    km: KM,
                    date: ShiftDate
                });
                clientEntry.shiftIds.add(ShiftId);
            }
        }

        if (ClientID > 0) {
            addShiftToClient(ClientID, ClientName, AccountingCode, ClientNDISNumber, ChargeRate, ActualHours);
        } else if (ClientID === 0 && Clients) {
            let parsedClients;
            try {
                parsedClients = JSON.parse(Clients);
            } catch (e) {
                console.error(`Failed to parse Clients field: ${Clients}`, e);
                continue;
            }
            for (const parsedClient of parsedClients) {
                const {
                    ClientID: parsedClientID,
                    ClientName: parsedClientName,
                    AccountingCode: parsedAccountingCode,
                    ChargeRate: parsedChargeRate
                } = parsedClient;
                addShiftToClient(parsedClientID, parsedClientName, parsedAccountingCode, null, parsedChargeRate, ActualHours);
            }
        }
    }
    const result = [];
    for (const [clientID, clientData] of clientMap) {
        const {shiftIds, ...rest} = clientData;
        result.push(rest);
    }
    console.log("Grouped Invoice Data:", result);
    return result;
}

// ------------- GENERATE INVOICE JSON -------------
const generateInvoiceJSON = (groupedData, invoiceDate, dueDate) => {
    return groupedData.map((clientData) => ({
        Type: "ACCREC",
        Contact: {ContactID: clientData.accountingCode},
        Date: invoiceDate,
        DueDate: dueDate,
        Reference: `${clientData.clientName} - ${clientData.ndisNumber ? `NDIS #${clientData.ndisNumber}` : ""}`,
        LineItems: clientData.services.flatMap((service) => {
            if (service.invoiceExported === 1) return [];
            const lineItems = [];
            const serviceDate = new Date(service.date);
            lineItems.push({
                Description: `${formatDate(serviceDate)} - ${service.description}`,
                Quantity: service.totalHours,
                ShiftId: service.shiftId,
                TsId: service.tsId,
                UnitAmount: service.chargeRate,
                AccountCode: "200"
            });
            if (service.km > 0) {
                lineItems.push({
                    Description: `${formatDate(serviceDate)} - KM Charge`,
                    Quantity: 1,
                    ShiftId: service.shiftId,
                    TsId: service.tsId,
                    UnitAmount: service.km,
                    AccountCode: "200"
                });
            }
            return lineItems;
        }),
        Status: "DRAFT"
    }));
};

// ------------- FORMAT DATE (dd/MM/YYYY) -------------
const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getUTCDate().toString().padStart(2, "0")}/${(d.getUTCMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getUTCFullYear()}`;
};

// ------------- GROUP EXPENSES BY CLIENT -------------
const groupExpensesByClientID = (expenses) => {
    const clientMap = new Map();
    expenses.forEach((expense) => {
        const {ContactID, Client, NDISNumber} = expense;
        if (!clientMap.has(ContactID)) {
            clientMap.set(ContactID, {
                clientID: ContactID,
                clientName: Client,
                ndisNumber: NDISNumber,
                items: []
            });
        }
        clientMap.get(ContactID).items.push(expense);
    });
    return Array.from(clientMap.values());
};

// ------------- GROUP EXPENSES BY WORKER -------------
const groupByWorkerNumber = (data) => {
    const workerMap = new Map();
    data.forEach((expense) => {
        const {WorkerNumber, WorkerName} = expense;
        if (!workerMap.has(WorkerNumber)) {
            workerMap.set(WorkerNumber, {
                workerNumber: WorkerNumber,
                workerName: WorkerName,
                items: []
            });
        }
        workerMap.get(WorkerNumber).items.push(expense);
    });
    return Array.from(workerMap.values());
};

// ------------- MAIN COMPONENT -------------
const DataExport = () => {
    const [activeTab, setActiveTab] = useState("Timesheet");
    const [combinedData, setCombinedData] = useState([]);
    const [payrollParameter, setPayrollParameter] = useState(null);
    const [disableSection, setDisableSection] = useState(false);
    const [anchorElTimesheets, setAnchorElTimesheets] = useState(null);
    const [anchorElInvoices, setAnchorElInvoices] = useState(null);
    const [anchorElExpenses, setAnchorElExpenses] = useState(null);
    const [anchorElReimbursement, setAnchorElReimbursement] = useState(null);
    const [selectedShifts, setSelectedShifts] = useState([]);
    const [processedTimesheetData, setProcessedTimesheetData] = useState([]);
    const [processedInvoiceData, setProcessedInvoiceData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [exportOption, setExportOption] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [totalShifts, setTotalShifts] = useState(0);
    // const {colors, loading: colorLoading} = useContext(ColorContext);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const getCookieValue = (name) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };
    const userId = getCookieValue("User_ID");

    // ------------- FETCH PAYROLL PARAMETER -------------
    useEffect(() => {
        const fetchPayrollParameter = async () => {
            try {
                const data = await fetchData("/api/getPayRollCode", window.location.href);
                setPayrollParameter(data.data);
                console.log("Payroll Parameter:", data.data);
            } catch (error) {
                console.error("Error fetching payroll parameter:", error);
            }
        };
        fetchPayrollParameter();
    }, []);

    // ------------- MEMO END DATE -------------
    const computedEndDate = useMemo(() => new Date(), []);

    // ------------- MEMO PAYROLL DATES/ GAP -------------
    const {payrollStartDateFormatted, cycleGapValue} = useMemo(() => {
        let start = "2024-05-20";
        let gap = 6;
        if (payrollParameter) {
            const rawDate = payrollParameter.PayrollStartDate?.trim() || start;
            try {
                let parsedDate = parse(rawDate, "yyyy-MM-dd HH:mm:ss", new Date());
                if (!isValid(parsedDate)) {
                    parsedDate = parse(rawDate, "yyyy-MM-dd", new Date());
                }
                if (isValid(parsedDate)) {
                    start = format(parsedDate, "yyyy-MM-dd");
                } else {
                    console.error("Failed to parse payroll start date:", rawDate);
                }
            } catch (error) {
                console.error("Error parsing payroll start date:", error);
            }
            gap = payrollParameter.PayrollCycleDays
                ? parseInt(payrollParameter.PayrollCycleDays, 10)
                : gap;
        }
        return {payrollStartDateFormatted: start, cycleGapValue: gap - 1};
    }, [payrollParameter]);

    // ------------- MEMO GENERATE DATE RANGES -------------
    const dateRanges = useMemo(() => {
        return generateDateRanges(payrollStartDateFormatted, computedEndDate, cycleGapValue);
    }, [payrollStartDateFormatted, computedEndDate, cycleGapValue]);

    console.log("Date Ranges:", dateRanges);

    // ------------- DEFAULT RANGE SELECTION -------------
    const [selectedRange, setSelectedRange] = useState({start: "", end: ""});
    useEffect(() => {
        if (
            payrollParameter &&
            payrollParameter.LoadDataOnDataExport?.toUpperCase() === "YES" &&
            dateRanges.length > 0
        ) {
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const todayDate = parse(todayStr, "yyyy-MM-dd", new Date());
            const defaultRangeFound = dateRanges.find((range) => {
                const startDate = parse(range.start, "yyyy-MM-dd", new Date());
                const endDate = parse(range.end, "yyyy-MM-dd", new Date());
                return todayDate >= startDate && todayDate <= endDate;
            });
            if (defaultRangeFound) {
                setSelectedRange(defaultRangeFound);
            }
        }
    }, [payrollParameter, dateRanges]);

    // ------------- FETCH DATA WHEN RANGE SELECTED -------------
    useEffect(() => {
        if (selectedRange.start && selectedRange.end && !disableSection) {
            if (activeTab === "Timesheet") {
                fetchTimesheetDataAsync();
            } else if (activeTab === "Expenses") {
                fetchExpenseDataAsync();
            }
        }
    }, [selectedRange, activeTab, disableSection]);

    // ------------- FETCH USER ROLES -------------
    useEffect(() => {
        const fetchUserRoles = async () => {
            if (!userId) {
                console.error("User_ID is not available");
                return;
            }
            try {
                const rolesData = await fetchData(`/api/getRolesUser/${userId}`, window.location.href);
                const specificRead = rolesData.filter(
                    (role) => role.Menu_ID === "m_all_timesheet" && role.ReadOnly === 0
                );
                setDisableSection(specificRead.length === 0);
            } catch (error) {
                console.error("Error fetching user roles:", error);
            }
        };
        fetchUserRoles();
    }, [userId]);

    // ------------- MERGE CLIENT & WORKER -------------
    const mergeClientWorkerData = (clientData, workerData) => {
        if (!Array.isArray(clientData) || !Array.isArray(workerData)) {
            console.error("Invalid data passed to mergeClientWorkerData");
            return [];
        }
        return clientData.map(client => {
            const worker = workerData.find(w => client.WorkerId === w.WorkerID);
            return {...client, ...(worker || {})};
        });
    };

    // ------------- FETCH TIMESHEET -------------
    const fetchTimesheetDataAsync = async () => {
        if (!selectedRange.start || !selectedRange.end) {
            console.error("Both start and end dates must be provided.");
            return;
        }

        setCombinedData([]);
        setProcessedTimesheetData([]);
        setProcessedInvoiceData([]);

        try {
            setLoading(true);
            console.log("Start range date:", selectedRange.start);
            console.log("End range date:", selectedRange.end);

            // Execute all API calls in parallel
            const [clientData, workerData, locationData] = await Promise.all([
                fetchData(
                    `/api/getDataExportClient?startDate=${selectedRange.start}&endDate=${selectedRange.end}`,
                    window.location.href
                ),
                fetchData(
                    `/api/getDataExportWorker?startDate=${selectedRange.start}&endDate=${selectedRange.end}`,
                    window.location.href
                ),
                fetchData(
                    `/api/getDataExportLocation?startDate=${selectedRange.start}&endDate=${selectedRange.end}`,
                    window.location.href
                )
            ]);

            const mergedData = mergeClientWorkerData(clientData, workerData);
            console.log("Merged Data:", mergedData);
            console.log("Location Data:", locationData);
            setCombinedData([...mergedData, ...locationData]);

            // Process Timesheet Data (grouping by employee and service)
            const groupedTimesheetData = groupShiftsByEmployeeAndService(mergedData, selectedRange.start);
            setProcessedTimesheetData(groupedTimesheetData);

            // Process Invoice Data (assumes a similar grouping function exists)
            const groupedInvoiceData = groupShiftsByClientAndService(mergedData);
            setProcessedInvoiceData(groupedInvoiceData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // ------------- FETCH EXPENSES -------------
    const fetchExpenseDataAsync = async () => {
        if (!selectedRange.start || !selectedRange.end) return;
        setCombinedData([]);
        try {
            setLoading(true);
            const expensesData = await fetchData(
                `/api/getDataExportExpenses?startDate=${selectedRange.start}&endDate=${selectedRange.end}`,
                window.location.href
            );
            console.log("Merged Data:", expensesData);
            setCombinedData(expensesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // ------------- HANDLE SELECT CHANGE -------------
    const handleSelectChange = (event) => {
        const selectedOption = dateRanges.find(
            (range) => `${range.start} - ${range.end}` === event.target.value
        );
        setSelectedRange(selectedOption);
    };

    // ------------- HANDLE ROW SELECTION -------------
    const handleRowSelectionModelChange = (selectedRowIndices) => {
        const selectedRows = selectedRowIndices.map((index) => combinedData[index]);
        setSelectedShifts(selectedRows);
        console.log("Selected Rows:", selectedRows);

        if (activeTab === "Timesheet") {
            const groupedTimesheetData = groupShiftsByEmployeeAndService(selectedRows, selectedRange.start);
            setProcessedTimesheetData(groupedTimesheetData);
            const groupedInvoiceData = groupShiftsByClientAndService(selectedRows);
            setProcessedInvoiceData(groupedInvoiceData);
        } else if (activeTab === "Expenses") {
            const groupedExpenses = groupExpensesByClientID(selectedRows);
            console.log("Grouped Expenses by ClientID:", groupedExpenses);
        }
    };

    // ------------- EXPORT CLICK -------------
    const handleExportClick = (type) => {
        if (type === "timesheets") {
            setAnchorElTimesheets(document.getElementById(`export-timesheets-button`));
            setAnchorElInvoices(null);
            setAnchorElExpenses(null);
            setAnchorElReimbursement(null);
        } else if (type === "invoices") {
            setAnchorElInvoices(document.getElementById(`export-invoices-button`));
            setAnchorElTimesheets(null);
            setAnchorElExpenses(null);
            setAnchorElReimbursement(null);
        } else if (type === "expenses") {
            setAnchorElExpenses(document.getElementById(`export-expenses-button`));
            setAnchorElTimesheets(null);
            setAnchorElInvoices(null);
            setAnchorElReimbursement(null);
        } else if (type === "reimbursement") {
            setAnchorElReimbursement(document.getElementById(`export-reimbursement-button`));
            setAnchorElTimesheets(null);
            setAnchorElInvoices(null);
            setAnchorElExpenses(null);
        }
    };

    // ------------- EXPORT MENU CLOSE -------------
    const handleExportClose = () => {
        setAnchorElTimesheets(null);
        setAnchorElInvoices(null);
        setAnchorElExpenses(null);
        setAnchorElReimbursement(null);
    };

    // ------------- EXPORT OPTION HANDLERS -------------
    const handleExportTimesheetOptionClick = (option, type) => {
        console.log(`Exporting ${type} as ${option}`);
        if (selectedShifts.length === 0) {
            alert("No shifts selected for export.");
            return;
        }
        setExportOption(option);
        setModalType(type);
        setIsModalOpen(true);
        handleExportClose();
    };

    const handleExportExpensesOptionClick = (option, type) => {
        console.log(`Exporting ${type} as ${option}`);
        if (selectedShifts.length === 0) {
            alert("No shifts selected for export.");
            return;
        }
        setExportOption(option);
        setModalType(type);
        setIsModalOpen(true);
        handleExportClose();
    };

    // ------------- CONFIRMATION FOR TIMESHEET EXPORT -------------
    const handleExportTimesheetConfirmation = () => {
        console.log(`Exporting ${modalType} as ${exportOption}`);
        setIsLoading(true);

        let filteredShifts = [];
        if (modalType === "timesheets") {
            filteredShifts = selectedShifts.filter((shift) => shift.timesheetExported === 0);
        } else if (modalType === "invoices") {
            filteredShifts = selectedShifts.filter((shift) => shift.invoiceExported === 0);
        } else if (modalType === "km") {
            filteredShifts = selectedShifts.filter((shift) => shift.timesheetKMExported === 0);
        }
        console.log("Filtered Shifts:", filteredShifts);

        if (filteredShifts.length === 0) {
            if (modalType === "timesheets") {
                alert("No timesheets available for export.");
            } else if (modalType === "invoices") {
                alert("No invoices available for export.");
            } else if (modalType === "km") {
                alert("No KM entries available for export.");
            }
            setIsLoading(false);
            setIsModalOpen(false);
            return;
        }

        let exportPromise;
        if (exportOption === "Xero") {
            if (modalType === "timesheets") {
                console.log("ProcessTimesheetData: ", processedTimesheetData);

                // 1) BUILD THE MAP FIRST
                const workerTsDIdMap = new Map();
                filteredShifts.forEach((shift) => {
                    // LOCATION SHIFT
                    if (shift.ClientID === 0 && shift.Workers) {
                        try {
                            const parsedWorkers = JSON.parse(shift.Workers);
                            if (Array.isArray(parsedWorkers)) {
                                parsedWorkers.forEach((w) => {
                                    if (!workerTsDIdMap.has(w.WorkerNumber)) {
                                        workerTsDIdMap.set(w.WorkerNumber, []);
                                    }
                                    workerTsDIdMap.get(w.WorkerNumber).push(shift.TsDId);
                                });
                            }
                        } catch (e) {
                            console.error("Failed to parse shift.Workers:", e);
                        }
                    }
                    // CLIENT SHIFT
                    else {
                        if (!workerTsDIdMap.has(shift.WorkerNumber)) {
                            workerTsDIdMap.set(shift.WorkerNumber, []);
                        }
                        workerTsDIdMap.get(shift.WorkerNumber).push(shift.TsDId);
                    }
                });

                // 2) BUILD timesheetJSON BY FILTERING processedTimesheetData
                const timesheetJSON = processedTimesheetData
                    .filter((employee) => {
                        return filteredShifts.some((shift) => {
                            if (shift.ClientID === 0 && shift.Workers) {
                                // location shift: check if any parsed worker matches employee
                                try {
                                    const parsedWorkers = JSON.parse(shift.Workers);
                                    return (
                                        Array.isArray(parsedWorkers) &&
                                        parsedWorkers.some((w) => w.WorkerNumber === employee.employeeID)
                                    );
                                } catch (e) {
                                    console.error("Failed to parse shift.Workers:", e);
                                    return false;
                                }
                            } else {
                                // client shift
                                return shift.WorkerNumber === employee.employeeID;
                            }
                        });
                    })
                    .map((employee) => ({
                        EmployeeID: employee.employeeID,
                        StartDate: new Date(selectedRange.start).toISOString(),
                        EndDate: new Date(selectedRange.end).toISOString(),
                        Status: "DRAFT",
                        TimesheetLines: employee.items.map((item) => ({
                            EarningsRateID: item.serviceCode,
                            NumberOfUnits: item.hours,
                        })),
                    }));

                // 3) ATTACH THE TsDIds FROM THE MAP
                setTotalShifts(filteredShifts.length);
                timesheetJSON.forEach((t) => {
                    t.TsDId = workerTsDIdMap.get(t.EmployeeID) || [];
                });

                console.log("Updated Timesheet JSON:", timesheetJSON);

                // 4) EXPORT
                exportPromise = exportTimesheetToXeroApi(timesheetJSON, userId);
            } else if (modalType === "km") {
                const payload = {
                    shifts: selectedShifts.filter((shift) => shift.timesheetKMExported === 0)
                };
                setTotalShifts(payload.shifts.length);
                exportPromise = exportKmToXeroApi(payload, userId);
            } else if (modalType === "invoices") {
                const clientMap = new Map();
                filteredShifts.forEach((shift) => {
                    if (shift.ClientID > 0) {
                        if (!clientMap.has(shift.ClientID)) {
                            clientMap.set(shift.ClientID, {
                                clientID: shift.ClientID,
                                clientName: shift.ClientName,
                                accountingCode: shift.AccountingCode,
                                ndisNumber: shift.ClientNDISNumber,
                                services: []
                            });
                        }
                        clientMap.get(shift.ClientID).services.push({
                            description:
                                shift.Description +
                                (shift.FixedFeeService ? " [Fixed Fee Service]" : "") +
                                (shift.CenterCapitalCosts ? " [Center Capital Costs]" : ""),
                            shiftId: shift.ShiftId,
                            tsId: shift.TsDId,
                            totalHours: shift.FixedFeeService ? 1 : shift.ActualHours,
                            chargeRate: shift.ChargeRate,
                            km: shift.KM,
                            date: shift.ShiftDate
                        });
                    } else if (shift.ClientID === 0 && shift.Clients) {
                        let parsedClients;
                        try {
                            parsedClients = JSON.parse(shift.Clients);
                        } catch (error) {
                            console.error("Failed to parse Clients JSON for shift:", shift, error);
                            return;
                        }
                        parsedClients.forEach((pc) => {
                            if (!clientMap.has(pc.ClientID)) {
                                clientMap.set(pc.ClientID, {
                                    clientID: pc.ClientID,
                                    clientName: pc.ClientName,
                                    accountingCode: pc.AccountingCode,
                                    ndisNumber: "",
                                    services: []
                                });
                            }
                            clientMap.get(pc.ClientID).services.push({
                                description: shift.Description,
                                shiftId: shift.ShiftId,
                                tsId: shift.TsDId,
                                totalHours: shift.ActualHours,
                                chargeRate: shift.ChargeRate,
                                km: shift.KM,
                                date: shift.ShiftDate
                            });
                        });
                    }
                });
                const mInvoiceData = Array.from(clientMap.values()).filter(
                    (client) => client.services.length > 0
                );
                if (mInvoiceData.length === 0) {
                    console.log("No valid invoice data left after processing!");
                    setIsLoading(false);
                    setIsModalOpen(false);
                    return;
                }
                const invoiceJSON = generateInvoiceJSON(
                    mInvoiceData,
                    format(new Date(), "yyyy-MM-dd"),
                    format(addDays(new Date(), 14), "yyyy-MM-dd")
                );
                setTotalShifts(invoiceJSON.length);
                const payload = {Invoices: invoiceJSON};
                exportPromise = exportInvoiceToXeroApi(payload, userId);
            }
        }

        exportPromise
            .then((response) => {
                console.log(response);
                setResponseMessage(() => {
                    let message = "Export successful.";
                    if (response?.message) {
                        message = response.message;
                    }
                    if (response?.errors?.[0]?.details?.detail) {
                        message += ` ${response.errors[0].details.detail}`;
                    }
                    if (response?.errors?.[0]?.details) {
                        message += ` ${response.errors[0].details}`;
                    }
                    if (response?.errors?.[0]?.message) {
                        message += ` ${response.errors[0].message}`;
                    }
                    if (response?.data?.message) {
                        message += ` ${response.data.message}`;
                    }
                    message += " [closing in 10 seconds...]";
                    return message;
                });
            })
            .catch((error) => {
                console.error("error : ", error);
                setResponseMessage(() => {
                    let message = "Export failed.";
                    if (error?.data?.failedTimesheets && Array.isArray(error.data.failedTimesheets)) {
                        const failedIds = error.data.failedTimesheets
                            .map((timesheet) => timesheet.TsDId.join(", "))
                            .join(", ");
                        message += ` The following Timesheet ID(s) have failed: ${failedIds}.`;
                    } else {
                        message += `. Please check the audit log for more details.`;
                    }
                    return message;
                });
            })
            .finally(() => {
                setTotalShifts(0);
                // Clear the selected shifts after export so subsequent exports work
                setSelectedShifts([]);
                if (selectedRange.start && selectedRange.end && !disableSection && activeTab === "Expenses") {
                    fetchExpenseDataAsync();
                } else if (selectedRange.start && selectedRange.end && !disableSection && activeTab === "Timesheet") {
                    fetchTimesheetDataAsync();
                }
            });
    };

    // ------------- CONFIRMATION FOR EXPENSES EXPORT -------------
    const handleExportExpensesConfirmation = () => {
        console.log(`Exporting ${modalType} as ${exportOption}`);
        setIsLoading(true);

        let filteredExpenses = [];
        if (modalType === "expenses") {
            filteredExpenses = selectedShifts.filter(
                (expense) => expense.isInvoiceGenerated === 0 && expense.isCharge === 1
            );
        } else if (modalType === "reimbursement") {
            filteredExpenses = selectedShifts.filter(
                (expense) => expense.isWorkerReimbursed === 0 && expense.isReimbursement === 1
            );
        }
        console.log("Filtered Expenses:", filteredExpenses);

        if (filteredExpenses.length === 0) {
            if (modalType === "expenses") {
                alert("No valid expenses available for export. you might have selected already exported expenses or non-chargeable expenses.");
            } else if (modalType === "reimbursement") {
                alert("No valid expenses available for export. you might have selected already reimbursed expenses or non-reimbursement expenses.");
            }
            setIsLoading(false);
            setIsModalOpen(false);
            return;
        }

        let exportPromise;
        if (exportOption === "Xero") {
            const payload =
                modalType === "expenses"
                    ? groupExpensesByClientID(filteredExpenses)
                    : groupByWorkerNumber(filteredExpenses);
            console.log("Prepared Payload:", payload);
            exportPromise =
                modalType === "expenses"
                    ? exportExpenseToXeroApi(payload, userId)
                    : exportReimbursementToXeroApi(payload, userId);
        }

        exportPromise
            .then((response) => {
                console.log(response);
                setResponseMessage(() => {
                    let message = "Export successful.";
                    if (response?.message) {
                        message = response.message;
                    }
                    if (response?.errors?.[0]?.details?.detail) {
                        message += ` ${response.errors[0].details.detail}`;
                    }
                    if (response?.errors?.[0]?.details) {
                        message += ` ${response.errors[0].details}`;
                    }
                    if (response?.errors?.[0]?.message) {
                        message += ` ${response.errors[0].message}`;
                    }
                    if (response?.data?.message) {
                        message += ` ${response.data.message}`;
                    }
                    message += " [closing in 10 seconds...]";
                    return message;
                });
            })
            .catch((error) => {
                console.error(error);
                setResponseMessage(() => {
                    let message = "Export failed.";
                    if (error?.message) {
                        message = error.message;
                    } else if (error?.errors?.[0]?.details?.detail) {
                        message = error.errors[0].details.detail;
                    } else if (error?.errors?.[0]?.message) {
                        message = error.errors[0].message;
                    } else if (error?.data?.message) {
                        message = error.data.message;
                    } else if (error?.data?.error) {
                        message = `${error.data.error} - ${error.data.details}`;
                    }
                    message += " Please check the audit log for more details. [Closing in 10 seconds...]";
                    return message;
                });
            })
            .finally(() => {
                setTotalShifts(0);
                // Clear selected rows so subsequent exports work
                setSelectedShifts([]);
                setTimeout(() => {
                    setIsLoading(false);
                    setIsModalOpen(false);
                    setResponseMessage("");
                    if (selectedRange.start && selectedRange.end && !disableSection && activeTab === "Expenses") {
                        fetchExpenseDataAsync();
                    } else if (selectedRange.start && selectedRange.end && !disableSection && activeTab === "Timesheet") {
                        fetchTimesheetDataAsync();
                    }
                }, 10000);
            });
    };

    // ------------- LOADING STATE -------------
    // if (colorLoading) {
    //     return <div>Loading...</div>;
    // }

    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            borderColor: disableSection ? "lightgray" : "blue",
            backgroundColor: disableSection ? "#f5f5f5" : "white",
            cursor: disableSection ? "not-allowed" : "pointer"
        }),
        placeholder: (provided) => ({
            ...provided,
            color: disableSection ? "gray" : "black"
        })
    };

    // ------------- RETURN RENDER -------------
    return (
        <div className="min-h-screen gradient-background pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Data Exports
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Export and manage timesheet and expense data
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setIsRefreshing(true);
                                if (activeTab === "Timesheet") {
                                    fetchTimesheetDataAsync().finally(() => setIsRefreshing(false));
                                } else if (activeTab === "Expenses") {
                                    fetchExpenseDataAsync().finally(() => setIsRefreshing(false));
                                }
                            }}
                            disabled={disableSection || isRefreshing}
                            className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`}/>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <CustomBreadcrumbs />

                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    {/* Date Range and Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Date Range
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedRange.start ? `${selectedRange.start} - ${selectedRange.end}` : ""}
                                    onChange={handleSelectChange}
                                    disabled={disableSection}
                                    className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                >
                                    <option value="">Select a date range</option>
                                    {dateRanges.map((range, index) => (
                                        <option key={index} value={`${range.start} - ${range.end}`}>
                                            {`${range.start} - ${range.end}`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <input
                                type="text"
                                value={selectedRange.start}
                                readOnly
                                disabled={disableSection}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="text"
                                value={selectedRange.end}
                                readOnly
                                disabled={disableSection}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    {/* Tabs and Export Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("Timesheet")}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    activeTab === "Timesheet"
                                        ? "text-white"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                                {activeTab === "Timesheet" && (
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg -z-10"/>
                                )}
                                <FileText className="h-4 w-4"/>
                                <span>Timesheet</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("Expenses")}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    activeTab === "Expenses"
                                        ? "text-white"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                                {activeTab === "Expenses" && (
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg -z-10"/>
                                )}
                                <DollarSign className="h-4 w-4"/>
                                <span>Expenses</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {activeTab === "Timesheet" ? (
                                <>
                                    <div className="relative">
                                        <button
                                            onClick={() => handleExportClick("timesheets")}
                                            id="export-timesheets-button"
                                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <FileSpreadsheet className="h-4 w-4"/>
                                            <span>Export Timesheets</span>
                                            <ChevronDown className="h-4 w-4"/>
                                        </button>
                                        <Menu anchorEl={anchorElTimesheets} open={Boolean(anchorElTimesheets)}
                                              onClose={handleExportClose}>
                                            <DropdownMenuItem
                                                onClick={() => handleExportTimesheetOptionClick("Xero", "timesheets")}
                                            >
                                                Export to Xero
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleExportTimesheetOptionClick("Xero", "km")}
                                            >
                                                Export KM to Xero
                                            </DropdownMenuItem>
                                        </Menu>
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => handleExportClick("invoices")}
                                            id="export-invoices-button"
                                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <Receipt className="h-4 w-4"/>
                                            <span>Export Invoices</span>
                                            <ChevronDown className="h-4 w-4"/>
                                        </button>
                                        <Menu anchorEl={anchorElInvoices} open={Boolean(anchorElInvoices)}
                                              onClose={handleExportClose}>
                                            <DropdownMenuItem
                                                onClick={() => handleExportTimesheetOptionClick("Xero", "invoices")}
                                            >
                                                Export to Xero
                                            </DropdownMenuItem>
                                        </Menu>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <button
                                            id="export-expenses-button"
                                            onClick={() => handleExportClick("expenses")}
                                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <FileSpreadsheet className="h-4 w-4"/>
                                            <span>Export Expenses</span>
                                            <ChevronDown className="h-4 w-4"/>
                                        </button>
                                        <Menu anchorEl={anchorElExpenses} open={Boolean(anchorElExpenses)}
                                              onClose={handleExportClose}>
                                            <DropdownMenuItem
                                                onClick={() => handleExportExpensesOptionClick("Xero", "expenses")}
                                            >
                                                Export to Xero
                                            </DropdownMenuItem>
                                        </Menu>
                                    </div>

                                    <div className="relative">
                                        <button
                                            id="export-reimbursement-button"
                                            onClick={() => handleExportClick("reimbursement")}
                                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <Receipt className="h-4 w-4"/>
                                            <span>Export Reimbursement</span>
                                            <ChevronDown className="h-4 w-4"/>
                                        </button>
                                        <Menu anchorEl={anchorElReimbursement} open={Boolean(anchorElReimbursement)}
                                              onClose={handleExportClose}>
                                            <DropdownMenuItem
                                                onClick={() => handleExportExpensesOptionClick("Xero", "reimbursement")}
                                            >
                                                Export to Xero
                                            </DropdownMenuItem>
                                        </Menu>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="relative">
                        {loading ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <Loader2 className="h-8 w-8 text-purple-600 animate-spin"/>
                            </div>
                        ) : (
                            <CHKMListingDataTable
                                rows={combinedData || []}
                                rowSelected={() => {
                                }}
                                handleRowSelectionModelChange={handleRowSelectionModelChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Export Confirmation Modal */}
            <Modal
                open={isModalOpen}
                disableEscapeKeyDown={true}
                disableBackdropClick={true}
                onBackdropClick={() => {
                }}
                hideBackdrop={true}
                onClose={() => {
                    setIsModalOpen(false);
                    setResponseMessage(""); // Reset response message on close
                }}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                draggable={false}
            >
                <Box sx={modalStyle}>
                    <Typography id="modal-title" variant="h6" sx={{textAlign: "center"}}>
                        {isLoading ? `Processing Export... ${totalShifts}` : `Confirm Export: ${modalType.toUpperCase()}`}
                    </Typography>
                    <Box id="modal-description" sx={{mt: 2}}>
                        {!isLoading ? (
                            <>
                                <Typography variant="body1">Selected Shifts:</Typography>
                                {selectedShifts.map((shift, index) => {
                                    const isInvoiceExportedColor = shift.invoiceExported === 1 ? "red" : "green";
                                    const isTimesheetExportedColor = shift.timesheetExported === 1 ? "red" : "green";
                                    const isTimesheetKMExported = shift.timesheetKMExported === 1 ? "red" : "green";
                                    const isInvoiceGenerated = shift.isCharge === 1 && shift.isInvoiceGenerated === 1 ? "red" : "green";
                                    const isWorkerReimbursed = shift.isReimbursement === 1 && shift.isWorkerReimbursed === 1 ? "red" : "green";

                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                mb: 1,
                                                border: "1px solid #ccc",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                backgroundColor:
                                                    modalType === "timesheets"
                                                        ? shift.timesheetExported === 0
                                                            ? "#e6ffe6"
                                                            : "#ffe6e6"
                                                        : modalType === "invoices"
                                                            ? shift.invoiceExported === 0
                                                                ? "#e6ffe6"
                                                                : "#ffe6e6"
                                                            : modalType === "km"
                                                                ? shift.timesheetKMExported === 0
                                                                    ? "#e6ffe6"
                                                                    : "#ffe6e6"
                                                                : modalType === "expenses"
                                                                    ? shift.isInvoiceGenerated === 0
                                                                        ? "#e6ffe6"
                                                                        : "#ffe6e6"
                                                                    : modalType === "reimbursement"
                                                                        ? shift.isWorkerReimbursed === 0
                                                                            ? "#e6ffe6"
                                                                            : "#ffe6e6"
                                                                        : "#fff",
                                            }}
                                        >
                                            {["timesheets", "invoices", "km"].includes(modalType) ? (
                                                <>
                                                    <Typography variant="body2">
                                                        <strong>Worker:</strong> {shift.FirstName} {shift.LastName} ({shift.WorkerID})
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Shift Date:</strong> {shift.ShiftDate}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Total Hours:</strong> {shift.ActualHours}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Total KM:</strong> {shift.KM}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Invoice Generated:</strong>{" "}
                                                        <span style={{color: isInvoiceExportedColor}}>
                                                            {shift.invoiceExported === 1 ? "Yes" : "No"}
                                                        </span>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Timesheet Exported:</strong>{" "}
                                                        <span style={{color: isTimesheetExportedColor}}>
                                                            {shift.timesheetExported === 1 ? "Yes" : "No"}
                                                        </span>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>KM Exported:</strong>{" "}
                                                        <span style={{color: isTimesheetKMExported}}>
                                                            {shift.timesheetKMExported === 1 ? "Yes" : "No"}
                                                        </span>
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <Typography variant="body2">
                                                        <strong>Client:</strong> {shift.Client}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Date:</strong> {shift.Date}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Total Amount:</strong> {shift.TotalAmount}
                                                    </Typography>
                                                    {modalType === "expenses" && (
                                                        <>
                                                            <Typography variant="body2">
                                                                <strong>Invoice:</strong>{" "}
                                                                <span style={{color: isInvoiceGenerated}}>
                                                            {shift.isCharge === 1 ? "Yes" : "No"}
                                                        </span>
                                                            </Typography>
                                                            <hr></hr>
                                                            <Typography variant="body2">
                                                                <strong>Invoice Generated:</strong>{" "}
                                                                <span style={{color: isInvoiceGenerated}}>
                                                            {shift.isInvoiceGenerated === 1 ? "Yes" : "No"}
                                                        </span>
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {modalType === "reimbursement" && (<>
                                                        <Typography variant="body2">
                                                            <strong>Reimbursement:</strong>{" "}
                                                            <span style={{color: isWorkerReimbursed}}>
                                                            {shift.isReimbursement === 1 ? "Yes" : "No"}
                                                        </span>
                                                        </Typography>
                                                        <hr></hr>
                                                        <Typography variant="body2">
                                                            <strong>Reimbursement Exported:</strong>{" "}
                                                            <span style={{color: isWorkerReimbursed}}>
                                                            {shift.isWorkerReimbursed === 1 ? "Yes" : "No"}
                                                        </span>
                                                        </Typography>
                                                    </>)}
                                                </>
                                            )}
                                        </Box>
                                    );
                                })}
                            </>
                        ) : (
                            <Typography variant="body1" sx={{textAlign: "center"}}>
                                Please wait while the export is being processed...
                            </Typography>
                        )}
                    </Box>
                    {!isLoading ? (
                        <Box sx={{display: "flex", justifyContent: "flex-end", mt: 3}}>
                            <Button
                                variant="outlined"
                                onClick={() => setIsModalOpen(false)}
                                sx={{mr: 2}}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={
                                    ["timesheets", "km", "invoices"].includes(modalType)
                                        ? handleExportTimesheetConfirmation
                                        : handleExportExpensesConfirmation
                                }
                            >
                                Confirm Export
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Typography
                                variant="body1"
                                sx={{mt: 2, textAlign: "center"}}
                                color={
                                    responseMessage.includes("successful")
                                        ? "green"
                                        : responseMessage.includes("failed")
                                            ? "red"
                                            : "blue"
                                }
                            >
                                {responseMessage}
                            </Typography>
                            {responseMessage ? (
                                <Row>
                                    <Col>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                window.open(`/timesheets_main/data_export_audit`, "_blank");
                                            }}
                                        >
                                            View Audit Log
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setResponseMessage(""); // Reset response message on close
                                                setIsLoading(false);
                                            }}
                                        >
                                            Close
                                        </Button>
                                    </Col>
                                </Row>
                            ) : null}
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default DataExport;
