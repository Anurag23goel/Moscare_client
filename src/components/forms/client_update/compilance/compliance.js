import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateCompliance, {
    fetchClientComplianceData,
} from "@/components/forms/client_update/compilance/update_compliance";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Compliance = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Compliance: "",
    });
    const [clientComplianceData, setClientComplianceData] = useState({data: []});
    const [clientComplianceShow, setClientComplianceShow] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    const [file, setFile] = useState(null);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientComplianceData = useCallback(async () => {
        const data = await fetchClientComplianceData(ClientID);
        setClientComplianceData(data);
        const clientComplianceShow = await fetchData(
            "/api/getComplianceDataAll",
            window.location.href
        );
        console.log(clientComplianceShow); // Check what complianceOptions looks like
        setClientComplianceShow(clientComplianceShow.data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientComplianceData();
        fetchUserRoles("m_cprofile", "Client_Profile_Compliance", setDisableSection);
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            if (!file) {
                setOutput("Please select a file.");
                setIsSubmitting(false);
                return;
            }

            const company = process.env.NEXT_PUBLIC_COMPANY; // Replace with logic to get company name
            const compliance = formData.Compliance;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generateFolderPath(company, compliance, fileName);
            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const response = await postData("/api/postS3Data", {
                FolderPath,
            });

            const {uploadURL} = response;

            if (!uploadURL) {
                setOutput("Failed to get pre-signed URL.");
                setIsSubmitting(false);
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
                    `/api/postClientComplianceData/${ClientID}`,
                    combinedData,
                    window.location.href
                );

                if (insertResponse.success) {
                    setOutput("Client Compliance added successfully");
                    clearForm();
                    fetchAndSetClientComplianceData();
                } else {
                    setOutput("Failed to add client Compliance");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client Compliance");
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


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutput("");
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            Compliance: "",
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

    const generateFolderPath = (company, compliance, filename) => {
        return `${company}/client/${ClientID}/compliance/${compliance}/${filename}`;
    };

    const fields = [
        {
            id: "Compliance",
            label: "Compliance:",
            type: "select",
            value: formData.Compliance,
            onChange: handleInputChange,
            options: clientComplianceShow.map((comp) => ({
                value: comp.Description,
                label: comp.Description,
            })),
        },
        {
            id: "file",
            label: "File Upload:",
            type: "file",
            onChange: handleFileChange,
        },
    ];
    useEffect(() => {
        console.log("File : ", formData.file)
        setFile(formData.file)
    }, [formData.file])


    return (
        <div style={{width: "100%"}}>
            <UpdateCompliance
                clientComplianceData={clientComplianceData}
                setClientComplianceData={setClientComplianceData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitForm(e)}
                modalTitle="Add Compliance"
                fields={fields}
                data={formData || {}}
                onChange={handleInputChange}

            />
        </div>
    );
};

export default Compliance;