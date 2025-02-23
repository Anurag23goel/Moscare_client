// import React, { useContext, useEffect, useState } from "react";
import {Card, Checkbox} from "@mui/material";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import MButton from "@/components/widgets/MaterialButton";
import Modal from "react-modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/worker/detailsSlice";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";


function Details({setDetailsEdit, setSelectedComponent}) {
    const router = useRouter();
    const {UpdateID} = router.query;
    const dispatch = useDispatch();
    const defaultDetailsForm = useSelector(
        (state) => state.workerdetails.detailsForm
    );
    // const {colors, loading} = useContext(ColorContext);
    const [modal, setModal] = useState(false);
    const [prompt, setPrompt] = useState(false);
    const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);
    const [disableSection, setDisableSection] = useState(false);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleModalCancel = () => {
        setModal(false);
    };

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
        const Address = await fetchData(
            `/api/getLocationPGeneralDetailsDataByID/${UpdateID}`,
            window.location.href
        );
        const Comments = await fetchData(
            `/api/getLocationPGeneralWorkDataByID/${UpdateID}`,
            window.location.href
        );
        const LeadNotes = await fetchData(
            `/api/getLocationPGeneralOtherDetailsDataByID/${UpdateID}`,
            window.location.href
        );
        const Vacancy = await fetchData(
            `/api/getLocationPGeneralWorkDataByID/${UpdateID}`,
            window.location.href
        );
        const GeneralDetails = await fetchData(
            `/api/getLocationPGeneralOtherDetailsDataByID/${UpdateID}`,
            window.location.href
        );
        const Health = await fetchData(
            `/api/getLocationPGeneralWorkDataByID/${UpdateID}`,
            window.location.href
        );
        const FinancialLegalStatus = await fetchData(
            `/api/getLocationPGeneralWorkDataByID/${UpdateID}`,
            window.location.href
        );


        console.log("Address:", Address);
        console.log("Comments:", Comments);
        console.log("LeadNotes:", LeadNotes);
        console.log("Vacancy:", Vacancy);
        console.log("GeneralDetails:", GeneralDetails);
        console.log("Health:", Health);
        console.log("FinancialLegalStatus:", FinancialLegalStatus);

        const fetchedDetailsForm = {
            // Address
            AddressLine1: Address.addressLine1,
            AddressLine2: Address.addressLine2,
            Suburb: Address.suburb,
            State: Address.state,
            Postcode: Address.postCode,

            // Comments
            Comments: Comments.data[0]?.Comments,

            // LeadNotes
            LeadNotes: LeadNotes.data[0]?.LeadNotes,

            // LeadNotes
            Vacancy: LeadNotes.data[0]?.Vacancy,

            // GeneralDetails
            ContactPreference: GeneralDetails.data[0]?.ContactPreference,
            FundingType: GeneralDetails.data[0]?.FundingType,
            lgbtiqa: GeneralDetails.data[0]?.lgbtiqa,
            cald: GeneralDetails.data[0]?.cald,
            aboriginal: GeneralDetails.data[0]?.aboriginal,
            torresStraitIslander: GeneralDetails.data[0]?.torresStraitIslander,
            atsIslander: GeneralDetails.data[0]?.atsIslander,
            OtherIdentities: GeneralDetails.data[0]?.OtherIdentities,
            OtherLanguages: GeneralDetails.data[0]?.OtherLanguages,
            InterpreterRequired: GeneralDetails.data[0]?.InterpreterRequired,
            AssistiveTechnology: GeneralDetails.data[0]?.AssistiveTechnology,
            Auslan: GeneralDetails.data[0]?.Auslan,
            Binary: GeneralDetails.data[0]?.Binary,
            TTL: GeneralDetails.data[0]?.TTL,
            OtherCommunicationAssistance: GeneralDetails.data[0]?.OtherCommunicationAssistance,
            MACReferralCode: GeneralDetails.data[0]?.MACReferralCode,
            MyAgedCareNumber: GeneralDetails.data[0]?.MyAgedCareNumber,
            PensionNumber: GeneralDetails.data[0]?.PensionNumber,
            MedicareNumber: GeneralDetails.data[0]?.MedicareNumber,
            AmbulanceNumber: GeneralDetails.data[0]?.AmbulanceNumber,
            NDISNumber: GeneralDetails.data[0]?.NDISNumber,
            StatementGoalsAspirations: GeneralDetails.data[0]?.StatementGoalsAspirations,

            // Health
            PrimaryDisability: Health.data[0]?.PrimaryDisability,
            AssociatedDisability: Health.data[0]?.AssociatedDisability,
            Medication: Health.data[0]?.Medication,
            Allergy: Health.data[0]?.Allergy,
            OtherRelevantHealthInformation: Health.data[0]?.OtherRelevantHealthInformation,

            // FinancialLegalStatus
            FinancialLegalStatus: FinancialLegalStatus.data[0]?.FinancialLegalStatus,
            LegalOrders: FinancialLegalStatus.data[0]?.LegalOrders,
            VulnerableFinancial: FinancialLegalStatus.data[0]?.VulnerableFinancial,

        };


        const mergedDetailsForm = mergeDetailsData(
            defaultDetailsForm,
            fetchedDetailsForm
        );

        setDetailsForm(mergedDetailsForm); // stores merged value
    };

    const handleSaveButton = () => {
        console.log("Details form:", detailsForm);

        // Address
        const data1 = {
            AddressLine1: detailsForm.AddressLine1,
            AddressLine2: detailsForm.AddressLine2,
            Suburb: detailsForm.Suburb,
            State: detailsForm.State,
            Postcode: detailsForm.Postcode,
        };

        // Comments
        const data2 = {
            Comments: detailsForm.Comments,
        };

        // Lead Note
        const data3 = {
            LeadNotes: detailsForm.LeadNotes,
        };

        // Vacancy
        const data4 = {
            Vacancy: detailsForm.Vacancy,
        };

        // General Details
        const data5 = {
            ContactPreference: detailsForm.ContactPreference,
            FundingType: detailsForm.FundingType,
            lgbtiqa: detailsForm.lgbtiqa,
            cald: detailsForm.cald,
            aboriginal: detailsForm.aboriginal,
            torresStraitIslander: detailsForm.torresStraitIslander,
            atsIslander: detailsForm.atsIslander,
            OtherIdentities: detailsForm.OtherIdentities,
            OtherLanguages: detailsForm.OtherLanguages,
            InterpreterRequired: detailsForm.InterpreterRequired,
            AssistiveTechnology: detailsForm.AssistiveTechnology,
            Auslan: detailsForm.Auslan,
            Binary: detailsForm.Binary,
            TTL: detailsForm.TTL,
            OtherCommunicationAssistance: detailsForm.OtherCommunicationAssistance,
            MACReferralCode: detailsForm.MACReferralCode,
            MyAgedCareNumber: detailsForm.MyAgedCareNumber,
            PensionNumber: detailsForm.PensionNumber,
            MedicareNumber: detailsForm.MedicareNumber,
            AmbulanceNumber: detailsForm.AmbulanceNumber,
            NDISNumber: detailsForm.NDISNumber,
            StatementGoalsAspirations: detailsForm.StatementGoalsAspirations,
        };

        // Health

        const data6 = {
            PrimaryDisability: detailsForm.PrimaryDisability,
            AssociatedDisability: detailsForm.AssociatedDisability,
            Medication: detailsForm.Medication,
            Allergy: detailsForm.Allergy,
            OtherRelevantHealthInformation: detailsForm.OtherRelevantHealthInformation,
        };

        // Financial and Legal Status
        const data7 = {
            FinancialLegalStatus: detailsForm.FinancialLegalStatus,
            LegalOrders: detailsForm.LegalOrders,
            VulnerableFinancial: detailsForm.VulnerableFinancial,
        };

        putData(
            `/api/upsertLocationPGeneralDetailsData/${UpdateID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertLocationPGeneralWorkData/${UpdateID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertLocationPGeneralOtherDetailsData/${UpdateID}`,
            {
                data: data3,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });


        dispatch(deleteData());
        fetchDataAsync();
        setDetailsEdit(false);
        // you should keep one blank space after the details
        setSelectedComponent("Details ");
    };

    const handleChange = (event) => {
        setDetailsEdit(true);
        setSelectedComponent("Details *");
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setDetailsForm((prevState) => {
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
        fetchUserRoles('m_crm', "Operations_Lead_Details", setDisableSection);
    }, [UpdateID]);

    return (
        <div
            style={{
                fontSize: "14px",
                marginInline: "1rem",
            }}
        >
            <div
                style={{
                    position: "relative",
                    left: "-11rem",
                    top: "-4.6rem",
                    width: "10%",
                }}
            >
                <MButton
                    variant="contained"
                    onClick={handleSaveButton}
                    label={"Save"}
                    size={'small'}
                />
            </div>
            <Modal
                style={{
                    content: {
                        maxWidth: "600px", // Set the maximum width of the modal
                        margin: "0 auto", // Center the modal horizontally
                        maxHeight: "fit-content", // Set the maximum height of the modal
                        position: "absolute",
                        top: "30%",
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                isOpen={modal}
                contentLabel="Add Leave"
            >
                <ModalHeader title="Add Leave" onCloseButtonClick={handleModalCancel}/>
                <br/>

                <label>Are you sure you want to add leave for isolation?</label>
                <br/>
                <br/>
                <div style={{textAlign: "right"}}>
                    <Button
                        label={"Yes"}
                        backgroundColor="#dc3545"
                        onClick={() => setModal(false)}
                    />
                    <Button
                        label={"No"}
                        backgroundColor="#1976d2"
                        onClick={() => setModal(false)}
                    />
                </div>

                <br/>
            </Modal>

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
                            disabled={disableSection}
                            summary={"Address"}
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
                                        label={"Search Suburb or Postcode"}
                                        placeholder="Search Suburb or Postcode"
                                        id={"searchsuburbOrPostcode"}
                                        value={detailsForm.searchsuburbOrPostcode}
                                        onChange={handleChange}
                                        disabled
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Suburb"}
                                        id={"suburb"}
                                        value={detailsForm.suburb}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"State"}
                                        id={"state"}
                                        value={detailsForm.state}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Postcode"}
                                        id={"postCode"}
                                        value={detailsForm.postCode}
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
                                        id={"Comments"}
                                        value={detailsForm.Comments}
                                        onChange={handleChange}
                                    />

                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Lead Notes"}
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
                                        type={"textarea"}
                                        label={"Lead Notes"}
                                        id={"LeadNotes"}
                                        value={detailsForm.LeadNotes}
                                        onChange={handleChange}
                                    />

                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Vacancy"}
                            disabled={disableSection}
                            details={
                                <Col
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                    }}
                                >
                                    <InputField
                                        type={"textarea"}
                                        label={"Vacancy"}
                                        id={"Vacancy"}
                                        value={detailsForm.Vacancy}
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
                            summary={"General Details"}
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
                                        type={"select"}
                                        label={"Contact Preference"}
                                        id={"ContactPreference"}
                                        placeholder="Contact Preference"
                                        value={detailsForm.ContactPreference}
                                        onChange={handleChange}
                                        disabled
                                    />
                                    <InputField
                                        type={"select"}
                                        label={"Funding Type"}
                                        id={"FundingType"}
                                        value={detailsForm.FundingType}
                                        onChange={handleChange}
                                    />
                                    <h5>Identify As:</h5>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"lgbtiqa"}
                                            checked={detailsForm.lgbtiqa}
                                            onChange={handleChange}
                                        />
                                        LGBTIQA+
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"cald"}
                                            checked={detailsForm.cald}
                                            onChange={handleChange}
                                        />
                                        CALD
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"aboriginal"}
                                            checked={detailsForm.aboriginal}
                                            onChange={handleChange}
                                        />
                                        Aboriginal
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"torresStraitIslander"}
                                            checked={detailsForm.torresStraitIslander}
                                            onChange={handleChange}
                                        />
                                        Torres Strait Islander
                                    </div>
                                    <div>
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
                                        label={"Other Identities"}
                                        id={"OtherIdentities"}
                                        value={detailsForm.OtherIdentities}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Other Languages"}
                                        id={"OtherLanguages"}
                                        value={detailsForm.OtherLanguages}
                                        onChange={handleChange}
                                    />

                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"InterpreterRequired"}
                                            checked={detailsForm.InterpreterRequired}
                                            onChange={handleChange}
                                        />
                                        Interpreter Required
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"AssistiveTechnology"}
                                            checked={detailsForm.AssistiveTechnology}
                                            onChange={handleChange}
                                        />
                                        Assistive Technology
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"Auslan"}
                                            checked={detailsForm.Auslan}
                                            onChange={handleChange}
                                        />
                                        Auslan
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"Binary"}
                                            checked={detailsForm.Binary}
                                            onChange={handleChange}
                                        />{" "}
                                        Binary
                                    </div>
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"TTL"}
                                            checked={detailsForm.TTL}
                                            onChange={handleChange}
                                        />{" "}
                                        TTL
                                    </div>
                                    <InputField
                                        type={"textarea"}
                                        label={"Other Communication Assistance"}
                                        id={"OtherCommunicationAssistance"}
                                        value={detailsForm.OtherCommunicationAssistance}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"MAC Referral Code"}
                                        id={"MACReferralCode"}
                                        value={detailsForm.MACReferralCode}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"My Aged Care Number"}
                                        id={"MyAgedCareNumber"}
                                        value={detailsForm.MyAgedCareNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Pension Number"}
                                        id={"PensionNumber"}
                                        value={detailsForm.PensionNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Medicare Number"}
                                        id={"MedicareNumber"}
                                        value={detailsForm.MedicareNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Ambulance Number"}
                                        id={"AmbulanceNumber"}
                                        value={detailsForm.AmbulanceNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"NDIS Number"}
                                        id={"NDISNumber"}
                                        value={detailsForm.NDISNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"Statement of Goals and Aspirations"}
                                        id={"StatementGoalsAspirations"}
                                        value={detailsForm.StatementGoalsAspirations}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Health"}
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
                                        type={"select"}
                                        label={"Primary Disability"}
                                        id={"PrimaryDisability"}
                                        value={detailsForm.PrimaryDisability}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type={"textarea"}
                                        label={"Associated Disability"}
                                        id={"AssociatedDisability"}
                                        value={detailsForm.AssociatedDisability}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type={"textarea"}
                                        label={"Medication"}
                                        id={"Medication"}
                                        value={detailsForm.Medication}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type={"textarea"}
                                        label={"Allergy"}
                                        id={"Allergy"}
                                        value={detailsForm.Allergy}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type={"textarea"}
                                        label={"Other Relevant Health Information"}
                                        id={"OtherRelevantHealthInformation"}
                                        value={detailsForm.OtherRelevantHealthInformation}
                                        onChange={handleChange}
                                    />

                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Financial and Legal Status"}
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
                                        label={"Financial and Legal Status"}
                                        id={"FinancialLegalStatus"}
                                        value={detailsForm.FinancialLegalStatus}
                                        onChange={handleChange}
                                    />

                                    <InputField
                                        type={"select"}
                                        label={"Legal Orders"}
                                        id={"LegalOrders"}
                                        value={detailsForm.LegalOrders}
                                        onChange={handleChange}
                                    />

                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            id={"VulnerableFinancial"}
                                            checked={detailsForm.VulnerableFinancial}
                                            onChange={handleChange}
                                        />
                                        Vulnerable to Financial
                                    </div>

                                </Col>
                            }
                        />
                    </Col>


                </Row>
            </Card>
        </div>
    );
}

export default Details;
