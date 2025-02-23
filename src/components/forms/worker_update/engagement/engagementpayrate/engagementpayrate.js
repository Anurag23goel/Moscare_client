import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateEngagementPayrate, {
    fetchWorkerEngagementPayrateData,
} from "@/components/forms/worker_update/engagement/engagementpayrate/update_engagementpayrate";
import {useRouter} from "next/router";
import {Col, Row} from "react-bootstrap";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const EngagementPayrate = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Service: "",
        PayRate: "",
    });

    const [workerEngagementPayrateData, setWorkerEngagementPayrateData] =
        useState({
            data: [],
        });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [service, setService] = useState(null);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerEngagementPayrateData = useCallback(async () => {
        const data = await fetchWorkerEngagementPayrateData(WorkerID);
        setWorkerEngagementPayrateData(data);
        const serviceData = await fetchData(
            "/api/getServicesData",
            window.location.href
        );
        setService(serviceData);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerEngagementPayrateData();
    }, []);

    const handleSubmitEngagementPayrate = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerEngagementPayrateData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker EngagementPayrate added successfully");
                clearForm();
                fetchAndSetWorkerEngagementPayrateData();
            } else {
                setOutput("Failed to add worker engagementPayrate");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker engagementPayrate");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };
    const clearForm = () => {
        setOutput("");
        setFormData({
            Service: "",
            PayrateCode: "",
            PayrateSector: "",
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

    const fields = [
        {
            id: "Service",
            label: "Service:",
            value: formData.Service,
            type: "select",
            className: "mb-3",
            options: service?.data.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            onChange: handleInputChange,
        },
        {
            id: "PayRate",
            label: "Payrate Level:",
            value: formData.PayRate,
            type: "select",
            onChange: handleInputChange,
        },
    ];

    return (
        <div style={{paddingTop: "1rem", width: "85%",}}>
            <UpdateEngagementPayrate
                workerEngagementPayrateData={workerEngagementPayrateData}
                setWorkerEngagementPayrateData={setWorkerEngagementPayrateData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />
            <Modal
                isOpen={showForm}
                contentLabel="Add Worker Engagement Payrate"
                style={{
                    content: {
                        maxWidth: "600px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                        marginTop: "10vh",
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
            >
                <ModalHeader
                    title="Add Worker Engagement Payrate"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form onSubmit={handleSubmitEngagementPayrate}>
                    <Row>
                        <Col md={6}>
                            <InputField
                                id="Service"
                                label="Service:"
                                value={formData.Service}
                                type="select"
                                className="mb-3"
                                onChange={handleInputChange}
                                options={service?.data.map((form) => ({
                                    value: form.Description,
                                    label: form.Description,
                                }))}
                            />
                        </Col>
                        <Col md={6}>
                            <InputField
                                id="PayRate"
                                label="Payrate Level:"
                                value={formData.PayRate}
                                type="select"
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Row>
                    <br/>
                    <Row className="mt-1 mb-2">
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
                </form>
            </Modal>

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitEngagementPayrate(e)}
                modalTitle="Add Engagement Payrate"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />

        </div>
    );
};

export default EngagementPayrate;
