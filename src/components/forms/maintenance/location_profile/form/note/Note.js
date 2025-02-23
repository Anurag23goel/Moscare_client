import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateNote, {fetchClientNoteData,} from "@/components/forms/maintenance/location_profile/form/note/UpdateNote";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Note = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
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

    const [clientNotesData, setClientNotesData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, setNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientNotesData = useCallback(async () => {
        const data = await fetchClientNoteData(UpdateID);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const presentClient = await fetchData(
            `/api/getClientMasterData/${UpdateID}`,
            window.location.href
        );
        /* setFormData((prev) => ({
          ...prev,
          CreatedBy: presentClient.data[0].FirstName,
        })); */
        const notesOptions = await fetchData(
            "/api/getNoteCategories",
            window.location.href
        );
        setNotesCategory(notesOptions.data)
        setAssignData(formdata2.data);
        setClientNotesData(data);
    }, [UpdateID]);

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );
            /* console.log(rolesData); */


            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            /* console.log(WriteData); */

            const ReadData = rolesData.filter((role) => role.ReadOnly === 1);
            /* console.log(ReadData); */

            const specificRead = WriteData.filter((role) => role.Menu_ID === 'm_location_profile' && role.ReadOnly === 0);
            console.log('Maintainence_LocationProfile Condition', specificRead);

            //If length 0 then No wite permission Only Read, thus set disableSection to true else false
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }

        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    }

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles();
    }, []);

    const handleSubmitNotes = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postLocProfNotesData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Notes added successfully");
                clearForm();
                fetchAndSetClientNotesData();
                addValidationMessage("Notes added successfully", "success")

            } else {
                setOutput("Failed to add client notes");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client notes");
            addValidationMessage("Failed To add Notes data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            NoteType: "",
            Priority: "",
            Category: "",
            Client: "",
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
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            label: "Priority",
            id: "Priority",
            type: "select",
            value: formData.Priority,
            onChange: handleInputChange,
            options: [
                {value: "Low", label: "Low"},
                {value: "Medium", label: "Medium"},
                {value: "High", label: "High"},
                {value: "Urgent", label: "Urgent"},
            ],
            disabled: disableSection,
        },
        {
            label: "Category",
            id: "Category",
            type: "select",
            value: formData.Category,
            onChange: handleInputChange,
            options: notesCategory.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            disabled: disableSection,
        },
        {
            label: "Note",
            id: "Note",
            type: "textarea",
            value: formData.Note,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        // {
        //   label: "Edit Note",
        //   id: "EditNote",
        //   type: "checkbox",                     //Commented for now but may use in future
        //   checked: formData.EditNote,
        //   onChange: handleInputChange,
        //   disabled: disableSection,
        // },
        {
            label: "Assigned To",
            id: "AssignedTo",
            type: "select",
            value: formData.AssignedTo,
            onChange: handleInputChange,
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
            disabled: disableSection,
        },
        {
            label: "Collaborators",
            id: "Collaborators",
            type: "select",
            value: formData.Collaborators,
            onChange: handleInputChange,
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
            disabled: disableSection,
        },
        {
            label: "Note Date",
            id: "NoteDate",
            type: "date",
            value: formData.NoteDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Remind On",
            id: "RemindOn",
            type: "date",
            value: formData.RemindOn,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Visible to Worker",
            id: "VisibleWorkerApp",
            type: "checkbox",
            checked: formData.VisibleWorkerApp,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Mark note as Completed",
            id: "NoteCompleted",
            type: "checkbox",
            checked: formData.NoteCompleted,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Mark task as Completed",
            id: "TaskCompleted",
            type: "checkbox",
            checked: formData.TaskCompleted,
            onChange: handleInputChange,
            disabled: disableSection,
        },
    ];

    return (
        <div style={{padding: "0 1rem", width: "100%"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateNote
                clientNotesData={clientNotesData}
                setClientNotesData={setClientNotesData}
                setShowForm={setShowForm}
                ClientID={UpdateID}
            />

            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitNotes}
                modalTitle="Add Notes"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />

        </div>
    );
};

export default Note;
