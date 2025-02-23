import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateRole, {fetchRoleData} from "./update_role";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Role() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Role: "",
    });

    const [roleData, setRoleData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetRoleData = async () => {
            const data = await fetchRoleData();
            setRoleData(data);
        };
        fetchAndSetRoleData();
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
            form.MakerUser = sessionStorage.getItem("email");
            form.UpdateUser = sessionStorage.getItem("email");
            form.MakerDate = new Date();
            form.UpdateTime = new Date();
            const response = await postData(
                "/api/insertWorkerRole",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Role added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Role added successfully", "success")

                fetchRoleData().then((data) => setRoleData(data));
            } else {
                setOutput(`Failed to add Role: ${response.error}`);
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Role data", "error")

            setOutput("Failed to add Role")
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Role: "",
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            id: "Role",
            label: "Role",
            type: "text",
            value: form.Role,
            onChange: handleChange,
            disabled: false, // Assuming it is editable, change this if you need it to be disabled
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateRole roleData={roleData} setRoleData={setRoleData} setShowForm={setShowForm}/>

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Role"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Role;
