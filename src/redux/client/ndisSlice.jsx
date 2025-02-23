import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    ndisForm: {
        NDISNo: "",
        Aspirations: "",
        DailyLife: "",
        LivingOpt: "",
        OtherLivingArrangement: "",
        InformalSupports: "",
        OtherSupports: "",
        Participation: "",
        BudgetMgnt: "",
        Note: "",

        BowelCare: "",
        BowelCareNote: "",
        EnteralFeeding: "",
        EnteralFeedingNote: "",
        SubcutaneousInjections: "",
        SubcutaneousInjectionsNote: "",
        SevereDysphagia: "",
        SevereDysphagiaNote: "",
        Tracheostomy: "",
        TracheostomyNote: "",
        UrinaryCatheter: "",
        UrinaryCatheterNote: "",
        Ventilation: "",
        VentilationNote: "",
        Diabetes: "",
        DiabetesNote: "",
        Seizure: "",
        SeizureNote: "",
        PressureCareWounds: "",
        PressureCareWoundsNote: "",
        MealPreparationDelivery: "",
        MealPreparationDeliveryNote: "",
        StomaCare: "",
        StomaCareNote: "",
    },
};

const ndisSlice = createSlice({
    name: "clientndis",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.ndisForm = {...action.payload};
        },
        deleteData: (state) => {
            state.ndisForm = initialState.ndisForm;
        },
    },
});

export const {upsertData, deleteData} = ndisSlice.actions;
export default ndisSlice.reducer;


