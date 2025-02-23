import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateDocumentCategory, {
    fetchDocumentCategoryData
} from "@/components/forms/maintenance/categories/document_categories/update_doumentCategories";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {ValidationContext} from "@/pages/_app";

Modal.setAppElement("#__next");

function DocumentCategory() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [description, setDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({})
    // const {loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [documentCategoryData, setDocumentCategoryData] = useState([]);

    useEffect(() => {
        const fetchAndSetDocumentCategoryData = async () => {
            const data = await fetchDocumentCategoryData();
            console.log("Data : ", data)
            setDocumentCategoryData(data);
        };
        fetchAndSetDocumentCategoryData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const dataToSend = {
            description: formData.description,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData("/api/postDocumentCategory", dataToSend, window.location.href);
            console.log("Response from backend:", response);
            if (response.success) {
                setOutput(response.message);
                clearForm();
                setShowForm(false);
                addValidationMessage("Document Category Added successfully", "success");
                fetchDocumentCategoryData().then((data) => setDocumentCategoryData(data));
            } else {
                setOutput(response.message);
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            addValidationMessage("An error occurred while adding the document category", "error")
            setOutput("An error occurred while adding the document category");
        }
    };

    const clearForm = () => {
        setOutput("");
        setDescription("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            type: "text",
            id: "description",
            label: "Description:",
            value: description,
            onChange: (event) => setDescription(event.target.value),
        },
    ];


    return (
        <div style={{padding: "1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateDocumentCategory
                addValidationMessage={addValidationMessage}
                documentCategoryData={documentCategoryData}
                setDocumentCategoryData={setDocumentCategoryData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Document Category"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />
        </div>
    );
}

export default DocumentCategory;
