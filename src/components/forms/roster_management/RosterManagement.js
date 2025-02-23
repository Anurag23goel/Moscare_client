"use client";
import {useCallback, useEffect, useState} from "react";
import {
    Calendar,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    Copy,
    FileText,
    Loader2,
    Plus,
    Save,
    Search,
    Upload,
    UserCircle,
    Users,
    X,
} from "lucide-react";
import Cookies from "js-cookie";
import {v4 as uuidv4} from "uuid";
import {useRouter, useSearchParams} from "next/navigation";
import {fetchData, postData} from "@/utility/api_utility";
import Scheduler from "@/components/widgets/Scheduler";
import ClientCalendar from "@/components/widgets/ClientCalendar";
import AssignShiftModal from "@/components/widgets/AddShiftModal";
import Typography from "@mui/material/Typography";

export default function ShiftDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ----------------------------
    // 1) Parse from the URL on first load
    // ----------------------------
    const [activeView, setActiveView] = useState(() => searchParams.get("r") || "worker");
    const [workerView, setWorkerView] = useState(() => searchParams.get("vt") || "availability");
    const [timeView, setTimeView] = useState(() => searchParams.get("tv") || "Week");
    // Client-based roster info from URL (in case user refreshes)
    const [selectedClientID, setSelectedClientID] = useState(() => searchParams.get("clientId") || null);
    const [selectedRosterID, setSelectedRosterID] = useState(() => searchParams.get("rosterId") || null);

    // ----------------------------
    // 2) Local UI states
    // ----------------------------
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showCreateRosterModal, setShowCreateRosterModal] = useState(false);
    const [isCreatingRoster, setIsCreatingRoster] = useState(false);

    // Data states
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [rosterMasterData, setRosterMasterData] = useState([]);
    const [message, setMessage] = useState("");
    const [userRole, setUserRole] = useState("");
    const [clientTimezone, setClientTimezone] = useState(null);
    const [isLoadingTimezone, setIsLoadingTimezone] = useState(false);
    const [timezoneError, setTimezoneError] = useState(null);
    const [validationMessages, setValidationMessages] = useState([]);
    const [workerSearchTerm, setWorkerSearchTerm] = useState("");

    // For child function triggers in <Scheduler />
    const [callChildAddShift, setChildCallAddShift] = useState(0);
    const [callChildCopyFunction, setChildCopyFunction] = useState(0);
    const [callChildSaveDraftFunction, setChildSaveDraftFunction] = useState(0);
    const [callChildPublishFunction, setChildCallPublishFunction] = useState(0);

    // ----------------------------
    // 3) Helper: add or remove validation messages
    // ----------------------------
    const addValidationMessage = useCallback((content, type = "info") => {
        const id = uuidv4();
        setValidationMessages((prev) => [...prev, {id, type, content}]);
        // Auto-remove after 4s
        setTimeout(() => {
            setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);

    // ----------------------------
    // 4) Update the URL whenever certain states change
    // ----------------------------
    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        // Always store which roster type
        params.set("r", activeView);
        // For "worker" view
        if (activeView === "worker") {
            params.set("vt", workerView);
            params.set("tv", timeView);
        }
        // For "client" view
        else if (activeView === "client" && selectedClientID && selectedRosterID) {
            // Store client + roster ID
            params.set("clientId", selectedClientID);
            params.set("rosterId", selectedRosterID);
        }
        router.replace(`/RosterManagement?${params.toString()}`, {shallow: true});
    }, [activeView, workerView, timeView, selectedClientID, selectedRosterID, router]);

    // Keep the URL in sync if these states change
    useEffect(() => {
        updateURL();
    }, [activeView, workerView, timeView, selectedClientID, selectedRosterID, updateURL]);

    useEffect(() => {
        // If user manually navigates to ?r=client but there's no clientId or rosterId,
        // automatically show the "Select Client" modal.
        if (activeView === "client" && (!selectedClientID || !selectedRosterID)) {
            setShowClientModal(true);
        }
    }, [activeView, selectedClientID, selectedRosterID]);

    // ----------------------------
    // 5) On mount, check user role
    // ----------------------------
    const fetchUserInfo = async () => {
        try {
            const User_ID = Cookies.get("User_ID");
            if (!User_ID) throw new Error("User_ID is missing in cookies.");

            const response = await postData("/api/getUserInfo", {User_ID});
            if (response && response.UserGroup) {
                // Example group check
                if (
                    ["Rostering Clerk", "Team Lead", "Super Admin", "All"].includes(
                        response.UserGroup
                    )
                ) {
                    setUserRole(response.UserGroup);
                } else {
                    setMessage("Roster management data is only visible to authorized roles.");
                }
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // ----------------------------
    // 6) Fetch clients + rosters
    // ----------------------------
    useEffect(() => {
        const fetchClientsData = async () => {
            try {
                const [clientData, shiftData, rosterData] = await Promise.all([
                    fetchData("/api/getClientMasterSpecificDataAll", window.location.href),
                    fetchData("/api/getApprovedShifts", window.location.href),
                    fetchData("/api/getRosterMasterData", window.location.href),
                ]);

                const rosterDataByClientID = rosterData.data.reduce((acc, r) => {
                    if (!acc[r.ClientID]) acc[r.ClientID] = [];
                    acc[r.ClientID].push(r);
                    return acc;
                }, {});

                const shiftCountByClientID = shiftData.data.reduce((acc, s) => {
                    acc[s.ClientID] = (acc[s.ClientID] || 0) + 1;
                    return acc;
                }, {});

                const combined = clientData.data.map((client) => ({
                    ...client,
                    RosterIDs: rosterDataByClientID[client.ClientID] || [],
                    shiftCount: shiftCountByClientID[client.ClientID] || 0,
                }));

                setClients(combined);
                setFilteredClients(combined);
            } catch (error) {
                console.error("Error fetching data:", error);
                addValidationMessage("Failed to fetch client data", "error");
            }
        };
        fetchClientsData();
    }, [addValidationMessage]);

    // If user enters directly with a "clientId" + "rosterId" in the URL, load that client object
    useEffect(() => {
        if (activeView === "client" && selectedClientID && selectedRosterID && clients.length > 0) {
            // Attempt to find the matching client in the "clients" array
            const foundClient = clients.find(
                (c) => `${c.ClientID}` === `${selectedClientID}`
            );
            if (foundClient) {
                setSelectedClient(foundClient);
            }
        }
    }, [activeView, selectedClientID, selectedRosterID, clients]);

    // For the selected client, fetch timezone
    const fetchClientTimezone = async (clientId) => {
        setIsLoadingTimezone(true);
        setTimezoneError(null);
        setClientTimezone(null);
        try {
            const resp = await fetchData(`/api/getClientTimezone?ClientID=${clientId}`);
            if (resp?.success) {
                setClientTimezone(resp.data?.TimeZone || null);
            } else {
                setTimezoneError(resp.error || "Failed to fetch timezone.");
            }
        } catch (error) {
            console.error("Error fetching client timezone:", error);
            setTimezoneError("An error occurred while fetching timezone.");
        } finally {
            setIsLoadingTimezone(false);
        }
    };

    // Re-fetch timezone if we have a selectedClient
    useEffect(() => {
        if (selectedClient?.ClientID) {
            fetchClientTimezone(selectedClient.ClientID);
        }
    }, [selectedClient]);

    // ----------------------------
    // 7) Handle Roster Selections
    // ----------------------------
    const handleClientRosterSelect = (client, rosterID) => {
        setSelectedClient(client);
        setSelectedClientID(client.ClientID);    // store in state
        setSelectedRosterID(rosterID);           // store in state
        setShowClientModal(false);
        handleSetActiveView("client");
    };

    // For the Worker -> setActiveView
    const handleSetActiveView = (view) => {
        setActiveView(view);
        if (view === "worker") {
            // Clear out client-based states
            setSelectedClient(null);
            setSelectedClientID(null);
            setSelectedRosterID(null);
        }
    };

    const handleSetWorkerView = (view) => {
        setWorkerView(view);
    };

    const handleSetTimeView = (view) => {
        setTimeView(view);
    };

    // ----------------------------
    // 8) Client Searching + Roster creation
    // ----------------------------
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = clients.filter((c) => {
            const fullName = (c.FirstName + " " + c.LastName).toLowerCase();
            const rosters = (c.RosterIDs || []).map((r) => r.RosterID.toLowerCase());
            return (
                fullName.includes(term) ||
                c.ClientID.toString().includes(term) ||
                rosters.some((rid) => rid.includes(term))
            );
        });
        setFilteredClients(filtered);
    };

    const handleCreateRosterClick = () => {
        setShowCreateRosterModal(true);
    };

    const handleClientSelectForRoster = async (client) => {
        setIsCreatingRoster(true);
        try {
            const rosterData = {
                ClientID: client.ClientID,
                RosterTimeZone: "UTC", // or dynamic
                RestrictedAccess: false,
                Completed: false,
                Publish: false,
            };
            const response = await postData("/api/insertRosterMasterData", rosterData);
            if (response.success) {
                // Refresh the rosters
                const updatedRosterData = await fetchData("/api/getRosterMasterData");
                setRosterMasterData(updatedRosterData.data);

                // Re-map rosters to clients
                const byClient = updatedRosterData.data.reduce((acc, r) => {
                    if (!acc[r.ClientID]) acc[r.ClientID] = [];
                    acc[r.ClientID].push(r);
                    return acc;
                }, {});
                const updatedClients = clients.map((c) => ({
                    ...c,
                    RosterIDs: byClient[c.ClientID] || [],
                }));
                setClients(updatedClients);
                setFilteredClients(updatedClients);
                setShowCreateRosterModal(false);
                alert("Roster created successfully!");
            } else {
                alert("Failed to create roster.");
            }
        } catch (error) {
            console.error("Error creating roster:", error);
            alert("An error occurred while creating the roster.");
        } finally {
            setIsCreatingRoster(false);
        }
    };

    // ----------------------------
    // 9) SHIFT ACTIONS + MODAL
    // ----------------------------
    const handleOpenModal = () => setModalShow(true);
    const handleCloseModal = () => setModalShow(false);

    // ----------------------------
    // 10) Render
    // ----------------------------
    return (
        <>
            <div className="min-h-screen gradient-background">
                {userRole ? (
                    <div className="flex h-screen pt-16">
                        {/* Sidebar */}
                        <div
                            className={`fixed top-16 bottom-0 left-0 z-20 transition-all duration-300 ${
                                isSidebarCollapsed ? "w-16" : "w-64"
                            }`}
                        >
                            <div
                                className="h-full glass dark:glass-dark border-r border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                                {/* Example Toggle or user can remove */}
                                {/* <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="absolute top-4 -right-3 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                >
                  {isSidebarCollapsed ? (
                    <ChevronsRight className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronsLeft className="h-4 w-4 text-gray-600" />
                  )}
                </button> */}

                                {/* Roster Type Toggle */}
                                <div className="p-4">
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleSetActiveView("worker")}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                activeView === "worker"
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                            }`}
                                        >
                                            <Users className="h-5 w-5"/>
                                            {!isSidebarCollapsed && <span>Worker Roster</span>}
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleSetActiveView("client");
                                                setShowClientModal(true);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                activeView === "client"
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                            }`}
                                        >
                                            <Calendar className="h-5 w-5"/>
                                            {!isSidebarCollapsed && <span>Client Roster</span>}
                                        </button>
                                    </div>
                                </div>

                                {/* If Worker Roster is active => show worker UI */}
                                {activeView === "worker" && (
                                    <div className="px-4 border-gray-200/50 dark:border-gray-700/50">
                                        {/* Worker search (example) */}
                                        <div className="pb-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder={
                                                        isSidebarCollapsed ? "Search" : "Search workers..."
                                                    }
                                                    value={workerSearchTerm}
                                                    onChange={(e) => setWorkerSearchTerm(e.target.value)}
                                                    className={`w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                                                        isSidebarCollapsed ? "text-center pl-4" : ""
                                                    }`}
                                                />
                                                <Search
                                                    className={`h-5 w-5 text-gray-400 absolute ${
                                                        isSidebarCollapsed
                                                            ? "left-1/2 -translate-x-1/2"
                                                            : "left-3"
                                                    } top-1/2 -translate-y-1/2`}
                                                />
                                            </div>
                                        </div>
                                        {/* Worker sub-views */}
                                        <div className="mb-4">
                                            <h3
                                                className={`text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 ${
                                                    isSidebarCollapsed ? "hidden" : ""
                                                }`}
                                            >
                                                View Type
                                            </h3>
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => handleSetWorkerView("availability")}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        workerView === "availability"
                                                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                                    }`}
                                                >
                                                    <Users className="h-4 w-4"/>
                                                    {!isSidebarCollapsed && <span>Availability</span>}
                                                </button>
                                                <button
                                                    onClick={() => handleSetWorkerView("shifts")}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        workerView === "shifts"
                                                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                                    }`}
                                                >
                                                    <Calendar className="h-4 w-4"/>
                                                    {!isSidebarCollapsed && <span>Shifts</span>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Time View */}
                                        <div>
                                            <h3
                                                className={`text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 ${
                                                    isSidebarCollapsed ? "hidden" : ""
                                                }`}
                                            >
                                                Time View
                                            </h3>
                                            <div className="space-y-2">
                                                {[
                                                    {id: "Week", label: "Week", icon: Calendar},
                                                    {id: "Fortnight", label: "Fortnight", icon: CalendarRange},
                                                    {id: "Month", label: "Month", icon: CalendarDays},
                                                    {id: "Day", label: "Day", icon: CalendarClock},
                                                    // (optional "Compact")
                                                    {id: "Compact", label: "Compact", icon: Calendar},
                                                ].map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleSetTimeView(item.id)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                            timeView === item.id
                                                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                                        }`}
                                                    >
                                                        <item.icon className="h-4 w-4"/>
                                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* If shifts, show actions */}
                                        {workerView === "shifts" && (
                                            <div
                                                className="mt-6 space-y-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                                                <button
                                                    onClick={() => setChildCopyFunction((c) => c + 1)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all"
                                                >
                                                    <Copy className="h-4 w-4"/>
                                                    {!isSidebarCollapsed && <span>Copy to Next Week</span>}
                                                </button>
                                                <button
                                                    onClick={() => setChildSaveDraftFunction((c) => c + 1)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all"
                                                >
                                                    <Save className="h-4 w-4"/>
                                                    {!isSidebarCollapsed && <span>Save as Draft</span>}
                                                </button>
                                                <button
                                                    onClick={() => setChildCallPublishFunction((c) => c + 1)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all"
                                                >
                                                    <Upload className="h-4 w-4"/>
                                                    {!isSidebarCollapsed && <span>Publish</span>}
                                                </button>
                                            </div>
                                        )}

                                        {/* Add Shift button */}
                                        {activeView === "worker" && (
                                            <div className="pt-4 border-b border-gray-200/50 dark:border-gray-700/50">
                                                <button
                                                    onClick={() => setChildCallAddShift((c) => c + 1)}
                                                    className={`w-full flex items-center gap-2 px-4 py-2 bg-purple-600  text-white rounded-xl hover:opacity-90 transition-opacity ${
                                                        isSidebarCollapsed ? "justify-center" : ""
                                                    }`}
                                                >
                                                    <Plus className="h-4 w-4"/>
                                                    {!isSidebarCollapsed && <span>Add Shift</span>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* If "client" is selected, show details */}
                                {activeView === "client" && (
                                    <div className="px-4 border-gray-200/50 dark:border-gray-700/50">
                                        <div className="flex items-center py-3 gap-3">
                                            <div
                                                className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                                <FileText className="h-6 w-6 text-purple-600"/>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Client ID
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {selectedClient?.ClientID || selectedClientID || "--"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex py-3 items-center gap-3">
                                            <div
                                                className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                                <UserCircle className="h-6 w-6 text-purple-600"/>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Client Name
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {selectedClient
                                                        ? `${selectedClient.FirstName} ${selectedClient.LastName}`
                                                        : "--"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center py-3 gap-3">
                                            <div
                                                className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                                <ClipboardList className="h-6 w-6 text-purple-600"/>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Roster ID
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {selectedRosterID || "--"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Add Shift for client side */}
                                {activeView === "client" && (
                                    <div className="px-4 pt-3 border-gray-200/50 dark:border-gray-700/50">
                                        <button
                                            onClick={handleOpenModal}
                                            className={`w-full flex items-center gap-2 px-4 py-2 bg-purple-600  text-white rounded-xl hover:opacity-90 transition-opacity ${
                                                isSidebarCollapsed ? "justify-center" : ""
                                            }`}
                                        >
                                            <Plus className="h-4 w-4"/>
                                            {!isSidebarCollapsed && <span>Add Shift</span>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div
                            className={`flex-1 transition-all duration-300 overflow-y-scroll overflow-x-scroll ${
                                isSidebarCollapsed ? "ml-16" : "ml-64"
                            }`}
                        >
                            <div className="p-6">
                                {activeView === "worker" ? (
                                    <Scheduler
                                        view={timeView}
                                        activeTab={workerView}
                                        onViewChange={handleSetTimeView}
                                        callAddShift={callChildAddShift}
                                        callChildCopyFunction={callChildCopyFunction}
                                        callChildPublishFunction={callChildPublishFunction}
                                        callChildSaveDraftFunction={callChildSaveDraftFunction}
                                    />
                                ) : (
                                    // Client Roster
                                    selectedClientID &&
                                    selectedRosterID && (
                                        <ClientCalendar
                                            cId={selectedClientID}
                                            clientName={
                                                selectedClient
                                                    ? `${selectedClient.FirstName} ${selectedClient.LastName}`
                                                    : "Unknown"
                                            }
                                            rId={selectedRosterID}
                                            timezone={clientTimezone}
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        {/* Client Selection Modal */}
                        {showClientModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div
                                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setShowClientModal(false)}
                                />
                                <div
                                    className="relative w-full max-w-4xl mx-4 glass bg-white dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                Select Client
                                            </h2>
                                            <button
                                                onClick={() => setShowClientModal(false)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <X className="h-5 w-5 text-gray-500"/>
                                            </button>
                                        </div>
                                        <div className="relative mb-6">
                                            <input
                                                type="text"
                                                placeholder="Search by Client ID, Name, or Roster ID"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            />
                                            <Search
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                        </div>

                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {filteredClients.length > 0 ? (
                                                <div>
                                                    {filteredClients.map((client) => (
                                                        <div
                                                            key={client.ClientID}
                                                            className="glass dark:glass-dark mb-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                                        {client.FirstName} {client.LastName}
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        Client ID: {client.ClientID}
                                                                    </p>
                                                                </div>
                                                                <div
                                                                    className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                                    {client.shiftCount} Shifts
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {client.RosterIDs.length > 0 ? (
                                                                    <>
                                                                        {client.RosterIDs.map((roster) => (
                                                                            <button
                                                                                key={roster.RosterID}
                                                                                onClick={() =>
                                                                                    handleClientRosterSelect(client, roster.RosterID)
                                                                                }
                                                                                className="px-3 py-1 rounded-lg text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90 transition-opacity"
                                                                            >
                                                                                {roster.RosterID}
                                                                            </button>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">
                                    No Rosters Available
                                  </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    No clients found.
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="flex justify-end mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                            <button
                                                onClick={() => setShowCreateRosterModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                                            >
                                                <Plus className="h-4 w-4"/>
                                                Create Roster
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create Roster Modal */}
                        {showCreateRosterModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div
                                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                                    onClick={() => setShowCreateRosterModal(false)}
                                />
                                <div
                                    className="relative w-full max-w-2xl mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                Create Roster
                                            </h2>
                                            <button
                                                onClick={() => setShowCreateRosterModal(false)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <X className="h-5 w-5 text-gray-500"/>
                                            </button>
                                        </div>

                                        <div className="relative mb-6">
                                            <input
                                                type="text"
                                                placeholder="Search by Client ID or Name"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            />
                                            <Search
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto">
                                            {filteredClients.length > 0 ? (
                                                <div className="space-y-4">
                                                    {filteredClients.map((client) => (
                                                        <button
                                                            key={client.ClientID}
                                                            onClick={() => handleClientSelectForRoster(client)}
                                                            className="w-full text-left glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                                        >
                                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                                {client.FirstName} {client.LastName}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                Client ID: {client.ClientID}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    No clients available for roster creation.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Roster creation loading overlay */}
                        {isCreatingRoster && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                                <div
                                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 flex flex-col items-center gap-4">
                                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin"/>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Creating Roster...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Typography
                        variant="h6"
                        style={{textAlign: "center", paddingTop: "250px"}}
                    >
                        {message || "You don't have access to this page"}
                    </Typography>
                )}
            </div>

            {/* SHIFT MODAL: Pass the selected client & roster to the add-shift modal */}
            <AssignShiftModal
                showModal={modalShow}
                clientId={selectedClient?.ClientID || selectedClientID}
                rosterId={selectedRosterID}
                setShowModal={handleCloseModal}
                onAddValidationMessage={addValidationMessage}
            />
        </>
    );
}
