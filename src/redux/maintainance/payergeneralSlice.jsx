import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    profileForm: {
        PayerCode: "",
        PayerName: "",
        ContactName: "",
        Suburb: "",
        Postcode: "",
        State: "",
        Phone: "",
        Email: "",
        AddressLine1: "",
        AddressLine2: "",
        Active: false,
        AccountingCode: "",
        Category: "",
        Salutation: "",
        Abn: "",
        Mobile: "",
    },
};

const payergeneralSlice = createSlice({
    name: "payergeneral",
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

export const {upsertData, deleteData} = payergeneralSlice.actions;
export default payergeneralSlice.reducer;
