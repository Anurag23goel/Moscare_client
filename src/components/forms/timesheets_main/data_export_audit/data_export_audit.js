"use client";

import { useEffect, useState } from "react";
import { compareDesc, format, isToday, parseISO } from "date-fns";
import { ChevronDown, Code, RefreshCw, Terminal, X } from "lucide-react";
import { fetchData, getColumns } from "@/utility/api_utility";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

export default function DataExportAudit() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  // const { colors, loading: colorLoading } = useContext(ColorContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [dateRanges, setDateRanges] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const getData = async () => {
    const data = await fetchData("/api/getDataExportAuditAll");

    const filteredData = data.data.filter((item) => {
      try {
        const response = JSON.parse(item.Response);
        console.log(response);
        return response;
      } catch (error) {
        console.error("Error parsing response:", error);
        return false;
      }
    });

    setData(filteredData);
    setColumns(getColumns(data));

    let dates = filteredData.map((item) =>
      format(parseISO(item.TimeOfExport), "yyyy-MM-dd")
    );

    dates = [...new Set(dates)];

    const sortedDates = dates.sort((a, b) =>
      compareDesc(parseISO(a), parseISO(b))
    );

    const todayDate =
      sortedDates.find((date) => isToday(parseISO(date))) || sortedDates[0];

    setDateRanges(sortedDates);
    setSelectedDate(todayDate);

    const filtered = filteredData.filter(
      (item) => format(parseISO(item.TimeOfExport), "yyyy-MM-dd") === todayDate
    );
    setFilteredData(filtered);
  };

  const handleDateChange = (newValue) => {
    console.log(selectedDate);
    if (newValue) {
      setSelectedDate(newValue);
      const filtered = data.filter(
        (item) => format(parseISO(item.TimeOfExport), "yyyy-MM-dd") === newValue
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  const handleSelectRowClick = (row) => {
    setSelectedRowData(row);
    setShowModal(true);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const requestData = JSON.parse(selectedRowData.Request || "{}");
  const responseData = JSON.parse(selectedRowData.Response || "{}");

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Data Export Audit
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and monitor data export activities
            </p>
          </div>

          <button
            // onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 text-gray-600 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {/* Date Selection */}
        <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <div className="relative">
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
              >
                {dateRanges.map((date) => (
                  <option key={date} value={date}>
                    {format(parseISO(date), "PPP")}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

          <CustomAgGridDataTable
            rows={filteredData}
            columns={columns?.filter(
              (col) =>
                ![
                  "Maker User",
                  "Maker Date",
                  "Update User",
                  "Update Time",
                ].includes(col.headerName)
            )}
            rowSelected={handleSelectRowClick}
            isDataExportAudit={true}
          />
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-3xl mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Export Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* General Information */}
                <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    General Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">
                        Request ID
                      </label>
                      <p className="text-sm font-medium">
                        {selectedRowData.RequestID}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">
                        Export Type
                      </label>
                      <p className="text-sm font-medium">
                        {selectedRowData.TypeOfExport}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">User</label>
                      <p className="text-sm font-medium">
                        {selectedRowData.FirstName} {selectedRowData.LastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">User ID</label>
                      <p className="text-sm font-medium">
                        {selectedRowData.UserExported}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Request Details
                    </h3>
                    <Code className="h-4 w-4 text-gray-400" />
                  </div>
                  <pre className="text-sm bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
                    {JSON.stringify(
                      JSON.parse(selectedRowData.Request || "{}"),
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* Response */}
                <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Response
                    </h3>
                    <Terminal className="h-4 w-4 text-gray-400" />
                  </div>
                  <pre className="text-sm bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
                    {JSON.stringify(
                      JSON.parse(selectedRowData.Response || "{}"),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
