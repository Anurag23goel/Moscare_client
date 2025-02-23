import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdatePayerCategory, {
    fetchPayerCategoryData
} from "@/components/forms/maintenance/categories/payer_categories/update_payer_categories";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {ValidationContext} from "@/pages/_app";

Modal.setAppElement("#__next");

function PayerCategory() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [form, setForm] = useState({})
    // const {loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [payerCategoryData, setPayerCategoryData] = useState([]);

    useEffect(() => {
        const fetchAndSetPayerCategoryData = async () => {
            const data = await fetchPayerCategoryData();
            setPayerCategoryData(data);
        };
        fetchAndSetPayerCategoryData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            code: form.code,
            description: form.description,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData("/api/postPayerCategory", formData, window.location.href);
            console.log("Response from backend:", response);
            if (response.success) {
                setOutput(response.message);
                clearForm();
                setShowForm(false);
                fetchPayerCategoryData().then((data) => setPayerCategoryData(data));
                addValidationMessage("Payer category added successfully", "success");
            } else {
                setOutput(response.message);
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            setOutput("An error occurred while adding the payer category");
            addValidationMessage("An error occurred while adding the payer category", "error");

        }
    };

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
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
            id: "code",
            label: "Code",
            type: "text",
            value: code,
            onChange: (event) => setCode(event.target.value),
        },
        {
            id: "description",
            label: "Description",
            type: "text",
            value: description,
            onChange: (event) => setDescription(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdatePayerCategory
                addValidationMessage={addValidationMessage}
                payerCategoryData={payerCategoryData}
                setPayerCategoryData={setPayerCategoryData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Payer"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default PayerCategory;
