import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
// import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Container} from "react-bootstrap";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import styles from "@/styles/style.module.css";
import SubHeader from "@/components/widgets/SubHeader";
import Button from "@/components/widgets/MaterialButton";
import {ValidationContext} from "@/pages/_app";

export const fetchClientFormsData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfFormDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching client form data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateForms = ({
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
    const [showModal, setShowModal] = useState(false);
    const [assignData, setAssignData] = useState([]);
    const [formOptions, setFormOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetClientFormData = async () => {
        const data = await fetchClientFormsData(ClientID);
        setClientFormData(data);
        const formdata2 = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        const formdata = await fetchData("/api/getTemplateCategory",
            window.location.href);
        setFormOptions(formdata?.data);
        setAssignData(formdata2.data);
        setColumns(getColumns(data))
    };

    useEffect(() => {
        fetchAndSetClientFormData();
        fetchUserRoles('m_location_profile', "Maintainence_LocationProfile", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfFormData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientFormData(await fetchClientFormsData(ClientID));
            addValidationMessage("Form updated successfully", "success");

        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Form data ", "error");

        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocProfFormDataById",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientFormData(await fetchClientFormsData(ClientID));
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
    const handleCloseModal = () => setShowModal(false);

    // const handleInputChange = (event) => {
    //   const value =
    //     event.target.name === "checkbox"
    //       ? event.target.checked
    //       : event.target.value;

    //   setSelectedRowData((prevData) => ({
    //     ...prevData,
    //     [event.target.id]: value,
    //   }));
    // };

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const handleCheckBox = (event) => {
        const {checked} = event.target;
        setSelectedRowData((prevState) => ({
            ...prevState,
            Visibility: checked ? "Client" : "",
        }));
    };
    const modalFields = [
        {
            id: "TemplateName",
            label: "Template Name:",
            type: "select",
            options: formOptions.map((form) => ({
                value: form.TemplateCategory,
                label: form.TemplateCategory,
            })),
        },
        {
            id: "FormName",
            label: "Form Name:",
            type: "text",
        },
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
                {value: "COMPLETED", label: "COMPLETED"},
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
            type: "date",
        },

        {
            id: "Visibility",
            label: "Visibility to Client",
            type: "checkbox",
        },
    ];


    return (
        <Container className={`${styles.profileContainer} ${styles.MaintContainer}`}>
            <div className={styles.spaceBetween}>
                <SubHeader title={"Forms"}/>
                <div>
                    <Button
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }}
                        label="Add Location Profile Form"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>
            {/* <MListingDataTable
        rows={clientFormData.data}
        rowSelected={handleSelectRowClick}
      /> */}
            <AgGridDataTable
                rows={clientFormData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Form Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />
        </Container>
    );
};

export default UpdateForms;
