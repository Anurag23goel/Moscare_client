import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";

Modal.setAppElement("#__next");

const Task = () => {
    const [taskData, setTaskData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState("");
    const [createdByFilter, setCreatedByFilter] = useState("");
    const [assignFilter, setAssignFilter] = useState("");
    const [completeFilter, setCompleteFilter] = useState("");
    const [workerData, setWorkerData] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    const fetchTaskData = async () => {
        try {
            const taskResponse = await fetchData(
                "/api/getWorkerNotesDataAll",
                window.location.href
            );
            const workerResponse = await fetchData(
                "/api/getActiveWorkerMasterData",
                window.location.href
            );
            setWorkerData(workerResponse.data);
            console.log("Fetched task data:", taskResponse);
            return taskResponse;
        } catch (error) {
            console.error("Error fetching task data:", error);
        }
    };

    useEffect(() => {
        const fetchAndSetTaskData = async () => {
            const data = await fetchTaskData();
            setTaskData(data);
            setFilteredData(data);
        };
        fetchAndSetTaskData();
        fetchUserRoles('m_tasks', 'Operation_Crm_Task', setDisableSection);
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            let filtered = taskData?.data || [];
            if (priorityFilter) {
                filtered = filtered.filter((task) => task.Priority === priorityFilter);
            }
            if (createdByFilter) {
                filtered = filtered.filter(
                    (task) => task.CreatedBy === createdByFilter
                );
            }
            if (assignFilter) {
                filtered = filtered.filter((task) => task.AssignedTo === assignFilter);
            }
            if (completeFilter === "Complete") {
                filtered = filtered.filter((task) => task.Completed === 1);
            }
            if (completeFilter === "UnComplete") {
                filtered = filtered.filter((task) => task.Completed === 0);
            }
            setFilteredData(filtered);
        };

        applyFilters();
    }, [priorityFilter, createdByFilter, assignFilter, taskData, completeFilter]);

    const handleClear = () => {
        setPriorityFilter("")
        setCreatedByFilter("")
        setAssignFilter("")
        setCompleteFilter("")
    }

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div>
            <div style={{padding: "1rem", zIndex: "5"}}>
                <div style={{display: "flex", gap: "1rem"}}>
                    <div>
                        <label>Priority: </label>
                        <InputField
                            type={"select"}
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            disabled={disableSection}
                            options={[
                                {value: "", label: "All"},
                                {value: "High", label: "High"},
                                {value: "Medium", label: "Medium"},
                                {value: "Low", label: "Low"},
                            ]}
                        />
                    </div>
                    <div>
                        <label>Created By: </label>
                        <InputField
                            value={createdByFilter}
                            type={"select"}
                            onChange={(e) => setCreatedByFilter(e.target.value)}
                            disabled={disableSection}
                            options={workerData.map((worker) => ({
                                value: worker.FirstName,
                                label: worker.FirstName,
                            }))}
                        />
                    </div>
                    <div>
                        <label>Assigned To: </label>
                        <InputField
                            value={assignFilter}
                            type={"select"}
                            onChange={(e) => setAssignFilter(e.target.value)}
                            disabled={disableSection}
                            options={workerData.map((worker) => ({
                                value: worker.FirstName,
                                label: worker.FirstName,
                            }))}
                        />
                    </div>
                    <div>
                        <label>Complete: </label>
                        <InputField
                            type={"select"}
                            value={completeFilter}
                            onChange={(e) => setCompleteFilter(e.target.value)}
                            disabled={disableSection}
                            options={[
                                {value: "", label: "All"},
                                {value: "Complete", label: "Complete"},
                                {value: "UnComplete", label: "UnComplete"},
                            ]}
                        />
                    </div>
                </div>
                <Button
                    style={{margin: "20px 15px 30px 15px"}}
                    disabled={disableSection}
                    label="Clear Filter"
                    variant="contained"
                    color="primary"
                    size={"small"}
                    onClick={handleClear}
                />
                <hr/>
                <MListingDataTable rows={filteredData}/>
            </div>
        </div>
    );
};

export default Task;
