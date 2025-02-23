import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateLeaveType, {fetchLeaveTypeData} from "./update_leave_type";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function LeaveType() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        LeaveCode: "",
        LeaveType: "",
    });
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [leavetypeData, setLeaveTypeData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAndSetLeaveTypeData = async () => {
            const data = await fetchLeaveTypeData();
            setLeaveTypeData(data);
        };
        fetchAndSetLeaveTypeData();
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
                "/api/insertLeaveType",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Leave Type added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Leave Type added successfully", "success")

                fetchLeaveTypeData().then((data) => setLeaveTypeData(data));
            } else {
                setOutput("Failed to add Leave Type");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Leave Type data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            LeaveCode: "",
            LeaveType: "",
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
            label: "Leave Code",
            id: "LeaveCode",
            type: "text",
            value: form.LeaveCode,

        },
        {
            label: "Leave Type",
            id: "LeaveType",
            type: "text",
            value: form.LeaveType,

        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateLeaveType
                leavetypeData={leavetypeData}
                setLeaveTypeData={setLeaveTypeData}
                setShowForm={setShowForm}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Leave Type"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default LeaveType;
