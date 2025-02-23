import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateTransport, {
    fetchTransportData,
} from "@/components/forms/maintenance/categories/transport/update_transport";
import EditModal from "@/components/widgets/EditModal";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

Modal.setAppElement("#__next");

function Transport() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [transportCategory, setTransportCategory] = useState("");
    const [form, setForm] = useState({})

    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [transportData, setTransportData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetTransportData = async () => {
            const data = await fetchTransportData();
            setTransportData(data);
        };
        fetchAndSetTransportData();
        return () => {
            mounted = false;
        };
    }, []);

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            TransportCategory: form.TransportCategory,
            makerUser: "John",
            updateUser: null,
            updateTime: null,
        };

        try {
            const response = await postData(
                "/api/insertTransportCategory",
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Transport Category added successfully");
                clearForm();
                setShowForm(false);
                fetchTransportData().then((data) => setTransportData(data));
                addValidationMessage("Transport Category added successfully", "success");
            } else {
                setOutput("Failed to add area");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed to add Transport ", "error")
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setTransportCategory("");
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            id: "TransportCategory",
            label: "Transport Category",
            type: "text",
            value: transportCategory,
            onChange: (event) => setTransportCategory(event.target.value),
        },
    ];

    return (
        <div style={{padding: "0 1rem"}}>
            <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

            <UpdateTransport
                transportData={transportData}
                setTransportData={setTransportData}
                setShowForm={setShowForm}
            />

            <Modal
                style={{
                    content: {
                        maxWidth: "600px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Transport"
            >
                <ModalHeader
                    title="Add Transport"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form onSubmit={handleSubmit}>
                    <InputField
                        type="text"
                        id="TransportCategory"
                        label={"Transport Category:"}
                        value={transportCategory}
                        onChange={(event) => setTransportCategory(event.target.value)}
                    />
                    <br/>
                    <Button
                        type={"submit"}
                        label="Create"
                        backgroundColor={"blue"}
                        disabled={isSubmitting}
                    />
                    <Button
                        type={"button"}
                        label="Clear All"
                        backgroundColor={"yellow"}
                        onClick={clearForm}
                    />

                    <InfoOutput output={output}/>
                </form>
            </Modal>
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add Transport"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Transport;
