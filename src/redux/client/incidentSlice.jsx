import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    incidentForm: {
        //Step 1
        IncidentID: '',
        ClientID: '',
        AccidentType: '',
        AdditionalInfo: '',

        //Incidents
        IncidentRelateTo: [],
        IncidentDate: '',
        IncidentTime: '',
        IncidentLocation: '',
        IncidentType: [],
        IncidentDetail: '',
        InjuryDetail: '',
        IncidentCircumstance: '',
        IncidentRestrictivePractice: [],
        RestrictivePracticeUse: '',
        IncidentSuggestion: '',
        IncidentImmediateAction: [],
        IncidentOutcome: [],
        IncidentReportedBy: '',

        //Hazard / Risk
        HazardRelateTo: [],
        HazardDate: '',
        HazardType: [],
        HazardDetail: '',
        HazardAction: [],
        HAzardSuggestion: '',
        HazardAdditionalInfo: '',
        HazardReportedBy: '',

        //Step 2
        Priority: "",
        Category: "",
        Note: "",
        CreatedOn: "",
        RemindOn: "",
        ClosedDate: "",
        CreatedBy: "",
        AssignedTo: "",
        LinkToWorker: "",
        Collaborators: "",
        NoteDate: "",
        IncidentStatus: "",
        TwentyfourHrSubmitted: false,
        isReportable: false,
        FiveHrSubmitted: false,
        EditNote: false,
    }
}

const incidentSlice = createSlice({
    name: "clientincident",
    initialState: initialState,
    reducers: {
        upsertData: (state, action) => {
            state.incidentForm = {...action.payload};
        },
        deleteData: (state) => {
            state.incidentForm = initialState.incidentForm;
        },
    },
});

export const {upsertData, deleteData} = incidentSlice.actions;
export default incidentSlice.reducer;