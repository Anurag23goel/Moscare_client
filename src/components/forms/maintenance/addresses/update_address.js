import React, { useCallback, useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  fetchData,
  fetchUserRoles,
  getColumns,
  putData,
} from "@/utility/api_utility";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import Header from "@/components/widgets/Header";
import ValidationBar from "@/components/widgets/ValidationBar";
import Button from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import { ValidationContext } from "@/pages/_app";
import styles from "@/styles/style.module.css";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

// Function to fetch address data
export const fetchAddressData = async () => {
  try {
    const data = await fetchData("/api/getAddressData", window.location.href);
    return data;
  } catch (error) {
    console.error("Error fetching address data:", error);
  }
};

const UpdateAddress = ({ addressData, setAddressData, setShowForm }) => {
  // Initialize the state. For checkboxes, we now use booleans.
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

  const [columns, setColumns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [disableSection, setDisableSection] = useState(false);
  // confirmDialog now also holds newValue (the intended value for the checkbox as "Y"/"N")
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    field: "",
    message: "",
    newValue: null,
  });
  const [validationMessages, setValidationMessages] = useState([]);
  // const { colors } = useContext(ColorContext);
  const { addValidationMessage } = useContext(ValidationContext);
  const [canDelete, setCanDelete] = useState(false);

  // Remove a validation message by its id
  const handleCloseMessage = useCallback((id) => {
    setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  // Fetch address data and user roles on mount
  useEffect(() => {
    const fetchAndSetAddressData = async () => {
      const data = await fetchAddressData();
      setAddressData(data);
      setColumns(getColumns(data));
    };
    fetchAndSetAddressData();
    fetchUserRoles(
      "m_contacts",
      "Maintainence_Contacts",
      setDisableSection,
      setCanDelete
    );
  }, []);

  // When a row is selected, update state.
  // Convert the "Y"/"N" values from the API to booleans for the checkboxes.
  const handleSelectRowClick = (row) => {
    setSelectedRowData({
      ...row,
      IsActive: row.IsActive,
      Delete: row.Delete,
    });
    setShowModal(true);
  };

  // Save changes: prepare payload and call the API.
  // Convert the booleans back to "Y" or "N" for the payload.
  const handleSave = async () => {
    try {
      const payload = {
        ...selectedRowData,
        IsActive: selectedRowData.IsActive,
        Delete: selectedRowData.Delete,
      };

      await putData("/api/updateAddress", payload, window.location.href);
      addValidationMessage("Address updated successfully", "success");
      setAddressData(await fetchAddressData());
    } catch (error) {
      console.error("Error updating address data:", error);
      addValidationMessage("Failed to update Address data", "error");
    }
    setShowModal(false);
  };

  // Reset form to default values
  const handleClearForm = () => {
    setSelectedRowData({
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
  };

  const handleInputChange = ({ id, value, type }) => {
    if ((id === "IsActive" || id === "Delete") && type === "checkbox") {
      const intendedValue = value ? "Y" : "N";
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

  // When the user confirms the checkbox change, update the state accordingly.
  // Convert the new value ("Y"/"N") back to a boolean.
  const handleConfirmChange = () => {
    setSelectedRowData((prevState) => ({
      ...prevState,
      [confirmDialog.field]: confirmDialog.newValue === "Y",
    }));
    setConfirmDialog({ open: false, field: "", message: "", newValue: null });
  };

  // Cancel the checkbox change
  const handleCancelChange = () => {
    setConfirmDialog({ open: false, field: "", message: "", newValue: null });
  };

  // Define fields for the EditModal.
  // For checkbox fields, we now pass a boolean value.
  const fields = [
    {
      id: "UnitNo",
      label: "Unit No",
      type: "number",
      value: selectedRowData.UnitNo,
    },
    {
      id: "StreetNo",
      label: "Street No",
      type: "number",
      value: selectedRowData.StreetNo,
    },
    {
      id: "AddressLine1",
      label: "Address Line 1",
      type: "text",
      value: selectedRowData.AddressLine1,
    },
    {
      id: "AddressLine2",
      label: "Address Line 2",
      type: "text",
      value: selectedRowData.AddressLine2,
    },
    {
      id: "Suburb",
      label: "Suburb",
      type: "text",
      value: selectedRowData.Suburb,
    },
    {
      id: "State",
      label: "State",
      type: "select",
      value: selectedRowData.State,
      options: [
        { label: "Select", value: "" },
        { label: "NSW", value: "NSW" },
        { label: "VIC", value: "VIC" },
        { label: "QLD", value: "QLD" },
        { label: "WA", value: "WA" },
      ],
    },
    {
      id: "Postcode",
      label: "Postcode",
      type: "number",
      value: selectedRowData.Postcode,
    },
    {
      id: "GeneralNote",
      label: "General Notes",
      type: "textarea",
      value: selectedRowData.GeneralNote,
    },
    {
      id: "IdentifiedRisks",
      label: "Identified Risks",
      type: "textarea",
      value: selectedRowData.IdentifiedRisks,
    },
    {
      id: "IsActive",
      label: "Active",
      type: "checkbox",
      value: selectedRowData.IsActive, // now a boolean
    },
  ];
  fields.push({
    id: "Delete",
    label: "Mark as Deleted",
    type: "checkbox",
    value: selectedRowData.Delete,
  });
  if (canDelete) {
    fields.push({
      id: "Delete",
      label: "Mark as Deleted",
      type: "checkbox",
      value: selectedRowData.Delete,
    });
  }

  return (
    <Container>
      <ValidationBar
        messages={validationMessages}
        onClose={handleCloseMessage}
      />

      <Box className={styles.spaceBetween} sx={{ paddingBottom: "1rem" }}>
        <Header title={"Address"} />
        <Button
          sx={{
            backgroundColor: "blue",
            "&:hover": {
              backgroundColor: "blue",
            },
          }}
          label="Add Address"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          disabled={disableSection}
          size={"small"}
        />
      </Box>

      <CustomBreadcrumbs />

      <AgGridDataTable
        rows={addressData.data}
        columns={columns.filter(
          (col) =>
            ![
              "Maker User",
              "Maker Date",
              "Update User",
              "Update Time",
            ].includes(col.headerName)
        )}
        rowSelected={handleSelectRowClick}
      />

      <EditModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        modalTitle="Edit Address Details"
        fields={fields}
        data={selectedRowData}
        onChange={({ id, value }) =>
          setSelectedRowData((prev) => ({ ...prev, [id]: value }))
        }
        disabled={disableSection}
      />

      {/* Confirmation Dialog for Checkbox Changes */}
      <Dialog open={confirmDialog.open} onClose={handleCancelChange}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>{confirmDialog.message}</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelChange} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmChange} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UpdateAddress;
