import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";

export const fetchTrainingItemsData = async () => {
    try {
        const data = await fetchData("/api/getTrainingItems", window.location.href);
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching area data:", error);
    }
};

const UpdateTrainingItems = ({
                                 setTrainingItemsData,
                                 trainingItemsData,
                                 setShowForm,
                             }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ID: "",
      UnitNo: "",
      StreetNo: "",
      AddressLine1: "",
      AddressLine2: "",
      Suburb: "",
      State: "",
      Postcode: "",
      GeneralNote: "",
      IdentifiedRisks: "",
      IsActive: "",
      Delete: "",
    });
    console.log("Selected Row Data:", selectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([]);
    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetTrainingItemsData = async () => {
            const data = await fetchTrainingItemsData();
            setTrainingItemsData(data);
            setColumns(getColumns(data));
        };
        fetchAndSetTrainingItemsData();
        fetchUserRoles(
            "m_wrkr_training_itm",
            "Maintainence_Worker_Training_Items",
            setDisableSection
        );
    }, []);

    // Function to handle selecting a row
    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
            IsActive: row.IsActive,
            Delete: row.Delete,
    });
    setShowModal(true);
    };

    // Function to handle saving changes
    const handleSave = async () => {
        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };

      const data = await putData(
          "/api/updateTrainingItems",
          selectedRowData,
          window.location.href
      );
            console.log("Save clicked:", data);
            addValidationMessage("Training Items updated successfully", "success");

            setTrainingItemsData(await fetchTrainingItemsData());
        } catch (error) {
            addValidationMessage("Failed to update Training Items data ", "error");

            console.error("Error fetching area data:", error);
        }
        setShowModal(false);
    };

    const handleCloseModal = () => setShowModal(false);

    // Function to handle deleting a row
    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteTrainingItems",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setTrainingItemsData(await fetchTrainingItemsData());
        } catch (error) {
            console.error("Error fetching area data:", error);
        }
    };

    // Function to clear the form
    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            Code: "",
            Description: "",
            IsActive: "",
            Delete: "",
        });
    };

    // Function to handle input changes
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
        {id: "Code", label: "Code", type: "text"},
        {id: "Description", label: "Description", type: "text"},
        {
            id: "Template",
            label: "Template",
            type: "select",
            options: [
                {label: "Template", value: ""},
                {label: "COVID 19 Form", value: "COVID 19 Form"},
                {
                    label: "Complaints / Feedback Form",
                    value: "Complaints / Feedback Form",
                },
                {
                    label: "Conflict of Interest Declaration",
                    value: "Conflict of Interest Declaration",
                },
                {label: "WOUND MANAGEMENT", value: "WOUND MANAGEMENT"},
                {
                    label: "MEDICATION INCIDENT FORM",
                    value: "MEDICATION INCIDENT FORM",
                },
                {
                    label: "Individual Risk Assessment Form",
                    value: "Individual Risk Assessment Form",
                },
                {
                    label: "Incident Form/Hazard Form",
                    value: "Incident Form/Hazard Form",
                },
                {label: "Shift Reporting New", value: "Shift Reporting New"},
            ],
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


                <CustomAgGridDataTable2

                    title="Training Items"
                    primaryButton={{
                        label: "Add Training Items",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}

                    rows={trainingItemsData.data}
                    rowSelected={handleSelectRowClick}
                    columns={columns}
                />

                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Training Items Details"
                    fields={modalFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateTrainingItems;
