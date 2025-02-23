import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";
import ModalHeader from "@/components/widgets/ModalHeader";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import UpdateContact, {fetchContactData,} from "@/components/forms/operations/lead/form/contact/update_contact";
import {Col, Container, Row} from "react-bootstrap";

Modal.setAppElement("#__next");

const Contact = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        FirstName: "",
        LastName: "",
        Organisation: "",
    });

    const [contactData, setContactData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetContactData = async () => {
            const data = await fetchContactData();
            setContactData(data);
        };
        fetchAndSetContactData();
        return () => {
            mounted = false;
        };
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.id]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                "/api/postContactGeneralData",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Contact  added successfully");
                clearForm();
                setShowForm(false);
                fetchContactData().then((data) => setContactData(data));
            } else {
                setOutput("Failed to add contact");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            FirstName: "",
            LastName: "",
            Organisation: "",
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    return (
        <div>
            <UpdateContact
                contactData={contactData}
                setContactData={setContactData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "1rem", zIndex: "5"}}>
                <hr/>

                <Modal
                    style={{
                        content: {
                            maxWidth: "500px",
                            margin: "0 auto",
                            maxHeight: "70vh",
                            overflow: "auto",
                            marginTop: '10vh',
                            borderRadius: '15px',
                        },
                        overlay: {
                            zIndex: "10",
                        },
                    }}
                    isOpen={showForm}
                    contentLabel="Add Contact "
                >
                    <ModalHeader
                        title={"Add new contact"}
                        onCloseButtonClick={handleModalCancel}
                    />
                    <form
                        style={{padding: "1rem", transition: "all 0.5s"}}
                        onSubmit={handleSubmit}
                    >
                        <Container>
                            <Row>
                                <Col md={12} className="mt-3">
                                    <InputField
                                        label="First Name "
                                        type="text"
                                        id="FirstName"
                                        value={form.FirstName}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12} className="mt-3">
                                    <InputField
                                        label="Last Name "
                                        type="text"
                                        id="LastName"
                                        value={form.LastName}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12} className="mt-3">
                                    <InputField
                                        label="Organisation "
                                        type="text"
                                        id="Organisation"
                                        value={form.Organisation}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={10} className="mt-3 d-flex justify-content-start">
                                    <Button
                                        type="submit"
                                        label="Create"
                                        variant="contained"
                                        disabled={isSubmitting}
                                    />
                                </Col>
                            </Row>
                            <InfoOutput output={output}/>
                        </Container>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default Contact;