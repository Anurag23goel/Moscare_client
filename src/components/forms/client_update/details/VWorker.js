import styles from "@/styles/style.module.css";
import React, {useContext, useEffect, useState} from "react";
import ColorContext from "@/contexts/ColorContext";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col, Spinner} from "react-bootstrap";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/detailsSlice";
import {useRouter} from "next/router";

const VWorker = ({
                     setDetailsEdit,
                     setSelectedComponent,
                     onTabChange,
                     onSaveReady,
                     isButtonClicked,
                     setIsButtonClicked
                 }) => {

    const router = useRouter();
    const {ClientID} = router.query;

    const dispatch = useDispatch();
    const defaultDetailsForm = useSelector(
        (state) => state.clientdetails.detailsForm
    );

    const [prompt, setPrompt] = useState(false);
    const [contactPref, setContactPref] = useState([]);
    const [employmentType, setEmploymentType] = useState([]);

    const [livCircum, setLivCircum] = useState([]);
    const [legalOrders, setLegalOrders] = useState([]);
    const [covidServiceStatus, setCovidServiceStatus] = useState([]);
    const [careerStatus, setCareerStatus] = useState([]);
    const [billingPreference, setBillingPreference] = useState([]);
    const [exemption, setExemption] = useState([]);
    const [needsIndicator, setNeedsIndicator] = useState([]);
    const [disability, setDisability] = useState([]);
    const [mobilityLevel, setMobilityLevel] = useState([]);
    const [dementiaAndCognitiveImpairment, setDementiaAndCognitiveImpairment] = useState([]);

    const [clientTypes, setClientTypes] = useState([]);
    const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);

    const [isLoading, setIsLoading] = useState(true);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);

    if (loading) {
        return <Spinner/>;
    }

    function calculateAge(birthDate) {
        const currentDate = new Date();
        const birthDateParts = birthDate.split("-");

        const birthYear = parseInt(birthDateParts[0]);
        const birthMonth = parseInt(birthDateParts[1]);
        const birthDay = parseInt(birthDateParts[2]);

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        let age = currentYear - birthYear;

        if (
            currentMonth < birthMonth ||
            (currentMonth === birthMonth && currentDay < birthDay)
        ) {
            age--;
        }

        return age;
    }

    // If their is any value in db table then it return that else it will written default value
    const mergeDetailsData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchDataAsync = async () => {
        setIsLoading(true);

        try {
            const [
                clientTypesResponse,
                contactPreferenceResponse,
                employmentTypeResponse,
                livingCircumstancesResponse,
                legalOrdersResponse,
                covidServiceStatusResponse,
                carerStatusResponse,
                billingPreferenceResponse,
                exemptionResponse,
                needsIndicatorResponse,
                disabilityResponse,
                mobilityLevelResponse,
                dementiaAndCognitiveImpairmentResponse,
                clientAddressDetailsResponse,
                clientGeneralDetailsResponse,
                clientCommentsResponse,
                clientFinancialLegalStatusResponse,
                clientServiceStatusResponse,
                clientReferralResponse,
                clientWorkHealthAndSafetyResponse,
                clientBillingDetailsResponse,
                clientFinanceCCResponse,
                clientHealthResponse,
                clientAlertsResponse,
                clientVWorkerResponse
            ] = await Promise.all([
                fetchData("/api/getClientType", window.location.href),
                fetchData("/api/getContactPreference", window.location.href),
                fetchData("/api/getEmploymentType", window.location.href),
                fetchData("/api/getLivingcircumstances", window.location.href),
                fetchData("/api/getLegalorders", window.location.href),
                fetchData("/api/getCovidservicestatus", window.location.href),
                fetchData("/api/getCarerstatus", window.location.href),
                fetchData("/api/getBillingpreference", window.location.href),
                fetchData("/api/getExemption", window.location.href),
                fetchData("/api/getNeedsindicator", window.location.href),
                fetchData("/api/getDisabilityList", window.location.href),
                fetchData("/api/getMobilityLevel", window.location.href),
                fetchData("/api/getDementiaAndCognitiveImpairment", window.location.href),
                fetchData(`/api/getClientDetailsAddressData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsGeneralDetailsData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsCommentsData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsFinancialLegalStatusData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsServiceStatusData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsReferralData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsWorkHealthSafetyData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsBillingData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsFinanceCCData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsHealthData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsAlertsData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsVWorkerData/${ClientID}`, window.location.href)
            ]);

            setClientTypes(clientTypesResponse.data);
            setContactPref(contactPreferenceResponse.data);
            setEmploymentType(employmentTypeResponse.data);
            setLivCircum(livingCircumstancesResponse.data);
            setLegalOrders(legalOrdersResponse.data);
            setCovidServiceStatus(covidServiceStatusResponse.data);
            setCareerStatus(carerStatusResponse.data);
            setBillingPreference(billingPreferenceResponse.data);
            setExemption(exemptionResponse.data);
            setNeedsIndicator(needsIndicatorResponse.data);
            setDisability(disabilityResponse.data);
            setMobilityLevel(mobilityLevelResponse.data);
            setDementiaAndCognitiveImpairment(dementiaAndCognitiveImpairmentResponse.data);

            const fetchedDetailsForm = {
                // address data
                keyCode: clientAddressDetailsResponse.data[0]?.KeyCode,
                searchAddress: clientAddressDetailsResponse.data[0]?.SearchAddress,
                addressLine1: clientAddressDetailsResponse.data[0]?.AddressLine1,
                addressLine2: clientAddressDetailsResponse.data[0]?.AddressLine2,
                searchSuburborPoscode: clientAddressDetailsResponse.data[0]?.SearchSuburborPostcode,
                suburb: clientAddressDetailsResponse.data[0]?.Suburb,
                state: clientAddressDetailsResponse.data[0]?.State,
                postCode: clientAddressDetailsResponse.data[0]?.Postcode,
                postalAddress: clientAddressDetailsResponse.data[0]?.PostalAddress,
                contactPreference: clientAddressDetailsResponse.data[0]?.ContactPreference,

                // general details
                placeOfBirth: clientGeneralDetailsResponse.data[0]?.PlaceOfBirth,
                dateOfBirth: clientGeneralDetailsResponse.data[0]?.DOB?.split(" ")[0],
                age: clientGeneralDetailsResponse.data[0]?.Age,
                maritalStatus: clientGeneralDetailsResponse.data[0]?.MaritalStatus,
                employmentStatus: clientGeneralDetailsResponse.data[0]?.EmploymentStatus,
                fax: clientGeneralDetailsResponse.data[0]?.Fax,
                livingCircumstances: clientGeneralDetailsResponse.data[0]?.LivingCircumstances,
                interpreterRequired: clientGeneralDetailsResponse.data[0]?.InterpreterRequired,
                assistiveTechnology: clientGeneralDetailsResponse.data[0]?.AssistiveTechnology,
                auslan: clientGeneralDetailsResponse.data[0]?.Auslan,
                binary: clientGeneralDetailsResponse.data[0]?.Binary,
                ttl: clientGeneralDetailsResponse.data[0]?.TTL,
                otherCommunicationAssistance: clientGeneralDetailsResponse.data[0]?.OtherCommunicationAssistance,
                lgbtiqa: clientGeneralDetailsResponse.data[0]?.LGBTIQA,
                cald: clientGeneralDetailsResponse.data[0]?.CALD,
                aboriginal: clientGeneralDetailsResponse.data[0]?.Aboriginal,
                torresStraitIslander: clientGeneralDetailsResponse.data[0]?.TorresStraitIslander,
                aboriginalAndTorresStraitIslander: clientGeneralDetailsResponse.data[0]?.AboriginalAndTorresStraitIslander,
                otherIdentities: clientGeneralDetailsResponse.data[0]?.OtherIdentities,
                satss: clientGeneralDetailsResponse.data[0]?.SATSS,
                englishSpeaking: clientGeneralDetailsResponse.data[0]?.EnglishSpeaking,
                otherLanguages: clientGeneralDetailsResponse.data[0]?.OtherLanguages,
                acmps: clientGeneralDetailsResponse.data[0]?.ACMPS,
                sparc: clientGeneralDetailsResponse.data[0]?.SPARC,
                clientNumber: clientGeneralDetailsResponse.data[0]?.ClientNumber,
                pensionNumber: clientGeneralDetailsResponse.data[0]?.PensionNumber,
                medicareNumber: clientGeneralDetailsResponse.data[0]?.MedicareNumber,
                ambulanceNumber: clientGeneralDetailsResponse.data[0]?.AmbulanceNumber,
                dvaNumber: clientGeneralDetailsResponse.data[0]?.DVANumber,
                trn: clientGeneralDetailsResponse.data[0]?.TRN,
                wsm: clientGeneralDetailsResponse.data[0]?.WSM,
                reh: clientGeneralDetailsResponse.data[0]?.REH,
                macReferralCode: clientGeneralDetailsResponse.data[0]?.MACReferralCode,
                myAgedCareNumber: clientGeneralDetailsResponse.data[0]?.MyAgedCareNumber,
                privateHealth: clientGeneralDetailsResponse.data[0]?.PrivateHealth,
                companionCard: clientGeneralDetailsResponse.data[0]?.CompanionCard,
                healthCareCard: clientGeneralDetailsResponse.data[0]?.HealthCareCard,
                religion: clientGeneralDetailsResponse.data[0]?.Religion,
                spiritualWellbeing: clientGeneralDetailsResponse.data[0]?.SpiritualWellbeing,
                caregiverRoutine: clientGeneralDetailsResponse.data[0]?.CaregiverRoutine,

                // comments
                comments: clientCommentsResponse.data[0]?.Comments,

                // financial and legal status
                financialAndLegalStatus: clientFinancialLegalStatusResponse.data[0]?.FinancialAndLegalStatus,
                legalOrders: clientFinancialLegalStatusResponse.data[0]?.LegalOrders,
                vulnerableToFinancial: clientFinancialLegalStatusResponse.data[0]?.VulnerableToFinancial,

                // service status
                clientType: clientServiceStatusResponse.data[0]?.ClientType,
                enquiryDate: clientServiceStatusResponse.data[0]?.EnquiryDate,
                enquiryMinutes: clientServiceStatusResponse.data[0]?.EnquiryMinutes,
                auditOptOut: clientServiceStatusResponse.data[0]?.AuditOptOut,
                covidServiceStatus: clientServiceStatusResponse.data[0]?.CovidServiceStatus,
                serviceStart: clientServiceStatusResponse.data[0]?.ServiceStart,
                lastReviewDate: clientServiceStatusResponse.data[0]?.LastReviewDate,
                serviceReviewDatePrimary: clientServiceStatusResponse.data[0]?.ServiceReviewDatePrimary,
                serviceReviewDateSecondary: clientServiceStatusResponse.data[0]?.ServiceReviewDateSecondary,
                serviceEnd: clientServiceStatusResponse.data[0]?.ServiceEnd,
                reasonServiceEnded: clientServiceStatusResponse.data[0]?.ReasonServiceEnded,
                auditorName: clientServiceStatusResponse.data[0]?.AuditorName,
                auditDate: clientServiceStatusResponse.data[0]?.AuditDate,

                // referral
                referral: clientReferralResponse.data[0]?.Referral,
                referrer: clientReferralResponse.data[0]?.Referrer,
                referringAgency: clientReferralResponse.data[0]?.ReferringAgency,
                referralDate: clientReferralResponse.data[0]?.ReferralDate,

                // work health and safety
                workHealthAndSafetyCheck: clientWorkHealthAndSafetyResponse.data[0]?.WorkHealthAndSafetyCheck,
                ohsNote: clientWorkHealthAndSafetyResponse.data[0]?.OHSNote,
                safetyDevice: clientWorkHealthAndSafetyResponse.data[0]?.SafetyDevice,
                vulnerableToFire: clientWorkHealthAndSafetyResponse.data[0]?.VulnerableToFire,
                vulnerableToPowerOutage: clientWorkHealthAndSafetyResponse.data[0]?.VulnerableToPowerOutage,
                vulnerableToFloods: clientWorkHealthAndSafetyResponse.data[0]?.VulnerableToFloods,
                vulnerableToSevereWeatherEvents: clientWorkHealthAndSafetyResponse.data[0]?.VulnerableToSevereWeatherEvents,
                receivingSupportFromOneWorkerOnly: clientWorkHealthAndSafetyResponse.data[0]?.ReceivingSupportFromOneWorkerOnly,
                livingAlone: clientWorkHealthAndSafetyResponse.data[0]?.LivingAlone,
                livingInRuralOrRemoteRegionWithLimitedServiceOptions: clientWorkHealthAndSafetyResponse.data[0]?.LivingInRuralOrRemoteRegionWithLimitedServiceOptions,
                sociallyIsolatedOrLackCloseRelationships: clientWorkHealthAndSafetyResponse.data[0]?.SociallyIsolatedOrLackCloseRelationships,
                fewOrNoFamilyOrFriendsWhoCheckInOnThem: clientWorkHealthAndSafetyResponse.data[0]?.FewOrNoFamilyOrFriendsWhoCheckInOnThem,
                cognitiveImpairmentAndAreUnableToProblemSolveOrSpeakUp: clientWorkHealthAndSafetyResponse.data[0]?.CognitiveImpairmentAndAreUnableToProblemSolveOrSpeakUp,
                communicationDifficulties: clientWorkHealthAndSafetyResponse.data[0]?.CommunicationDifficulties,
                limitedMobility: clientWorkHealthAndSafetyResponse.data[0]?.LimitedMobility,
                highlyDependentOnTheirCaregiver: clientWorkHealthAndSafetyResponse.data[0]?.HighlyDependentOnTheirCaregiver,
                requiresDailyPersonalSelfCareActivities: clientWorkHealthAndSafetyResponse.data[0]?.RequiresDailyPersonalSelfCareActivities,
                carerStatus: clientWorkHealthAndSafetyResponse.data[0]?.CarerStatus,

                // billing details
                billingPreference: clientBillingDetailsResponse.data[0]?.BillingPreference,
                billingName: clientBillingDetailsResponse.data[0]?.Name,
                billingAddressLine1: clientBillingDetailsResponse.data[0]?.AddressLine1,
                billingAddressLine2: clientBillingDetailsResponse.data[0]?.AddressLine2,
                billingSuburb: clientBillingDetailsResponse.data[0]?.Suburb,
                billingState: clientBillingDetailsResponse.data[0]?.State,
                billingPostCode: clientBillingDetailsResponse.data[0]?.Postcode,
                billingEmail: clientBillingDetailsResponse.data[0]?.Email,
                billingPhone1: clientBillingDetailsResponse.data[0]?.Phone1,
                billingPhone2: clientBillingDetailsResponse.data[0]?.Phone2,

                // finance - credit card
                creditCardNumber: clientFinanceCCResponse.data[0]?.Number,
                creditExpiryDate: clientFinanceCCResponse.data[0]?.ExpiryDate,
                creditCardType: clientFinanceCCResponse.data[0]?.Type,
                creditCardName: clientFinanceCCResponse.data[0]?.Name,

                // health
                covidVaccine1: clientHealthResponse.data[0]?.CovidVaccine1,
                covidVaccine2: clientHealthResponse.data[0]?.CovidVaccine2,
                boosterVaccine: clientHealthResponse.data[0]?.BoosterVaccine,
                covidExemption: clientHealthResponse.data[0]?.CovidExemption,
                inIsolation: clientHealthResponse.data[0]?.InIsolation,
                isolationStartDate: clientHealthResponse.data[0]?.IsolationStartDate,
                isolationEndDate: clientHealthResponse.data[0]?.IsolationEndDate,
                weight: clientHealthResponse.data[0]?.Weight,
                height: clientHealthResponse.data[0]?.Height,
                includeProsthesis: clientHealthResponse.data[0]?.IncludeProsthesis,
                amputationLevel: clientHealthResponse.data[0]?.AmputationLevel,
                ampLeft: clientHealthResponse.data[0]?.AmpLeft,
                ampRight: clientHealthResponse.data[0]?.AmpRight,
                complexNeeds: clientHealthResponse.data[0]?.ComplexNeeds,
                visionImpaired: clientHealthResponse.data[0]?.VisionImpaired,
                hearingImpaired: clientHealthResponse.data[0]?.HearingImpaired,
                speechImpaired: clientHealthResponse.data[0]?.SpeechImpaired,
                needsIndicator: clientHealthResponse.data[0]?.NeedsIndicator,
                diagonasedDisability: clientHealthResponse.data[0]?.DiagonasedDisability,
                undiagnosedDisability: clientHealthResponse.data[0]?.UndiagnosedDisability,
                disabilitySupportPension: clientHealthResponse.data[0]?.DisabilitySupportPension,
                primaryDisablity: clientHealthResponse.data[0]?.PrimaryDisablity,
                secondaryDisablity: clientHealthResponse.data[0]?.SecondaryDisablity,
                associatedDisablity: clientHealthResponse.data[0]?.AssociatedDisablity,
                associatedMedicalConditions: clientHealthResponse.data[0]?.AssociatedMedicalConditions,
                mobilityLevel: clientHealthResponse.data[0]?.MobilityLevel,
                manualHandlingRequired: clientHealthResponse.data[0]?.ManualHandlingRequired,
                mobility: clientHealthResponse.data[0]?.Mobility,
                transponderNo: clientHealthResponse.data[0]?.TransponderNo,
                dementiaAndCognitiveImpairment: clientHealthResponse.data[0]?.DementiaAndCognitiveImpairment,
                vulnerableClient: clientHealthResponse.data[0]?.VulnerableClient,
                vulnerableStateRegistered: clientHealthResponse.data[0]?.VulnerableStateRegistered,
                vulnerableToHeat: clientHealthResponse.data[0]?.VulnerableToHeat,
                vulnerableReason: clientHealthResponse.data[0]?.VulnerableReason,
                managementPlan: clientHealthResponse.data[0]?.ManagementPlan,
                typeOfManagementPlan: clientHealthResponse.data[0]?.TypeOfManagementPlan,
                medicationAdministration: clientHealthResponse.data[0]?.MedicationAdministration,
                medicationPrompt: clientHealthResponse.data[0]?.MedicationPrompt,
                selfAdministered: clientHealthResponse.data[0]?.SelfAdministered,
                medication: clientHealthResponse.data[0]?.Medication,
                diagnosisAndPMHX: clientHealthResponse.data[0]?.DiagnosisAndPMHX,
                oxygenSupport: clientHealthResponse.data[0]?.OxygenSupport,
                mealtimeManagement: clientHealthResponse.data[0]?.MealtimeManagement,
                mealtimeManagementNote: clientHealthResponse.data[0]?.MealtimeManagementNote,
                allergy: clientHealthResponse.data[0]?.Allergy,
                resusStatus: clientHealthResponse.data[0]?.ResusStatus,
                promotingIndependence: clientHealthResponse.data[0]?.PromotingIndependence,
                swallowingProblem: clientHealthResponse.data[0]?.SwallowingProblem,
                assistanceRequired: clientHealthResponse.data[0]?.AssistanceRequired,
                assistanceRequiredDescription: clientHealthResponse.data[0]?.AssistanceRequiredDescription,
                dietType: clientHealthResponse.data[0]?.DietType,
                feedingAidsRequired: clientHealthResponse.data[0]?.FeedingAidsRequired,
                fluidType: clientHealthResponse.data[0]?.FluidType,
                thickened: clientHealthResponse.data[0]?.Thickened,
                thickenedLevel: clientHealthResponse.data[0]?.ThickenedLevel,
                preferredContinence: clientHealthResponse.data[0]?.PreferredContinence,
                preferredContinenceDescription: clientHealthResponse.data[0]?.PreferredContinenceDescription,
                stomaBag: clientHealthResponse.data[0]?.StomaBag,
                catheter: clientHealthResponse.data[0]?.Catheter,
                suprapubic: clientHealthResponse.data[0]?.Suprapubic,
                plainScore: clientHealthResponse.data[0]?.PlainScore,
                whatRelievesPain: clientHealthResponse.data[0]?.WhatRelievesPain,
                whatMakesPainWorse: clientHealthResponse.data[0]?.WhatMakesPainWorse,
                sleepReview: clientHealthResponse.data[0]?.SleepReview,
                skinIntegrity: clientHealthResponse.data[0]?.SkinIntegrity,
                bradenScaleScore: clientHealthResponse.data[0]?.BradenScaleScore,
                otherRelevantHealthInformation: clientHealthResponse.data[0]?.OtherRelevantHealthInformation,

                // alerts
                alertNote: clientAlertsResponse.data[0]?.AlertNote,
                popupInProfile: clientAlertsResponse.data[0]?.PopupInProfile,
                rosterNote: clientAlertsResponse.data[0]?.RosterNote,
                popupInRoster: clientAlertsResponse.data[0]?.PopupInRoster,

                // client profile vWorker
                clientProfile: clientVWorkerResponse.data[0]?.ClientProfile,
                accesstoResidencyNotes: clientVWorkerResponse.data[0]?.AccesstoResidencyNotes,
                identifiedRisks: clientVWorkerResponse.data[0]?.IdentifiedRisks,
                livingArrangements: clientVWorkerResponse.data[0]?.LivingArrangements,
                shiftAlert: clientVWorkerResponse.data[0]?.ShiftAlert,
            };

            const mergedDetailsForm = mergeDetailsData(defaultDetailsForm, fetchedDetailsForm);
            setDetailsForm(mergedDetailsForm);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
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
        if (ClientID) {
            fetchDataAsync();
        } else {
            console.log("ClientID not found");
        }
        fetchUserRoles('m_cprofile', 'Client_Profile_Details', setDisableSection);
    }, [ClientID]);

    const handleChange = (event) => {
        setDetailsEdit(true);
        // setSelectedComponent("Details *");
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        if (event.target.id === "dateOfBirth") {
            const age = calculateAge(value);
            setDetailsForm((prevState) => {
                const updatedStateWithAge = {...prevState, age: age};
                dispatch(upsertData(updatedStateWithAge));
                return updatedStateWithAge;
            });
        }

        setDetailsForm((prevState) => {
            const updatedState = {...prevState, [event.target.id]: value};
            dispatch(upsertData(updatedState));
            return updatedState;
        });

        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleSaveButton = () => {
        // get the data from the detailsForm
        const data1 = {
            KeyCode: detailsForm.keyCode,
            SearchAddress: detailsForm.searchAddress,
            AddressLine1: detailsForm.addressLine1,
            AddressLine2: detailsForm.addressLine2,
            SearchSuburborPostcode: detailsForm.searchSuburborPoscode,
            Suburb: detailsForm.suburb,
            State: detailsForm.state,
            Postcode: detailsForm.postCode,
            PostalAddress: detailsForm.postalAddress,
            ContactPreference: detailsForm.contactPreference,
        };

        const data2 = {
            PlaceOfBirth: detailsForm.placeOfBirth,
            DateOfBirth: detailsForm.dateOfBirth,
            Age: detailsForm.age,
            MaritalStatus: detailsForm.maritalStatus,
            EmploymentStatus: detailsForm.employmentStatus,
            Fax: detailsForm.fax,
            LivingCircumstances: detailsForm.livingCircumstances,
            InterpreterRequired: detailsForm.interpreterRequired,
            AssistiveTechnology: detailsForm.assistiveTechnology,
            Auslan: detailsForm.auslan,
            Binary: detailsForm.binary,
            Ttl: detailsForm.ttl,
            OtherCommunicationAssistance: detailsForm.otherCommunicationAssistance,
            Lgbtiqa: detailsForm.lgbtiqa,
            Cald: detailsForm.cald,
            Aboriginal: detailsForm.aboriginal,
            TorresStraitIslander: detailsForm.torresStraitIslander,
            AboriginalAndTorresStraitIslander:
            detailsForm.aboriginalAndTorresStraitIslander,
            OtherIdentities: detailsForm.otherIdentities,
            Satss: detailsForm.satss,
            EnglishSpeaking: detailsForm.englishSpeaking,
            OtherLanguages: detailsForm.otherLanguages,
            AcmPs: detailsForm.acmps,
            Sparc: detailsForm.sparc,
            ClientNumber: detailsForm.clientNumber,
            PensionNumber: detailsForm.pensionNumber,
            MedicareNumber: detailsForm.medicareNumber,
            AmbulanceNumber: detailsForm.ambulanceNumber,
            DvaNumber: detailsForm.dvaNumber,
            Trn: detailsForm.trn,
            Wsm: detailsForm.wsm,
            Reh: detailsForm.reh,
            MacReferralCode: detailsForm.macReferralCode,
            MyAgedCareNumber: detailsForm.myAgedCareNumber,
            PrivateHealth: detailsForm.privateHealth,
            CompanionCard: detailsForm.companionCard,
            HealthCareCard: detailsForm.healthCareCard,
            Religion: detailsForm.religion,
            SpiritualWellbeing: detailsForm.spiritualWellbeing,
            CaregiverRoutine: detailsForm.caregiverRoutine,
        };

        const data3 = {
            Comments: detailsForm.comments,
        };

        const data4 = {
            FinancialAndLegalStatus: detailsForm.financialAndLegalStatus,
            LegalOrders: detailsForm.legalOrders,
            VulnerableToFinancial: detailsForm.vulnerableToFinancial,
        };

        const data5 = {
            ClientType: detailsForm.clientType,
            EnquiryDate: detailsForm.enquiryDate,
            EnquiryMinutes: detailsForm.enquiryMinutes,
            AuditOptOut: detailsForm.auditOptOut,
            CovidServiceStatus: detailsForm.covidServiceStatus,
            ServiceStart: detailsForm.serviceStart,
            LastReviewDate: detailsForm.lastReviewDate,
            ServiceReviewDatePrimary: detailsForm.serviceReviewDatePrimary,
            ServiceReviewDateSecondary: detailsForm.serviceReviewDateSecondary,
            ServiceEnd: detailsForm.serviceEnd,
            ReasonServiceEnded: detailsForm.reasonServiceEnded,
            AuditorName: detailsForm.auditorName,
            AuditDate: detailsForm.auditDate,
        };

        const data6 = {
            Referral: detailsForm.referral,
            Referrer: detailsForm.referrer,
            ReferringAgency: detailsForm.referringAgency,
            ReferralDate: detailsForm.referralDate,
        };

        const data7 = {
            WorkHealthAndSafetyCheck: detailsForm.workHealthAndSafetyCheck,
            OhsNote: detailsForm.ohsNote,
            SafetyDevice: detailsForm.safetyDevice,
            VulnerableToFire: detailsForm.vulnerableToFire,
            VulnerableToPowerOutage: detailsForm.vulnerableToPowerOutage,
            VulnerableToFloods: detailsForm.vulnerableToFloods,
            VulnerableToSevereWeatherEvents:
            detailsForm.vulnerableToSevereWeatherEvents,
            ReceivingSupportFromOneWorkerOnly:
            detailsForm.receivingSupportFromOneWorkerOnly,
            LivingAlone: detailsForm.livingAlone,
            LivingInRuralOrRemoteRegionWithLimitedServiceOptions:
            detailsForm.livingInRuralOrRemoteRegionWithLimitedServiceOptions,
            SociallyIsolatedOrLackCloseRelationships:
            detailsForm.sociallyIsolatedOrLackCloseRelationships,
            FewOrNoFamilyOrFriendsWhoCheckInOnThem:
            detailsForm.fewOrNoFamilyOrFriendsWhoCheckInOnThem,
            CognitiveImpairmentAndAreUnableToProblemSolveOrSpeakUp:
            detailsForm.cognitiveImpairmentAndAreUnableToProblemSolveOrSpeakUp,
            CommunicationDifficulties: detailsForm.communicationDifficulties,
            LimitedMobility: detailsForm.limitedMobility,
            HighlyDependentOnTheirCaregiver:
            detailsForm.highlyDependentOnTheirCaregiver,
            RequiresDailyPersonalSelfCareActivities:
            detailsForm.requiresDailyPersonalSelfCareActivities,
            CarerStatus: detailsForm.carerStatus,
        };

        const data8 = {
            BillingPreference: detailsForm.billingPreference,
            BillingName: detailsForm.billingName,
            BillingAddressLine1: detailsForm.billingAddressLine1,
            BillingAddressLine2: detailsForm.billingAddressLine2,
            BillingSuburb: detailsForm.billingSuburb,
            BillingState: detailsForm.billingState,
            BillingPostCode: detailsForm.billingPostCode,
            BillingEmail: detailsForm.billingEmail,
            BillingPhone1: detailsForm.billingPhone1,
            BillingPhone2: detailsForm.billingPhone2,
        };

        const data9 = {
            CreditCardNumber: detailsForm.creditCardNumber,
            CreditExpiryDate: detailsForm.creditExpiryDate,
            CreditCardType: detailsForm.creditCardType,
            CreditCardName: detailsForm.creditCardName,
        };

        const data10 = {
            CovidVaccine1: detailsForm.covidVaccine1,
            CovidVaccine2: detailsForm.covidVaccine2,
            BoosterVaccine: detailsForm.boosterVaccine,
            CovidExemption: detailsForm.covidExemption,
            InIsolation: detailsForm.inIsolation,
            IsolationStartDate: detailsForm.isolationStartDate,
            IsolationEndDate: detailsForm.isolationEndDate,
            Weight: detailsForm.weight,
            Height: detailsForm.height,
            IncludeProsthesis: detailsForm.includeProsthesis,
            AmputationLevel: detailsForm.amputationLevel,
            AmpLeft: detailsForm.ampLeft,
            AmpRight: detailsForm.ampRight,
            ComplexNeeds: detailsForm.complexNeeds,
            VisionImpaired: detailsForm.visionImpaired,
            HearingImpaired: detailsForm.hearingImpaired,
            SpeechImpaired: detailsForm.speechImpaired,
            NeedsIndicator: detailsForm.needsIndicator,
            DiagonasedDisability: detailsForm.diagonasedDisability,
            UndiagnosedDisability: detailsForm.undiagnosedDisability,
            DisabilitySupportPension: detailsForm.disabilitySupportPension,
            PrimaryDisablity: detailsForm.primaryDisablity,
            SecondaryDisablity: detailsForm.secondaryDisablity,
            AssociatedDisablity: detailsForm.associatedDisablity,
            AssociatedMedicalConditions: detailsForm.associatedMedicalConditions,
            MobilityLevel: detailsForm.mobilityLevel,
            ManualHandlingRequired: detailsForm.manualHandlingRequired,
            Mobility: detailsForm.mobility,
            TransponderNo: detailsForm.transponderNo,
            DementiaAndCognitiveImpairment:
            detailsForm.dementiaAndCognitiveImpairment,
            VulnerableClient: detailsForm.vulnerableClient,
            VulnerableStateRegistered: detailsForm.vulnerableStateRegistered,
            VulnerableToHeat: detailsForm.vulnerableToHeat,
            VulnerableReason: detailsForm.vulnerableReason,
            ManagementPlan: detailsForm.managementPlan,
            TypeOfManagementPlan: detailsForm.typeOfManagementPlan,
            MedicationAdministration: detailsForm.medicationAdministration,
            MedicationPrompt: detailsForm.medicationPrompt,
            SelfAdministered: detailsForm.selfAdministered,
            Medication: detailsForm.medication,
            DiagnosisAndPMHX: detailsForm.DiagnosisAndPMHX,
            OxygenSupport: detailsForm.oxygenSupport,
            MealtimeManagement: detailsForm.mealtimeManagement,
            MealtimeManagementNote: detailsForm.mealtimeManagementNote,
            Allergy: detailsForm.allergy,
            ResusStatus: detailsForm.resusStatus,
            PromotingIndependence: detailsForm.promotingIndependence,
            SwallowingProblem: detailsForm.swallowingProblem,
            AssistanceRequired: detailsForm.assistanceRequired,
            AssistanceRequiredDescription: detailsForm.assistanceRequiredDescription,
            DietType: detailsForm.dietType,
            FeedingAidsRequired: detailsForm.feedingAidsRequired,
            FluidType: detailsForm.fluidType,
            Thickened: detailsForm.thickened,
            ThickenedLevel: detailsForm.thickenedLevel,
            PreferredContinence: detailsForm.preferredContinence,
            PreferredContinenceDescription:
            detailsForm.preferredContinenceDescription,
            StomaBag: detailsForm.stomaBag,
            Catheter: detailsForm.catheter,
            Suprapubic: detailsForm.suprapubic,
            PlainScore: detailsForm.plainScore,
            WhatRelievesPain: detailsForm.whatRelievesPain,
            WhatMakesPainWorse: detailsForm.whatMakesPainWorse,
            SleepReview: detailsForm.sleepReview,
            SkinIntegrity: detailsForm.skinIntegrity,
            BradenScaleScore: detailsForm.bradenScaleScore,
            OtherRelevantHealthInformation:
            detailsForm.otherRelevantHealthInformation,
        };

        const data11 = {
            AlertNote: detailsForm.alertNote,
            PopupInProfile: detailsForm.popupInProfile,
            RosterNote: detailsForm.rosterNote,
            PopupInRoster: detailsForm.popupInRoster,
        };

        const data12 = {
            ClientProfile: detailsForm.clientProfile,
            AccesstoResidencyNotes: detailsForm.accesstoResidencyNotes,
            IdentifiedRisks: detailsForm.identifiedRisks,
            LivingArrangements: detailsForm.livingArrangements,
            ShiftAlert: detailsForm.shiftAlert,
        };

        putData(
            `/api/upsertClientDetailsAddressData/${ClientID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsGeneralDetailsData/${ClientID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsCommentsData/${ClientID}`,
            {
                data: data3,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsFinancialLegalStatusData/${ClientID}`,
            {
                data: data4,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsServiceStatusData/${ClientID}`,
            {
                data: data5,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsReferralData/${ClientID}`,
            {
                data: data6,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsWorkHealthSafetyData/${ClientID}`,
            {
                data: data7,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsBillingData/${ClientID}`,
            {
                data: data8,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsFinanceCCData/${ClientID}`,
            {
                data: data9,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsHealthData/${ClientID}`,
            {
                data: data10,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsAlertsData/${ClientID}`,
            {
                data: data11,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertClientDetailsVWorkerData/${ClientID}`,
            {
                data: data12,
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

    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for Details...");
            onSaveReady("Details", handleSaveButton()); // Register handleSaveButton for Profile

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

    return (
        <div className={styles.tabDataContainer}>
            <div>
                <h4 style={{fontWeight: "600", marginBottom: "1rem"}}>Client VWorker Details</h4>
            </div>
            <Row style={{display: "flex", flexDirection: "row", alignItems: "flex-start", padding: "0", gap: "1rem"}}>
                <Col style={{display: "flex", flexDirection: "column", gap: "1rem", width: "0"}}>
                    <MAccordian
                        summaryBgColor={"blue"}
                        summary={"Client Profile (vWorker)"}
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
                                    onChange={handleChange}
                                    type={"textarea"}
                                    label={"Client Profile"}
                                    id={"clientProfile"}
                                    value={detailsForm.clientProfile}
                                    disabled={disableSection}
                                />
                            </Col>
                        }
                    />

                    <MAccordian
                        summaryBgColor={"blue"}
                        summary={"Access to Residency Notes (vWorker)"}
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
                                    onChange={handleChange}
                                    type={"textarea"}
                                    label={"Access to Residency Notes"}
                                    id={"accesstoResidencyNotes"}
                                    value={detailsForm.accesstoResidencyNotes}
                                    disabled={disableSection}
                                />
                            </Col>
                        }
                    />

                    <MAccordian
                        summaryBgColor={"blue"}
                        summary={"Identified Risks (vWorker)"}
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
                                    onChange={handleChange}
                                    type={"textarea"}
                                    label={"Identified Risks"}
                                    id={"identifiedRisks"}
                                    value={detailsForm.identifiedRisks}
                                    disabled={disableSection}
                                />
                            </Col>
                        }
                    />

                    <MAccordian
                        summaryBgColor={"blue"}
                        summary={"Living Arrangements (vWorker)"}
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
                                    onChange={handleChange}
                                    type={"textarea"}
                                    label={"Living Arrangements"}
                                    id={"livingArrangements"}
                                    value={detailsForm.livingArrangements}
                                    disabled={disableSection}
                                />
                            </Col>
                        }
                    />

                    <MAccordian
                        summaryBgColor={"blue"}
                        summary={"Shift Alert (vWorker)"}
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
                                    onChange={handleChange}
                                    type={"textarea"}
                                    label={"Shift Alert"}
                                    id={"shiftAlert"}
                                    value={detailsForm.shiftAlert}
                                    disabled={disableSection}
                                />
                            </Col>
                        }
                    />
                </Col>
            </Row>
        </div>
    );
};

export default VWorker;