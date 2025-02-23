import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateService, {fetchServiceData,} from "@/components/forms/maintenance/categories/service/update_service";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Service() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    // const {colors, loading} = useContext(ColorContext);
    const [form, setForm] = useState({})
    const [serviceData, setServiceData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAndSetServiceData = async () => {
            const data = await fetchServiceData();
            setServiceData(data);
        };
        fetchAndSetServiceData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            Code: form.Code,
            Description: form.Description,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertServiceCategory",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Service Category added successfully");
                clearForm();
                setShowForm(false);
                fetchServiceData().then((data) => setServiceData(data));
                addValidationMessage("Service Category added successfully", "success")
            } else {
                setOutput("Failed to add area");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed to add service category", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setCode("");
        setDescription("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            id: "Code",
            label: "Code",
            type: "text",
            value: code,
            onChange: (event) => setCode(event.target.value),
        },
        {
            id: "Description",
            label: "Description",
            type: "text",
            value: description,
            onChange: (event) => setDescription(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateService
                serviceData={serviceData}
                setServiceData={setServiceData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Service"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Service;
