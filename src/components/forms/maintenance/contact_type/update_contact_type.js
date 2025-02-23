import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";

export const fetchContactTypeData = async () => {
    try {
        const data = await fetchData("/api/getContactTypeDataAll", window.location.href);
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching contact type data:", error);
    }
};

const UpdateContactType = ({contactTypeData, setContactTypeData, setShowForm}) => {
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

    useEffect(() => {
        const fetchAndSetContactTypeData = async () => {
            const data = await fetchContactTypeData();
            setContactTypeData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetContactTypeData();
        fetchUserRoles('m_contact_types', "Maintainence_Contacts_Type", setDisableSection);
    }, [setContactTypeData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
            IsActive: row.IsActive,
      Delete: row.Delete,
    });
        setShowModal(true);

    };

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleSave = async () => {
        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };

      const data = await putData("/api/putContactTypeData", selectedRowData, window.location.href);
            console.log("Save response:", data);
            setContactTypeData(await fetchContactTypeData());
            handleClearForm()
            addValidationMessage("Contact Type updated successfully", "success");

        } catch (error) {
            console.error("Error saving contact type data:", error);
            addValidationMessage("Failed to update Contact Type data ", "error");

        }
        setShowModal(false);
    };
    const handleCloseModal = () => setShowModal(false);


    const handleDelete = async () => {
        console.log("Deleting data:", selectedRowData); // Debugging: Log the data to be deleted
        try {
            const data = await deleteData("/api/deleteContactTypeData", selectedRowData, window.location.href);
            console.log("Delete response:", data);
            handleClearForm();
            setContactTypeData(await fetchContactTypeData());
        } catch (error) {
            console.error("Error deleting contact type data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ContactType: "",
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

  const modalFields = [
    { id: "ContactType", label: "Contact Type", type: "text"},
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

                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Contact Type "
                    fields={modalFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
                <CustomAgGridDataTable2

                    title="Contact Type"
                    primaryButton={{
                        label: "Add Contact Type",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}

                    rows={contactTypeData?.data}
                    columns={columns.filter((col) => !['maker User', 'maker Date'].includes(col.headerName))}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                />

            </div>
        </div>
    );
};

export default UpdateContactType;