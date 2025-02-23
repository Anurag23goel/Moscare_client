import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchLeaveTypeData = async () => {
    try {
        const data = await fetchData("/api/getLeaveType", window.location.href);
        console.log("Fetched Leave Type data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Leave Type data:", error);
    }
};

const UpdateLeaveType = ({leavetypeData, setLeaveTypeData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
    IsActive: "",
    Delete: "",
   });
    console.log("Selected Row Data:", selectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);
    //const {colors} = useContext(ColorContext)
    useEffect(() => {
        const fetchAndSetLeaveTypeData = async () => {
            const data = await fetchLeaveTypeData();
            setLeaveTypeData(data);
            setColumns(getColumns(data))

        };
        fetchAndSetLeaveTypeData();
        fetchUserRoles('m_wrkr_leave-typ', "Maintainence_Worker_Leave_Type", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
            IsActive: row.IsActive,
      Delete: row.Delete,
        });
        setShowModal(true);


    };

    const handleSave = async () => {
        setSelectedRowData((prevState) => ({
            ...prevState,
            MakerUser: sessionStorage.getItem("email"),
            UpdateUser: sessionStorage.getItem("email"),
            MakerDate: new Date(),
            UpdateDate: new Date(),
        }));
        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };

      const data = await putData(
          "/api/updateLeaveType",
          selectedRowData,
          window.location.href
      );
            console.log("Save clicked:", data);
            addValidationMessage("Leave Type updated successfully", "success");

            setLeaveTypeData(await fetchLeaveTypeData());
        } catch (error) {
            console.error("Error updating Leave Type data:", error);
            addValidationMessage("Failed to update Leave Type data ", "error");

        }
        setShowModal(false);

    };

    const handleCloseModal = () => setShowModal(false);


    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLeaveType",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setLeaveTypeData(await fetchLeaveTypeData());
        } catch (error) {
            console.error("Error deleting Leave Type data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            LeaveCode: "",
            LeaveType: "",
            IsActive: "",
            Delete: "",
        });
    };

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

    const modalFields = [
        {id: "LeaveCode", label: "LeaveCode", type: "text"},
        {id: "LeaveType", label: "LeaveType", type: "text"},
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


                <CustomAgGridDataTable2

                    title="Leave Type"
                    primaryButton={{
                        label: "Add Leave Type",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}


                    rows={leavetypeData.data}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                    columns={columns}
                />

                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Leave Type Details"
                    fields={modalFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateLeaveType;
