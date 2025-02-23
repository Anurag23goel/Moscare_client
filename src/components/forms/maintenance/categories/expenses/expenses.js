import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateExpenses, {fetchExpensesData} from "./update_expenses";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';

Modal.setAppElement("#__next");

function Expenses() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Category: "",
    });

    const [expensesData, setExpensesData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationMessages, setValidationMessages] = useState([]);

    const addValidationMessage = useCallback((content, type = "info") => {
        const id = uuidv4();
        setValidationMessages((prev) => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);


    useEffect(() => {
        let mounted = true;
        const fetchAndSetExpensesData = async () => {
            const data = await fetchExpensesData();
            setExpensesData(data);
        };
        fetchAndSetExpensesData();
        return () => {
            mounted = false;
        };
    }, []);


    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const handleInputChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await postData(
                "/api/insertExpenses",
                form,
                window.location.href
            );
            if (response.success) {
                addValidationMessage("Expenses added successfully", "success");
                clearForm();
                setShowForm(false);
                fetchExpensesData().then((data) => setExpensesData(data));
            } else {
                addValidationMessage("Failed to add expenses", "error");
                setOutput("Failed to add Category");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed to add expenses", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Category: "",
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
            type: "text",
            id: "Category",
            label: "Category",
            value: form.Category,
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar
                messages={validationMessages}
                onClose={handleCloseMessage}
            />
            <UpdateExpenses
                expensesData={expensesData}
                setExpensesData={setExpensesData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add new Expenses"
                fields={fields}
                data={form}
                onChange={handleInputChange}
            />
        </div>
    );
}

export default Expenses;
