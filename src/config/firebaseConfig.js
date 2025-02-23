// Import the functions you need from the SDKs you need
import {getApps, initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getAnalytics} from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbmRwCeBbrKmHHBJ2EKjff15wCtiCSJoc",
    authDomain: "moscare-dev.firebaseapp.com",
    projectId: "moscare-dev",
    storageBucket: "moscare-dev.firebasestorage.app",
    messagingSenderId: "754277003448",
    appId: "1:754277003448:web:5066828e0cdb85d631044d",
    measurementId: "G-WGZX03RBSB"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}
const auth = getAuth(app);


let analytics;

if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export {app, auth, analytics};