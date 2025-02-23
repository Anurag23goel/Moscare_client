import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateRooms, {
    fetchLocProfRoomsData,
} from "@/components/forms/maintenance/location_profile/form/rooms/UpdateRooms";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

const Rooms = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Description: "",
        Size: "",
        Capacity: "",
    });

    const [clientDocumentData, setClientDocumentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);
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

    const fetchAndSetClientDocumentData = useCallback(async () => {
        const data = await fetchLocProfRoomsData(UpdateID);
        /*     const documentOptions = await fetchData(
          "/api/getDocumentCategories",
          window.location.href
        );
        setDocumentOptions(documentOptions.data); */
        setClientDocumentData(data);
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
        fetchAndSetClientDocumentData();
        fetchUserRoles();
    }, []);

    const handleSubmitDocument = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/postLocProfRoomData/${UpdateID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Document added successfully");
                clearForm();
                fetchAndSetClientDocumentData();
                addValidationMessage("Rooms added successfully", "success")

            } else {
                setOutput("Failed to add client document");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client document");
            addValidationMessage("Failed To add Rooms data", "error")

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
            Description: "",
            Size: "",
            Capacity: "",
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
            label: "Description",
            id: "Description",
            type: "text",

        },
        {
            label: "Size",
            id: "Size",
            type: "number",

        },
        {
            label: "Capacity",
            id: "Capacity",
            type: "number",
        },
    ];

    return (
        <div style={{padding: " 0 1rem", width: "100%"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateRooms
                clientDocumentData={clientDocumentData}
                setClientDocumentData={setClientDocumentData}
                setShowForm={setShowForm}
                ClientID={UpdateID}
            />
            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmitDocument}
                modalTitle="Add Client Rooms"
                fields={fields}
                data={formData}
                onChange={handleInputChange}
            />

        </div>
    );
};

export default Rooms;
