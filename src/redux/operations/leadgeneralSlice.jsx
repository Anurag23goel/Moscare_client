import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    profileForm: {
        Title: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Type: "",
        PreferedName: "",
        Email: "",
        CaseManager: "",
        DOB: "",
        Age: "",
        gender: "",
        Mobile: "",
        Area: "",
        Division: "",
        Groups: "",
        LeadSource: "",
        Status: "",
        StartDate: "",
        FollowUpDate: "",
        FinalisedDate: "",
    },
};

const leadgeneralSlice = createSlice({
    name: "leadgeneral",
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

export const {upsertData, deleteData} = leadgeneralSlice.actions;
export default leadgeneralSlice.reducer;
