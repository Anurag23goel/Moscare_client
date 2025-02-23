import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import StatusBar from "@/components/widgets/StatusBar";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientNotesData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientNotesData/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                TaskCompleted: item.TaskCompleted ? true : false,
                EditNote: item.EditNote ? true : false,
                NoteCompleted: item.NoteCompleted ? true : false,
                VisibleWorkerApp: item.VisibleWorkerApp ? true : false,
            })),
        };

        const columns = Object.keys(transformedData.data[0] || {}).map((key) => ({
            field: key,
            headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
        }));
       

        return {...transformedData, columns};
    } catch (error) {
        console.error("Error fetching client notes data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateNotes = ({
                         setClientNotesData,
                         clientNotesData,
                         setShowForm,
                         ClientID,
                     }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        NoteType: "",
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
        NoteCompleted: false,
        VisibleWorkerApp: false,
        TaskCompleted: false,
        EditNote: false,
    });
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, SetNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [caseManagers, setCaseManagers] = useState([]);
    const [columns, setColumns] = useState([])
    const [alert, setAlert] = useState(false)
    const [status, setStatus] = useState(null)
    const [showModal, setShowModal] = useState(false)
    // const {colors} = useContext(ColorContext);

    const fetchAndSetClientNotesData = async () => {
        const data = await fetchClientNotesData(ClientID);
        setClientNotesData(data);
        setColumns(data.columns)
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const caseManagersData1 = await fetchData(
            `/api/getUserByUserGroup/Team Lead`,
            window.location.href
        );
        const caseManagersData2 = await fetchData(
            `/api/getUserByUserGroup/Rostering Manager`,
            window.location.href
        );
        setCaseManagers([...caseManagersData1, ...caseManagersData2]);

        const notesOptions = await fetchData(
            "/api/getNoteCategories",
            window.location.href
        );
        SetNotesCategory(notesOptions.data);
        setAssignData(formdata2.data);
    };

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles("m_cprofile", "Client_Profile_Notes", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true)
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientNotesData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientNotesData(await fetchClientNotesData(ClientID));
            setAlert(true)
            setStatus(data.success)
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
            setStatus(false)
        }
        setShowModal(false)
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            NoteType: "",
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
            NoteCompleted: false,
            VisibleWorkerApp: false,
            TaskCompleted: false,
            EditNote: false,
        });
    };

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prev) => ({...prev, [id]: value}));
    };
    const fields = [
        {
            id: "Priority",
            label: "Priority:",
            type: "select",
            options: [
                {value: "Low", label: "Low"},
                {value: "Medium", label: "Medium"},
                {value: "High", label: "High"},
                {value: "Urgent", label: "Urgent"},
            ],
            value: selectedRowData.Priority,
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            options: notesCategory.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            value: selectedRowData.Category,
        },
        {
            id: "AssignedTo",
            label: "Assigned To:",
            type: "select",
            options: caseManagers.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
            value: selectedRowData.AssignedTo,
        },
        {
            id: "LinkToWorker",
            label: "Link To Worker:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
            value: selectedRowData.LinkToWorker,
        },
        {
            id: "Collaborators",
            label: "Collaborators:",
            type: "select",
            options: caseManagers.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
            value: selectedRowData.Collaborators,
        },
        {
            id: "NoteDate",
            label: "Note Date:",
            type: "date",
            value: selectedRowData.NoteDate,
        },
        {
            id: "RemindOn",
            label: "Remind On:",
            type: "date",
            value: selectedRowData.RemindOn,
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
            value: selectedRowData.Note,
            disabled: !selectedRowData.EditNote || disableSection,
        },
        // {
        //     id: "EditNote",
        //     label: "Edit Note",
        //     type: "checkbox",
        //     checked: selectedRowData.EditNote,
        // },
        {
            id: "VisibleWorkerApp",
            label: "Visible to Worker",
            type: "checkbox",
            checked: selectedRowData.VisibleWorkerApp,
        },
        {
            id: "NoteCompleted",
            label: "Mark note as Completed",
            type: "checkbox",
            checked: selectedRowData.NoteCompleted,
        },
        {
            id: "TaskCompleted",
            label: "Mark task as Completed",
            type: "checkbox",
            checked: selectedRowData.TaskCompleted,
        },
    ];

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                {
                    alert
                    &&
                    <StatusBar status={status} setAlert={setAlert} msg="Data updated successfully"/>
                }


<CustomAgGridDataTable2 
        title="Notes"
        primaryButton={{
          label: "Add Client Notes",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          // disabled: disableSection,
        }}
     
        rows={clientNotesData.data}
        columns={columns}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
        />

                <EditModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    modalTitle="Edit  Form"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateNotes;
