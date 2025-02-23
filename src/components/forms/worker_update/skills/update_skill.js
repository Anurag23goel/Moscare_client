import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";

import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";


export const fetchWorkerSkillData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerSkillData/${WorkerID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching worker skill data:", error);
        return {data: []};
    }
};

const UpdateSkill = ({
                         setWorkerSkillData,
                         workerSkillData,
                         WorkerID,
                         setShowForm2
                     }) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    // const {colors} = useContext(ColorContext);

    const fetchAndSetWorkerSkillData = async () => {
        const data = await fetchWorkerSkillData(WorkerID);
        setWorkerSkillData(data);
        setColumns(getColumns(data));
    };

    useEffect(() => {
        fetchAndSetWorkerSkillData();
        fetchUserRoles("m_wprofile", "Worker_Profile_Skills", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        console.log(row)
        setSelectedRowData(row);
        setShowModal(true); // Open the modal when a row is selected
    };

    const handleSave = async () => {
        try {
            await putData(
                `/api/updateWorkerSkillData/${selectedRowData.ID}`,
                selectedRowData,
                window.location.href
            );
            setWorkerSkillData(await fetchWorkerSkillData(WorkerID));
            setShowModal(false); // Close the modal after saving
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteData(
                "/api/deleteWorkerSkillData",
                selectedRowData,
                window.location.href
            );
            setWorkerSkillData(await fetchWorkerSkillData(WorkerID));
            setShowModal(false); // Close the modal after deleting
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            Skill: "",
            Note: "",
        });
    };

    const handleInputChange = ({id, value}) => {
        // const { id, value } = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const fields = [
        {
            id: "Skill",
            label: "Skill:",
            type: "text",
        },
        {
            id: "Note",
            label: "Note:",
            type: "text",
        },

    ];


    return (
        <>
            <div className="pt-5">

                <CustomAgGridDataTable

                    title="Skills"
                    primaryButton={{
                        label: "Add Worker Skill",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm2(true),
                        // disabled: disableSection,
                    }}

                    rows={workerSkillData.data}
                    rowSelected={handleSelectRowClick}
                    columns={columns}
                    showActionColumn={true}
                />


                <EditModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    modalTitle="Edit Skill"
                    fields={fields}
                    data={selectedRowData || {}} // Pass selectedRowData with fallback to an empty object
                    onChange={handleInputChange}
                />


            </div>
        </>
    );
};

export default UpdateSkill;
