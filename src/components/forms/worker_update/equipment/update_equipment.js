import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";


export const fetchWorkerEquipmentData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerEquipmentData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        // Extract columns dynamically (keys of the first item in data array)
        const columns = Object.keys(data.data[0] || {}).map((key) => ({
            field: key,
            headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),// Capitalize the first letter for the header
        }));

        console.log("Extracted columns:", columns);

        return {...data, columns};

    } catch (error) {
        console.error("Error fetching worker equipment data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateEquipment = ({
                             setWorkerEquipmentData,
                             workerEquipmentData,
                             setShowForm,
                             setShowForm2,
                             WorkerID,
                         }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        Category: "",
        Item: "",
        ItemNotes: "",
        Quantity: "",
        DateProvided: "",
        ExpiryDate: "",
        ReturnedDate: "",
        SpecialNote: "",
    });
    const [equipmentData, setEquipmentData] = useState([]);
    // const {colors} = useContext(ColorContext);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false)


    const fetchAndSetWorkerEquipmentData = async () => {
        const data = await fetchWorkerEquipmentData(WorkerID);
        setWorkerEquipmentData(data);
        setColumns(data.columns)
        const equipmentdata = await fetchData(
            "/api/getEquipment",
            window.location.href
        );
        setEquipmentData(equipmentdata.data);
    };


    useEffect(() => {
        fetchAndSetWorkerEquipmentData();
        fetchUserRoles("m_wprofile", "Worker_Profile_Equipment", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true)
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerEquipmentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerEquipmentData(await fetchWorkerEquipmentData(WorkerID));
        } catch (error) {
            console.error("Error saving data:", error);
        }
        setShowModal(false)
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerEquipmentData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerEquipmentData(await fetchWorkerEquipmentData(WorkerID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            WorkerID: WorkerID,
            Category: "",
            Item: "",
            ItemNotes: "",
            Quantity: "",
            DateProvided: "",
            ExpiryDate: "",
            ReturnedDate: "",
            SpecialNote: "",
        });
    };

    const handleInputChange = ({id, value}) => {

        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };
    const fields = [
        {
            id: "Category",
            label: "Category:",
            value: selectedRowData.Category,
            type: "select",
            options: equipmentData.map((equipment) => ({
                value: equipment.Description,
                label: equipment.Description,
            })),
        },
        {
            id: "Item",
            label: "Item:",
            value: selectedRowData.Item,
            type: "text",
        },
        {
            id: "ItemNotes",
            label: "Item Notes:",
            value: selectedRowData.ItemNotes,
            type: "text",
        },
        {
            id: "Quantity",
            label: "Quantity:",
            value: selectedRowData.Quantity,
            type: "number",
        },
        {
            id: "DateProvided",
            label: "Date Provided:",
            value: selectedRowData.DateProvided,
            type: "date",
        },
        {
            id: "ExpiryDate",
            label: "Expiry Date:",
            value: selectedRowData.ExpiryDate,
            type: "date",
        },
        {
            id: "ReturnedDate",
            label: "Returned Date:",
            value: selectedRowData.ReturnedDate,
            type: "date",
        },
        {
            id: "SpecialNote",
            label: "Special Note:",
            value: selectedRowData.SpecialNote,
            type: "text",
        },
    ];
    return (
        <div className="mt-4">


            <CustomAgGridDataTable

                title="Equipment"
                primaryButton={{
                    label: "Add Worker Equipment",
                    icon: <PlusCircle className="h-4 w-4"/>,
                    onClick: () => setShowForm(true),
                    // disabled: disableSection,
                }}

                rows={workerEquipmentData.data}
                rowSelected={handleSelectRowClick}
                columns={columns}
                showActionColumn={true}
            />
            <EditModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                modalTitle="Edit Checklist Item"
                fields={fields}
                data={selectedRowData}
                onChange={handleInputChange}
            />

        </div>
    );
};

export default UpdateEquipment;
