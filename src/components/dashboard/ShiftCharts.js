// DashboardMain.js
import React, {useContext, useEffect, useMemo, useState} from "react";
import {Box, CircularProgress} from "@mui/material";
import {fetchData} from "@/utility/api_utility"; // Adjust the path as necessary
import {addDays, format} from "date-fns";
import {BarChart3, ChartPie, LineChart as LineChartIcon, TrendingUp} from 'lucide-react';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip as ChartTooltip,
} from "chart.js";
import {Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
// Import CSS module
import styles from "@/styles/dashboard.module.css";
import ColorContext from "@/contexts/ColorContext";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    PointElement,
    LineElement
);

export default function ShiftCharts() {
    const [loading, setLoading] = useState(true);
    const [pendingApprovalShiftsCount, setPendingApprovalShiftsCount] = useState(0);
    const [approvedShiftsData, setApprovedShiftsData] = useState([]);
    // const {colors} = useContext(ColorContext);
    const [pendingApprovalShiftsData, setPendingApprovalShiftsData] = useState([]);


    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch pending approval shifts
                const pendingApprovalShiftsResponse = await fetchData("/api/getPendingApprovalShiftsDashboard");
                setPendingApprovalShiftsData(pendingApprovalShiftsResponse.data || []); // Store data in state
                setPendingApprovalShiftsCount(pendingApprovalShiftsResponse.data.length);

                console.log("pendingApprovalShiftsResponse.data", pendingApprovalShiftsResponse.data);

                // Fetch approved shifts data
                const approvedShiftsResponse = await fetchData("/api/getApprovedShiftsDashboard");
                setApprovedShiftsData(approvedShiftsResponse.data || []);

                console.log("approvedShiftsResponse.data", approvedShiftsResponse.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


    const handleRefresh = () => {
        setIsRefreshing(true);
        setApprovedShiftsData([]); // Clear data to show empty state
        setTimeout(() => {
            fetchData();
            setIsRefreshing(false);
        }, 1000);
    };

    // Prepare data for the approved shifts bar chart
    const approvedShiftsChartData = useMemo(() => {
        if (!approvedShiftsData || approvedShiftsData.length === 0) return [];

        const shiftsPerDay = {};
        const today = new Date();

        // Initialize the object with zero values for the next 7 days
        for (let i = 0; i < 7; i++) {
            const shiftDate = format(addDays(today, i), "yyyy-MM-dd");
            shiftsPerDay[shiftDate] = 0;
        }

        // Count shifts for each date
        approvedShiftsData.forEach((shift) => {
            if (!shift.ShiftStart) return;

            const shiftDate = format(new Date(shift.ShiftStart), "yyyy-MM-dd");
            if (shiftsPerDay[shiftDate] !== undefined) {
                shiftsPerDay[shiftDate]++;
            }
        });

        return Object.keys(shiftsPerDay)
            .sort((a, b) => new Date(a) - new Date(b)) // Ensure dates are sorted
            .map(date => ({date, shifts: shiftsPerDay[date]}));
    }, [approvedShiftsData]);


    // Prepare data for Pending Approval Shifts Line Chart
    const pendingApprovalShiftsChartData = useMemo(() => {
        if (!pendingApprovalShiftsData || pendingApprovalShiftsData.length === 0) return [];

        const shiftsPerDay = {};
        const startDate = new Date();
        const endDate = addDays(startDate, 7);

        // Initialize the object with zero values for each day in range
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const formattedDate = format(currentDate, "yyyy-MM-dd");
            shiftsPerDay[formattedDate] = 0;
            currentDate = addDays(currentDate, 1);
        }

        // Count shifts for each date
        pendingApprovalShiftsData.forEach((shift) => {
            if (!shift.ShiftStart) return;

            const shiftDate = format(new Date(shift.ShiftStart), "yyyy-MM-dd");
            if (shiftsPerDay[shiftDate] !== undefined) {
                shiftsPerDay[shiftDate]++;
            }
        });

        return Object.keys(shiftsPerDay)
            .sort((a, b) => new Date(a) - new Date(b)) // Ensure proper order
            .map(date => ({date, shifts: shiftsPerDay[date]}));
    }, [pendingApprovalShiftsData]);


    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress/>
            </Box>
        );
    }

    const EmptyState = ({icon: Icon, title, description}) => (
        <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="relative w-24 h-24 mb-6">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse"/>
                <div
                    className="absolute inset-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full animate-pulse"
                    style={{animationDelay: "200ms"}}
                />
                <div
                    className="absolute inset-8 bg-gradient-to-bl from-purple-600/20 to-pink-600/20 rounded-full animate-pulse"
                    style={{animationDelay: "400ms"}}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-purple-500/50"/>
                </div>
            </div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">
                {description}
            </p>
        </div>
    );
    return (
        <div className="max-w-7xl mx-auto pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Approved Shifts Chart */}
                <div
                    className="glass dark:glass-dark  rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                    <div className="flex flex-row items-center gap-2 mb-6">
                        <ChartPie className="text-purple-500"/>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Approved Shifts Over Next 7 Days
                        </h2>
                    </div>
                    <div className="h-[400px]">
                        {loading || approvedShiftsData.length === 0 ? (
                            <EmptyState
                                icon={BarChart3}
                                title="No Approved Shifts Data"
                                description="There are no approved shifts to display for the selected time period."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={approvedShiftsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                                    <XAxis
                                        className
                                        dataKey="date"
                                        stroke="rgba(156, 163, 175, 0.5)"
                                        tick={{fill: 'rgba(156, 163, 175, 0.9)', fontSize: 12}}
                                        tickFormatter={(date) => format(new Date(date), "MMM dd")}
                                        angle={-20} // Rotates labels
                                        textAnchor="end"

                                    />

                                    <YAxis
                                        stroke="rgba(156, 163, 175, 0.5)"
                                        tick={{fill: 'rgba(156, 163, 175, 0.9)'}}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)"/>
                                            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)"/>
                                        </linearGradient>
                                    </defs>
                                    <Bar
                                        dataKey="shifts"
                                        fill="url(#barGradient)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Pending Approval Shifts Chart */}
                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-6 w-6 text-pink-500"/>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Pending Approval Shifts Over Time
                        </h2>
                    </div>
                    <div className="h-[400px]">
                        {loading || approvedShiftsData.length === 0 ? (
                            <EmptyState
                                icon={LineChartIcon}
                                title="No Pending Shifts Data"
                                description="There are no pending approval shifts to display for the selected time period."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={pendingApprovalShiftsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgba(156, 163, 175, 0.5)"
                                        tick={{fill: 'rgba(156, 163, 175, 0.9)', fontSize: 12}}
                                        tickFormatter={(date) => format(new Date(date), "MMM dd")}
                                        angle={-20} // Rotates labels
                                        textAnchor="end"
                                    />

                                    <YAxis
                                        stroke="rgba(156, 163, 175, 0.5)"
                                        tick={{fill: 'rgba(156, 163, 175, 0.9)'}}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#8B5CF6"/>
                                            <stop offset="100%" stopColor="#EC4899"/>
                                        </linearGradient>
                                    </defs>
                                    <Line
                                        type="monotone"
                                        dataKey="shifts"
                                        stroke="url(#lineGradient)"
                                        strokeWidth={3}
                                        dot={{fill: '#8B5CF6', stroke: 'white', strokeWidth: 2, r: 4}}
                                        activeDot={{r: 6, stroke: 'white', strokeWidth: 2}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}