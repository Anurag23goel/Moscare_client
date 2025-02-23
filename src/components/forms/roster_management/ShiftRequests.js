// src/components/forms/timesheets_main/shiftRequests/ShiftRequests.jsx

import React, { useContext, useEffect, useState } from "react";
import { fetchData, putData } from "@/utility/api_utility";
import { useRouter } from "next/router";
import ColorContext from "@/contexts/ColorContext";
import DateRangePickerModal from "../timesheets_main/timesheets/DateRangePickerModal"; // Adjust the path as needed
import { format } from "date-fns";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Plus,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const ShiftRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredData, setFilteredRequests] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState("");
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const router = useRouter();
  const [isShiftExists, setIsShiftExists] = useState(true);
  // const {colors} = useContext(ColorContext);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // New state variables for date range picker
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchShiftRequests = async () => {
    try {
      const response = await fetchData("/api/getAllShiftRequests");
      setRequests(response.data);
      setFilteredRequests(response.data);

      console.log("Request Shifts", response);
    } catch (error) {
      console.error("Error fetching shift requests:", error);
      // Optionally, handle the error (e.g., show a notification)
    }
  };

  useEffect(() => {
    fetchShiftRequests();
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      const firstRow = requests[0];
      const dynamicColumns = Object.keys(firstRow).map((key) => ({
        field: key,
        headerName: key,
      }));
      // console.log("dynamicColumns", filteredData);
      setColumns(dynamicColumns);
    }
  }, [requests]);

  const filterShiftRequestsByDate = (StartDate, EndDate) => {
    if (!StartDate || !EndDate) {
      setFilteredRequests(requests);
      return;
    }

    const start = new Date(StartDate);
    const end = new Date(EndDate);

    const filtered = requests.filter((shift) => {
      const shiftDate = new Date(shift.ShiftDate);
      return shiftDate >= start && shiftDate <= end;
    });

    setFilteredRequests(filtered);
  };

  const handleApprove = async () => {
    try {
      await putData(`/api/updateShiftRequestStatus/${selectedRequest.ID}`, {
        Status: "A",
        StatusReason: comment,
        UpdateUser: "",
      });
      setComment("");
      setShowModal(false);
      fetchShiftRequests();
      // Optionally, show a success notification
    } catch (error) {
      console.error("Error approving shift request:", error);
      // Optionally, handle the error
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment before rejecting the request.");
      return;
    }
    try {
      await putData(`/api/updateShiftRequestStatus/${selectedRequest.ID}`, {
        Status: "R",
        StatusReason: comment,
        UpdateUser: "",
      });
      setComment("");
      setShowModal(false);
      fetchShiftRequests();
      // Optionally, show a success notification
    } catch (error) {
      console.error("Error rejecting shift request:", error);
      // Optionally, handle the error
    }
  };

  const handleMakeShift = () => {
    // Set data for the modal based on selectedRequest
    setModalData({
      ID: selectedRequest?.ID,
      ClientID: selectedRequest?.ClientID,
      ShiftStartDate: selectedRequest?.ShiftDate,
      ShiftStart: selectedRequest?.ShiftStart,
      ShiftEnd: selectedRequest?.ShiftEnd,
      ServiceCode: selectedRequest?.ServiceCode,
      RecurrenceSentence: selectedRequest?.RecurrenceSentence,
      Status: selectedRequest?.Status,
      interval: selectedRequest?.IntervalData,
      Service: selectedRequest?.Description, // Changed from Description to Service
      Pay_Rate_1: selectedRequest?.Pay_Rate_1,
      ChargeRate_1: selectedRequest?.ChargeRate_1,
    });
    // Show the modal
    setShowAddShiftModal(true);
    setShowModal(false);
  };

  useEffect(() => {
    const getIsShiftExists = async () => {
      if (selectedRequest) {
        const params = new URLSearchParams({
          ClientID: selectedRequest.ClientID,
          ServiceCode: selectedRequest.ServiceCode,
          ShiftStart: selectedRequest.ShiftStart,
          ShiftEnd: selectedRequest.ShiftEnd,
        });

        try {
          const response = await fetchData(
            `/api/isShiftExits?${params.toString()}`
          );
          console.log("getIsShiftExists:", response);
          setIsShiftExists(response.exists);
        } catch (error) {
          console.error("Error checking if shift exists:", error);
          // Optionally, handle the error
        }
      }
    };

    getIsShiftExists();
  }, [selectedRequest]);

  // Functions for Date Range Picker
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDateSelection = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
    handleClosePopover();
    filterShiftRequestsByDate(startDate, endDate);
  };

  return (
    <div className="min-h-screen pt-24 gradient-background">
      {/* <PatternBackground /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shift Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and process shift extension requests
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Date Range Selector */}
            <button
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">
                {startDate ? format(startDate, "dd MMM yyyy") : "Start"} -{" "}
                {endDate ? format(endDate, "dd MMM yyyy") : "End"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  fetchShiftRequests();
                  setStartDate(null);
                  setEndDate(null);
                  setTimeout(() => setIsRefreshing(false), 1000);
                }}
                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        <CustomBreadcrumbs />
        {/* Data Grid */}

        <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

          <CustomAgGridDataTable2
            rows={filteredData}
            columns={columns}
            rowSelected={(row) => {
              setSelectedRequest(row);
              setComment(row.StatusReason);
              setShowModal(true);
            }}
            onEdit={(row) => {
              setSelectedRequest(row);
              setComment(row.StatusReason);
              setShowModal(true);
            }}
          />
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-4xl bg-white mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Shift Request Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Request Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID
                  </label>
                  <input
                    type="text"
                    value={selectedRequest?.ID || ""}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shift Date
                  </label>
                  <input
                    type="text"
                    value={
                      selectedRequest
                        ? format(
                            new Date(selectedRequest.ShiftDate),
                            "dd MMM yyyy"
                          )
                        : ""
                    }
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={selectedRequest?.ClientID || ""}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Code
                  </label>
                  <input
                    type="text"
                    value={selectedRequest?.ServiceCode || ""}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service
                  </label>
                  <input
                    type="text"
                    value={selectedRequest?.Description || ""}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recurrence
                  </label>
                  <input
                    type="text"
                    value={selectedRequest?.RecurrenceSentence || ""}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                      selectedRequest?.Status === "P"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : selectedRequest?.Status === "A"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {selectedRequest?.Status === "P" ? (
                      <Clock className="h-4 w-4" />
                    ) : selectedRequest?.Status === "A" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span>
                      {selectedRequest?.Status === "P"
                        ? "Pending"
                        : selectedRequest?.Status === "A"
                        ? "Approved"
                        : "Rejected"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={selectedRequest?.Status !== "P"}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-50/50 dark:disabled:bg-gray-800/50"
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                {selectedRequest?.Status === "P" && (
                  <>
                    <button
                      onClick={handleApprove}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                {selectedRequest?.Status === "A" && !isShiftExists && (
                  <button
                    onClick={handleMakeShift}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Make Shift</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDatePicker(false)}
          />

          <div className="relative w-full max-w-lg mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Select Date Range
                </h2>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <DateRangePickerModal
                onDateSelect={handleDateSelection}
                currentRange={{ startDate, endDate }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftRequests;
