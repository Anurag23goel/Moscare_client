import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    detailsForm: {
        FacilityStatus: "",
        FacilityType: "",
        Staff: "",
        Client: "",

        // Comments
        Comments: "",

        // Financial and Legal Status
        FinancialLegalStatus: "",

        // Work Health and Safety
        WorkHealthSafetyCheck: false,
        OHSNote: "",
        SafetyDevice: "",

        // Alerts
        AlertNote: "",
        PopUpProfile: false,
        RosterAlertNote: "",
        PopUpRoster: false,
    }
};

const locationdetailSlice = createSlice({
    name: "locationdetail",
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

export const {upsertData, deleteData} = locationdetailSlice.actions;
export default locationdetailSlice.reducer;
