import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateDocument, {
    fetchWorkerDocumentData,
} from "@/components/forms/operations/lead/form/document/update_document";
import {Checkbox} from "@mui/material";
import {useRouter} from "next/router";
import {Col, Container, Row} from 'react-bootstrap';

Modal.setAppElement("#__next");

const Document = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Url: "",
        DocName: "",
        Category: "",
        Note: "",
        CreatedBy: "",
        WrittenDate: "",
        TimeStamp: "",
        Visibility: false,
        Lock: false,
    });

    const [workerDocumentData, setWorkerDocumentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerDocumentData = useCallback(async () => {
        const data = await fetchWorkerDocumentData(WorkerID);
        const presentWorker = await fetchData(
            `/api/getWorkerMasterData/${WorkerID}`,
            window.location.href
        );
        // setFormData((prev) => ({
        //    ...prev,
        //    CreatedBy: presentWorker.data[0].FirstName,
        // }));
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data)
        setWorkerDocumentData(data);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerDocumentData();
    }, []);

    const handleSubmitDocument = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerDocumentData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Document added successfully");
                clearForm();
                fetchAndSetWorkerDocumentData();
            } else {
                setOutput("Failed to add worker document");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker document");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setFormData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            CreatedBy: "",
            WrittenDate: "",
            TimeStamp: "",
            Visibility: false,
            Lock: false,
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div style={{padding: "1rem", width: "100%"}}>
            <UpdateDocument
                workerDocumentData={workerDocumentData}
                setWorkerDocumentData={setWorkerDocumentData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />
            <Modal
                isOpen={showForm}
                contentLabel="Add Worker Document"
                style={{
                    content: {
                        maxWidth: "500px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                        marginTop: '6vh',
                        borderRadius: '15px'
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
            >
                <ModalHeader
                    title="Add Worker Document"
                    onCloseButtonClick={handleModalCancel}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmitDocument}>
                    <Container>
                        <Row>
                            <Col md={12} className="mt-2">
                                <InputField
                                    id="Url"
                                    label="URL:"
                                    value={formData.Url}
                                    type="text"
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col md={12} className="mt-2">
                                <InputField
                                    id="DocName"
                                    label="Document Name:"
                                    value={formData.DocName}
                                    type="text"
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col md={6} className="mt-2">
                                <InputField
                                    id="Category"
                                    label="Category:"
                                    value={formData.Category}
                                    type="select"
                                    onChange={handleInputChange}
                                    options={documentOptions.map((form) => ({
                                        value: form.Description,
                                        label: form.Description,
                                    }))}
                                />
                            </Col>
                            <Col md={6} className="mt-2">
                                <InputField
                                    id="WrittenDate"
                                    label="Written Date:"
                                    value={formData.WrittenDate}
                                    type="date"
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col md={12} className="mt-2">
                                <InputField
                                    id="Note"
                                    label="Note:"
                                    value={formData.Note}
                                    type="textarea"
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Checkbox
                                    id="Visibility"
                                    checked={formData.Visibility}
                                    onChange={handleInputChange}
                                    name="checkbox"
                                />
                                Visibility to Worker
                            </Col>
                            <Col md={12}>
                                <Checkbox
                                    id="Lock"
                                    checked={formData.Lock}
                                    onChange={handleInputChange}
                                    name="checkbox"
                                />
                                Lock
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col className="d-flex justify-content-between">
                                <Button
                                    type="submit"
                                    label="Create"
                                    backgroundColor={"blue"}
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="button"
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
        </div>
    );
};

export default Document;
