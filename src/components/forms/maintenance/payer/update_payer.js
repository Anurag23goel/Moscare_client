import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchPayerData = async () => {
    try {
        const data = await fetchData("/api/getPayerGeneralDataAll", window.location.href);
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching payer  data:", error);
    }
};

const UpdatePayer = ({payerData, setPayerData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        PayerCode: "",
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
    const router = useRouter();
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);


    useEffect(() => {
        const fetchAndSetPayerData = async () => {
            const data = await fetchPayerData();
            setPayerData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetPayerData();
        fetchUserRoles('m_maint_payers', "Maintainence_Payers", setDisableSection);
    }, [setPayerData]);

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

            constdata = await putData(
                `/api/putPayerGeneralData/${selectedRowData.ID}`,
                selectedRowData,
                window.location.href
            );
            console.log("Save response:", data);
            addValidationMessage("Payer updated successfully", "success");

            setPayerData(await fetchPayerData());
            handleClearForm();
        } catch (error) {
            console.error("Error saving payer  data:", error);
            addValidationMessage("Failed to update Payer data ", "error");

        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deletePayerGeneralData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete response:", data);
            handleClearForm();
            setPayerData(await fetchPayerData());
        } catch (error) {
            console.error("Error deleting payer  data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            PayerCode: "",
            PayerName: "",
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

    const handleRowSelect = async (rowData) => {
        router
            .push(`/maintenance/payer/update/${rowData.ID}`)
            .then((r) => console.log("Navigated to updateContactProfile"));
    };

    const fields = [
        {
            id: "PayerCode",
            label: "Payer Code",
            type: "text",
            value: selectedRowData.PayerCode,
        },
        {
            id: "PayerName",
            label: "Payer Name",
            type: "text",
            value: selectedRowData.PayerName,
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

    const handleCloseModal = () => setShowModal(false);


    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                <CustomAgGridDataTable2

                    title="Payer"
                    primaryButton={{
                        label: "Add Payer",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}


                    rows={payerData?.data}
                    columns={columns.filter((col) => !['Maker User', 'Maker Date'].includes(col.headerName))}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                    props={{
                        onRowDoubleClick: (params) => {
                            handleRowSelect(params.row).then((r) =>
                                console.log("Row selected:", params.row)
                            );
                        },
                    }}
                />

                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Payer Details"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />


            </div>
        </div>
    );
};

export default UpdatePayer;
