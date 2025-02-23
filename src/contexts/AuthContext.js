import {createContext, useContext, useEffect, useState} from "react";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import Cookies from "js-cookie";
import {auth} from "../config/firebaseConfig";
import {postData} from "@/utility/api_utility";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await handleUserLogin(user);
            } else {
                handleUserLogout();
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleUserLogin = async (user) => {
        const token = await user.getIdToken(true);
        Cookies.set("AuthToken", token, {expires: 1});
        const userIdResponse = await postData("/api/getUserIDByEmail", {email: user.email});

        if (userIdResponse && userIdResponse.User_ID) {
            Cookies.set("User_ID", userIdResponse.User_ID, {expires: 1});
            setCurrentUser(user);
            startTokenRefresh(user);
        } else {
            throw new Error("User ID not found");
        }
    };

    const handleUserLogout = () => {
        setCurrentUser(null);
        Cookies.remove("AuthToken");
        Cookies.remove("User_ID");
        localStorage.removeItem("companyName");
    };

    const startTokenRefresh = (user) => {
        const refreshInterval = 55 * 60 * 1000; // Refresh every 55 minutes
        const refreshToken = async () => {
            try {
                const newToken = await user.getIdToken(true);
                Cookies.set("AuthToken", newToken, {expires: 1});
            } catch (error) {
                console.error("Token refresh error:", error);
                clearInterval(refreshTimer);
            }
        };
        const refreshTimer = setInterval(refreshToken, refreshInterval);

        onAuthStateChanged(getAuth(), (currentUser) => {
            if (!currentUser) clearInterval(refreshTimer);
        });
    };

    const value = {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
