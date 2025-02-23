// DashboardMain.js
import React, {useEffect, useState} from "react";
import {Box, CircularProgress} from "@mui/material";
import {fetchData} from "@/utility/api_utility"; // Adjust the path as necessary
// Import CSS module
import styles from "@/styles/dashboard.module.css";
import {MoreVertical, Plus,} from "lucide-react";


function AvailableWorkerToday() {
    const [loading, setLoading] = useState(true);
    const [availableWorkers, setAvailableWorkers] = useState([]);

    const generatePFPFolderPath = (company, WorkerID, filename) => {
        return `${company}/worker/${WorkerID}/profile_picture/${filename}`;
    };

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch available workers today
                const availableWorkersResponse = await fetchData(
                    "/api/getAvailableWorkersToday"
                );

                const workerData = availableWorkersResponse.data;

                const updatedData = await Promise.all(
                    workerData.map(async (worker) => {
                        if (worker.Folder) {
                            const company = process.env.NEXT_PUBLIC_COMPANY;
                            const fileName = encodeURIComponent(worker.File);
                            const folderPath = generatePFPFolderPath(
                                company,
                                worker.WorkerID,
                                fileName
                            );
                            console.log("folderPath : ", folderPath);
                            try {
                                const userProfileResponse = await fetchData(
                                    `/api/getS3Data/${folderPath}`
                                );
                                const {dataURL} = userProfileResponse;
                                console.log("dataURL : ", dataURL);
                                const fileResponse = await fetch(dataURL);

                                if (!fileResponse.ok) {
                                    console.error("Error while fetching file.");
                                }

                                const fileBlob = await fileResponse.blob();
                                const fileUrl = URL.createObjectURL(fileBlob);
                                console.log("fileUrl : ", fileUrl);
                                return {...worker, UserProfile: dataURL};
                            } catch (error) {
                                console.error(
                                    `Error fetching profile for WorkerID ${worker.WorkerID}:`,
                                    error
                                );
                                return {...worker, UserProfile: null}; // Handle errors gracefully
                            }
                        }
                        return {...worker, UserProfile: null}; // No Folder path
                    })
                );

                console.log("availableWorkersResponse : ", availableWorkersResponse);
                console.log(availableWorkersResponse);
                setAvailableWorkers(updatedData);

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

    return (
        <div
            className="glass mb-8 shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden mt-8">
            {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Available Workers Today
                </h2>
                <button
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4 mr-2"/>
                    Add Worker
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            Profile Image
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            Worker ID
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            First Name
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">
                            Last Name
                        </th>
                        <th className="text-left py-3 px-4"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {availableWorkers.map((worker, index) => (
                        <tr
                            key={index}
                            className="border-b border-gray-200/50 dark:border-gray-700/50"
                        >
                            <td className="py-3 px-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                    <img
                                        src={worker.UserProfile}
                                        alt={`${worker.FirstName} ${worker.LastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </td>
                            <td className="py-3 px-4">{worker.WorkerID}</td>
                            <td className="py-3 px-4">{worker.FirstName}</td>
                            <td className="py-3 px-4">{worker.LastName}</td>
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

export default AvailableWorkerToday;
