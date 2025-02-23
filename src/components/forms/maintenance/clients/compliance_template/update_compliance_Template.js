import React, {useEffect, useState} from "react";
import {fetchData, fetchUserRoles} from "@/utility/api_utility";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {Container} from "react-bootstrap";
import EditModal from "@/components/widgets/EditModal";

export const fetchComplianceTemplateData = async () => {
    try {
        const data = await fetchData(
            "/api/getComplianceTemplateDataAll",
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching complianceTemplate data:", error);
    }
};

const UpdateComplianceTemplate = ({
                                      complianceTemplateData,
                                      setComplianceTemplateData,
                                      setShowForm,
                                      setShowNewTemplateForm,
                                  }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        TemplateName: "",
    IsActive: "",
    Delete: "",
  });

    const [templateNames, setTemplateNames] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchTemplateNames = async () => {
            try {
                const results = await fetchData(
                    "/api/fetchComplianceTemplateNames",
                    window.location.href
                );
                setTemplateNames(results.data);
            } catch (error) {
                console.error("Error fetching template names:", error);
            }
        };
        fetchTemplateNames();
    }, []);

    const [disableSection, setDisableSection] = useState(false);

    useEffect(() => {
        const fetchAndSetComplianceTemplateData = async () => {
            const data = await fetchComplianceTemplateData();
            setComplianceTemplateData(data);
        };
        fetchAndSetComplianceTemplateData();
        fetchUserRoles("m_maint_client_comp_temp", "Maintainence_Client_Compliance_Template", setDisableSection);
    }, [setComplianceTemplateData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
            ...row,
            Mandatory: !!row.Mandatory,
            NoExpiryDate: !!row.NoExpiryDate,
            NoStartDate: !!row.NoStartDate,
            IsActive: row.IsActive,
            Delete: row.Delete,
        });
        console.log("Selected Row:", row);
        setShowModal(true);

    };

    const handleSave = async () => {
      try {
        const payload = {
          ...selectedRowData,
          IsActive: selectedRowData.IsActive ? "Y" : "N",
          Delete: selectedRowData.Delete ? "Y" : "N",
        };

        await putData("/api/UpdateComplianceTemplate", payload, window.location.href);
        addValidationMessage("Compliance Template updated successfully", "success");
        setComplianceTemplateData(await fetchComplianceTemplateData());
      } catch (error) {
        console.error("Error updating Compliance Template data:", error);
        addValidationMessage("Failed to update Compliance Template data", "error");
      }
      setShowModal(false);
    };
    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleCloseModal = () => setShowModal(false);

    const handleClearForm = () => {
        setSelectedRowData({
            ComplianceName: "",
            IsActive: "",
      Delete: "",
    });
  };

  const handleInputChange = ({ id, value, type }) => {
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
      setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
    }
  };

  const fields = [
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
        <Container>
            <MListingDataTable
                rows={complianceTemplateData?.data}
                rowSelected={handleSelectRowClick}
                handleRowUnselected={handleRowUnselected}
            />

            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Compliance Template Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />

        </Container>
    );
};

export default UpdateComplianceTemplate;
