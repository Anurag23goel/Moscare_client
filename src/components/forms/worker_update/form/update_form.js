import React, {useContext, useEffect, useState} from "react";
import StatusBar from "@/components/widgets/StatusBar";
import EditModal from "@/components/widgets/EditModal";
import {fetchData, fetchUserRoles} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {PlusCircle} from "lucide-react";


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


const UpdateForm = ({setWorkerFormData, workerFormData, WorkerID, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const [formOptions, setFormOptions] = useState([]);
    const [assignData, setAssignData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState(null);
    const [alert, setAlert] = useState(false);
    const [columns, setColumns] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    //const {colors} = useContext(ColorContext)

    const fetchAndSetWorkerFormData = async () => {
        const data = await fetchWorkerFormData(WorkerID);
        setColumns(data.columns)
        setWorkerFormData(data);
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
        fetchUserRoles("m_wprofile", "Worker_Profile_Form", setDisableSection);
    }, []);


    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
    };

    const handleSave = async () => {
        // Save the updated data logic
        console.log("Saving data:", selectedRowData);
        setShowModal(false);
        setAlert(true);
        setStatus(true); // Replace with actual save status
    };

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prev) => ({...prev, [id]: value}));
    };

    return (
        <>
            <div className="mt-4">
                {alert && (
                    <StatusBar
                        status={status}
                        setAlert={setAlert}
                        msg={!status ? "Something went wrong" : "Profile Updated Successfully"}
                    />
                )}

                {/* <SaveDelete saveOnClick={handleSave} /> */}
                <CustomAgGridDataTable

                    title="Form"
                    primaryButton={{
                        label: "Add Client Form",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}

                    rows={workerFormData.data}
                    rowSelected={handleSelectRowClick}
                    columns={columns}
                    showActionColumn={true}
                />
                <EditModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    modalTitle="Edit Worker Form"
                    fields={[
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
                        {id: "ReviewDate", label: "Review Date:", type: "date"},
                        {id: "Visibility", label: "Visibility to Worker", type: "checkbox"},
                    ]}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>


        </>
    );
};

export default UpdateForm;
