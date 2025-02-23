import React, {useCallback, useEffect, useState} from "react";
import {Button, Modal} from 'react-bootstrap';
import InputField from "@/components/widgets/InputField";
// import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateChecklist, {fetchClientChecklistData,} from "@/components/forms/client_update/checklist/update_checklist";
import {useRouter} from "next/router";
import {Box} from "@mui/material";


const Checklist = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");

    const [formData, setFormData] = useState({
        ChecklistName: "",
        ItemName: [],
    });
    const [clientChecklistData, setClientChecklistData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [disableSection, setDisableSection] = useState(false);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientChecklistData = useCallback(async () => {
        const data = await fetchClientChecklistData(ClientID);
        setClientChecklistData(data);
    }, [ClientID]);


    useEffect(() => {
        fetchAndSetClientChecklistData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Checklist', setDisableSection);
    }, [fetchAndSetClientChecklistData]);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await postData(
                `/api/insertClientChecklistData/${ClientID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Checklist added successfully");
                clearForm();
                fetchAndSetClientChecklistData();

            } else {
                setOutput("Failed to add client checklist");
            }
        } catch (error) {
            console.error(error);

            setOutput("An error occurred while adding client checklist");
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleInputChange = ({id,value}) => {
    //   setFormData((prevState) => ({ ...prevState, [id]: value }));
    // };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setFormData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };


    const handleItemNameChange = (index, value) => {
        setFormData((prevData) => {
            const updatedItemName = [...prevData.ItemName];
            updatedItemName[index] = value;
            return {...prevData, ItemName: updatedItemName};
        });
    };

    const handleAddItemName = () => {
        setFormData((prevData) => ({
            ...prevData,
            ItemName: [...prevData.ItemName, ""],
        }));
    };

    const handleRemoveItemName = (index) => {
        setFormData((prevData) => {
            const updatedItemName = prevData.ItemName.filter((_, i) => i !== index);
            return {...prevData, ItemName: updatedItemName};
        });
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            ChecklistName: "",
            ItemName: [],
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        {
            id: "ChecklistName",
            label: "Checklist Name:",
            value: formData.ChecklistName,
            type: "text",
            onChange: handleInputChange,
            disabled: disableSection,
        },
    ];

    useEffect(() => {
        console.log("formData", formData)
    }, [formData])

    return (
        <div style={{width: "100%"}}>
            <UpdateChecklist
                clientChecklistData={clientChecklistData}
                setClientChecklistData={setClientChecklistData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />
            <Modal
                show={showForm} onHide={handleModalCancel} centered style={{backgroundColor: "rgba(255,255,255,0.75)"}}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Client CheckList</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <form onSubmit={handleSubmitForm}>
                        <InputField
                            id="ChecklistName"
                            label="Checklist Name:"
                            value={formData.ChecklistName}
                            type="text"
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                        {formData.ItemName.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "0.5rem",
                                    marginTop: "1rem",
                                }}
                            >
                                <InputField
                                    id={`ItemName-${index}`}
                                    label={`Item Name ${index + 1}:`}
                                    value={item}
                                    type="text"
                                    onChange={(e) => handleItemNameChange(index, e.target.value)}
                                    disabled={disableSection}
                                />
                                <Button
                                    type="button"
                                    label="Remove"
                                    style={{
                                        backgroundColor: "red",
                                        border: "none",
                                        borderRadius: "25px",
                                        width: "150px",
                                        padding: "5px 4px",
                                        marginLeft: "1rem"
                                    }}
                                    onClick={() => handleRemoveItemName(index)}
                                    disabled={disableSection}
                                >Remove</Button>
                            </div>
                        ))}

                        <Box className="mt-4" sx={{display: "flex", justifyContent: "end", gap: "15px"}}>
                            <Button
                                type="button"
                                label="Add Item"
                                style={{
                                    backgroundColor: 'darkgray',
                                    border: "none",
                                    borderRadius: "25px",
                                    padding: "8px 16px",
                                    fontSize: "12px",
                                    width: "115px"
                                }}
                                onClick={handleAddItemName}
                                disabled={disableSection}
                            >Add Item</Button>
                            <Button
                                type="submit"
                                label="Create"
                                style={{
                                    backgroundColor: "blue",
                                    border: "none",
                                    borderRadius: "25px",
                                    padding: "8px 16px",
                                    fontSize: "12px",
                                    width: "115px"
                                }}
                                disabled={disableSection}
                            >Create</Button>
                            <Button
                                type="button"
                                label="Clear All"
                                style={{
                                    backgroundColor: "red",
                                    border: "none",
                                    borderRadius: "25px",
                                    padding: "8px 16px",
                                    fontSize: "12px",
                                    width: "115px"
                                }}
                                onClick={clearForm}
                                disabled={disableSection}
                            >Clear All</Button>

                        </Box>
                        <InfoOutput output={output}/>
                    </form>
                </Modal.Body>

            </Modal>
        </div>
    );
};

export default Checklist;
