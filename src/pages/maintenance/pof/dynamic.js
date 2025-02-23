import {useState} from 'react';

const initialFields = [
    {id: 1, name: 'field1', label: 'Field 1', count: 0},
    {id: 2, name: 'field2', label: 'Field 2', count: 0},
    {id: 3, name: 'field3', label: 'Field 3', count: 0},
    {id: 4, name: 'field4', label: 'Field 4', count: 0},
    {id: 5, name: 'field5', label: 'Field 5', count: 0},
    {id: 6, name: 'field6', label: 'Field 6', count: 0},
    {id: 7, name: 'field7', label: 'Field 7', count: 0},
    {id: 8, name: 'field8', label: 'Field 8', count: 0},
    {id: 9, name: 'field9', label: 'Field 9', count: 0},
    {id: 10, name: 'field10', label: 'Field 10', count: 0},
];

const DynamicForm = () => {
    const [fields, setFields] = useState(initialFields);

    const handleSubmit = (event) => {
        event.preventDefault();

        // Update counts for the fields based on input data
        const updatedFields = fields.map(field => {
            const newValue = document.getElementById(field.name).value;
            const increment = newValue.trim() !== '' ? 1 : 0;
            return {...field, count: field.count + increment};
        });

        // Check if any field has reached a count of 3 or more
        const shouldReorder = updatedFields.some(field => field.count >= 3);

        // Sort fields only if any field has reached the threshold
        if (shouldReorder) {
            const sortedFields = [...updatedFields].sort((a, b) => {
                if (a.count >= 3 && b.count < 3) return -1;
                if (b.count >= 3 && a.count < 3) return 1;
                return b.count - a.count; // Secondary sort by count if both are >=3 or <3
            });
            setFields(sortedFields);
        } else {
            setFields(updatedFields);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
                <div key={field.id}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <input type="text" id={field.name} name={field.name}/>
                </div>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
};

export default DynamicForm;