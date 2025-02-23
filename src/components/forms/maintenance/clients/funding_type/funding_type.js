import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateFundingType, {
    fetchFundingTypeData,
} from "@/components/forms/maintenance/clients/funding_type/update_funding_type";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function FundingType() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [fundingType, setFundingType] = useState("");
    const [form, setForm] = useState({})
    const [fundingTypeData, setFundingTypeData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetFundingTypeData = async () => {
            const data = await fetchFundingTypeData();
            setFundingTypeData(data);
        };
        fetchAndSetFundingTypeData();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            Type: form.fundingtype,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertFundingType",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Funding-Type added successfully");
                clearForm();
                setShowForm(false);
                addValidationMessage("Funding-Type added successfully", "success")

                fetchFundingTypeData().then((data) => setFundingTypeData(data));
            } else {
                setOutput("Failed to add Funding-Type");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Funding-Type data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setFundingType("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            label: "FundingType",
            id: "fundingtype",
            type: "text",
            value: fundingType,
            onChange: (event) => setFundingType(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateFundingType
                fundingTypeData={fundingTypeData}
                setFundingTypeData={setFundingTypeData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Funding Type"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default FundingType;
