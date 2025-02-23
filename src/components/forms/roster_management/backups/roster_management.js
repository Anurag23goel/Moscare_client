import React, {useEffect, useState} from "react";
import Scheduler from "@/components/widgets/Scheduler";
import ClientCalendar from "@/components/widgets/ClientCalendar";
import {fetchData, postData} from "@/utility/api_utility"; // Updated to include getData
import Cookies from "js-cookie";
import {Calendar, Loader2, Plus, Search, Users, X} from 'lucide-react';

export default function ShiftDashboard() {
    const [activeTab, setActiveTab] = useState("workerScheduler");
    const [showClientModal, setShowClientModal] = useState(false);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedRosterID, setSelectedRosterID] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateRosterModal, setShowCreateRosterModal] = useState(false);
    const [isCreatingRoster, setIsCreatingRoster] = useState(false);
    const [rosterMasterData, setRosterMasterData] = useState([]);
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState('');
    // const { colors } = useContext(ColorContext);
    const [isExpanded, setIsExpanded] = useState(false);
    // New state variables for timezone
    const [clientTimezone, setClientTimezone] = useState(null);
    const [isLoadingTimezone, setIsLoadingTimezone] = useState(false);
    const [timezoneError, setTimezoneError] = useState(null);

    // New state variables for Create Roster Modal search
    const [createRosterSearchTerm, setCreateRosterSearchTerm] = useState("");
    const [filteredClientsForCreateRoster, setFilteredClientsForCreateRoster] = useState([]);

    // Function to fetch user info and assign role
    const fetchUserInfo = async () => {
        try {
            const User_ID = Cookies.get("User_ID"); // Retrieve User_ID from the cookie
            if (!User_ID) {
                throw new Error("User_ID is not defined or missing in cookies.");
            }

            const response = await postData('/api/getUserInfo', { User_ID });
            if (response && (response.UserGroup === 'Rostering Clerk' || response.UserGroup === 'Team Lead' || response.UserGroup === 'Super Admin' || response.UserGroup === 'All')) {
                setUserRole(response.UserGroup);
            } else {
                setMessage('Roster management data is only visible to Rostering Clerks');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const clientData = await fetchData(
                    "/api/getClientMasterSpecificDataAll",
                    window.location.href
                );
                const shiftData = await fetchData(
                    "/api/getApprovedShifts",
                    window.location.href
                );
                const rosterMasterData = await fetchData(
                    "/api/getRosterMasterData",
                    window.location.href
                );

                setRosterMasterData(rosterMasterData.data);

                // Map roster data by ClientID
                const rosterDataByClientID = rosterMasterData.data.reduce(
                    (acc, roster) => {
                        if (!acc[roster.ClientID]) {
                            acc[roster.ClientID] = [];
                        }
                        acc[roster.ClientID].push(roster);
                        return acc;
                    },
                    {}
                );

                // Map shift data by ClientID to get shift counts
                const shiftCountByClientID = shiftData.data.reduce((acc, shift) => {
                    acc[shift.ClientID] = (acc[shift.ClientID] || 0) + 1;
                    return acc;
                }, {});

                // Combine client data with shift data and roster data
                const combinedData = clientData.data.map((client) => ({
                    ...client,
                    RosterIDs: rosterDataByClientID[client.ClientID] || [],
                    shiftCount: shiftCountByClientID[client.ClientID] || 0,
                }));

                setClients(combinedData);
                setFilteredClients(combinedData);
                setFilteredClientsForCreateRoster(combinedData.filter(client => client.RosterIDs.length === 0));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchClients();
    }, []);

    // New function to fetch client's timezone
    const fetchClientTimezone = async (clientId) => {
        setIsLoadingTimezone(true);
        setTimezoneError(null);
        setClientTimezone(null); // Reset previous timezone
        try {
            const token = Cookies.get("authToken"); // Adjust based on where you store the token
            const response = await fetchData(`/api/getClientTimezone?ClientID=${clientId}`, {
                'Authorization': `Bearer ${token}`,
            });

            if (response.success) {
                setClientTimezone(response.data.TimeZone);
            } else {
                setTimezoneError(response.error || 'Failed to fetch timezone.');
            }
        } catch (error) {
            console.error('Error fetching client timezone:', error);
            setTimezoneError('An error occurred while fetching timezone.');
        } finally {
            setIsLoadingTimezone(false);
        }
    };

    const handleTabClick = (tab) => {
        if (tab === "clientCalendar") {
            setShowClientModal(true);
        } else {
            setActiveTab(tab);
        }
    };

    const handleClientRosterSelect = (client, rosterID) => {
        
      setSelectedClient(client);
        setSelectedRosterID(rosterID);
        setShowClientModal(false);
        setActiveTab("clientCalendar");
        console.log("client.ClientID", client.ClientID);
        // Fetch the timezone for the selected client
        fetchClientTimezone(client.ClientID);
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = clients.filter(
            (client) =>
                client.FirstName.toLowerCase().includes(term) ||
                client.LastName.toLowerCase().includes(term) ||
                client.ClientID.toString().includes(term) ||
                (client.RosterIDs &&
                    client.RosterIDs.some((roster) =>
                        roster.RosterID.toLowerCase().includes(term)
                    ))
        );
        setFilteredClients(filtered);
    };

    // New handleSearch function for Create Roster Modal
    const handleCreateRosterSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setCreateRosterSearchTerm(term);
        const filtered = clients.filter(client => client.RosterIDs.length === 0).filter(
            (client) =>
                client.FirstName.toLowerCase().includes(term) ||
                client.LastName.toLowerCase().includes(term) ||
                client.ClientID.toString().includes(term)
        );
        setFilteredClientsForCreateRoster(filtered);
    };

    // Handle Create Roster button click
    const handleCreateRosterClick = () => {
        setShowCreateRosterModal(true);
    };

    // Handle client selection for roster creation
    const handleClientSelectForRoster = async (client) => {
        setIsCreatingRoster(true);
        try {
            const rosterData = {
                ClientID: client.ClientID,
                RosterTimeZone: "UTC", // Adjust as needed or make it dynamic
                RestrictedAccess: false,
                Completed: false,
                Publish: false,
            };

            const token = Cookies.get("authToken"); // Adjust based on where you store the token
            const response = await postData(
                "/api/insertRosterMasterData",
                rosterData,
                {
                    'Authorization': `Bearer ${token}`,
                }
            );

            if (response.success) {
                // Refresh the roster data
                const updatedRosterMasterData = await fetchData(
                    "/api/getRosterMasterData",
                    window.location.href
                );

                setRosterMasterData(updatedRosterMasterData.data);

                // Map roster data by ClientID
                const rosterDataByClientID = updatedRosterMasterData.data.reduce(
                    (acc, roster) => {
                        if (!acc[roster.ClientID]) {
                            acc[roster.ClientID] = [];
                        }
                        acc[roster.ClientID].push(roster);
                        return acc;
                    },
                    {}
                );

                const updatedClients = clients.map((c) => ({
                    ...c,
                    RosterIDs: rosterDataByClientID[c.ClientID] || [],
                }));

                setClients(updatedClients);
                setFilteredClients(updatedClients);
                setFilteredClientsForCreateRoster(updatedClients.filter(client => client.RosterIDs.length === 0));
                setShowCreateRosterModal(false);
                alert("Roster created successfully!");
            } else {
                alert(response.error || "Failed to create roster.");
            }
        } catch (error) {
            console.error("Error creating roster:", error);
            alert("An error occurred while creating the roster.");
        } finally {
            setIsCreatingRoster(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 gradient-background">
          
          
          {userRole ? (
            <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="flex flex-row items-center justify-between mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Shift Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage worker schedules and client rosters
                  </p>
                </div>
              </div>
    
              {/* Tabs */}
              <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 mb-6 inline-flex gap-2">
                <button
                  onClick={() => handleTabClick("workerScheduler")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === "workerScheduler"
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Worker View</span>
                </button>
                
                <button
                  onClick={() => handleTabClick("clientCalendar")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === "clientCalendar"
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Client View</span>
                </button>
              </div>
              </div>
              {/* Content */}
              <div className="">
                <div className="" />
                
                {activeTab === "workerScheduler" && <Scheduler />}
                {activeTab === "clientCalendar" && selectedClient && selectedRosterID && (
                  <ClientCalendar
                    cId={selectedClient.ClientID}
                    clientName={`${selectedClient.FirstName} ${selectedClient.LastName}`}
                    rId={selectedRosterID}
                    timezone={clientTimezone}
                  />
                )}
              </div>
    
              {/* Client Selection Modal */}
              {showClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowClientModal(false)} />
                  
                  <div className="relative w-full max-w-3xl mx-4  bg-white dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Select Client
                        </h2>
                        <button
                          onClick={() => setShowClientModal(false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
    
                      {/* Search */}
                      <div className="relative mb-6">
                        <input
                          type="text"
                          placeholder="Search by Client ID, Name, or Roster ID"
                          value={searchTerm}
                          onChange={handleSearch}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
    
                      {/* Client List */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {filteredClients.length > 0 ? (
                          <div className="space-y-4">
                            {filteredClients.map((client) => (
                              <div
                                key={client.ClientID}
                                className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                      {client.FirstName} {client.LastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Client ID: {client.ClientID}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                      {client.shiftCount} Shifts
                                    </div>
                                  </div>
                                </div>
    
                                {/* Rosters */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {client.RosterIDs.length > 0 ? (
                                    client.RosterIDs.map((roster) => (
                                      <button
                                        key={roster.RosterID}
                                        onClick={() => handleClientRosterSelect(client, roster.RosterID)}
                                        className="px-3 py-1 rounded-lg text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90 transition-opacity"
                                      >
                                        {roster.RosterID}
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">No Rosters Available</span>
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
    
                      {/* Footer */}
                      <div className="flex justify-end mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                        <button
                          onClick={handleCreateRosterClick}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                        >
                          <Plus className="h-4 w-4" />
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
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreateRosterModal(false)} />
                  
                  <div className="relative w-full max-w-2xl mx-4 glass bg-white dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Create Roster
                        </h2>
                        <button
                          onClick={() => setShowCreateRosterModal(false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
    
                      {/* Search */}
                      <div className="relative mb-6">
                        <input
                          type="text"
                          placeholder="Search by Client ID or Name"
                          value={createRosterSearchTerm}
                          onChange={handleCreateRosterSearch}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
    
                      {/* Client List */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {filteredClientsForCreateRoster.length > 0 ? (
                          <div className="space-y-4">
                            {filteredClientsForCreateRoster.map((client) => (
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
    
              {/* Loading Overlay */}
              {isCreatingRoster && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-300">Creating Roster...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Access Restricted
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {message || "You don't have access to this page"}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }