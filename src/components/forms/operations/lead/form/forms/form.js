import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateForm, {fetchWorkerFormData,} from "@/components/forms/operations/lead/form/forms/update_form";
import {useRouter} from "next/router";
import {Col, Container, Row} from 'react-bootstrap';

Modal.setAppElement("#__next");

const Form = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        TemplateName: "",
        FormName: "",
        AssignTo: "",
        CreatedBy: "",
        ReviewDate: "",
        CreationDate: "",
        Status: "OPEN",
    });
    const [workerFormData, setWorkerFormData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formOptions, setFormOptions] = useState([]);
    const [assignData, setAssignData] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerFormData = useCallback(async () => {
        const data = await fetchWorkerFormData(WorkerID);
        const formdata = await fetchData(
            "/api/getTemplateCategory",
            window.location.href
        );
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const presentWorker = await fetchData(
            `/api/getWorkerMasterData/${WorkerID}`,
            window.location.href
        );
        setFormOptions(formdata?.data);
        setAssignData(formdata2.data);
        // setFormData((prev) => ({
        //    ...prev,
        //    CreatedBy: presentWorker.data[0].FirstName,
        // }));
        setWorkerFormData(data);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerFormData();
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerFormData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Form added successfully");
                clearForm();
                fetchAndSetWorkerFormData();
            } else {
                setOutput("Failed to add worker form");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker form");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            TemplateName: "",
            FormName: "",
            AssignTo: "",
            CreatedBy: formData.CreatedBy,
            ReviewDate: "",
            CreationDate: "",
            Status: "Open",
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
            <UpdateForm
                workerFormData={workerFormData}
                setWorkerFormData={setWorkerFormData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />
            <p style={{color: "red"}}>
                this is comment when template are created then add edit and fill field
                with pdf of document field also..
            </p>
            <Modal
                isOpen={showForm}
                contentLabel="Add Worker Form"
                style={{
                    content: {
                        maxWidth: "500px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                        marginTop: '10vh',
                        borderRadius: '15px'
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
            >
                <ModalHeader
                    title="Add Worker Form"
                    onCloseButtonClick={handleModalCancel}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmitForm}>
                    <Container>
                        <Row>
                            <Col md={12}>
                                <InputField
                                    id="TemplateName"
                                    label="Template Name:"
                                    value={formData.TemplateName}
                                    type={"select"}
                                    onChange={handleInputChange}
                                    options={formOptions.map((form) => ({
                                        value: form.TemplateCategory,
                                        label: form.TemplateCategory,
                                    }))}
                                />
                            </Col>
                            <Col md={12} className="mt-3">
                                <InputField
                                    id="FormName"
                                    label="Form Name:"
                                    value={formData.FormName}
                                    type="text"
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col md={12} className="mt-3">
                                <InputField
                                    id="AssignTo"
                                    label="Assign To:"
                                    value={formData.AssignTo}
                                    type={"select"}
                                    onChange={handleInputChange}
                                    options={assignData.map((form) => ({
                                        value: form.FirstName,
                                        label: form.FirstName,
                                    }))}
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <InputField
                                    id="ReviewDate"
                                    label="Review Date:"
                                    value={formData.ReviewDate}
                                    type="date"
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <InputField
                                    id="CreationDate"
                                    label="Creation Date:"
                                    value={formData.CreationDate}
                                    type="date"
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mb-3">
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

export default Form;
