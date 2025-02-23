import React, {useCallback, useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import Button from "@/components/widgets/MaterialButton";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import {Col, Container, Row} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import ColorContext from "@/contexts/ColorContext";

export const fetchFormsData = async () => {
    try {
        const data = await fetchData("/api/getFormsDataAll", window.location.href);
        console.log("Fetched Form data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching forms data:", error);
    }
};

const UpdateForms = ({formsData, setFormsData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        Template: "",
        FormName: "",
        assignToWorker: false,
        workerId: "",
        assignToClient: false,
        clientId: "",
        assignToUser: false,
        userId: "",
        ReviewDate: "",
        FormDate: "",
    });
    const [assignData, setAssignData] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [formOptions, setFormOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);

    // Moved fetch logic to a useCallback to make it reusable and stable
    const fetchAndSetFormsData = useCallback(async () => {
        try {
            const [
                formsDataResponse,
                formdata,
                workersResponse,
                clientsResponse,
                usersResponse
            ] = await Promise.all([
                fetchFormsData(),
                fetchData("/api/getTemplateCategory", window.location.href),
                fetchData("/api/getActiveWorkerMasterData", window.location.href),
                fetchData("/api/getClients", window.location.href),
                fetchData("/api/getUsers", window.location.href)
            ]);

            console.log("Fetched Form data:", formsDataResponse);
            setAssignData(workersResponse.data || []);
            setClients(clientsResponse.data || []);
            setUsers(usersResponse.data || []);
            setFormOptions(formdata?.data);
            setFormsData(formsDataResponse);
        } catch (error) {
            console.error("Error fetching data in parallel:", error);
            // Handle error appropriately (e.g., set error state)
        }
    }, [setFormsData]);

    useEffect(() => {
        fetchAndSetFormsData();
        fetchUserRoles('m_maint_forms', "Maintainence_Forms", setDisableSection);
    }, [fetchAndSetFormsData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleSave = async () => {
        try {
            const data = await putData("/api/putFormsData", selectedRowData, window.location.href);
            console.log("Save response:", data);
            setFormsData(await fetchFormsData());
            handleClearForm();
        } catch (error) {
            console.error("Error saving forms data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData("/api/deleteFormsData", selectedRowData, window.location.href);
            console.log("Delete response:", data);
            handleClearForm();
            setFormsData(await fetchFormsData());
        } catch (error) {
            console.error("Error deleting forms data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Template: "",
            FormName: "",
            assignToWorker: false,
            workerId: "",
            assignToClient: false,
            clientId: "",
            assignToUser: false,
            userId: "",
            ReviewDate: "",
            FormDate: "",
        });
    };

    const handleInputChange = (event) => {
        const {id, value, type, checked} = event.target;
        const newValue = type === "checkbox" ? checked : value;
        setSelectedRowData((prevState) => ({...prevState, [id]: newValue}));
    };

    return (
        <Container>
            <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled={disableSection}/>
            <Row>
                <Col md={6}>
                    <InputField
                        id="Template"
                        label="Template Name:"
                        value={selectedRowData.Template}
                        type={"select"}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={formOptions.map((form) => ({
                            value: form.TemplateCategory,
                            label: form.TemplateCategory,
                        }))}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <InputField
                        label="Form Name"
                        type="text"
                        id="FormName"
                        value={selectedRowData.FormName}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <InputField
                        id="assignToWorker"
                        label="Assign to Worker"
                        type="checkbox"
                        value={selectedRowData.assignToWorker}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                    {selectedRowData.assignToWorker && (
                        <InputField
                            id="workerId"
                            label="Select Worker"
                            type="select"
                            value={selectedRowData.workerId}
                            onChange={handleInputChange}
                            disabled={disableSection}
                            options={assignData.map((worker) => ({
                                value: worker.WorkerID,
                                label: `${worker.FirstName} ${worker.LastName}`,
                            }))}
                        />
                    )}
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <InputField
                        id="assignToClient"
                        label="Assign to Client"
                        type="checkbox"
                        value={selectedRowData.assignToClient}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                    {selectedRowData.assignToClient && (
                        <InputField
                            id="clientId"
                            label="Select Client"
                            type="select"
                            value={selectedRowData.clientId}
                            onChange={handleInputChange}
                            disabled={disableSection}
                            options={clients.map((client) => ({
                                value: client.ClientID,
                                label: client.Name,
                            }))}
                        />
                    )}
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <InputField
                        id="assignToUser"
                        label="Assign to User"
                        type="checkbox"
                        value={selectedRowData.assignToUser}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                    {selectedRowData.assignToUser && (
                        <InputField
                            id="userId"
                            label="Select User"
                            type="select"
                            value={selectedRowData.userId}
                            onChange={handleInputChange}
                            disabled={disableSection}
                            options={users.map((user) => ({
                                value: user.UserID,
                                label: `${user.FirstName} ${user.LastName}`,
                            }))}
                        />
                    )}
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <InputField
                        label="Review Date"
                        type="date"
                        id="ReviewDate"
                        disabled={disableSection}
                        value={selectedRowData.ReviewDate}
                        onChange={handleInputChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <InputField
                        label="Form Date"
                        type="date"
                        id="FormDate"
                        disabled={disableSection}
                        value={selectedRowData.FormDate}
                        onChange={handleInputChange}
                    />
                </Col>
            </Row>
            <Button
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Forms"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                disabled={disableSection}
                onClick={() => setShowForm(true)}
                size={"small"}
            />
            <AgGridDataTable
                rows={formsData?.data}
                columns={getColumns().filter(
                    (col) =>
                        ![
                            "maker User",
                            "maker Date",
                            "Created By",
                            "Visibility",
                            "update User",
                            "update Time",
                        ].includes(col.headerName)
                )}
                rowSelected={handleSelectRowClick}
                handleRowUnselected={handleRowUnselected}
            />
        </Container>
    );
};

export default UpdateForms;