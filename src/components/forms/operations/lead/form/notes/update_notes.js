import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Checkbox} from "@mui/material";
import {Col, Container, Row} from "react-bootstrap";

export const fetchWorkerNotesData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerNotesData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Completed: item.Completed ? true : false,
                EditNote: item.EditNote ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching worker notes data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateNotes = ({
                         setWorkerNotesData,
                         workerNotesData,
                         setShowForm,
                         WorkerID,
                     }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        NoteType: "",
        Priority: "",
        Category: "",
        Client: "",
        Note: "",
        CreatedOn: "",
        RemindOn: "",
        ClosedDate: "",
        CreatedBy: "",
        AssignedTo: "",
        Completed: false,
        EditNote: false,
    });
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, SetNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    const fetchAndSetWorkerNotesData = async () => {
        const data = await fetchWorkerNotesData(WorkerID);
        setWorkerNotesData(data);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const notesOptions = await fetchData(
            "/api/getNoteCategories",
            window.location.href
        );
        SetNotesCategory(notesOptions.data);
        setAssignData(formdata2.data);
    };

    useEffect(() => {
        fetchAndSetWorkerNotesData();
        fetchUserRoles('m_crm', "Operations_Lead_Notes", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerNotesData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerNotesData(await fetchWorkerNotesData(WorkerID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            WorkerID: WorkerID,
            NoteType: "",
            Priority: "",
            Category: "",
            Client: "",
            Note: "",
            CreatedOn: "",
            RemindOn: "",
            ClosedDate: "",
            CreatedBy: "",
            AssignedTo: "",
            Completed: false,
            EditNote: false,
        });
    };

    const handleInputChange = (event) => {
        const {id, value, type, checked} = event.target;
        setSelectedRowData((prevState) => ({
            ...prevState,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <Container>
            <SaveDelete
                saveOnClick={handleSave}
                display={"none"}
                disabled={disableSection}
            />
            <Row className="mt-2">
                <Col>
                    <InputField
                        id="Priority"
                        label="Priority:"
                        value={selectedRowData.Priority}
                        type="select"
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={[
                            {value: "Low", label: "Low"},
                            {value: "Medium", label: "Medium"},
                            {value: "High", label: "High"},
                            {value: "Urgent", label: "Urgent"},
                        ]}
                    />
                </Col>
                <Col>
                    <InputField
                        id="Category"
                        label="Category:"
                        value={selectedRowData.Category}
                        type={"select"}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={notesCategory.map((form) => ({
                            value: form.Description,
                            label: form.Description,
                        }))}
                    />
                </Col>
                <Col>
                    <InputField
                        id="AssignedTo"
                        label="Assigned To:"
                        value={selectedRowData.AssignedTo}
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
                        id="RemindOn"
                        label="Remind On:"
                        value={selectedRowData.RemindOn}
                        type="date"
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    <InputField
                        id="Note"
                        label="Note:"
                        value={selectedRowData.Note}
                        type="textarea"
                        disabled={!selectedRowData.EditNote}
                        onChange={handleInputChange || disableSection}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Checkbox
                        id="EditNote"
                        checked={selectedRowData.EditNote}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        name="checkbox"
                    />
                    Edit Note
                </Col>
            </Row>
            <Row>
                <Col>
                    <Checkbox
                        id="Completed"
                        checked={selectedRowData.Completed}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        name="checkbox"
                    />
                    Mark note as Completed
                </Col>
            </Row>
            <MButton
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Worker Notes"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size="small"
            />
            <MListingDataTable
                rows={workerNotesData.data}
                rowSelected={handleSelectRowClick}
            />
        </Container>
    );
};

export default UpdateNotes;
