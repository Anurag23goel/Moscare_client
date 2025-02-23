import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import ColorContext from "@/contexts/ColorContext";
import { fetchData, fetchUserRoles, putData } from "@/utility/api_utility";
import { useRouter } from "next/router";
import EditModal from "@/components/widgets/EditModal";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

Modal.setAppElement("#__next");

const WorkerEdit = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [workerData, setWorkerData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState({
    FirstName: "",
    LastName: "",
    AddressLine1: "",
    Suburb: "",
    State: "",
    Postcode: "",
    Phone: "",
    Email: "",
    DOB: "",
    Phone2: "",
    AccountingCode: "",
    CaseManager: "",
    CaseManager2: "",
    Area: "",
    Division: "",
    Age: "",
    Role: "",
    WorkerNumber: "",
    AddressLine2: "",
    Current: false,
  });
  const [disableSection, setDisableSection] = useState(false);
  const [columns, setColumns] = useState([]);
  // const { colors, loading } = useContext(ColorContext);

  function calculateAge(birthDate) {
    const currentDate = new Date();
    const birthDateParts = birthDate.split("-");

    const birthYear = parseInt(birthDateParts[0]);
    const birthMonth = parseInt(birthDateParts[1]);
    const birthDay = parseInt(birthDateParts[2]);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    let age = currentYear - birthYear;

    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      age--;
    }

    return age;
  }

  // Fetch worker address data based on WorkerID with parallel execution
  const fetchWorkerData = async () => {
    try {
      const [masterData, profileData, generalAddress] = await Promise.all([
        fetchData(`/api/getWorkerMasterSpecificDataAll`, window.location.href),
        fetchData(
          `/api/getWorkerGeneralProfileSpecificDataAll`,
          window.location.href
        ),
        fetchData(
          `/api/getWorkerGeneralDetailsSpecificDataAll`,
          window.location.href
        ),
      ]);

      // Create lookup maps for each data source based on WorkerID
      const masterLookup = masterData.data.reduce((acc, item) => {
        acc[item.WorkerID] = item;
        return acc;
      }, {});

      const addressLookup = generalAddress.data.reduce((acc, item) => {
        acc[item.WorkerID] = item;
        return acc;
      }, {});

      const profileLookup = profileData.data.reduce((acc, item) => {
        acc[item.WorkerID] = item;
        return acc;
      }, {});

      // Merge data based on WorkerID
      const mergedData = [];

      const allWorkerIDs = new Set([
        ...Object.keys(masterLookup),
        ...Object.keys(profileLookup),
        ...Object.keys(addressLookup),
      ]);

      allWorkerIDs.forEach((WorkerID) => {
        const master = masterLookup[WorkerID] || {};
        const profile = profileLookup[WorkerID] || {};
        const address = addressLookup[WorkerID] || {};
        mergedData.push({ ...master, ...profile, ...address });
      });

      // Process merged data to add the 'Current' field
      const processedMergedData = mergedData.map((item) => ({
        ...item,
        Current: item.Current ? true : false,
      }));

      // Set the processed merged data to state
      setWorkerData(processedMergedData);
      const columns = Object.keys(processedMergedData[0] || {}).map((key) => ({
        field: key,
        headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
      }));

      setColumns(columns);
    } catch (error) {
      console.error("Error fetching worker form data:", error);
      setWorkerData([]);
    }
  };

  useEffect(() => {
    // Parallel execution for initial data fetch and user roles
    Promise.all([
      fetchWorkerData(),
      fetchUserRoles(
        "m_bulk_workers",
        "Operations_WorkerEdit",
        setDisableSection
      ),
    ]).catch((error) => {
      console.error("Error in initial data fetch:", error);
    });
  }, []);

  const handleSelectRowClick = async (row) => {
    clearForm();
    setShowForm(true);
    try {
      const [masterData, generalAddress, profileData] = await Promise.all([
        fetchData(`/api/getWorkerMasterData/${row.WorkerID}`),
        fetchData(`/api/getWorkerGeneralDetailsData/${row.WorkerID}`),
        fetchData(`/api/getWorkerGeneralProfileData/${row.WorkerID}`),
      ]);

      // Merge the data for the selected worker
      const selectedData = {
        ...masterData.data[0],
        ...generalAddress.data[0],
        ...profileData.data[0],
      };

      const processedSelectedData = {
        ...selectedData,
        Current: selectedData.Current ? true : false,
      };

      setSelectedRowData(processedSelectedData);
    } catch (error) {
      console.error("Error fetching selected row data:", error);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      const data1 = {
        Phone: selectedRowData.Phone,
        Email: selectedRowData.Email,
      };

      const data2 = {
        AddressLine1: selectedRowData.AddressLine1,
        AddressLine2: selectedRowData.AddressLine2,
        Suburb: selectedRowData.Suburb,
        State: selectedRowData.State,
        Postcode: selectedRowData.Postcode,
      };

      const data3 = {
        Phone2: selectedRowData.Phone2,
        AccountingCode: selectedRowData.AccountingCode,
        CaseManager: selectedRowData.CaseManager,
        CaseManager2: selectedRowData.CaseManager2,
        Area: selectedRowData.Area,
        Division: selectedRowData.Division,
        Role: selectedRowData.Role,
        Current: selectedRowData.Current,
        WorkerNumber: selectedRowData.WorkerNumber,
        DOB: selectedRowData.DOB,
        Age: selectedRowData.Age,
      };

      // Parallel execution for PUT requests (assuming independence)
      await Promise.all([
        putData(
          `/api/updateWorkerMasterData/${selectedRowData.WorkerID}`,
          { data: data1 },
          window.location.href
        ),
        putData(
          `/api/updateWorkerGeneralDetailsData/${selectedRowData.WorkerID}`,
          { data: data2 },
          window.location.href
        ),
        putData(
          `/api/updateWorkerGeneralProfileData/${selectedRowData.WorkerID}`,
          { data: data3 },
          window.location.href
        ),
      ]);

      await fetchWorkerData();
      clearForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Handle input change
  const handleInputChange = ({ id, value }) => {
    if (id === "DOB") {
      const age = calculateAge(value);
      setSelectedRowData((prevState) => {
        const updatedStateWithAge = { ...prevState, Age: age };
        return updatedStateWithAge;
      });
    }

    setSelectedRowData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Clear form
  const clearForm = () => {
    setSelectedRowData({
      FirstName: "",
      LastName: "",
      AddressLine1: "",
      Suburb: "",
      State: "",
      Postcode: "",
      Phone: "",
      Email: "",
      DOB: "",
      Phone2: "",
      AccountingCode: "",
      CaseManager: "",
      CaseManager2: "",
      Area: "",
      Division: "",
      Age: "",
      Role: "",
      WorkerNumber: "",
      AddressLine2: "",
      Current: false,
    });
  };

  // Render loading if data is loading
  // if (loading) {
  //     return <div>Loading...</div>;
  // }

  const fields = [
    {
      id: "FirstName",
      label: "FirstName:",
      value: selectedRowData.FirstName,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "LastName",
      label: "LastName:",
      value: selectedRowData.LastName,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "AddressLine1",
      label: "AddressLine1:",
      value: selectedRowData.AddressLine1,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Suburb",
      label: "Suburb:",
      value: selectedRowData.Suburb,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "State",
      label: "State:",
      value: selectedRowData.State,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Postcode",
      label: "Postcode:",
      value: selectedRowData.Postcode,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Email",
      label: "Email:",
      value: selectedRowData.Email,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "DOB",
      label: "DOB:",
      value: selectedRowData.DOB,
      type: "date",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Phone2",
      label: "Phone2:",
      value: selectedRowData.Phone2,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Phone",
      label: "Phone:",
      value: selectedRowData.Phone,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "AccountingCode",
      label: "AccountingCode:",
      value: selectedRowData.AccountingCode,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "CaseManager",
      label: "CaseManager:",
      value: selectedRowData.CaseManager,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "CaseManager2",
      label: "CaseManager2:",
      value: selectedRowData.CaseManager2,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Area",
      label: "Area:",
      value: selectedRowData.Area,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Division",
      label: "Division:",
      value: selectedRowData.Division,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Role",
      label: "Role:",
      value: selectedRowData.Role,
      type: "select",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "WorkerNumber",
      label: "Worker Number:",
      value: selectedRowData.WorkerNumber,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "AddressLine2",
      label: "AddressLine2:",
      value: selectedRowData.AddressLine2,
      type: "text",
      onChange: handleInputChange,
      disabled: disableSection,
    },
    {
      id: "Current",
      label: "Current",
      value: selectedRowData.Current,
      type: "checkbox",
      onChange: handleInputChange,
      disabled: disableSection,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
      <CustomBreadcrumbs />
      <div className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
        <CustomAgGridDataTable2
          title="Bulk Edit Worker"
          rows={workerData}
          columns={columns}
          rowSelected={handleSelectRowClick}
          showActionColumn={true}
        />
        <EditModal
          show={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          modalTitle="Edit Worker"
          fields={fields}
          data={selectedRowData}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default WorkerEdit;
