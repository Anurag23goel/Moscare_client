import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    agreementForm: {
        AgreementCode: '',
        ClientID: '',
        AgreementType: '',
        BudgetPeriod: '',
        Budget: '',
        BudgetHours: '',
        KM: '',
        Reference1: '',
        Reference2: '',
        Reference3: '',
        StartDate: '',
        EndDate: '',
        AlertDate: '',
        PayerCode: '',
        AreaCode: '',
        Note: '',
        KMPayerCode: '',
        OvdKMChargeCode: '',
        OvdKMChargeRate: '',
        ClientContributionPayer: '',
        CHKOvdKMCharge: '',
        CHKSepPayerKMChargeToClient: '',
        CHKExcldHoliday: '',
        CHKPayRates: '',
        CHKChargeRates: '',

        ChangeRateNDISRegion: '',
        NDISActivityType: '',
        NDISFundingManagement: '',
        MMMLevel: '',
        OvdKMCodeNDIS: '',
        CnvrtKMToTime: '',
    }
}

const agreementSlice = createSlice({
    name: "agreement",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.agreementForm = {...action.payload};
        },
        deleteData: (state) => {
            state.agreementForm = initialState.agreementForm;
        },
    },
});

export const {upsertData, deleteData} = agreementSlice.actions;
export default agreementSlice.reducer;