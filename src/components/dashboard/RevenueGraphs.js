// DashboardMain.js
import React, {useEffect, useMemo, useState} from "react";
import {Box, CircularProgress, Typography} from "@mui/material";
import {fetchData} from "@/utility/api_utility"; // Adjust the path as necessary
import {addDays, format} from "date-fns";
import {Bar} from "react-chartjs-2";
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
// Import CSS module
import styles from "@/styles/dashboard.module.css";

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

function RevenueGraphs() {
    const [loading, setLoading] = useState(true);
    const [approvedShiftsData, setApprovedShiftsData] = useState([]);
    // const {colors} = useContext(ColorContext);

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch approved shifts data
                const approvedShiftsResponse = await fetchData(
                    "/api/getApprovedShiftsDashboard"
                );
                setApprovedShiftsData(approvedShiftsResponse.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Prepare data for the approved shifts bar chart
    const approvedShiftsChartData = useMemo(() => {
        // Count shifts for the next 7 days
        const today = new Date();
        const shiftsPerDay = {};

        for (let i = 0; i < 7; i++) {
            const date = format(addDays(today, i), "yyyy-MM-dd");
            shiftsPerDay[date] = 0;
        }

        approvedShiftsData.forEach((shift) => {
            const shiftDate = format(new Date(shift.ShiftStart), "yyyy-MM-dd");
            if (shiftsPerDay.hasOwnProperty(shiftDate)) {
                shiftsPerDay[shiftDate]++;
            }
        });

        const labels = Object.keys(shiftsPerDay);
        const data = Object.values(shiftsPerDay);

        return {
            labels,
            datasets: [
                {
                    label: "Approved Shifts",
                    data,
                    backgroundColor: "blue",
                },
            ],
        };
    }, [approvedShiftsData]);


    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <div className={styles.chartSection} style={{gap: "1.5rem", width: "100%"}}>
            {/* Approved Shifts Bar Chart */}
            <div className={styles.col} style={{flex: 1}}>
                <div className={styles.chartPaper}>
                    <Typography className={styles.titleText}>
                        Total service charged vs payed for last 7 days
                    </Typography>
                    <Bar
                        data={approvedShiftsChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                title: {
                                    display: false,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        precision: 0,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Approved Shifts Bar Chart */}
            <div className={styles.col} style={{flex: 1}}>
                <div className={styles.chartPaper}>
                    <Typography className={styles.titleText}>
                        Revenue by service codes for last 7 days
                    </Typography>
                    <Bar
                        data={approvedShiftsChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                title: {
                                    display: false,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        precision: 0,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

        </div>
    );
}

export default RevenueGraphs;