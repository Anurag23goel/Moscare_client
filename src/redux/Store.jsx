import {combineReducers, configureStore} from "@reduxjs/toolkit";
import financeReducer from "./worker/financeSlice";
import availabilityReducer from "./worker/availabilitySlice";
import ndisReducer from "./client/ndisSlice";
import detailsReducer1 from "./worker/detailsSlice";
import detailsReducer2 from "./client/detailsSlice";
import generalReducer1 from "./worker/generalSlice";
import generalReducer2 from "./client/generalSlice";
import engagementReducer from "./worker/engagementSlice";
import agreementReducer from "./client/agreementSlice";
import preferencesReducer from "./client/preferencesSlice";
import contactgeneralReducer from "./maintainance/contactgeneralSlice";
import payergeneralReducer from "./maintainance/payergeneralSlice";
import locationgeneralReducer from "./maintainance/locationgeneralSlice"
import locationdetailReducer from "./maintainance/locationdetailSlice"
import leadgeneralReducer from "./operations/leadgeneralSlice";
import leaddetailReducer from "./operations/leaddetailSlice";
import incidentReducer from "./client/incidentSlice";
import notificationReducer from "@/redux/notifications/NotificationSlice";

const rootReducer = combineReducers({
    workergeneral: generalReducer1,
    workerdetails: detailsReducer1,
    workerfinance: financeReducer,
    workeravailability: availabilityReducer,
    workerengagement: engagementReducer,

    //
    clientdetails: detailsReducer2,
    clientgeneral: generalReducer2,
    clientpreferences: preferencesReducer,
    clientndis: ndisReducer,
    clientincident: incidentReducer,

    //
    agreement: agreementReducer,

    //
    contactgeneral: contactgeneralReducer,
    payergeneral: payergeneralReducer,
    locationgeneral: locationgeneralReducer,
    locationdetail: locationdetailReducer,

    //
    leadgeneral: leadgeneralReducer,
    leaddetail: leaddetailReducer,

    //
    notification: notificationReducer,
});

const Store = configureStore({
    reducer: rootReducer,
});

export default Store;
