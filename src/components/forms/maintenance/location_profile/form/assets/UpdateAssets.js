import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import Button from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import SubHeader from "@/components/widgets/SubHeader";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";

export const fetchLocProfAssetsData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfAssetsDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);

        return data;
    } catch (error) {
        console.error("Error fetching client notes data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateAssets = ({
                          setClientNotesData,
                          clientNotesData,
                          setShowForm,
                          ClientID,
                      }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Category: "",
        Item: "",
        Notes: "",
        Qty: "",
        ProvidedDate: "",
        ExpiryDate: "",
        ReturnedDate: "",
        SpecialNotes: "",
    });
    const [assignData, setAssignData] = useState([]);
    const [notesCategory, SetNotesCategory] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetClientNotesData = async () => {
        const data = await fetchLocProfAssetsData(ClientID);
        setClientNotesData(data);
        setColumns(getColumns(data))

    };

    useEffect(() => {
        fetchAndSetClientNotesData();
        fetchUserRoles("m_location_profile", "Maintainence_LocationProfile", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfAssetsData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientNotesData(await fetchLocProfAssetsData(ClientID));
            addValidationMessage("Assets updated successfully", "success");

            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Assets data ", "error");

        }
        setShowModal(false);
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            Category: "",
            Item: "",
            Notes: "",
            Qty: "",
            ProvidedDate: "",
            ExpiryDate: "",
            ReturnedDate: "",
            SpecialNotes: "",
        });
    };
    const handleCloseModal = () => setShowModal(false);

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const modalFields = [
        {
            id: "Category",
            label: "Category:",
            type: "select",
            options: [
                {value: "Epipen", label: "Epipen"},
                {value: "FirstAidKit", label: "First Aid Kit"},
                {value: "Ipad/Tablet", label: "Ipad/Tablet"},
                {value: "Laptop", label: "Laptop"},
                {value: "Uniform", label: "Uniform"},
            ],
        },
        {
            id: "Item",
            label: "Item:",
            type: "text",
        },
        {
            id: "Notes",
            label: "Notes:",
            type: "textarea",
        },
        {
            id: "Qty",
            label: "Qty:",
            type: "text",
        },
        {
            id: "ProvidedDate",
            label: "Provided Date:",
            type: "date",
        },
        {
            id: "ExpiryDate",
            label: "Expiry Date:",
            type: "date",
        },
        {
            id: "ReturnedDate",
            label: "Returned Date:",
            type: "date",
        },
        {
            id: "SpecialNotes",
            label: "Special Notes:",
            type: "textarea",
        },
    ];


    return (
        <div className={`${styles.profileContainer} ${styles.MaintContainer}`}>
            <div className={styles.spaceBetween}>
                <div>
                    <SubHeader title={"Assets"}/>
                </div>
                <div>
                    <Button
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }}
                        label="Add Location Profile Assets"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>
            {/* <MListingDataTable
        rows={clientNotesData.data}
        rowSelected={handleSelectRowClick}
      /> */}
            <AgGridDataTable
                rows={clientNotesData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Assets Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default UpdateAssets;
