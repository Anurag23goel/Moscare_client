"use client";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { fetchData } from "@/utility/api_utility";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const generateDateRanges = (startDate, endDate, gap) => {
  let ranges = [];
  let currentStartDate = new Date(startDate);

  while (currentStartDate < new Date(endDate)) {
    let currentEndDate = addDays(currentStartDate, gap);
    ranges.push({
      start: format(currentStartDate, "dd-MM-yyyy"),
      end: format(currentEndDate, "dd-MM-yyyy"),
    });
    currentStartDate = addDays(currentEndDate, 1);
  }

  return ranges;
};

export default function AllTimesheet() {
  const [active, setActive] = useState("roster");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [disableSection, setDisableSection] = useState(false);
  const [loading, setLoading] = useState(false);

  const dateRanges = generateDateRanges("2024-05-20", "2026-01-11", 13);
  const [selectedRange, setSelectedRange] = useState({ start: "", end: "" });

  const getCookieValue = (name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const userId = getCookieValue("User_ID");

  const fetchUserRoles = async () => {
    if (!userId) {
      console.error("User_ID is not available");
      return;
    }

    try {
      const rolesData = await fetchData(
        `/api/getRolesUser/${userId}`,
        window.location.href
      );
      const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
      const specificRead = WriteData.filter(
        (role) => role.Menu_ID === "m_all_timesheet" && role.ReadOnly === 0
      );
      setDisableSection(specificRead.length === 0);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const handleSelectChange = (event) => {
    const selectedOption = dateRanges.find(
      (range) => range.start + " - " + range.end === event.target.value
    );
    setSelectedRange(selectedOption);
  };

  const handleReload = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-24 gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              All Timesheets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all timesheet records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReload}
              disabled={disableSection || isRefreshing}
              className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Date Range Selection */}
        <CustomBreadcrumbs />

        <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
          {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date Range
              </label>
              <div className="relative">
                <select
                  value={
                    selectedRange.start
                      ? `${selectedRange.start} - ${selectedRange.end}`
                      : ""
                  }
                  onChange={handleSelectChange}
                  disabled={disableSection}
                  className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                >
                  <option value="">Select a date range</option>
                  {dateRanges.map((range, index) => (
                    <option key={index} value={`${range.start} - ${range.end}`}>
                      {`${range.start} - ${range.end}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="text"
                value={selectedRange.start}
                readOnly
                disabled={disableSection}
                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="text"
                value={selectedRange.end}
                readOnly
                disabled={disableSection}
                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Data Grid Section */}
        <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActive("roster")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                active === "roster"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
              }`}
            >
              {active === "roster" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg -z-10" />
              )}
              <ClipboardList className="h-4 w-4" />
              <span>Roster</span>
            </button>

            <button
              onClick={() => setActive("timesheet")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                active === "timesheet"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
              }`}
            >
              {active === "timesheet" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg -z-10" />
              )}
              <Clock className="h-4 w-4" />
              <span>Timesheet</span>
            </button>

            <button
              onClick={() => setActive("variance")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                active === "variance"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
              }`}
            >
              {active === "variance" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg -z-10" />
              )}
              <BarChart3 className="h-4 w-4" />
              <span>Variance</span>
            </button>
          </div>

          {/* Data Grid */}
          <div className="relative">
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <CustomAgGridDataTable />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
