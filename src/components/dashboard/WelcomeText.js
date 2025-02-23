import React, {useEffect, useState} from "react";
import {postData} from "@/utility/api_utility";
import Cookies from "js-cookie";
import {useRouter} from 'next/router';
import {Search} from '@mui/icons-material';

function WelcomeText() {
    const [userName, setUserName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const router = useRouter();

    // Define the mapping between the display name and the route
    const routes = [
        {displayName: 'Client Agreement', path: '/client/profile/client/agreement'},
        {displayName: 'Client Profile', path: '/client/profile'},
        {displayName: 'Worker Profile', path: '/worker/profile'},
        {displayName: 'Timesheets', path: '/timesheets_main/timesheets'},
        {displayName: 'All Timesheets', path: '/timesheets_main/alltimesheets'},
        {displayName: 'Data Export Audit', path: '/timesheets_main/data_export_audit'},
        {displayName: 'Timesheet Location', path: '/timesheets_main/timesheet_location'},
        {displayName: 'Data Exports', path: '/timesheets_main/dataexports'},
        {displayName: 'Operation App Notes', path: '/operations/appnotes'},
        {displayName: 'Client Workermap', path: '/operations/clientworkermap'},
        {displayName: 'Email Client Roster', path: '/operations/emailClientRoster'},
        {displayName: 'Import CSV', path: '/operations/importcsv'},
        {displayName: 'Bulk Edit Client', path: '/operations/bulkedit/client'},
        {displayName: 'Bulk Edit Worker', path: '/operations/bulkedit/worker'},
        {displayName: 'Download Worker Roster', path: '/operations/downloadWorkerRoster'},
        {displayName: 'Email Worker', path: '/operations/emailWorker'},
        {displayName: 'Quotes', path: '/operations/quotes'},
        {displayName: 'Document Categories', path: '/maintenance/categories/document_categories'},
        {displayName: 'Equipment', path: '/maintenance/categories/equipment'},
        {displayName: 'Expenses', path: '/maintenance/categories/expenses'},
        {displayName: 'Incident', path: '/maintenance/categories/incident'},
        {displayName: 'Note Categories', path: '/maintenance/categories/note_categories'},
        {displayName: 'Payer Categories', path: '/maintenance/categories/payer_categories'},
        {displayName: 'Roster', path: '/maintenance/categories/roster'},
        {displayName: 'Service', path: '/maintenance/categories/service'},
        {displayName: 'Template', path: '/maintenance/categories/template'},
        {displayName: 'Transport', path: '/maintenance/categories/transport'},
        {displayName: 'Addresses', path: '/maintenance/addresses'},
        {displayName: 'Contact Types', path: '/maintenance/contact_types'},
        {displayName: 'Groups', path: '/maintenance/group'},
        {displayName: 'Payers', path: '/maintenance/payer'},
        {displayName: 'Vehicles', path: '/maintenance/vehicle'},
        {displayName: 'Lead Source', path: '/maintenance/leads/lead_source'},
        {displayName: 'Lead Status', path: '/maintenance/leads/lead_status'},
        {displayName: 'Documents', path: '/maintenance/documents'},
        {displayName: 'Mailer Templates', path: '/maintenance/templates/mailer_template'},
        {displayName: 'Form Templates', path: '/maintenance/templates/form_template'},
        {displayName: 'Areas', path: '/maintenance/area'},
        {displayName: 'Contacts', path: '/maintenance/contact'},
        {displayName: 'Divisions', path: '/maintenance/division'},
        {displayName: 'Locations', path: '/maintenance/location'},
        {displayName: 'Services', path: '/maintenance/services'},
        {displayName: 'Client Compliance', path: '/maintenance/clients/client_compliance'},
        {displayName: 'Compliance Template', path: '/maintenance/clients/compliance_template'},
        {displayName: 'Client Type', path: '/maintenance/clients/client_type'},
        {displayName: 'Funding Type', path: '/maintenance/clients/funding_type'},
        {displayName: 'Disability', path: '/maintenance/clients/disability'},
        {displayName: 'Leave Type', path: '/maintenance/workers/leave_type'},
        {displayName: 'Skills', path: '/maintenance/workers/skills'},
        {displayName: 'Training Items', path: '/maintenance/workers/training_items'},
        {displayName: 'Worker Compliance', path: '/maintenance/workers/worker_compliance'},
        {displayName: 'Worker Role', path: '/maintenance/workers/role'},
        {displayName: 'Worker Status', path: '/maintenance/workers/worker_status'},
        {displayName: 'Culture', path: '/maintenance/workers/culture'},
        {displayName: 'Interests', path: '/maintenance/workers/interests'},
        {displayName: 'Forms', path: '/maintenance/forms'},
        {displayName: 'Client Onboarding', path: '/onboarding/client'},
        {displayName: 'Worker Onboarding', path: '/onboarding/worker'},
        {displayName: 'Roster Management', path: '/RosterManagement'},
        {displayName: 'Location Rostering', path: '/RosterManagement/LocationRostering'},
        {displayName: 'Shift Extension', path: '/RosterManagement/ShiftExtension'},
        {displayName: 'Roster Approval', path: '/RosterManagement/RosterApproval'},
        {displayName: 'Location Roster Approval', path: '/RosterManagement/LocationRosterApproval'},
        {displayName: 'Shift Requests', path: '/RosterManagement/ShiftRequests'},
    ];


    useEffect(() => {
        const fetchDataForUser = async () => {
            const User_ID = Cookies.get("User_ID");
            if (User_ID) {
                try {
                    const [userResult] = await Promise.all([postData("/api/getUserInfo", {User_ID}).catch((err) => {
                        console.error("Error fetching user info:", err);
                        return {}; // Fallback to empty user data
                    })]);
                    setUserName(userResult?.FirstName || "Guest");
                } catch (err) {
                    console.error("Unexpected error:", err);
                }
            } else {
                console.error("User_ID is not set in cookies");
            }
        };
        fetchDataForUser();
    }, []);

    // Handle search query change
    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const suggestions = routes.filter(route =>
                route.displayName.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredRoutes(suggestions);
        } else {
            setFilteredRoutes([]);
        }
    };

    // Handle search submit
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const matchedRoute = routes.find(route =>
            route.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchedRoute) {
            console.log("1");
            router.replace(matchedRoute.path);
        } else {
            alert("No matching route found!");
        }
    };

    return (
        <div className="flex items-center justify-between mb-8 pt-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Hello {userName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Good day to work</p>
            </div>

            <div className="w-96">
                <div className="relative">
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search Menu"
                            onChange={handleSearchChange}
                            className="w-full pl-10 shadow pr-4 py-2 rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 glass dark:glass-dark"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    </form>


                </div>
                {filteredRoutes.length > 0 && (
                    <div
                        className="absolute w-96 z-50 mt-2 max-h-48 overflow-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4">
                        <ul>
                            {filteredRoutes.map((route, index) => (
                                <li
                                    key={index}
                                    onClick={() => router.push(route.path)}
                                    className="py-2 px-4 rounded-lg hover:bg-white/10 cursor-pointer text-black-100"
                                >
                                    {route.displayName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>

    );
}

export default WelcomeText;
