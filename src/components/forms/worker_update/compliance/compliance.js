import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateCompliance, {
    fetchWorkerComplianceData
} from "@/components/forms/worker_update/compliance/update_compliance";
import {useRouter} from "next/router";
import {Col, Container, Row} from "react-bootstrap";

Modal.setAppElement("#__next");

const Compliance = () => {
    const router = useRouter();
    const {WorkerID} = router.query;  // Fetch WorkerID from URL dynamically
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Compliance: "",
    });
    const [workerComplianceData, setWorkerComplianceData] = useState({
        data: [],
    });
    const [workerComplianceShow, setWorkerComplianceShow] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);

    // Fetch and set compliance data for the worker and display available compliance options
    const fetchAndSetWorkerComplianceData = useCallback(async () => {
        if (WorkerID) { // Ensure WorkerID is available
            const data = await fetchWorkerComplianceData(WorkerID);
            setWorkerComplianceData(data);
            const workerComplianceShow = await fetchData(
                `/api/getWorkerComplianceDataByWorkerId/${WorkerID}`,
                window.location.href
            );
            setWorkerComplianceShow(workerComplianceShow.data);
        }
    }, [WorkerID]);

    // Fetch user roles to determine access permissions
    useEffect(() => {
        if (WorkerID) {
            fetchAndSetWorkerComplianceData();
            fetchUserRoles("m_wprofile", "Worker_Profile_Compliance", setDisableSection);
        }
    }, [WorkerID]);

    // Handle form submission
    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerComplianceByID/${WorkerID}`, // Use WorkerID from URL
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Compliance added successfully");
                clearForm();
                fetchAndSetWorkerComplianceData();
            } else {
                setOutput("Failed to add worker Compliance");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker Compliance");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle input change for form fields
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

    // Clear form and reset states
    const clearForm = () => {
        setOutput("");
        setFormData({
            Compliance: "",
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
        <div style={{width: "100%"}}>
            {/* Render UpdateCompliance component */}
            <UpdateCompliance
                workerComplianceData={workerComplianceData}
                setWorkerComplianceData={setWorkerComplianceData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}  // Pass WorkerID dynamically
            />
            <Modal
                isOpen={showForm}
                contentLabel="Add Single Compliance"
                style={{
                    content: {
                        maxWidth: "500px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                        marginTop: "7vh",
                        borderRadius: "15px",
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
            >
                <ModalHeader
                    title="Add Single Compliance"
                    onCloseButtonClick={handleModalCancel}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmitForm}
                >
                    <Container>
                        <Row className="mt-4">
                            <Col md={12} className="mt-3 mb-3">
                                <InputField
                                    id="Compliance" // Ensure this matches the formData key
                                    label="Compliance:"
                                    value={formData.Compliance} // Ensure this matches the formData key
                                    type="select"
                                    onChange={handleInputChange}
                                    options={workerComplianceShow.map((comp) => ({
                                        value: comp.Description,
                                        label: comp.Description,
                                    }))}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-5">
                            <Col className="d-flex justify-content-between">
                                <Button
                                    type="submit"
                                    label="Create"
                                    backgroundColor={"blue"}
                                    disabled={isSubmitting || disableSection}
                                />
                                <Button
                                    type="button"
                                    label="Clear All"
                                    backgroundColor={"yellow"}
                                    onClick={clearForm}
                                    disabled={disableSection}
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

export default Compliance;
