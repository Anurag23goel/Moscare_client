import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateDocument, {fetchWorkerDocumentData,} from "@/components/forms/worker_update/document/update_document";
import {Alert, Snackbar,} from "@mui/material";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Document = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [file, setFile] = useState(null);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Url: "",
        DocName: "",
        Category: "",
        Note: "",
        CreatedBy: "",
        WrittenDate: "",
        TimeStamp: "",
        Visibility: false,
        Lock: false,
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "success",
        message: "",
    })

    const [workerDocumentData, setWorkerDocumentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [errMsgs, setErrMsgs] = useState([])

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerDocumentData = useCallback(async () => {
        const data = await fetchWorkerDocumentData(WorkerID);
        const presentWorker = await fetchData(
            `/api/getWorkerMasterData/${WorkerID}`,
            window.location.href
        );
        setFormData((prev) => ({
            ...prev,
            CreatedBy: presentWorker.data[0].FirstName,
        }));
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data)
        setWorkerDocumentData(data);
        console.log("Data", data)
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerDocumentData();
    }, []);

    const handleSnackbarClose = () => {
        setSnackbar({open: false, message: "", severity: ""});
    };

    const handleSubmitDocument = async () => {
        setIsSubmitting(true);
        console.log("first")
        if (!file && !file?.name) {
            alert("Please select a file")
            setSnackbar({open: true, message: "Please select a file", severity: "error"})
            return
        }

        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            const docCategory = formData.Category;
            const docName = formData.DocName;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generateFolderPath(
                company,
                docCategory,
                docName,
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
                    `/api/insertWorkerDocumentData/${WorkerID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Worker Document Data added successfully");
                    clearForm();
                    fetchAndSetWorkerDocumentData();
                } else {
                    setOutput("Failed to add Worker Document Data");
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
        const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,}([\/?].*)?$/i;

        setErrMsgs((prevMsgs) => {
            const newErrMsgs = {...prevMsgs};

            // Check if the field is empty or invalid URL
            if (id === "Url" && value && !urlRegex.test(value)) {
                // Add error message for invalid URL
                newErrMsgs[id] = `Invalid ${id}. Please enter a valid value.`;
            } else if (value === "") {
                // Remove error message if the field is empty
                delete newErrMsgs[id];
            } else {
                // Remove error message if URL validation passes
                delete newErrMsgs[id];
            }

            return newErrMsgs;
        });

        setFormData((prevState) => ({...prevState, [id]: value}));
    };


    const clearForm = () => {
        setOutput("");
        setFormData({
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            CreatedBy: "",
            WrittenDate: "",
            TimeStamp: "",
            Visibility: false,
            Lock: false,
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    const generateFolderPath = (company, docCategory, docName, filename) => {
        return `${company}/worker/${WorkerID}/documents/${docCategory}_${docName}/${filename}`;
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
            id: "Url",
            label: "URL:",
            type: "text",
        },
        {
            id: "DocName",
            label: "Document Name:",
            type: "text",
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            options: documentOptions.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "WrittenDate",
            label: "Written Date:",
            type: "date",
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
        },
        {
            id: "file",
            label: "File Upload:",
            type: "file",
        },
        {
            id: "Visibility",
            label: "Visibility to Worker",
            type: "checkbox",
        },
        {
            id: "Lock",
            label: "Lock",
            type: "checkbox",
        },

    ];

    useEffect(() => {
        console.log("file : ", formData.file)
        setFile(formData.file)
    }, [formData.file])


    return (
        <div style={{width: "100%"}}>
            <UpdateDocument
                workerDocumentData={workerDocumentData}
                setWorkerDocumentData={setWorkerDocumentData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmitDocument}
                modalTitle="Add Document"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
                errMsgs={errMsgs}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={1000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Document;
