import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateNoteCategory, {
    fetchNoteCategoryData
} from "@/components/forms/maintenance/categories/note_categories/update_note_categories";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function NoteCategory() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [description, setDescription] = useState("");
    // const {loading} = useContext(ColorContext);
    const [noteCategoryData, setNoteCategoryData] = useState([]);
    // const {colors} = useContext(ColorContext);
    const [form, setForm] = useState({})
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetNoteCategoryData = async () => {
            const data = await fetchNoteCategoryData();
            setNoteCategoryData(data);
        };
        fetchAndSetNoteCategoryData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            description: form.description,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData("/api/postNoteCategory", formData, window.location.href);
            console.log("Response from backend:", response);
            if (response.success) {
                setOutput(response.message);
                clearForm();
                setShowForm(false);
                fetchNoteCategoryData().then((data) => setNoteCategoryData(data));
                addValidationMessage("Note added successfully", "success");

            } else {
                setOutput(response.message);
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            addValidationMessage("Error adding Notes Data ", "error");

            setOutput("An error occurred while adding the note category");
        }
    };

    const handleInputChange = ({id, value}) => {
        console.log(id, value)
        setForm((prevState) => ({...prevState, [id]: value}));
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

            <UpdateNoteCategory
                noteCategoryData={noteCategoryData}
                setNoteCategoryData={setNoteCategoryData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Note Categories"
                fields={fields}
                data={form}
                onChange={handleInputChange}
            />

        </div>
    );
}

export default NoteCategory;
