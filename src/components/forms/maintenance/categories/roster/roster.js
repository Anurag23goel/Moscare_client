import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateRoster, {fetchRosterData,} from "@/components/forms/maintenance/categories/roster/update_roster";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Roster() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [form, setForm] = useState({})
    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [rosterData, setRosterData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAndSetRosterData = async () => {
            const data = await fetchRosterData();
            setRosterData(data);
        };
        fetchAndSetRosterData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            Code: form.Code,
            Description: form.Description,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertRosterCategory",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Roster Category added successfully");
                clearForm();
                setShowForm(false);
                fetchRosterData().then((data) => setRosterData(data));
                addValidationMessage("Roster Category added successfully", "success");
            } else {
                setOutput("Failed to add area");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("An error Occured While Adding Roster Category", "error")
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    const clearForm = () => {
        setOutput("");
        setCode("");
        setDescription("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            id: "Code",
            label: "Code",
            type: "text",
            value: code,
            onChange: (event) => setCode(event.target.value),
        },
        {
            id: "Description",
            label: "Description",
            type: "text",
            value: description,
            onChange: (event) => setDescription(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateRoster
                rosterData={rosterData}
                setRosterData={setRosterData}
                setShowForm={setShowForm}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Roster"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Roster;
