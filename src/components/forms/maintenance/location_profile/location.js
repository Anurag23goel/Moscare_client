import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import InfoOutput from "@/components/widgets/InfoOutput";
import {postData} from "@/utility/api_utility";
import UpdateLocation, {fetchLocationData,} from "@/components/forms/maintenance/location_profile/update_location";
import {analytics} from "../../../../config/firebaseConfig";
import {logEvent} from "firebase/analytics";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const australiaTimezones = [
    // Western Australia
    {value: 'Australia/Perth', label: 'Perth (AWST) UTC+8'},

    // Central Western Australia (unofficial)
    {value: 'Australia/Eucla', label: 'Eucla (ACWST) UTC+8:45'},

    // Northern Territory and Central Australia
    {value: 'Australia/Darwin', label: 'Darwin (ACST) UTC+9:30'},

    // South Australia
    {value: 'Australia/Adelaide', label: 'Adelaide (ACST) UTC+9:30'},

    // New South Wales (Broken Hill)
    {value: 'Australia/Broken_Hill', label: 'Broken Hill (ACST) UTC+9:30'},

    // Queensland
    {value: 'Australia/Brisbane', label: 'Brisbane (AEST) UTC+10'}, // No DST

    // New South Wales, Victoria, Australian Capital Territory, Tasmania
    {value: 'Australia/Sydney', label: 'Sydney (AEST) UTC+10 / (AEDT) UTC+11'},
    {value: 'Australia/Melbourne', label: 'Melbourne (AEST) UTC+10 / (AEDT) UTC+11'},
    {value: 'Australia/Hobart', label: 'Hobart (AEST) UTC+10 / (AEDT) UTC+11'},
    {value: 'Australia/Canberra', label: 'Canberra (AEST) UTC+10 / (AEDT) UTC+11'},

    // Lord Howe Island
    {value: 'Australia/Lord_Howe', label: 'Lord Howe Island (LHST) UTC+10:30 / (LHDT) UTC+11'},

    // Norfolk Island
    {value: 'Australia/Norfolk', label: 'Norfolk Island (NFT) UTC+11'},

    // Additional Regions (if necessary)
    // { value: 'Australia/Lindeman', label: 'Lindeman (AEST) UTC+10' },
];


const Location = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Code: "",
        Description: "",
        Timezone: "", // Added Timezone to form state
    });

    const [locationData, setLocationData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetLocationData = async () => {
            const data = await fetchLocationData();
            if (mounted) setLocationData(data);
        };
        fetchAndSetLocationData();
        return () => {
            mounted = false;
        };
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        console.log(`Field Changed - ${id}: ${value}`); // Debugging log
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        logEvent(analytics, "page_view", {
            form_name: "Location",
            event: "New Entry in LocationProfile",
        });

        console.log("Form Data Submitted:", form); // Log form data

        try {
            const response = await postData(
                "/api/postLocationProfileGeneralData",
                form,
                window.location.href
            );
            if (response.success) {
                setOutput("Location added successfully");
                clearForm();
                setShowForm(false);
                fetchLocationData().then((data) => setLocationData(data));
            } else {
                setOutput("Failed to add location");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding the location.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Code: "",
            Description: "",
            Timezone: "", // Reset Timezone field
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            type: "text",
            id: "Code",
            label: "Code",
            value: form.Code,
            onChange: handleChange,
        },
        {
            type: "text",
            id: "Description",
            label: "Description",
            value: form.Description,
            onChange: handleChange,
        },
        {
            type: "select", // New select input for Timezone
            id: "Timezone",
            label: "Timezone",
            value: form.Timezone,
            options: australiaTimezones, // Use the options array defined above
            onChange: handleChange,
        },
    ];

    return (
        <div>
            <UpdateLocation
                locationData={locationData}
                setLocationData={setLocationData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "1rem", zIndex: "5"}}>
                {/* Existing commented-out Modal code */}
            </div>
            <EditModal
                show={showForm}
                onClose={handleModalCancel} // Use handleModalCancel to reset form on close
                onSave={handleSubmit}
                modalTitle="Add New Location"
                fields={fields}
                data={form}
                onChange={handleChange}
                isSubmitting={isSubmitting} // Optional: Pass isSubmitting to disable save button
            />
            <InfoOutput output={output}/>
        </div>
    );
};

export default Location;
