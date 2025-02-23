import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateCompliance, {
    fetchClientComplianceData,
} from "@/components/forms/maintenance/location_profile/form/compliance/UpdateCompliance";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

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
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);


    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    console.log("User_ID", userId);

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
        fetchAndSetClientComplianceData();
        fetchUserRoles();
    }, []);

    const handleSubmitForm = async (event) => {
        console.log("formData : ", formData)
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postLocProfComplianceData/${ClientID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Compliance added successfully");
                clearForm();
                fetchAndSetClientComplianceData();
                addValidationMessage("Compliance added successfully", "success")

            } else {
                setOutput("Failed to add client Compliance");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client Compliance");
            addValidationMessage("Failed To add Compliance data", "error")

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
    const fields = [
        {
            label: "Compliance",
            id: "Compliance",
            type: "select",
            value: formData.Compliance,
            onChange: handleInputChange,
            options: clientComplianceShow.map((comp) => ({
                value: comp.Description,
                label: comp.Description,
            })),
        },
    ];

    return (
        <div style={{padding: "0 1rem", width: "100%"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateCompliance
                clientComplianceData={clientComplianceData}
                setClientComplianceData={setClientComplianceData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />

            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitForm}
                modalTitle="Add Client Compliance"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Compliance;
