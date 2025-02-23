import {Card, Checkbox} from "@mui/material";
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
    const [xeroContact, setXeroContact] = useState([]);

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
            `/api/getPayerGeneralDataByID/${UpdateID}`,
            window.location.href
        );

        const xerocontactData = await fetchData(
            `/api/getxerocontact`,
            window.location.href
        )
        console.log("Xero Contact Data:", xerocontactData);
        setXeroContact(xerocontactData.data);


        const fetchedProfileForm = {
            PayerCode: profileData.data[0]?.PayerCode,
            PayerName: profileData.data[0]?.PayerName,
            ContactName: profileData.data[0]?.ContactName,
            Suburb: profileData.data[0]?.Suburb,
            Postcode: profileData.data[0]?.Postcode,
            State: profileData.data[0]?.State,
            Phone: profileData.data[0]?.Phone,
            Email: profileData.data[0]?.Email,
            AddressLine1: profileData.data[0]?.AddressLine1,
            AddressLine2: profileData.data[0]?.AddressLine2,
            Active: profileData.data[0]?.Active,
            AccountingCode: profileData.data[0]?.AccountingCode,
            Category: profileData.data[0]?.Category,
            Salutation: profileData.data[0]?.Salutation,
            Abn: profileData.data[0]?.Abn,
            Mobile: profileData.data[0]?.Mobile,
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
            // PayerUpdate Profile Data
            const generalData = {
                PayerCode: profileForm.PayerCode,
                PayerName: profileForm.PayerName,
                ContactName: profileForm.ContactName,
                Suburb: profileForm.Suburb,
                Postcode: profileForm.Postcode,
                State: profileForm.State,
                Phone: profileForm.Phone,
                Email: profileForm.Email,
                AddressLine1: profileForm.AddressLine1,
                AddressLine2: profileForm.AddressLine2,
                Active: profileForm.Active,
                AccountingCode: profileForm.AccountingCode,
                Category: profileForm.Category,
                Salutation: profileForm.Salutation,
                Abn: profileForm.Abn,
                Mobile: profileForm.Mobile,
            };

            await putData(
                `/api/putPayerGeneralData/${UpdateID}`,
                {
                    generalData,
                },
                window.location.href
            );
            console.log("PayerUpdate profile data saved successfully.");

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
        fetchUserRoles('m_maint_payers', "Maintainence_Payers_General", setDisableSection);
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
                    height: "100%"
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
                                                label={"Payer Code"}
                                                id={"PayerCode"}
                                                value={profileForm.PayerCode}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Payer Name"}
                                                id={"PayerName"}
                                                value={profileForm.PayerName}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Category"}
                                                id={"Category"}
                                                value={profileForm.Category}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <Checkbox
                                                id={"Active"}
                                                checked={profileForm.Active}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                                name="checkbox"
                                            />
                                            Active
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Contact Name"}
                                                id={"ContactName"}
                                                value={profileForm.ContactName}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"Salutation"}
                                                id={"Salutation"}
                                                value={profileForm.Salutation}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"select"}
                                                label={"Accounting Code"}
                                                id={"AccountingCode"}
                                                value={profileForm.AccountingCode}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                                options={
                                                    xeroContact &&
                                                    xeroContact.map((data) => {
                                                        return {
                                                            value: data.Name,
                                                            label: data.Name,
                                                        };
                                                    })
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"ABN"}
                                                id={"Abn"}
                                                value={profileForm.Abn}
                                                onChange={handleChange}
                                                disabled={disableSection}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Col>

                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
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
                                disabled={disableSection}
                            />
                            <InputField
                                type={"text"}
                                label={"Address Line 2"}
                                id={"AddressLine2"}
                                value={profileForm.AddressLine2}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            <InputField
                                type={"text"}
                                label={"Suburb"}
                                id={"Suburb"}
                                value={profileForm.Suburb}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            <InputField
                                type={"text"}
                                label={"State"}
                                id={"State"}
                                value={profileForm.State}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            <InputField
                                type={"text"}
                                label={"Postcode"}
                                id={"Postcode"}
                                value={profileForm.Postcode}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Col>

                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
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
                                label={"Phone"}
                                id={"Phone"}
                                value={profileForm.Phone}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            <InputField
                                type={"text"}
                                label={"Mobile"}
                                id={"Mobile"}
                                value={profileForm.Mobile}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                            <InputField
                                type={"text"}
                                label={"Email"}
                                id={"Email"}
                                value={profileForm.Email}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
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
