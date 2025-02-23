import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import UpdateDisability, {
    fetchDisabilityData,
} from "@/components/forms/maintenance/clients/disability/update_disability";
import {Col, Container, Row} from "react-bootstrap";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Disability() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [disability, setDisability] = useState("");

    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [disabilityData, setDisabilityData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        let mounted = true;
        const fetchAndSetDisabilityData = async () => {
            const data = await fetchDisabilityData();
            setDisabilityData(data);
        };
        fetchAndSetDisabilityData();
        return () => {
            mounted = false;
        };
    }, []);

    const handleInputChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        console.log("form :", form)

        const formData = {
            Disability: form.Disability,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertDisability",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Disability-Type added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Disability added successfully", "success")

                fetchDisabilityData().then((data) => setDisabilityData(data));
            } else {
                setOutput("Failed to add Disability");
            }
        } catch (error) {
            addValidationMessage("Failed To add Disability data", "error")

            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setDisability("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const fields = [
        {
            label: "Disability",
            id: "Disability",
            type: "text",
            value: disability,
            onChange: (event) => setDisability(event.target.value),
        },
    ];


    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateDisability
                disabilityData={disabilityData}
                setDisabilityData={setDisabilityData}
                setShowForm={setShowForm}
            />

            <Modal
                style={{
                    content: {
                        maxWidth: "500px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                        marginTop: '10vh',
                        borderRadius: '15px',
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Disability"
            >
                <ModalHeader
                    title="Add Disability"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmit}>
                    <Container>
                        <Row>
                            <Col md={12} className="mt-3">
                                <InputField
                                    type="text"
                                    id="Disability"
                                    label={"Disability:"}
                                    value={disability}
                                    onChange={(event) => setDisability(event.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mb-3 mt-3">
                            <Col className="d-flex justify-content-between">
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
                            </Col>
                        </Row>
                        <InfoOutput output={output}/>
                    </Container>
                </form>
            </Modal>
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Disability"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Disability;
