import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Col, Container, Row} from "react-bootstrap";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import ColorContext from "@/contexts/ColorContext";

export const fetchWorkerEngagementPayrateData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerEngagementPayrateData/${WorkerID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching worker engagementPayrate data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateEngagementPayrate = ({
                                     setWorkerEngagementPayrateData,
                                     workerEngagementPayrateData,
                                     setShowForm,
                                     WorkerID,
                                 }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        Service: "",
        PayRate: "",
    });
    const [service, setService] = useState(null);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([]);
    // const {colors} = useContext(ColorContext);

    const fetchAndSetWorkerEngagementPayrateData = async () => {
        const data = await fetchWorkerEngagementPayrateData(WorkerID);
        setWorkerEngagementPayrateData(data);
        setColumns(data);
        const serviceData = await fetchData(
            "/api/getServicesData",
            window.location.href
        );
        setService(serviceData);
    };

    useEffect(() => {
        fetchAndSetWorkerEngagementPayrateData();
        fetchUserRoles("m_wprofile", "Worker_Profile_EngagementPayrate", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerEngagementPayrateData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerEngagementPayrateData(
                await fetchWorkerEngagementPayrateData(WorkerID)
            );
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerEngagementPayrateData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerEngagementPayrateData(
                await fetchWorkerEngagementPayrateData(WorkerID)
            );
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Service: "",
            PayRate: "",
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
            <p style={{fontSize: "1rem", marginTop: "1rem"}}>
                Override Service Pay Level (XERO / MYOB / Reckon API / Attache)
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
                    maxWidth: "80vw",
                }}
            >
                <Row>
                    <Col>
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

                    <Col>
                        <InputField
                            id="PayRate"
                            label="Payrate Level:"
                            value={selectedRowData.PayRate}
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
                label="Add Worker Engagement Payrate"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size="small"
            />
            {/* <MListingDataTable
        rows={workerEngagementPayrateData.data}
        rowSelected={handleSelectRowClick}
      /> */}

            <AgGridDataTable
                rows={workerEngagementPayrateData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
        </Container>
    );
};

export default UpdateEngagementPayrate;
