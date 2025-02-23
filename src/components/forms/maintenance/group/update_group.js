import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchGroupData = async () => {
  try {
    const data = await fetchData("/api/getGroup", window.location.href);
    console.log("Fetched group data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching group data:", error);
  }
};

const UpdateGroup = ({ groupData, setGroupData, setShowForm }) => {
  const [selectedRowData, setSelectedRowData] = useState({
    IsActive: "",
    Delete: "",
  });
  const [disableSection, setDisableSection] = useState(false);
  const [columns, setColumns] = useState([]);
  const [showModal, setShowModal] = useState(false);
    // const { colors } = useContext(ColorContext);
  const { addValidationMessage } = useContext(ValidationContext);

  useEffect(() => {
    const fetchAndSetGroupData = async () => {
      const data = await fetchGroupData();
      setGroupData(data);
      setColumns(getColumns(data));
    };
    fetchAndSetGroupData();
    fetchUserRoles("m_groups", "Maintainence_Group", setDisableSection);
  }, []);

  const handleSelectRowClick = (row) => {
    setSelectedRowData({
      ...row,
      IsActive: row.IsActive,
      Delete: row.Delete,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async () => {
    try {
      const payload = {
        ...selectedRowData,
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };

      await putData("/api/updateGroup", selectedRowData, window.location.href);
      // console.log("Save clicked:", payload);

      setGroupData(await fetchGroupData());
      addValidationMessage("Group updated successfully", "success");
    } catch (error) {
      console.error("Error updating group data:", error);
      addValidationMessage("Failed to update Group data", "error");
    }

    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      await deleteData("/api/deleteGroup", selectedRowData, window.location.href);
      console.log("Delete clicked");

      handleClearForm();
      setGroupData(await fetchGroupData());
    } catch (error) {
      console.error("Error deleting group data:", error);
    }
  };

  const handleClearForm = () => {
    setSelectedRowData({
      Code: "",
      Groups: "",
      IsActive: "",
      Delete: "",
    });
  };

  const handleRowUnselected = () => {
    handleClearForm();
  };

  const handleInputChange = ({ id, value, type }) => {
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
      setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
    }
  };

  const fields = [
    {
      id: "Code",
      label: "Code",
      type: "text",
      value: selectedRowData.Code,
    },
    {
      id: "Groups",
      label: "Group",
      type: "text",
      value: selectedRowData.Groups,
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
      <div className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

        <CustomAgGridDataTable2
          title="Group"
          primaryButton={{
            label: "Add Group",
            icon: <PlusCircle className="h-4 w-4" />,
            onClick: () => setShowForm(true),
            // disabled: disableSection,
          }}

          rows={groupData.data}
          rowSelected={handleSelectRowClick}
          handhandleRowUnselected={handleRowUnselected}
          columns={columns.filter((col) => !['Maker User', 'Maker Date'].includes(col.headerName))}
        />

        <EditModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          modalTitle="Edit Group Details"
          fields={fields}
          data={selectedRowData}
          onChange={({ id, value }) => setSelectedRowData((prev) => ({ ...prev, [id]: value }))}
        />


      </div>
    </div>
  );
};

export default UpdateGroup;
