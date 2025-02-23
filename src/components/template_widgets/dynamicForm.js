import React, {useState} from 'react';
import {postData} from '@/utility/api_utility';

const DynamicForm = ({jsonConfig, formInstanceId}) => {
    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const responses = Object.keys(formData).map((fieldName) => ({
            FieldName: fieldName,
            Response: formData[fieldName],
        }));

        try {
            const response = await postData('/api/submitFormResponse', {formInstanceId, responses});
            if (response && response.success) {
                console.log('Form submitted successfully');
                // Reset form or show success message
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {jsonConfig.fields.map((field) => (
                <div key={field.Name}>
                    <label>{field.Label}</label>
                    {field.Type === 'select' ? (
                        <select
                            name={field.Name}
                            onChange={handleChange}
                            required={field.Required}
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Select {field.Label}
                            </option>
                            {field.options && field.options.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={field.Type}
                            name={field.Name}
                            placeholder={field.Placeholder}
                            required={field.Required}
                            onChange={handleChange}
                        />
                    )}
                </div>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
};

export default DynamicForm;
