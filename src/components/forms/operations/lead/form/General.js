import {Card} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Col} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/maintainance/payergeneralSlice";
import {useRouter} from "next/router";

const General = ({setGeneralEdit, setSelectedComponent}) => {
    const router = useRouter();
    const {UpdateID} = router.query;
    // const {colors, loading} = useContext(ColorContext);
    const dispatch = useDispatch();
    const defaultProfileForm = useSelector(
        (state) => state.payergeneral.profileForm
    );
    const [prompt, setPrompt] = useState(false);
    const [profileForm, setProfileForm] = useState(defaultProfileForm);
    const [disableSection, setDisableSection] = useState(false);

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
            `/api/getLocationProfileGeneralDataByID/${UpdateID}`,
            window.location.href
        );

        const fetchedProfileForm = {
            Title: profileData.data[0]?.Title,
            FirstName: profileData.data[0]?.FirstName,
            MiddleName: profileData.data[0]?.MiddleName,
            LastName: profileData.data[0]?.LastName,
            Type: profileData.data[0]?.Type,
            PreferedName: profileData.data[0]?.PreferedName,
            Email: profileData.data[0]?.Email,
            CaseManager: profileData.data[0]?.CaseManager,
            DOB: profileData.data[0]?.DOB,
            Age: profileData.data[0]?.Age,
            gender: profileData.data[0]?.gender,
            Mobile: profileData.data[0]?.Mobile,
            Area: profileData.data[0]?.Area,
            Division: profileData.data[0]?.Division,
            Groups: profileData.data[0]?.Groups,
            LeadSource: profileData.data[0]?.LeadSource,
            Status: profileData.data[0]?.Status,
            StartDate: profileData.data[0]?.StartDate,
            FollowUpDate: profileData.data[0]?.FollowUpDate,
            FinalisedDate: profileData.data[0]?.FinalisedDate,
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
        console.log("Profile form:", profileForm);

        try {
            // LocationUpdate Profile Data
            const generalData = {
                Title: profileForm.Title,
                FirstName: profileForm.FirstName,
                MiddleName: profileForm.MiddleName,
                LastName: profileForm.LastName,
                Type: profileForm.Type,
                PreferedName: profileForm.PreferedName,
                Email: profileForm.Email,
                CaseManager: profileForm.CaseManager,
                DOB: profileForm.DOB,
                Age: profileForm.Age,
                gender: profileForm.gender,
                Mobile: profileForm.Mobile,
                Area: profileForm.Area,
                Division: profileForm.Division,
                Groups: profileForm.Groups,
                LeadSource: profileForm.LeadSource,
                Status: profileForm.Status,
                StartDate: profileForm.StartDate,
                FollowUpDate: profileForm.FollowUpDate,
                FinalisedDate: profileForm.FinalisedDate,
            };

            await putData(
                `/api/putLocationProfileGeneralData/${UpdateID}`,
                {
                    generalData,
                },
                window.location.href
            );
            console.log("LocationUpdate profile data saved successfully.");

            // Dispatch and Fetch
            dispatch(deleteData());
            fetchDataAsync();
        } catch (error) {
            console.error("Error saving profile data:", error);
        }
        setGeneralEdit(false);
        // you should keep one blank space after the general
        setSelectedComponent("General ");
    };

    const handleChange = (event) => {
        setGeneralEdit(true);
        setSelectedComponent("General *");
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
        fetchUserRoles("m_crm", "Operations_Lead_General", setDisableSection);
    }, [UpdateID]);

    return (
        <div
            style={{
                fontSize: "12px",
                display: "flex",
                gap: "1rem",
            }}
        >
            <div
                style={{
                    position: "relative",
                    left: "-10rem",
                    top: "-4.6rem",
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
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"First Name"}
                                                id={"FirstName"}
                                                value={profileForm.FirstName}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Middle Name"}
                                                id={"MiddleName"}
                                                value={profileForm.MiddleName}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Last Name"}
                                                id={"LastName"}
                                                disabled={disableSection}
                                                value={profileForm.LastName}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Type"}
                                                id={"Type"}
                                                value={profileForm.Type}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Prefered Name"}
                                                id={"PreferedName"}
                                                value={profileForm.PreferedName}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Email"}
                                                id={"Email"}
                                                value={profileForm.Email}
                                                onChange={handleChange}
                                                disabled={disableSection}
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
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"date"}
                                                label={"DOB"}
                                                id={"DOB"}
                                                value={profileForm.DOB}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Age"}
                                                id={"Age"}
                                                value={profileForm.Age}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"gender"}
                                                id={"gender"}
                                                value={profileForm.gender}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Mobile"}
                                                id={"Mobile"}
                                                value={profileForm.Mobile}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"Area"}
                                                id={"Area"}
                                                value={profileForm.Area}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"Division"}
                                                id={"Division"}
                                                value={profileForm.Division}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"Groups"}
                                                id={"Groups"}
                                                value={profileForm.Groups}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"Lead Source"}
                                                id={"LeadSource"}
                                                value={profileForm.LeadSource}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"Status"}
                                                id={"Status"}
                                                value={profileForm.Status}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"date"}
                                                label={"Start Date"}
                                                id={"StartDate"}
                                                value={profileForm.StartDate}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"date"}
                                                label={"Follow Up Date"}
                                                id={"FollowUpDate"}
                                                value={profileForm.FollowUpDate}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"date"}
                                                label={"Finalised Date"}
                                                id={"FinalisedDate"}
                                                value={profileForm.FinalisedDate}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Col>
                </Row>
                <p style={{color: "red"}}>
                    In Accounting code fetch the data for select
                </p>
            </Card>
        </div>
    );
};

export default General;
