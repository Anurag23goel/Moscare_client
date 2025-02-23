import React, {useContext, useEffect, useState} from "react";
import {Checkbox} from "@mui/material";
import ColorContext from "@/contexts/ColorContext";
import {Spinner} from "react-bootstrap";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/detailsSlice";
import {useRouter} from "next/router";
import {Building2, ChevronDown, Heart, Info, MapPin, Minus, Plus, Shield, User} from 'lucide-react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const Personal = ({
  addValidationMessage,
  setDetailsEdit,
  setSelectedComponent,
  onSaveReady,
  isButtonClicked,
  setIsButtonClicked,
}) => {
  const router = useRouter();
  const { ClientID } = router.query;

  const dispatch = useDispatch();
  const defaultDetailsForm = useSelector(
    (state) => state.clientdetails.detailsForm
  );

  const [prompt, setPrompt] = useState(false);
  const [contactPref, setContactPref] = useState([]);
  const [employmentType, setEmploymentType] = useState([]);
  const [errors, setErrors] = useState({});

  const [livCircum, setLivCircum] = useState([]);
  const [legalOrders, setLegalOrders] = useState([]);

  const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);

  const [isLoading, setIsLoading] = useState(true);
  const [disableSection, setDisableSection] = useState(false);
  const { colors, loading } = useContext(ColorContext);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [sections, setSections] = useState({
    address: true,
    general: true,
    identity: true,
    health: true,
    financial: true
  });
  if (loading) {
    return <Spinner />;
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
    const mergedData = { ...defaultData };
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
        contactPreferenceResponse,
        employmentTypeResponse,
        livingCircumstancesResponse,
        legalOrdersResponse,
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
        fetchData("/api/getContactPreference", window.location.href),
        fetchData("/api/getEmploymentType", window.location.href),
        fetchData("/api/getLivingcircumstances", window.location.href),
        fetchData("/api/getLegalorders", window.location.href),
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

      setContactPref(contactPreferenceResponse.data);
      setEmploymentType(employmentTypeResponse.data);
      setLivCircum(livingCircumstancesResponse.data);
      setLegalOrders(legalOrdersResponse.data);

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
    fetchUserRoles("m_cprofile", "Client_Profile_Details", setDisableSection);
  }, [ClientID]);

  const handleChange = (event) => {
    setDetailsEdit(true);
    // setSelectedComponent("Details *");
    let value =
      event.target.name === "checkbox"
        ? event.target.checked
        : event.target.value;

    // Handle the "Other Languages" field
    if (event.target.id === "otherLanguages") {
      // Ensure value is an array for multi-select
      if (!Array?.isArray(value)) {
        value = []; // Default to empty array if invalid
      }

      // Convert the array back to a JSON string for saving
      const jsonString = JSON.stringify(value);

      setDetailsForm((prevState) => ({
        ...prevState,
        otherLanguages: jsonString,
      }));
      return; // Skip the rest of the logic for this specific field
    }

    // Predefined states for Australia and New Zealand
    const states = [
      "New South Wales",
      "Victoria",
      "Queensland",
      "South Australia",
      "Western Australia",
      "Tasmania",
      "Australian Capital Territory",
      "Northern Territory",
      "Auckland",
      "Wellington",
      "Canterbury",
      "Waikato",
      "Otago",
      "Bay of Plenty",
      "Manawatu-Wanganui",
      "Hawke's Bay",
      "Taranaki",
      "Northland",
      "Nelson",
      "Marlborough",
      "Southland",
    ];
    const allSuburbs = [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaide",
      "Hobart",
      "Canberra",
      "Darwin",
      "Gold Coast",
      "Newcastle",
      "Wollongong",
      "Geelong",
      "Cairns",
      "Townsville",
      "Ballarat",
      "Auckland",
      "Wellington",
      "Christchurch",
      "Hamilton",
      "Tauranga",
      "Napier-Hastings",
      "Dunedin",
      "Palmerston North",
      "Rotorua",
      "New Plymouth",
      "Whangarei",
      "Invercargill",
      "Nelson",
      "Whanganui",
      "Timaru",
    ];

    if (event.target.id === "postalAddress") {
      if (value.length > 256) {
        value = value.slice(0, 256); // Trim excess characters
      }
    }

    // Logic for handling the state search
    if (event.target.id === "state") {
      const searchTerm = value.toLowerCase().trim(); // User's input
      console.log("search term: " + searchTerm);
      if (searchTerm === "") {
        // If no input, clear filtered states
        setFilteredStates([]);
      } else {
        // Filter states based on search term
        const filteredStates = states.filter(
          (state) => state.toLowerCase().includes(searchTerm) // Case-insensitive search
        );
        setFilteredStates(filteredStates); // Update filtered states list
      }

      setDetailsForm((prevState) => ({
        ...prevState,
        state: value, // Ensure the value from the input is updated in the state
      }));
    }

    if (event.target.id === "suburb") {
      const searchTerm = value.toLowerCase().trim(); // User's input
      console.log("search term: " + searchTerm);

      if (searchTerm === "") {
        // If no input, clear filtered suburbs
        setFilteredSuburbs([]);
      } else {
        // Filter merged suburbs based on search term
        const filteredSuburbsList = allSuburbs.filter(
          (suburb) => suburb.toLowerCase().includes(searchTerm) // Case-insensitive search
        );
        setFilteredSuburbs(filteredSuburbsList); // Update filtered suburbs list
      }

      setDetailsForm((prevState) => ({
        ...prevState,
        suburb: value, // Ensure the value from the input is updated in the form state
      }));
    }

    const patterns = {
      ambulanceNumber: /^[A-Za-z]{3}\d{3,4}$|^\d{5,7}$/, // Alphanumeric: 'AMB1234' or Numeric: '12345'
      medicareNumber: /^\d{4}\s?\d{5}\s?\d{2}$|^\d{10}$/, // Format '1234 56789 00' or '1234567890'
      postCode: /^[0-9]{4}$/, // Format '1234 56789 00' or '1234567890'
      pensionNumber: /^[A-Za-z0-9]{8,10}$/, // Alphanumeric, 8-10 characters
      dvaNumber: /^(\d{7}|[A-Za-z]{1}\d{6})$/, // 7 digits or 1 letter followed by 6 digits
      macNumber: /^\d{10}$/, // 10 digits for My Aged Care Number
      healthCareCard: /^[A-Za-z0-9]{9}$/, // 9 alphanumeric characters
      trn: /^\d{9}$/, // 9 digits for Tax Reference Number
      acmps: /^[A-Za-z0-9]{5,15}$/, // 5-15 alphanumeric characters
      sparc: /^[A-Za-z0-9]{5,15}$/, // 5-15 alphanumeric characters
      wsm: /^[A-Za-z0-9]{5,15}$/, // WSM: Alphanumeric, 5–15 characters
      reh: /^[A-Za-z0-9]{5,15}$/, // REH: Alphanumeric, 5–15 characters
      macReferralCode: /^\d{10}$/, // MAC Referral Code: 10 digits
      myAgedCareNumber: /^\d{10}$/, // My Aged Care Number: 10 digits
      PrivateHealth: /^[A-Za-z0-9]{8,12}$/, // Private Health Number: Alphanumeric, 8–12 characters
    };
    // Add corresponding error messages
    const errorMessages = {
      ambulanceNumber:
        "Enter 3 letters followed by 3–4 digits, e.g., 'AMB1234' or 5–7 digits, e.g., '1234567'.",
      medicareNumber: "Enter in the format '1234 56789 00' or '1234567890'.",
      postCode: "Enter exactly 4 digits, e.g., '1234'.",
      pensionNumber: "Enter 8–10 alphanumeric characters.",
      dvaNumber:
        "Enter 7 digits or 1 letter followed by 6 digits, e.g., 'A123456'.",
      macNumber: "Enter exactly 10 digits.",
      healthCareCard: "Enter exactly 9 alphanumeric characters.",
      trn: "Enter exactly 9 digits.",
      acmps: "Enter 5–15 alphanumeric characters.",
      sparc: "Enter 5–15 alphanumeric characters.",
      wsm: "Enter 5–15 alphanumeric characters.",
      reh: "Enter 5–15 alphanumeric characters.",
      macReferralCode: "Enter exactly 10 digits.",
      myAgedCareNumber: "Enter exactly 10 digits.",
      PrivateHealth: "Enter 8–12 alphanumeric characters.",
    };

    const validIds = [
      "ambulanceNumber",
      "medicareNumber",
      "postCode",
      "pensionNumber",
      "dvaNumber",
      "macNumber",
      "healthCareCard",
      "trn",
      "acmps",
      "sparc",
      "wsm",
      "reh",
      "macReferralCode",
      "myAgedCareNumber",
      "PrivateHealth",
    ];

    // Handle validation
    if (validIds.includes(event.target.id)) {
      const fieldId = event.target.id;
      const isValid = patterns[fieldId]?.test(value);
      setErrors((prevErrors) => {
        if (!isValid && value !== "") {
          // Add/update error for the current field
          return {
            ...prevErrors,
            [fieldId]: errorMessages[fieldId],
          };
        } else {
          // Remove error for the current field if valid
          const { [fieldId]: removedError, ...remainingErrors } = prevErrors;
          return remainingErrors;
        }
      });
    }

    if (event.target.id === "dateOfBirth") {
      const age = calculateAge(value);
      setDetailsForm((prevState) => {
        const updatedStateWithAge = { ...prevState, age: age };
        dispatch(upsertData(updatedStateWithAge));
        return updatedStateWithAge;
      });
    }

    setDetailsForm((prevState) => {
      const updatedState = { ...prevState, [event.target.id]: value };
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
    console.log("Zaid siddiqui");
    addValidationMessage("Personal Details Updated Successfully", "success");

    dispatch(deleteData());
    fetchDataAsync();
    setDetailsEdit(false);
    // you should keep one blank space after the details
    // setSelectedComponent("Details ");
  };

  useEffect(() => {
    if (isButtonClicked) {
      console.log("Registering save function for Details...");
      onSaveReady("Details", handleSaveButton()); // Register handleSaveButton for Profile
      // Reset after registration
      setIsButtonClicked(false);
    }
  }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

  const maritalData = [
    "Single",
    "Married",
    "De Facto Relationship",
    "Separated",
    "Divorced",
    "Widowed",
    "Registered Relationship"
  ];
  const religions = ["Christianity", 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Sikhism', 'Jainism']

  const SectionHeader = ({ icon: Icon, title, expanded, onToggle, required }) => (
      <div
      onClick={onToggle}
      className="flex items-center justify-between p-4 glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
          <Icon className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}

        </h3>
      </div>
      {expanded ? (
        <Minus className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
      ) : (
        <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
      )}
    </div>
  );

  const FormField = ({ label, id, type = "text", value, error, options, disabled = false, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {type === "select" ? (
        <div className="relative">
          <select
            id={id}
            value={value || ""}
            onChange={handleChange}
            disabled={disabled || disableSection}
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none disabled:opacity-50"
          >
            <option value="">Select {label}</option>
            {options?.map((opt, idx) => (
              <option key={idx} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || disableSection}
          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 min-h-[100px]"
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || disableSection}
          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
        />
      )}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <Info className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );

  const Checkbox = ({ id, label, checked, disabled }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        name="checkbox"
        checked={checked || false}
        onChange={handleChange}
        disabled={disabled || disableSection}
        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Address Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={MapPin}
          title="Address Details"
          expanded={sections.address}
          onToggle={() => setSections(prev => ({ ...prev, address: !prev.address }))}
          required
        />

        {sections.address && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            <FormField
              label="Address Line 1"
              id="addressLine1"
              value={detailsForm.addressLine1}
            />
            <FormField
              label="Address Line 2"
              id="addressLine2"
              value={detailsForm.addressLine2}
            />
            <FormField
              label="Suburb"
              id="suburb"
              value={detailsForm.suburb}
            />
            <FormField
              label="State"
              id="state"
              value={detailsForm.state}
            />
            <FormField
              label="Postcode"
              id="postCode"
              type="number"
              value={detailsForm.postCode}
              error={errors?.postCode}
            />
            <FormField
              label="Contact Preference"
              id="contactPreference"
              type="select"
              value={detailsForm.contactPreference}
              options={contactPref.map(item => ({
                label: item.ParamDesc,
                value: item.ParamValue
              }))}
            />
          </div>
        )}
      </div>

      {/* General Details Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={User}
          title="Personal Information"
          expanded={sections.general}
          onToggle={() => setSections(prev => ({ ...prev, general: !prev.general }))}
          required
        />

        {sections.general && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            <FormField
              label="Place of Birth"
              id="placeOfBirth"
              value={detailsForm.placeOfBirth}
            />
            <FormField
              label="Date of Birth"
              id="dateOfBirth"
              type="date"
              value={detailsForm.dateOfBirth}
            />
            <FormField
              label="Age"
              id="age"
              value={detailsForm.age}
              disabled={true}
            />
            <FormField
              label="Marital Status"
              id="maritalStatus"
              type="select"
              value={detailsForm.maritalStatus}
              options={maritalData}
            />
            <FormField
              label="Living Circumstances"
              id="livingCircumstances"
              type="select"
              value={detailsForm.livingCircumstances}
              options={livCircum.map(item => ({
                label: item.ParamDesc,
                value: item.ParamValue
              }))}
            />
            <FormField
              label="Religion"
              id="religion"
              type="select"
              value={detailsForm.religion}
              options={religions}
            />
          </div>
        )}
      </div>

      {/* Identity Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Heart}
          title="Identity & Cultural Information"
          expanded={sections.identity}
          onToggle={() => setSections(prev => ({ ...prev, identity: !prev.identity }))}
        />

        {sections.identity && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox
                id="lgbtiqa"
                label="LGBTIQA+"
                checked={detailsForm.lgbtiqa}
              />
              <Checkbox
                id="cald"
                label="CALD"
                checked={detailsForm.cald}
              />
              <Checkbox
                id="aboriginal"
                label="Aboriginal"
                checked={detailsForm.aboriginal}
              />
              <Checkbox
                id="torresStraitIslander"
                label="Torres Strait Islander"
                checked={detailsForm.torresStraitIslander}
              />
              <Checkbox
                id="englishSpeaking"
                label="English Speaking"
                checked={detailsForm.englishSpeaking}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Other Identities"
                id="otherIdentities"
                type="textarea"
                value={detailsForm.otherIdentities}
              />
              <FormField
                label="Other Languages"
                id="otherLanguages"
                type="textarea"
                value={detailsForm.otherLanguages}
              />
            </div>
          </div>
        )}
      </div>

      {/* Health & Support Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Shield}
          title="Health & Support Information"
          expanded={sections.health}
          onToggle={() => setSections(prev => ({ ...prev, health: !prev.health }))}
        />

        {sections.health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            <FormField
              label="Medicare Number"
              id="medicareNumber"
              type="text"
              value={detailsForm.medicareNumber}
              error={errors?.medicareNumber}
            />
            <FormField
              label="Health Care Card"
              id="healthCareCard"
              type="text"
              value={detailsForm.healthCareCard}
              error={errors?.healthCareCard}
            />
            <FormField
              label="Private Health"
              id="privateHealth"
              type="text"
              value={detailsForm.privateHealth}
              error={errors?.privateHealth}
            />
          </div>
        )}
      </div>

      {/* Financial Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Building2}
          title="Financial & Legal Information"
          expanded={sections.financial}
          onToggle={() => setSections(prev => ({ ...prev, financial: !prev.financial }))}
        />

        {sections.financial && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <FormField
              label="Financial and Legal Status"
              id="financialAndLegalStatus"
              type="textarea"
              value={detailsForm.financialAndLegalStatus}
            />
            <FormField
              label="Legal Orders"
              id="legalOrders"
              type="select"
              value={detailsForm.legalOrders}
              options={legalOrders.map(item => ({
                label: item.ParamDesc,
                value: item.ParamValue
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Personal;