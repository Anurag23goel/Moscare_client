import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

export const fetchNoteCategoryData = async () => {
    try {
        const data = await fetchData("/api/getNoteCategories", window.location.href);
        return data;
    } catch (error) {
        console.error("Error fetching note category data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

export const fetchUserGroups = async () => {
    try {
        const data = await fetchData("/api/getUserGroups", window.location.href);
        return data;
    } catch (error) {
        console.error("Error fetching user groups:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateNoteCategory = ({setNoteCategoryData, noteCategoryData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ID: "",
        Description: "",
        UserGroupPermission: "",
    IsActive: "", // "Y" means active
    Delete: "",   // "N" means not deleted
  });
  console.log("Selected Row Data:", selectedRowData);
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetNoteCategoryData = async () => {
        const data = await fetchNoteCategoryData();
        setNoteCategoryData(data);
        setColumns(getColumns(data))
        const userGroupData = await fetchUserGroups();
        setUserGroups(userGroupData.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAndSetNoteCategoryData();
        fetchUserRoles('m_note_ctg', "Maintainence_Note_Category", setDisableSection);
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
        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };
      const response = await putData("/api/putNoteCategory", selectedRowData, window.location.href);
            console.log("Save clicked:", response);
            if (response.success) {
                const updatedData = await fetchNoteCategoryData();
                setNoteCategoryData(updatedData);
                addValidationMessage("Note Updated Successfully", "success");
            } else {
                console.error("Error in response:", response.message);

            }
        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Error updating incident data:", "error");

        }
        setShowModal(false);

    };
    const handleCloseModal = () => setShowModal(false);

    const handleDelete = async () => {
        try {
            const response = await deleteData("/api/deleteNoteCategory", {ID: selectedRowData.ID}, window.location.href);
            console.log("Delete clicked:", response);
            if (response.success) {
                handleClearForm();
                const updatedData = await fetchNoteCategoryData();
                setNoteCategoryData(updatedData);
            } else {
                console.error("Error in response:", response.message);
            }
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            Description: "",
            UserGroupPermission: "",
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

    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const modalFields = [
        {id: "Description", label: "Description", type: "text"},
        {
            id: "UserGroupPermission",
            label: "User Group Permission",
            type: "select",
            options: [
                {value: "", label: "Select User Group"},
                ...userGroups.map(group => ({value: group.UserGroup, label: group.UserGroup}))
            ]
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
            <div className="pl-2"><CustomBreadcrumbs /></div>
            <div
                className="mt-2 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


                <CustomAgGridDataTable2

                    title="Note"
                    primaryButton={{
                        label: "Add Note Category",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}

                    rows={noteCategoryData.data}
                    rowSelected={handleSelectRowClick}
                    columns={columns}
                    showActionColumn={true}
                />


                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Note Details"
                    fields={modalFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateNoteCategory;
