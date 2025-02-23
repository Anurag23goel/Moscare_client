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

export const fetchLocProfRoomsData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfRoomDataById/${ClientID}`,
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

        return data;
    } catch (error) {
        console.error("Error fetching client document data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateRooms = ({
                         setClientDocumentData,
                         clientDocumentData,
                         setShowForm,
                         ClientID,
                     }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Description: "",
        Size: "",
        Capacity: "",
    });
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);

    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetClientDocumentData = async () => {
        const data = await fetchLocProfRoomsData(ClientID);
        /*     const documentOptions = await fetchData(
              "/api/getDocumentCategories",
              window.location.href
            );
            setDocumentOptions(documentOptions.data); */
        setClientDocumentData(data);
        setColumns(getColumns(data))

    };

    useEffect(() => {
        fetchAndSetClientDocumentData();
        fetchUserRoles('m_location_profile', "Maintainence_LocationProfile_Rooms", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfRoomData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientDocumentData(await fetchLocProfRoomsData(ClientID));
            addValidationMessage("Rooms updated successfully", "success");

            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Rooms data ", "error");

        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocProfRoomDataById",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientDocumentData(await fetchLocProfRoomsData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            Description: "",
            Size: "",
            Capacity: ""
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
            id: "Description",
            label: "Description",
            type: "text",
        },
        {
            id: "Size",
            label: "Size",
            type: "text",
        },
        {
            id: "Capacity",
            label: "Capacity",
            type: "text",
        },
    ];


    return (
        <Container className={`${styles.profileContainer} ${styles.MaintContainer}`}>
            <div className={styles.spaceBetween}>
                <SubHeader title={"Rooms"}/>
                <div>
                    <Button
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }} label="Add Location Profile Rooms"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>
            <AgGridDataTable
                rows={clientDocumentData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Room Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />
        </Container>
    );
};

export default UpdateRooms;
