import {Card, Checkbox} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Col} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData,} from "@/redux/maintainance/contactgeneralSlice";
import {useRouter} from "next/router";
import MAccordian from "@/components/widgets/MAccordian";

const ContactUpdate = () => {
    const router = useRouter();
    const {UpdateID} = router.query;
    // const {colors, loading} = useContext(ColorContext);
    const dispatch = useDispatch();
    const defaultProfileForm = useSelector(
        (state) => state.contactgeneral.profileForm
    );
    const [prompt, setPrompt] = useState(false);
    const [profileForm, setProfileForm] = useState(defaultProfileForm);
    const [country, setCountry] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [languages, setLanguages] = useState([]);

    const fetchLanguages = async () => {
        try {
            const langData = await fetchData("/api/getAllLanguages", window.location.href);
            const languageOptions = langData.data.map(lang => ({
                value: lang.Language,
                label: lang.Language
            }));
            setLanguages(languageOptions);
        } catch (error) {
            console.error("Error fetching languages:", error);
        }
    };

    const getCookieValue = (name) => {
        if (typeof document === 'undefined') {
            return null; // Return null if document is not defined
        }
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Return null if cookie is not found
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    const fetchUserRoles = async () => {
        try {
            const rolesData = await fetchData(
                `/api/getRolesUser/${userId}`,
                window.location.href
            );
            /* console.log(rolesData); */


            const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
            /* console.log(WriteData); */

            const ReadData = rolesData.filter((role) => role.ReadOnly === 1);
            /* console.log(ReadData); */

            const specificRead = WriteData.filter((role) => role.Menu_ID === 'm_contacts' && role.ReadOnly === 0);
            console.log('Maintainence_Contacts Condition', specificRead);

            //If length 0 then No wite permission Only Read, thus set disableSection to true else false
            if (specificRead.length === 0) {
                setDisableSection(true);
            } else {
                setDisableSection(false);
            }

        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    }

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

    // fetch data from db
    const fetchDataAsync = async () => {
        const profileData = await fetchData(
            `/api/getContactGeneralDataByID/${UpdateID}`,
            window.location.href
        );
        const haccData = await fetchData(
            `/api/getContactHaccDataByID/${UpdateID}`,
            window.location.href
        );
        const vAboutMeData = await fetchData(
            `/api/getContactAboutMeDataByID/${UpdateID}`,
            window.location.href
        );
        console.log(profileData);

        const country = await fetchData('https://restcountries.com/v3.1/all', window.location.href);
        console.log(country);

        const fetchedProfileForm = {
            Title: profileData.data[0]?.Title,
            Organisation: profileData.data[0]?.Organisation,
            EmailWork: profileData.data[0]?.EmailWork,
            EmailPersonal: profileData.data[0]?.EmailPersonal,
            Skype: profileData.data[0]?.Skype,
            FirstName: profileData.data[0]?.FirstName,
            Description: profileData.data[0]?.Description,
            Other: profileData.data[0]?.Other,
            LastName: profileData.data[0]?.LastName,
            Position: profileData.data[0]?.Position,
            WebUsername: profileData.data[0]?.WebUsername,
            Mobile: profileData.data[0]?.Mobile,
            DefaultContactType: profileData.data[0]?.DefaultContactType,
            MobileOther: profileData.data[0]?.MobileOther,
            VAboutMe: profileData.data[0]?.VAboutMe,
            Dob: profileData.data[0]?.Dob,
            PersonalContact: profileData.data[0]?.PersonalContact,
            AreaCode1: profileData.data[0]?.AreaCode1,
            AreaCode2: profileData.data[0]?.AreaCode2,
            AreaCode3: profileData.data[0]?.AreaCode3,
            Phone1: profileData.data[0]?.Phone1,
            Phone2: profileData.data[0]?.Phone2,
            Phone3: profileData.data[0]?.Phone3,
            Extension1: profileData.data[0]?.Extension1,
            Extension2: profileData.data[0]?.Extension2,
            Extension3: profileData.data[0]?.Extension3,
            AddressLine1: profileData.data[0]?.AddressLine1,
            AddressLine2: profileData.data[0]?.AddressLine2,
            Suburb: profileData.data[0]?.Suburb,
            State: profileData.data[0]?.State,
            Postcode: profileData.data[0]?.Postcode,
            Note: profileData.data[0]?.Note,
            AccountNote: profileData.data[0]?.AccountNote,

            // hacc
            Slk: haccData.data[0]?.Slk,
            IsDobEstimated: haccData.data[0]?.IsDobEstimated,
            GenderCode: haccData.data[0]?.GenderCode,
            CountryOfBirth: haccData.data[0]?.CountryOfBirth,
            AustralianStateTerritory: haccData.data[0]?.AustralianStateTerritory,
            PreferredLanguage: haccData.data[0]?.PreferredLanguage,
            IndigenousStatus: haccData.data[0]?.IndigenousStatus,
            ResidencyStatus: haccData.data[0]?.ResidencyStatus,
            ContactID: haccData.data[0]?.ContactID,

            // vAboutMe
            RequestNewService: vAboutMeData.data[0]?.RequestNewService,
            ViewBudgetDetails: vAboutMeData.data[0]?.ViewBudgetDetails,
            AccessMyDocuments: vAboutMeData.data[0]?.AccessMyDocuments,
            AccessMyExpenses: vAboutMeData.data[0]?.AccessMyExpenses,
            AccessMyQuotes: vAboutMeData.data[0]?.AccessMyQuotes,
            AccessMessages: vAboutMeData.data[0]?.AccessMessages,
            AccessMyForms: vAboutMeData.data[0]?.AccessMyForms,
            CanSignature: vAboutMeData.data[0]?.CanSignature,
        };

        const mergedProfileForm = mergeProfileData(
            defaultProfileForm,
            fetchedProfileForm
        );

        setProfileForm(mergedProfileForm); // stores merged value
        setCountry(country)
    };

    // handle save button
    const handleSaveButton = async () => {
        console.log("Save button clicked");
        console.log("Profile form:", profileForm);

        try {
            // ContactUpdate Profile Data
            const generalData = {
                Title: profileForm.Title,
                Organisation: profileForm.Organisation,
                EmailWork: profileForm.EmailWork,
                EmailPersonal: profileForm.EmailPersonal,
                Skype: profileForm.Skype,
                FirstName: profileForm.FirstName,
                Description: profileForm.Description,
                Other: profileForm.Other,
                LastName: profileForm.LastName,
                Position: profileForm.Position,
                WebUsername: profileForm.WebUsername,
                Mobile: profileForm.Mobile,
                DefaultContactType: profileForm.DefaultContactType,
                MobileOther: profileForm.MobileOther,
                VAboutMe: profileForm.VAboutMe,
                Dob: profileForm.Dob,
                PersonalContact: profileForm.PersonalContact,
                AreaCode1: profileForm.AreaCode1,
                AreaCode2: profileForm.AreaCode2,
                AreaCode3: profileForm.AreaCode3,
                Phone1: profileForm.Phone1,
                Phone2: profileForm.Phone2,
                Phone3: profileForm.Phone3,
                Extension1: profileForm.Extension1,
                Extension2: profileForm.Extension2,
                Extension3: profileForm.Extension3,
                AddressLine1: profileForm.AddressLine1,
                AddressLine2: profileForm.AddressLine2,
                Suburb: profileForm.Suburb,
                State: profileForm.State,
                Postcode: profileForm.Postcode,
                Note: profileForm.Note,
                AccountNote: profileForm.AccountNote,
            };

            const Hacc = {
                Slk: profileForm.Slk,
                IsDobEstimated: profileForm.IsDobEstimated,
                GenderCode: profileForm.GenderCode,
                CountryOfBirth: profileForm.CountryOfBirth,
                AustralianStateTerritory: profileForm.AustralianStateTerritory,
                PreferredLanguage: profileForm.PreferredLanguage,
                IndigenousStatus: profileForm.IndigenousStatus,
                ResidencyStatus: profileForm.ResidencyStatus,
                ContactID: profileForm.ContactID,
            };

            const vAboutMe = {
                RequestNewService: profileForm.RequestNewService,
                ViewBudgetDetails: profileForm.ViewBudgetDetails,
                AccessMyDocuments: profileForm.AccessMyDocuments,
                AccessMyExpenses: profileForm.AccessMyExpenses,
                AccessMyQuotes: profileForm.AccessMyQuotes,
                AccessMessages: profileForm.AccessMessages,
                AccessMyForms: profileForm.AccessMyForms,
                CanSignature: profileForm.CanSignature,
            };

            await putData(
                `/api/putContactGeneralData/${UpdateID}`,
                {
                    generalData,
                },
                window.location.href
            );
            await putData(
                `/api/upsertContactHaccData/${UpdateID}`,
                {
                    Hacc,
                },
                window.location.href
            );
            await putData(
                `/api/upsertContactAboutMeData/${UpdateID}`,
                {
                    vAboutMe,
                },
                window.location.href
            );
            console.log("ContactUpdate profile data saved successfully.");

            // Dispatch and Fetch
            dispatch(deleteData());
            fetchDataAsync();
        } catch (error) {
            console.error("Error saving profile data:", error);
        }
    };

    const handleChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setProfileForm((prevState) => {
            const updatedState = {...prevState, [event.target.id]: value};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

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
        fetchUserRoles();
        fetchLanguages();
    }, [UpdateID]);

    return (
        <div
            style={{
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
            }}
        >
            <div
                style={{
                    position: "relative",
                    left: "1rem",
                    top: "1rem",
                }}
            >
                <MButton
                    variant="contained"
                    onClick={handleSaveButton}
                    label={"Save"}
                    size={"small"}
                    disabled={disableSection}
                />
            </div>
            <Card
                style={{
                    backgroundColor: "#f9f9f9",
                    margin: "1rem",
                    borderRadius: "15px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    width: "80vw",
                    padding: "1rem 2rem",
                }}
            >
                <Row
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                    }}
                >
                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"General Details"}
                            disabled={disableSection}
                            details={
                                <Col>
                                    <Row style={{alignItems: "start"}}>
                                        <Col>
                                            <Row>
                                                <Col>
                                                    <InputField
                                                        type={"text"}
                                                        label={"Title"}
                                                        id={"Title"}
                                                        value={profileForm.Title}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                                <Col>
                                                    <InputField
                                                        type={"text"}
                                                        label={"Organisation"}
                                                        id={"Organisation"}
                                                        value={profileForm.Organisation}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <InputField
                                                        type={"text"}
                                                        label={"Email(Work)"}
                                                        id={"EmailWork"}
                                                        value={profileForm.EmailWork}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                                <Col>
                                                    <InputField
                                                        type={"text"}
                                                        label={"Skype"}
                                                        id={"Skype"}
                                                        value={profileForm.Skype}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col>
                                                    <Row>
                                                        <Col>
                                                            <InputField
                                                                label={"First Name"}
                                                                type={"text"}
                                                                id={"FirstName"}
                                                                value={profileForm.FirstName}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <InputField
                                                                label={"Description"}
                                                                type={"text"}
                                                                id={"Description"}
                                                                value={profileForm.Description}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <InputField
                                                                label={"Email(Personal)"}
                                                                type={"text"}
                                                                id={"EmailPersonal"}
                                                                value={profileForm.EmailPersonal}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <InputField
                                                                type={"text"}
                                                                label={"Other"}
                                                                id={"Other"}
                                                                value={profileForm.Other}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <InputField
                                                                label={"Last Name"}
                                                                type={"text"}
                                                                id={"LastName"}
                                                                value={profileForm.LastName}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <InputField
                                                                label={"Position"}
                                                                type={"text"}
                                                                id={"Position"}
                                                                value={profileForm.Position}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col>
                                                            <InputField
                                                                label={"Mobile"}
                                                                type={"text"}
                                                                id={"Mobile"}
                                                                value={profileForm.Mobile}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <InputField
                                                                label={"Web Username"}
                                                                type={"text"}
                                                                id={"WebUsername"}
                                                                value={profileForm.WebUsername}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <InputField
                                                                label={"Default Contact Type"}
                                                                type={"select"}
                                                                id={"DefaultContactType"}
                                                                value={profileForm.DefaultContactType}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <InputField
                                                                label={"DOB"}
                                                                type={"date"}
                                                                id={"Dob"}
                                                                value={profileForm.Dob}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <InputField
                                                                label={"Mobile Other"}
                                                                type={"text"}
                                                                id={"MobileOther"}
                                                                value={profileForm.MobileOther}
                                                                onChange={handleChange}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <Checkbox
                                                                id={"PersonalContact"}
                                                                checked={profileForm.PersonalContact}
                                                                onChange={handleChange}
                                                                name="checkbox"
                                                            />
                                                            Personal Contact
                                                        </Col>
                                                        <Col>
                                                            <Checkbox
                                                                id={"vAboutMe"}
                                                                checked={profileForm.vAboutMe}
                                                                onChange={handleChange}
                                                                name="checkbox"
                                                            />
                                                            vAboutMe Enabled
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            }
                        />
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Phone Number"}
                            disabled={disableSection}
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
                                        id={"AreaCode1"}
                                        value={profileForm.AreaCode1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Area Code 2"}
                                        id={"AreaCode2"}
                                        value={profileForm.AreaCode2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Area Code 3"}
                                        id={"AreaCode3"}
                                        value={profileForm.AreaCode3}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone 1"}
                                        id={"Phone1"}
                                        value={profileForm.Phone1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone 2"}
                                        id={"Phone2"}
                                        value={profileForm.Phone2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Phone 3"}
                                        id={"Phone3"}
                                        value={profileForm.Phone3}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Extension 1"}
                                        id={"Extension1"}
                                        value={profileForm.Extension1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Extension 2"}
                                        id={"Extension2"}
                                        value={profileForm.Extension2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Extension 3"}
                                        id={"Extension3"}
                                        value={profileForm.Extension3}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"HACC"}
                            disabled={disableSection}
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
                                        label={"SLK"}
                                        id={"Slk"}
                                        value={profileForm.Slk}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Is date of birth estimated?"}
                                        id={"IsDobEstimated"}
                                        value={profileForm.IsDobEstimated}
                                        onChange={handleChange}
                                        options={[
                                            {value: "Estimated", label: "Estimated"},
                                            {value: "NotEstimated", label: "NotEstimated"},
                                        ]}
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Gender Code"}
                                        id={"GenderCode"}
                                        value={profileForm.GenderCode}
                                        onChange={handleChange}
                                        options={[
                                            {value: "Male", label: "Male"},
                                            {value: "Female", label: "Female"},
                                            {
                                                value: "Not Stated/inadequately described",
                                                label: "Not Stated/inadequately described",
                                            },
                                        ]}
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Country Of Birth"}
                                        id={"CountryOfBirth"}
                                        value={profileForm.CountryOfBirth}
                                        onChange={handleChange}
                                        options={
                                            country.map((i) => {
                                                return {value: i.name.common, label: i.name.common}
                                            })
                                        }
                                    />
                                    {/* Added the hardCore values for Austrlian State Territory and Indigenous State */}
                                    <InputField
                                        type={"select"}
                                        label={"Australian State Territory"}
                                        id={"AustralianStateTerritory"}
                                        value={profileForm.AustralianStateTerritory}
                                        onChange={handleChange}
                                        options={[
                                            {value: "New South Wales", label: "New South Wales"},
                                            {value: "Victoria", label: "Victoria"},
                                            {value: "Quuensland", label: "Quuensland"},
                                            {value: "South Austraila", label: "South Austraila"},
                                            {value: "Western Australia", label: "Western Australia"},
                                            {value: "Tasmania", label: "Tasmania"},
                                            {value: "Northern Territory", label: "Northern Territory"},
                                            {
                                                value: "Australian Capital Territory",
                                                label: "Australian Capital Territory"
                                            },
                                            {
                                                value: "Other Territories Cocos (Keeling) Islands, Christmas Island and Jervis Bay Territory",
                                                label: "Other Territories Cocos (Keeling) Islands, Christmas Island and Jervis Bay Territory"
                                            },

                                        ]}
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Preferred Language"}
                                        id={"PreferredLanguage"}
                                        value={profileForm.PreferredLanguage}
                                        onChange={handleChange}
                                        options={languages}
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Indigenous Status"}
                                        id={"IndigenousStatus"}
                                        value={profileForm.IndigenousStatus}
                                        onChange={handleChange}
                                        options={[
                                            {
                                                value: "Aboriginal but not Torres Strait Islander Origin",
                                                label: "Aboriginal but not Torres Strait Islander Origin"
                                            },
                                            {
                                                value: "Torres Strait Islander but not Aboriginal Origin",
                                                label: "Torres Strait Islander but not Aboriginal Origin"
                                            },
                                            {
                                                value: "Both Aboriginal and Torres Starit Island Origin",
                                                label: "Both Aboriginal and Torres Starit Island Origin"
                                            },
                                            {
                                                value: "Neither Aboriginal and Torres Strait Islander Origins",
                                                label: "Neither Aboriginal and Torres Strait Islander Origins"
                                            },
                                            {
                                                value: "Not stated/inadequately described",
                                                label: "Not stated/inadequately described"
                                            },
                                        ]}
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Residency Status"}
                                        id={"ResidencyStatus"}
                                        value={profileForm.ResidencyStatus}
                                        onChange={handleChange}
                                        options={[
                                            {value: "Not applicable", label: "Not applicable"},
                                            {
                                                value: "Co-resident Carer",
                                                label: "Co-resident Carer",
                                            },
                                            {
                                                value: "Non-resident Carer",
                                                label: "Non-resident Carer",
                                            },
                                            {
                                                value: "Not Stated/inadequately described",
                                                label: "Not Stated/inadequately described",
                                            },
                                        ]}
                                    />
                                </Col>
                            }
                        />
                    </Col>

                    {/* second col */}
                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Address"}
                            disabled={disableSection}
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
                                        id={"AddressLine1"}
                                        value={profileForm.AddressLine1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Address Line 2"}
                                        id={"AddressLine2"}
                                        value={profileForm.AddressLine2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Suburb"}
                                        id={"Suburb"}
                                        value={profileForm.Suburb}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"State"}
                                        id={"State"}
                                        value={profileForm.State}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Postcode"}
                                        id={"Postcode"}
                                        value={profileForm.Postcode}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                    </Col>

                    {/* third col */}
                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Notes"}
                            disabled={disableSection}
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
                                        label={"Note"}
                                        id={"Note"}
                                        value={profileForm.Note}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Account Note"}
                                        id={"AccountNote"}
                                        value={profileForm.AccountNote}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"vAboutMe"}
                            disabled={disableSection}
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
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"RequestNewService"}
                                            checked={profileForm.RequestNewService}
                                            onChange={handleChange}
                                        />
                                        Request New Service
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"ViewBudgetDetails"}
                                            checked={profileForm.ViewBudgetDetails}
                                            onChange={handleChange}
                                        />
                                        View Budget Details
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"AccessMyDocuments"}
                                            checked={profileForm.AccessMyDocuments}
                                            onChange={handleChange}
                                        />
                                        Access My Documents
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"AccessMyExpenses"}
                                            checked={profileForm.AccessMyExpenses}
                                            onChange={handleChange}
                                        />
                                        Access My Expenses
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"AccessMyQuotes"}
                                            checked={profileForm.AccessMyQuotes}
                                            onChange={handleChange}
                                        />
                                        Access My Quotes
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"AccessMessages"}
                                            checked={profileForm.AccessMessages}
                                            onChange={handleChange}
                                        />
                                        Access Messages
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"AccessMyForms"}
                                            checked={profileForm.AccessMyForms}
                                            onChange={handleChange}
                                        />
                                        Access My Forms
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            name="checkbox"
                                            id={"CanSignature"}
                                            checked={profileForm.CanSignature}
                                            onChange={handleChange}
                                        />
                                        Can Signature
                                    </Col>
                                </Col>
                            }
                        />
                    </Col>
                </Row>
            </Card>
            <p style={{color: "red"}}>In Hacc fetch the data for select</p>
        </div>
    );
};

export default ContactUpdate;
