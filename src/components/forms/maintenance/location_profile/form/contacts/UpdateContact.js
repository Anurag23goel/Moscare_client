import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import SubHeader from "@/components/widgets/SubHeader";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";


export const fetchClientContactsData = async (ClientID) => {
    console.log("ClientId : ", ClientID)
    try {
        const data = await fetchData(
            `/api/getLocProfContactDataById/${ClientID}`,
            window.location.href
        );
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                IsPrimary: item.IsPrimary ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching client form data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateContacts = ({
                            setClientContactData,
                            clientContactData,
                            setShowForm,
                            ClientID,
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ID: "",
        Client: "",
        Title: "",
        FullName: "",
        ContactType: "",
        Organisation: "",
        Description: "",
        Address1: "",
        Suburb: "",
        PostCode: "",
        OtherContact: "",
        EmailPersonal: "",
        IsPrimary: false,
        PersonalContact: false,
        Position: "",
        Address2: "",
        State: "",
        Skype: "",
        EmailWork: "",
        Mobile: "",
    });
    const [contactType, setContactType] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const fetchAndSetClientContactData = async () => {
        const data = await fetchClientContactsData(ClientID);
        console.log("Client Contacts : ", data)
        const contacttype = await fetchData(
            "/api/getContactType",
            window.location.href
        );
        setContactType(contacttype.data);
        setColumns(getColumns(data))
        setClientContactData(data.data);
        setSelectedRowData(data.data[0])
    };


    useEffect(() => {
        fetchAndSetClientContactData();
        fetchUserRoles("m_location_profile", "Maintainence_LocationProfile_Conatcts", setDisableSection);
        console.log(disableSection)
    }, []);

    const handleSelectRowClick = async (row) => {
        console.log(row.ID);
        const data = await fetchData(
            `/api/getLocProfContactDataByIdRow/${row.ID}`,
            window.location.href
        );
        setShowModal(true);
        setSelectedRowData(data.data[0]);
    };

    const handleSave = async () => {
        console.log("Button Clicked")
        try {
            const data = await putData(
                "/api/putLocProfContactData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setClientContactData(await fetchClientContactsData(ClientID));
            addValidationMessage("Contact updated successfully", "success");

        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage("Failed to update Contact data ", "error");

        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocProfContactDataById",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientContactData(await fetchClientContactsData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Title: "",
            FullName: "",
            ContactType: "",
            Organisation: "",
            Description: "",
            Address1: "",
            Suburb: "",
            PostCode: "",
            OtherContact: "",
            EmailPersonal: "",
            IsPrimary: false,
            PersonalContact: false,
            Position: "",
            Address2: "",
            State: "",
            Skype: "",
            EmailWork: "",
            Mobile: "",
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
        {id: "Title", label: "Title", type: "text"},
        {
            id: "ContactType", label: "Contact Type", type: "select", options: contactType.map((form) => ({
                value: form.ContactType,
                label: form.ContactType,
            }))
        },
        {id: "FullName", label: "Full Name", type: "text"},
        {id: "Organisation", label: "Organisation", type: "text"},
        {id: "Position", label: "Position", type: "text"},
        {id: "Address1", label: "Address1", type: "text"},
        {id: "Address2", label: "Address2", type: "text"},
        {id: "Suburb", label: "Suburb", type: "text"},
        {id: "State", label: "State", type: "text"},
        {id: "PostCode", label: "Post Code", type: "text"},
        {id: "EmailPersonal", label: "Email Personal", type: "text"},
        {id: "EmailWork", label: "Email Work", type: "text"},
        {id: "Skype", label: "Skype", type: "text"},
        {id: "Mobile", label: "Mobile", type: "text"},
        {id: "OtherContact", label: "Other Contact", type: "text"},
        {id: "Description", label: "Description", type: "text"},
        {id: "IsPrimary", label: "IsPrimary", type: "checkbox"},
        {id: "PersonalContact", label: "Personal Contact", type: "checkbox"}
    ];


    return (
        <div style={{
            backgroundColor: "#f9f9f9",
            borderRadius: "15px",
            border: "1px solid",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "2rem",
            margin: "0 10px",
            width: "100%"
        }}>
            <div className={styles.spaceBetween}>
                <SubHeader title={"Contacts"}/>
                <div>
                    <MButton
                        sx={{
                            backgroundColor: "blue",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }}
                        label="Add Location Profile Contact"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />
                </div>
            </div>
            {/* <MListingDataTable
        rows={clientContactData.data}
        rowSelected={handleSelectRowClick}
      /> */}
            <AgGridDataTable
                rows={clientContactData.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
            <EditModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                modalTitle="Edit Contact Details"
                fields={modalFields}
                data={selectedRowData}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default UpdateContacts;
