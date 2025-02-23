import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchInterestsData = async () => {
    try {
        const data = await fetchData("/api/getInterests", window.location.href);
        console.log("Fetched Interests data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Interests data:", error);
    }
};

const UpdateInterests = ({interestsData, setInterestsData, setShowForm}) => {
        const [selectedRowData, setSelectedRowData] = useState({
            IsActive: "",
    Delete: "",
     });
        console.log("Selected Row Data:", selectedRowData);
        const [disableSection, setDisableSection] = useState(false);
        const [showModal, setShowModal] = useState(false);
        const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);
        const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

        useEffect(() => {
            const fetchAndSetInterestsData = async () => {
                const data = await fetchInterestsData();
                setInterestsData(data);
                setColumns(getColumns(data))
            };
            fetchAndSetInterestsData();
            fetchUserRoles('m_wrkr_interest', "Maintainence_Worker_Interests", setDisableSection);
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
            "/api/updateInterests",
            selectedRowData,
            window.location.href
        );
                console.log("Save clicked:", data);
                addValidationMessage("Interest updated successfully", "success");

                setInterestsData(await fetchInterestsData());
            } catch (error) {
                addValidationMessage("Failed to update Interest data ", "error");

                console.error("Error updating Interests data:", error);
            }
            setShowModal(false);
        };

        const handleCloseModal = () => setShowModal(false);


        const handleDelete = async () => {
            try {
                const data = await deleteData(
                    "/api/deleteInterests",
                    selectedRowData,
                    window.location.href
                );
                console.log("Delete clicked:", data);
                handleClearForm();
                setInterestsData(await fetchInterestsData());
            } catch (error) {
                console.error("Error deleting Interests data:", error);
            }
        };

        const handleClearForm = () => {
            setSelectedRowData({
                Code: "",
                Description: "",
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
            {id: "Code", label: "Code", type: "text"},
            {id: "Description", label: "Description", type: "text"},
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

                        title="Interests"
                        primaryButton={{
                            label: "Add Interests",
                            icon: <PlusCircle className="h-4 w-4"/>,
                            onClick: () => setShowForm(true),
                            // disabled: disableSection,
                        }}


                        rows={interestsData.data}
                        rowSelected={handleSelectRowClick}
                        handleRowUnselected={handleRowUnselected}
                        columns={columns}
                    />

                    <EditModal
                        show={showModal}
                        onClose={handleCloseModal}
                        onSave={handleSave}
                        modalTitle="Edit Worker Interest"
                        fields={modalFields}
                        data={selectedRowData}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        );
    }
;

export default UpdateInterests;
