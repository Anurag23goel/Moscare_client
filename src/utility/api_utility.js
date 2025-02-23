import {doSignInWithEmailAndPassword} from "../config/auth";
import axios from "axios";
import Router from "next/router";
import Cookies from "js-cookie";

console.log("public moscare env file ", process.env.NEXT_PUBLIC_MOSCARE);

// Set up the base URL from environment variables
const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_MOSCARE,
});

// Add Authorization token to request headers if available
API.interceptors.request.use((config) => {
    const token = Cookies.get("AuthToken");
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
});

// Helper function to re-login
const reAuthenticate = async (redirect) => {
    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password");

    if (email && password) {
        const result = await doSignInWithEmailAndPassword(email, password);
        if (result.success) {
            Router.push(redirect).then(() => {
                Router.reload();
            });
        } else {
            window.location.href = "/auth/login";
        }
    } else {
        window.location.href = "/auth/login";
    }
};

// GET request function
export const fetchData = async (endpoint, customHeaders = {}, redirect) => {
    try {
        const defaultHeaders = {
            "Content-Type": "application/json",
            'x-tenant-id': localStorage.getItem('companyName'),
        };
        // Merge default headers with custom headers passed for specific requests
        const headers = {...defaultHeaders, ...customHeaders};
        if (!customHeaders['x-tenant-id']) {
            headers['x-tenant-id'] = defaultHeaders['x-tenant-id'];
        }

        const response = await API.get(endpoint, {headers});
        return response.data;
    } catch (error) {
        if ([401, 403, 405].includes(error.response?.status)) {
            await reAuthenticate(redirect);
        } else {
            throw error.response;
        }
    }
};

// POST request function
export const postData = async (endpoint, data, redirect) => {
    try {

        const response = await API.post(endpoint, data, {
            headers: {
                'Content-Type': "application/json",
                'x-tenant-id': localStorage.getItem('companyName'),
            }
        });
        return response.data;
    } catch (error) {
        if ([401, 403, 405].includes(error.response?.status)) {
            await reAuthenticate(redirect);
        } else {
            throw error.response;
        }
    }
};

// PUT request function
export const putData = async (endpoint, data, redirect) => {
    try {
        const response = await API.put(endpoint, data, {
            headers: {
                'Content-Type': "application/json",
                'x-tenant-id': localStorage.getItem('companyName'),
            }
        });
        return response.data;
    } catch (error) {
        if ([401, 403, 405].includes(error.response?.status)) {
            await reAuthenticate(redirect);
        } else {
            throw error.response;
        }
    }
};

// DELETE request function
export const deleteData = async (endpoint, data, redirect) => {
    try {
        const response = await API.delete(endpoint, {data}, {
            headers: {
                'Content-Type': "application/json",
                'x-tenant-id': localStorage.getItem('companyName'),
            }
        });
        return response.data;
    } catch (error) {
        if ([401, 403, 405].includes(error.response?.status)) {
            await reAuthenticate(redirect);
        } else {
            throw error.response;
        }
    }
};

// Preflight request function (OPTIONS)
// OAuth2 Token Fetch
export const getOAuth2Token = async () => {
    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const userId = getCookieValue("User_ID");
    console.log("User_ID", userId);

    try {
        const data = await fetchData(`/api/getOAuthAccessToken/${userId}`, window.location.href);
        return data.access_token;
    } catch (error) {
        console.log(error);
        alert("User might not have access to this feature");
    }
};

// Fetch User Roles Function
export const fetchUserRoles = async (menuId, text, setDisableSection, setCanDelete) => {
    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };

    try {
        const userId = getCookieValue("User_ID");
        console.log("User_ID", userId);
        const rolesData = await fetchData(`/api/getRolesUser/${userId}`, window.location.href);

        console.log("Roles Data", rolesData);

        // Get roles with ReadOnly = 0
        const WriteData = rolesData.filter((role) => role.ReadOnly === 0);
        const specificRead = WriteData.filter(
            (role) => role.Menu_ID === menuId && role.ReadOnly === 0
        );

        console.log(`${text} Condition`, specificRead);

        // Disable section if user has no write access
        setDisableSection(specificRead.length === 0);

        // Fetch CanDelete value for the menu
        const deletePermission = rolesData.find((role) => role.Menu_ID === menuId)?.CanDelete === 1;

        console.log(`Delete Permission for ${menuId}:`, deletePermission);

        // Only call setCanDelete if it is provided and a function
        if (setCanDelete && typeof setCanDelete === "function") {
            setCanDelete(deletePermission);
        }
    } catch (error) {
        console.error("Error fetching user roles:", error);
    }
};


// Function to get columns dynamically from the table
export const getColumns = (data) => {

    if (!data?.data || data.data.length === 0) {
        console.error("No data available to generate columns");
        return;
    }
    const columns = Object.keys(data?.data[0] || {}).map((key) => ({
        field: key,
        headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),// Camel case to spaced
        hide: false
    }));

    console.log("Extracted columns:", columns);
    return columns;
}
