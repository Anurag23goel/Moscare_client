import React, {useEffect, useState} from "react";
import {Checkbox} from "@mui/material";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {deleteData, fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Col, Container, Row} from "react-bootstrap";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";

export const fetchWorkerFormData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerFormData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        // Extract columns dynamically (keys of the first item in data array)
        const columns = Object.keys(data.data[0] || {}).map((key) => ({
            field: key,
            headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
        }));

        console.log("Extracted columns:", columns);

        return {...data, columns};

    } catch (error) {
        console.error("Error fetching worker form data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateForm = ({
                        setWorkerFormData,
                        workerFormData,
                        setShowForm,
                        WorkerID,
                    }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        TemplateName: "",
        FormName: "",
        AssignTo: "",
        ReviewDate: "",
        CreationDate: "",
        Status: "",
        Visibility: false,
    });
    const [assignData, setAssignData] = useState([]);
    const [formOptions, setFormOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])

    const fetchAndSetWorkerFormData = async () => {
        const data = await fetchWorkerFormData(WorkerID);
        setWorkerFormData(data);
        setColumns(data.columns)
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const formdata = await fetchData(
            "/api/getTemplateCategory",
            window.location.href
        );
        setFormOptions(formdata?.data);
        setAssignData(formdata2.data);
    };

    useEffect(() => {
        fetchAndSetWorkerFormData();
        fetchUserRoles('m_crm', "Operations_Lead_Form", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerFormData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerFormData(await fetchWorkerFormData(WorkerID));
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerFormData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerFormData(await fetchWorkerFormData(WorkerID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            TemplateName: "",
            FormName: "",
            AssignTo: "",
            ReviewDate: "",
            CreationDate: "",
            Status: "",
            Visibility: false,
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

    const handleCheckBox = (event) => {
        const {checked} = event.target;
        setSelectedRowData((prevState) => ({
            ...prevState,
            Visibility: checked ? "Worker" : "",
        }));
    };

    return (
        <Container>
            <SaveDelete
                saveOnClick={handleSave}
                deleteOnClick={handleDelete}
                disabled={disableSection}
            />
            <Row>
                <Col>
                    <InputField
                        id="TemplateName"
                        label="Template Name:"
                        value={selectedRowData.TemplateName}
                        type={"select"}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={formOptions.map((form) => ({
                            value: form.TemplateCategory,
                            label: form.TemplateCategory,
                        }))}
                    />
                </Col>
                <Col>
                    <InputField
                        type="text"
                        id="FormName"
                        label="Form Name:"
                        value={selectedRowData.FormName}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col>
                    <InputField
                        id="AssignTo"
                        label="Assign To:"
                        value={selectedRowData.AssignTo}
                        type="select"
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={assignData.map((form) => ({
                            value: form.FirstName,
                            label: form.FirstName,
                        }))}
                    />
                </Col>
                <Col>
                    <InputField
                        type="date"
                        id="ReviewDate"
                        label="Review Date:"
                        value={selectedRowData.ReviewDate}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <Row className="mt-3">
                <Col md={3}>
                    <InputField
                        type="date"
                        id="CreationDate"
                        label="Creation Date:"
                        value={selectedRowData.CreationDate}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col md={3}>
                    <InputField
                        type="select"
                        id="Status"
                        label="Status:"
                        value={selectedRowData.Status}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={[
                            {value: "OPEN", label: "OPEN"},
                            {value: "IN PROGRESS", label: "IN PROGRESS"},
                            {value: "COMPLETED", label: "COMPLETED"},
                            {value: "FOR REVIEW", label: "FOR REVIEW"},
                            {value: "CLOSED", label: "CLOSED"},
                        ]}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Checkbox
                        id="Visibility"
                        checked={selectedRowData.Visibility === "Worker"}
                        onChange={handleCheckBox}
                        disabled={disableSection}
                        name="checkbox"
                    />
                    Visibility to Worker
                </Col>
            </Row>
            <MButton
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Worker Form"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size="small"
            />
            <MListingDataTable
                rows={workerFormData.data}
                rowSelected={handleSelectRowClick}
            />
            <AgGridDataTable
                rows={workerFormData.data}
                rowSelected={handleSelectRowClick}
                columns={columns}
            />
        </Container>
    );
};

export default UpdateForm;
