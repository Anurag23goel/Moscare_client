import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateNotes, {fetchWorkerNotesData,} from "@/components/forms/operations/lead/form/notes/update_notes";
import {Checkbox} from "@mui/material";
import {useRouter} from "next/router";
import {Col, Container, Row} from 'react-bootstrap';

Modal.setAppElement("#__next");

const Notes = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        NoteType: "",
        Priority: "",
        Category: "",
        Client: "",
        Note: "",
        CreatedOn: "",
        RemindOn: "",
        ClosedDate: "",
        CreatedBy: "",
        AssignedTo: "",
        Completed: false,
        EditNote: false,
    });

    const [workerNotesData, setWorkerNotesData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, setNotesCategory] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerNotesData = useCallback(async () => {
        const data = await fetchWorkerNotesData(WorkerID);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const presentWorker = await fetchData(
            `/api/getWorkerMasterData/${WorkerID}`,
            window.location.href
        );
        // setFormData((prev) => ({
        //    ...prev,
        //    CreatedBy: presentWorker.data[0].FirstName,
        // }));
        const notesOptions = await fetchData(
            "/api/getNoteCategories",
            window.location.href
        );
        setNotesCategory(notesOptions.data)
        setAssignData(formdata2.data);
        setWorkerNotesData(data);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerNotesData();
    }, []);

    const handleSubmitNotes = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerNotesData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Notes added successfully");
                clearForm();
                fetchAndSetWorkerNotesData();
            } else {
                setOutput("Failed to add worker notes");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker notes");
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
            NoteType: "",
            Priority: "",
            Category: "",
            Client: "",
            Note: "",
            CreatedOn: "",
            RemindOn: "",
            ClosedDate: "",
            CreatedBy: "",
            AssignedTo: "",
            Completed: false,
            EditNote: false,
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
            <UpdateNotes
                workerNotesData={workerNotesData}
                setWorkerNotesData={setWorkerNotesData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />
            <Modal
                isOpen={showForm}
                contentLabel="Add Worker Notes"
                style={{
                    content: {
                        maxWidth: "600px", // Set the maximum width of the modal
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
                    title="Add Worker Notes"
                    onCloseButtonClick={handleModalCancel}
                />
                <form
                    style={{padding: "1rem", transition: "all 0.5s"}}
                    onSubmit={handleSubmitNotes}>
                    <Container>
                        <Row>
                            <Col md={6} className="mt-2">
                                <InputField
                                    id="Priority"
                                    label="Priority:"
                                    value={formData.Priority}
                                    type="select"
                                    onChange={handleInputChange}
                                    options={[
                                        {value: "Low", label: "Low"},
                                        {value: "Medium", label: "Medium"},
                                        {value: "High", label: "High"},
                                        {value: "Urgent", label: "Urgent"},
                                    ]}
                                />
                            </Col>
                            <Col md={6} className="mt-2">
                                <InputField
                                    id="Category"
                                    label="Category:"
                                    value={formData.Category}
                                    type={"select"}
                                    onChange={handleInputChange}
                                    options={notesCategory.map((form) => ({
                                        value: form.Description,
                                        label: form.Description,
                                    }))}
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <InputField
                                    id="AssignedTo"
                                    label="Assigned To:"
                                    value={formData.AssignedTo}
                                    type="select"
                                    onChange={handleInputChange}
                                    options={assignData.map((form) => ({
                                        value: form.FirstName,
                                        label: form.FirstName,
                                    }))}
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <InputField
                                    id="RemindOn"
                                    label="Remind On:"
                                    value={formData.RemindOn}
                                    type="date"
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col md={12} className="mt-3">
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
                                    id="EditNote"
                                    checked={formData.EditNote}
                                    onChange={handleInputChange}
                                    name="checkbox"
                                />
                                Edit Note
                            </Col>
                            <Col md={12}>
                                <Checkbox
                                    id="Completed"
                                    checked={formData.Completed}
                                    onChange={handleInputChange}
                                    name="checkbox"
                                />
                                Mark note as Completed
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

export default Notes;
