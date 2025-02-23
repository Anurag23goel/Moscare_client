import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    profileForm: {
        Title: "",
        Organisation: "",
        EmailWork: "",
        EmailPersonal: "",
        Skype: "",
        FirstName: "",
        Description: "",
        Other: "",
        LastName: "",
        Position: "",
        WebUsername: "",
        Mobile: "",
        DefaultContactType: "",
        MobileOther: "",
        vAboutMe: false,
        Dob: "",
        PersonalContact: false,
        AreaCode1: "",
        AreaCode2: "",
        AreaCode3: "",
        Phone1: "",
        Phone2: "",
        Phone3: "",
        Extension1: "",
        Extension2: "",
        Extension3: "",
        AddressLine1: "",
        AddressLine2: "",
        Suburb: "",
        State: "",
        Postcode: "",
        Note: "",
        AccountNote: "",

        // Hacc
        Slk: "",
        IsDobEstimated: "",
        GenderCode: "",
        CountryOfBirth: "",
        AustralianStateTerritory: "",
        PreferredLanguage: "",
        IndigenousStatus: "",
        ResidencyStatus: "",

        // vAboutMe
        RequestNewService: false,
        ViewBudgetDetails: false,
        AccessMyDocuments: false,
        AccessMyExpenses: false,
        AccessMyQuotes: false,
        AccessMessages: false,
        AccessMyForms: false,
        CanSignature: false,
    },
};

const contactgeneralSlice = createSlice({
    name: "contactgeneral",
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

export const {upsertData, deleteData} = contactgeneralSlice.actions;
export default contactgeneralSlice.reducer;
