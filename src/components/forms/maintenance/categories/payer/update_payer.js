import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

export const fetchPayerData = async () => {
    try {
        const data = await fetchData("/api/getPayer", window.location.href);
        console.log("Fetched Payer data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Payer data:", error);
    }
};

const UpdatePayer = ({payerData, setPayerData}) => {
    const [selectedRowData, setSelectedRowData] = useState({
    IsActive: "",
    Delete: "",
   });
    console.log("Selected Row Data:", selectedRowData);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);


    useEffect(() => {
        const fetchAndSetPayerData = async () => {
            const data = await fetchPayerData();
            setPayerData(data);
            setColumns(getColumns(data))

        };
        fetchAndSetPayerData();
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
          "/api/updatePayer",
          selectedRowData,
          window.location.href
      );
            console.log("Save clicked:", data);
            setPayerData(await fetchPayerData());
            addValidationMessage("Payer Updated Successfully", "success");

        } catch (error) {
            console.error("Error updating Payer data:", error);
            addValidationMessage("Error updating Payer data:", "error");

        }
        setShowModal(false);

    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deletePayer",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setPayerData(await fetchPayerData());
        } catch (error) {
            console.error("Error deleting Payer data:", error);
        }
    };
    const handleCloseModal = () => setShowModal(false);

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

  // When the user confirms the checkbox change, update the state accordingly
  const handleConfirmChange = () => {
    setSelectedRowData((prevState) => ({
      ...prevState,
      [confirmDialog.field]: confirmDialog.newValue, // Ensure it updates correctly
    }));
    setConfirmDialog({ open: false, field: "", message: "", newValue: null });
  };


    // Cancel the checkbox change
  const handleCancelChange = () => {
      setConfirmDialog({open: false, field: "", message: "", newValue: null});
  };

    const modalFields = [
        {
            id: "Code", label: "Code", type: "text"
        },
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
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>


            <AgGridDataTable
                rows={payerData.data}
                rowSelected={handleSelectRowClick}
                handleRowUnselected={handleRowUnselected}
                columns={columns}
            />
            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Payer Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default UpdatePayer;
