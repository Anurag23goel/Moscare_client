import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateVehicle, {fetchVehicleData} from "@/pages/maintenance/vehicle/update_vehicle";
import EditModal from "@/components/widgets/EditModal";
// import UpdateVehicle, { fetchVehicleData } from "../../../../pages/maintenance/vehicle/update_vehicle";

Modal.setAppElement("#__next");

function Vehicle() {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Make: "",
        Model: "",
        Year: "",
        Capacity: "",
        Registration: "",
    });

    const [vehicleData, setVehicleData] = useState([]);

    useEffect(() => {
        const fetchAndSetVehicleData = async () => {
            const data = await fetchVehicleData();
            setVehicleData(data);
        };
        fetchAndSetVehicleData();
    }, []);


    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await postData(
                "/api/insertVehicle",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Vehicle added successfully");
                clearForm();
                setShowForm(false);
                fetchVehicleData().then((data) => setVehicleData(data));
            } else {
                setOutput("Failed to add vehicle.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Make: "",
            Model: "",
            Year: "",
            Capacity: "",
            Registration: "",
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
            label: "Make",
            type: "text",
            id: "Make",
            value: form.Make,
            onChange: handleChange,
        },
        {
            label: "Model",
            type: "text",
            id: "Model",
            value: form.Model,
            onChange: handleChange,
        },
        {
            label: "Year",
            type: "text",
            id: "Year",
            value: form.Year,
            onChange: handleChange,
        },
        {
            label: "Capacity",
            type: "text",
            id: "Capacity",
            value: form.Capacity,
            onChange: handleChange,
        },
        {
            label: "Registration",
            type: "text",
            id: "Registration",
            value: form.Registration,
            onChange: handleChange,
        },
    ];


    return (
        <div>
            <UpdateVehicle
                vehicleData={vehicleData}
                setVehicleData={setVehicleData}
                setShowForm={setShowForm}
            />


            <EditModal
                show={showForm}
                onClose={handleModalCancel}
                onSave={handleSubmit}
                modalTitle="Add Vehicle"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
}

export default Vehicle;
