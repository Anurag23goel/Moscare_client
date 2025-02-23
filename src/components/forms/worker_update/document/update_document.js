import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";

export const fetchWorkerDocumentData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerDocumentData/${WorkerID}`,
            window.location.href
        );

        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Visibility: item.Visibility ? true : false,
                Lock: item.Lock ? true : false,
            })),
        };

        console.log("fetchWorkerDocumentData : ", data)

        return transformedData;
    } catch (error) {
        console.error("Error fetching worker document data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateDocument = ({
                            setWorkerDocumentData,
                            workerDocumentData,
                            setShowForm,
                            WorkerID,
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        Url: "",
        DocName: "",
        Category: "",
        Note: "",
        WrittenDate: "",
        Visibility: false,
        Lock: false,
    });
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false)
    // const {colors} = useContext(ColorContext);
    const [errMsgs, setErrMsgs] = useState([])

    const fetchAndSetWorkerDocumentData = async () => {
        const data = await fetchWorkerDocumentData(WorkerID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setWorkerDocumentData(data);
        setColumns(getColumns(data))
    };

    useEffect(() => {
        fetchAndSetWorkerDocumentData();
        fetchUserRoles("m_wprofile", "Worker_Profile_Document", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true)
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerDocumentData(await fetchWorkerDocumentData(WorkerID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
        setShowModal(false)
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerDocumentData(await fetchWorkerDocumentData(WorkerID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            WorkerID: WorkerID,
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            WrittenDate: "",
            Visibility: false,
            Lock: false,
        });
    };

    const handleInputChange = ({id, value}) => {
        const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,}([\/?].*)?$/i;

        setErrMsgs((prevMsgs) => {
            const newErrMsgs = {...prevMsgs};

            // Check if the field is empty or invalid URL
            if (id === "Url" && value && !urlRegex.test(value)) {
                // Add error message for invalid URL
                newErrMsgs[id] = `Invalid ${id}. Please enter a valid value.`;
            } else if (value === "") {
                // Remove error message if the field is empty
                delete newErrMsgs[id];
            } else {
                // Remove error message if URL validation passes
                delete newErrMsgs[id];
            }

            return newErrMsgs;
        });


        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const fields = [
        {id: "Url", label: "URL:", type: "text"},
        {id: "DocName", label: "Document Name:", type: "text"},
        {
            id: "Category",
            label: "Category:",
            type: "select",
            options: documentOptions.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {id: "WrittenDate", label: "Written Date:", type: "date"},
        {id: "Note", label: "Note:", type: "textarea"},
        {id: "Visibility", label: "Visibility to Worker:", type: "checkbox"},
        {id: "Lock", label: "Lock:", type: "checkbox"},
    ];

    useEffect(() => {
        console.log("workerDocumentData: ", workerDocumentData)
    }, [workerDocumentData])

    return (
        <div className="mt-4">


            <CustomAgGridDataTable

                title="Document"
                primaryButton={{
                    label: "Add Worker Document",
                    icon: <PlusCircle className="h-4 w-4"/>,
                    onClick: () => setShowForm(true),
                    // disabled: disableSection,
                }}

                rows={workerDocumentData.data}
                rowSelected={handleSelectRowClick}
                columns={columns}
                showActionColumn={true}
            />

            <EditModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                modalTitle="Edit Document"
                fields={fields}
                data={selectedRowData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
                errMsgs={errMsgs}
            />


        </div>
    );
};

export default UpdateDocument;
