import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";
import ModalHeader from "@/components/widgets/ModalHeader";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdatePayer, {fetchPayerData,} from "@/components/forms/maintenance/payer/update_payer";
import {Col, Container, Row} from "react-bootstrap";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Payer = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        PayerCode: "",
        PayerName: "",
    });
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [payerData, setPayerData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetPayerData = async () => {
            const data = await fetchPayerData();
            setPayerData(data);
        };
        fetchAndSetPayerData();
        return () => {
            mounted = false;
        };
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
                "/api/postPayerGeneralData",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Payer  added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Payer added successfully", "success")

                fetchPayerData().then((data) => setPayerData(data));
            } else {
                setOutput("Failed to add payer");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Payer data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            PayerCode: "",
            PayerName: "",
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            label: "Payer Code",
            type: "text",
            id: "PayerCode",
            value: form.PayerCode,
            onChange: handleChange,
        },
        {
            label: "Payer Name",
            type: "text",
            id: "PayerName",
            value: form.PayerName,
            onChange: handleChange,
        },
    ];

    return (
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdatePayer
                payerData={payerData}
                setPayerData={setPayerData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "1rem", zIndex: "5"}}>
                <hr/>

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
                            zIndex: "10",
                        },
                    }}
                    isOpen={showForm}
                    contentLabel="Add Payer "
                >
                    <ModalHeader
                        title={"Add new payer"}
                        onCloseButtonClick={handleModalCancel}
                    />
                    <form
                        style={{padding: "1rem", transition: "all 0.5s"}}
                        onSubmit={handleSubmit}
                    >
                        <Container>
                            <Row>
                                <Col md={6} className="mt-3">
                                    <InputField
                                        label="Payer Code "
                                        type="text"
                                        id="PayerCode"
                                        value={form.PayerCode}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md={6} className="mt-3">
                                    <InputField
                                        label="Payer Name "
                                        type="text"
                                        id="PayerName"
                                        value={form.PayerName}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col className="mt-3 d-flex justify-content-start">
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
            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Payer"
                fields={fields}
                data={form}
                onChange={handleChange}
            />

        </div>
    );
};

export default Payer;