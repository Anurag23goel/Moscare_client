import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import NotesPayer, {fetchPayerNotesData,} from "@/components/forms/maintenance/payer/form/notes/notes_payer";
import {Checkbox} from "@mui/material";
import {useRouter} from "next/router";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";

Modal.setAppElement("#__next");

const notes = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        CreatedOn: "",
        Priority: "",
        Category: "",
        Note: "",
        NoteDate: "",
        RemindDate: "",
        ClosedDate: "",
        CreatedBy: "",
        Comment: "",
        AssignedTo: "",
        Complete: false,
        EditNote: false
    });

    const [payerNotesData, setPayerNotesData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, setNotesCategory] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetPayerNotesData = useCallback(async () => {
        const data = await fetchPayerNotesData(UpdateID);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        /*  const presentWorker = await fetchData(
           `/api/getPayerNotesDataByID/${UpdateID}`,
           window.location.href
         );
         if (presentWorker.data && presentWorker.data.length > 0) {
           setFormData((prev) => ({
             ...prev,
             CreatedBy: presentWorker.data[0].FirstName, // This line was causing the error
           }));
         } else {
           console.error("presentWorker.data is undefined or empty");
           // Handle the case where presentWorker.data is undefined or empty
         }
         const notesOptions = await fetchData(
           "/api/getNoteCategories",
           window.location.href
         );
         setNotesCategory(notesOptions.data); */
        setAssignData(formdata2.data);
        setPayerNotesData(data);
    }, [UpdateID]);

    useEffect(() => {
        fetchAndSetPayerNotesData();
    }, []);

    const handleSubmitNotes = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postPayerNotesData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Payer Notes added successfully");
                clearForm();
                await fetchAndSetPayerNotesData();
            } else {
                setOutput("Failed to add Payer notes");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding payer notes");
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
            CreatedOn: "",
            Priority: "",
            Category: "",
            Note: "",
            NoteDate: "",
            RemindDate: "",
            ClosedDate: "",
            CreatedBy: "",
            Comment: "",
            AssignedTo: "",
            Complete: false,
            EditNote: false
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
            <Container className={styles.MainContainer}>
                <NotesPayer
                    payerNotesData={payerNotesData}
                    setPayerNotesData={setPayerNotesData}
                    setShowForm={setShowForm}
                    UpdateID={UpdateID}
                />
                <Modal
                    isOpen={showForm}
                    contentLabel="Add Worker Notes"
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
                >
                    <ModalHeader
                        title="Add Worker Notes"
                        onCloseButtonClick={handleModalCancel}
                    />
                    <br/>
                    <form onSubmit={handleSubmitNotes}>
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
                        <InputField
                            id="Note"
                            label="Note:"
                            value={formData.Note}
                            type="textarea"
                            onChange={handleInputChange}
                        />
                        <Checkbox
                            id="EditNote"
                            checked={formData.EditNote}
                            onChange={handleInputChange}
                            name="checkbox"
                        />
                        Edit Note
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
                        <InputField
                            id="RemindOn"
                            label="Remind On:"
                            value={formData.RemindOn}
                            type="date"
                            onChange={handleInputChange}
                        />
                        <Checkbox
                            id="Complete"
                            checked={formData.Complete}
                            onChange={handleInputChange}
                            name="checkbox"
                        />
                        Mark note as Completed
                        <br/>
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
                        <InfoOutput output={output}/>
                    </form>
                </Modal>
            </Container>
        </div>
    );
};

export default notes;
