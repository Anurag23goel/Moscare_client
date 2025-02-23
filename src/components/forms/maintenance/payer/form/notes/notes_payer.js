import React, {useEffect, useState} from "react";
import Grid from "@/components/widgets/utils/Grid";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Checkbox} from "@mui/material";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";

export const fetchPayerNotesData = async (UpdateID) => {
    try {
        const data = await fetchData(
            `/api/getPayerNotesDataByID/${UpdateID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Complete: item.Complete ? true : false,
                EditNote: item.EditNote ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching worker notes data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const NotesPayer = ({
                        setPayerNotesData,
                        payerNotesData,
                        setShowForm,
                        UpdateID,
                    }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        UpdateID: UpdateID,
        CreatedOn: "",
        Priority: "",
        Category: "",
        Note: "",
        NoteDate: "",
        RemindDate: "",
        ClosedDate: "",
        CreatedBy: "",
        Comment: "",
        AssignedTo: "",
        Complete: false,
        EditNote: false,
    });
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, SetNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    const fetchAndSetPayerNotesData = async () => {
        const data = await fetchPayerNotesData(UpdateID);
        setPayerNotesData(data);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        /*  const notesOptions = await fetchData(
          "/api/getNoteCategories",
          window.location.href
        );
        SetNotesCategory(notesOptions.data); */
        setAssignData(formdata2.data);
    };

    useEffect(() => {
        fetchAndSetPayerNotesData();
        fetchUserRoles('m_maint_payers', "Maintainence_Payers_Notes", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                `/api/putPayerNotesData/${selectedRowData.ID}`,
                {generalData: selectedRowData},
                window.location.href
            );
            console.log("Save clicked:", data);
            setPayerNotesData(await fetchPayerNotesData(UpdateID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            UpdateID: UpdateID,
            CreatedOn: "",
            Priority: "",
            Category: "",
            Note: "",
            NoteDate: "",
            RemindDate: "",
            ClosedDate: "",
            CreatedBy: "",
            Comment: "",
            AssignedTo: "",
            Complete: false,
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
        <div>
            <Container className={styles.MainContainer}>
                <SaveDelete saveOnClick={handleSave} display={"none"} disabled={disableSection}/>
                <form
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        padding: "0.5rem",
                        margin: "1rem",
                        maxWidth: "80vw",
                    }}
                >
                    <Grid>
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
                        <InputField
                            id="Note"
                            label="Note:"
                            value={selectedRowData.Note}
                            type="textarea"
                            disabled={!selectedRowData.EditNote || disableSection}
                            onChange={handleInputChange}
                        />
                        <div>
                            <Checkbox
                                id="EditNote"
                                checked={selectedRowData.EditNote}
                                onChange={handleInputChange}
                                disabled={disableSection}
                                name="checkbox"
                            />
                            Edit Note
                        </div>
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
                        <InputField
                            id="RemindOn"
                            label="Remind On:"
                            value={selectedRowData.RemindOn}
                            type="date"
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                        <div>
                            <Checkbox
                                id="Complete"
                                checked={selectedRowData.Complete}
                                onChange={handleInputChange}
                                disabled={disableSection}
                                name="checkbox"
                            />
                            Mark note as Complete
                        </div>
                        <br/>
                    </Grid>
                </form>
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
                    rows={payerNotesData.data}
                    rowSelected={handleSelectRowClick}
                />
            </Container>
        </div>
    );
};

export default NotesPayer;
