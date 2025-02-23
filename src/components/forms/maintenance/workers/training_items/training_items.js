import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateTrainingItems, {
    fetchTrainingItemsData,
} from "@/components/forms/maintenance/workers/training_items/update_training_items";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function TrainingItems() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [form, setForm] = useState({});
    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [trainingItemsData, setTrainingItemsData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAndSetTrainingItemsData = async () => {
            const data = await fetchTrainingItemsData();
            setTrainingItemsData(data);
        };
        fetchAndSetTrainingItemsData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

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
                "/api/insertTrainingItems",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Training Items added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Training Items added successfully", "success")

                fetchTrainingItemsData().then((data) => setTrainingItemsData(data));
            } else {
                setOutput("Failed to add Training Items");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Training Items data", "error")

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

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    const fields = [
        {
            id: "Code",
            label: "Code:",
            type: "text",
        },
        {
            id: "Description",
            label: "Description:",
            type: "text",
        },
    ];


    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateTrainingItems
                trainingItemsData={trainingItemsData}
                setTrainingItemsData={setTrainingItemsData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Training Items"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default TrainingItems;
