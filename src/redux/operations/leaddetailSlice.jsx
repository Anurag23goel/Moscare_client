import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    detailsForm: {
        AddressLine1: "",
        AddressLine2: "",
        Suburb: "",
        State: "",
        Postcode: "",

        // Comments
        Comments: "",

        // Lead Notes
        LeadNotes: "",

        // Vacancy
        Vacancy: "",

        // General Details
        ContactPreference: "",
        FundingType: "",
        lgbtiqa: false,
        cald: false,
        aboriginal: false,
        torresStraitIslander: false,
        atsIslander: false,
        OtherIdentities: "",
        OtherLanguages: "",
        InterpreterRequired: false,
        AssistiveTechnology: false,
        Auslan: false,
        Binary: false,
        TTL: false,
        OtherCommunicationAssistance: "",
        MACReferralCode: "",
        MyAgedCareNumber: "",
        PensionNumber: "",
        MedicareNumber: "",
        AmbulanceNumber: "",
        NDISNumber: "",
        StatementGoalsAspirations: "",


        // Health
        PrimaryDisability: "",
        AssociatedDisability: false,
        Medication: "",
        Allergy: false,
        OtherRelevantHealthInformation: "",

        // Financial and legal Status
        FinancialLegalStatus: "",
        LegalOrders: "",
        VulnerableFinancial: false,
    }
};


const leaddetailSlice = createSlice({
    name: "leaddetail",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.profileForm = {...action.payload};
        },
        deleteData: (state) => {
            state.profileForm = initialState.profileForm;
        },
    },
});

export const {upsertData, deleteData} = leaddetailSlice.actions;
export default leaddetailSlice.reducer;
