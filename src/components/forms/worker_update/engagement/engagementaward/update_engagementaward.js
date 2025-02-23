import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import EngagementPayrate from "../engagementpayrate/engagementpayrate";
import {Col, Container, Row} from 'react-bootstrap';
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import ColorContext from "@/contexts/ColorContext";

export const fetchWorkerEngagementAwardData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerEngagementAwardData/${WorkerID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching worker engagementAward data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateEngagementAward = ({
                                   setWorkerEngagementAwardData,
                                   workerEngagementAwardData,
                                   setShowForm,
                                   WorkerID,
                               }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        Service: "",
        AwardCode: "",
        AwardSector: "",
    });
    const [service, setService] = useState(null);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([]);
    // const {colors} = useContext(ColorContext);
    const fetchAndSetWorkerEngagementAwardData = async () => {
        const data = await fetchWorkerEngagementAwardData(WorkerID);
        setWorkerEngagementAwardData(data);
        setColumns(getColumns(data))
        const serviceData = await fetchData(
            "/api/getServicesData",
            window.location.href
        );
        setService(serviceData);
    };

    useEffect(() => {
        fetchAndSetWorkerEngagementAwardData();
        fetchUserRoles("m_wprofile", "Worker_Profile_EngagementAward", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerEngagementAwardData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerEngagementAwardData(
                await fetchWorkerEngagementAwardData(WorkerID)
            );
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerEngagementAwardData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerEngagementAwardData(
                await fetchWorkerEngagementAwardData(WorkerID)
            );
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Service: "",
            AwardCode: "",
            AwardSector: "",
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
        <Container>
            {/* <hr></hr> */}
            <p style={{fontSize: "1.2rem", marginTop: "0rem"}}>
                Override Service Award
            </p>
            <SaveDelete
                saveOnClick={handleSave}
                display={selectedRowData.Lock === true ? "none" : ""}
                deleteOnClick={handleDelete}
                disabled={disableSection}
            />
            <form
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0rem",
                    // padding: "0rem",
                    // margin: "0rem",
                    maxWidth: "80vw",
                }}
            >

                <Row>
                    <Col md={4}>
                        <InputField
                            id="Service"
                            label="Service:"
                            value={selectedRowData.Service}
                            type="select"
                            onChange={handleInputChange}
                            disabled={disableSection}
                            options={service?.data.map((form) => ({
                                value: form.Description,
                                label: form.Description,
                            }))}
                        />
                    </Col>
                    <Col md={4}>
                        <InputField
                            id="AwardCode"
                            label="Award Code:"
                            value={selectedRowData.AwardCode}
                            type="select"
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col md={4}>
                        <InputField
                            id="AwardSector"
                            label="Award Sector:"
                            value={selectedRowData.AwardSector}
                            type="select"
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                    </Col>
                </Row>


            </form>

            <MButton
                style={{
                    margin: "20px 15px 30px 15px",
                    backgroundColor: "blue"
                }}
                label="Add Worker EngagementAward"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size="small"
            />
            {/* <MListingDataTable
        rows={workerEngagementAwardData.data}
        rowSelected={handleSelectRowClick}
      /> */}
            <AgGridDataTable
                rows={workerEngagementAwardData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
            <EngagementPayrate WorkerID={WorkerID}/>
        </Container>
    );
};

export default UpdateEngagementAward;
