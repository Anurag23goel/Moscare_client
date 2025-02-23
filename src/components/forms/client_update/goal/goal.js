import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateGoal, {fetchClientGoalData,} from "@/components/forms/client_update/goal/update_goal";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Goal = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Goal: "",
        Service: "",
        Outcome: "",
        StartDate: "",
        EndDate: "",
        GoalAchieved: "",
        Budget: "",
    });

    const [clientGoalData, setClientGoalData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [service, setService] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientGoalData = useCallback(async () => {
        const data = await fetchClientGoalData(ClientID);
        setClientGoalData(data);
        const servicedata = await fetchData(
            "/api/getServiceCategory",
            window.location.href
        );
        setService(servicedata.data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientGoalData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Goal', setDisableSection);
    }, []);

    const handleSubmitGoal = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertClientGoalData/${ClientID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Goal added successfully");
                clearForm();
                fetchAndSetClientGoalData();
            } else {
                setOutput("Failed to add client goal");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client goal");
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
            Goal: "",
            Service: "",
            Outcome: "",
            StartDate: "",
            EndDate: "",
            GoalAchieved: "",
            Budget: "",
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
            id: "Goal",
            label: "Goal:",
            type: "text",
            value: formData.Goal,
            onChange: handleInputChange,
            disabled: disableSection,
            className: "mb-3",
        },
        {
            id: "Service",
            label: "Service:",
            type: "select",
            value: formData.Service,
            onChange: handleInputChange,
            disabled: disableSection,
            options: service.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            className: "mb-3",
        },
        {
            id: "Outcome",
            label: "Outcome:",
            type: "text",
            value: formData.Outcome,
            onChange: handleInputChange,
            disabled: disableSection,
            className: "mt-3 mb-3",
        },
        {
            id: "StartDate",
            label: "Start Date:",
            type: "date",
            value: formData.StartDate,
            onChange: handleInputChange,
            disabled: disableSection,
            className: "mb-3",
        },
        {
            id: "EndDate",
            label: "End Date:",
            type: "date",
            value: formData.EndDate,
            onChange: handleInputChange,
            disabled: disableSection,
            className: "mb-3",
        },
        {
            id: "GoalAchieved",
            label: `Goal Achieved: ${formData.GoalAchieved}%`,
            type: "range",
            value: formData.GoalAchieved,
            onChange: handleInputChange,
            disabled: disableSection,
            min: "0",
            max: "100",
            className: "mb-3",
        },
        {
            id: "Budget",
            label: "Budget $:",
            type: "number",
            value: formData.Budget,
            onChange: handleInputChange,
            disabled: disableSection,
        },
    ];


    return (
        <div style={{width: "100%"}}>
            <UpdateGoal
                clientGoalData={clientGoalData}
                setClientGoalData={setClientGoalData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitGoal(e)}
                modalTitle="Add Goal"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Goal;
