import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateEquipment, {fetchWorkerEquipmentData,} from "@/components/forms/worker_update/equipment/update_equipment";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Equipment = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Category: "",
        Item: "",
        ItemNotes: "",
        Quantity: "",
        DateProvided: "",
        ExpiryDate: "",
        ReturnedDate: "",
        SpecialNote: "",
    });
    const [workerEquipmentData, setWorkerEquipmentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [equipmentData, setEquipmentData] = useState([]);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerEquipmentData = useCallback(async () => {
        const data = await fetchWorkerEquipmentData(WorkerID);
        const equipmentdata = await fetchData(
            "/api/getEquipment",
            window.location.href
        );
        setEquipmentData(equipmentdata.data);
        setWorkerEquipmentData(data);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerEquipmentData();
    }, []);

    const handleSubmitEquipment = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerEquipmentData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Equipment added successfully");
                clearForm();
                fetchAndSetWorkerEquipmentData();
            } else {
                setOutput("Failed to add worker equipment");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker equipment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = ({id, value}) => {
        // const { id, value } = event.target;
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            Category: "",
            Item: "",
            ItemNotes: "",
            Quantity: "",
            DateProvided: "",
            ExpiryDate: "",
            ReturnedDate: "",
            SpecialNote: "",
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
            id: "Category",
            label: "Category:",
            type: "select",
            options: equipmentData.map((equipment) => ({
                value: equipment.Description,
                label: equipment.Description,
            })),
        },
        {
            id: "Item",
            label: "Item:",
            type: "text",
        },
        {
            id: "ItemNotes",
            label: "Item Notes:",
            type: "text",
        },
        {
            id: "Quantity",
            label: "Quantity:",
            type: "number",
        },
        {
            id: "DateProvided",
            label: "Date Provided:",
            type: "date",
        },
        {
            id: "ExpiryDate",
            label: "Expiry Date:",
            type: "date",
        },
        {
            id: "ReturnedDate",
            label: "Returned Date:",
            type: "date",
        },
        {
            id: "SpecialNote",
            label: "Special Note:",
            type: "textarea",
        },
    ];


    return (
        <div style={{width: "100%"}}>
            <UpdateEquipment
                workerEquipmentData={workerEquipmentData}
                setWorkerEquipmentData={setWorkerEquipmentData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitEquipment(e)}
                modalTitle="Add Worker Equipment"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />

        </div>
    );
};

export default Equipment;
