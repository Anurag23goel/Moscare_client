import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    financeForm: {
        // bank details
        accountName: "",
        bank: "",
        bsb: "",
        account: "",
        percentage: "",
        accountName2: "",
        bank2: "",
        bsb2: "",
        account2: "",
        percentage2: "",
        accountName3: "",
        bank3: "",
        bsb3: "",
        account3: "",
        percentage3: "",

        // part time req
        mo: "",
        tu: "",
        we: "",
        th: "",
        fr: "",
        sa: "",
        su: "",
        moTime: "",
        tuTime: "",
        weTime: "",
        thTime: "",
        frTime: "",
        saTime: "",
        suTime: "",

        // finance details
        budgetHourDay: "",
        payRateLevel: "",
        overnightRate: "",
        firstAidAllowance: "",
        payNotes: "",
        workerType: "",
        employmentType: "",
        tfn: "",
        abn: "",
        residency: "",
        hecsFsDebt: "",
        taxFree: "",
        registeredGst: "",
        superFundName: "",
        policyNumber: "",
        memberNumber: "",
        usiSpin: "",
        accountingCode: "",
        councilReference: "",
        hcp: "",
        chsp: "",
        insurance: "",
        insurer: "",
        insurancePolicyNo: "",

        // other details
        externalId1: "",
        externalId2: "",
    },
};

const financeSlice = createSlice({
    name: "workerfinance",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.financeForm = {...state.financeForm, ...action.payload};
        },
        deleteData: (state) => {
            state.financeForm = initialState.financeForm;
        },
    },
});

export const {upsertData, deleteData} = financeSlice.actions;
export default financeSlice.reducer;
