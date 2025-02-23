import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateClientCompliance, {
    fetchClientComplianceData,
} from "@/components/forms/maintenance/clients/client_compliance/update_client_compliance";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const ClientCompliance = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Description: "",
        ExpiryDays: "",
        WarningDays: "",
        Mandatory: false,
        NoExpiryDate: false,
        NoStartDate: false,
    });
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [clientComplianceData, setClientComplianceData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetClientComplianceData = async () => {
            const data = await fetchClientComplianceData();
            setClientComplianceData(data);
        };
        fetchAndSetClientComplianceData();
        return () => {
            mounted = false;
        };
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                "/api/postComplianceData",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("ClientCompliance  added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Client Compliance added successfully", "success")
                fetchClientComplianceData().then((data) =>
                    setClientComplianceData(data)
                );
            } else {
                setOutput("Failed to add clientCompliance");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Client Compliance data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Description: "",
            ExpiryDays: "",
            WarningDays: "",
            Mandatory: false,
            NoExpiryDate: false,
            NoStartDate: false,
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            label: "Description",
            id: "Description",
            type: "text",
            value: form.Description,
            onChange: handleChange,
        },
        {
            label: "ExpiryDays",
            id: "ExpiryDays",
            type: "number",
            value: form.ExpiryDays,
            onChange: handleChange,
        },
        {
            label: "WarningDays",
            id: "WarningDays",
            type: "number",
            value: form.WarningDays,
            onChange: handleChange,
        },
        {
            label: "Mandatory",
            id: "Mandatory",
            type: "checkbox",
            checked: form.Mandatory,
            onChange: handleChange,
        },
        {
            label: "NoStart Date",
            id: "NoStartDate",
            type: "checkbox",
            checked: form.NoStartDate,
            onChange: handleChange,
        },
        {
            label: "NoExpiryDate",
            id: "NoExpiryDate",
            type: "checkbox",
            checked: form.NoExpiryDate,
            onChange: handleChange,
        },
    ];

    return (
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateClientCompliance
                clientComplianceData={clientComplianceData}
                setClientComplianceData={setClientComplianceData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "0 1rem", zIndex: "5"}}>
                <hr/>


            </div>
            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Client Compliance"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
};

export default ClientCompliance;
