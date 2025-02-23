import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateLeadSource, {
    fetchLeadSourceData,
} from "@/components/forms/maintenance/leads/lead_source/update_lead_source";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Lead() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [leadSource, setLeadSource] = useState("");
    // const {colors, loading} = useContext(ColorContext);
    const [leadSourceData, setLeadSourceData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({});
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetLeadSourceData = async () => {
            const data = await fetchLeadSourceData();
            setLeadSourceData(data);

        };
        fetchAndSetLeadSourceData();
        return () => {
            mounted = false;
        };
    }, []);

    const handleChange = ({id, value}) => {
        console.log(id, value)
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            LeadSource: form.LeadSource,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertLeadSource",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Lead Source added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Lead added successfully", "success")

                fetchLeadSourceData().then((data) => setLeadSourceData(data));
            } else {
                setOutput("Failed to add Lead");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Lead data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setLeadSource("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            id: "LeadSource",
            label: "Lead Source:",
            type: "text",
            value: leadSource,
            onChange: (event) => setLeadSource(event.target.value),
        },
    ]

    return (
        <div style={{padding: "1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateLeadSource
                leadSourceData={leadSourceData}
                setLeadSourceData={setLeadSourceData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Lead Source"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Lead;
