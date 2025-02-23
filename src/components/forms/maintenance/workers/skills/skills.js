import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateSkills, {fetchSkillsData} from "./update_skills";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Skills() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Description: "",
    });
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [skillsData, setSkillsData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAndSetSkillsData = async () => {
            const data = await fetchSkillsData();
            setSkillsData(data);
        };
        fetchAndSetSkillsData();
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
                "/api/insertSkills",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Skills added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Skills added successfully", "success")

                fetchSkillsData().then((data) => setSkillsData(data));
            } else {
                setOutput("Failed to add Skills");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Skills data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Code: "",
            Description: "",
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
            id: "Code",
            label: "Code",
            type: "text",
            value: form.Code,
            onChange: handleChange,
        },
        {
            id: "Description",
            label: "Description",
            type: "text",
            value: form.Description,
            onChange: handleChange,
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateSkills
                skillsData={skillsData}
                setSkillsData={setSkillsData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Skills"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Skills;
