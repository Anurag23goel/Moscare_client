import React, {useContext, useEffect, useState} from "react";
import {Col, Modal, Row} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, getOAuth2Token, postData, putData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import AddIcon from '@mui/icons-material/Add';
import UpdateUser from "@/components/forms/settings/users/update_users";
import {Alert, IconButton, InputAdornment, Snackbar} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import Cookies from "js-cookie";

const fetchUserData = async () => {
    try {
        const data = await fetchData('/api/getUserData');
        console.log('Fetched USER data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const Users = () => {
    const [showForm, setShowForm] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false); // State for update modal
    const [output, setOutput] = useState('');
    const [group, setGroup] = useState([]);
    const [area, setArea] = useState([]);
    const [role, setRole] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [currentUserGroup, setCurrentUserGroup] = useState('');
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [selectedRowData, setSelectedRowData] = useState({
        ID: '',
        Username: '',
        Password: '',
        RoleDesc: '',
        Status: '',
        FirstName: '',
        Lastname: '',
        Email: '',
        Phone: '',
        Area: '',
        UserGroup: '',
        Role: '',
        AccountingSystemAccess: false,
    });

    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        Email: '',
        area: '',
        usergroup: '',
        password: '',
        role: '',
        accountingSystemAccess: false, // New field
    });

    const [userData, setUserData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [columns, setColumns] = useState([])

    useEffect(() => {
        let mounted = true;
        const fetchAndSetUserData = async () => {
            const data = await fetchUserData();
            const excludedColumns = ['ConfirmPassword', 'CurrentPassword', 'NewPassword']; // Columns to exclude
            console.log("user data : ", data)

            // from the userdata[
            //     {
            //         "User_ID": 2,
            //         "Username": "Ibrahim@mostech.solutions",
            //         "Email": "ibrahim@mostech.solutions",
            //         "FirstName": "Ibrahim",
            //         "LastName": "Kapasi",
            //         "Area": "aus bris",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-17 14:14:05",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": null,
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 4,
            //         "Username": "pravin@mostech.solutions",
            //         "Email": "pravin@mostech.solutions",
            //         "FirstName": "Pravin",
            //         "LastName": "Lohare",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-11 07:07:10",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": null,
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "8e33ac95-1380-4cb2-91bc-f1f4eeea48e1",
            //         "ClientSecret": "24403855-df17-44a2-9d6d-8664a4b320ce",
            //         "ApiSystemAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTMzYWM5NS0xMzgwLTRjYjItOTFiYy1mMWY0ZWVlYTQ4ZTEiLCJleHAiOjE3MzY4MzU4ODR9.rtqrFzqfWH_huTLJRqGD3sDky5d5K51bb1rxVTz4uWc",
            //         "ApiSystemAccessTokenExpiry": "2025-01-14 06:24:45",
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 5,
            //         "Username": "hussain@mostech.solutions",
            //         "Email": "hussain.d@mostech.solutions",
            //         "FirstName": "Hussain",
            //         "LastName": "Dharwala",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-08-29 13:28:53",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "hd1234",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 7,
            //         "Username": "Abdulqadir@mostech.solutions",
            //         "Email": "abdul@mostech.solutions",
            //         "FirstName": "Abdulqadir",
            //         "LastName": "Bhinderwala",
            //         "Area": "Logan City, Brisbane QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 16:12:09",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$6jdjm8Kt4EC6rJ2CAdUiZOqBD5VimS8a6Xkm35jho/bUrZbI3KCr2",
            //         "NewPassword": "test1234",
            //         "ConfirmPassword": null,
            //         "ClientID": "8e33ac95-1380-4cb2-91bc-f1f4eeea48e1",
            //         "ClientSecret": "24403855-df17-44a2-9d6d-8664a4b320ce",
            //         "ApiSystemAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTMzYWM5NS0xMzgwLTRjYjItOTFiYy1mMWY0ZWVlYTQ4ZTEiLCJleHAiOjE3MzcxODMxMjd9.elu6Ktz6UON3F_r1eOThPS9Zy-ISmc58PnAcEjWjyYs",
            //         "ApiSystemAccessTokenExpiry": "2025-01-18 06:52:07",
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 37,
            //         "Username": "mohammed@mostech.solutions",
            //         "Email": "mohammed@mostech.solutions",
            //         "FirstName": "Mohammed",
            //         "LastName": "Sura",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Team Lead",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-02 06:08:00",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$KgglJ0GzspSsEskpKxbPv.9vJtdwVfrd1v9Xzc9E/uDPqYwF8U9S6",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "8e33ac95-1380-4cb2-91bc-f1f4eeea48e1",
            //         "ClientSecret": "24403855-df17-44a2-9d6d-8664a4b320ce",
            //         "ApiSystemAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTMzYWM5NS0xMzgwLTRjYjItOTFiYy1mMWY0ZWVlYTQ4ZTEiLCJleHAiOjE3MzY1MTU3MDV9.OXR5zYgmcqRXnl3dmn0yEkn-h9rAUCUgSt5RoRjspSM",
            //         "ApiSystemAccessTokenExpiry": "2025-01-10 13:28:26",
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 45,
            //         "Username": "zaid@mostech.solutions",
            //         "Email": "zaid@mostech.solutions",
            //         "FirstName": "Zaid",
            //         "LastName": "Siddiqui",
            //         "Area": "test",
            //         "UserGroup": "Team Lead",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-08 11:17:58",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$Wh9OYDSSlpA9DZCdKZHZBOfkl5LtC0WZ.5F8ioB95KEkxcWW6CwX.",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 46,
            //         "Username": "test01@mostech.com",
            //         "Email": "test01@mostech.com",
            //         "FirstName": "Test",
            //         "LastName": "User",
            //         "Area": "test",
            //         "UserGroup": "Rostering Clerk",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-11-25 17:00:43",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$Bf7YBfFT2diiQwwYaJBKhu5d9ntp.Esvovq6Ug8SmKmpx3Wnmk37O",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 47,
            //         "Username": "test02@mostech.com",
            //         "Email": "test02@mostech.com",
            //         "FirstName": "Test",
            //         "LastName": "User",
            //         "Area": "test",
            //         "UserGroup": "Rostering Manager",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-11-25 17:02:22",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$Muf.Azlxau1IWg9fzcEKueg/I/dEpvmsvQ4QeBUJxF02rHMT4XvF2",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 48,
            //         "Username": "mohammed.sura@ylss.com",
            //         "Email": "mohammed.sura@ylss.com",
            //         "FirstName": "Mohammed",
            //         "LastName": "Sura",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "ALL",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-11-26 16:42:34",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$itNhmkNdXIsGnnaEJFO3TOC8ATtXi9DhXruBo3ykNx7Z007yZQeVi",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 49,
            //         "Username": "oswin.f.user@ylss.moscare.com",
            //         "Email": "oswin.f.user@ylss.moscare.com",
            //         "FirstName": "Oswin",
            //         "LastName": "F",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "ALL",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-11-27 05:25:51",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$IopZc2oZq1dwq9IZj9uQR.7C5aqNoNPrUktYrlvvFufIuwr52TCnC",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 50,
            //         "Username": "pranav@mostech.solutions",
            //         "Email": "pranav@mostech.solutions",
            //         "FirstName": "Pranav",
            //         "LastName": "Ghag",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-02 13:05:07",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$Us2TglO0KWapJolwfGFvo.pD7Kjx.Iba0OGJsY7syEKRve83MQ0.O",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 51,
            //         "Username": "Viper@mostech.solutions",
            //         "Email": "Viper@mostech.solutions",
            //         "FirstName": "Viper",
            //         "LastName": "Viscardi ",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Rostering Clerk",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-10 16:56:58",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$XWL73kqnotpKnl1.1l0X8.thxd6vbTgEYeF84A1801ap5odLtsNWC",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 52,
            //         "Username": "Tom@mostech.solutions",
            //         "Email": "Tom@mostech.solutions",
            //         "FirstName": "Tom",
            //         "LastName": "Vercetti",
            //         "Area": "Logan City, Brisbane QLD",
            //         "UserGroup": "Rostering Manager",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-10 16:56:37",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$m97qxSlmEgm8QDcOLkgkf.erGpnv6WKx9She4/0RFn7MLTk4ejLiC",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 53,
            //         "Username": "s@gmail.com",
            //         "Email": "s@gmail.com",
            //         "FirstName": "www",
            //         "LastName": "aaa",
            //         "Area": "",
            //         "UserGroup": "Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-14 05:49:32",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$/OMnPrew.AWp5fvNnL5FoO/5uP407KkBZulX8sFZc4AoahcS6m6Ba",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 54,
            //         "Username": "piyush@moscare.solutions",
            //         "Email": "piyush@moscare.solutions",
            //         "FirstName": "Piyush",
            //         "LastName": "Sahu",
            //         "Area": "Ipswich City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-16 07:52:38",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$ARgVnAq/p3aXOxlMhN16Qe9h0s9fs4YKfItgHdnHC4fJhkT283IXW",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 55,
            //         "Username": "testzxero@gmail.com",
            //         "Email": "testzxero@gmail.com",
            //         "FirstName": "test c",
            //         "LastName": "testxt",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Reporting Manager",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 14:21:30",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$315.FJA4v6GkZFZVqVtOKuuVtZ6LoUdjWB2ocxgKyerF0m8lQqBXG",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 56,
            //         "Username": "text2xero@gmail.com",
            //         "Email": "text2xero@gmail.com",
            //         "FirstName": "testxero",
            //         "LastName": "tesxtxcc",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 14:23:33",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$dG5jRvSwvaPYtuf.9MkoduejXQFj.nHaIGa2nkzpC32feYyhUyeKS",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 57,
            //         "Username": "ee@gmail.com",
            //         "Email": "ee@gmail.com",
            //         "FirstName": "eee",
            //         "LastName": "eee",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "IT Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 15:50:57",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$zEw1sfJYKCMy8grcVXIb.OgM1kwMO4oVlc8PSgay.F/10wbdKbW9m",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 58,
            //         "Username": "wd@gwe.co",
            //         "Email": "wd@gwe.co",
            //         "FirstName": "wd",
            //         "LastName": "wd",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "IT Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 16:14:44",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$hVk0ypXBjuaXJapfwJP.reKye3nu9pJ2OQbmi9Pv4se.3uQRSaciK",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 59,
            //         "Username": "zaid@mostecwdwdh.solutions",
            //         "Email": "zaid@mostecwdwdh.solutions",
            //         "FirstName": "fdgg",
            //         "LastName": "gdfg",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 16:15:53",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$bVWZe3s4gbL6Mb9xGlM1Wugj6WonXhvCrFU5TQAM5QUGS9GcvoQB6",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 60,
            //         "Username": "Qwqwe@qwe.ccsd",
            //         "Email": "Qwqwe@qwe.ccsd",
            //         "FirstName": "wee",
            //         "LastName": "eeee",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 16:17:16",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$XMlex2WAas/Vzw16D8hRfedVDmOciScgagQAYEm4YJW0fgx0WT3eS",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 61,
            //         "Username": "wdqwdq@W.ccc",
            //         "Email": "wdqwdq@W.ccc",
            //         "FirstName": "qwdqwd",
            //         "LastName": "qwdqwd",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "IT Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 16:18:27",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$kdx0V0GSSTdsSag8FljxBewzw7ixFSWKRUHavHMgeLbhP4Lov/hgC",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 62,
            //         "Username": "qwedq@dweiojfio.com",
            //         "Email": "qwedq@dweiojfio.com",
            //         "FirstName": "qwdqwd",
            //         "LastName": "qwdqwd",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-30 16:19:36",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$8Y6YTQcb2iTf.4hX1u/N2.Gbx.PUqQuUKL0Ilz6ic9IUVhGVJ7O1W",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "c9cdf6a0-171f-4290-aa17-10f4df7463a4",
            //         "ClientSecret": "1afbab07-2e79-4eff-8a11-346f1f63aaf2",
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 64,
            //         "Username": "web.aq8604@gmail.com",
            //         "Email": "web.aq8604@gmail.com",
            //         "FirstName": "Abdulqadir",
            //         "LastName": "Dataexprotwala",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2024-12-31 14:13:57",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$4PQ/VtApg2ay9f6gk0vqiu2ob/zwRONfAdL5XZHprWRO3aAEcX8Hy",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "ac81e8b8-2ce8-4fd1-9208-839d28623e30",
            //         "ClientSecret": "daada6df-8d3f-4d59-97e6-a9f638c06876",
            //         "ApiSystemAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYzgxZThiOC0yY2U4LTRmZDEtOTIwOC04MzlkMjg2MjNlMzAiLCJleHAiOjE3MzU4MTIwMjh9.ZtoKwz6XRSf8VdW5LL7Vjb0OZSzWc1Ms9OZ7ozga3P0",
            //         "ApiSystemAccessTokenExpiry": "2025-01-02 10:00:29",
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 65,
            //         "Username": "danish@mostech.solutions",
            //         "Email": "Demo@mostech.solutions",
            //         "FirstName": "Demo",
            //         "LastName": "Account",
            //         "Area": "Redland City Council, Brisbane QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-13 06:55:07",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$VTLOmUToz5ZI895sPiO8/eyRAk6L3XSoKgG43NEefsmnX30h4/dAu",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 75,
            //         "Username": "zadi@ylss.moscare.solutions",
            //         "Email": "zaid@ylss.moscare.solutions",
            //         "FirstName": "zaid",
            //         "LastName": "siddiqui",
            //         "Area": "yeah boi",
            //         "UserGroup": "IT Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-07 16:15:37",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$zyxWNesDiY.PKxWao/DW3OMLIEYStLcnND9J160BXU/yzQl/9Xgdy",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 76,
            //         "Username": "test12@ylss.moscaresolutions.com",
            //         "Email": "test12@ylss.moscaresolutions.com",
            //         "FirstName": "test12",
            //         "LastName": "test12",
            //         "Area": "yeah boi",
            //         "UserGroup": "Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-08 08:59:08",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$5CdD77gzH92dirAHpC/Gz.Dr4EGGVVlrN5.DJzzP6ASVqRvCd.HPq",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": null,
            //         "ClientSecret": null,
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 78,
            //         "Username": "Micheal@null.moscaresolutions.com",
            //         "Email": "Micheal@null.moscaresolutions.com",
            //         "FirstName": "Micheal",
            //         "LastName": "Schumacher",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-16 16:27:10",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$HQid/4V.2y7sjI.s3cGKYuKiuN1xhz5O6H83kc3TwGU/eGCr64xnm",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "b9afaa18-9915-4835-b17d-e95a85523469",
            //         "ClientSecret": "b419536d-3b2b-4bc0-9f90-eed3da6989a1",
            //         "ApiSystemAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiOWFmYWExOC05OTE1LTQ4MzUtYjE3ZC1lOTVhODU1MjM0NjkiLCJleHAiOjE3MzcwMjY4MzR9.oUmT-rOxbhHOK4oSqkuqa1dszpq-3yYTZdJmn3f2dKI",
            //         "ApiSystemAccessTokenExpiry": "2025-01-16 11:27:14",
            //         "AccountingSystemAccess": 1
            //     },
            //     {
            //         "User_ID": 80,
            //         "Username": "jenson@ylss.moscaresolutions.com",
            //         "Email": "jenson@ylss.moscaresolutions.com",
            //         "FirstName": "Jenson",
            //         "LastName": "Button",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-16 15:49:07",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$yrnp/Kdm2x.9/d5WSWRAb.wUGeV7cWJGQ5nRFJwOTkWPhqc9YugKK",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "3b4b707e-a9b9-4316-a940-2e08f6528ad1",
            //         "ClientSecret": "239f6a55-c070-404e-8905-3010d1407911",
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 81,
            //         "Username": "Kimi@ylss.moscaresolutions.com",
            //         "Email": "Kimi@ylss.moscaresolutions.com",
            //         "FirstName": "Kimi",
            //         "LastName": "Räikkönen",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "Super Admin",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-16 16:28:18",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$Su95mRdGdilOOo6TQ5dOF.0s6W5RvKYMrDhmBSqK/SdygZUYX7GFe",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "ad6b217b-6660-459e-8479-de8c013c2945",
            //         "ClientSecret": "2e6c11e2-6e25-4079-9c43-a423d610f554",
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     },
            //     {
            //         "User_ID": 82,
            //         "Username": "murtaz@ylss.moscaresolutions.com",
            //         "Email": "murtaz@ylss.moscaresolutions.com",
            //         "FirstName": "Murtaz",
            //         "LastName": "Sura",
            //         "Area": "Brisbane City, QLD",
            //         "UserGroup": "",
            //         "MakerUser": "John",
            //         "MakerDate": "2025-01-17 14:54:36",
            //         "UpdateUser": null,
            //         "UpdateTime": null,
            //         "CurrentPassword": "$2b$10$H4RGKFqacBFAti5YAMmBke3B2FgkYvJ92gEtUG.h0gDZZCjsvE25e",
            //         "NewPassword": null,
            //         "ConfirmPassword": null,
            //         "ClientID": "4c7133de-66fb-4d25-937d-f3831545bd67",
            //         "ClientSecret": "acc1472e-cbde-47b0-9daa-0fab9a01fb6d",
            //         "ApiSystemAccessToken": null,
            //         "ApiSystemAccessTokenExpiry": null,
            //         "AccountingSystemAccess": 0
            //     }
            // ]
            // get the UserGroup of the current user id from the cookies and get its userGroup from the above data

            const currentUserID = Cookies.get('User_ID');
            const currentUserGroup = data.find(user => user.User_ID === parseInt(currentUserID)).UserGroup;
            setCurrentUserGroup(currentUserGroup);

            const columns = Object.keys(data[0] || {})
                .filter((key) => !excludedColumns.includes(key))
                .map((key) => ({
                    field: key,
                    headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
                }));

            console.log("Extracted columns:", columns);
            if (mounted) {
                setUserData(data);
                setColumns(columns)
            }
        };
        fetchAndSetUserData();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const groupData = await fetchData(`/api/getGroup`);
                console.log("Group Data:", groupData);
                setGroup(groupData.data);
            } catch (error) {
                console.error("Error fetching Group data: ", error);
            }
        };
        fetchGroupData();
    }, []);

    useEffect(() => {
        const fetchAreaData = async () => {
            try {
                const areaData = await fetchData(`/api/getAreaData`);
                console.log("Area Data:", areaData);
                setArea(areaData.data);
            } catch (error) {
                console.error("Error fetching area data: ", error);
            }
        };
        fetchAreaData();
    }, []);

    useEffect(() => {
        const fetchRoleData = async () => {
            try {
                const roleData = await fetchData(`/api/getAllRoles`);
                console.log("Role Data:", roleData);
                setRole(roleData);
            } catch (error) {
                console.error("Error fetching role data: ", error);
            }
        };
        fetchRoleData();
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.id]: event.target.value,
        });

        // Validate Email Dynamically
        if (event.target.id === "Email") {
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(event.target.value)) {
                setEmailError("Invalid email address.");
            } else {
                setEmailError("");
            }
        }

        // Validate Password Dynamically
        if (event.target.id === "password") {
            validatePassword(event.target.value);
        }
    };


    // Dynamic Password Validation
    const validatePassword = (password) => {
        const upperCaseRegex = /[A-Z]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const numericRegex = /\d/;
        const minLength = 8;

        let error = "";
        if (!upperCaseRegex.test(password)) {
            error = "Password must contain at least 1 uppercase letter.";
        } else if (!specialCharRegex.test(password)) {
            error = "Password must contain at least 1 special character.";
        } else if (!numericRegex.test(password)) {
            error = "Password must contain at least 1 numeric character.";
        } else if (password.length < minLength) {
            error = "Password must be at least 8 characters long.";
        }

        setPasswordError(error);
    };

    const getToken = async () => {
        /* console.log("Token from getOAuth2Token:", tokenData); */
        return await getOAuth2Token();
    };

    const xeroRegisterUser = async (formData) => {
        const xeroUserData = {
            user_id: formData.Email,
            user_company: process.env.NEXT_PUBLIC_COMPANY,
            company_id: process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
            subscription_type: "D",
            user_name: formData.FirstName,
        };

        console.log("FormData: ", formData);
        console.log(xeroUserData);

        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/oauth2/register`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    'M-Client-ID': process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                    'x-tenant-id': localStorage.getItem('companyName')
                },
                body: JSON.stringify(xeroUserData),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
                // console.log("Network response was not ok")
            }
            const data = await response.json();
            console.log("Success:", data);

            const combinedData = {
                FirstName: formData.FirstName,
                LastName: formData.LastName,
                Email: formData.Email,
                Area: formData.Area,
                UserGroup: formData.UserGroup,
                Password: formData.Password,
                Role: formData.Role,
                Username: formData.Email,
                ClientID: data.client_id,
                ClientSecret: data.client_secret,
            };

            console.log(combinedData);

            const xeroNewData = await putData(
                `/api/updateUserData`,
                combinedData,
                window.location.href
            );
            console.log("Data Updated", xeroNewData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault()

        setIsSubmitting(true);
        console.log("Form : ", form)
        const formData = {
            FirstName: form.firstname,
            LastName: form.lastname,
            Email: form.Email,
            Username: form.Email,
            Area: form.area,
            UserGroup: form.usergroup,
            Password: form.password,
            Role: form.role,
            AccountingSystemAccess: form.accountingSystemAccess,
        };

        // If password validation fails, prevent submission
        if (passwordError) {
            alert(passwordError);
            setIsSubmitting(false);
            return;
        }

        try {
            // Step 1: Push to Database
            let uid = "";
            const response = await postData("/api/insertUser", formData);
            console.log("Response from insertUser:", response);
            if (response.success) {
                console.log("User added successfully:", response);
                uid = response.uid;
                setOutput("User added successfully");
                clearForm();
                setShowForm(false);
                await fetchUserData().then((data) => setUserData(data));

                // Step 2: Create user in xero
                await xeroRegisterUser(formData);
            } else {
                alert(response.error || "Failed to add user");
                console.log("Error adding user:", response.error);
                return;
            }

            // Step 3: Push to Firebase
            const firebaseResponse = await postData("/api/createUserFirebase", {
                uid: uid,
                email: form.Email,
                password: form.password, // Ensure this is correct
            });

            console.log("Response from createUserFirebase:", firebaseResponse);

            if (firebaseResponse.error) {
                throw new Error(firebaseResponse.error || "Failed to create Firebase user.");
            } else {
                console.log("User created in Firebase:", firebaseResponse);
            }
        } catch (error) {
            console.error("Error creating user:", error.message);
            setPasswordError(error.message || "An unknown error occurred.");
        } finally {
            setIsSubmitting(false);
            await fetchUserData().then((data) => setUserData(data));
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            firstname: "",
            lastname: "",
            Email: "",
            area: "",
            usergroup: "",
            password: "",
            role: "",
            accountingSystemAccess: false,
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
        setPasswordError("");
    };

    const fetchUserRoleDesc = async (userId, setSelectedRowData) => {
        try {
            const response = await fetchData(`/api/getUserRoleDescData/${userId}`);
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error');
            }
            console.log("response", response);
            const value = response[0].d
            console.log("Selected row Desc: ", value);

            // Update the RoleDesc in selectedRowData
            setSelectedRowData(prevState => ({
                ...prevState,
                RoleDesc: value
            }));


        } catch (error) {
            console.error("Error fetching user role description: ", error);
        }
    };

    const handleSelectRowClick = async (row) => {
        console.log('Selected Row:', row);
        if (currentUserGroup === 'Super Admin') {
            await fetchUserRoleDesc(row.User_ID, setSelectedRowData);
            setSelectedRowData(prevState => {
                const updatedData = {
                    ...prevState,
                    ID: row.User_ID,
                    Username: row.Username,
                    Password: row.Password,
                    Role: row.Role,
                    Status: row.Status,
                    FirstName: row.FirstName,
                    Lastname: row.LastName,
                    Email: row.Email,
                    Phone: row.Phone,
                    Area: row.Area,
                    UserGroup: row.UserGroup,
                    Role_ID: row.Role_ID, // Ensure Role_ID is set here
                    AccountingSystemAccess: row.AccountingSystemAccess,
                };
                console.log('Updated Selected Row Data:', updatedData);
                return updatedData;
            });
            setShowUpdateModal(true); // Open update modal
        } else {
            setSnackbarOpen(true);
            setSnackbarMessage('You do not have permission to edit user data.');
            setSnackbarSeverity('error');
        }
    };
    const handleRowUnselected = () => {
        setSelectedRowData({
            ID: '',
            Username: '',
            Password: '',
            Role: '',
            Status: '',
            FirstName: '',
            Lastname: '',
            Email: '',
            Phone: '',
            Area: '',
            UserGroup: '',
            Role_ID: '',
            RoleDesc: '', // Ensure Role_ID is set here
        });
    };

    // const handleDelete = async () => {
    //     try {
    //         const data = await deleteData('/api/deleteUser', selectedRowData);
    //         console.log('Delete clicked:', data);
    //         setSelectedRowData({
    //             ID: '',
    //             Username: '',
    //             Password: '',
    //             Role: '',
    //             Status: '',
    //             FirstName: '',
    //             Lastname: '',
    //             Email: '',
    //             Phone: '',
    //             Area: '',
    //             UserGroup: '',
    //             Role_ID: '',
    //             RoleDesc: '' // Ensure Role_ID is set here
    //         });
    //         setUserData(await fetchUserData());
    //     } catch (error) {
    //         console.error('Error deleting user data:', error);
    //     }
    // };
    const handleFocus = (e) => {
        const inputElement = e.target;
        // Place the cursor at the start of the username part
        inputElement.setSelectionRange(0, 0);
    };

    const handleSelect = (e) => {
        const inputElement = e.target;
        const usernameLength = inputElement.value.split('@')[0].length; // Length of username part

        // If the cursor is in the domain part, move it back to the end of the username part
        if (inputElement.selectionStart >= usernameLength) {
            inputElement.setSelectionRange(usernameLength, usernameLength);
        }
    };


    // const fields = [
    //     {
    //         id: "firstname",
    //         label: "First Name",
    //         type: "text",
    //         value: form.firstname,
    //         onChange: handleChange,
    //         sx: {marginBottom: "10px"},
    //     },
    //     {
    //         id: "lastname",
    //         label: "Last Name",
    //         type: "text",
    //         value: form.lastname,
    //         onChange: handleChange,
    //         sx: {marginBottom: "10px"},
    //     },
    //     {
    //         id: "email",
    //         label: "Email",
    //         type: "email",
    //         value: form.email,
    //         onChange: handleChange,
    //         sx: {marginBottom: "10px"},
    //     },
    //     {
    //         id: "password",
    //         label: "Password",
    //         type: showNewPassword ? "text" : "password",
    //         value: form.password,
    //         onChange: handleChange,
    //         sx: {
    //             width: "100%",
    //             backgroundColor: "white",
    //             borderRadius: "10px",
    //         },
    //         InputProps: {
    //             sx: {
    //                 width: "100%",
    //                 backgroundColor: "white",
    //                 borderRadius: "10px",
    //                 height: "40px",
    //             },
    //             endAdornment: (
    //                 <InputAdornment position="end">
    //                     <IconButton
    //                         aria-label="toggle password visibility"
    //                         onClick={() => setShowNewPassword(!showNewPassword)}
    //                         edge="end"
    //                     >
    //                         {showNewPassword ? <VisibilityOff/> : <Visibility/>}
    //                     </IconButton>
    //                 </InputAdornment>
    //             ),
    //         },
    //         error: passwordError,
    //         errorMessage: passwordError,
    //     },
    //     {
    //         id: "role",
    //         label: "Role",
    //         type: "select",
    //         value: form.role,
    //         onChange: handleChange,
    //         options: [
    //             {value: "", label: "Select Role"},
    //             ...role.map((roleItem) => ({
    //                 value: roleItem.Role_Desc,
    //                 label: roleItem.Role_Desc,
    //             })),
    //         ],
    //     },
    //     {
    //         id: "usergroup",
    //         label: "User Group",
    //         type: "select",
    //         value: form.usergroup,
    //         onChange: handleChange,
    //         options: [
    //             {value: "", label: "Select Group"},
    //             ...group.map((groupItem) => ({
    //                 value: groupItem.Groups,
    //                 label: groupItem.Groups,
    //             })),
    //         ],
    //     },
    //     {
    //         id: "area",
    //         label: "Area",
    //         type: "select",
    //         value: form.area,
    //         onChange: handleChange,
    //         options: [
    //             {value: "", label: "Select Area"},
    //             ...area.map((areaItem) => ({
    //                 value: areaItem.Area,
    //                 label: areaItem.Area,
    //             })),
    //         ],
    //     },
    //     {
    //         id: "accessAccountingSystem",
    //         label: "Access Accounting System",
    //         type: "checkbox",
    //         value: form.accessAccountingSystem || false,
    //         onChange: handleChange,
    //     },
    // ];


    return (
        <div>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Row className="mb-3 mt-4 ml-3 mr-3 ">
                <Col md={5} className="p-3" style={{backgroundColor: 'white', borderRadius: '10px', width: "100%"}}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.8rem"
                        }}
                    >
                        <div>
                            <h4 style={{fontWeight: "600", marginBottom: "1rem"}}>User</h4>
                        </div>

                        <div>

                            {currentUserGroup === 'Super Admin' ? (<Button
                                style={{backgroundColor: "blue"}}
                                label="Add User"
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon/>}
                                disabled={currentUserGroup !== 'Super Admin'}
                                onClick={() => {

                                    setShowForm(true)
                                }}
                                size="small"
                            />) : 'Only Super Admin can add and edit users'}
                        </div>

                    </div>


                    <AgGridDataTable
                        rows={userData}
                        columns={columns.filter((col) =>
                            !['ApiSystemAccessToken', 'ApiSystemAccessTokenExpiry', 'ClientSecret', 'Update User', 'Update Time', 'Client Secret', 'Api System Access Token', 'Api System Access Token Expiry', 'Maker User', 'Maker Date'].includes(col.headerName))}
                        rowSelected={handleSelectRowClick}
                        handleRowUnselected={handleRowUnselected}

                    />
                </Col>
            </Row>


            <Modal
                show={showForm} onHide={handleModalCancel}
                centered
                style={{backgroundColor: "rgba(255,255,255,0.75)"}}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add User </Modal.Title>
                </Modal.Header>
                <Modal.Body>


                    <form onSubmit={handleSubmit} className="text-center" autoComplete="off">
                        <Row className="mb-3 mt-3">
                            <Col>
                                <InputField
                                    id="firstname"
                                    label="First Name"
                                    value={form.firstname}
                                    onChange={handleChange}
                                    sx={{marginBottom: "10px"}}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="lastname"
                                    label="Last Name"
                                    value={form.lastname}
                                    onChange={handleChange}
                                    sx={{marginBottom: "10px"}}
                                />
                            </Col>
                        </Row>
                        <Row className="mb-3 mt-3">
                            <Col>

                                <InputField
                                    // id="Email"
                                    required
                                    type="email"
                                    id="Email"
                                    label="Email"
                                    value={form["Email"] || ""}
                                    onChange={handleChange}
                                    sx={{marginBottom: "10px"}}
                                />
                                {emailError && (
                                    <Typography color="error" sx={{fontSize: "0.875rem", marginTop: "0.5rem"}}>
                                        {emailError}
                                    </Typography>
                                )}

                            </Col>

                            <Col>
                                <InputField
                                    id="password"
                                    label="Password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={form.password}
                                    autoComplete="off"
                                    onChange={handleChange}
                                    sx={{
                                        width: "100%",
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                    }}
                                    InputProps={{
                                        sx: {
                                            width: "100%",
                                            backgroundColor: "white",
                                            borderRadius: "10px",
                                            height: "40px",
                                        },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {passwordError && (
                                    <Typography color="error" sx={{fontSize: "0.875rem", marginTop: "0.5rem"}}>
                                        {passwordError}
                                    </Typography>
                                )}
                            </Col>
                        </Row>
                        <Row className="mb-3 mt-3">
                            <Col>
                                <InputField type="select" label="Role" id="role" value={form.role}
                                            onChange={handleChange}
                                            options={[
                                                {value: '', label: 'Select Role'},
                                                ...role.map(roleItem => ({
                                                    value: roleItem.Role_Desc,
                                                    label: roleItem.Role_Desc
                                                }))
                                            ]}
                                />
                            </Col>
                            <Col>
                                <InputField type="select" label="User Group" id="usergroup" value={form.usergroup}
                                            onChange={handleChange}
                                            options={[
                                                {value: '', label: 'Select Group'},
                                                ...group.map(groupItem => ({
                                                    value: groupItem.Groups,
                                                    label: groupItem.Groups
                                                }))
                                            ]}
                                />
                            </Col>
                        </Row>

                        <Col className={'col-sm-6'}>
                            <InputField type="select" label="Area" id="area" value={form.area} onChange={handleChange}
                                        options={[
                                            {value: '', label: 'Select Area'},
                                            ...area.map(areaItem => ({value: areaItem.Area, label: areaItem.Area}))
                                        ]}
                            />
                        </Col>


                        <div className="mt-3 d-flex justify-content-end gap-3 ">
                            {/* <MButton
                            label="Submit"
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            size="small"
                        /> */}
                            <Button
                                type="submit"
                                label="Create"
                                style={{
                                    backgroundColor: "blue",
                                    border: "none",
                                    borderRadius: "25px",
                                    width: "200px",
                                    padding: "8px 4px",
                                    color: "#fff",
                                    fontWeight: "600"
                                }}
                                onClick={(e) => handleSubmit(e)}
                            >Create</Button>
                            <Button
                                type="button"
                                label="Cancel"
                                style={{
                                    backgroundColor: "yellow",
                                    border: "none",
                                    borderRadius: "25px",
                                    width: "200px",
                                    padding: "8px 4px",
                                    color: "#fff",
                                    fontWeight: "600"
                                }}
                                onClick={handleModalCancel}
                            >Cancel</Button>

                        </div>
                    </form>
                </Modal.Body>
                {output && <InfoOutput text={output}/>}
            </Modal>

            {/* Update User Modal */}
            <Modal
                show={showUpdateModal} onHide={() => setShowUpdateModal(false)}
                centered
                // style={{
                //     content: {
                //         maxWidth: '900px',
                //         margin: '0 auto',
                //         maxHeight: '90vh',
                //         overflow: 'auto',
                //         marginTop: '7vh',
                //         borderRadius: '15px',
                //         backgroundColor:"rgba(255,255,255,0.75)"
                //     },
                //     overlay: {
                //         zIndex: '10',
                //     },
                // }}
                style={{backgroundColor: "rgba(255,255,255,0.75)"}}


            >
                <Modal.Header closeButton>
                    <Modal.Title>Update User</Modal.Title>
                </Modal.Header>

                <UpdateUser
                    selectedRowData={selectedRowData}
                    setSelectedRowData={setSelectedRowData}
                    setUserData={setUserData}
                    fetchUserData={fetchUserData}
                    onSave={(updatedUser) => {
                        setUserData((prevData) =>
                            prevData.map((user) =>
                                user.ID === updatedUser.ID ? updatedUser : user
                            )
                        );
                        setShowUpdateModal(false); // Close the modal
                    }}
                    handleModalCancel={() => setShowUpdateModal(false)} // Pass handleModalCancel
                />

            </Modal>
        </div>
    );

};

export default Users;


