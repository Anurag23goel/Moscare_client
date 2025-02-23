import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateContacts, {
    fetchClientContactsData,
} from "@/components/forms/maintenance/location_profile/form/contacts/UpdateContact";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Contacts = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
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
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    console.log("User_ID", userId);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientContactData = useCallback(async () => {
        const data = await fetchClientContactsData(UpdateID);
        setClientContactData(data);
    }, [UpdateID]);

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );
            /* console.log(rolesData); */


            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            /* console.log(WriteData); */

            const ReadData = rolesData.filter((role) => role.ReadOnly === 1);
            /* console.log(ReadData); */

            const specificRead = WriteData.filter((role) => role.Menu_ID === 'm_location_profile' && role.ReadOnly === 0);
            console.log('Maintainence_LocationProfile Condition', specificRead);
            //If length 0 then No wite permission Only Read, thus set disableSection to true else false
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }

        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    }

    useEffect(() => {
        fetchAndSetClientContactData();
        fetchUserRoles();
        console.log(disableSection);
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postLocProfContactData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Contact added successfully");
                clearForm();
                fetchAndSetClientContactData();
                addValidationMessage("Contact added successfully", "success")

            } else {
                setOutput("Failed to add client form");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Contact data", "error")

            setOutput("An error occurred while adding client form");
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
            label: "Full Name",
            id: "FullName",
            type: "text",
            value: formData.FullName,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Organisation",
            id: "Organisation",
            type: "text",
            value: formData.Organisation,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Personal Contact",
            id: "PersonalContact",
            type: "checkbox",
            checked: formData.PersonalContact,
            onChange: handleInputChange,
            disabled: disableSection,
        },
    ];

    return (
        <div style={{padding: " 0 1rem", width: "100%"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateContacts
                clientContactData={clientContactData}
                setClientContactData={setClientContactData}
                setShowForm={setShowForm}
                ClientID={UpdateID}
            />

            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitForm}
                modalTitle="Add Client Contact"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />

        </div>

    );
};

export default Contacts;
