import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import {Container} from "react-bootstrap";
import UpdateCulture, {fetchCultureData} from "./update_culture";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Culture() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Description: "",
    });

    const [cultureData, setCultureData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetCultureData = async () => {
            const data = await fetchCultureData();
            setCultureData(data);
        };
        fetchAndSetCultureData();
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
                "/api/insertCulture",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Culture added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Culture added successfully", "success")

                fetchCultureData().then((data) => setCultureData(data));
            } else {
                setOutput("Failed to add Culture");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Culture data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Code: "",
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
            label: "Code",
            id: "Code",
            type: "text",
            value: form.Code,
            onChange: handleChange,
        },
        {
            label: "Description",
            id: "Description",
            type: "text",
            value: form.Description,
            onChange: handleChange,
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateCulture
                cultureData={cultureData}
                setCultureData={setCultureData}
                setShowForm={setShowForm}
            />

            <Modal
                style={{
                    content: {
                        maxWidth: "600px",
                        margin: "0 auto",
                        maxHeight: "60vh",
                        overflow: "auto",
                    },
                    overlay: {
                        zIndex: 1000,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Culture"
            >
                <ModalHeader
                    title={"Add new Culture"}
                    onCloseButtonClick={handleModalCancel}
                />
                <Container>
                    <form
                        style={{padding: "1rem", transition: "all 0.5s"}}
                        onSubmit={handleSubmit}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "1rem",
                            }}
                        >
                            <InputField
                                label="Code"
                                type="text"
                                id="Code"
                                value={form.Code}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Description"
                                type="text"
                                id="Description"
                                value={form.Description}
                                onChange={handleChange}
                            />
                        </div>
                        <Button
                            type="submit"
                            label="Create"
                            backgroundColor={"blue"}
                            disabled={isSubmitting}
                        />
                        <Button type="button" label="Clear All" onClick={clearForm}/>
                        <InfoOutput output={output}/>
                    </form>
                </Container>
            </Modal>
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Culture"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Culture;
