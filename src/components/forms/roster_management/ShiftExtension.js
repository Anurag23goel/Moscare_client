import React, {useEffect, useState} from "react";
import {fetchData, postData} from "@/utility/api_utility";
import {ChevronDown, Search, X} from 'lucide-react';
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
};

const ShiftExtensionDetailTable = () => {
    const [shiftData, setShiftData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState([]);
    const [statusFilter, setStatusFilter] = useState("P");
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const fetchShiftData = async () => {
        setLoading(true);
        try {
            const response = await fetchData("/api/getShiftExtensionDetailDataAll", "/");
            if (response.success) {
                setShiftData(response.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftData();
    }, []);

    useEffect(() => {
        if (Array.isArray(shiftData) && shiftData.length > 0) {
            const selectedCols = [
                {field: "Status", headerName: "Status", width: 150, editable: true},
                {field: "Id", headerName: "Id", width: 150, editable: true},
                {field: "ShiftId", headerName: "Shift ID", width: 150, editable: true},
                {field: "WorkerFirstName", headerName: "Worker Name", width: 150, editable: true},
                {field: "RequestTime", headerName: "Request Time", width: 200, editable: true},
                {field: "Remarks", headerName: "Remarks", width: 200, editable: true},
                {field: "StartGeoLoc", headerName: "Start Geo Location", width: 200, editable: true},
                {field: "StartAttachment", headerName: "Start Attachment", width: 200, editable: true},
                {field: "EndGeoLoc", headerName: "End Geo Location", width: 200, editable: true},
                {field: "EndAttachment", headerName: "End Attachment", width: 200, editable: true},
            ];

            setColumns(selectedCols);
        }
    }, [shiftData]);

    const handleApprove = async (id) => {
        setLoading(true);
        try {
            const response = await postData("/api/approveShiftExtensionData", {Id: id}, "/");
            if (response.success) {
                setShiftData((prevData) =>
                    prevData.map((shift) =>
                        shift.Id === id ? {...shift, Status: "A"} : shift
                    )
                );
            } else {
                console.error("Error approving shift extension:", response.error);
            }
        } catch (error) {
            console.error("Error approving shift extension:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id) => {
        setLoading(true);
        try {
            const response = await postData("/api/rejectShiftExtensionData", {Id: id}, "/");
            if (response.success) {
                setShiftData((prevData) =>
                    prevData.map((shift) =>
                        shift.Id === id ? {...shift, Status: "R"} : shift
                    )
                );
            } else {
                console.error("Error rejecting shift extension:", response.error);
            }
        } catch (error) {
            console.error("Error rejecting shift extension:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleDialogOpen = (action, id) => {
        setSelectedAction(action);
        setSelectedId(id);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogConfirm = () => {
        if (selectedAction === "approve") {
            handleApprove(selectedId);
        } else if (selectedAction === "reject") {
            handleReject(selectedId);
        }
        handleDialogClose();
    };

    const filteredData = shiftData.filter(
        (row) =>
            row.Status === statusFilter &&
            (row.Id.toString().toLowerCase().includes(searchQuery) ||
                (row.WorkerFirstName && row.WorkerFirstName.toLowerCase().includes(searchQuery)) ||
                (row.WorkerLastName && row.WorkerLastName.toLowerCase().includes(searchQuery)) ||
                (row.WorkerFirstName && row.WorkerFirstName.toUpperCase().includes(searchQuery)) ||
                (row.WorkerLastName && row.WorkerLastName.toUpperCase().includes(searchQuery))
            )
    );

    return (
        <div className="min-h-screen gradient-background pt-24">

            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Shift Extension
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage shift extension requests
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="pl-2 mb-4"><CustomBreadcrumbs /></div>
                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="w-48 pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                            >
                                <option value="" disabled>Select Status</option>
                                <option value="P">Pending</option>
                                <option value="A">Approved</option>
                                <option value="R">Rejected</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by ID and Worker"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        </div>
                    </div>
                </div>

                
                {/* Data Grid */}
                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                    <CustomAgGridDataTable2
                        rows={filteredData}
                        columns={columns}
                        loading={loading}
                        showActions={true}
                    />
                </div>
            </div>

            {/* Confirmation Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleDialogClose}/>

                    <div
                        className="relative w-full max-w-md mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Confirm Action
                                </h2>
                                <button
                                    onClick={handleDialogClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500"/>
                                </button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to {selectedAction} this shift extension request?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleDialogClose}
                                    className="px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDialogConfirm}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftExtensionDetailTable;
