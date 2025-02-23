import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchWorkerStatusData = async () => {
    try {
        const data = await fetchData("/api/getWorkerStatus", window.location.href);
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching area data:", error);
    }
};

const UpdateWorkerStatus = ({
                                setWorkerStatusData,
                                workerStatusData,
                                setShowForm,
                            }) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors, loading} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    useEffect(() => {
        const fetchAndSetWorkerStatusData = async () => {
            const data = await fetchWorkerStatusData();
            setWorkerStatusData(data);
            setColumns(getColumns(data))

        };
        fetchAndSetWorkerStatusData();
        fetchUserRoles('m_wrkr_status', "Maintainence_Worker_Status", setDisableSection);
    }, []);

    // Function to handle selecting a row
    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    // Function to handle saving changes
    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerStatus",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            addValidationMessage("Worker Status updated successfully", "success");

            setWorkerStatusData(await fetchWorkerStatusData());
        } catch (error) {
            addValidationMessage("Failed to update Worker Status data ", "error");

            console.error("Error fetching Worker Status data:", error);
        }
        setShowModal(false);

    };
    const handleCloseModal = () => setShowModal(false);

    // Function to handle deleting a row
    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerStatus",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerStatusData(await fetchWorkerStatusData());
        } catch (error) {
            console.error("Error fetching area data:", error);
        }
    };

    // Function to clear the form
    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            Status: "",
        });
    };

    // Function to handle input changes
    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };
    const modalFields = [
        {id: "Status", label: "Status", type: "text"}
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


                <CustomAgGridDataTable2

                    title="Worker Status"
                    primaryButton={{
                        label: "Add Worker Status",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}


                    rows={workerStatusData.data}
                    rowSelected={handleSelectRowClick}
                    columns={columns}
                />
                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Worker Status"
                    fields={modalFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateWorkerStatus;
