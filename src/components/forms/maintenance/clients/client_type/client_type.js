import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateClientType, {
    fetchClientTypeData,
} from "@/components/forms/maintenance/clients/client_type/update_client_type";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function ClientType() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [clientType, setClientType] = useState("");
    // const {colors, loading} = useContext(ColorContext);
    const [clientTypeData, setClientTypeData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({})
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetClientTypeData = async () => {
            const data = await fetchClientTypeData();
            setClientTypeData(data);
        };
        fetchAndSetClientTypeData();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            Type: form.clienttype,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertClientType",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client-Type added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Client Type added successfully", "success")

                fetchClientTypeData().then((data) => setClientTypeData(data));
            } else {
                setOutput("Failed to add Client Type");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Client Type data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setClientType("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            label: "ClientType",
            id: "clienttype",
            type: "text",
            value: clientType,
            onChange: (event) => setClientType(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateClientType
                clientTypeData={clientTypeData}
                setClientTypeData={setClientTypeData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Client Type"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default ClientType;
