import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    preferencesForm: {
        gender: "",
        addtionalPreferences: "",
        language: [],
        culture: [],
        interests: [],
        skills: [],
        training: [],
        nonSmoker: false,
        petFriendly: false,
    },
};

const preferencesSlice = createSlice({
    name: "clientpreferences",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.preferencesForm = {...action.payload};
        },
        deleteData: (state) => {
            state.preferencesForm = initialState.preferencesForm;
        },
    },
});

export const {upsertData, deleteData} = preferencesSlice.actions;
export default preferencesSlice.reducer;
