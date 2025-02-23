import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import StatusBar from "@/components/widgets/StatusBar";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";

import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";


export const fetchWorkerTrainingQualificationData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerTrainingQualificationData/${WorkerID}`,
            window.location.href
        );

        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                EffectiveCompetant: item.EffectiveCompetant ? true : false,
            })),
        };

        const columns = Object.keys(transformedData.data[0] || {}).map((key) => ({
            field: key,
            headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
        }));

        return {...transformedData, columns};
    } catch (error) {
        console.error("Error fetching worker training qualification data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateTrainingQualification = ({
                                         setWorkerTrainingQualificationData,
                                         workerTrainingQualificationData,
                                         WorkerID,
                                         setShowForm,
                                         trainingItemOptions
                                     }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        TrainingItem: "",
        CredentialLevel: "",
        TrainingDate: "",
        ReviewDate: "",
        ExpiryDate: "",
        Note: "",
        EffectiveCompetant: false,
    });
    const [trainingItem, setTrainingItem] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null);
    const [columns, setColumns] = useState([]);
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    // const {colors} = useContext(ColorContext);

    const fetchAndSetWorkerTrainingQualificationData = async () => {
        const data = await fetchWorkerTrainingQualificationData(WorkerID);
        setWorkerTrainingQualificationData(data);
        setColumns(data.columns);
        const trainingItems = await fetchData(
            "/api/getTrainingItems",
            window.location.href
        );
        setTrainingItem(trainingItems.data);
    };

    useEffect(() => {
        fetchAndSetWorkerTrainingQualificationData();
        fetchUserRoles("m_wprofile", "Worker_Profile_Training", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        console.log(row)
        setSelectedRowData(row);
        setShowModal(true); // Open the modal
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerTrainingQualificationData",
                selectedRowData,
                window.location.href
            );
            setAlert(true);
            setStatus(data.success);
            setWorkerTrainingQualificationData(
                await fetchWorkerTrainingQualificationData(WorkerID)
            );
            handleCloseModal(); // Close the modal after saving
        } catch (error) {
            setAlert(true);
            setStatus(false);
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteData(
                "/api/deleteWorkerTrainingQualificationData",
                selectedRowData,
                window.location.href
            );
            setWorkerTrainingQualificationData(
                await fetchWorkerTrainingQualificationData(WorkerID)
            );
            handleCloseModal(); // Close the modal after deleting
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false); // Close the modal
    };

    const handleInputChange = (event) => {
        const {id, value, type, checked} = event.target;
        setSelectedRowData((prevState) => ({
            ...prevState,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <>
            <div className="pt-5">
                {alert && (
                    <StatusBar
                        status={status}
                        setAlert={setAlert}
                        msg={!status ? "Something went wrong" : "Profile Updated Successfully"}
                    />
                )}


                <CustomAgGridDataTable

                    title="Training Qualification"
                    primaryButton={{
                        label: "Add Worker Training Qualification",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}

                    rows={workerTrainingQualificationData.data}
                    rowSelected={handleSelectRowClick}
                    columns={columns.filter(
                        (col) => !["Bucket", "File", "Folder"].includes(col.headerName)
                    )}
                    showActionColumn={true}
                />


                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Training Information"
                    fields={[
                        {
                            id: "TrainingItem",
                            label: "Training Item",
                            type: "select",
                            options: trainingItemOptions.map((form) => ({
                                value: form.Description,
                                label: form.Description,
                            })),
                        },
                        {
                            id: "CredentialLevel", label: "Credential Level", type: "select", options: [
                                {value: "Credentailled", label: "Credentailled"},
                                {value: "Educated", label: "Educated"},
                                {value: "Trained", label: "Trained"},
                                {value: "Informal", label: "Informal"},
                            ],
                        },
                        {id: "TrainingDate", label: "Training Date", type: "date"},
                        {id: "ReviewDate", label: "Review Date", type: "date"},
                        {id: "ExpiryDate", label: "Expiry Date", type: "date"},
                        {id: "Note", label: "Note", type: "textarea"},
                        {id: "EffectiveCompetant", label: "Effective & Competent", type: "checkbox"},
                    ]}
                    data={selectedRowData}
                    onChange={handleInputChange}
                    disableSave={disableSection}
                />
            </div>
        </>
    );
};

export default UpdateTrainingQualification;
