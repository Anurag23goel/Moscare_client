import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateNotes, {fetchClientNotesData} from "@/components/forms/client_update/notes/update_notes";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Notes = () => {
    const router = useRouter();
    const {ClientID} = router.query;
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
        LinkToWorker: "",
        Collaborators: "",
        NoteDate: "",
        NoteCompleted: false,
        VisibleWorkerApp: false,
        TaskCompleted: false,
        EditNote: false,
        file: null,
    });
    const [clientNotesData, setClientNotesData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, setNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [file, setFile] = useState(null);
    const [caseManagers, setCaseManagers] = useState([]);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientNotesData = useCallback(async () => {
        const data = await fetchClientNotesData(ClientID);
        const formdata2 = await fetchData("/api/getActiveWorkerMasterData", window.location.href);
        const caseManagersData1 = await fetchData(`/api/getUserByUserGroup/Team Lead`, window.location.href);
        const caseManagersData2 = await fetchData(`/api/getUserByUserGroup/Rostering Manager`, window.location.href);
        setCaseManagers([...caseManagersData1, ...caseManagersData2]);

        const presentClient = await fetchData(`/api/getClientMasterData/${ClientID}`, window.location.href);
        setFormData((prev) => ({
            ...prev,
            CreatedBy: presentClient.data[0].FirstName,
        }));
        const notesOptions = await fetchData("/api/getNoteCategories", window.location.href);
        setNotesCategory(notesOptions.data);
        setAssignData(formdata2.data);
        setClientNotesData(data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles("m_cprofile", "Client_Profile_Notes", setDisableSection);
    }, []);

    const handleSubmitNotes = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        console.log("Notes:", formData);
        try {
            if (!formData.file) {
                setOutput("Please select a file.");

                setIsSubmitting(false);
                return;
            }

            const company = process.env.NEXT_PUBLIC_COMPANY;
            const category = formData.Category;
            const fileName = encodeURIComponent(formData.file.name);

            const FolderPath = generateFolderPath(company, category, fileName);
            const parts = FolderPath.split("/");
            const fileNameForDb = parts.pop();
            const folderForDb = parts.join("/");

            const response = await postData("/api/postS3Data", {FolderPath});
            const {uploadURL} = response;

            if (!uploadURL) {
                setOutput("Failed to get pre-signed URL.");
                setIsSubmitting(false);
                return;
            }

            const uploadRes = await fetch(uploadURL, {
                method: "PUT",
                headers: {
                    "Content-Type": formData.file.type,
                },
                body: formData.file,
            });

            if (uploadRes.ok) {
                setOutput("File uploaded successfully!");

                const combinedData = {
                    ...formData,
                    Folder: folderForDb,
                    Bucket: "moscaresolutions",
                    File: fileNameForDb,
                };

                const insertResponse = await postData(
                    `/api/insertClientNotesData/${ClientID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Client Notes added successfully.");
                    clearForm();
                    fetchAndSetClientNotesData();
                } else {
                    setOutput("Failed to add client Notes.");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client Notes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutput("");
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            NoteType: "",
            Priority: "",
            Category: "",
            Note: "",
            CreatedOn: "",
            RemindOn: "",
            ClosedDate: "",
            CreatedBy: "",
            AssignedTo: "",
            LinkToWorker: "",
            Collaborators: "",
            NoteDate: "",
            NoteCompleted: false,
            VisibleWorkerApp: false,
            TaskCompleted: false,
            EditNote: false,
            file: null,
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

    const generateFolderPath = (company, Category, filename) => {
        return `${company}/client/${ClientID}/notes/${Category}/${filename}`;
    };

    const fields = [
        {
            id: "Priority",
            label: "Priority:",
            type: "select",
            value: formData.Priority,
            onChange: handleInputChange,
            disabled: disableSection,
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
            value: formData.Category,
            onChange: handleInputChange,
            disabled: disableSection,
            options: notesCategory.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
            value: formData.Note,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        // {
        //   id: "EditNote",
        //   label: "Edit Note",
        //   type: "checkbox",
        //   checked: formData.EditNote,
        //   onChange: handleInputChange,
        //   disabled: disableSection,
        // },
        {
            id: "AssignedTo",
            label: "Assigned To:",
            type: "select",
            value: formData.AssignedTo,
            onChange: handleInputChange,
            disabled: disableSection,
            options: caseManagers.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "LinkToWorker",
            label: "Link To Worker:",
            type: "select",
            value: formData.LinkToWorker,
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
            type: "select",
            value: formData.Collaborators,
            onChange: handleInputChange,
            disabled: disableSection,
            options: caseManagers.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "NoteDate",
            label: "Note Date:",
            type: "date",
            value: formData.NoteDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "RemindOn",
            label: "Remind On:",
            type: "date",
            value: formData.RemindOn,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "VisibleWorkerApp",
            label: "Visible to Worker",
            type: "checkbox",
            checked: formData.VisibleWorkerApp,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "NoteCompleted",
            label: "Mark note as Completed",
            type: "checkbox",
            checked: formData.NoteCompleted,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "TaskCompleted",
            label: "Mark task as Completed",
            type: "checkbox",
            checked: formData.TaskCompleted,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "file",
            label: "File Upload:",
            type: "file",
            onChange: handleFileChange,
        },
    ];

    return (
        <div style={{width: "100%"}}>
            <UpdateNotes
                clientNotesData={clientNotesData}
                setClientNotesData={setClientNotesData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmitNotes}
                modalTitle="Add Notes"
                fields={fields}
                data={formData || {}}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Notes;
