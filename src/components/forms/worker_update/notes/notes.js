import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateNotes, {fetchWorkerNotesData,} from "@/components/forms/worker_update/notes/update_notes";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Notes = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [file, setFile] = useState(null)
    const [formData, setFormData] = useState({
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
        Completed: false,
        EditNote: false,
    });

    const [workerNotesData, setWorkerNotesData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, setNotesCategory] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerNotesData = useCallback(async () => {
        try {
            // Execute all fetch requests in parallel
            const [
                data,
                visibleWorkerData,
                formdata2,
                presentWorker,
                notesOptions
            ] = await Promise.all([
                fetchWorkerNotesData(WorkerID),
                fetchData(`/api/getClientNotesDataByWorker/${WorkerID}`, window.location.href),
                fetchData("/api/getActiveWorkerMasterData", window.location.href),
                fetchData(`/api/getWorkerMasterData/${WorkerID}`, window.location.href),
                fetchData("/api/getNoteCategories", window.location.href)
            ]);

            console.log('data:', data);

            // Update state with fetched data
            setFormData((prev) => ({
                ...prev,
                CreatedBy: presentWorker.data[0].FirstName,
            }));

            setNotesCategory(notesOptions.data);
            setAssignData(formdata2.data);
            setWorkerNotesData({...data, ...visibleWorkerData});
        } catch (error) {
            console.error("Error fetching worker notes data:", error);
            // Add appropriate error handling here
        }
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerNotesData();
    }, []);

    const handleSubmitNotes = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            const noteType = formData.Category;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generateFolderPath(
                company,
                noteType,
                fileName
            );
            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const response = await postData("/api/postS3Data", {
                FolderPath,
            });

            const {uploadURL} = response;

            if (!uploadURL) {
                setOutput("Failed to get pre-signed URL.");
                return;
            }

            const uploadRes = await fetch(uploadURL, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (uploadRes.ok) {
                setOutput("File uploaded successfully!");
                const combinedData = {
                    ...formData,
                    Folder: folderforDB,
                    Bucket: "moscaresolutions",
                    File: FileNameforDB,
                };

                const insertResponse = await postData(
                    `/api/insertWorkerNotesData/${WorkerID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Worker Training Data added successfully");
                    clearForm();
                    fetchAndSetWorkerNotesData();
                } else {
                    setOutput("Failed to add Worker Training Data");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("No file selected. Please choose a file before proceeding.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    // const handleInputChange = (event) => {
    //   const value =
    //     event.target.name === "checkbox"
    //       ? event.target.checked
    //       : event.target.value;

    //   setFormData((prevData) => ({
    //     ...prevData,
    //     [event.target.id]: value,
    //   }));
    // };

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
            Completed: false,
            EditNote: false,
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    const generateFolderPath = (company, noteType, filename) => {
        return `${company}/worker/${WorkerID}/notes/${noteType}/${filename}`;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutput("");
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
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
            id: "AssignedTo",
            label: "Assigned To:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "RemindOn",
            label: "Remind On:",
            type: "date",
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
        },
        {
            id: "EditNote",
            label: "Edit Note",
            type: "checkbox",
        },
        {
            id: "Completed",
            label: "Mark note as Completed",
            type: "checkbox",
        },
        {
            id: "file",
            label: "File Upload:",
            type: "file",
        },
    ];

    useEffect(() => {
        console.log("file : ", formData.file)
        setFile(formData.file)
    }, [formData.file])


    return (
        <div style={{width: "100%"}}>
            <UpdateNotes
                workerNotesData={workerNotesData}
                setWorkerNotesData={setWorkerNotesData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitNotes(e)}
                modalTitle="Add Notes"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />

        </div>
    );
};

export default Notes;
