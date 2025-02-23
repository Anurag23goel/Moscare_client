import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateForm, {fetchClientFormData,} from "@/components/forms/client_update/form/update_form";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Form = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        TemplateName: "",
        FormName: "",
        AssignTo: "",
        CreatedBy: "",
        ReviewDate: "",
        CreationDate: "",
        Status: "OPEN",
    });
    const [clientFormData, setClientFormData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formOptions, setFormOptions] = useState([]);
    const [assignData, setAssignData] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientFormData = useCallback(async () => {
        const data = await fetchClientFormData(ClientID);
        const formdata = await fetchData(
            "/api/getTemplateCategory",
            window.location.href
        );
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const presentClient = await fetchData(
            `/api/getClientMasterData/${ClientID}`,
            window.location.href
        );
        setFormOptions(formdata?.data);
        setAssignData(formdata2.data);
        setFormData((prev) => ({
            ...prev,
            CreatedBy: presentClient.data[0].FirstName,
        }));
        setClientFormData(data);
    }, [ClientID]);


    useEffect(() => {
        fetchAndSetClientFormData();
        fetchUserRoles("m_cprofile", "Client_Profile_Form", setDisableSection);
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        // setIsSubmitting(true);
        console.log("Data : ", formData)
        console.log("file : ", file)

        try {
            if (!file) {
                setOutput("No file selected. Please upload a file.");
                setIsSubmitting(false);
                return;
            }

            const company = process.env.NEXT_PUBLIC_COMPANY;
            const formCategory = formData.TemplateName;
            const formName = formData.FormName;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generateFolderPath(
                company,
                formCategory,
                formName,
                fileName
            );
            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const response = await postData("/api/postS3Data", {FolderPath});

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
                console.log("File uploaded successfully!")
                const combinedData = {
                    ...formData,
                    Folder: folderforDB,
                    Bucket: "moscaresolutions",
                    File: FileNameforDB,
                };

                const insertResponse = await postData(
                    `/api/insertClientFormData/${ClientID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Client Document added successfully");
                    clearForm();
                    fetchAndSetClientFormData();
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
        setFormData((prevState) => ({...prevState, [id]: value}));
    };


    const clearForm = () => {
        setOutput("");
        setFormData({
            TemplateName: "",
            FormName: "",
            AssignTo: "",
            CreatedBy: formData.CreatedBy,
            ReviewDate: "",
            CreationDate: "",
            Status: "Open",
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    const generateFolderPath = (company, formCategory, formName, filename) => {
        return `${company}/client/${ClientID}/form/${formCategory}_${formName}/${filename}`;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutput("");
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    useEffect(() => {
        console.log("File : ", formData.file)
        setFile(formData.file)
    }, [formData.file])

    const fields = [
        {
            id: "TemplateName",
            label: "Template Name:",
            type: "select",
            disabled: disableSection,
            options: formOptions.map((form) => ({
                value: form.TemplateCategory,
                label: form.TemplateCategory,
            })),
        },
        {
            id: "FormName",
            label: "Form Name:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "AssignTo",
            label: "Assign To:",
            type: "select",
            disabled: disableSection,
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "CreationDate",
            label: "Creation Date:",
            type: "date",
            disabled: disableSection,
        },
        {
            id: "ReviewDate",
            label: "Review Date:",
            type: "date",
            disabled: disableSection,
        },

        {
            id: "file",
            label: "File Upload:",
            type: "file",
            onChange: handleFileChange,
            disabled: disableSection,
        },
    ];


    return (
        <div style={{width: "100%"}}>
            <UpdateForm
                clientFormData={clientFormData}
                setClientFormData={setClientFormData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitForm(e)}
                modalTitle="Add Form"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Form;
