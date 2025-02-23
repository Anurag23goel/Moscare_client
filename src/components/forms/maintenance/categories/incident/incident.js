import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateIncident, {fetchIncidentData} from "./update_incident";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Incident() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        CategoryCode: "",
        Description: "",
        HelpText: "",
    });

    const [incidentData, setIncidentData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);
    useEffect(() => {
        let mounted = true;
        const fetchAndSetIncidentData = async () => {
            const data = await fetchIncidentData();
            setIncidentData(data);
        };
        fetchAndSetIncidentData();
        return () => {
            mounted = false;
        };
    }, []);
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.id]: event.target.value,
        });
    };

    const handleInputChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await postData(
                "/api/insertIncident",
                form,
                window.location.href
            );
            if (response.success) {
                addValidationMessage("Incident added successfully", "success");
                clearForm();
                setShowForm(false);
                fetchIncidentData().then((data) => setIncidentData(data));
            } else {
                setOutput("Failed to add Category Code");
                addValidationMessage("Failed to Category Code", "error")
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed to Category Code", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            CategoryCode: "",
        });
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
            id: "CategoryCode",
            label: "Category Code",
            type: "text",
            value: form.CategoryCode,
            onChange: handleChange,
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>
            <UpdateIncident
                incidentData={incidentData}
                setIncidentData={setIncidentData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Incident"
                fields={fields}
                data={form}
                onChange={handleInputChange}
            />

        </div>
    );
}

export default Incident;
