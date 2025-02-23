import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateDocuments, {
    fetchClientDocumentsData,
} from "@/components/forms/maintenance/location_profile/form/document/UpdateDocuments";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Documents = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
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
    });

    const [clientDocumentData, setClientDocumentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [file, setFile] = useState(null);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);
    const [errMsgs, setErrMsgs] = useState([])

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientDocumentData = useCallback(async () => {
        const data = await fetchClientDocumentsData(UpdateID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data)
        setClientDocumentData(data);
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
        fetchAndSetClientDocumentData();
        fetchUserRoles();
    }, []);

    const handleSubmitDocument = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

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
                    `/api/postLocProfDocumentData/${UpdateID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Client Document added successfully");
                    clearForm();
                    fetchAndSetClientDocumentData();
                    addValidationMessage("Document added successfully", "success")

                } else {
                    setOutput("Failed to add client document");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client document");
            addValidationMessage("Failed To add Document data", "error")

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

    const generateFolderPath = (company, docCategory, docName, filename) => {
        return `${company}/maintenance/location_profile/${UpdateID}/documents/${docCategory}_${docName}/${filename}`;
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
            label: "URL",
            id: "Url",
            type: "text",
            value: formData.Url,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Document Name",
            id: "DocName",
            type: "text",
            value: formData.DocName,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Category",
            id: "Category",
            type: "select",
            value: formData.Category,
            onChange: handleInputChange,
            options: documentOptions.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            disabled: disableSection,
        },
        {
            label: "Written Date",
            id: "WrittenDate",
            type: "date",
            value: formData.WrittenDate,
            onChange: handleInputChange,
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
        {
            label: "Visibility Client",
            id: "VisibilityClient",
            type: "checkbox",
            checked: formData.VisibilityClient,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Visibility Worker",
            id: "VisibilityWorker",
            type: "checkbox",
            checked: formData.VisibilityWorker,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Lock",
            id: "Lock",
            type: "checkbox",
            checked: formData.Lock,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Upload File",
            id: "file",
            type: "file",
            onChange: handleFileChange,
        },
    ];

    useEffect(() => {
        setFile(formData.file)
    }, [formData.file])

    return (
        <div style={{padding: "0 1rem", width: "100%"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateDocuments
                clientDocumentData={clientDocumentData}
                setClientDocumentData={setClientDocumentData}
                setShowForm={setShowForm}
                ClientID={UpdateID}
            />

            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitDocument}
                modalTitle="Add Documents"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
                errMsgs={errMsgs}
            />
        </div>
    );
};

export default Documents;
