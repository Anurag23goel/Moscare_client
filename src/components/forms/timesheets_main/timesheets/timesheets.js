// src/components/forms/timesheets_main/timesheets/TimesheetsMain.jsx

import React, { useContext, useEffect, useState } from "react";
import { postData } from "@/utility/api_utility";
import ActivityList from "./ActivityList";
import DateRangePickerModal from "./DateRangePickerModal";
import Cookies from "js-cookie";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import ColorContext from "@/contexts/ColorContext";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const TimesheetsMain = ({ addValidationMessage }) => {
  // const {colors, loading: colorLoading} = useContext(ColorContext);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activities, setActivities] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [message, setMessage] = useState("");
  const [availableDateRanges, setAvailableDateRanges] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("P");
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Function to fetch user info and assign role
  const fetchUserInfo = async () => {
    try {
      const User_ID = Cookies.get("User_ID");
      if (!User_ID) {
        throw new Error("User_ID is not defined or missing in cookies.");
      }

      const response = await postData("/api/getUserInfo", { User_ID });
      if (
        response &&
        (response.UserGroup === "Team Lead" ||
          response.UserGroup === "Rostering Manager" ||
          response.UserGroup === "Super Admin")
      ) {
        setUserRole(response.UserGroup);
        // Optionally notify on successful role fetch
        // Uncomment the next line if you want to notify on successful role assignment
        // addValidationMessage("User role fetched successfully!", "success");
      } else {
        setMessage(
          "Timesheet data is only visible to Team Leads and Rostering Managers."
        );
        addValidationMessage("Unauthorized access.", "error");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      addValidationMessage(
        error.message || "Failed to fetch user info.",
        "error"
      );
    }
  };

  // Function to fetch timesheet data based on the selected date range
  const fetchTimesheetData = async () => {
    if (!startDate || !endDate) {
      addValidationMessage(
        "Please select both start and end dates.",
        "warning"
      );
      return;
    }

    // Reset activities and messages
    setActivities([]);
    setMessage("");

    const User_ID = Cookies.get("User_ID");
    const statuses = ["P", "A", "R"];
    let allData = [];

    for (const status of statuses) {
      const params = {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        status,
      };

      if (userRole === "Team Lead") {
        params.TlId = User_ID;
      } else if (userRole === "Rostering Manager") {
        params.RmId = User_ID;
      }

      try {
        const response = await postData("/api/getFullTimesheetDetails", params);
        if (response && Array.isArray(response.data)) {
          allData = allData.concat(response.data);
          console.log("Response :", allData);
          // Removed individual success messages to reduce clutter
        } else {
          console.error(
            `Fetched timesheet data for status ${status} is not an array:`,
            response
          );
          // Retain only critical error messages
          addValidationMessage(
            `Invalid data format for status ${status}.`,
            "error"
          );
        }
      } catch (error) {
        console.error(
          `Error fetching timesheet data for status ${status}:`,
          error?.message
        );
        addValidationMessage(
          `Failed to fetch data for status ${status}: ${error?.message}`,
          "error"
        );
      }
    }

    if (allData.length === 0) {
      fetchAvailableDateRanges();
      // Inform the user that no data was found
      addValidationMessage(
        "No timesheet data found for the selected date range.",
        "info"
      );
    } else {
      setActivities(allData);
      setMessage("");
    }
  };

  // Group date ranges by week (Sunday to Saturday)
  const groupDatesByWeek = (dates) => {
    const weeks = {};
    dates.forEach((date) => {
      const weekStart = startOfWeek(new Date(date.startDate), {
        weekStartsOn: 0,
      });
      const weekEnd = endOfWeek(new Date(date.startDate), { weekStartsOn: 0 });
      const weekRange = `${format(weekStart, "dd MMMM yyyy")} - ${format(
        weekEnd,
        "dd MMMM yyyy"
      )}`;

      if (!weeks[weekRange]) {
        weeks[weekRange] = [];
      }
      weeks[weekRange].push(date);
    });

    return Object.keys(weeks).sort(
      (a, b) => new Date(a.split(" - ")[0]) - new Date(b.split(" - ")[0])
    );
  };

  // Function to fetch available date ranges in the current month
  const fetchAvailableDateRanges = async () => {
    const User_ID = Cookies.get("User_ID");
    const params = {
      TlId: User_ID,
      startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    };

    try {
      const response = await postData("/api/getFullTimesheetDetails", params);
      if (response && Array.isArray(response.data)) {
        const dateRanges = response.data.map((item) => ({
          startDate: format(new Date(item.ShiftStartDate), "yyyy-MM-dd"),
          endDate: format(new Date(item.ShiftEndDate), "yyyy-MM-dd"),
        }));

        const groupedDateRanges = groupDatesByWeek(dateRanges);
        setAvailableDateRanges(groupedDateRanges);
      } else {
        console.error(
          "Fetched available date ranges data is not an array:",
          response
        );
        addValidationMessage(
          "Invalid data format for available date ranges.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching available date ranges:", error.message);
      addValidationMessage("Failed to fetch available date ranges.", "error");
    }
  };

  useEffect(() => {
    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchTimesheetData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handleDateSelection = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
    handleClosePopover();
  };

  // Function to filter activities based on status and user role
  const filterActivitiesByStatus = (status) => {
    if (userRole === "Team Lead") {
      return activities.filter((item) => item.TlStatus === status);
    } else if (userRole === "Rostering Manager") {
      return activities.filter(
        (item) => item.TlStatus === "A" && item.RmStatus === status
      );
    }
    return [];
  };

  // Function to count activities by status
  const countByStatus = (status) => {
    return filterActivitiesByStatus(status).length;
  };

  // Function to handle reload action
  const handleReload = () => {
    fetchTimesheetData();
    addValidationMessage("Data reloaded successfully!", "success");
  };

  // Function to handle opening the Popover
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle closing the Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // If colors are still loading, show loading state
  // if (colorLoading) {
  //     return <div>Loading...</div>;
  // }

  return (
    <div className="min-h-screen gradient-background pt-24">
      {userRole ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Timesheet Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and approve worker timesheets
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAnchorEl(true)}
                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <CalendarDays className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">
                  {startDate ? format(startDate, "dd MMM yyyy") : "Start"} -{" "}
                  {endDate ? format(endDate, "dd MMM yyyy") : "End"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              <button
                onClick={() => handleReload()}
                className={`p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  isRefreshing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-5 w-5 text-gray-600 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <CustomBreadcrumbs />

          <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 mb-6 inline-flex gap-2">
            {[
              {
                id: "P",
                label: "Pending",
                icon: Clock,
                count: countByStatus("P"),
              },
              {
                id: "A",
                label: "Approved",
                icon: CheckCircle2,
                count: countByStatus("A"),
              },
              {
                id: "R",
                label: "Rejected",
                icon: XCircle,
                count: countByStatus("R"),
              },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setCurrentStatus(status.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  currentStatus === status.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                }`}
              >
                <status.icon className="h-4 w-4" />
                <span>{status.label}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                  {status.count}
                </span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

            {/* Activity List */}
            <ActivityList
              addValidationMessage={addValidationMessage}
              startDate={startDate}
              endDate={endDate}
              status={currentStatus}
              activities={filterActivitiesByStatus(currentStatus)}
              role={userRole}
              fetchTimesheetData={fetchTimesheetData}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 max-w-md text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message ||
                "You don't have access to this page. Please contact your administrator."}
            </p>
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      {anchorEl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setAnchorEl(null)}
          />

          <div className="relative w-full max-w-md mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Select Date Range
                </h2>
                <button
                  onClick={() => setAnchorEl(null)}
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

export default TimesheetsMain;
