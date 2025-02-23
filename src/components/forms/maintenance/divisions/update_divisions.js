import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";

// Function to fetch division data
export const fetchDivisionData = async () => {
    try {
        const data = await fetchData("/api/getDivision", window.location.href);
        return data;
    } catch (error) {
        console.error("Error fetching division data:", error);
    }
};

const UpdateDivision = ({divisionData, setDivisionData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
    IsActive: "",
    Delete: "",
   });
    console.log("Selected Row Data:", selectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    // Fetch division data on component mount
    useEffect(() => {
        const fetchAndSetDivisionData = async () => {
            const data = await fetchDivisionData();
            setDivisionData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetDivisionData();
        fetchUserRoles('m_divisions', "Maintainence_Divisions", setDisableSection);
    }, []);

    // Handle click on a row in the data table
    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
            IsActive: row.IsActive,
            Delete: row.Delete,
    });
    setShowModal(true);
    };

    // Handle save action
    const handleSave = async () => {
        try {
      const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };
            const data = await putData(
                "/api/updateDivision",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setDivisionData(await fetchDivisionData());
            addValidationMessage("Division updated successfully", "success");

        } catch (error) {
            console.error("Error updating division data:", error);
            addValidationMessage("Failed to update Division data ", "error");

        }
        setShowModal(false);

    };


    const handleCloseModal = () => setShowModal(false);


    // Handle delete action
    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteDivision",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setDivisionData(await fetchDivisionData());
        } catch (error) {
            console.error("Error deleting division data:", error);
        }
    };

    // Clear the form fields
    const handleClearForm = () => {
        setSelectedRowData({
            Code: "",
            Division: "",
            IsActive: "",
            Delete: "",
        });
    };

    // Handle input change in form fields
    const handleInputChange = ({id, value, type}) => {
    if ((id === "IsActive" || id === "Delete") && type === "checkbox") {
      // value is a boolean
      const intendedValue = value ? "Y" : "N"; // Convert boolean to "Y"/"N"
      let message = "";
      if (id === "IsActive") {
        message = value
          ? "Are you sure you want to activate this address?"
          : "Are you sure you want to deactivate this address?";
      } else if (id === "Delete") {
        message = value
          ? "Are you sure you want to mark this address as deleted?"
          : "Are you sure you want to restore this address?";
      }

      setConfirmDialog({ open: true, field: id, message, newValue: intendedValue });
    } else {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    }
    };


    const handleRowUnselected = () => {
        handleClearForm();
    };
    const fields = [
        {
            id: "Code",
            label: "Code",
            type: "text",
            value: selectedRowData.Code,
        },
        {
            id: "Division",
            label: "Division",
            type: "text",
            value: selectedRowData.Division,
        },
    {
        id: "IsActive",
      label: "Active",
      type: "checkbox",
      value: selectedRowData.IsActive, // now a boolean
    },
    {
      id: "Delete",
      label: "Mark as Deleted",
      type: "checkbox",
      value: selectedRowData.Delete, // now a boolean
    },
  ];
    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                {/* Component for listing division data */}

                <CustomAgGridDataTable2

                    title="Division"
                    primaryButton={{
                        label: "Add Division",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}


                    rows={divisionData?.data}
                    columns={columns.filter((col) => !['Maker User', 'Maker Date'].includes(col.headerName))}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                />

                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Division Details"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />

            </div>
        </div>
    );
};

export default UpdateDivision;
