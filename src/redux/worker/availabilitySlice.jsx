import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    availabilityForm: {
        CurrentMo: [],
        CurrentMoStatus: "",
        CurrentTu: [],
        CurrentTuStatus: "",
        CurrentWe: [],
        CurrentWeStatus: "",
        CurrentTh: [],
        CurrentThStatus: "",
        CurrentFr: [],
        CurrentFrStatus: "",
        CurrentSa: [],
        CurrentSaStatus: "",
        CurrentSu: [],
        CurrentSuStatus: "",
        NextMo: [],
        NextMoStatus: "",
        NextTu: [],
        NextTuStatus: "",
        NextWe: [],
        NextWeStatus: "",
        NextTh: [],
        NextThStatus: "",
        NextFr: [],
        NextFrStatus: "",
        NextSa: [],
        NextSaStatus: "",
        NextSu: [],
        NextSuStatus: "",
    },
};

const availabilitySlice = createSlice({
    name: "workeravailability",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.availabilityForm = {...action.payload};
        },
        deleteData: (state) => {
            state.availabilityForm = initialState.availabilityForm;
        },
    },
});

export const {upsertData, deleteData} = availabilitySlice.actions;
export default availabilitySlice.reducer;
