import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import StatusBar from "@/components/widgets/StatusBar";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";


export const fetchWorkerNotesData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerNotesData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched worker notes:", data);
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
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null)
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [data, setData] = useState([])
    // const {colors} = useContext(ColorContext);


    const fetchAndSetWorkerNotesData = async () => {
        const data = await fetchWorkerNotesData(WorkerID);
        setData(data);
        setColumns(getColumns(data))

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
        console.log("WorkerNOtesDAta", workerNotesData)
        fetchUserRoles("m_wprofile", "Worker_Profile_Form", setDisableSection);
    }, []);


    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true)
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
            setAlert(true); // Show alert
            setStatus(data.success);
            setWorkerNotesData(await fetchWorkerNotesData(WorkerID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
            setAlert(true); // Show alert
            setStatus(false);
        }
        setShowModal(false)
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

    const handleInputChange = ({id, value}) => {
        // const { id, value } = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
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
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            options: notesCategory.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "AssignedTo",
            label: "Assigned To:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {id: "RemindOn", label: "Remind On:", type: "date"},
        {id: "Note", label: "Note:", type: "textarea"},
        {id: "EditNote", label: "Edit Note:", type: "checkbox"},
        {id: "Completed", label: "Mark note as Completed:", type: "checkbox"},
    ];


    return (
        <div className="mt-4">
            {alert && <StatusBar status={status} setAlert={setAlert}
                                 msg={!status ? "Something went wrong" : "Profile Updated Successfully"}/>}


            <CustomAgGridDataTable

                title="Notes"
                primaryButton={{
                    label: "Add Worker Notes",
                    icon: <PlusCircle className="h-4 w-4"/>,
                    onClick: () => setShowForm(true),
                    // disabled: disableSection,
                }}

                rows={data.data}
                rowSelected={handleSelectRowClick}
                columns={columns}
                showActionColumn={true}
            />

            <EditModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                modalTitle="Edit Note"
                fields={fields}
                data={selectedRowData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />


        </div>
    );
};

export default UpdateNotes;
