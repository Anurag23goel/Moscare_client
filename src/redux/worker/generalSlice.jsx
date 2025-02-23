import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    profileForm: {
        dob: "",
        firstName: "",
        lastName: "",
        preferredName: "",
        gender: "",
        role: "",
        workerNumber: "",
        webAvailability: "",
        age: "",
        phone: "",
        phone2: "",
        email: "",
        status: "",
        carerCode: "",
        caseManager: "",
        caseManager2: "",
        area: "",
        groups: "",
        webUsername: "",
        division: "",
        webEnabled: false,
        vOnboardPortal: false,
        current: false,
        consentDisplayPhoto: false,
        vAssessmentPortal: false,
        IsActive: '', //
        DeleteStatus: '',
    },
};

const generalSlice = createSlice({
    name: "workergeneral",
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
