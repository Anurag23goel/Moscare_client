import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateContact, {fetchContactData,} from "@/components/forms/maintenance/contact/update_contact";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

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
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

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

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
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
                addValidationMessage("Contact added successfully", "success")

            } else {
                setOutput("Failed to add contact");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Contact data", "error")

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

    const fields = [
        {
            label: "First Name",
            type: "text",
            id: "FirstName",
            value: form.FirstName,
            onChange: handleChange,
        },
        {
            label: "Last Name",
            type: "text",
            id: "LastName",
            value: form.LastName,
            onChange: handleChange,
        },
        {
            label: "Organisation",
            type: "text",
            id: "Organisation",
            value: form.Organisation,
            onChange: handleChange,
        },
    ];


    return (
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateContact
                contactData={contactData}
                setContactData={setContactData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "1rem", zIndex: "5"}}>
            </div>
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Contact Details"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
};

export default Contact;