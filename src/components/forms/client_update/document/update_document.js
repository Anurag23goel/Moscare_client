import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
// import { setTime } from "react-datepicker/dist/date_utils";
import StatusBar from "@/components/widgets/StatusBar";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientDocumentData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientDocumentData/${ClientID}`,
            window.location.href
        );
        console.log("Fetched Document data:", data);

        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                VisibilityClient: item.VisibilityClient ? true : false,
                VisibilityWorker: item.VisibilityWorker ? true : false,
                Lock: item.Lock ? true : false,
            })),
        };

    // Extract columns dynamically (keys of the first item in data array)
    const columns = Object.keys(transformedData.data[0] || {}).map((key) => ({
      field: key,
      headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
    }));
    // columns.push({
    //   headerName: "Actions",
    //   width: 120,
    //   cellRenderer: (params) => (
    //     <div className="flex items-center justify-center gap-2">
    //       <button
    //         onClick={() => handleRowSelected(params.data)}
    //         className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
    //       >
    //         <Edit className="h-4 w-4" />
    //       </button>
    //       <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
    //         <MoreHorizontal className="h-4 w-4" />
    //       </button>
    //     </div>
    //   ),
    //   suppressMenu: true,
    //   sortable: false,
    //   filter: false,
    //   cellStyle: { display: "flex", justifyContent: "center" },
    // });
    console.log("Extracted columns:", columns);

        return {...transformedData, columns};
    } catch (error) {
        console.error("Error fetching client document data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateDocument = ({
                            setClientDocumentData,
                            clientDocumentData,
                            setShowForm,
                            ClientID,
                            errMsgs,
                            setErrMsgs
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Url: "",
        DocName: "",
        Category: "",
        Note: "",
        WrittenDate: "",
        VisibilityClient: false,
        VisibilityWorker: false,
        Lock: false,
    });
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);


    const fetchAndSetClientDocumentData = async () => {
        const data = await fetchClientDocumentData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setClientDocumentData(data.data);
        setColumns(data.columns);
    };

    useEffect(() => {
        fetchAndSetClientDocumentData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Document', setDisableSection);
        console.log("Col", columns)
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true)
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setAlert(true)
            setStatus(data.success)
            setClientDocumentData(await fetchClientDocumentData(ClientID));
            handleClearForm();
        } catch (error) {
            setAlert(true)
            setStatus(false)
            console.error("Error saving data:", error);
        }
        setShowModal(false)
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientDocumentData(await fetchClientDocumentData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            WrittenDate: "",
            VisibilityClient: false,
            VisibilityWorker: false,
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
        setSelectedRowData((prev) => ({...prev, [id]: value}));
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
        {id: "VisibilityClient", label: "Visibility to Client", type: "checkbox"},
        {id: "VisibilityWorker", label: "Visibility to Worker", type: "checkbox"},
        {id: "Lock", label: "Lock", type: "checkbox"},
    ];

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {alert && <StatusBar status={status} setAlert={setAlert}
                                     msg={!status ? "Something went wrong" : "Profile Updated Successfully"}/>}


                {/* <AgGridDataTable
        rows={clientDocumentData.data}
        columns={columns.filter(
          (col) =>
            ![
              'Bucket',
              'File',
              'Folder',
              'Lock'
            ].includes(col.headerName)
        )}
        rowSelected={handleSelectRowClick}
      /> */}

     <CustomAgGridDataTable2 
        title="Documents"
        primaryButton={{
          label: "Add Client Document",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          disabled: disableSection,
        }}
        rows={clientDocumentData.data}
        columns={columns.filter(
          (col) =>
            ![
              'Bucket',
              'File',
              'Folder',
              'Lock'
            ].includes(col.headerName)
        )}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
        />

                <EditModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    modalTitle="Edit Document Form"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                    errMsgs={errMsgs}
                />


            </div>
        </div>
    );
};

export default UpdateDocument;
