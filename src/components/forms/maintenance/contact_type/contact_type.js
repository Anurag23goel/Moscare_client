import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateContactType, {
    fetchContactTypeData,
} from "@/components/forms/maintenance/contact_type/update_contact_type";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const ContactType = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        contactType: "",
    });

    const [contactTypeData, setContactTypeData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetContactTypeData = async () => {
            const data = await fetchContactTypeData();
            setContactTypeData(data);
        };
        fetchAndSetContactTypeData();
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
                "/api/postContactTypeData",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Contact Type added successfully");
                clearForm();
                setShowForm(false);
                fetchContactTypeData().then((data) => setContactTypeData(data));
                addValidationMessage("Contact Type added successfully", "success")

            } else {
                setOutput("Failed to add contact type");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Contact Type data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            contactType: ""
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            label: "Contact Type",
            type: "text",
            id: "contactType",
            value: form.contactType,
            onChange: handleChange,
        },
    ];


    return (
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateContactType
                contactTypeData={contactTypeData}
                setContactTypeData={setContactTypeData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "1rem", zIndex: "5"}}>
            </div>
            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Contact Type"
                fields={fields}
                data={form}
                onChange={handleChange}
            />

        </div>
    );
};

export default ContactType;