import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import Button from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Container} from 'react-bootstrap';
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import SubHeader from "@/components/widgets/SubHeader";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";

export const fetchClientDocumentsData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfDocumentDataById/${ClientID}`,
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

        return transformedData;
    } catch (error) {
        console.error("Error fetching client document data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateDocuments = ({
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
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);


    const fetchAndSetClientDocumentData = async () => {
        const data = await fetchClientDocumentsData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setClientDocumentData(data);
        setColumns(getColumns(data))

    };

    useEffect(() => {
        fetchAndSetClientDocumentData();
        fetchUserRoles('m_location_profile', "Maintainence_LocationProfile_Document", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientDocumentData(await fetchClientDocumentsData(ClientID));
            addValidationMessage("Document updated successfully", "success");

            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Document data ", "error");

        }
        setShowModal(false);

    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocProfDocumentDataById",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientDocumentData(await fetchClientDocumentsData(ClientID));
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
    const modalFields = [
        {
            id: "Url",
            label: "URL:",
            type: "text",
            value: selectedRowData.Url,
            disabled: disableSection,
        },
        {
            id: "DocName",
            label: "Document Name:",
            type: "text",
            value: selectedRowData.DocName,
            disabled: disableSection,
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            value: selectedRowData.Category,
            disabled: disableSection,
            options: documentOptions.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "WrittenDate",
            label: "Written Date:",
            type: "date",
            value: selectedRowData.WrittenDate,
            disabled: disableSection,
        },
        {
            id: "Note",
            label: "Note:",
            type: "textarea",
            value: selectedRowData.Note,
            disabled: disableSection,
        },
        {
            id: "VisibilityClient",
            label: "Visibility to Client",
            type: "checkbox",
            checked: selectedRowData.VisibilityClient,
            disabled: disableSection,
        },
        {
            id: "VisibilityWorker",
            label: "Visibility to Worker",
            type: "checkbox",
            checked: selectedRowData.VisibilityWorker,
            disabled: disableSection,
        },
        {
            id: "Lock",
            label: "Lock",
            type: "checkbox",
            checked: selectedRowData.Lock,
            disabled: disableSection,
        },
    ];
    return (
        <Container className={`${styles.profileContainer} ${styles.MaintContainer}`}>
            <div className={styles.spaceBetween}>
                <SubHeader title={"Documents"}/>
                <div>
                    <Button
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }} label="Add Location Profile Document"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>
            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Document Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />

            <AgGridDataTable
                rows={clientDocumentData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
        </Container>
    );
};

export default UpdateDocuments;
