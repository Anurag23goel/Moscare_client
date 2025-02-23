import React, {useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchPayerCategoryData = async () => {
  try {
    const data = await fetchData(
      "/api/getPayerCategories",
      window.location.href
    );
    return data;
  } catch (error) {
    console.error("Error fetching payer category data:", error);
    return { data: [] }; // Return an empty array in case of an error
  }
};

const UpdatePayerCategory = ({
  setPayerCategoryData,
  payerCategoryData,
  setShowForm,
  addValidationMessage,
}) => {
  const [selectedRowData, setSelectedRowData] = useState({
    ID: "",
    Code: "",
    Description: "",
    IsActive: "", // "Y" means active
    Delete: "", // "N" means not deleted
  });
  console.log("Selected Row Data:", selectedRowData);

  const [loading, setLoading] = useState(true);
  const [disableSection, setDisableSection] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [columns, setColumns] = useState([]);
    // const { colors } = useContext(ColorContext);

  const fetchAndSetPayerCategoryData = async () => {
    const data = await fetchPayerCategoryData();
    setPayerCategoryData(data);
    setColumns(getColumns(data));
    setLoading(false);
  };

  useEffect(() => {
    fetchAndSetPayerCategoryData();
    fetchUserRoles(
      "m_payer_ctg",
      "Maintainence_Payer_Category",
      setDisableSection
    );
  }, []);

  const handleSelectRowClick = (row) => {
    setSelectedRowData({
      ...row,
      IsActive: row.IsActive === "N" ? "N" : "Y",
      Delete: row.Delete === "N" ? "N" : "Y",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive === "N" ? "N" : "Y",
        Delete: selectedRowData.Delete === "N" ? "N" : "Y",
      };
      const response = await putData(
        "/api/putPayerCategory",
        payload,
        window.location.href
      );
      console.log("Save clicked:", response);
      if (response.success) {
        const updatedData = await fetchPayerCategoryData();
        setPayerCategoryData(updatedData);
        addValidationMessage("Payer category Updated successfully", "success");
      } else {
        console.error("Error in response:", response.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      addValidationMessage("Error saving data:", "error");
    }
    setShowModal(false);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async () => {
    try {
      const response = await deleteData(
        "/api/deletePayerCategory",
        { ID: selectedRowData.ID },
        window.location.href
      );
      console.log("Delete clicked:", response);
      if (response.success) {
        handleClearForm();
        const updatedData = await fetchPayerCategoryData();
        setPayerCategoryData(updatedData);
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
      Code: "",
      Description: "",
      IsActive: "",
      Delete: "",
    });
  };

  const handleInputChange = ({ id, value, type }) => {
    if ((id === "IsActive" || id === "Delete") && type === "checkbox") {
      const intendedValue = value ? "Y" : "N"; // Convert boolean to "Y"/"N"
      let message = "";
      if (id === "IsActive") {
        message =
          intendedValue === "Y"
            ? "Are you sure you want to activate this address?"
            : "Are you sure you want to deactivate this address?";
      } else if (id === "Delete") {
        message =
          intendedValue === "Y"
            ? "Are you sure you want to mark this address as deleted?"
            : "Are you sure you want to restore this address?";
      }

      setConfirmDialog({
        open: true,
        field: id,
        message,
        newValue: intendedValue,
      });
    } else {
      setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
    }
  };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }
  const modalFields = [
    { id: "Code", label: "Code", type: "text" },
    { id: "Description", label: "Description", type: "text" },
    {
      id: "IsActive",
      label: "Active",
      type: "checkbox",
      // Convert string value to boolean for display
      value: selectedRowData.IsActive === "N" ? "N" : "Y",
    },
    {
      id: "Delete",
      label: "Mark as Deleted",
      type: "checkbox",
      value: selectedRowData.Delete === "N" ? "N" : "Y",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
             {/* <ValidationBar messages={validationMessages} onClose={handleCloseMessage} /> */}
           <div className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                   
     
    
    <CustomAgGridDataTable2

title="Payer"
primaryButton={{
  label: "Add Payer Category",
  icon: <PlusCircle className="h-4 w-4" />,
  onClick: () => setShowForm(true),
  // disabled: disableSection,
}}

rows={payerCategoryData.data}
rowSelected={handleSelectRowClick}
columns={columns}
showActionColumn={true}
/>
      <EditModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        modalTitle="Edit Payer Categories"
        fields={modalFields}
        data={selectedRowData}
        onChange={handleInputChange}
      />

      
    </div>
    </div>
  );
};

export default UpdatePayerCategory;
