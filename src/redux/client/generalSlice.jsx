import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    profileForm: {
        title: '',
        middleName: '',
        firstName: '',
        lastName: '',
        preferredName: '',
        gender: '',
        phone: '',
        sms: '',
        phone2: '',
        ndisNumber: '',
        email: '',
        accountingCode: '',
        fundingType: '',
        payer: '',
        caseManager: '',
        caseManager2: '',
        area: '',
        groups: '',
        requireSignature: '',
        webUsername: '',
        division: '',
        locationRoster: '',
        webEnabled: false,
        vAboutMeEnabled: false,
        restrictedProfile: false,
        pfpConsent: false,
        phonePrefix: '+1', // Default country code
        phone2Prefix: '+1', // Default country code
        smsPrefix: '+1', // Default SMS country code
        IsActive: '', //
        DeleteStatus: '',
    },
};

const generalSlice = createSlice({
    name: "clientgeneral",
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

export const {upsertData, deleteData} = generalSlice.actions;
export default generalSlice.reducer;


