import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateAssets, {
    fetchLocProfAssetsData,
} from "@/components/forms/maintenance/location_profile/form/assets/UpdateAssets";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Assets = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Category: "",
        Item: "",
        Notes: "",
        Qty: "",
        ProvidedDate: "",
        ExpiryDate: "",
        ReturnedDate: "",
        SpecialNotes: "",
    });

    const [clientNotesData, setClientNotesData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, setNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const userId = getCookieValue("User_ID");
    /*  console.log("User_ID", userId); */

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientNotesData = useCallback(async () => {
        const data = await fetchLocProfAssetsData(UpdateID);
        setClientNotesData(data);
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

            const specificRead = WriteData.filter(
                (role) => role.Menu_ID === "m_location_profile" && role.ReadOnly === 0
            );
            console.log("Maintainence_LocationProfile Condition", specificRead);

            //If length 0 then No wite permission Only Read, thus set disableSection to true else false
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles();
    }, []);

    const handleSubmitNotes = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postLocProfAssetsData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Notes added successfully");
                clearForm();
                fetchAndSetClientNotesData();
                addValidationMessage("Assets added successfully", "success")

            } else {
                setOutput("Failed to add client notes");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Assets data", "error")

            setOutput("An error occurred while adding client notes");
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
            Category: "",
            Item: "",
            Notes: "",
            Qty: "",
            ProvidedDate: "",
            ExpiryDate: "",
            ReturnedDate: "",
            SpecialNotes: "",
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
            label: "Category",
            id: "Category",
            type: "select",
            value: formData.Category,
            onChange: handleInputChange,
            options: [
                {value: "Epipen", label: "Epipen"},
                {value: "FirstAidKit", label: "First Aid Kit"},
                {value: "Ipad/Tablet", label: "Ipad/Tablet"},
                {value: "Laptop", label: "Laptop"},
                {value: "Uniform", label: "Uniform"},
            ],
            disabled: disableSection,
        },
        {
            label: "Item",
            id: "Item",
            type: "text",
            value: formData.Item,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Notes",
            id: "Notes",
            type: "textarea",
            value: formData.Notes,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Qty",
            id: "Qty",
            type: "number",
            value: formData.Qty,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Provided Date",
            id: "ProvidedDate",
            type: "date",
            value: formData.ProvidedDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Expiry Date",
            id: "ExpiryDate",
            type: "date",
            value: formData.ExpiryDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Returned Date",
            id: "ReturnedDate",
            type: "date",
            value: formData.ReturnedDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Special Notes",
            id: "SpecialNotes",
            type: "textarea",
            value: formData.SpecialNotes,
            onChange: handleInputChange,
            disabled: disableSection,
        },
    ];


    return (
        <div style={{padding: "0 1rem", margin: "0", width: "85.5vw"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateAssets
                clientNotesData={clientNotesData}
                setClientNotesData={setClientNotesData}
                setShowForm={setShowForm}
                ClientID={UpdateID}
            />

            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitNotes}
                modalTitle="Add Assets"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />

        </div>
    );
};

export default Assets;
