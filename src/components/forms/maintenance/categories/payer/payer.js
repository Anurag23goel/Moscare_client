import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import {Container} from "react-bootstrap";
import UpdatePayer, {fetchPayerData} from "./update_payer";

Modal.setAppElement("#__next");

function Payer() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Description: "",
    });

    const [payerData, setPayerData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAndSetPayerData = async () => {
            const data = await fetchPayerData();
            setPayerData(data);
        };
        fetchAndSetPayerData();
    }, []);
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.id]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await postData(
                "/api/insertPayer",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Payer added successfully");
                clearForm();
                setShowForm(false);
                fetchPayerData().then((data) => setPayerData(data));
            } else {
                setOutput("Failed to add Payer");
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
            Code: "",
            Description: "",
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
    return (
        <div style={{padding: "0 1rem"}}>
            <UpdatePayer payerData={payerData} setPayerData={setPayerData}/>
            <Button label={"Add Payer"} onClick={() => setShowForm(true)}>
                Add Payer
            </Button>
            <Modal
                style={{
                    content: {
                        maxWidth: "600px",
                        margin: "0 auto",
                        maxHeight: "60vh",
                        overflow: "auto",
                    },
                    overlay: {
                        zIndex: 1000,
                    },
                }}
                isOpen={showForm}
                contentLabel="Add Payer"
            >
                <ModalHeader
                    title={"Add new Payer"}
                    onCloseButtonClick={handleModalCancel}
                />
                <Container>
                    <form
                        style={{padding: "1rem", transition: "all 0.5s"}}
                        onSubmit={handleSubmit}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "1rem",
                            }}
                        >
                            <InputField
                                label="Code"
                                type="text"
                                id="Code"
                                value={form.Code}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Description"
                                type="text"
                                id="Description"
                                value={form.Description}
                                onChange={handleChange}
                            />
                        </div>
                        <Button
                            type="submit"
                            label="Create"
                            backgroundColor={"blue"}
                            disabled={isSubmitting}
                        />
                        <Button type="button" label="Clear All" onClick={clearForm}/>
                        <InfoOutput output={output}/>
                    </form>
                </Container>
            </Modal>
        </div>
    );
}

export default Payer;
