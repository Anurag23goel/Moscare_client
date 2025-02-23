import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    engagementForm: {
        startDate: "",
        endDate: "",
        probationDate: "",
        onHoldStartDate: "",
        onHoldEndDate: "",
        onholdReason: "",
        award: "",
        awardSector: "",
        payPoint: "",
        hasResigned: false,
        canRehire: false,
        effectiveAsOf: "",
        keysReturned: "",
        supportFileUpdated: "",
        payrollUpdated: "",
        organisationNotified: "",
        reason: "",
    },
};

const engagementSlice = createSlice({
    name: "workerengagement",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.engagementForm = {...action.payload};
        },
        deleteData: (state) => {
            state.engagementForm = initialState.engagementForm;
        },
    },
});

export const {upsertData, deleteData} = engagementSlice.actions;
export default engagementSlice.reducer;
