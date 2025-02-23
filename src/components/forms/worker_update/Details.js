import React, {useEffect, useState} from "react";
import {Checkbox, TextField} from "@mui/material";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/worker/detailsSlice";
import {useRouter} from "next/router";
import StatusBar from "@/components/widgets/StatusBar";
import styles from "@/styles/style.module.css";

function Details({
                     setDetailsEdit,
                     setSelectedComponent,
                     onTabChange,
                     onSaveReady,
                     isButtonClicked,
                     setIsButtonClicked,
                 }) {
    const router = useRouter();
    const {WorkerID} = router.query;
    const dispatch = useDispatch();
    const defaultDetailsForm = useSelector(
        (state) => state.workerdetails.detailsForm
    );
    // const {colors, loading} = useContext(ColorContext);
    const [modal, setModal] = useState(false);
    const [prompt, setPrompt] = useState(false);
    const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);
    const [disableSection, setDisableSection] = useState(false);
    const [alert, setAlert] = useState(false)
    const [status, setStatus] = useState(null)
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredSuburbs, setFilteredSuburbs] = useState([]);
    const [errMsgs, setErrMsgs] = useState({});
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleModalCancel = () => {
        setModal(false);
    };

    const handleTabChange = (tab) => {
        setSelectedTabGen(tab);
        onTabChange(tab); // Notify parent of active tab
    };

    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for Details...");
            onSaveReady("Details", handleSaveButton()); // Register handleSaveButton for Profile

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

    // If their is any value in db table then it return that else it will written default value
    const mergeDetailsData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] == "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchDataAsync = async () => {
        try {
            // Launch all fetch requests simultaneously using Promise.all
            const [
                generalDetails,
                nextKin,
                covid19,
                vehicleInfo,
                ndis,
                employment,
                otherdetails
            ] = await Promise.all([
                fetchData(`/api/getWorkerGeneralDetailsData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerNextKinData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerCovidReqData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerVehicleInfoData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerNdisData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerEmploymentData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerOtherDetailsData/${WorkerID}`, window.location.href)
            ]);

            const fetchedDetailsForm = {
                // general data
                addressLine1: generalDetails.data[0]?.AddressLine1,
                addressLine2: generalDetails.data[0]?.AddressLine2,
                suburb: generalDetails.data[0]?.Suburb,
                state: generalDetails.data[0]?.State,
                postCode: generalDetails.data[0]?.Postcode,
                lgbtiqa: generalDetails.data[0]?.Lgbtiqa,
                cald: generalDetails.data[0]?.Cald,
                aboriginal: generalDetails.data[0]?.Aboriginal,
                torresStraitIslander: generalDetails.data[0]?.TorresStraitIslander,
                atsIslander: generalDetails.data[0]?.ATSIslander,
                ethnicity: generalDetails.data[0]?.Ethnicity,
                languages: generalDetails.data[0]?.Languages,
                cultures: generalDetails.data[0]?.Cultures,
                interests: generalDetails.data[0]?.Interests,
                marital: generalDetails.data[0]?.Marital,
                website: generalDetails.data[0]?.Website,
                isSmoker: generalDetails.data[0]?.IsSmoker,
                petFriendly: generalDetails.data[0]?.PetFriendly,
                workingwithChildren: generalDetails.data[0]?.WorkingwithChildren,
                rosterConflictExempt: generalDetails.data[0]?.RosterConflictExempt,
                restrictions: generalDetails.data[0]?.Restrictions,
                allergies: generalDetails.data[0]?.Allergies,
                medicalConditions: generalDetails.data[0]?.MedicalConditions,
                injuries: generalDetails.data[0]?.Injuries,

                // nextkin data
                name_1: nextKin.data[0]?.Name_1,
                relation_1: nextKin.data[0]?.Relation_1,
                phone_1: nextKin.data[0]?.Phone_1,
                phone2_1: nextKin.data[0]?.Phone2_1,
                email_1: nextKin.data[0]?.Email_1,
                address_1: nextKin.data[0]?.Address_1,
                emergencyContact_1: nextKin.data[0]?.EmergencyContact_1,
                name_2: nextKin.data[0]?.Name_2,
                relation_2: nextKin.data[0]?.Relation_2,
                phone_2: nextKin.data[0]?.Phone_2,
                phone2_2: nextKin.data[0]?.Phone2_2,
                email_2: nextKin.data[0]?.Email_2,
                address_2: nextKin.data[0]?.Address_2,
                emergencyContact_2: nextKin.data[0]?.EmergencyContact_2,

                // covid19
                exemption: covid19.data[0]?.Exemption,
                reportedtoMac1: covid19.data[0]?.ReportedtoMac1,
                covidVaccine1: covid19.data[0]?.CovidVaccine1,
                reportedtoMac2: covid19.data[0]?.ReportedtoMac2,
                covidVaccine2: covid19.data[0]?.CovidVaccine2,
                reportedtoMac3: covid19.data[0]?.ReportedtoMac3,
                booster: covid19.data[0]?.Booster,
                reportedtoMac4: covid19.data[0]?.ReportedtoMac4,
                inIsolation: covid19.data[0]?.InIsolation,
                isolationStart: covid19.data[0]?.IsolationStart,
                isolationEnd: covid19.data[0]?.IsolationEnd,

                // vehicle
                insurancePolicy: vehicleInfo.data[0]?.InsurancePolicy,
                insuranceType: vehicleInfo.data[0]?.InsuranceType,
                vehicleRegistration: vehicleInfo.data[0]?.VehicleRegistration,
                reviewNotes: vehicleInfo.data[0]?.ReviewNotes,
                vehicleMake: vehicleInfo.data[0]?.VehicleMake,
                vehicleModel: vehicleInfo.data[0]?.VehicleModel,
                vehicleYear: vehicleInfo.data[0]?.VehicleYear,
                vehicleType: vehicleInfo.data[0]?.VehicleType,
                vehicleBodyType: vehicleInfo.data[0]?.VehicleBodyType,
                driversLicence: vehicleInfo.data[0]?.DriversLicence,
                driversLicenceNumber: vehicleInfo.data[0]?.DriversLicenceNumber,
                restrictions: vehicleInfo.data[0]?.Restrictions,

                // ndis
                ndisClearance: ndis.data[0]?.NdisClearance,
                screenCheckApplNo: ndis.data[0]?.ScreenCheckApplNo,
                screenCheckNo: ndis.data[0]?.ScreenCheckNo,
                screenCheckOutcome: ndis.data[0]?.ScreenCheckOutcome,
                clearanceDecision: ndis.data[0]?.ClearanceDecision,
                outcomeExpiryDate: ndis.data[0]?.OutcomeExpiryDate,
                subParagraph: ndis.data[0]?.SubParagraph,

                // employment
                oneOffShifts: employment.data[0]?.OneOffShifts,
                otherEmployment: employment.data[0]?.OtherEmployment,
                secondaryEmployment: employment.data[0]?.SecondaryEmployment,
                contactPhone: employment.data[0]?.ContactPhone,
                contactEmail: employment.data[0]?.ContactEmail,

                // other details
                comments: otherdetails.data[0]?.Comments,
                descriptions: otherdetails.data[0]?.Descriptions,
                workerHeaderNote: otherdetails.data[0]?.WorkerHeaderNote,
                noteAlert: otherdetails.data[0]?.NoteAlert,
            };

            const mergedDetailsForm = mergeDetailsData(
                defaultDetailsForm,
                fetchedDetailsForm
            );

            setDetailsForm(mergedDetailsForm); // stores merged value
        } catch (error) {
            console.error("Error fetching data:", error);
            // Handle error appropriately
        }
    };

    const handleSaveButton = () => {
        console.log("Details form:", detailsForm);

        // detailsForm
        const data1 = {
            AddressLine1: detailsForm.addressLine1,
            AddressLine2: detailsForm.addressLine2,
            Suburb: detailsForm.suburb,
            State: detailsForm.state,
            Postcode: detailsForm.postCode,
            Lgbtiqa: detailsForm.lgbtiqa,
            Cald: detailsForm.cald,
            Aboriginal: detailsForm.aboriginal,
            TorresStraitIslander: detailsForm.torresStraitIslander,
            ATSIslander: detailsForm.atsIslander,
            Ethnicity: detailsForm.ethnicity,
            Languages: detailsForm.languages,
            Cultures: detailsForm.cultures,
            Interests: detailsForm.interests,
            Marital: detailsForm.marital,
            Website: detailsForm.website,
            IsSmoker: detailsForm.isSmoker,
            PetFriendly: detailsForm.petFriendly,
            WorkingwithChildren: detailsForm.workingwithChildren,
            RosterConflictExempt: detailsForm.rosterConflictExempt,
            Restrictions: detailsForm.restrictions,
            Allergies: detailsForm.allergies,
            MedicalConditions: detailsForm.medicalConditions,
            Injuries: detailsForm.injuries,
        };

        //nexkin
        const data2 = {
            Name_1: detailsForm.name_1,
            Relation_1: detailsForm.relation_1,
            Phone_1: detailsForm.phone_1,
            Phone2_1: detailsForm.phone2_1,
            Email_1: detailsForm.email_1,
            Address_1: detailsForm.address_1,
            EmergencyContact_1: detailsForm.emergencyContact_1,
            Name_2: detailsForm.name_2,
            Relation_2: detailsForm.relation_2,
            Phone_2: detailsForm.phone_2,
            Phone2_2: detailsForm.phone2_2,
            Email_2: detailsForm.email_2,
            Address_2: detailsForm.address_2,
            EmergencyContact_2: detailsForm.emergencyContact_2,
        };

        // covid19
        const data3 = {
            Exemption: detailsForm.exemption,
            ReportedtoMac1: detailsForm.reportedtoMac1,
            CovidVaccine1: detailsForm.covidVaccine1,
            ReportedtoMac2: detailsForm.reportedtoMac2,
            CovidVaccine2: detailsForm.covidVaccine2,
            ReportedtoMac3: detailsForm.reportedtoMac3,
            Booster: detailsForm.booster,
            ReportedtoMac4: detailsForm.reportedtoMac4,
            InIsolation: detailsForm.inIsolation,
            IsolationStart: detailsForm.isolationStart,
            IsolationEnd: detailsForm.isolationEnd,
        };

        // vehicle
        const data4 = {
            InsurancePolicy: detailsForm.insurancePolicy,
            InsuranceType: detailsForm.insuranceType,
            VehicleRegistration: detailsForm.vehicleRegistration,
            ReviewNotes: detailsForm.reviewNotes,
            VehicleMake: detailsForm.vehicleMake,
            VehicleModel: detailsForm.vehicleModel,
            VehicleYear: detailsForm.vehicleYear,
            VehicleType: detailsForm.vehicleType,
            VehicleBodyType: detailsForm.vehicleBodyType,
            DriversLicence: detailsForm.driversLicence,
            DriversLicenceNumber: detailsForm.driversLicenceNumber,
            Restrictions: detailsForm.restrictions,
        };

        // ndis
        const data5 = {
            NdisClearance: detailsForm.ndisClearance,
            ScreenCheckApplNo: detailsForm.screenCheckApplNo,
            ScreenCheckNo: detailsForm.screenCheckNo,
            ScreenCheckOutcome: detailsForm.screenCheckOutcome,
            ClearanceDecision: detailsForm.clearanceDecision,
            OutcomeExpiryDate: detailsForm.outcomeExpiryDate,
            SubParagraph: detailsForm.subParagraph,
        };

        // employment
        const data6 = {
            OneOffShifts: detailsForm.oneOffShifts,
            OtherEmployment: detailsForm.otherEmployment,
            SecondaryEmployment: detailsForm.secondaryEmployment,
            ContactPhone: detailsForm.contactPhone,
            ContactEmail: detailsForm.contactEmail,
        };

        // other details
        const data7 = {
            Comments: detailsForm.comments,
            Descriptions: detailsForm.descriptions,
            WorkerHeaderNote: detailsForm.workerHeaderNote,
            NoteAlert: detailsForm.noteAlert,
        };

        putData(
            `/api/updateWorkerGeneralDetailsData/${WorkerID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        putData(
            `/api/updateWorkerNextKinData/${WorkerID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        putData(
            `/api/updateWorkerCovidReqData/${WorkerID}`,
            {
                data: data3,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        putData(
            `/api/updateWorkerVehicleInfoData/${WorkerID}`,
            {
                data: data4,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        putData(
            `/api/updateWorkerNdisData/${WorkerID}`,
            {
                data: data5,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        putData(
            `/api/updateWorkerEmploymentData/${WorkerID}`,
            {
                data: data6,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        putData(
            `/api/updateWorkerOtherDetailsData/${WorkerID}`,
            {
                data: data7,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true);
            setStatus(response.success);
        });

        dispatch(deleteData());
        fetchDataAsync();
        setDetailsEdit(false);
        // you should keep one blank space after the details
        setSelectedComponent("Details ");
    };


    // Predefined states for Australia and New Zealand
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


    const handleChange = (event) => {
        setDetailsEdit(true);
        setSelectedComponent("Details *");

        const {id, name, value: rawValue, checked} = event.target;
        const value = name === "checkbox" ? checked : rawValue;

        // Phone 1
        if (id === "phone") {
            const phonePattern = /^[0-9]{10}$/; // Example pattern for a 10-digit phone number
            // if the phone number is empty, don't show the error
            if (newValue === "") {
                setPhoneError("");
            } else if (!phonePattern.test(newValue)) {
                setPhoneError("Invalid phone number");
            } else {
                setPhoneError("");
            }
        }

        // Phone2 validation logic
        if (id === "phone2") {
            const phonePattern = /^[0-9]{10}$/; // Example pattern for a 10-digit phone number
            // if the phone number is empty, don't show the error
            if (newValue === "") {
                setPhone2Error("");
            } else if (!phonePattern.test(newValue)) {
                setPhone2Error("Invalid phone number");
            } else {
                setPhone2Error("");
            }
        }


        // General state update logic
        setDetailsForm((prevState) => {
            const updatedState = {...prevState, [id]: value};
            dispatch(upsertData(updatedState)); // Update global state (if applicable)
            return updatedState;
        });

        // Timeout for prompting (can be adjusted based on specific needs)
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);


        const validators = {
            postCode: /^\d{4}$/, // AU (4 digits) and NZ postcodes (4 digits)
        };
        // Postcode validation logic
        if (id === "postCode") {

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
        }

        // Specific logic for handling state search
        if (id === "state") {
            handleStateSearch(value);
        }

        // Specific logic for handling suburb search
        if (id === "suburb") {
            handleSuburbSearch(value);
        }
    };

    // Logic for state search
    const handleStateSearch = (value) => {
        const searchTerm = value.toLowerCase().trim();
        console.log("State search term:", searchTerm);

        if (searchTerm === "") {
            // Clear filtered states if input is empty
            setFilteredStates([]);
        } else {
            // Filter states based on search term (case-insensitive)
            const filteredStates = states.filter((state) =>
                state.toLowerCase().includes(searchTerm)
            );
            setFilteredStates(filteredStates);
        }
    };

    // Logic for suburb search
    const handleSuburbSearch = (value) => {
        const searchTerm = value.toLowerCase().trim();
        console.log("Suburb search term:", searchTerm);

        if (searchTerm === "") {
            // Clear filtered suburbs if input is empty
            setFilteredSuburbs([]);
        } else {
            // Filter suburbs based on search term (case-insensitive)
            const filteredSuburbs = allSuburbs.filter((suburb) =>
                suburb.toLowerCase().includes(searchTerm)
            );
            setFilteredSuburbs(filteredSuburbs);
        }
    };

    useEffect(() => {
        console.log("Error Message : ", errMsgs)
    }, [errMsgs])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                    fetchDataAsync();
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                    fetchDataAsync();
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        if (WorkerID) {
            fetchDataAsync();
        } else {
            console.log("WorkerID not found");
        }

        fetchUserRoles("m_wprofile", "Worker_Profile_Details", setDisableSection);
    }, [WorkerID]);

    return (
        <div
            className="glass  dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


            <div

            >
                <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Worker Details
                </h1>

                {/* <h4 style={{fontWeight:"600",marginBottom:"1rem"}}>Worker Details</h4> */}

                {alert && (
                    <StatusBar
                        status={status}
                        setAlert={setAlert}
                        msg="Data updated successfully"
                    />
                )}
                <Row
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "0",
                        gap: "1rem",
                    }}
                >
                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            width: "0",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"General Details"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"text"}
                                        label={"Address Line 1"}
                                        id={"addressLine1"}
                                        value={detailsForm.addressLine1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Address Line 2"}
                                        id={"addressLine2"}
                                        value={detailsForm.addressLine2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Suburb"}
                                        id={"suburb"}
                                        value={detailsForm.suburb}
                                        onChange={handleChange}
                                    />
                                    {filteredSuburbs.length > 0 && (
                                        <ul style={{
                                            border: '1px solid #ccc',
                                            padding: 0,
                                            listStyleType: 'none',
                                            marginTop: '8px'
                                        }}>
                                            {filteredSuburbs.map((suburb, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setDetailsForm((prevState) => ({
                                                            ...prevState,
                                                            suburb: suburb,
                                                        }));
                                                        setFilteredSuburbs([]); // Clear the filtered list once a state is selected
                                                    }}
                                                    style={{padding: '5px', cursor: 'pointer'}}
                                                >
                                                    {suburb}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <InputField
                                        type={"text"}
                                        label={"State"}
                                        id={"state"}
                                        value={detailsForm.state}
                                        onChange={handleChange}
                                    />
                                    {filteredStates.length > 0 && (
                                        <ul style={{
                                            border: '1px solid #ccc',
                                            padding: 0,
                                            listStyleType: 'none',
                                            marginTop: '8px'
                                        }}>
                                            {filteredStates.map((state, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setDetailsForm((prevState) => ({
                                                            ...prevState,
                                                            state: state,
                                                        }));
                                                        setFilteredStates([]); // Clear the filtered list once a state is selected
                                                    }}
                                                    style={{padding: '5px', cursor: 'pointer'}}
                                                >
                                                    {state}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <InputField
                                        type={"text"}
                                        label={"Postcode"}
                                        id={"postCode"}
                                        value={detailsForm.postCode}
                                        onChange={handleChange}
                                    />
                                    {errMsgs && Object.keys(errMsgs || {}).length > 0 &&
                                        <span style={{color: "red", fontSize: "0.8rem"}}>{errMsgs.postCode}</span>
                                    }
                                    <h6>Identify As:</h6>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"lgbtiqa"}
                                            checked={detailsForm.lgbtiqa}
                                            onChange={handleChange}
                                        />
                                        LGBTIQA+
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"cald"}
                                            checked={detailsForm.cald}
                                            onChange={handleChange}
                                        />
                                        CALD
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"aboriginal"}
                                            checked={detailsForm.aboriginal}
                                            onChange={handleChange}
                                        />
                                        Aboriginal
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"torresStraitIslander"}
                                            checked={detailsForm.torresStraitIslander}
                                            onChange={handleChange}
                                        />
                                        Torres Strait Islander
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"atsIslander"}
                                            checked={detailsForm.atsIslander}
                                            onChange={handleChange}
                                        />{" "}
                                        Aboriginal and Torres Strait Islander
                                    </div>
                                    <InputField
                                        type={"text"}
                                        label={"Ethnicity"}
                                        id={"ethnicity"}
                                        value={detailsForm.ethnicity}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Languages"}
                                        id={"languages"}
                                        value={detailsForm.languages}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Cultures"}
                                        id={"cultures"}
                                        value={detailsForm.cultures}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Interests"}
                                        id={"interests"}
                                        value={detailsForm.interests}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Marital"}
                                        id={"marital"}
                                        value={detailsForm.marital}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Website"}
                                        id={"website"}
                                        value={detailsForm.website}
                                        onChange={handleChange}
                                    />

                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"isSmoker"}
                                            checked={detailsForm.isSmoker}
                                            onChange={handleChange}
                                        />
                                        Is Smoker
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"petFriendly"}
                                            checked={detailsForm.petFriendly}
                                            onChange={handleChange}
                                        />
                                        Pet Friendly
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"workingwithChildren"}
                                            checked={detailsForm.workingwithChildren}
                                            onChange={handleChange}
                                        />
                                        Working with Children
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"rosterConflictExempt"}
                                            checked={detailsForm.rosterConflictExempt}
                                            onChange={handleChange}
                                        />{" "}
                                        Roster Conflict Exempt
                                    </div>
                                    <InputField
                                        type={"textarea"}
                                        label={"Restrictions"}
                                        id={"restrictions"}
                                        value={detailsForm.restrictions}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"Allergies"}
                                        id={"allergies"}
                                        value={detailsForm.allergies}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"Medical Conditions"}
                                        id={"medicalConditions"}
                                        value={detailsForm.medicalConditions}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"Injuries"}
                                        id={"injuries"}
                                        value={detailsForm.injuries}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />


                    </Col>

                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Next of Kin 1"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"text"}
                                        label={"Name"}
                                        id={"name_1"}
                                        value={detailsForm.name_1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Relation"}
                                        id={"relation_1"}
                                        value={detailsForm.relation_1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone"}
                                        id={"phone_1"}
                                        value={detailsForm.phone_1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone 2"}
                                        id={"phone2_1"}
                                        value={detailsForm.phone2_1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Email"}
                                        id={"email_1"}
                                        value={detailsForm.email_1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Address"}
                                        id={"address_1"}
                                        value={detailsForm.address_1}
                                        onChange={handleChange}
                                    />
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"emergencyContact_1"}
                                            checked={detailsForm.emergencyContact_1}
                                            onChange={handleChange}
                                        />
                                        Emergency Contact
                                    </div>
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Next of Kin 2"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"text"}
                                        label={"Name"}
                                        id={"name_2"}
                                        value={detailsForm.name_2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Relation"}
                                        id={"relation_2"}
                                        value={detailsForm.relation_2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone"}
                                        id={"phone_2"}
                                        value={detailsForm.phone_2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone 2"}
                                        id={"phone2_2"}
                                        value={detailsForm.phone2_2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Email"}
                                        id={"email_2"}
                                        value={detailsForm.email_2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Address"}
                                        id={"address_2"}
                                        value={detailsForm.address_2}
                                        onChange={handleChange}
                                    />
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"emergencyContact_2"}
                                            checked={detailsForm.emergencyContact_2}
                                            onChange={handleChange}
                                        />
                                        Emergency Contact
                                    </div>
                                </Col>
                            }
                        />
                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"COVID 19 Requirements"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"exemption"}
                                            checked={detailsForm.exemption}
                                            onChange={handleChange}
                                        />
                                        Exemption
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"reportedtoMac1"}
                                            checked={detailsForm.reportedtoMac1}
                                            onChange={handleChange}
                                        />
                                        Reported to MAC
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"covidVaccine1"}
                                            checked={detailsForm.covidVaccine1}
                                            onChange={handleChange}
                                        />
                                        Covid Vaccine 1
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"reportedtoMac2"}
                                            checked={detailsForm.reportedtoMac2}
                                            onChange={handleChange}
                                        />
                                        Reported to MAC
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"covidVaccine2"}
                                            checked={detailsForm.covidVaccine2}
                                            onChange={handleChange}
                                        />
                                        Covid Vaccine 2
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"reportedtoMac3"}
                                            checked={detailsForm.reportedtoMac3}
                                            onChange={handleChange}
                                        />
                                        Reported to MAC
                                    </div>
                                    <InputField
                                        type={"number"}
                                        label={"Booster"}
                                        id={"booster"}
                                        value={detailsForm.booster}
                                        onChange={handleChange}
                                    />
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"reportedtoMac4"}
                                            checked={detailsForm.reportedtoMac4}
                                            onChange={handleChange}
                                        />
                                        Reported to MAC
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"inIsolation"}
                                            checked={detailsForm.inIsolation}
                                            onChange={handleChange}
                                        />
                                        In Isolation
                                    </div>
                                    <div>
                                        Isolation Start
                                        <TextField
                                            type={"date"}
                                            style={{
                                                width: "100%",
                                                borderRadius: "10px",
                                                backgroundColor: "white",
                                                marginBottom: "0.5rem",
                                            }}
                                            id={"isolationStart"}
                                            value={detailsForm.isolationStart}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        Isolation End
                                        <TextField
                                            type={"date"}
                                            style={{
                                                width: "100%",
                                                borderRadius: "10px",
                                                backgroundColor: "white",
                                                marginBottom: "0.5rem",
                                            }}
                                            id={"isolationEnd"}
                                            value={detailsForm.isolationEnd}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <button
                                        style={{
                                            backgroundColor: "blue",
                                            margin: "5px",
                                            width: "100%",
                                            color: "white",
                                            borderColor: "blue",
                                            fontSize: "1rem",
                                            padding: "0.6rem",
                                            fontWeight: "600",
                                            borderRadius: "10px",
                                        }}
                                        onClick={() => setModal(true)}
                                    >
                                        Add Leave for Isolation
                                    </button>
                                </Col>
                            }
                        />
                    </Col>

                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Drivers Licence"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                    }}
                                >
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"driversLicence"}
                                            checked={detailsForm.driversLicence}
                                            onChange={handleChange}
                                        />
                                        Drivers Licence
                                    </div>
                                    <InputField
                                        type={"text"}
                                        label={"Drivers Licence Number"}
                                        id={"driversLicenceNumber"}
                                        value={detailsForm.driversLicenceNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"Restrictions"}
                                        id={"restrictions"}
                                        value={detailsForm.restrictions}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Vehicle Insurance Details"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"text"}
                                        label={"Insurance Policy"}
                                        id={"insurancePolicy"}
                                        value={detailsForm.insurancePolicy}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Insurance Type"}
                                        id={"insuranceType"}
                                        value={detailsForm.insuranceType}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Vehicle Details"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"text"}
                                        label={"Vehicle Registration"}
                                        id={"vehicleRegistration"}
                                        value={detailsForm.vehicleRegistration}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"Review Notes"}
                                        id={"reviewNotes"}
                                        value={detailsForm.reviewNotes}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Vehicle Make"}
                                        id={"vehicleMake"}
                                        value={detailsForm.vehicleMake}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Vehicle Model"}
                                        id={"vehicleModel"}
                                        value={detailsForm.vehicleModel}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Vehicle Year"}
                                        id={"vehicleYear"}
                                        value={detailsForm.vehicleYear}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Vehicle Type"}
                                        id={"vehicleType"}
                                        value={detailsForm.vehicleType}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Vehicle Body Type"}
                                        id={"vehicleBodyType"}
                                        value={detailsForm.vehicleBodyType}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                    </Col>

                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"NDIS"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <label>
                                        If a registered NDIS provider may only allow the worker to
                                        engage in a risk assessed role with a clearance:
                                    </label>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"ndisClearance"}
                                            checked={detailsForm.ndisClearance}
                                            onChange={handleChange}
                                        />
                                        NDIS Clearance
                                    </div>
                                    <InputField
                                        type={"text"}
                                        label={"Screening check application number"}
                                        id={"screenCheckApplNo"}
                                        value={detailsForm.screenCheckApplNo}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Screening check number"}
                                        id={"screenCheckNo"}
                                        value={detailsForm.screenCheckNo}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Screening check outcome"}
                                        id={"screenCheckOutcome"}
                                        value={detailsForm.screenCheckOutcome}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Clearance decision"}
                                        id={"clearanceDecision"}
                                        value={detailsForm.clearanceDecision}
                                        onChange={handleChange}
                                    />
                                    <div>
                                        Outcome expiry date
                                        <TextField
                                            type={"date"}
                                            style={{
                                                width: "100%",
                                                borderRadius: "10px",
                                                backgroundColor: "white",
                                                marginBottom: "0.5rem",
                                            }}
                                            id={"outcomeExpiryDate"}
                                            value={detailsForm.outcomeExpiryDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <InputField
                                        type={"textarea"}
                                        label={"Any decision mentioned in subparagraph"}
                                        id={"subParagraph"}
                                        value={detailsForm.subParagraph}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Employment"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"oneOffShifts"}
                                            checked={detailsForm.oneOffShifts}
                                            onChange={handleChange}
                                        />
                                        One-Off Shifts
                                    </div>
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"otherEmployment"}
                                            checked={detailsForm.otherEmployment}
                                            onChange={handleChange}
                                        />
                                        Has other employment
                                    </div>
                                    <InputField
                                        type={"text"}
                                        label={"Secondary Employment Name"}
                                        id={"secondaryEmployment"}
                                        value={detailsForm.secondaryEmployment}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Contact Phone"}
                                        id={"contactPhone"}
                                        value={detailsForm.contactPhone}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Contact Email"}
                                        id={"contactEmail"}
                                        value={detailsForm.contactEmail}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Comments"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"textarea"}
                                        label={"Comments"}
                                        id={"comments"}
                                        value={detailsForm.comments}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Support Worker Header Note"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"textarea"}
                                        label={"Support Worker Header Note"}
                                        id={"workerHeaderNote"}
                                        value={detailsForm.workerHeaderNote}
                                        onChange={handleChange}
                                    />
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"noteAlert"}
                                            checked={detailsForm.noteAlert}
                                            onChange={handleChange}
                                        />
                                        Show note as alert
                                    </div>
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Description"}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"textarea"}
                                        label={"Descriptions"}
                                        id={"descriptions"}
                                        value={detailsForm.descriptions}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Details;
