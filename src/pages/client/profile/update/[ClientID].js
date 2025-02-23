import React, {useEffect, useState} from "react";
import {Box, Button, Card, Popover, Typography,} from "@mui/material";
import General from "@/components/forms/client_update/General";
import Details from "@/components/forms/client_update/details/details";
import Contact from "@/components/forms/client_update/contact/contact";
import Document from "@/components/forms/client_update/document/document";
import {Spinner} from "react-bootstrap";
import Address from "@/components/forms/client_update/address/address";
import Checklist from "@/components/forms/client_update/checklist/checklist";
import Form from "@/components/forms/client_update/form/form";
import Goal from "@/components/forms/client_update/goal/goal";
import Notes from "@/components/forms/client_update/notes/notes";
import NDIS from "@/components/forms/client_update/ndis/ndis";
import InputField from "@/components/widgets/InputField";
import {fetchData} from "@/utility/api_utility";
import {useRouter} from "next/router";
import Compilance from "@/components/forms/client_update/compilance/compliance";
import Rosters from "@/components/forms/client_update/rosters/rosters";
import Expenses from "@/components/forms/client_update/expenses/expenses";
import Incident from "@/components/forms/client_update/incidents/incident";
import Reports from "@/components/forms/client_update/reports/reports";

// Import Material Icons
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import GavelIcon from "@mui/icons-material/Gavel";
import NoteIcon from "@mui/icons-material/Note";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FlagIcon from "@mui/icons-material/Flag";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import styles from "@/styles/style.module.css";
import CustomAlert from "@/components/widgets/ClientAlert.js";
import DatePicker from "@/components/widgets/DatePicker"; // Ensure correct path
import {format} from "date-fns";
import {
    Activity,
    AlertTriangle,
    Calendar,
    CheckSquare,
    ClipboardList,
    DollarSign,
    FileCheck,
    FileText,
    Info,
    MapPin,
    MessageSquare,
    Phone,
    Save,
    Shield,
    Target,
    Users
} from 'lucide-react';

const UpdateClientProfile = (props) => {
    // const {colors, loading} = useContext(ColorContext);
    const router = useRouter();
    if (!router.isReady) return <Spinner/>;
    const {ClientID} = router.query;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );
    const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    );

    // Initialize state with a default component (e.g., "general")
    const [selectedComponent, setSelectedComponent] = useState(
        router.isReady && router.query.c ? router.query.c : "general"
    );

    const [agreementData, setAgreementData] = useState([]);
    const [agreementCodes, setAgreementCodes] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [agreementDetails, setAgreementDetails] = useState({
        AgreementCode: "All",
        StartDate: format(firstDayOfMonth, "yyyy-MM-dd"),
        EndDate: format(lastDayOfMonth, "yyyy-MM-dd"),
        TotalBudget: "",
    });

    const [generalEdit, setGeneralEdit] = useState(false);
    const [detailsEdit, setDetailsEdit] = useState(false);
    const [preferencesEdit, setPreferencesEdit] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [activeGeneralTab, setActiveGeneralTab] = useState(null);
    const [saveFunctions, setSaveFunctions] = useState({});
    const [isButtonClicked, setIsButtonClicked] = useState(false);

    // New state for Date Range Picker
    const [dateRange, setDateRange] = useState({
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth,
    });
    const [anchorEl, setAnchorEl] = useState(null);

    const handleTabChange = (tab) => {
        setActiveGeneralTab(tab); // Update active tab in General
    };

    const registerSaveFunction = (tab, saveFunction) => {
        console.log(`Registered save function for ${tab} ${saveFunction}`);
        setSaveFunctions((prev) => ({...prev, [tab]: saveFunction}));
    };

    const handleConfirmation = () => {
        setOpenConfirmation(true);
    };

    useEffect(() => {
        if (router.isReady && router.query.c) {
            setSelectedComponent(router.query.c);
        }
    }, [router.isReady, router.query.c]);

    useEffect(() => {
        console.log(" ClientID isButtonClicked : ", isButtonClicked);
    }, [isButtonClicked]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // When a button is clicked, update the URL query parameter as well as state.
    const handleButtonClick = (componentId) => {
        // Update URL query parameter "component" with shallow routing.
        window.history.replaceState(null, null, `/client/profile/update/${ClientID}?c=${componentId}`);
        setSelectedComponent(componentId);
    };

    const handleClose = () => {
        setOpenConfirmation(false);
    };

    // Function to handle opening the Popover
    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Function to handle closing the Popover
    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    // Function to handle date selection from the DateRangePickerModal
    const handleDateSelection = ({startDate, endDate}) => {
        setDateRange({startDate, endDate});
        setAgreementDetails((prevDetails) => ({
            ...prevDetails,
            StartDate: format(startDate, "yyyy-MM-dd"),
            EndDate: format(endDate, "yyyy-MM-dd"),
        }));
        handleClosePopover();
    };

    // Updated drawerItems to include icons (if you want to use these later)
    const drawerItems = [
        {
            text: `General ${generalEdit ? "*" : ""}`,
            icon: <PersonIcon/>,
        },
        {
            text: `Details ${detailsEdit ? "*" : ""}`,
            icon: <InfoIcon/>,
        },
        {text: "Contact", icon: <PhoneIcon/>},
        {text: "Addresses", icon: <LocationOnIcon/>},
        {text: "Reports", icon: <AssessmentIcon/>},
        {text: "Forms", icon: <DescriptionIcon/>},
        {text: "Documents", icon: <InsertDriveFileIcon/>},
        {text: "Compliance", icon: <GavelIcon/>},
        {text: "Notes", icon: <NoteIcon/>},
        {text: "Incidents", icon: <ReportProblemIcon/>},
        {text: "Expenses", icon: <AttachMoneyIcon/>},
        {text: "Goals", icon: <FlagIcon/>},
        {text: "NDIS", icon: <AccessibilityIcon/>},
        {text: "Roster Template", icon: <CalendarTodayIcon/>},
        {text: "Checklist", icon: <CheckBoxIcon/>},
    ];

    const fetchAgreementNames = async () => {
        const data = await fetchData(
            `/api/getClientAgreementDataByID/${ClientID}`,
            window.location.href
        );
        setAgreementCodes(data);
    };

    useEffect(() => {
        fetchAgreementNames();
        const fetchAgreements = async () => {
            const data = await fetchData(
                `/api/getClientBudgetReport/${ClientID}`,
                window.location.href
            );
            setAgreementData(data.data);
            setFilteredData(data.data);
        };
        fetchAgreements();
    }, [ClientID]);

    const handleDateChange = (e) => {
        const {id, value} = e.target;
        setAgreementDetails((prevDetails) => ({
            ...prevDetails,
            [id]: value,
        }));
    };

    const handleAgreementSelect = (e) => {
        const {value} = e.target;

        if (value === "All") {
            setAgreementDetails((prevDetails) => ({
                ...prevDetails,
                AgreementCode: value,
                StartDate: format(firstDayOfMonth, "yyyy-MM-dd"),
                EndDate: format(lastDayOfMonth, "yyyy-MM-dd"),
            }));
            setDateRange({
                startDate: firstDayOfMonth,
                endDate: lastDayOfMonth,
            });
        } else {
            const selectedAgreement = agreementData.find(
                (agreement) => agreement.AgreementCode === value
            );

            if (selectedAgreement) {
                const newStartDate = new Date(selectedAgreement.StartDate);
                const newEndDate = new Date(selectedAgreement.EndDate);
                setAgreementDetails((prevDetails) => ({
                    ...prevDetails,
                    AgreementCode: value,
                    StartDate: format(newStartDate, "yyyy-MM-dd"),
                    EndDate: format(newEndDate, "yyyy-MM-dd"),
                }));
                setDateRange({
                    startDate: newStartDate,
                    endDate: newEndDate,
                });
            }
        }
    };

    useEffect(() => {
        const filterData = () => {
            const {StartDate, EndDate, AgreementCode} = agreementDetails;

            const filtered = agreementData.filter((item) => {
                const itemStartDate = format(new Date(item.StartDate), "yyyy-MM-dd");
                const itemEndDate = format(new Date(item.EndDate), "yyyy-MM-dd");
                const startDate = format(new Date(StartDate), "yyyy-MM-dd");
                const endDate = format(new Date(EndDate), "yyyy-MM-dd");
                const isWithinDateRange =
                    itemStartDate >= startDate && itemEndDate <= endDate;
                const isAgreementMatch =
                    AgreementCode === "All" || item.AgreementCode === AgreementCode;

                return isWithinDateRange && isAgreementMatch;
            });

            setFilteredData(filtered);
        };

        filterData();
    }, [agreementDetails, agreementData]);

    // Define your navigation items with their corresponding IDs and icons.
    const navItems = [
        {id: "general", label: `General`, icon: Users},
        {id: "details", label: `Details`, icon: Info},
        {id: "contact", label: "Contact", icon: Phone},
        {id: "addresses", label: "Addresses", icon: MapPin},
        {id: "reports", label: "Reports", icon: FileText},
        {id: "forms", label: "Forms", icon: ClipboardList},
        {id: "documents", label: "Documents", icon: FileCheck},
        {id: "compliance", label: "Compliance", icon: Shield},
        {id: "notes", label: "Notes", icon: MessageSquare},
        {id: "incidents", label: "Incidents", icon: AlertTriangle},
        {id: "expenses", label: "Expenses", icon: DollarSign},
        {id: "goals", label: "Goals", icon: Target},
        {id: "ndis", label: "NDIS", icon: Activity},
        {id: "roster", label: "Roster Template", icon: Calendar},
        {id: "checklist", label: "Checklist", icon: CheckSquare},
    ];

    // This useEffect reads the "component" query parameter on page load (or when it changes)
    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.c) {
            setSelectedComponent(router.query.c);
        }
    }, [router.isReady, router.query.c]);

    return (
        <>
            <div className="min-h-screen gradient-background pt-24">
                {/*<Navbar />*/}
                <div></div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "start",
                        margin: "1rem",
                    }}
                >
                    {/* Sidebar Navigation */}
                    <div className="w-80 flex-shrink-0 fixed top-24 bottom-0 left-0 px-4">
                        <div
                            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 h-full overflow-hidden">
                            <div className="p-4">
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                    Client Profile
                                </h2>
                                <nav className="space-y-1">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleButtonClick(item.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    selectedComponent === item.id
                                                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                                }`}
                                            >
                                                <Icon className="h-5 w-5"/>
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 ml-80 px-6 pb-8 overflow-y-auto">
                        <Card
                            className="clientProfileCard"
                            style={{
                                backgroundColor: "transparent",
                                margin: "5px 10px",
                                padding: "1rem",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.02)",
                                borderRadius: "15px",
                                border: "none",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "1rem",
                                }}
                            >
                                {/* Agreements Dropdown */}
                                <div
                                    style={{
                                        flex: "1",
                                        minWidth: "150px",
                                        borderRadius: "5px",
                                        height: "50px",
                                    }}
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <InputField
                                        type="select"
                                        value={agreementDetails.AgreementCode}
                                        defaultValue="All"
                                        prefixType="none"
                                        id="requireSignature"
                                        options={[
                                            {value: "All", label: "All"},
                                            ...agreementCodes.map((agreement) => ({
                                                value: agreement.AgreementCode,
                                                label: agreement.AgreementCode,
                                            })),
                                        ]}
                                        onChange={(e) => handleAgreementSelect(e)}
                                        sx={{width: "100%"}}
                                    />
                                </div>

                                {/* Date Range Picker Button */}
                                <div
                                    style={{
                                        flex: "2",
                                        minWidth: "200px",
                                        borderRadius: "5px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Button
                                        startIcon={<CalendarMonthOutlinedIcon/>}
                                        className={styles.TimesheetButtonClient}
                                        onClick={handleOpenPopover}
                                    >
                                        {`Date Range: ${format(
                                            dateRange.startDate,
                                            "dd MMM yyyy"
                                        )} - ${format(dateRange.endDate, "dd MMM yyyy")}`}
                                    </Button>
                                    <Popover
                                        open={Boolean(anchorEl)}
                                        anchorEl={anchorEl}
                                        onClose={handleClosePopover}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "left",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "left",
                                        }}
                                        PaperProps={{
                                            sx: {
                                                padding: "8px",
                                                borderRadius: "8px",
                                                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                                                maxWidth: "90vw",
                                                backgroundColor: "white",
                                            },
                                        }}
                                    >
                                        <DatePicker
                                            onDateSelect={handleDateSelection}
                                            currentRange={dateRange}
                                        />
                                    </Popover>
                                </div>

                                {/* Updated Metrics Display */}
                                <Box
                                    sx={{
                                        flex: "2",
                                        display: "flex",
                                        justifyContent: "space-around",
                                        alignItems: "center",
                                    }}
                                >
                                    {/* Total Budget */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography
                                            className="clientBudgetAmount"
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                fontFamily: "Metropolis, sans-serif",
                                                letterSpacing: "0.3px",
                                            }}
                                        >
                                            $
                                            {parseFloat(
                                                filteredData
                                                    .reduce((acc, item) => acc + item.TotalBudget, 0)
                                                    .toFixed(2)
                                            )}
                                        </Typography>
                                        <Typography
                                            className="clientBudgetLabel"
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                fontFamily: "Metropolis, sans-serif",
                                            }}
                                        >
                                            Total Budget
                                        </Typography>
                                    </Box>

                                    {/* Rostered */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography
                                            className="clientBudgetAmount"
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                fontFamily: "Metropolis, sans-serif",
                                                letterSpacing: "0.3px",
                                            }}
                                        >
                                            $
                                            {parseFloat(
                                                filteredData
                                                    .reduce((acc, item) => acc + item.RosteredAmount, 0)
                                                    .toFixed(2)
                                            )}
                                        </Typography>
                                        <Typography
                                            className="clientBudgetLabel"
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                fontFamily: "Metropolis, sans-serif",
                                            }}
                                        >
                                            Rostered
                                        </Typography>
                                    </Box>

                                    {/* Actual */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography
                                            className="clientBudgetAmount"
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                fontFamily: "Metropolis, sans-serif",
                                                letterSpacing: "0.3px",
                                            }}
                                        >
                                            $
                                            {parseFloat(
                                                filteredData
                                                    .reduce((acc, item) => acc + item.ActualAmount, 0)
                                                    .toFixed(2)
                                            )}
                                        </Typography>
                                        <Typography
                                            className="clientBudgetLabel"
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                fontFamily: "Metropolis, sans-serif",
                                            }}
                                        >
                                            Actual
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Save Button */}
                                <div style={{minWidth: "100px"}}>
                                    <button
                                        onClick={() => setOpenConfirmation(true)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-purple-500/20"
                                    >
                                        <Save className="h-5 w-5"/>
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </Card>

                        {/* Render components based on the selectedComponent value */}
                        {selectedComponent === "general" && (
                            <General
                                setGeneralEdit={setGeneralEdit}
                                setSelectedComponent={setSelectedComponent}
                                onTabChange={handleTabChange}
                                onSaveReady={registerSaveFunction}
                                isButtonClicked={isButtonClicked}
                                setIsButtonClicked={setIsButtonClicked}
                            />
                        )}
                        {selectedComponent === "details" && (
                            <Details
                                setDetailsEdit={setDetailsEdit}
                                setSelectedComponent={setSelectedComponent}
                                onTabChange={handleTabChange}
                                onSaveReady={registerSaveFunction}
                                isButtonClicked={isButtonClicked}
                                setIsButtonClicked={setIsButtonClicked}
                                ClientID={ClientID}
                            />
                        )}
                        {selectedComponent === "addresses" && <Address/>}
                        {selectedComponent === "contact" && <Contact/>}
                        {selectedComponent === "reports" && <Reports/>}
                        {selectedComponent === "forms" && <Form/>}
                        {selectedComponent === "documents" && <Document/>}
                        {selectedComponent === "compliance" && <Compilance/>}
                        {selectedComponent === "notes" && <Notes/>}
                        {selectedComponent === "incidents" && <Incident/>}
                        {selectedComponent === "expenses" && <Expenses/>}
                        {selectedComponent === "goals" && <Goal/>}
                        {selectedComponent === "ndis" && (
                            <NDIS
                                onTabChange={handleTabChange}
                                setSelectedComponent={setSelectedComponent}
                                onSaveReady={registerSaveFunction}
                                isButtonClicked={isButtonClicked}
                                setIsButtonClicked={setIsButtonClicked}
                            />
                        )}
                        {selectedComponent === "roster" && <Rosters/>}
                        {selectedComponent === "checklist" && <Checklist/>}
                    </div>
                </div>
            </div>
            <CustomAlert
                open={openConfirmation}
                onClose={handleClose}
                selectedComponent={selectedComponent}
                action={"update"}
                onConfirmation={handleConfirmation}
                activeGeneralTab={activeGeneralTab}
                setIsButtonClicked={setIsButtonClicked}
                saveFunctions={saveFunctions}
            />
        </>
    );
};

export default React.memo(UpdateClientProfile);
