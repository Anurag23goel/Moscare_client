import {createSlice} from "@reduxjs/toolkit";

// Default initial state
const initialState = {
    detailsForm: {
        searchAddress: "",
        addressLine1: "",
        addressLine2: "",
        searchsuburbOrPostcode: "",
        suburb: "",
        state: "",
        postCode: "",
        lgbtiqa: "",
        cald: "",
        aboriginal: "",
        torresStraitIslander: "",
        atsIslander: "",
        ethnicity: "",
        languages: "",
        cultures: "",
        interests: "",
        marital: "",
        website: "",
        isSmoker: "",
        petFriendly: "",
        workingwithChildren: "",
        rosterConflictExempt: "",
        restrictions: "",
        allergies: "",
        medicalConditions: "",
        injuries: "",

        // nextkin data
        name_1: "",
        relation_1: "",
        phone_1: "",
        phone2_1: "",
        email_1: "",
        address_1: "",
        emergencyContact_1: "",
        name_2: "",
        relation_2: "",
        phone_2: "",
        phone2_2: "",
        email_2: "",
        address_2: "",
        emergencyContact_2: "",

        // covid19 req
        exemption: "",
        reportedtoMac1: "",
        covidVaccine1: "",
        reportedtoMac2: "",
        covidVaccine2: "",
        reportedtoMac3: "",
        booster: "",
        reportedtoMac4: "",
        inIsolation: "",
        isolationStart: "",
        isolationEnd: "",

        // vehicle details
        insurancePolicy: "",
        insuranceType: "",
        vehicleRegistration: "",
        reviewNotes: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleType: "",
        vehicleBodyType: "",
        driversLicence: "",
        driversLicenceNumber: "",
        restrictions: "",

        // ndis
        ndisClearance: "",
        screenCheckApplNo: "",
        screenCheckNo: "",
        screenCheckOutcome: "",
        clearanceDecision: "",
        outcomeExpiryDate: "",
        subParagraph: "",

        // employment
        oneOffShifts: "",
        otherEmployment: "",
        secondaryEmployment: "",
        contactPhone: "",
        contactEmail: "",

        // other details
        comments: "",
        descriptions: "",
        workerHeaderNote: "",
        noteAlert: "",
    },
};

const detailsSlice = createSlice({
    name: "workerdetails",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.detailsForm = {...action.payload};
        },
        deleteData: (state) => {
            state.detailsForm = initialState.detailsForm;
        },
    },
});

export const {upsertData, deleteData} = detailsSlice.actions;
export default detailsSlice.reducer;


