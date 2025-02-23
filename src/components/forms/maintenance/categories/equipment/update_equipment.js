import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import ValidationBar from "@/components/widgets/ValidationBar";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

export const fetchEquipmentData = async () => {
    try {
        const data = await fetchData("/api/getEquipment", window.location.href);
        console.log("Fetched equipment data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching equipment data:", error);
    }
};

const updateEquipment = ({equipmentData, setEquipmentData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        IsActive: "",
  Delete: "",
   });
    console.log("Selected Row Data:", selectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([]);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetEquipmentData = async () => {
            const data = await fetchEquipmentData();
            setEquipmentData(data);
            setColumns(getColumns(data));
        };
        fetchAndSetEquipmentData();
        fetchUserRoles(
            "m_equip_ctg",
            "Maintainence_Equipment_Category",
            setDisableSection
        );
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
      const data = await putData(
          "/api/updateEquipment",
          selectedRowData,
          window.location.href
      );
            console.log("Save clicked:", data);
            addValidationMessage("Incident Updated Successfully", "success");
            setEquipmentData(await fetchEquipmentData());
        } catch (error) {
            console.error("Error updating equipment data:", error);
            addValidationMessage("Error updating data", "error");
        }
        setShowModal(false);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteEquipment",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setEquipmentData(await fetchEquipmentData());
        } catch (error) {
            console.error("Error deleting equipment data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Description: "",
            IsActive: "",
            Delete: "",
        });
    };

    // const handleInputChange = (event) => {
    //   const { id, value } = event.target;
    //   setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
    // };
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
        {
            id: "Description", label: "Description", type: "text"
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


                <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>


                <CustomAgGridDataTable2

                    title="Equipment"
                    subtitle="Manage all Equipment. Click on Edit to update their Equipment."
                    primaryButton={{
                        label: "Add Equipment",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true)
                        // disabled: disableSection,
                    }}

                    rows={equipmentData.data}
                    columns={columns}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                    showActionColumn={true}
                />


                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Equipment Details"
                    fields={modalFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default updateEquipment;
