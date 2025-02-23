import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {fetchData, postData} from '@/utility/api_utility';

const FormFill = () => {
    const router = useRouter();
    const {formInstanceId} = router.query;
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState("");

    console.log("FormFill: Received formInstanceId =", formInstanceId);

    useEffect(() => {
        const fetchForm = async () => {
            if (!formInstanceId) {
                console.warn("No formInstanceId found in query.");
                return;
            }

            console.log(`Fetching form data for formInstanceId: ${formInstanceId}`);
            const response = await fetchData(`/api/getFormInstance/${formInstanceId}`);
            console.log("Response from getFormInstance:", response);

            if (response.success && response.data && response.data.template) {
                console.log("Setting template data:", response.data.template);
                setTemplate(response.data.template);

                // Initialize formData with default values
                const initialFormData = {};
                response.data.template.fields.forEach((field) => {
                    initialFormData[field.Name] = field.Type === "checkbox" ? false : ""; // Handle checkboxes separately
                });
                setFormData(initialFormData);
            } else {
                console.error("Error fetching form data or template is missing:", response.error);
                setSubmissionStatus("Error fetching form data.");
            }
        };

        fetchForm();
    }, [formInstanceId]);

    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value, // Ensure checkbox values are handled correctly
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data for submission
        const responses = Object.keys(formData).map((fieldName) => ({
            FieldName: fieldName,
            Response: formData[fieldName],
        }));

        // Post the form responses
        const response = await postData('/api/submitFormResponse', {
            formInstanceId,
            responses,
        });

        if (response.success) {
            setSubmissionStatus("Form submitted successfully!");
            setFormData({});
        } else {
            setSubmissionStatus("Failed to submit form.");
        }
    };

    if (!template || !template.fields || template.fields.length === 0) {
        return <p>Loading form...</p>;
    }

    return (
        <div>
            <h2>{template.Name}</h2>
            <form onSubmit={handleSubmit}>
                {template.fields.map((field) => (
                    <div key={field.Name}>
                        <label>{field.Label}</label>

                        {/* Handle Select Fields */}
                        {field.Type === 'select' ? (
                            <select
                                name={field.Name}
                                onChange={handleInputChange}
                                required={field.Required}
                                value={formData[field.Name] || ""} // Ensure controlled component
                            >
                                <option value="" disabled>Select {field.Label}</option>
                                {(Array.isArray(field.Options) ? field.Options : JSON.parse(field.Options || "[]")).map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : field.Type === 'checkbox' ? (
                            // Handle Checkbox Fields
                            <input
                                type="checkbox"
                                name={field.Name}
                                checked={formData[field.Name] || false}
                                onChange={handleInputChange}
                            />
                        ) : (
                            // Handle Text, Number, and Date Inputs
                            <input
                                type={field.Type}
                                name={field.Name}
                                value={formData[field.Name] || ""}
                                onChange={handleInputChange}
                                required={field.Required}
                                placeholder={field.Placeholder}
                            />
                        )}
                    </div>
                ))}
                <button type="submit">Submit</button>
                {submissionStatus && <p>{submissionStatus}</p>}
            </form>
        </div>
    );
};

export default FormFill;