import {useContext, useEffect, useState} from "react";
import ColorContext from "@/contexts/ColorContext";
import Grid from "@/components/widgets/utils/Grid";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {fetchData, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Checkbox} from "@mui/material";
import styles from "@/styles/style.module.css";

export const fetchClientIncidentData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientIncidentsDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                isReportable: item.isReportable ? true : false,
                EditNote: item.EditNote ? true : false,
                FiveHrSubmitted: item.FiveHrSubmitted ? true : false,
                TwentyfourHrSubmitted: item.TwentyfourHrSubmitted ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching client notes data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateIncident = ({
                            setClientIncidentData,
                            clientIncidentData,
                            setShowForm,
                            ClientID,
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Priority: "",
        Category: "",
        Note: "",
        CreatedOn: "",
        RemindOn: "",
        ClosedDate: "",
        CreatedBy: "",
        AssignedTo: "",
        LinkToWorker: "",
        Collaborators: "",
        NoteDate: "",
        IncidentStatus: "",
        TwentyfourHrSubmitted: false,
        isReportable: false,
        FiveHrSubmitted: false,
        EditNote: false,

    });
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, SetNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    const fetchAndSetClientNotesData = async () => {
        const data = await fetchClientIncidentData(ClientID);
        setClientIncidentData(data);
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

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );
            /* console.log(rolesData); */


            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            /* console.log(WriteData); */

            const ReadData = rolesData.filter((role) => role.ReadOnly === 1);
            /* console.log(ReadData); */

            const specificRead = WriteData.filter((role) => role.Menu_ID === 'm_cprofile' && role.ReadOnly === 0);
            console.log('Client_Profile Condition', specificRead);

            //If length 0 then No wite permission Only Read, thus set disableSection to true else false
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }

        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    }

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles();
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putClientIncidentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientIncidentData(await fetchClientIncidentData(ClientID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            Priority: "",
            Category: "",
            Note: "",
            CreatedOn: "",
            RemindOn: "",
            ClosedDate: "",
            CreatedBy: "",
            AssignedTo: "",
            LinkToWorker: "",
            Collaborators: "",
            NoteDate: "",
            IncidentStatus: "",
            TwentyfourHrSubmitted: false,
            isReportable: false,
            FiveHrSubmitted: false,
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
        <div className={styles.profileContainer}>
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
                    <div className="checkbox">
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
                        label="Assign To :"
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
                        id="LinkToWorker"
                        label="Link To Worker:"
                        value={selectedRowData.LinkToWorker}
                        type="select"
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={assignData.map((form) => ({
                            value: form.FirstName,
                            label: form.FirstName,
                        }))}
                    />
                    <InputField
                        id="Collaborators"
                        label="Collaborators:"
                        value={selectedRowData.Collaborators}
                        type="select"
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={assignData.map((form) => ({
                            value: form.FirstName,
                            label: form.FirstName,
                        }))}
                    />
                    <InputField
                        id="incidentStatus"
                        label="IncidentStatus:"
                        value={selectedRowData.IncidentStatus}
                        type="select"
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={[
                            {value: "Opne", label: "Open"},
                            {value: "Close", label: "Close"},
                        ]}
                    />
                    <InputField
                        id="NoteDate"
                        label="Note Date:"
                        value={selectedRowData.NoteDate}
                        disabled={disableSection}
                        type="date"
                        onChange={handleInputChange}
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
                    </div>
                    <div>
                    </div>
                    <div>
                        <Checkbox
                            id="isReportable"
                            checked={selectedRowData.isReportable}
                            onChange={handleInputChange}
                            disabled={disableSection}
                            name="checkbox"
                        />
                        is Reportable
                    </div>
                    <div>
                        <Checkbox
                            id="TwentyfourHrSubmitted"
                            checked={selectedRowData.TwentyfourHrSubmitted}
                            onChange={handleInputChange}
                            disabled={disableSection}
                            name="checkbox"
                        />
                        24-hour report submitted
                    </div>
                    <div>
                        <Checkbox
                            id="FiveHrSubmitted"
                            checked={selectedRowData.FiveHrSubmitted}
                            onChange={handleInputChange}
                            disabled={disableSection}
                            name="checkbox"
                        />
                        5-Day report submitted
                    </div>
                </Grid>
            </form>

            <div className={styles.spaceBetween}>
                <div>
                    <h4 style={{fontWeight: "600", marginBottom: "1rem"}}>
                        Incidents
                    </h4>
                </div>
                <div>
                    <MButton
                        style={{
                            backgroundColor: "blue",
                            padding: "5px 10px",
                        }}
                        label="Add Client Incident"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>

            </div>

            <MListingDataTable
                rows={clientIncidentData.data}
                rowSelected={handleSelectRowClick}
            />
        </div>
    );
};

export default UpdateIncident;
