import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";

export const fetchClientDocumentData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientDocumentData/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);

        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                VisibilityClient: item.VisibilityClient ? true : false,
                VisibilityWorker: item.VisibilityWorker ? true : false,
                Lock: item.Lock ? true : false,
            })),
        };

        const columns = Object.keys(transformedData.data[0] || {}).map((key) => ({
            field: key,
            headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
        }));

        console.log("Extracted columns:", columns);

        return {...transformedData, columns};
    } catch (error) {
        console.error("Error fetching client Roster data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateRoster = ({
                          setClientDocumentData,
                          clientDocumentData,
                          setShowForm,
                          ClientID,
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
    const [columns, setColumns] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const userId = getCookieValue("User_ID");
    // const {colors} = useContext(ColorContext);
    /* console.log("User_ID", userId); */

    const fetchAndSetClientDocumentData = async () => {
        const data = await fetchClientDocumentData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setClientDocumentData(data);
        setColumns(data.columns);
    };

    useEffect(() => {
        fetchAndSetClientDocumentData();
        fetchUserRoles("m_cprofile", "Client_Profile_Roster", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientDocumentData(await fetchClientDocumentData(ClientID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
        setShowModal(false);
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
        setSelectedRowData((prev) => ({...prev, [id]: value}));
    };

    const fields = [
        {
            id: "DayOfWeek",
            label: "Day of Week:",
            value: selectedRowData.DayOfWeek,
            type: "select",
            options: [
                {value: "Monday", label: "Monday"},
                {value: "Tuesday", label: "Tuesday"},
                {value: "Wednesday", label: "Wednesday"},
                {value: "Thursday", label: "Thursday"},
                {value: "Friday", label: "Friday"},
                {value: "Saturday", label: "Saturday"},
                {value: "Sunday", label: "Sunday"},
            ],
        },
        {
            id: "StartTime",
            label: "Start Time:",
            value: selectedRowData.StartTime,
            type: "datetime-local",
        },
        {
            id: "FinishTime",
            label: "Finish Time:",
            value: selectedRowData.FinishTime,
            type: "datetime-local",
        },
        {
            id: "RepeatEvery",
            label: "Repeat Every:",
            value: selectedRowData.RepeatEvery,
            type: "number",
        },
        {
            id: "FrequencyType",
            label: "Frequency Type:",
            value: selectedRowData.FrequencyType,
            type: "select",
            options: [
                {value: "Weekly", label: "Weekly"},
                {value: "Monthly", label: "Monthly"},
            ],
        },
        {
            id: "SupportWorker",
            label: "Support Worker:",
            value: selectedRowData.SupportWorker,
            type: "select",
            options: [
                {value: "Weekly", label: "Weekly"},
                {value: "Monthly", label: "Monthly"},
            ],
        },
        {
            id: "Category",
            label: "Category:",
            value: selectedRowData.Category,
            type: "select",
        },
        {
            id: "ServiceItem",
            label: "Service Item:",
            value: selectedRowData.ServiceItem,
            type: "select",
        },
        {
            id: "Agreement",
            label: "Agreement:",
            value: selectedRowData.Agreement,
            type: "select",
            options: [
                {value: "Weekly", label: "Weekly"},
                {value: "Monthly", label: "Monthly"},
            ],
        },
        {
            id: "ChargeRate",
            label: "Charge Rate:",
            value: selectedRowData.ChargeRate,
            type: "select",
            options: [
                {value: "Weekly", label: "Weekly"},
                {value: "Monthly", label: "Monthly"},
            ],
        },
        {
            id: "PayRate",
            label: "Pay Rate:",
            value: selectedRowData.PayRate,
            type: "select",
        },
        {
            id: "DEXCase",
            label: "DEX Case:",
            value: selectedRowData.DEXCase,
            type: "select",
        },
        {
            id: "DEXService",
            label: "DEX Service:",
            value: selectedRowData.DEXService,
            type: "select",
        },
        {
            id: "InternalNote",
            label: "Internal Note:",
            value: selectedRowData.InternalNote,
            type: "textarea",
        },
        {
            id: "RosterPublicNote",
            label: "Roster Public Note:",
            value: selectedRowData.RosterPublicNote,
            type: "textarea",
        },
        {
            id: "RosterPrivateNote",
            label: "Roster Private Note:",
            value: selectedRowData.RosterPrivateNote,
            type: "textarea",
        },
    ];

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
     
    
        <CustomAgGridDataTable2
        title=" Roster Template"
        primaryButton={{
          label: "Create Roster Template",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          // disabled: disableSection,
        }}
        
        rows={clientDocumentData.data}
          rowSelected={handleSelectRowClick}
          columns={columns.filter(
            (col) =>
              !["Bucket", "File", "Folder", "Lock"].includes(col.headerName)
          )}
        showActionColumn={true}
        />
        

                <EditModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    modalTitle="Edit Roster Information"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateRoster;
