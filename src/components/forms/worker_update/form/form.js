import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateForm, {fetchWorkerFormData,} from "@/components/forms/worker_update/form/update_form";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Form = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
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
    const [workerFormData, setWorkerFormData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formOptions, setFormOptions] = useState([]);
    const [assignData, setAssignData] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerFormData = useCallback(async () => {
        const data = await fetchWorkerFormData(WorkerID);
        const formdata = await fetchData(
            "/api/getTemplateCategory",
            window.location.href
        );
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const presentWorker = await fetchData(
            `/api/getWorkerMasterData/${WorkerID}`,
            window.location.href
        );
        setFormOptions(formdata?.data);
        setAssignData(formdata2.data);
        setFormData((prev) => ({
            ...prev,
            CreatedBy: presentWorker.data[0].FirstName,
        }));
        setWorkerFormData(data);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerFormData();
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
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
                    `/api/insertWorkerFormData/${WorkerID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Worker Training Data added successfully");
                    clearForm();
                    fetchAndSetWorkerFormData();
                } else {
                    setOutput("Failed to add Worker Training Data");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding Worker Training Data");
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
        return `${company}/worker/${WorkerID}/form/${formCategory}_${formName}/${filename}`;
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
            id: "TemplateName",
            label: "Template Name:",
            type: "select",
            options: formOptions.map((form) => ({
                value: form.TemplateCategory,
                label: form.TemplateCategory,
            })),
        },
        {
            id: "FormName",
            label: "Form Name:",
            type: "text",
        },
        {
            id: "AssignTo",
            label: "Assign To:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "CreationDate",
            label: "Creation Date:",
            type: "date",
        },
        {
            id: "ReviewDate",
            label: "Review Date:",
            type: "date",
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
            <UpdateForm
                workerFormData={workerFormData}
                setWorkerFormData={setWorkerFormData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
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
