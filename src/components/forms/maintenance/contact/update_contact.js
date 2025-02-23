import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import Button from "@/components/widgets/MaterialButton";
import {Container} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import {useRouter} from "next/router";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import {Box} from "@mui/material";
import Header from "@/components/widgets/Header";
import {ValidationContext} from "@/pages/_app";

export const fetchContactData = async () => {
  try {
    const data = await fetchData(
      "/api/getContactGeneralDataAll",
      window.location.href
    );
    console.log("Fetched data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching contact  data:", error);
  }
};

const UpdateContact = ({ contactData, setContactData, setShowForm }) => {
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
    IsActive: "", // "Y" means active
    Delete: "N",
  });
  console.log("Selected Row Data:", selectedRowData);

  const router = useRouter();
  const [disableSection, setDisableSection] = useState(false);
  const [columns, setColumns] = useState([])
  const [showModal, setShowModal] = useState(false);
    // const { colors } = useContext(ColorContext);
  const { addValidationMessage, validationMessages, handleCloseMessage } = useContext(ValidationContext);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const fetchAndSetContactData = async () => {
      const data = await fetchContactData();
      setContactData(data);
      setColumns(getColumns(data));
    };
    fetchAndSetContactData();
    // Pass fourth parameter to capture delete permission
    fetchUserRoles('m_contacts', "Maintainence_Contacts", setDisableSection, setCanDelete);
  }, [setContactData]);

  const handleSelectRowClick = (row) => {
    setSelectedRowData({
      ...row,
      IsActive: row.IsActive === "N" ? "N" : "Y",
      Delete: row.Delete === "N" ? "N" : "Y",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleRowUnselected = () => {
    handleClearForm();
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive === "N" ? "N" : "Y",
        Delete: selectedRowData.Delete === "N" ? "N" : "Y",
      };

      if (!selectedRowData || !selectedRowData.ID) {
        console.error("Invalid selectedRowData:", selectedRowData);
        addValidationMessage("No data selected for update", "error");
        return;
      }

      const data = await putData(
        `/api/putContactGeneralData/${selectedRowData.ID}`,
        payload,
        payload,
        window.location.href
      );

      console.log("Save response:", data);
      setContactData(await fetchContactData());
      addValidationMessage("Contact updated successfully", "success");

      handleClearForm();
    } catch (error) {
      console.error("Error saving contact data:", error);
      addValidationMessage("Failed to update Contact data", "error");
    } finally {
      setShowModal(false);
    }
  };


  const handleClearForm = () => {
    setSelectedRowData({
      FirstName: "",
      LastName: "",
      Organisation: "",
      IsActive: "",
      Delete: "",
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

      setConfirmDialog({ open: true, field: id, message, newValue: intendedValue });
    } else {
      setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
    }
  };


  const handleRowSelect = async (rowData) => {
    router
      .push(`/maintenance/contact/update/${rowData.ID}`)
      .then((r) => console.log("Navigated to updateContactProfile"));
  };

  const fields = [
    {
      id: "FirstName",
      label: "First Name",
      type: "text",
      value: selectedRowData.FirstName,
    },
    {
      id: "LastName",
      label: "Last Name",
      type: "text",
      value: selectedRowData.LastName,
    },
    {
      id: "Organisation",
      label: "Organisation",
      type: "text",
      value: selectedRowData.Organisation,
    },
    {
      id: "IsActive",
      label: "Active",
      type: "checkbox",
      // Convert string value to boolean for display
      value: selectedRowData.IsActive === "N" ? 'N' : 'Y',
    },
  ];
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


      <Box className={styles.spaceBetween} sx={{ paddingBottom: "1rem" }}>
        <Header title={"Contact"} />
        <Button
          sx={{
              backgroundColor: "blue",
            "&:hover": {
                backgroundColor: "blue", // Replace this with your desired hover color
            },
          }}
          label="Add Contact "
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          disabled={disableSection}
          size={"small"}
        />
      </Box>


      <AgGridDataTable
        rows={contactData?.data}
        columns={columns}
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
        modalTitle="Edit Contact Details"
        fields={fields}
        data={selectedRowData}
        onChange={({ id, value }) => setSelectedRowData((prev) => ({ ...prev, [id]: value }))}
        disabled={disableSection}
      />

    </Container>
  );
};

export default UpdateContact;