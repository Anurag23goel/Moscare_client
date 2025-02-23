import React, {useCallback, useContext, useEffect, useState} from "react";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";
import {deleteData, fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import ValidationBar from "@/components/widgets/ValidationBar";
import { v4 as uuidv4 } from 'uuid';
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientContactData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientContactData/${ClientID}`,
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

const UpdateContact = ({
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
    // const {colors} = useContext(ColorContext);
    const [showModal, setShowModal] = useState(false);
    const [validationMessages, setValidationMessages] = useState([]);
    const [errMsgs, setErrMsgs] = useState({});
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredSuburbs, setFilteredSuburbs] = useState([]);

    const addValidationMessage = useCallback((content, type = 'info') => {
        const id = uuidv4();
        setValidationMessages(prev => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages(prev => prev.filter(msg => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const fetchAndSetClientContactData = async () => {
        const data = await fetchClientContactData(ClientID);
        const contacttype = await fetchData(
            "/api/getContactType",
            window.location.href
        );
        setContactType(contacttype.data);
        console.log(data);
        setClientContactData(data);
    };

    useEffect(() => {
        fetchAndSetClientContactData();
        fetchUserRoles(
            "m_cprofile",
            "Client_Profile_Contact",
            setDisableSection
        );
    }, []);

    const handleSelectRowClick = async (row) => {
        console.log(row.ID);
        const data = await fetchData(
            `/api/getClientContactDataByIdRow/${row.ID}`,
            window.location.href
        );
        setSelectedRowData(data.data[0]);
        setShowModal(true);
    };

    const states = [
        "New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia",
        "Tasmania", "Australian Capital Territory", "Northern Territory", "Auckland", "Wellington",
        "Canterbury", "Waikato", "Otago", "Bay of Plenty", "Manawatu-Wanganui", "Hawke's Bay",
        "Taranaki", "Northland", "Nelson", "Marlborough", "Southland"
    ];
    const allSuburbs = [
        "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
        "Hobart", "Canberra", "Darwin", "Gold Coast", "Newcastle",
        "Wollongong", "Geelong", "Cairns", "Townsville", "Ballarat",
        "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
        "Napier-Hastings", "Dunedin", "Palmerston North", "Rotorua", "New Plymouth",
        "Whangarei", "Invercargill", "Nelson", "Whanganui", "Timaru"
    ];


    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientContactData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            // setAlert(true);
            // setStatus(data.success);
            addValidationMessage("Client Contact updated successfully.", "success");
            setClientContactData(await fetchClientContactData(ClientID));
        } catch (error) {
            //  setAlert(true);
            //  setStatus(false);
            addValidationMessage(`Error updating client contact: ${error.message}`, "error");
            console.error("Error saving data:", error);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientContactData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientContactData(await fetchClientContactData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
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
    };

    const handleInputChange = ({id, value}) => {
        // Define regex patterns for validation

        const validators = {
            EmailPersonal: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // General email validation
            EmailWork: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // General email validation
            Mobile: /^(?:\+?61|0)4\d{8}$|^(?:\+?64|0)2\d{7,9}$/, // AU (+61) and NZ (+64) mobile numbers
            OtherContact: /^(?:\+?61|0)4\d{8}$|^(?:\+?64|0)2\d{7,9}$/, // AU (+61) and NZ (+64) mobile numbers
            PostCode: /^\d{4}$/, // AU (4 digits) and NZ postcodes (4 digits)
        };

        // Logic for handling the state search
        if (id === "State") {
            const searchTerm = value.toLowerCase().trim(); // User's input
            console.log("search term: " + searchTerm)
            if (searchTerm === "") {
                // If no input, clear filtered states
                setFilteredStates([]);
            } else {
                // Filter states based on search term
                const filteredStates = states.filter((state) =>
                    state.toLowerCase().includes(searchTerm) // Case-insensitive search
                );
                setFilteredStates(filteredStates); // Update filtered states list
            }

            setSelectedRowData((prevState) => ({
                ...prevState,
                State: value, // Ensure the value from the input is updated in the state
            }));
        }

        if (id === "Suburb") {
            const searchTerm = value.toLowerCase().trim(); // User's input
            console.log("search term: " + searchTerm);

            if (searchTerm === "") {
                // If no input, clear filtered suburbs
                setFilteredSuburbs([]);
            } else {
                // Filter merged suburbs based on search term
                const filteredSuburbsList = allSuburbs.filter((suburb) =>
                    suburb.toLowerCase().includes(searchTerm) // Case-insensitive search
                );
                setFilteredSuburbs(filteredSuburbsList); // Update filtered suburbs list
            }

            setSelectedRowData((prevState) => ({
                ...prevState,
                Suburb: value, // Ensure the value from the input is updated in the form state
            }));
        }

        setErrMsgs((prevMsgs) => {
            const newErrMsgs = {...prevMsgs};

            // Check if the field is empty
            if (value === "") {
                // Remove error message if the field is empty
                delete newErrMsgs[id];
            } else if (validators[id] && !validators[id].test(value)) {
                // Add error message for invalid input
                newErrMsgs[id] = `Invalid ${id}`;
            } else {
                // Remove error message if validation passes
                delete newErrMsgs[id];
            }

            return newErrMsgs;
        });

        // Update state with the new value (even if empty)
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };


    useEffect(() => {
        console.log("errMsgs : ", errMsgs)
    }, [errMsgs])
    const fields = [
        {id: "Title", label: "Title:", type: "text"},
        {
            id: "ContactType",
            label: "Contact Type:",
            type: "select",
            options: contactType.map((form) => ({
                value: form.ContactType,
                label: form.ContactType,
            })),
        },
        {id: "FullName", label: "Full Name:", type: "text"},
        {id: "Organisation", label: "Organisation:", type: "text"},
        {id: "Position", label: "Position:", type: "text"},
        {id: "Address1", label: "Address1:", type: "text"},
        {id: "Address2", label: "Address2:", type: "text"},
        {id: "Suburb", label: "Suburb:", type: "text"},
        {id: "State", label: "State:", type: "text"},
        {id: "PostCode", label: "Post Code:", type: "number"},
        {id: "EmailPersonal", label: "Email Personal:", type: "email"},
        {id: "EmailWork", label: "Email Work:", type: "email"},
        {id: "Skype", label: "Skype:", type: "text"},
        {id: "Mobile", label: "Mobile:", type: "number"},
        {id: "OtherContact", label: "Other Contact:", type: "number"},
        {id: "Description", label: "Description:", type: "textarea"},
        {id: "IsPrimary", label: "Is Primary", type: "checkbox"},
        {id: "PersonalContact", label: "Personal Contact", type: "checkbox"},
    ];

    return (
        <>
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                    <ValidationBar
                        messages={validationMessages}
                        onClose={handleCloseMessage}
                    />

   
<CustomAgGridDataTable2 
        title="Client Contact"
        primaryButton={{
          label: "Add Client Contact",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          disabled: disableSection,
        }}
        rows={clientContactData.data}
        columns={[
          { field: "ID", headerName: "ID" },
          { field: "ClientID", headerName: "Client Id" },
          { field: "Title", headerName: "Title" },
          { field: "FullName", headerName: "Full Name" },
          { field: "ContactType", headerName: "Contact Type" },
          {
            field: "IsPrimary",
            headerName: "Is Primary",
            valueGetter: (params) => (params.data.IsPrimary ? "1" : "0"), // Convert boolean to "1" or "0"
            cellRenderer: (params) => params.value, // Render value as string (1 or 0)
            cellStyle: { textAlign: "center" }, // Optional: center-align the values
          },
        ]}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
         />
        <EditModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          modalTitle="Edit Client Contact"
          fields={fields}
          data={selectedRowData}
          onChange={handleInputChange}
          errMsgs={errMsgs}
          filteredStates = {filteredStates || []}
          setFilteredStates = {setFilteredStates || []}
          filteredSuburbs = {filteredSuburbs || []}
          setFilteredSuburbs = {setFilteredSuburbs || []}
        />
      </div>
      
      </div>
    </>
  );
};

export default UpdateContact;
