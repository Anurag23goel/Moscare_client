import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateContact, {fetchClientContactData,} from "@/components/forms/client_update/contact/update_contact";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';

Modal.setAppElement("#__next");

const Contact = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Title: "",
        FullName: "",
        ContactType: "",
        Organisation: "",
        Description: "",
        Address1: "",
        Suburb: "",
        PostCode: "",
        OtherContact: "",
        EmailPersonal: "",
        IsPrimary: false,
        PersonalContact: false,
        Position: "",
        Address2: "",
        State: "",
        Skype: "",
        EmailWork: "",
        Mobile: "",
    });
    const [clientContactData, setClientContactData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);
    const [validationMessages, setValidationMessages] = useState([]);

    const addValidationMessage = useCallback((content, type = 'info') => {
        const id = uuidv4();
        setValidationMessages(prev => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages(prev => prev.filter(msg => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const fetchAndSetClientContactData = useCallback(async () => {
        const data = await fetchClientContactData(ClientID);
        setClientContactData(data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientContactData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Contact', setDisableSection);
        console.log(disableSection);
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertClientContactData/${ClientID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                addValidationMessage("Client Contact added successfully.", "success");
                setOutput("Client Contact added successfully");
                clearForm();
                fetchAndSetClientContactData();
            } else {
                setOutput("Failed to add client form");
            }
        } catch (error) {
            addValidationMessage(`Error adding client contact: ${error.message}`, "error");
            console.error(error);
            setOutput("An error occurred while adding client form");
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleInputChange = (event) => {
    //   const value =
    //     event.target.name === "checkbox"
    //       ? event.target.checked
    //       : event.target.value;

    //   setFormData((prevData) => ({
    //     ...prevData,
    //     [event.target.id]: value,
    //   }));
    // };
    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };


    const clearForm = () => {
        setOutput("");
        setFormData({
            Title: "",
            FullName: "",
            ContactType: "",
            Organisation: "",
            Description: "",
            Address1: "",
            Suburb: "",
            PostCode: "",
            OtherContact: "",
            EmailPersonal: "",
            IsPrimary: false,
            PersonalContact: false,
            Position: "",
            Address2: "",
            State: "",
            Skype: "",
            EmailWork: "",
            Mobile: "",
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
            id: "FullName",
            label: "Full Name:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "Organisation",
            label: "Organisation:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "PersonalContact",
            label: "Personal Contact",
            type: "checkbox",
            disabled: disableSection,
        },
    ];

    return (
        <div style={{width: "100%"}}>
            <ValidationBar
                messages={validationMessages}
                onClose={handleCloseMessage}
            />
            <UpdateContact
                clientContactData={clientContactData}
                setClientContactData={setClientContactData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitForm(e)}
                modalTitle="Add Client Contact"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Contact;
