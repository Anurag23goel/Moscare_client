import React, {useContext, useEffect, useState} from "react";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateServices, {fetchServicesData} from "./update_services";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

const Services = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Service_Code: "",
        Description: "",
        ChargeRate_1: "",
        ChargeRate_2: "",
        ChargeRate_3: "",
        Payrate_1: "",
        Payrate_2: "",
        Payrate_3: "",
    });

    const [servicesData, setServicesData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetServicesData = async () => {
            const data = await fetchServicesData();
            setServicesData(data);
        };
        fetchAndSetServicesData();
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setForm({
            Service_Code: "",
            Description: "",
            ChargeRate_1: "",
            ChargeRate_2: "",
            ChargeRate_3: "",
            Payrate_1: "",
            Payrate_2: "",
            Payrate_3: "",
        })
    }


    // const handleSubmit = async (event) => {
    //   event.preventDefault();
    //   // setIsSubmitting(true);
    //   // setShowForm(false);
    //   const formData = {
    //     Service_Code: form.Service_Code,
    //     Description: form.Description,
    //     ChargeRate_1: form.ChargeRate_1,
    //     ChargeRate_2: form.ChargeRate_2,
    //     ChargeRate_3: form.ChargeRate_3,
    //     Payrate_1: form.Payrate_1,
    //     Payrate_2: form.Payrate_2,
    //     Payrate_3: form.Payrate_3,
    //     makerUser: "John",
    //     updateUser: null,
    //     updateTime: null,
    //   };

    //   try {
    //     const response = await postData(
    //       "/api/insertServices",
    //       formData,
    //       window.location.href
    //     );
    //     console.log("Response " , response)
    //     if (response.success) {
    //       setOutput("Services added successfully");
    //       setForm({ Service_Code: "", Description: "" }); // Clear form fields
    //       // setShowForm(false);
    //       // Refetch services data after insertion
    //       const data = await fetch("/api/getServicesData").then((res) =>
    //         res.json()
    //       );
    //       setServicesData(data);
    //     } else {
    //       setOutput(response.data.error);
    //     }
    //   } catch (error) {
    //     console.error(error);
    //   } finally {
    //     // setIsSubmitting(false);
    //   }
    // };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Prepare the form data
        const formData = {
            Service_Code: form.Service_Code,
            Description: form.Description,
            ChargeRate_1: form.ChargeRate_1,
            ChargeRate_2: form.ChargeRate_2,
            ChargeRate_3: form.ChargeRate_3,
            Payrate_1: form.Payrate_1,
            Payrate_2: form.Payrate_2,
            Payrate_3: form.Payrate_3,
            makerUser: "John", // Static value, change as required
            updateUser: null,
            updateTime: null,
        };

        try {
            // Send POST request to your API
            const response = await postData("/api/insertServices", formData);

            console.log("Response:", response);

            if (response.success) {
                // Notify the user of success
                setOutput("Services added successfully");
                addValidationMessage("Services added successfully", "success");
                // Optionally, hide the form if required
                setShowForm(false);
                clearForm()
                setOutput("")

                // Fetch and update services data to reflect the new entry
                // const updatedData = await fetch("/api/getServicesData").then((res) =>
                //   res.json()
                // );
                // setServicesData(updatedData);
            } else {
                setOutput(response.error || "Failed to add services.");
            }
        } catch (error) {
            // Catch and handle network or other unexpected errors
            console.error("Error:", error);
            setOutput("An unexpected error occurred. Please try again.");
        }
    };


    const handleModalCancel = () => {
        setForm({Service_Code: "", Description: ""}); // Clear form fields
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            label: "Service Code",
            type: "text",
            id: "Service_Code",
            value: form.Service_Code,
            onChange: handleChange,
        },
        {
            label: "Description",
            type: "text",
            id: "Description",
            value: form.Description,
            onChange: handleChange,
        },
        {
            label: "Charge Rate ($)",
            type: "number",
            id: "ChargeRate_1",
            value: form.ChargeRate_1,
            onChange: handleChange,
        },
        {
            label: "Charge Rate 2 ($)",
            type: "number",
            id: "ChargeRate_2",
            value: form.ChargeRate_2,
            onChange: handleChange,
        },
        {
            label: "Charge Rate 3 ($)",
            type: "number",
            id: "ChargeRate_3",
            value: form.ChargeRate_3,
            onChange: handleChange,
        },
        {
            label: "Pay Rate ($)",
            type: "number",
            id: "Payrate_1",
            value: form.Payrate_1,
            onChange: handleChange,
        },
        {
            label: "Pay Rate 2 ($)",
            type: "number",
            id: "Payrate_2",
            value: form.Payrate_2,
            onChange: handleChange,
        },
        {
            label: "Pay Rate 3 ($)",
            type: "number",
            id: "Payrate_3",
            value: form.Payrate_3,
            onChange: handleChange,
        },
    ];

    return (
        <div>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateServices
                addValidationMessage={addValidationMessage}
                servicesData={servicesData}
                setServicesData={setServicesData}
                setShowForm={setShowForm}
            />

            <div style={{padding: "1rem", zIndex: "5"}}>
                <hr/>

            </div>
            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Services"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
};

export default Services;
