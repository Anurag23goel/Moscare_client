import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Box} from "@mui/material";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import Header from "@/components/widgets/Header";
import {ValidationContext} from "@/pages/_app";

export const fetchAreaData = async () => {
  try {
    const data = await fetchData("/api/getAreaData", window.location.href);
    console.log("Fetched data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching area data:", error);
  }
};

const UpdateArea = ({ setAreaData, areaData, setShowForm }) => {
  const [selectedRowData, setSelectedRowData] = useState({
    IsActive: "",
    Delete: "",
  });
  const [disableSection, setDisableSection] = useState(false);
  const [canDelete, setCanDelete] = useState(false);  // New state for delete permission
  const [columns, setColumns] = useState([]);
  const [showModal, setShowModal] = useState(false);


    // const { colors } = useContext(ColorContext);
  const { addValidationMessage } = useContext(ValidationContext);


  useEffect(() => {
    const fetchAndSetAreaData = async () => {
      const data = await fetchAreaData();
      setAreaData(data);
      setColumns(getColumns(data));
    };
    fetchAndSetAreaData();
    fetchUserRoles("m_areas", "Maintenance_Areas", setDisableSection, setCanDelete);
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
      await putData("/api/updateArea", payload, window.location.href);
      console.log("Save clicked:", payload);
      const payload = {
        ...selectedRowData,
        IsActive: selectedRowData.IsActive === "N" ? "N" : "Y",
        Delete: selectedRowData.Delete === "N" ? "N" : "Y",
      };
      setAreaData(await fetchAreaData());
      addValidationMessage("Area updated successfully", "success");
    } catch (error) {
      console.error("Error updating area data:", error);
      addValidationMessage("Failed to update area data", "error");
    }
    setShowModal(false);
  };

  const handleClearForm = () => {
    setSelectedRowData({
      ID: "",
      AreaCode: "",
      Area: "",
      Reference1: "",
      Reference2: "",
      HcpNapsId: "",
      HaccAgencyId: "",
      DefaultUnallocatedWorker: "",
      IsActive: "",
      Delete: "",
      IsActive: "",
      Delete: "",
    });
  };

  const modalFields = [
    { id: "AreaCode", label: "Area Code", type: "text", disabled: true },
    { id: "Area", label: "Area", type: "text", disabled: true },
    { id: "IsActive", label: "Active", type: "checkbox", value: selectedRowData.IsActive },
  ];
  if (canDelete) {
    modalFields.push({
      id: "Delete",
      label: "Mark as Deleted",
      type: "checkbox",
      value: selectedRowData.Delete,
    });
  }


  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", paddingBottom: "1rem" }}>
        <Header title="Area" />
        <MButton
          label="Add Area"
          variant="contained"
          style={{
            padding: "5px 10px",
              backgroundColor: "blue",
          }}
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          disabled={disableSection}
          size="small"
        />
      </Box>
      <AgGridDataTable
        rows={areaData.data}
        columns={columns.filter(
          (col) => !["Maker User", "Maker Date", "Update User", "Update Time"].includes(col.headerName)
        )}
        rowSelected={handleSelectRowClick}
      />

      <EditModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        modalTitle="Edit Area Details"
        fields={modalFields}
        data={selectedRowData}
        onChange={({ id, value }) => setSelectedRowData((prev) => ({ ...prev, [id]: value }))}
        disabled={disableSection}
      />
    </>
  );
};

export default UpdateArea;