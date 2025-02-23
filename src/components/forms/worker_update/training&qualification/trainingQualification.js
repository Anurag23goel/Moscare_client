import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateTrainingQualification, {
    fetchWorkerTrainingQualificationData,
} from "@/components/forms/worker_update/training&qualification/update_trainingQualification";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const TrainingQualification = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        TrainingItem: "",
        CredentialLevel: "",
        TrainingDate: "",
        ReviewDate: "",
        ExpiryDate: "",
        Note: "",
        EffectiveCompetant: false,
    });
    const [workerTrainingQualificationData, setWorkerTrainingQualificationData] =
        useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [trainingItem, setTrainingItem] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerTrainingQualificationData = useCallback(async () => {
        const data = await fetchWorkerTrainingQualificationData(WorkerID);
        const trainingItems = await fetchData(
            "/api/getTrainingItems",
            window.location.href
        );
        setTrainingItem(trainingItems.data);
        console.log(trainingItems);
        setWorkerTrainingQualificationData(data);
    }, [WorkerID]);

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

            const specificRead = WriteData.filter((role) => role.Menu_ID === 'm_wprofile' && role.ReadOnly === 0);
            console.log('Worker_Profile Condition', specificRead);

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
        fetchAndSetWorkerTrainingQualificationData();
        fetchUserRoles();
    }, []);

    const handleSubmitTrainingQualification = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            const trainingItem = formData.TrainingItem;
            const credLevel = formData.CredentialLevel;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generateFolderPath(
                company,
                trainingItem,
                credLevel,
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
                    `/api/insertWorkerTrainingQualificationData/${WorkerID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Worker Training Data added successfully");
                    clearForm();
                    fetchAndSetWorkerTrainingQualificationData();
                } else {
                    setOutput("Failed to add Worker Training Data");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("No file selected. Please choose a file before proceeding");
        } finally {
            setIsSubmitting(false);
        }
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
    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            TrainingItem: "",
            CredentialLevel: "",
            TrainingDate: "",
            ReviewDate: "",
            ExpiryDate: "",
            Note: "",
            EffectiveCompetant: false,
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    const generateFolderPath = (company, trainingItem, credLevel, filename) => {
        return `${company}/worker/${WorkerID}/training/${trainingItem}_${credLevel}/${filename}`;
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
            id: "TrainingItem",
            label: "Training Item:",
            type: "select",
            options: trainingItem.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            disabled: disableSection,
        },
        {
            id: "CredentialLevel",
            label: "Credential Level:",
            type: "select",
            options: [
                {value: "Credentailled", label: "Credentailled"},
                {value: "Educated", label: "Educated"},
                {value: "Trained", label: "Trained"},
                {value: "Informal", label: "Informal"},
            ],
            disabled: disableSection,
        },
        {
            id: "TrainingDate",
            label: "Training Date:",
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
            id: "ExpiryDate",
            label: "Expiry Date:",
            type: "date",
            disabled: disableSection,
        },
        {
            id: "file",
            label: "File Upload:",
            type: "file",

        },
        {
            id: "Note",
            label: "Note:",
            type: "text", // Defaulting to text as no type is explicitly defined
            disabled: disableSection,
        },
        {
            id: "EffectiveCompetant",
            label: "Effective & Competant:",
            type: "checkbox",
            disabled: disableSection,
        },

    ];

    useEffect(() => {
        console.log("file : ", formData.file)
        setFile(formData.file)
    }, [formData.file])


    return (
        <div style={{width: "100%"}}>
            <UpdateTrainingQualification
                workerTrainingQualificationData={workerTrainingQualificationData}
                setWorkerTrainingQualificationData={setWorkerTrainingQualificationData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
                trainingItemOptions={trainingItem}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitTrainingQualification(e)}
                modalTitle="Add Training Qualification"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />
        </div>
    );
};

export default TrainingQualification;
