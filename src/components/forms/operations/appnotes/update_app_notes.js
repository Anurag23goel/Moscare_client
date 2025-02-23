import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  useTheme,
} from "@mui/material";
import {
  fetchData,
  fetchUserRoles,
  getColumns,
  putData,
} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import { ValidationContext } from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function MultipleSelectChip({
  collaborators,
  setCollaborators,
  collaboratorNames,
  disabled,
}) {
  const theme = useTheme();

  const handleChange = (event) => {
    const { value } = event.target;
    setCollaborators(typeof value === "string" ? value.split(",") : value);
  };

  const getStyles = (name, personName, theme) => ({
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  });

  return (
    <FormControl sx={{ width: 300 }} disabled={disabled}>
      <InputLabel id="collaborators-chip-label">Collaborators</InputLabel>
      <Select
        labelId="collaborators-chip-label"
        id="collaborators-chip"
        multiple
        value={collaborators}
        onChange={handleChange}
        input={
          <OutlinedInput id="select-multiple-chip" label="Collaborators" />
        }
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
        sx={{ height: "40px", borderRadius: "7px" }}
      >
        {collaboratorNames.map((name) => (
          <MenuItem
            key={name}
            value={name}
            style={getStyles(name, collaborators, theme)}
          >
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const UpdateAppNotes = ({
  // appNotesData,
  // fetchAppNotesData,
  setSelectedRowData,
  selectedRowData,
}) => {
  const [assignData, setAssignData] = useState([]);
  const [collaboratorNames, setCollaboratorNames] = useState([]);
  const [disableSection, setDisableSection] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [columns, setColumns] = useState([]);
  const [collaborators, setCollaborators] = useState(
    Array.isArray(selectedRowData.Collaborators)
      ? selectedRowData.Collaborators
      : selectedRowData.Collaborators
      ? selectedRowData.Collaborators.split(", ")
      : []
  );
  const [appNotesData, setAppNotesData] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [appFilterNotesData, setAppFilterNotesData] = useState("");
  const {
    addValidationMessage,
    validationMessages,
    handleCloseMessage,
  } = useContext(ValidationContext);

  const handleCloseModal = () => setShowModal(false);

  const fetchAppNotesData = async () => {
    try {
      const data = await fetchData(
        `/api/getAppNotesFullData`,
        window.location.href
      );
      return data;
    } catch (error) {
      console.error("Error fetching client document data:", error);
      return { data: [] }; // Return an empty array in case of an error
    }
  };

  const fetchAndSetAppNotesData = async () => {
    const data = await fetchAppNotesData();
    setAppNotesData(data);
    setColumns(getColumns(data));
    setAppFilterNotesData(data);
  };

  useEffect(() => {
    fetchAndSetAppNotesData();
  }, []);

  useEffect(() => {
    const fetchAssignData = async () => {
      const formdata2 = await fetchData(
        "/api/getActiveWorkerMasterData",
        window.location.href
      );
      setAssignData(formdata2.data);
      // setColumns(getColumns(data))
    };

    const fetchCollaboratorNames = async () => {
      const response = await fetchData(
        "/api/getSuperAdmins",
        window.location.href
      );
      setCollaboratorNames(
        response.map((user) => `${user.FirstName} ${user.LastName}`)
      );
    };

    fetchAssignData();
    fetchCollaboratorNames();

    fetchUserRoles("m_app_notes", "Operation_App_Notes", setDisableSection);
    if (selectedRowData.Collaborators) {
      setCollaborators(selectedRowData.Collaborators.split(", "));
    }
  }, [selectedRowData]);

  const handleSave = async () => {
    try {
      const updatedData = {
        Category: selectedRowData.Category,
        Priority: selectedRowData.Priority,
        Read: selectedRowData.Read,
        Status: selectedRowData.Status,
        AssignedTo: selectedRowData.AssignedTo,
        Collaborators: collaborators.join(", "),
      };
      await putData(`/api/updateAppNotes/${selectedRowData.ID}`, updatedData);
      addValidationMessage("App Notes updated successfully", "success");
      fetchAppNotesData();
    } catch (error) {
      console.error("Error saving data:", error);
    }
    setShowModal(false);
    fetchAndSetAppNotesData();
  };

  const handleClearForm = () => {
    setSelectedRowData({});
    setCollaborators([]);
  };

  const handleInputChange = ({ id, value }) => {
    setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSelectRowClick = (row) => {
    console.log("Ziad");
    setSelectedRowData(row);
    setShowModal(true);
    console.log("Selected Row:", row);
  };

  const fields = [
    {
      id: "Category",
      label: "Category:",
      type: "select",
      value: selectedRowData.Category,
      onChange: handleInputChange,
      disabled: disableSection,
      options: [
        {
          value: "Career Development Domain",
          label: "Career Development Domain",
        },
        { value: "Clinical", label: "Clinical" },
        {
          value: "Daily Living Independence Domain",
          label: "Daily Living Independence Domain",
        },
        { value: "Feedback", label: "Feedback" },
        { value: "General", label: "General" },
        { value: "Goals", label: "Goals" },
        {
          value: "Health & Wellbeing Domain",
          label: "Health & Wellbeing Domain",
        },
        { value: "Incident", label: "Incident" },
        { value: "Services", label: "Services" },
        {
          value: "Social & Emotional Domain",
          label: "Social & Emotional Domain",
        },
        { value: "Staff Update", label: "Staff Update" },
        { value: "test", label: "test" },
        {
          value: "Workplace Health & Safety",
          label: "Workplace Health & Safety",
        },
      ],
    },
    {
      id: "Priority",
      label: "Priority:",
      type: "select",
      value: selectedRowData.Priority,
      onChange: handleInputChange,
      disabled: disableSection,
      options: [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
        { value: "Urgent", label: "Urgent" },
      ],
    },
    {
      id: "AssignedTo",
      label: "Assigned To:",
      type: "select",
      value: selectedRowData.AssignedTo,
      onChange: handleInputChange,
      disabled: disableSection,
      options: assignData.map((form) => ({
        value: form.FirstName,
        label: form.FirstName,
      })),
    },
    {
      id: "Collaborators",
      label: "Collaborators:",
      type: "custom", // Custom component
      label: "Collaborators:",
      component: (
        <MultipleSelectChip
          collaborators={collaborators}
          setCollaborators={setCollaborators}
          collaboratorNames={collaboratorNames}
          disabled={disableSection}
        />
      ),
    },
    {
      id: "FetchSelected",
      label: "Fetch Selected",
      style: { width: "10vw" },
      type: "select",
      options: [
        { value: "Show All Read Status", label: "Show All Read Status" },
        { value: "UnRead", label: "UnRead" },
        { value: "Read", label: "Read" },
      ],
    },
    {
      id: "FromDate",
      label: "From Date:",
      type: "date",
    },
    {
      id: "ToDate",
      label: "To Date:",
      type: "date",
    },
  ];

  useEffect(() => {
    console.log("showModal : ", showModal);
  }, [showModal]);
  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
      <CustomBreadcrumbs />

      <div className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
        <ValidationBar
          messages={validationMessages}
          onClose={handleCloseMessage}
        />

        <EditModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          modalTitle="Edit App Note"
          fields={fields}
          data={selectedRowData}
          onChange={handleInputChange}
        />

        <CustomAgGridDataTable2
          title="App Notes"
          rows={appFilterNotesData.data}
          columns={columns}
          rowSelected={handleSelectRowClick}
          showActionColumn={true}
        />
      </div>
    </div>
  );
};

export default UpdateAppNotes;
