import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateAddress, {fetchClientAddressData,} from "@/components/forms/client_update/address/update_address";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';


Modal.setAppElement("#__next");

const Address = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        UnitNo: "",
        StreetNo: "",
        AddressLine1: "",
        AddressLine2: "",
        Suburb: "",
        State: "",
        Postcode: "",
        GeneralNotes: "",
        IdentifiedRisks: "",
    });
    const [clientAddressData, setClientAddressData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    const [validationMessages, setValidationMessages] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredSuburbs, setFilteredSuburbs] = useState([]);
    const [errMsgs, setErrMsgs] = useState({});


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


    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientAddressData = useCallback(async () => {
        const data = await fetchClientAddressData(ClientID);
        setClientAddressData(data);
    }, [ClientID]);


    useEffect(() => {
        fetchAndSetClientAddressData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Address', setDisableSection);
    }, []);

    const handleSubmitForm = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertClientAddressData/${ClientID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                addValidationMessage("Client Address added successfully.", "success");
                clearForm();
                fetchAndSetClientAddressData();
            } else {
                setOutput("Failed to add client form");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage(`Error adding client address: ${error.message}`, "error");
        } finally {
            setIsSubmitting(false);
        }
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

    const handleInputChange = ({id, value}) => {
        const validators = {
            Postcode: /^\d{4}$/, // AU (4 digits) and NZ postcodes (4 digits)
        };
        setErrMsgs((prevMsgs) => {
            const newErrMsgs = {...prevMsgs};

            // Check if the field is empty
            if (value === "") {
                // Remove error message if the field is empty
                delete newErrMsgs[id];
            } else if (validators[id] && !validators[id].test(value)) {
                // Add error message for invalid input
                newErrMsgs[id] = `Invalid ${id}. Please enter a valid value.`;
            } else {
                // Remove error message if validation passes
                delete newErrMsgs[id];
            }

            return newErrMsgs;
        });
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

            setFormData((prevState) => ({
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

            setFormData((prevState) => ({
                ...prevState,
                Suburb: value, // Ensure the value from the input is updated in the form state
            }));
        }
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            UnitNo: "",
            StreetNo: "",
            AddressLine1: "",
            AddressLine2: "",
            Suburb: "",
            State: "",
            Postcode: "",
            GeneralNotes: "",
            IdentifiedRisks: "",
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const fields = [
        {
            id: "UnitNo",
            label: "UnitNo:",
            type: "number",
            disabled: disableSection,
        },
        {
            id: "StreetNo",
            label: "StreetNo:",
            type: "number",
            disabled: disableSection,
        },
        {
            id: "AddressLine1",
            label: "AddressLine1:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "AddressLine2",
            label: "AddressLine2:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "Suburb",
            label: "Suburb:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "State",
            label: "State:",
            type: "text",
            disabled: disableSection,
        },
        {
            id: "Postcode",
            label: "Postcode:",
            type: "number",
            disabled: disableSection,
        },
        {
            id: "GeneralNotes",
            label: "GeneralNotes:",
            type: "textarea",
            disabled: disableSection,
        },
        {
            id: "IdentifiedRisks",
            label: "IdentifiedRisks:",
            type: "textarea",
            disabled: disableSection,
        },
    ];


    return (
        <>
            <ValidationBar
                messages={validationMessages}
                onClose={handleCloseMessage}
            />
            <div style={{width: "100%"}}>

                <UpdateAddress
                    states={states}
                    allSuburbs={allSuburbs}
                    filteredStates={filteredStates}
                    setFilteredStates={setFilteredStates}
                    filteredSuburbs={filteredSuburbs}
                    setFilteredSuburbs={setFilteredSuburbs}
                    clientAddressData={clientAddressData}
                    setClientAddressData={setClientAddressData}
                    setShowForm={setShowForm}
                    ClientID={ClientID}
                />

                <EditModal
                    show={showForm}
                    onClose={() => setShowForm(false)}
                    onSave={(e) => handleSubmitForm(e)}
                    modalTitle="Add Client Address"
                    fields={fields}
                    data={formData || {}} // Pass selectedRowData with fallback to an empty object
                    onChange={handleInputChange}
                    filteredStates={filteredStates || []}
                    setFilteredStates={setFilteredStates || []}
                    filteredSuburbs={filteredSuburbs || []}
                    setFilteredSuburbs={setFilteredSuburbs || []}
                    errMsgs={errMsgs}
                />
            </div>
        </>

    );
};

export default Address;
