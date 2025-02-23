import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateWorkerStatus, {
    fetchWorkerStatusData,
} from "@/components/forms/maintenance/workers/worker_status/update_worker_status";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function WorkerStatus() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [status, setStatus] = useState("");
    const [form, setForm] = useState({});
    // const {colors, loading} = useContext(ColorContext);

    const [workerStatusData, setWorkerStatusData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetStatusData = async () => {
            const data = await fetchWorkerStatusData();
            setWorkerStatusData(data);
        };
        fetchAndSetStatusData();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            Status: form.Status,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertWorkerStatus",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Status added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Worker Status added successfully", "success")

                fetchWorkerStatusData().then((data) => setWorkerStatusData(data));
            } else {
                setOutput("Failed to add Worker Status");
            }
        } catch (error) {
            addValidationMessage("Failed To add Worker Status data", "error")

            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setStatus("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            id: "Status",
            label: "Status:",
            type: "text",
            value: status,
            onChange: (event) => setStatus(event.target.value),
        }
    ];


    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateWorkerStatus
                workerStatusData={workerStatusData}
                setWorkerStatusData={setWorkerStatusData}
                setShowForm={setShowForm}
            />

            <Modal
                style={{
                    content: {
                        maxWidth: "600px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Status"
            >
                <ModalHeader
                    title="Add Status"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form onSubmit={handleSubmit}>
                    <InputField
                        type="text"
                        id="Status"
                        label={"Status:"}
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    />
                    <br/>
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

                    <InfoOutput output={output}/>
                </form>
            </Modal>
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Status"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default WorkerStatus;
