import React, {useContext, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateLeadStatus, {
    fetchLeadStatusData,
} from "@/components/forms/maintenance/leads/lead_status/update_lead_status";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";


Modal.setAppElement("#__next");

function LeadStatus() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [leadStatus, setLeadStatus] = useState("");
    const [form, setForm] = useState({});
    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [leadStatusData, setLeadStatusData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            LeadStatus: form.LeadStatus,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertLeadStatus",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Lead Status added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Lead Status added successfully", "success")

                fetchLeadStatusData().then((data) => setLeadStatusData(data));
            } else {
                setOutput("Failed to add Lead Status");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Lead Status data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setLeadStatus("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        setForm({...form, [id]: value});
    }

    const fields = [
        {
            id: "LeadStatus",
            label: "Lead Status:",
            type: "text",
        },
    ]
    return (
        <div style={{padding: "1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateLeadStatus
                leadStatusData={leadStatusData}
                setLeadStatusData={setLeadStatusData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Lead Status"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default LeadStatus;
