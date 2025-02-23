import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateEquipment, {fetchEquipmentData} from "./update_equipment";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';

Modal.setAppElement("#__next");

function Equipment() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Description: "",
    });

    const [equipmentData, setEquipmentData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationMessages, setValidationMessages] = useState([]);

    const addValidationMessage = useCallback((content, type = "info") => {
        const id = uuidv4();
        setValidationMessages((prev) => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);


    useEffect(() => {
        let mounted = true;
        const fetchAndSetEquipmentData = async () => {
            const data = await fetchEquipmentData();
            setEquipmentData(data);
        };
        fetchAndSetEquipmentData();
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
                "/api/insertEquipment",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Equipment added successfully");
                addValidationMessage("Equipment added successfully", "success");
                clearForm();
                setShowForm(false);
                fetchEquipmentData().then((data) => setEquipmentData(data));
            } else {
                setOutput("Failed to add Description");
                addValidationMessage("Failed to add Description", "error");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage(error?.messages, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Description: "",
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
            id: "Description",
            label: "Description",
            type: "text",
            value: form.Description,
            onChange: handleChange,
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar
                messages={validationMessages}
                onClose={handleCloseMessage}
            />
            <UpdateEquipment
                equipmentData={equipmentData}
                setEquipmentData={setEquipmentData}
                setShowForm={setShowForm}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Equipment"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Equipment;
