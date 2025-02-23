import React, {useCallback, useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateRoster, {fetchClientDocumentData,} from "@/components/forms/client_update/rosters/update_roster";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Roster = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Url: "",
        DocName: "",
        Category: "",
        Note: ""
    });

    const [clientDocumentData, setClientDocumentData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    const getCookieValue = (name) => {
        if (typeof document === 'undefined') {
            return null;
        }
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientDocumentData = useCallback(async () => {
        const data = await fetchClientDocumentData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data)
        setClientDocumentData(data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientDocumentData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Roster', setDisableSection);
    }, []);

    const handleSubmitDocument = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertClientDocumentData/${ClientID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Client Document added successfully");
                clearForm();
                fetchAndSetClientDocumentData();
            } else {
                setOutput("Failed to add client document");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client document");
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleInputChange = (event) => {
    //   const value =
    //     event.target.name === "checkbox"
    //       ? event.target.checked
    //       : event.target.value;

    //   setFormData((prevData) => ({
    //     ...prevData,
    //     [event.target.id]: value,
    //   }));
    // };

    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            WrittenDate: "",
            VisibilityClient: false,
            VisibilityWorker: false,
            Lock: false,
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
            id: "DayOfWeek",
            label: "Day of Week:",
            value: formData.DayOfWeek,
            type: "select",
            options: [
                {value: 'Monday', label: 'Monday'},
                {value: 'Tuesday', label: 'Tuesday'},
                {value: 'Wednesday', label: 'Wednesday'},
                {value: 'Thursday', label: 'Thursday'},
                {value: 'Friday', label: 'Friday'},
                {value: 'Saturday', label: 'Saturday'},
                {value: 'Sunday', label: 'Sunday'}
            ],
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "StartTime",
            label: "Start Time:",
            value: formData.StartTime,
            type: "datetime-local",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "FinishTime",
            label: "Finish Time:",
            value: formData.FinishTime,
            type: "datetime-local",
            onChange: handleInputChange,
            disabled: disableSection,
            options: documentOptions.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "FrequencyType",
            label: "Frequency Type:",
            value: formData.FrequencyType,
            type: "select",
            options: [
                {value: 'Weekly', label: 'Weekly'},
                {value: 'Monthly', label: 'Monthly'},
            ],
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "RepeatEvery",
            label: "Repeat Every:",
            value: formData.RepeatEvery,
            type: "number",
            onChange: handleInputChange,
            disabled: disableSection,
        },

        {
            id: "SupportWorker",
            label: "Support Worker:",
            value: formData.SupportWorker,
            type: "select",
            options: [
                {value: 'Weekly', label: 'Weekly'},
                {value: 'Monthly', label: 'Monthly'},
            ],
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "Category",
            label: "Category:",
            value: formData.Category,
            type: "select",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "ServiceItem",
            label: "Service Item:",
            value: formData.ServiceItem,
            type: "select",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "Agreement",
            label: "Agreement:",
            value: formData.Agreement,
            type: "select",
            options: [
                {value: 'Weekly', label: 'Weekly'},
                {value: 'Monthly', label: 'Monthly'},
            ],
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "ChargeRate",
            label: "Charge Rate:",
            value: formData.ChargeRate,
            type: "select",
            options: [
                {value: 'Weekly', label: 'Weekly'},
                {value: 'Monthly', label: 'Monthly'},
            ],
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "PayRate",
            label: "Pay Rate:",
            value: formData.PayRate,
            type: "select",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "DEXCase",
            label: "DEX Case:",
            value: formData.DEXCase,
            type: "select",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "DEXService",
            label: "DEX Service:",
            value: formData.DEXService,
            type: "select",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "InternalNote",
            label: "Internal Note:",
            value: formData.InternalNote,
            type: "textarea",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "RosterPublicNote",
            label: "Roster Public Note:",
            value: formData.RosterPublicNote,
            type: "textarea",
            onChange: handleInputChange,
            disabled: disableSection,
        },
        {
            id: "RosterPrivateNote",
            label: "Roster Private Note:",
            value: formData.RosterPrivateNote,
            type: "textarea",
            onChange: handleInputChange,
            disabled: disableSection,
        },
    ];


    return (
        <div style={{width: "100%"}}>
            <UpdateRoster
                clientDocumentData={clientDocumentData}
                setClientDocumentData={setClientDocumentData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />


            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitDocument(e)}
                modalTitle="Add Rosters"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Roster;
