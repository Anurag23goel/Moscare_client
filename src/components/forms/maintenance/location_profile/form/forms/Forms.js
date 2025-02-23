import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateForms, {
    fetchClientFormsData,
} from "@/components/forms/maintenance/location_profile/form/forms/UpdateForms";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Forms = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    console.log("ClientID", UpdateID);
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        TemplateName: "",
        FormName: "",
        AssignTo: "",
        ReviewDate: "",
        CreationDate: "",
        Status: "OPEN",
    });
    const [clientFormData, setClientFormData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formOptions, setFormOptions] = useState([]);
    const [assignData, setAssignData] = useState([]);
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

    const fetchAndSetClientFormData = useCallback(async () => {
        try {
            const [
                data,
                formdata,
                formdata2,
                presentClient
            ] = await Promise.all([
                fetchClientFormsData(UpdateID),
                fetchData("/api/getTemplateCategory", window.location.href),
                fetchData("/api/getActiveWorkerMasterData", window.location.href),
                //fetchData(`/api/getClientMasterData/${UpdateID}`, window.location.href)
            ]);

            setFormOptions(formdata?.data);
            setAssignData(formdata2.data);
            /* setFormData((prev) => ({
              ...prev,
              CreatedBy: presentClient.data[0].FirstName,
            })); */
            setClientFormData(data);
        } catch (error) {
            console.error("Error fetching client form data in parallel:", error);
            // Add appropriate error handling here if needed
        }
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
        fetchAndSetClientFormData();
        fetchUserRoles();
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postLocProfFormData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Form added successfully");
                clearForm();
                fetchAndSetClientFormData();
                addValidationMessage("Client Form added successfully", "success")

            } else {
                setOutput("Failed to add client form");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Client Form added data", "error")

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
            TemplateName: "",
            FormName: "",
            AssignTo: "",
            /* CreatedBy: formData.CreatedBy, */
            ReviewDate: "",
            CreationDate: "",
            Status: "Open",
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
            label: "Template Name",
            id: "TemplateName",
            type: "select",
            value: formData.TemplateName,
            onChange: handleInputChange,
            disabled: disableSection,
            options: formOptions.map((form) => ({
                value: form.TemplateCategory,
                label: form.TemplateCategory,
            })),
        },
        {
            label: "Form Name",
            id: "FormName",
            type: "text",
            value: formData.FormName,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Assign To",
            id: "AssignTo",
            type: "select",
            value: formData.AssignTo,
            onChange: handleInputChange,
            disabled: disableSection,
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            label: "Creation Date",
            id: "CreationDate",
            type: "date",
            value: formData.CreationDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            label: "Review Date",
            id: "ReviewDate",
            type: "date",
            value: formData.ReviewDate,
            onChange: handleInputChange,
            disabled: disableSection,
        },

    ];

    return (
        <div style={{padding: "0 1rem", width: "100%",}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateForms
                clientFormData={clientFormData}
                setClientFormData={setClientFormData}
                setShowForm={setShowForm}
                ClientID={UpdateID}
            />


            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitForm}
                modalTitle="Add Client Form"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Forms;