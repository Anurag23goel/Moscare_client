import styles from "@/styles/style.module.css";
import React, { useContext, useEffect, useState } from "react";
import { Box, Card, Checkbox, Fade, FormControlLabel } from "@mui/material";
import ColorContext from "@/contexts/ColorContext";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import { Col, Spinner } from "react-bootstrap";
import MButton from "@/components/widgets/MaterialButton";
import { fetchData, putData, fetchUserRoles } from "@/utility/api_utility";
import { useDispatch, useSelector } from "react-redux";
import { deleteData, upsertData } from "@/redux/client/detailsSlice";
import { useRouter } from "next/router";
import Modal from "@mui/material/Modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {
  Briefcase,
  Calendar,
  FileText,
  Users,
  Shield,
  AlertTriangle,
  ChevronDown,
  Plus,
  Minus,
  Info,
  Clock,
  Building2,
  FileCheck,
  CalendarDays,
  X,
  Search,
} from "lucide-react";
const Work = ({
  addValidationMessage,
  // setSelectedComponent,
  onTabChange,
  onSaveReady,
  isButtonClicked,
  setIsButtonClicked,
}) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  const router = useRouter();
  const { ClientID } = router.query;

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
  const [dementiaAndCognitiveImpairment, setDementiaAndCognitiveImpairment] =
    useState([]);

  const [clientTypes, setClientTypes] = useState([]);
  const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);

  const [isLoading, setIsLoading] = useState(true);
  const [disableSection, setDisableSection] = useState(false);
  const { colors, loading } = useContext(ColorContext);
  const [openModal, setOpenModal] = useState(false);

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

  const handleChooseButtonClick = () => {
    setOpenModal(true);
    // setTableOf(tableFor);
  };
  const [sections, setSections] = useState({
    service: true,
    referral: true,
    safety: true,
  });

  const getCovidStatus = async () => {
    const getCovidservicestatus = await fetchData(
      "/api/getCovidservicestatus",
      window.location.href
    );
    setCovidServiceStatus(getCovidservicestatus.data);
  };
  const getCarerStatusData = async () => {
    const getCarerstatus = await fetchData(
      "/api/getCarerstatus",
      window.location.href
    );
    setCareerStatus(getCarerstatus.data);
  };

  useEffect(() => {
    getCovidStatus();
    getCarerStatusData();
  }, []);

  const SectionHeader = ({
    icon: Icon,
    title,
    expanded,
    onToggle,
    required,
  }) => (
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

  const FormField = ({
    label,
    id,
    type = "text",
    value,
    error,
    options,
    disabled = false,
    className = "",
  }) => (
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
              <option key={idx} value={opt.value}>
                {opt.label}
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

  const referringAgencies = [
    {
      AgencyId: "1",
      AgencyCode: "WEB",
      AgencyName: "Website",
    },
    {
      AgencyId: "2",
      AgencyCode: "INSTAGRAM",
      AgencyName: "Instagram",
    },
  ];

  const fetchDataAsync = async () => {
    setIsLoading(true);

    try {
      // Fire off all fetch requests in parallel
      const [
        clientTypes,
        getContactPreference,
        getEmploymentType,
        getLivingcircumstances,
        getLegalorders,
        getCovidservicestatus,
        getCarerstatus,
        getBillingpreference,
        getExemption,
        getNeedsindicator,
        getMobilityLevel,
        getDementiaAndCognitiveImpairment,
        clientAddressDetails,
        clientGeneralDetails,
        clientComments,
        clientFinancialLegalStatus,
        clientServiceStatus,
        clientReferral,
        clientWorkHealthAndSafety,
        clientBillingDetails,
        clientFinanceCC,
        clientHealth,
        clientAlerts,
        clientVWorker,
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
        fetchData(`/api/getClientDetailsVWorkerData/${ClientID}`, window.location.href),
      ]);

      // Set state for all independent data
      setClientTypes(clientTypes.data);
      setContactPref(getContactPreference.data);
      setEmploymentType(getEmploymentType.data);
      setLivCircum(getLivingcircumstances.data);
      setLegalOrders(getLegalorders.data);
      setCovidServiceStatus(getCovidservicestatus.data);
      setCareerStatus(getCarerstatus.data);
      setBillingPreference(getBillingpreference.data);
      setExemption(getExemption.data);
      setNeedsIndicator(getNeedsindicator.data);
      setMobilityLevel(getMobilityLevel.data);
      setDementiaAndCognitiveImpairment(getDementiaAndCognitiveImpairment.data);

      // Process fetched details into the form object
      const fetchedDetailsForm = {
        // address data
        keyCode: clientAddressDetails.data[0]?.KeyCode,
        searchAddress: clientAddressDetails.data[0]?.SearchAddress,
        addressLine1: clientAddressDetails.data[0]?.AddressLine1,
        addressLine2: clientAddressDetails.data[0]?.AddressLine2,
        searchSuburborPoscode: clientAddressDetails.data[0]?.SearchSuburborPostcode,
        suburb: clientAddressDetails.data[0]?.Suburb,
        state: clientAddressDetails.data[0]?.State,
        postCode: clientAddressDetails.data[0]?.Postcode,
        postalAddress: clientAddressDetails.data[0]?.PostalAddress,
        contactPreference: clientAddressDetails.data[0]?.ContactPreference,

        // general details
        placeOfBirth: clientGeneralDetails.data[0]?.PlaceOfBirth,
        dateOfBirth: clientGeneralDetails.data[0]?.DOB?.split(" ")[0],
        age: clientGeneralDetails.data[0]?.Age,
        maritalStatus: clientGeneralDetails.data[0]?.MaritalStatus,
        employmentStatus: clientGeneralDetails.data[0]?.EmploymentStatus,
        fax: clientGeneralDetails.data[0]?.Fax,
        livingCircumstances: clientGeneralDetails.data[0]?.LivingCircumstances,
        interpreterRequired: clientGeneralDetails.data[0]?.InterpreterRequired,
        assistiveTechnology: clientGeneralDetails.data[0]?.AssistiveTechnology,
        auslan: clientGeneralDetails.data[0]?.Auslan,
        binary: clientGeneralDetails.data[0]?.Binary,
        ttl: clientGeneralDetails.data[0]?.TTL,
        otherCommunicationAssistance: clientGeneralDetails.data[0]?.OtherCommunicationAssistance,
        lgbtiqa: clientGeneralDetails.data[0]?.LGBTIQA,
        cald: clientGeneralDetails.data[0]?.CALD,
        aboriginal: clientGeneralDetails.data[0]?.Aboriginal,
        torresStraitIslander: clientGeneralDetails.data[0]?.TorresStraitIslander,
        aboriginalAndTorresStraitIslander: clientGeneralDetails.data[0]?.AboriginalAndTorresStraitIslander,
        otherIdentities: clientGeneralDetails.data[0]?.OtherIdentities,
        satss: clientGeneralDetails.data[0]?.SATSS,
        englishSpeaking: clientGeneralDetails.data[0]?.EnglishSpeaking,
        otherLanguages: clientGeneralDetails.data[0]?.OtherLanguages,
        acmps: clientGeneralDetails.data[0]?.ACMPS,
        sparc: clientGeneralDetails.data[0]?.SPARC,
        clientNumber: clientGeneralDetails.data[0]?.ClientNumber,
        pensionNumber: clientGeneralDetails.data[0]?.PensionNumber,
        medicareNumber: clientGeneralDetails.data[0]?.MedicareNumber,
        ambulanceNumber: clientGeneralDetails.data[0]?.AmbulanceNumber,
        dvaNumber: clientGeneralDetails.data[0]?.DVANumber,
        trn: clientGeneralDetails.data[0]?.TRN,
        wsm: clientGeneralDetails.data[0]?.WSM,
        reh: clientGeneralDetails.data[0]?.REH,
        macReferralCode: clientGeneralDetails.data[0]?.MACReferralCode,
        myAgedCareNumber: clientGeneralDetails.data[0]?.MyAgedCareNumber,
        privateHealth: clientGeneralDetails.data[0]?.PrivateHealth,
        companionCard: clientGeneralDetails.data[0]?.CompanionCard,
        healthCareCard: clientGeneralDetails.data[0]?.HealthCareCard,
        religion: clientGeneralDetails.data[0]?.Religion,
        spiritualWellbeing: clientGeneralDetails.data[0]?.SpiritualWellbeing,
        caregiverRoutine: clientGeneralDetails.data[0]?.CaregiverRoutine,

        // comments
        comments: clientComments.data[0]?.Comments,

        // financial and legal status
        financialAndLegalStatus: clientFinancialLegalStatus.data[0]?.FinancialAndLegalStatus,
        legalOrders: clientFinancialLegalStatus.data[0]?.LegalOrders,
        vulnerableToFinancial: clientFinancialLegalStatus.data[0]?.VulnerableToFinancial,

        // Service Status
        clientType: clientServiceStatus.data[0]?.ClientType,
        enquiryDate: clientServiceStatus.data[0]?.EnquiryDate,
        enquiryMinutes: clientServiceStatus.data[0]?.EnquiryMinutes,
        auditOptOut: clientServiceStatus.data[0]?.AuditOptOut,
        covidServiceStatus: clientServiceStatus.data[0]?.CovidServiceStatus,
        serviceStart: clientServiceStatus.data[0]?.ServiceStart,
        lastReviewDate: clientServiceStatus.data[0]?.LastReviewDate,
        serviceReviewDatePrimary: clientServiceStatus.data[0]?.ServiceReviewDatePrimary,
        serviceReviewDateSecondary: clientServiceStatus.data[0]?.ServiceReviewDateSecondary,
        serviceEnd: clientServiceStatus.data[0]?.ServiceEnd,
        reasonServiceEnded: clientServiceStatus.data[0]?.ReasonServiceEnded,
        auditorName: clientServiceStatus.data[0]?.AuditorName,
        auditDate: clientServiceStatus.data[0]?.AuditDate,

        // referral
        referral: clientReferral.data[0]?.Referral,
        referrer: clientReferral.data[0]?.Referrer,
        referringAgency: clientReferral.data[0]?.ReferringAgency,
        referralDate: clientReferral.data[0]?.ReferralDate,

        // work health and safety
        workHealthAndSafetyCheck: clientWorkHealthAndSafety.data[0]?.WorkHealthAndSafetyCheck,
        ohsNote: clientWorkHealthAndSafety.data[0]?.OHSNote,
        safetyDevice: clientWorkHealthAndSafety.data[0]?.SafetyDevice,
        vulnerableToFire: clientWorkHealthAndSafety.data[0]?.VulnerableToFire,
        vulnerableToPowerOutage: clientWorkHealthAndSafety.data[0]?.VulnerableToPowerOutage,
        vulnerableToFloods: clientWorkHealthAndSafety.data[0]?.VulnerableToFloods,
        vulnerableToSevereWeatherEvents: clientWorkHealthAndSafety.data[0]?.VulnerableToSevereWeatherEvents,
        receivingSupportFromOneWorkerOnly: clientWorkHealthAndSafety.data[0]?.ReceivingSupportFromOneWorkerOnly,
        livingAlone: clientWorkHealthAndSafety.data[0]?.LivingAlone,
        livingInRuralOrRemoteRegionWithLimitedServiceOptions: clientWorkHealthAndSafety.data[0]?.LivingInRuralOrRemoteRegionWithLimitedServiceOptions,
        sociallyIsolatedOrLackCloseRelationships: clientWorkHealthAndSafety.data[0]?.SociallyIsolatedOrLackCloseRelationships,
        fewOrNoFamilyOrFriendsWhoCheckInOnThem: clientWorkHealthAndSafety.data[0]?.FewOrNoFamilyOrFriendsWhoCheckInOnThem,
        cognitiveImpairmentAndAreUnableToProblemSolveOrSpeakUp: clientWorkHealthAndSafety.data[0]?.CognitiveImpairmentAndAreUnableToProblemSolveOrSpeakUp,
        communicationDifficulties: clientWorkHealthAndSafety.data[0]?.CommunicationDifficulties,
        limitedMobility: clientWorkHealthAndSafety.data[0]?.LimitedMobility,
        highlyDependentOnTheirCaregiver: clientWorkHealthAndSafety.data[0]?.HighlyDependentOnTheirCaregiver,
        requiresDailyPersonalSelfCareActivities: clientWorkHealthAndSafety.data[0]?.RequiresDailyPersonalSelfCareActivities,
        carerStatus: clientWorkHealthAndSafety.data[0]?.CarerStatus,

        // billing details
        billingPreference: clientBillingDetails.data[0]?.BillingPreference,
        billingName: clientBillingDetails.data[0]?.Name,
        billingAddressLine1: clientBillingDetails.data[0]?.AddressLine1,
        billingAddressLine2: clientBillingDetails.data[0]?.AddressLine2,
        billingSuburb: clientBillingDetails.data[0]?.Suburb,
        billingState: clientBillingDetails.data[0]?.State,
        billingPostCode: clientBillingDetails.data[0]?.Postcode,
        billingEmail: clientBillingDetails.data[0]?.Email,
        billingPhone1: clientBillingDetails.data[0]?.Phone1,
        billingPhone2: clientBillingDetails.data[0]?.Phone2,

        // finance - credit card
        creditCardNumber: clientFinanceCC.data[0]?.Number,
        creditExpiryDate: clientFinanceCC.data[0]?.ExpiryDate,
        creditCardType: clientFinanceCC.data[0]?.Type,
        creditCardName: clientFinanceCC.data[0]?.Name,

        // health
        covidVaccine1: clientHealth.data[0]?.CovidVaccine1,
        covidVaccine2: clientHealth.data[0]?.CovidVaccine2,
        boosterVaccine: clientHealth.data[0]?.BoosterVaccine,
        covidExemption: clientHealth.data[0]?.CovidExemption,
        inIsolation: clientHealth.data[0]?.InIsolation,
        isolationStartDate: clientHealth.data[0]?.IsolationStartDate,
        isolationEndDate: clientHealth.data[0]?.IsolationEndDate,
        weight: clientHealth.data[0]?.Weight,
        height: clientHealth.data[0]?.Height,
        includeProsthesis: clientHealth.data[0]?.IncludeProsthesis,
        amputationLevel: clientHealth.data[0]?.AmputationLevel,
        ampLeft: clientHealth.data[0]?.AmpLeft,
        ampRight: clientHealth.data[0]?.AmpRight,
        complexNeeds: clientHealth.data[0]?.ComplexNeeds,
        visionImpaired: clientHealth.data[0]?.VisionImpaired,
        hearingImpaired: clientHealth.data[0]?.HearingImpaired,
        speechImpaired: clientHealth.data[0]?.SpeechImpaired,
        needsIndicator: clientHealth.data[0]?.NeedsIndicator,
        diagonasedDisability: clientHealth.data[0]?.DiagonasedDisability,
        undiagnosedDisability: clientHealth.data[0]?.UndiagnosedDisability,
        disabilitySupportPension: clientHealth.data[0]?.DisabilitySupportPension,
        primaryDisablity: clientHealth.data[0]?.PrimaryDisablity,
        secondaryDisablity: clientHealth.data[0]?.SecondaryDisablity,
        associatedDisablity: clientHealth.data[0]?.AssociatedDisablity,
        associatedMedicalConditions: clientHealth.data[0]?.AssociatedMedicalConditions,
        mobilityLevel: clientHealth.data[0]?.MobilityLevel,
        manualHandlingRequired: clientHealth.data[0]?.ManualHandlingRequired,
        mobility: clientHealth.data[0]?.Mobility,
        transponderNo: clientHealth.data[0]?.TransponderNo,
        dementiaAndCognitiveImpairment: clientHealth.data[0]?.DementiaAndCognitiveImpairment,
        vulnerableClient: clientHealth.data[0]?.VulnerableClient,
        vulnerableStateRegistered: clientHealth.data[0]?.VulnerableStateRegistered,
        vulnerableToHeat: clientHealth.data[0]?.VulnerableToHeat,
        vulnerableReason: clientHealth.data[0]?.VulnerableReason,
        managementPlan: clientHealth.data[0]?.ManagementPlan,
        typeOfManagementPlan: clientHealth.data[0]?.TypeOfManagementPlan,
        medicationAdministration: clientHealth.data[0]?.MedicationAdministration,
        medicationPrompt: clientHealth.data[0]?.MedicationPrompt,
        selfAdministered: clientHealth.data[0]?.SelfAdministered,
        medication: clientHealth.data[0]?.Medication,
        DiagnosisAndPMHX: clientHealth.data[0]?.DiagnosisAndPMHX,
        oxygenSupport: clientHealth.data[0]?.OxygenSupport,
        mealtimeManagement: clientHealth.data[0]?.MealtimeManagement,
        mealtimeManagementNote: clientHealth.data[0]?.MealtimeManagementNote,
        allergy: clientHealth.data[0]?.Allergy,
        resusStatus: clientHealth.data[0]?.ResusStatus,
        promotingIndependence: clientHealth.data[0]?.PromotingIndependence,
        swallowingProblem: clientHealth.data[0]?.SwallowingProblem,
        assistanceRequired: clientHealth.data[0]?.AssistanceRequired,
        assistanceRequiredDescription: clientHealth.data[0]?.AssistanceRequiredDescription,
        dietType: clientHealth.data[0]?.DietType,
        feedingAidsRequired: clientHealth.data[0]?.FeedingAidsRequired,
        fluidType: clientHealth.data[0]?.FluidType,
        thickened: clientHealth.data[0]?.Thickened,
        thickenedLevel: clientHealth.data[0]?.ThickenedLevel,
        preferredContinence: clientHealth.data[0]?.PreferredContinence,
        preferredContinenceDescription: clientHealth.data[0]?.PreferredContinenceDescription,
        stomaBag: clientHealth.data[0]?.StomaBag,
        catheter: clientHealth.data[0]?.Catheter,
        suprapubic: clientHealth.data[0]?.Suprapubic,
        plainScore: clientHealth.data[0]?.PlainScore,
        whatRelievesPain: clientHealth.data[0]?.WhatRelievesPain,
        whatMakesPainWorse: clientHealth.data[0]?.WhatMakesPainWorse,
        sleepReview: clientHealth.data[0]?.SleepReview,
        skinIntegrity: clientHealth.data[0]?.SkinIntegrity,
        bradenScaleScore: clientHealth.data[0]?.BradenScaleScore,
        otherRelevantHealthInformation: clientHealth.data[0]?.OtherRelevantHealthInformation,

        // alerts
        alertNote: clientAlerts.data[0]?.AlertNote,
        popupInProfile: clientAlerts.data[0]?.PopupInProfile,
        rosterNote: clientAlerts.data[0]?.RosterNote,
        popupInRoster: clientAlerts.data[0]?.PopupInRoster,

        // client profile vWorker
        clientProfile: clientVWorker.data[0]?.ClientProfile,
        accesstoResidencyNotes: clientVWorker.data[0]?.AccesstoResidencyNotes,
        identifiedRisks: clientVWorker.data[0]?.IdentifiedRisks,
        livingArrangements: clientVWorker.data[0]?.LivingArrangements,
        shiftAlert: clientVWorker.data[0]?.ShiftAlert,
      };

      const mergedDetailsForm = mergeDetailsData(defaultDetailsForm, fetchedDetailsForm);
      setDetailsForm(mergedDetailsForm);

      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchDataAsync:", error);
      setIsLoading(false); // Ensure loading stops even on error
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
    // setDetailsEdit(true);
    // setSelectedComponent("Details *");
    const value =
      event.target.name === "checkbox"
        ? event.target.checked
        : event.target.value;

    if (event.target.id === "dateOfBirth") {
      const age = calculateAge(value);
      setDetailsForm((prevState) => {
        const updatedStateWithAge = { ...prevState, age: age };
        dispatch(upsertData(updatedStateWithAge));
        return updatedStateWithAge;
      });
    }

    if (event.target.id === "referral") {
      setDetailsForm((prevState) => {
        const updatedState = { ...prevState, referral: !referral };
        dispatch(upsertData(updatedState));
        return updatedState;
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
    addValidationMessage("Work Details Updated Successfully", "success");

    dispatch(deleteData());
    fetchDataAsync();
    // setDetailsEdit(false);
    // you should keep one blank space after the details
    // setSelectedComponent("Details ");
  };

  useEffect(() => {
    if (isButtonClicked) {
      console.log("Registering save function for Details...");
      onSaveReady("Details", handleSaveButton()); // Register handleSaveButton for Profile
      console.log("Registering save function for Details...");
      onSaveReady("Details", handleSaveButton()); // Register handleSaveButton for Profile

      // Reset after registration
      setIsButtonClicked(false);
      // Reset after registration
      setIsButtonClicked(false);
    }
  }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

  const handleModalTableRowClick = (row) => {
    console.log(row);
    setDetailsForm((prevState) => {
      const updatedState = {
        ...prevState,
        referringAgency: row.AgencyName,
      };
      dispatch(upsertData(updatedState));
      return updatedState;
    });
    setOpenModal(false);
  };

  const handleClearButtonClick = () => {
    setDetailsForm((prevState) => {
      const updatedState = { ...prevState, [`referringAgency`]: "" };
      dispatch(upsertData(updatedState));
      return updatedState;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Work Details
        </h2>
      </div>

      {/* Service Status Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Briefcase}
          title="Service Status"
          expanded={sections.service}
          onToggle={() =>
            setSections((prev) => ({ ...prev, service: !prev.service }))
          }
          required
        />

        {sections.service && (
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Client Type"
                id="clientType"
                type="select"
                value={detailsForm.clientType}
                options={clientTypes?.map((item) => ({
                  label: item.Type,
                  value: item.Type,
                }))}
              />
              <FormField
                label="Enquiry Date"
                id="enquiryDate"
                type="date"
                value={detailsForm.enquiryDate}
              />
              <FormField
                label="Service Start"
                id="serviceStart"
                type="date"
                value={detailsForm.serviceStart}
              />
              <FormField
                label="COVID Service Status"
                id="covidServiceStatus"
                type="select"
                value={detailsForm.covidServiceStatus}
                options={covidServiceStatus?.map((item) => ({
                  label: item.ParamDesc,
                  value: item.ParamValue,
                }))}
              />
              <FormField
                label="Last Review Date"
                id="lastReviewDate"
                type="date"
                value={detailsForm.lastReviewDate}
              />
              <FormField
                label="Service End"
                id="serviceEnd"
                type="date"
                value={detailsForm.serviceEnd}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Reason Service Ended"
                id="reasonServiceEnded"
                type="textarea"
                value={detailsForm.reasonServiceEnded}
              />
              <div className="space-y-4">
                <Checkbox
                  id="auditOptOut"
                  label="Audit opt-out"
                  checked={detailsForm.auditOptOut}
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => {}}
                    disabled={disableSection}
                    className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Delete shifts from date</span>
                  </button>
                  <button
                    onClick={() => {}}
                    disabled={disableSection}
                    className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                  >
                    <Users className="h-4 w-4" />
                    <span>Remove from chat groups</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Referral Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={FileText}
          title="Referral Information"
          expanded={sections.referral}
          onToggle={() =>
            setSections((prev) => ({ ...prev, referral: !prev.referral }))
          }
        />

        {sections.referral && (
          <div className="p-4 space-y-6">
            <Checkbox
              id="referral"
              label="Enable Referral"
              checked={detailsForm.referral}
            />

            {detailsForm.referral && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  label="Referrer"
                  id="referrer"
                  value={detailsForm.referrer}
                />
                <FormField
                  label="Referral Date"
                  id="referralDate"
                  type="date"
                  value={detailsForm.referralDate}
                />
                <div className="space-y-2">
                  <FormField
                    label="Referring Agency"
                    id="referringAgency"
                    value={detailsForm.referringAgency}
                    disabled={true}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleChooseButtonClick}
                      disabled={disableSection}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Search className="h-4 w-4" />
                      <span>Choose</span>
                    </button>
                    <button
                      onClick={handleClearButtonClick}
                      disabled={disableSection}
                      className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Work Health and Safety Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Shield}
          title="Work Health and Safety"
          expanded={sections.safety}
          onToggle={() =>
            setSections((prev) => ({ ...prev, safety: !prev.safety }))
          }
        />

        {sections.safety && (
          <div className="p-4 space-y-6">
            <Checkbox
              id="workHealthAndSafetyCheck"
              label="Work Health and Safety Check"
              checked={detailsForm.workHealthAndSafetyCheck}
            />

            {detailsForm.workHealthAndSafetyCheck && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="OH&S Note"
                    id="ohsNote"
                    type="textarea"
                    value={detailsForm.ohsNote}
                  />
                  <FormField
                    label="Safety Device"
                    id="safetyDevice"
                    type="textarea"
                    value={detailsForm.safetyDevice}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Checkbox
                    id="vulnerableToFire"
                    label="Vulnerable to Fire"
                    checked={detailsForm.vulnerableToFire}
                  />
                  <Checkbox
                    id="vulnerableToPowerOutage"
                    label="Vulnerable to Power Outage"
                    checked={detailsForm.vulnerableToPowerOutage}
                  />
                  <Checkbox
                    id="vulnerableToFloods"
                    label="Vulnerable to Floods"
                    checked={detailsForm.vulnerableToFloods}
                  />
                  <Checkbox
                    id="vulnerableToSevereWeatherEvents"
                    label="Vulnerable to Severe Weather"
                    checked={detailsForm.vulnerableToSevereWeatherEvents}
                  />
                  <Checkbox
                    id="livingAlone"
                    label="Living Alone"
                    checked={detailsForm.livingAlone}
                  />
                  <Checkbox
                    id="communicationDifficulties"
                    label="Communication Difficulties"
                    checked={detailsForm.communicationDifficulties}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Work;
