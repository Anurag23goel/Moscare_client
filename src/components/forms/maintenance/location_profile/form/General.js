import {Box, Card, Typography} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {Col} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/maintainance/locationgeneralSlice";
import {useRouter} from "next/router";
import {analytics} from "../../../../../config/firebaseConfig";
import {logEvent} from "firebase/analytics";
import SubHeader from "@/components/widgets/SubHeader";
import styles from "@/styles/style.module.css";
import SaveIcon from "@mui/icons-material/Save";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

const General = ({setGeneralEdit, setSelectedComponent}) => {
    const router = useRouter();
    const {UpdateID} = router.query;
    // const {colors, loading} = useContext(ColorContext);
    const [accountingCode, setAccountingCode] = useState([])

    const dispatch = useDispatch();
    const defaultProfileForm = useSelector(
        (state) => state.locationgeneral.profileForm
    );
    const [prompt, setPrompt] = useState(false);
    const [profileForm, setProfileForm] = useState(defaultProfileForm);
    const [disableSection, setDisableSection] = useState(false);
    const [teamLeads, setTeamLeads] = useState([])
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [errMsgs, setErrMsgs] = useState({});
    const [filteredStates, setFilteredStates] = useState([]);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    const [filteredSuburbs, setFilteredSuburbs] = useState([]);
    // If their is any value in db table then it return that else it will written default value
    const mergeProfileData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] == "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const getData = async () => {
        const response = await fetchData(`/api/getxerocontact`, window.location.href);
        const TLUserData = await fetchData(`/api/getUserByUserGroup/Team Lead`)
        const teamLeadsData = TLUserData
            .map((lead) => ({
                value: lead.User_ID,
                label: lead.FirstName + " " + lead.LastName,
            }));

        console.log("getAccountingData : ", response.data)
        setTeamLeads([{value: "", label: ""}, ...teamLeadsData]);
        setAccountingCode(response.data)
    }

    useEffect(() => {
        getData()
    }, [])

    // fetch data from db
    const fetchDataAsync = async () => {
        const profileData = await fetchData(
            `/api/getLocationProfileGeneralDataByID/${UpdateID}`,
            window.location.href
        );


        const fetchedProfileForm = {
            Code: profileData.data[0]?.Code,
            Description: profileData.data[0]?.Description,
            Suburb: profileData.data[0]?.Suburb,
            PostCode: profileData.data[0]?.PostCode,
            Area: profileData.data[0]?.Area,
            State: profileData.data[0]?.State,
            Phone: profileData.data[0]?.Phone,
            Fax: profileData.data[0]?.Fax,
            Email: profileData.data[0]?.Email,
            AddressLine1: profileData.data[0]?.AddressLine1,
            AddressLine2: profileData.data[0]?.AddressLine2,
            AccountingCode: profileData.data[0]?.AccountingCode,
            CaseManager: profileData.data[0]?.CaseManager,
            IsActive: profileData.data[0]?.IsActive === "N" ? "N" : "Y",
            DeleteStatus: profileData.data[0]?.DeleteStatus === "N" ? "N" : "Y",
        };

        const mergedProfileForm = mergeProfileData(
            defaultProfileForm,
            fetchedProfileForm
        );

        setProfileForm(mergedProfileForm); // stores merged value
    };

    // handle save button
    const handleSaveButton = async () => {
        console.log("Save button clicked");
        /*  console.log("Profile form:", profileForm); */

        try {
            // LocationUpdate Profile Data
            const generalData = {
                Code: profileForm.Code,
                Description: profileForm.Description,
                Suburb: profileForm.Suburb,
                PostCode: profileForm.PostCode,
                Area: profileForm.Area,
                State: profileForm.State,
                Phone: profileForm.Phone,
                Fax: profileForm.Fax,
                Email: profileForm.Email,
                AddressLine1: profileForm.AddressLine1,
                AddressLine2: profileForm.AddressLine2,
                AccountingCode: profileForm.AccountingCode,
                CaseManager: profileForm.CaseManager,
                IsActive: profileForm.IsActive,
                DeleteStatus: profileForm.DeleteStatus,
            };

            await putData(
                `/api/putLocationProfileGeneralData/${UpdateID}`,
                {
                    generalData,
                },
                window.location.href
            );
            console.log("LocationUpdate profile data saved successfully.");
            addValidationMessage("Data Saved successfully", "success");
            logEvent(analytics, "page_view", {
                form_name: "Location",
                event: "Saved form in LocationProfile",
            });


            // Dispatch and Fetch
            dispatch(deleteData());
            fetchDataAsync();
        } catch (error) {
            addValidationMessage("An Error occured while saving general data", "error")
            console.error("Error saving profile data:", error);
        }
        setGeneralEdit(false);
        // you should keep one blank space after the general
        setSelectedComponent("General ");
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

    const handleChange = (event) => {
        setGeneralEdit(true);
        //setSelectedComponent("General *");
        const {id, value, checked, type} = event.target;

        let newValue = value;
        if (type === "checkbox") {
            newValue = checked ? "Y" : "N";  // Ensure "Y" or "N" instead of true/false
        }


        // Email validation logic
        if (id === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(newValue)) {
                setEmailError("Invalid email address");
            } else {
                setEmailError("");
            }
        }

        // Phone validation logic
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
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
        if (id === "email") {
            if (!newValue) {
                setEmailError("");
            } else if (!emailPattern.test(newValue)) {
                setEmailError("Invalid email format");
            } else {
                setEmailError(""); // Clear the error if email is valid
            }
        }

        setProfileForm((prevState) => {
            let updatedState = {...prevState, [id]: newValue};

            // If the field is 'dob', calculate and update the age
            if (id === "dob") {
                const age = calculateAge(newValue);
                updatedState.age = age;
            }

            dispatch(upsertData(updatedState));
            return updatedState;
        });

        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };


    useEffect(() => {
        console.log('ErrMsgs', errMsgs)
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
        if (UpdateID) {
            fetchDataAsync();
        } else {
            console.log("UpdateID not found");
        }
        fetchUserRoles('m_location_profile', "Maintainence_LocationProfile_General", setDisableSection);
    }, [UpdateID]);

    return (
        <>


            <div
                style={{
                    fontSize: "12px",
                    display: "flex",
                    gap: "1rem",

                }}
            >

                {/* <div
            style={{
               position: "absolute",
               left: "5rem",
               top: "6.3rem",
               height : "100%",
               
            }}
         >
            <MButton
               variant="contained"
               onClick={handleSaveButton}
               label={"Save"}
               size={"small"}
               disabled = {disableSection}
            />
         </div> */}
                <Card
                    style={{
                        backgroundColor: "#f9f9f9",
                        margin: " 0 1.5rem",
                        borderRadius: "15px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                        width: "100%",
                        padding: "1rem 2rem",
                        border: "1px solid"
                    }}
                >
                    <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

                    <Box style={{display: "flex", justifyContent: "space-between"}}>
                        <SubHeader title={"General"}/>
                        <Box>
                            <MButton
                                style={{
                                    backgroundColor: "blue",
                                    padding: "5px 12px",
                                }}
                                label=" Save"
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon/>}
                                onClick={handleSaveButton}
                                size="small"

                            />
                        </Box>
                    </Box>

                    <Row style={{alignItems: "start", paddingTop: "20px"}}>
                        <Col>
                            <div style={{marginBottom: "10px"}} className="checkbox-container">
                                <label htmlFor="IsActive" className="checkbox-label">
                                    IsActive?
                                    <input
                                        type="checkbox"
                                        id="IsActive"
                                        checked={profileForm.IsActive === "Y"}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        className="custom-checkbox"
                                    />
                                    <span className="checkmark"></span>
                                </label>
                            </div>

                            <div className="checkbox-container">
                                <label htmlFor="DeleteStatus" className="checkbox-label">
                                    Delete
                                    <input
                                        type="checkbox"
                                        id="DeleteStatus"
                                        checked={profileForm.DeleteStatus === "Y"}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        className="custom-checkbox"
                                    />
                                    <span className="checkmark"></span>
                                </label>
                            </div>
                        </Col>
                    </Row>

                    <h6 style={{fontWeight: "600", marginTop: "2rem", marginBottom: "1rem"}}>
                        Address Details <span style={{color: "red"}}>*</span>
                    </h6>
                    <Row
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                        }}
                    >
                        <Col>
                            <InputField
                                type={"text"}
                                label={"Code"}
                                id={"Code"}
                                value={profileForm.Code}
                                onChange={handleChange}
                                disabled={disableSection}
                            />

                        </Col>

                        <Col>
                            <InputField
                                type={"text"}
                                label={"Description"}
                                id={"Description"}
                                value={profileForm.Description}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>

                        <Col>
                            <InputField
                                type={"text"}
                                label={"State"}
                                id={"State"}
                                value={profileForm.State}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            {
                                filteredStates && filteredStates.length > 0 &&
                                <ul className={styles.suggestionsList}>
                                    {filteredStates.map((state, index) => (
                                        <li
                                            key={index}
                                            onClick={() => {
                                                setProfileForm((prevState) => ({
                                                    ...prevState,
                                                    State: state,
                                                }));

                                                setFilteredStates([]); // Clear suggestions after selection
                                            }}
                                        >
                                            {state}
                                        </li>
                                    ))}
                                </ul>

                            }
                        </Col>

                    </Row>

                    <Row>
                        <Col style={{height: "68px"}}>
                            <InputField
                                type={"text"}
                                label={"PostCode"}
                                id={"PostCode"}
                                value={profileForm.PostCode}
                                onChange={handleChange}
                                disabled={disableSection}

                            />
                            {
                                errMsgs.PostCode &&
                                <Typography color="error" variant="body2">
                                    {errMsgs.PostCode}
                                </Typography>
                            }
                        </Col>


                        <Col>
                            <InputField
                                type={"text"}
                                label={"Suburb"}
                                id={"Suburb"}
                                value={profileForm.Suburb}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            {
                                filteredSuburbs && filteredSuburbs.length > 0 &&
                                <ul className={styles.suggestionsList}>
                                    {filteredSuburbs.map((suburb, index) => (
                                        <li
                                            key={index}
                                            onClick={() => {
                                                setProfileForm((prevState) => ({
                                                    ...prevState,
                                                    Suburb: suburb,
                                                }));

                                                setFilteredSuburbs([]); // Clear suggestions after selection
                                            }}
                                        >
                                            {suburb}
                                        </li>
                                    ))}
                                </ul>
                            }

                        </Col>
                        <Col>
                            <InputField
                                type={"text"}
                                label={"Address Line 1"}
                                id={"AddressLine1"}
                                value={profileForm.AddressLine1}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>


                    </Row>

                    <Row>
                        <Col md={4}>
                            <InputField
                                type={"text"}
                                label={"Address Line 2"}
                                id={"AddressLine2"}
                                value={profileForm.AddressLine2}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>

                    </Row>


                    <h6 style={{fontWeight: "600", marginTop: "2rem", marginBottom: "1rem",}}>
                        Accounting Details <span style={{color: "red"}}>*</span>
                    </h6>


                    <Row>
                        <Col>
                            <InputField
                                type={"select"}
                                label={"Accounting Code"}
                                id={"AccountingCode"}
                                value={profileForm.AccountingCode}
                                onChange={handleChange}
                                disabled={disableSection}
                                options={accountingCode.map((acc) => ({
                                    label: acc.Name,
                                    value: acc.ContactID,
                                }))}
                            />
                        </Col>
                        <Col>
                            <InputField
                                type={"select"}
                                label={"Case Manager"}
                                id={"CaseManager"}
                                value={profileForm.CaseManager}
                                onChange={handleChange}
                                disabled={disableSection}
                                options={teamLeads}
                            />
                        </Col>

                        <Col>
                            <InputField
                                type={"text"}
                                label={"Area"}
                                id={"Area"}
                                value={profileForm.Area}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>


                    <h6 style={{fontWeight: "600", marginTop: "2rem", marginBottom: "1rem",}}>
                        Contact Details <span style={{color: "red"}}>*</span>
                    </h6>

                    <Row>
                        <Col style={{height: "67px"}}>
                            <InputField
                                type={"number"}
                                label={"Phone"}
                                id={"Phone"}
                                value={profileForm.Phone}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            {phoneError && (
                                <Typography color="error" variant="body2">
                                    {phoneError}
                                </Typography>
                            )}
                        </Col>
                        <Col>
                            <InputField
                                type={"text"}
                                label={"Fax"}
                                id={"Fax"}
                                value={profileForm.Fax}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col style={{height: "67px"}}>
                            <InputField
                                type={"text"}
                                label={"Email"}
                                id={"Email"}
                                value={profileForm.Email}
                                onChange={handleChange}
                                disabled={disableSection}

                            />
                            {emailError && (
                                <Typography color="error" variant="body2">
                                    {emailError}
                                </Typography>
                            )}
                        </Col>
                    </Row>


                </Card>
            </div>
        </>
    );
};

export default General;
