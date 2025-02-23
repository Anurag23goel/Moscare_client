import {browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword,} from "firebase/auth";
import {auth} from "./firebaseConfig";
import Cookies from "js-cookie";
import {postData} from "@/utility/api_utility";

// Function to handle login
export const doSignInWithEmailAndPassword = (email, password) => {
    if (!email || !password) {
        // Return a rejected promise immediately for missing email or password
        return Promise.reject({code: "auth/missing-email-or-password"});
    }

    return setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log("Attempting sign-in with email and password:", email, password);
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            const user = userCredential.user;
            return setAuthToken(user).then(() => {
                startTokenRefresh(user);
                return {success: true};
            });
        })
        .catch((error) => {
            console.error("Sign In Error:", error);

            let errorMessage;
            switch (error.code) {
                case "auth/missing-email-or-password":
                    errorMessage = "Email and password are required.";
                    break;
                case "auth/too-many-requests":
                    errorMessage = "Too many requests. Please wait a moment before trying again.";
                    break;
                case "auth/invalid-credential":
                    errorMessage = "Invalid email or password.";
                    break;
                case "auth/user-not-found":
                    errorMessage = "User not found.";
                    break;
                case "auth/wrong-password":
                    errorMessage = "Incorrect password.";
                    break;
                case "auth/missing-password":
                    errorMessage = "Password is required.";
                    break;
                default:
                    errorMessage = "An unknown error occurred.";
            }

            return {success: false, message: errorMessage};
        });
};


// Function to set the auth token and User ID in cookies
const setAuthToken = async (user) => {
    try {
        const token = await user.getIdToken(true);
        Cookies.set("AuthToken", token, {expires: 1});
        const userIdResponse = await postData("/api/getUserIDByEmail", {email: user.email});
        if (userIdResponse && userIdResponse.User_ID) {
            Cookies.set("User_ID", userIdResponse.User_ID, {expires: 1});
        } else {
            throw new Error("User ID not found");
        }
    } catch (error) {
        console.error("Error setting auth token:", error);
    }
};

// Function to start a token refresh interval
const startTokenRefresh = (user) => {
    const refreshInterval = 55 * 60 * 1000; // 55 minutes

    const refreshHandler = async () => {
        try {
            const newToken = await user.getIdToken(true);
            Cookies.set("AuthToken", newToken, {expires: 1});
        } catch (error) {
            console.error("Token refresh error:", error);
            clearInterval(refreshTimer); // Stop the interval on error
        }
    };

    // Set interval to refresh token
    const refreshTimer = setInterval(refreshHandler, refreshInterval);

    // Clear interval when user logs out
    onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            clearInterval(refreshTimer);
        }
    });
};

// Initialize Auth listener for changes
export const initializeAuthListener = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await setAuthToken(user);
            startTokenRefresh(user);
        } else {
            Cookies.remove("AuthToken");
            Cookies.remove("User_ID");
        }
    });
};

// Initialize full authentication process (call in _app.js)
export const initializeAuth = () => {
    initializeAuthListener();
};