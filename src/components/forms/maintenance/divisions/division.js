import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {Col, Container, Row} from 'react-bootstrap';
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/MaterialButton";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import UpdateDivision, {fetchDivisionData} from "./update_divisions";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

// Set the root element for Modal
Modal.setAppElement("#__next");

function Division() {
    // State variables
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Division: "",
    });
    const [divisionData, setDivisionData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    // Fetch division data on component mount
    useEffect(() => {
        let mounted = true;
        const fetchAndSetDivisionData = async () => {
            const data = await fetchDivisionData();
            setDivisionData(data);
        };
        fetchAndSetDivisionData();
        return () => {
            mounted = false;
        };
    }, []);

    // Handle form input change
    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                "/api/insertDivision",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Division added successfully");
                clearForm();
                setShowForm(false);
                fetchDivisionData().then((data) => setDivisionData(data));
                addValidationMessage("Division added successfully", "success")

            } else {
                setOutput("Failed to add division.");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Divison data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear form fields
    const clearForm = () => {
        setOutput("");
        setForm({
            Code: "",
            Division: "",
        });
    };

    // Handle modal cancel button click
    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    // Context usage
    // const {colors, loading} = useContext(ColorContext);

    // Render loading screen if data is loading
    // if (loading) {
    //     return <div>Loading...</div>;
    // }


    const fields = [
        {
            label: "Code",
            type: "text",
            id: "Code",
            value: form.Code,
            onChange: handleChange,
        },
        {
            label: "Division",
            type: "text",
            id: "Division",
            value: form.Division,
            onChange: handleChange,
        },
    ];

    return (
        <div>
            {/* Component to update division data */}
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateDivision
                divisionData={divisionData}
                setDivisionData={setDivisionData}
                setShowForm={setShowForm}
            />

            {/* Modal for adding division */}
            <Modal
                style={{
                    content: {
                        maxWidth: "600px",
                        margin: "0 auto",
                        maxHeight: "60vh",
                        overflow: "auto",
                        marginTop: '10vh',
                        borderRadius: '15px'
                    },
                    overlay: {
                        zIndex: 100,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Division"
            >
                {/* Modal header */}
                <ModalHeader
                    title={"Add new Division"}
                    onCloseButtonClick={handleModalCancel}
                />

                {/* Form for adding division */}
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmit}
                >
                    <Container>
                        <Row>
                            <Col md={6} className="mt-3">
                                <InputField
                                    label="Code"
                                    type="text"
                                    id="Code"
                                    value={form.Code}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <InputField
                                    label="Division"
                                    type="text"
                                    id="Division"
                                    value={form.Division}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mb-3">
                            <Col className="d-flex justify-content-between">
                                <Button
                                    type="submit"
                                    label="Create"
                                    variant={"contained"}
                                    color="primary"
                                    backgroundColor={"blue"}
                                    size={"small"}
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="button"
                                    label="Clear All"
                                    variant={"contained"}
                                    color="error"
                                    size={"small"}
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
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Division"
                fields={fields}
                data={form}
                onChange={handleChange}
            />

        </div>
    );
}

export default Division;
