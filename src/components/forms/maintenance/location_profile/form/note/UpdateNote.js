import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import Button from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import styles from "@/styles/style.module.css";
import SubHeader from "@/components/widgets/SubHeader";
import {Container} from "react-bootstrap";
import {ValidationContext} from "@/pages/_app";

export const fetchClientNoteData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfNotesDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                TaskCompleted: item.TaskCompleted ? true : false,
                EditNote: item.EditNote ? true : false,
                NoteCompleted: item.NoteCompleted ? true : false,
                VisibleWorkerApp: item.VisibleWorkerApp ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching client notes data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateNote = ({
                        setClientNotesData,
                        clientNotesData,
                        setShowForm,
                        ClientID,
                    }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        NoteType: "",
        Priority: "",
        Category: "",
        Note: "",
        CreatedOn: "",
        RemindOn: "",
        ClosedDate: "",
        CreatedBy: "",
        AssignedTo: "",
        Collaborators: "",
        NoteDate: "",
        NoteCompleted: false,
        VisibleWorkerApp: false,
        TaskCompleted: false,
        EditNote: false,
    });
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, SetNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetClientNotesData = async () => {
        const data = await fetchClientNoteData(ClientID);
        setClientNotesData(data);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const notesOptions = await fetchData(
            "/api/getNoteCategories",
            window.location.href
        );
        SetNotesCategory(notesOptions.data);
        setAssignData(formdata2.data);
        setColumns(getColumns(data))

    };

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles('m_location_profile', "Maintainence_LocationProfile_Note", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfNotesData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientNotesData(await fetchClientNoteData(ClientID));
            handleClearForm();
            addValidationMessage("Notes updated successfully", "success");

        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Notes data ", "error");

        }
        setShowModal(false);
    };
    const handleCloseModal = () => setShowModal(false);

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            NoteType: "",
            Priority: "",
            Category: "",
            Note: "",
            CreatedOn: "",
            RemindOn: "",
            ClosedDate: "",
            CreatedBy: "",
            AssignedTo: "",
            Collaborators: "",
            NoteDate: "",
            NoteCompleted: false,
            VisibleWorkerApp: false,
            TaskCompleted: false,
            EditNote: false,
        });
    };

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };
    const modalFields = [
        {
            id: "Priority",
            label: "Priority:",
            type: "select",
            options: [
                {value: "Low", label: "Low"},
                {value: "Medium", label: "Medium"},
                {value: "High", label: "High"},
                {value: "Urgent", label: "Urgent"},
            ],
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            options: notesCategory.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
            disabled: !selectedRowData.EditNote || disableSection,
        },
        // {
        //   id: "EditNote",
        //   label: "Edit Note",          //Commented for now but may use in future
        //   type: "checkbox",
        // },
        {
            id: "AssignedTo",
            label: "Assigned To:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "Collaborators",
            label: "Collaborators:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "NoteDate",
            label: "Note Date:",
            type: "date",
        },
        {
            id: "RemindOn",
            label: "Remind On:",
            type: "date",
        },
        {
            id: "VisibleWorkerApp",
            label: "Visible to Worker",
            type: "checkbox",
        },
        {
            id: "NoteCompleted",
            label: "Mark note as Completed",
            type: "checkbox",
        },
        {
            id: "TaskCompleted",
            label: "Mark task as Completed",
            type: "checkbox",
        },
    ];

    return (
        <Container className={`${styles.profileContainer} ${styles.MaintContainer}`}>
            <div className={styles.spaceBetween}>
                <SubHeader title={"Note"}/>
                <div>
                    <Button
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }}
                        label="Add Location Profile Notes"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>
            <AgGridDataTable
                rows={clientNotesData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />


            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Note"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />

        </Container>
    );
};

export default UpdateNote;
