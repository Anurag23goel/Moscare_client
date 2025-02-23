import { fetchData, getColumns, putData } from "@/utility/api_utility";
import React, { useEffect, useState } from "react";
import UpdateAppNotes from "./update_app_notes";

const AppNotes = () => {
  const [appNotesData, setAppNotesData] = useState("");
  const [appFilterNotesData, setAppFilterNotesData] = useState("");
  // const [selectedRowData, setSelectedRowData] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fetchSelected, setFetchSelected] = useState("Show All Read Status");
  const [readRows, setReadRows] = useState({});
  const [selectedRowData, setSelectedRowData] = useState({
    Priority: "", // Initial
    Category: "",
    AssignedTo: "",
    Collaborators: "",
    Status: "",
    Read: "",
    // other fields...
  });
  const [columns, setColumns] = useState([]);

  const fetchAppNotesData = async () => {
    try {
      const data = await fetchData(
        `/api/getAppNotesFullData`,
        window.location.href
      );
      return data;
    } catch (error) {
      console.error("Error fetching client document data:", error);
      return { data: [] }; // Return an empty array in case of an error
    }
  };

  const fetchAndSetAppNotesData = async () => {
    const data = await fetchAppNotesData();
    setAppNotesData(data);
    setColumns(getColumns(data));
    setAppFilterNotesData(data);
  };

  const handleSelectRowClick = (row) => {
    setSelectedRowData(row);
  };

  const handleMarkAsRead = async (rowId) => {
    try {
      // Fetch current data for the selected row
      const { data: currentData } = await fetchData(
        `/api/getAppNotesDataByID/${rowId}`
      );
      const note = currentData[0];

      // Prepare the data for update
      const updatedData = {
        Category: note.Category,
        Priority: note.Priority,
        AssignedTo: note.AssignedTo,
        Collaborators: note.Collaborators,
        Read: "Read by moscare",
        Status: "Y",
      };

      await putData(`/api/updateAppNotes/${rowId}`, updatedData);

      setReadRows((prevReadRows) => ({
        ...prevReadRows,
        [rowId]: "Read by moscare",
      }));

      fetchAndSetAppNotesData();
      console.log(`Row with ID ${rowId} marked as read.`);
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  };

  const parseTimeAndDate = (timeAndDateStr) => {
    // Example format: "07:15am 07/06/2024"
    const [timePart, datePart] = timeAndDateStr.split(" ");
    const [hoursMinutes, period] = timePart.split(/(?=[ap]m)/); // Splitting hours and minutes from am/pm
    const [day, month, year] = datePart.split("/").map(Number); // Parsing day, month, and year

    // Parsing hours and minutes
    const [hours, minutes] = hoursMinutes.split(":").map(Number);
    // Adjusting hours for am/pm
    const parsedHours =
      period === "am"
        ? hours === 12
          ? 0
          : hours
        : hours === 12
        ? 12
        : hours + 12;

    // Creating Date object with adjusted hours, minutes, month, day, year
    return new Date(year, month - 1, day, parsedHours, minutes);
  };

  const filterData = () => {
    const filteredData = appNotesData.data?.filter((item) => {
      const itemDate = parseTimeAndDate(item.TimeAndDate);
      const fromDateTime = fromDate ? new Date(fromDate) : null;
      const toDateTime = toDate ? new Date(toDate) : null;

      const isWithinDateRange =
        (!fromDate || itemDate >= fromDateTime) &&
        (!toDate || itemDate <= toDateTime);

      const matchesReadStatus =
        fetchSelected === "Show All Read Status" ||
        (fetchSelected === "Read" && item.Status === "Y") ||
        (fetchSelected === "UnRead" && item.Status !== "Y");

      return isWithinDateRange && matchesReadStatus;
    });
    setAppFilterNotesData({ data: filteredData });
  };

  useEffect(() => {
    fetchAndSetAppNotesData();
  }, []);

  return (
    <>

      <UpdateAppNotes
        appNotesData={appNotesData}
        fetchAppNotesData={fetchAppNotesData}
        setSelectedRowData={setSelectedRowData}
        selectedRowData={selectedRowData}
      />
      <div
        style={{
          display: "flex",
          width: "100%",
          gap: "2rem",
          alignItems: "center",
        }}
        className="mb-4"
      >
        {/* <InputField
          style={{ width: "10vw" }}
          value={fetchSelected}
          type="select"
          onChange={(e) => setFetchSelected(e.target.value)}
          options={[
            { value: "Show All Read Status", label: "Show All Read Status" },
            { value: "UnRead", label: "UnRead" },
            { value: "Read", label: "Read" },
          ]}
        />
        <InputField
          value={fromDate}
          type="date"
          onChange={(e) => setFromDate(e.target.value)}
        />
        <InputField
          value={toDate}
          type="date"
          onChange={(e) => setToDate(e.target.value)}
        /> */}
        {/* <MButton
          style={{ margin: "1rem" }}
          label="Reload"
          variant="contained"
          color="primary"
          size="small"
          onClick={filterData}
       
        /> */}
      </div>

      {/* <AgGridDataTable
      rows={appFilterNotesData.data}
      columns={columns}
      rowSelected={handleSelectRowClick}
      onMarkAsRead={handleMarkAsRead}
      readRows={readRows}
      /> */}
    </>
  );
};

export default AppNotes;
