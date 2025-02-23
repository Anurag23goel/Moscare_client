import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, postData,} from "@/utility/api_utility";
import UpdateDocument, {fetchClientDocumentData,} from "@/components/forms/client_update/document/update_document";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Document = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Url: "",
        DocName: "",
        Category: "",
        Note: "",
        WrittenDate: "",
        VisibilityClient: false,
        VisibilityWorker: false,
        Lock: false,
        file: ""
    });

    const [clientDocumentData, setClientDocumentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [file, setFile] = useState("");
    // const {colors, loading} = useContext(ColorContext);
    const [errMsgs, setErrMsgs] = useState([])
    const fetchAndSetClientDocumentData = useCallback(async () => {
        const data = await fetchClientDocumentData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setClientDocumentData(data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientDocumentData();
        fetchUserRoles("m_cprofile", "Client_Profile_Document", setDisableSection);
    }, []);

    useEffect(() => {
        console.log("file : ", formData.file)
        setFile(formData.file)
    }, [formData.file])

    const handleSubmitDocument = async (event) => {
        event.preventDefault();
        // setIsSubmitting(true);
        console.log("formData : ", formData)
        console.log("file : ", file)

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
                    `/api/insertClientDocumentData/${ClientID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Client Document added successfully");
                    clearForm();
                    fetchAndSetClientDocumentData();
                } else {
                    setOutput("Failed to add client document");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client document");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = ({id, value}) => {
        // URL validation regex
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

        // Update form data regardless of whether the URL is valid or not
        setFormData((prevState) => ({...prevState, [id]: value}));
    };


    const clearForm = () => {
        setOutput("");
        setFormData({
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            WrittenDate: "",
            VisibilityClient: false,
            VisibilityWorker: false,
            Lock: false,
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

    const generateFolderPath = (company, docCategory, docName, filename) => {
        return `${company}/client/${ClientID}/documents/${docCategory}_${docName}/${filename}`;
    };

    const handleFileChange = (e) => {
        console.log("File Called")
        setFile(e.target.files[0]);
        setOutput("");
    };

    const fields = [
        {
            id: "Url",
            label: "URL:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "DocName",
            label: "Document Name:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            disabled: disableSection,
            options: documentOptions.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "WrittenDate",
            label: "Written Date:",
            type: "date",
            disabled: disableSection,
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
            disabled: disableSection,
        },
        {
            id: "file",
            label: "File Upload:",
            type: "file",
            onChange: handleFileChange,
        },
        {
            id: "VisibilityClient",
            label: "Visibility Client",
            type: "checkbox",
            checked: formData.VisibilityClient,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "VisibilityWorker",
            label: "Visibility Worker",
            type: "checkbox",
            checked: formData.VisibilityWorker,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "Lock",
            label: "Lock",
            type: "checkbox",
            checked: formData.Lock,
            onChange: handleInputChange,
            disabled: disableSection,
        },

    ];


    return (
        <div style={{width: "100%"}}>
            <UpdateDocument
                clientDocumentData={clientDocumentData}
                setClientDocumentData={setClientDocumentData}
                setShowForm={setShowForm}
                ClientID={ClientID}
                errMsgs={errMsgs}
                setErrMsgs={setErrMsgs}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitDocument(e)}
                modalTitle="Add Document"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
                errMsgs={errMsgs}
                // onFileChange = {handleFileChange}
            />
        </div>
    );
};

export default Document;
