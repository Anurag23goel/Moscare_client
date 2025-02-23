import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import {Container} from "react-bootstrap";
import UpdateInterests, {fetchInterestsData} from "./update_interests";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Interests() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Description: "",
    });

    const [interestsData, setInterestsData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetInterestsData = async () => {
            const data = await fetchInterestsData();
            setInterestsData(data);
        };
        fetchAndSetInterestsData();
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
                "/api/insertInterests",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Interests added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Interest added successfully", "success")

                fetchInterestsData().then((data) => setInterestsData(data));
            } else {
                setOutput("Failed to add Interests");
            }
        } catch (error) {
            addValidationMessage("Failed To add Interest data", "error")

            console.error(error);
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

            <UpdateInterests
                interestsData={interestsData}
                setInterestsData={setInterestsData}
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
                contentLabel="Add Interests"
            >
                <ModalHeader
                    title={"Add new Interests"}
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
                modalTitle="Add Interest"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Interests;
