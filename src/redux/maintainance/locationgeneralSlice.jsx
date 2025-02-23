import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    profileForm: {
        Code: "",
        Description: "",
        Suburb: "",
        PostCode: "",
        State: "",
        Email: "",
        AddressLine1: "",
        AddressLine2: "",
        AccountingCode: "",
        Fax: "",
        Phone: "",
        CaseManager: "",
        Area: "",
        IsActive: "",
        DeleteStatus: "",
    },
};

const locationgeneralSlice = createSlice({
    name: "locationgeneral",
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

export const {upsertData, deleteData} = locationgeneralSlice.actions;
export default locationgeneralSlice.reducer;
