import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/MaterialButton";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import {Col, Container, Row} from "react-bootstrap";
import UpdateGroup, {fetchGroupData} from "./update_group";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Group() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Groups: "",
    });

    const [groupData, setGroupData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetGroupData = async () => {
            const data = await fetchGroupData();
            setGroupData(data);
        };
        fetchAndSetGroupData();
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
                "/api/insertGroup",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Group added successfully");
                clearForm();
                setShowForm(false);
                fetchGroupData().then((data) => setGroupData(data));
                addValidationMessage("Group added successfully", "success")

            } else {
                setOutput("Failed to add Group");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Group data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Code: "",
            Groups: "",
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
            type: "text",
            id: "Code",
            value: form.Code,
            onChange: handleChange,
        },
        {
            label: "Group",
            type: "text",
            id: "Groups",
            value: form.Groups,
            onChange: handleChange,
        },
    ];


    return (
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateGroup
                groupData={groupData}
                setGroupData={setGroupData}
                setShowForm={setShowForm}
            />

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
                        zIndex: 1000,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Group"
            >
                <ModalHeader
                    title={"Add new Group"}
                    onCloseButtonClick={handleModalCancel}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmit}
                >
                    <Container>
                        <Row className="mb-3">
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
                                    label="Group"
                                    type="text"
                                    id="Groups"
                                    value={form.Groups}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col className="d-flex justify-content-between">
                                <Button
                                    type="submit"
                                    label="Create"
                                    variant={"contained"}
                                    color="primary"
                                    size={"small"}
                                    backgroundColor={"blue"}
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
                modalTitle="Add Group"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Group;
