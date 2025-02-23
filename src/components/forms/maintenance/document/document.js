import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateDocument, {fetchDocumentData} from "@/components/forms/maintenance/document/update_document";

Modal.setAppElement("#__next");

const Document = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        DocName: "",
        Visibility: "",
        Note: "",
        Lock: false,
        Download: "",
        Category: "",
        VisibleCarer: false,
        VisibleClient: false,
    });

    const [documentData, setDocumentData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [docCategories, setDocCategories] = useState([]);

    useEffect(() => {
        const fetchAndSetDocumentData = async () => {
            const data = await fetchDocumentData();
            setDocumentData(data);
        };
        fetchAndSetDocumentData();
    }, []);

    // const {colors, loading} = useContext(ColorContext);

    useEffect(() => {
        let visibility = "";
        if (form.VisibleClient && form.VisibleCarer) {
            visibility = "Client & Worker";
        } else if (form.VisibleCarer) {
            visibility = "Worker";
        } else if (form.VisibleClient) {
            visibility = "Client";
        }
        if (visibility !== form.Visibility) {
            setForm((prev) => ({...prev, Visibility: visibility}));
        }
    }, [form.VisibleClient, form.VisibleCarer]);

    const handleChange = (event) => {
        const {id, type, checked, value} = event.target;
        setForm((prevData) => ({
            ...prevData,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        // get the data form local storage
        const email = sessionStorage.getItem('email');

        const formData = {
            ...form,
            makerUser: email ? email : 'unknown',
            makerDate: new Date().toISOString()
        }

        try {
            const response = await postData(
                "/api/postDocumentData",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Document added successfully");
                clearForm();
                setShowForm(false);
                fetchDocumentData().then((data) => setDocumentData(data));
            } else {
                setOutput("Failed to add document");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            DocName: "",
            Visibility: "",
            Note: "",
            Lock: false,
            Download: "",
            Category: "",
            VisibleCarer: false,
            VisibleClient: false,
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fetchDocumentCategories = async () => {
        const response = await fetchData("/api/getDocumentCategories")
        const categories = response.data;
        return categories;
    }

    useEffect(() => {
        fetchDocumentCategories().then((data) => setDocCategories([{value: '', label: 'NONE'}, ...data]));
    }, [])

    // if (loading) {
    //     return <div>Loading...</div>;
    // }


    return (
        <div>
            <UpdateDocument
                documentData={documentData}
                setDocumentData={setDocumentData}
                setShowForm={setShowForm}
            />
        </div>
    );
};

export default Document;
