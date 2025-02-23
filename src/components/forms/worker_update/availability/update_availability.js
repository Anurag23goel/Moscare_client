import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import {Checkbox} from "@mui/material";
import AvailabilityTime from "./availabilityTime";
import {Col, Row} from 'react-bootstrap';
import ColorContext from "@/contexts/ColorContext";
import styles from '@../../../src/styles/workeravailability.module.css'
import stylesSecond from '@/styles/style.module.css'
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";


export const fetchWorkerAvailabilityData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerAvailabilityLeaveData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched data:", data);

        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                LeaveEntireDay: item.LeaveEntireDay ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching worker availability data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateAvailability = ({
                                setWorkerAvailabilityData,
                                workerAvailabilityData,
                                setShowForm,
                                WorkerID,
                                setSelectedComponent,
                                setAvailabilityEdit,
                            }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        LeaveDate: "",
        LeaveEntireDay: false,
        LeaveType: "",
        LeaveRemark: "",
    });
    const [availabilityData, setAvailabilityData] = useState([]);
    const [leaveType, setLeaveType] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    const fetchAndSetWorkerAvailabilityData = async () => {
        const data = await fetchWorkerAvailabilityData(WorkerID);
        const leavetype = await fetchData(
            "/api/getLeaveType",
            window.location.href
        );
        setLeaveType(leavetype.data);
        setWorkerAvailabilityData(data);
        setColumns(getColumns(data))
    };

    useEffect(() => {
        fetchAndSetWorkerAvailabilityData();
        fetchUserRoles('m_wprofile', 'Worker_Profile_Availability', setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerAvailabilityLeaveData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerAvailabilityData(await fetchWorkerAvailabilityData(WorkerID));
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerAvailabilityLeaveData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerAvailabilityData(await fetchWorkerAvailabilityData(WorkerID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            WorkerID: WorkerID,
            LeaveDate: "",
            LeaveEntireDay: false,
            LeaveType: "",
            LeaveRemark: "",
        });
    };

    const handleInputChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setSelectedRowData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };

    return (
        <div className={styles.AvailabilityContainer}>
            <AvailabilityTime
                setAvailabilityEdit={setAvailabilityEdit}
                setSelectedComponent={setSelectedComponent}
            />
            <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled={disableSection}/>
            <Row>
                <Col md={3}>
                    <InputField
                        type="date"
                        id="LeaveDate"
                        label="Leave Date:"
                        value={selectedRowData.LeaveDate}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col md={3}>
                    <InputField
                        type="select"
                        id="LeaveType"
                        label="Leave Type:"
                        value={selectedRowData.LeaveType}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={leaveType.map((leavetype) => {
                            return {
                                value: leavetype.LeaveType,
                                label: leavetype.LeaveType,
                            };
                        })}
                    />
                </Col>
                <Col md={3}>
                    <InputField
                        type="textarea"
                        id="LeaveRemark"
                        label="Leave Remark:"
                        value={selectedRowData.LeaveRemark}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <Row>
                <Col className={stylesSecond.fontSize13}>
                    <Checkbox
                        id="LeaveEntireDay"
                        checked={selectedRowData.LeaveEntireDay}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        name="checkbox"
                    />
                    Entire Day
                </Col>
            </Row>


            <CustomAgGridDataTable

                primaryButton={{
                    label: "Add Worker Availability",
                    icon: <PlusCircle className="h-4 w-4"/>,
                    onClick: () => setShowForm(true),
                    // disabled: disableSection,
                }}
                rows={workerAvailabilityData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
                showActionColumn={true}
            />
        </div>
    );
};

export default UpdateAvailability;
