// DashboardMain.js
import React, {useEffect, useState} from "react";
import {Box, CircularProgress} from "@mui/material";
import {fetchData} from "@/utility/api_utility"; // Adjust the path as necessary
import {format} from "date-fns";
// Import CSS module
import styles from "@/styles/dashboard.module.css";
import {MoreVertical,} from "lucide-react";

function NewRosters() {
    const [loading, setLoading] = useState(true);
    const [newlyCreatedRosters, setNewlyCreatedRosters] = useState([]);
    const [availableWorkersCount, setAvailableWorkersCount] = useState(0);

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch both endpoints in parallel
                const [
                    newlyCreatedRostersResponse,
                    availableWorkersResponse,
                ] = await Promise.all([
                    fetchData("/api/getNewlyCreatedRosters"),
                    fetchData("/api/getAvailableWorkersToday"),
                ]);

                // Process and set state with fetched data
                console.log("newlyCreatedRostersResponse", newlyCreatedRostersResponse);
                setNewlyCreatedRosters(newlyCreatedRostersResponse.data);

                console.log("availableWorkersResponse : ", availableWorkersResponse);
                setAvailableWorkersCount(availableWorkersResponse.data.length);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress/>
            </Box>
        );
    }

    const rows = newlyCreatedRosters.slice(0, 5).map((roster, index) => ({
        id: index,
        ...roster,
        RosterDate: roster.RosterDate
            ? format(new Date(roster.RosterDate), "yyyy-MM-dd")
            : "N/A",
    }));

    const columns = [
        {field: "MasterID", headerName: "Roster ID", width: 100},
        {field: "ClientFirstName", headerName: "Client First Name", width: 150},
        {field: "ClientLastName", headerName: "Client Last Name", width: 150},
        {field: "RosterDate", headerName: "Roster Date", width: 150},
        // Add other columns as needed
    ];


    return (
        <div
            className="glass shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
            {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Recent Rosters
                </h2>
                {/* <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity">
        <Plus className="h-4 w-4 mr-2" />
        Add New
      </button> */}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            ID
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            First Name
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            Last Name
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            Date
                        </th>
                        <th className="text-left py-3 px-4"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((roster) => (
                        <tr
                            key={roster.id}
                            className="border-b border-gray-200/50 dark:border-gray-700/50"
                        >
                            <td className="py-3 px-4">{roster.MasterID}</td>
                            <td className="py-3 px-4">{roster.ClientFirstName}</td>
                            <td className="py-3 px-4">{roster.ClientLastName}</td>
                            <td className="py-3 px-4">{roster.RosterDate}</td>
                            <td className="py-3 px-4">
                                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                                    <MoreVertical className="h-5 w-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div
                className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-full blur-3xl pointer-events-none"/>
        </div>
    );
}

export default NewRosters;