// DashboardMain.js
import React, {useEffect, useState} from "react";
import {Box, CircularProgress} from "@mui/material";
import {fetchData} from "@/utility/api_utility"; // Adjust the path as necessary
// Import CSS module
import styles from "@/styles/dashboard.module.css";
import {ArrowLeftRight, Calendar, CalendarClock, Clock, FileWarning, Users,} from "lucide-react";

function DailyInsights() {
    const [loading, setLoading] = useState(true);

    // State variables
    const [totalShiftsToday, setTotalShiftsToday] = useState(0);
    const [unallocatedShiftsCount, setUnallocatedShiftsCount] = useState(0);
    const [nonCompliantWorkersCount, setNonCompliantWorkersCount] = useState(0);
    const [nonCompliantClientsCount, setNonCompliantClientsCount] = useState(0);
    const [pendingShiftRequests, setPendingShiftRequests] = useState([]);
    const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
    const [pendingApprovalShiftsCount, setPendingApprovalShiftsCount] = useState(0);
    // const {colors} = useContext(ColorContext);

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [
                    totalShiftsResponse,
                    unallocatedShiftsResponse,
                    nonCompliantWorkersResponse,
                    nonCompliantClientsResponse,
                    pendingShiftRequestsResponse,
                    pendingLeaveRequestsResponse,
                    pendingApprovalShiftsResponse,
                ] = await Promise.all([
                    fetchData("/api/getTotalShiftsToday"),
                    fetchData("/api/getApprovedShiftsUnallocated"),
                    fetchData("/api/getNonCompliantWorkers"),
                    fetchData("/api/getNonCompliantClients"),
                    fetchData("/api/getPendingShiftRequests"),
                    fetchData("/api/getWorkerLeaveRequest"),
                    fetchData("/api/getPendingApprovalShiftsDashboard"),
                ]);

                // Set state with fetched data
                setTotalShiftsToday(totalShiftsResponse.totalShifts);
                setUnallocatedShiftsCount(unallocatedShiftsResponse.data.length);
                setNonCompliantWorkersCount(nonCompliantWorkersResponse.data.length);
                setNonCompliantClientsCount(nonCompliantClientsResponse.data.length);
                setPendingShiftRequests(pendingShiftRequestsResponse.data);
                setPendingLeaveRequests(pendingLeaveRequestsResponse.data);
                setPendingApprovalShiftsCount(pendingApprovalShiftsResponse.data.length);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const metrics = [
        {
            title: "Total Shifts Today",
            value: totalShiftsToday,
            icon: Calendar,
            color: "bg-gradient-to-br from-pink-400 to-pink-600",
            bgColor: "bg-gradient-to-br from-pink-50 to-pink-100/20",
        },
        {
            title: "Unallocated Shifts",
            value: unallocatedShiftsCount,
            icon: Clock,
            color: "bg-gradient-to-br from-blue-400 to-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/20",
        },
        {
            title: "Non-Compliant Clients",
            value: nonCompliantClientsCount,
            icon: FileWarning,
            color: "bg-gradient-to-br from-orange-400 to-orange-600",
            bgColor: "bg-gradient-to-br from-orange-50 to-orange-100/20",
        },
        {
            title: "Non-Compliant Workers",
            value: nonCompliantWorkersCount,
            icon: Users,
            color: "bg-gradient-to-br from-green-400 to-green-600",
            bgColor: "bg-gradient-to-br from-green-50 to-green-100/20",
        },
        {
            title: "Pending Shift Requests",
            value: pendingShiftRequests.length,
            icon: ArrowLeftRight,
            color: "bg-gradient-to-br from-purple-400 to-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/20",
        },
        {
            title: "Pending Approval Shifts",
            value: pendingApprovalShiftsCount,
            icon: CalendarClock,
            color: "bg-gradient-to-br from-rose-400 to-rose-600",
            bgColor: "bg-gradient-to-br from-rose-50 to-rose-100/20",
        },
    ];

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden rounded-2xl shadow glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 p-6 group hover:shadow-lg transition-all duration-300 ${metric.bgColor}`}
                >
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {metric.title}
                            </p>
                            <p className="text-3xl font-bold mt-2 bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                {metric.value}
                            </p>
                        </div>
                        <div
                            className={`rounded-2xl p-3 ${metric.color} group-hover:scale-105 transition-transform duration-300`}
                        >
                            <metric.icon className="h-6 w-6 text-white"/>
                        </div>
                    </div>
                    <div
                        className="absolute -bottom-1 -right-1 w-24 h-24 bg-gradient-to-br from-white/0 to-white/20 dark:from-white/0 dark:to-white/5 rounded-full blur-2xl pointer-events-none"/>
                </div>
            ))}
        </div>
    );
}

export default DailyInsights;