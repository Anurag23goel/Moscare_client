import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import StatusBar from "@/components/widgets/StatusBar";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientFormData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientFormData/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching client form data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateForm = ({
                        setClientFormData,
                        clientFormData,
                        setShowForm,
                        ClientID,
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
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null); // storing the api status
    const [columns, setColumns] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);

    const fetchAndSetClientFormData = async () => {
        const data = await fetchClientFormData(ClientID);
        setClientFormData(data);
        setColumns(getColumns(data));
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
        fetchAndSetClientFormData();
        fetchUserRoles("m_cprofile", "Client_Profile_Form", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientFormData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setAlert(true);
            setStatus(data.success);
            setClientFormData(await fetchClientFormData(ClientID));
        } catch (error) {
            setAlert(true);
            setStatus(false);
            console.error("Error saving data:", error);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientFormData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientFormData(await fetchClientFormData(ClientID));
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

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prev) => ({...prev, [id]: value}));
    };

    const handleCheckBox = (event) => {
        const {checked} = event.target;
        setSelectedRowData((prevState) => ({
            ...prevState,
            Visibility: checked ? "Client" : "",
        }));
    };

    // Fields for EditModal
    const fields = [
        {
            id: "TemplateName",
            label: "Template Name:",
            type: "select",
            options: formOptions.map((form) => ({
                value: form.TemplateCategory,
                label: form.TemplateCategory,
            })),
        },
        {id: "FormName", label: "Form Name:", type: "text"},
        {
            id: "AssignTo",
            label: "Assign To:",
            type: "select",
            options: assignData.map((form) => ({
                value: form.FirstName,
                label: form.FirstName,
            })),
        },
        {
            id: "Status",
            label: "Status:",
            type: "select",
            options: [
                {value: "OPEN", label: "OPEN"},
                {value: "IN PROGRESS", label: "IN PROGRESS"},
                {
                    value: "COMPLETED",
                    label: "COMPLETED",
                },
                {value: "FOR REVIEW", label: "FOR REVIEW"},
                {value: "CLOSED", label: "CLOSED"},
            ],
        },
        {
            id: "CreationDate",
            label: "Creation Date:",
            type: "date",
        },
        {
            id: "ReviewDate",
            label: "Review Date:",
            type: "date"
        },

        {id: "Visibility", label: "Visibility to Client", type: "checkbox"},
    ];

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                {alert && (
                    <StatusBar
                        status={status}
                        setAlert={setAlert}
                        msg={
                            !status ? "Something went wrong" : "Profile Updated Successfully"
                        }
                    />
                )}


      <CustomAgGridDataTable2
         rows={clientFormData.data}
         title="Forms"
         primaryButton={{
           label: "Add Forms",
           icon: <PlusCircle className="h-4 w-4" />,
           onClick: () => setShowForm(true),
           disabled: disableSection,
         }}
         rowSelected={handleSelectRowClick}
         columns={columns.filter(
           (col) =>
             ![
               "Bucket",
               "File",
               "Folder",
               "CreationDate",
               "Visibility",
               "CreatedBy",
               "Template",
             ].includes(col.headerName)
         )}
          showEditButton={true}
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

export default UpdateForm;
