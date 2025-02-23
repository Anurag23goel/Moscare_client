import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateTemplate, {fetchTemplateData,} from "@/components/forms/maintenance/categories/template/update_template";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Template() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [templateCategory, setTemplateCategory] = useState("");
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    // const {colors, loading} = useContext(ColorContext);
    const [form, setForm] = useState({})
    const [templateData, setTemplateData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetTemplateData = async () => {
            const data = await fetchTemplateData();
            setTemplateData(data);
        };
        fetchAndSetTemplateData();
        return () => {
            mounted = false;
        };
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            TemplateCategory: form.TemplateCategory,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertTemplateCategory",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Template Category added successfully");
                clearForm();
                setShowForm(false);
                fetchTemplateData().then((data) => setTemplateData(data));
                addValidationMessage("Template Category added successfully", "success");
            } else {
                setOutput("Failed to add area");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed to add Template", "error")
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setTemplateCategory("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            id: "TemplateCategory",
            label: "TemplateCategory",
            type: "text",
            value: templateCategory,
            onChange: (event) => setTemplateCategory(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateTemplate
                templateData={templateData}
                setTemplateData={setTemplateData}
                setShowForm={setShowForm}
            />

            <Modal
                style={{
                    content: {
                        maxWidth: "600px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Template"
            >
                <ModalHeader
                    title="Add Template"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form onSubmit={handleSubmit}>
                    <InputField
                        type="text"
                        id="TemplateCategory"
                        label={"TemplateCategory:"}
                        value={templateCategory}
                        onChange={(event) => setTemplateCategory(event.target.value)}
                    />
                    <br/>
                    <Button
                        type={"submit"}
                        label="Create"
                        backgroundColor={"blue"}
                        disabled={isSubmitting}
                    />
                    <Button
                        type={"button"}
                        label="Clear All"
                        backgroundColor={"yellow"}
                        onClick={clearForm}
                    />

                    <InfoOutput output={output}/>
                </form>
            </Modal>

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Template"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Template;
