import React, {useContext, useEffect, useState} from "react";
import ColorContext from "@/contexts/ColorContext";
import {postData} from "@/utility/api_utility";
import UpdateWorkerCompliance, {
    fetchComplianceItemsData
} from "@/components/forms/maintenance/workers/worker_compliance/update_worker_compliance";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

const MaintenaceWorkerCompliance = () => {

    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [description, setDescription] = useState("");
    const [expiryDays, setExpiryDays] = useState("");
    const [warningDays, setWarningDays] = useState("");
    const [mandatory, setMandatory] = useState(false);
    const [noExpiryDate, setNoExpiryDate] = useState(false);
    const [visibleToWorker, setVisibleToWorker] = useState(false);
    const [noStartDate, setNoStartDate] = useState(false);
    // const {colors, loading} = useContext(ColorContext);
    const [complianceItemsData, setComplianceItemsData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({})
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetComplianceItemsData = async () => {
            const data = await fetchComplianceItemsData();
            setComplianceItemsData(data);
        };
        fetchAndSetComplianceItemsData();
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const dataToSend = {
            Description: formData.Description,
            ExpiryDays: formData.ExpiryDays,
            WarningDays: formData.WarningDays,
            Mandatory: formData.Mandatory,
            NoExpiryDate: formData.NoExpiryDate,
            VisibleToWorker: formData.VisibleToWorker,
            NoStartDate: formData.NoStartDate,
            MakerUser: sessionStorage.getItem("email"),
            MakerDate: new Date().toISOString(),
            UpdateUser: null,
            UpdateDate: null,
        };

        try {
            const response = await postData(
                "/api/insertWorkerComplianceData",
                dataToSend,
                window.location.href
            );
            if (response.success) {
                setOutput("Compliance Items added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Worker Compliance added successfully", "success")

                fetchComplianceItemsData().then((data) => setComplianceItemsData(data));
            } else {
                setOutput("Failed to add Worker Compliance");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Worker Compliance data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setDescription("");
        setExpiryDays("");
        setWarningDays("");
        setMandatory(false);
        setNoExpiryDate(false);
        setVisibleToWorker(false);
        setNoStartDate(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            id: "Description",
            label: "Description:",
            type: "text",
            value: description || "",
            onChange: (event) => setDescription(event.target.value),
        },
        {
            id: "ExpiryDays",
            label: "Expiry Days:",
            type: "number",
            value: expiryDays || "",
            onChange: (event) => setExpiryDays(event.target.value),
        },
        {
            id: "WarningDays",
            label: "Warning Days:",
            type: "number",
            value: warningDays || "",
            onChange: (event) => setWarningDays(event.target.value),
        },
        {
            id: "Mandatory",
            label: "Mandatory",
            type: "checkbox",
            checked: mandatory || false,
            onChange: (event) => setMandatory(event.target.checked),
        },
        {
            id: "NoExpiryDate",
            label: "No Expiry Date",
            type: "checkbox",
            checked: noExpiryDate || false,
            onChange: (event) => setNoExpiryDate(event.target.checked),
        },
        {
            id: "NoStartDate",
            label: "No Start Date",
            type: "checkbox",
            checked: noStartDate || false,
            onChange: (event) => setNoStartDate(event.target.checked),
        },
        {
            id: "VisibleToWorker",
            label: "Visible to Worker",
            type: "checkbox",
            checked: visibleToWorker || false,
            onChange: (event) => setVisibleToWorker(event.target.checked),
        },
    ];


    return (
        <div style={{padding: " 0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateWorkerCompliance setShowForm={setShowForm} setComplianceItemsData={setComplianceItemsData}
                                    complianceItemsData={complianceItemsData}/>


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Status"
                fields={fields}
                data={formData}
                onChange={handleChange}
            />
        </div>
    )
}

export default MaintenaceWorkerCompliance;