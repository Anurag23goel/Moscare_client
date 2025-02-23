import React, {useEffect, useState} from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {fetchData, fetchUserRoles, getOAuth2Token, postData, putData,} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/worker/generalSlice";
import {useRouter} from "next/router";
import Image from "next/image";
import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import PrefixedInputField from "@/components/widgets/PrefixedInputField.js";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Globe,
    Lock,
    Phone,
    Printer,
    RefreshCw,
    Send,
    Settings,
    Trash2,
    Upload,
    UserCircle,
    X,
    XCircle
} from 'lucide-react';

const General = ({
                     setGeneralEdit,
                     setSelectedComponent,
                     onTabChange,
                     onSaveReady,
                     isButtonClicked,
                     setIsButtonClicked,
                 }) => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const dispatch = useDispatch();
    const defaultProfileForm = useSelector(
        (state) => state.workergeneral.profileForm
    );
    console.log("defaultProfileForm : ", defaultProfileForm);
    const [areaData, setAreaData] = useState([]);
    const [divisionData, setDivisionData] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [roleData, setRoleData] = useState([]);
    const [teamLeads, setTeamLeads] = useState([]);
    const [reportingManagers, setReportingManagers] = useState([]);
    const [prompt, setPrompt] = useState(false);
    const [profileForm, setProfileForm] = useState({
        ...defaultProfileForm,
        phone1Prefix: "+1", // Default country code
        phone2Prefix: "+1", // Default country code
    });
    const [disableSection, setDisableSection] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imgSrc, getImgSrc] = useState("");
    const [xeroWorkerContact, setXeroWorkerContact] = useState([]);
    const [isFetchingXeroworkerContact, setIsFetchingXeroworkerContact] =
        useState(false);
    // const {colors, loading} = useContext(ColorContext);
    const [workersList, setWorkersList] = useState([]);
    const [status, setStatus] = useState(null);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [msg, setMsg] = useState(""); // New state variable for messages
    const [malert, setMAlert] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [phone2Error, setPhone2Error] = useState("");

    // New state variables for dynamic options
    const [titleOptions, setTitleOptions] = useState([]);
    const [genderOptions, setGenderOptions] = useState([]);
    const [countryCodes, setCountryCodes] = useState([]);

    const [fieldStatus, setFieldStatus] = useState(null);

    const fetchIncompleteFields = async () => {
        try {
            const response = await fetchData(
                `/api/getImpWorkerIncompleteFields/${WorkerID}`,
                window.location.href
            );

            if (response.success && response.data) {
                // Transform the data object into an array of { name, isFilled } objects
                const transformedData = Object.entries(response.data).map(([name, isFilled]) => ({
                    name,
                    isFilled,
                }));
                setFieldStatus(transformedData);
            }

        } catch (err) {
            console.error("Error fetching incomplete fields:", err);
        }
    };


    const formatFieldName = (name) => {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    const getFlagEmoji = (countryName) => {
        const countryCodeMap = {
            Australia: "🇦🇺",
            India: "🇮🇳",
            "United States": "🇺🇸",
            "United Kingdom": "🇬🇧",
            "New Zealand": "🇳🇿",
        };
        return countryCodeMap[countryName] || "";
    };

    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for Profile...");
            onSaveReady("Profile", handleSaveButton()); // Register handleSaveButton for Profile

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

    // If their is any value in db table then it return that else it will written default value
    // const mergeProfileData = (defaultData, fetchedData) => {
    //   const mergedData = { ...defaultData };
    //   for (const key in fetchedData) {
    //     if (mergedData[key] == "") {
    //       mergedData[key] = fetchedData[key];
    //     }
    //   }
    //   return mergedData;
    // };
    useEffect(() => {
        fetchIncompleteFields();
    }, [WorkerID]);

    const mergeProfileData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "" || mergedData[key] === undefined) {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const handleClose = () => {
        setOpenConfirmation(false); //to close the confirmation modal
    };

    const fetchProfilePicUrl = async (FolderPath) => {
        const response = await fetchData(
            `/api/getS3Data/${FolderPath}`,
            window.location.href
        );

        const {dataURL} = response;

        console.log("Data URL: ", dataURL);

        if (!dataURL) {
            console.log("Failed to get Presigned Url");
            return;
        }

        const fileResponse = await fetchData(dataURL);

        if (!fileResponse.ok) {
            console.error("Error while fetching file: ", fileResponse.statusText);
        }

        const fileBlob = await fileResponse.blob();
        const fileUrl = URL.createObjectURL(fileBlob);
        getImgSrc(fileUrl);
        console.log("File URL: ", fileUrl);
    };

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const workersResponse = await fetchData("/api/getWorkerMasterDataAll");
                setWorkersList(workersResponse.data); // Store all workers for dropdown
            } catch (error) {
                console.error("Error fetching workers: ", error);
            }
        };

        fetchWorkers(); // Fetch workers once when the component mounts
    }, []); // Empty dependency array means this runs once

    // Handle worker selection from dropdown and redirect with dynamic routing
    const handleWorkerChange = (event) => {
        const selectedWorkerID = event.target.value;
        if (selectedWorkerID) {
            router.push(`/worker/profile/update/${selectedWorkerID}`); // Append the WorkerID to the path
        }
    };

    // fetch data from db
    const fetchDataAsync = async () => {
        try {
            const [
                masterData,
                profileData,
                xeroWrokerContactData,
                areaData,
                divisionData,
                statusData,
                roleData,
                TLUserData,
                RMUserData,
                titlesRes,
                gendersRes,
                countriesRes
            ] = await Promise.all([
                fetchData(`/api/getWorkerMasterData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerGeneralProfileData/${WorkerID}`, window.location.href),
                fetchData(`/api/getxeroworker`, window.location.href),
                fetchData("/api/getAreaData", window.location.href),
                fetchData("/api/getDivision", window.location.href),
                fetchData("/api/getWorkerStatus", window.location.href),
                fetchData("/api/getRole", window.location.href),
                fetchData(`/api/getUserByUserGroup/Team Lead`),
                fetchData(`/api/getUserByUserGroup/Rostering Manager`),
                fetchData("/api/getTitleValues"),
                fetchData("/api/getGenderValues"),
                fetchData("/api/getCountryCodes")
            ]);

            console.log("Xero Worker Contact Data:", xeroWrokerContactData);
            setXeroWorkerContact(xeroWrokerContactData.data);

            try{
                const FolderFromDb = profileData.data[0]?.Folder;
                const FileFromDb = profileData.data[0]?.File;
                const FolderPath = `${encodeURIComponent(FolderFromDb)}/${encodeURIComponent(FileFromDb)}`;
                console.log("FolderPath: ", FolderPath);
                await fetchProfilePicUrl(FolderPath);
            } catch (e) {
                console.error("Error fetching profile picture:", e);
            }

            setAreaData([{value: "", label: "NONE"}, ...areaData.data]);
            setDivisionData([{value: "", label: "NONE"}, ...divisionData.data]);

            const statusesData = statusData.data.map((status) => ({
                value: status.ID,
                label: status.Status,
            }));
            setStatusData([{value: "", label: "NONE"}, ...statusesData]);
            console.log("Status Data:", statusData);

            const rolesData = roleData.data.map((role) => ({
                value: role.ID,
                label: role.Role,
            }));
            setRoleData([{value: "", label: "NONE"}, ...rolesData]);

            const teamLeadsData = TLUserData.map((lead) => ({
                value: lead.User_ID,
                label: lead.FirstName + " " + lead.LastName,
            }));

            const reportingManagersData = RMUserData.map((manager) => ({
                value: manager.User_ID,
                label: manager.FirstName + " " + manager.LastName,
            }));

            setTeamLeads([{value: "", label: "NONE"}, ...teamLeadsData]);
            setReportingManagers([{value: "", label: "NONE"}, ...reportingManagersData]);

            console.log("Team Leads:", teamLeads);
            console.log("Reporting Managers:", reportingManagers);

            console.log("Master data:", masterData);
            console.log("Profile data:", profileData);

            const fetchedProfileForm = {
                role: profileData.data[0]?.Role,
                workerNumber: profileData.data[0]?.WorkerNumber,
                dob: profileData.data[0]?.DOB,
                firstName: masterData.data[0]?.FirstName,
                lastName: masterData.data[0]?.LastName,
                phone: masterData.data[0]?.Phone,
                email: masterData.data[0]?.Email,
                IsActive: masterData.data[0]?.IsActive === "N" ? "N" : "Y",
                DeleteStatus: masterData.data[0]?.DeleteStatus === "N" ? "N" : "Y",
                preferredName: profileData.data[0]?.PreferredName,
                currrent: profileData.data[0]?.Current,
                gender: profileData.data[0]?.Gender,
                carerCode: profileData.data[0]?.CarerCode,
                age: profileData.data[0]?.Age,
                phone2: profileData.data[0]?.Phone2,
                status: profileData.data[0]?.Status,
                caseManager: profileData.data[0]?.CaseManager,
                caseManager2: profileData.data[0]?.CaseManager2,
                area: profileData.data[0]?.Area,
                groups: profileData.data[0]?.Groups,
                webUsername: profileData.data[0]?.WebUsername,
                division: profileData.data[0]?.Division,
                webAvailability: profileData.data[0]?.WebAvailability,
                webEnabled: profileData.data[0]?.WebEnabled,
                vAssessmentPortal: profileData.data[0]?.VAssessmentPortal,
                vOnboardPortal: profileData.data[0]?.VOnboardPortal,
                current: profileData.data[0]?.Current,
                consentDisplayPhoto: profileData.data[0]?.ConsentDisplayPhoto,
                title: profileData.data[0]?.Title,
                phone2Prefix: profileData.data[0]?.Phone2Code,
                phone1Prefix: profileData.data[0]?.Phone1Code,
            };

            const mergedProfileForm = mergeProfileData(defaultProfileForm, fetchedProfileForm);

            if (titlesRes.success) {
                const mappedTitles = titlesRes.data.map((title) => ({
                    value: title.Title,
                    label: title.Title,
                }));
                setTitleOptions(mappedTitles);
                console.log("Mapped Titles:", mappedTitles);
            }

            if (gendersRes.success) {
                const mappedGenders = gendersRes.data.map((gender) => ({
                    value: gender.Gender,
                    label: gender.Gender,
                }));
                setGenderOptions(mappedGenders);
                console.log("Mapped Genders:", mappedGenders);
            }

            if (countriesRes.success) {
                const mappedCountries = countriesRes.data.map((country) => ({
                    value: country.Country_Code,
                    code: country.Country_Code,
                    label: country.Country_Name,
                    flag: getFlagEmoji(country.Country_Name),
                }));
                setCountryCodes(mappedCountries);
                console.log("Mapped Countries:", mappedCountries);
            }

            console.log("merged profile form", mergedProfileForm);
            console.log("fetchedProfileForm profile form", fetchedProfileForm);
            setProfileForm(mergedProfileForm);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\+?\d{10,15}$/; // Adjust regex as needed
        return phoneRegex.test(phone);
    };

    // handle save button
    const handleSaveButton = async () => {
        // Validate and calculate age
        let age = parseInt(profileForm.age, 10);
        if (isNaN(age) || age < 0) {
            age = 0; // Set to 0 if age is invalid
        }

        const generateCarerCode = (firstName, lastName, suffix) => {
            return `${lastName.slice(0, 3).toUpperCase()}${firstName
                .slice(0, 1)
                .toUpperCase()}${suffix}`;
        };

        const checkAndSaveCarerCode = async (firstName, lastName) => {
            let suffix = "01";
            let carerCode = generateCarerCode(firstName, lastName, suffix);

            const checkCarerCode = async () => {
                const data = await fetchData(
                    `/api/checkCarerCodeExists/${carerCode}/${WorkerID}`
                );
                if (data.increment) {
                    suffix = String(parseInt(suffix) + 1).padStart(2, "0");
                    carerCode = generateCarerCode(firstName, lastName, suffix);

                    malert(carerCode);
                    return await checkCarerCode(); // Recursive call until a unique carer code is found
                } else {
                    return carerCode;
                }
            };

            return await checkCarerCode();
        };

        const saveProfileData = async () => {
            try {
                const carerCode = await checkAndSaveCarerCode(
                    profileForm.firstName,
                    profileForm.lastName
                );

                // General Profile Data
                const generalData = {
                    DOB: profileForm.dob,
                    Role: profileForm.role,
                    PreferredName: profileForm.preferredName,
                    Gender: profileForm.gender,
                    Phone2: profileForm.phone2,
                    Status: profileForm.status,
                    Current: profileForm.current,
                    Age: age,
                    VAssessmentPortal: profileForm.vAssessmentPortal,
                    CaseManager: profileForm.caseManager,
                    CaseManager2: profileForm.caseManager2,
                    Area: profileForm.area,
                    Groups: profileForm.groups,
                    WebUsername: profileForm.webUsername,
                    Division: profileForm.division,
                    WebEnabled: profileForm.webEnabled,
                    VOnboardPortal: profileForm.vOnboardPortal,
                    ConsentDisplayPhoto: profileForm.consentDisplayPhoto,
                    WorkerNumber: profileForm.workerNumber,
                    WebAvailability: profileForm.webAvailability,
                    CarerCode: carerCode,
                    Phone2Code: profileForm.phone2Prefix,
                    SmsCode: profileForm.sms,
                    Title: profileForm.title,
                    Phone1Code: profileForm.phone1Prefix,
                };

                // Master Data
                const masterData = {
                    FirstName: profileForm.firstName,
                    LastName: profileForm.lastName,
                    Phone: profileForm.phone,
                    Email: profileForm.email,
                    IsActive: profileForm.IsActive,
                    DeleteStatus: profileForm.DeleteStatus,
                };

                await putData(
                    `/api/updateWorkerGeneralProfileData/${WorkerID}`,
                    {
                        data: generalData,
                    },
                    window.location.href
                );
                console.log("General profile data saved successfully.");

                await putData(
                    `/api/updateWorkerMasterData/${WorkerID}`,
                    {
                        data: masterData,
                    },
                    window.location.href
                ).then((res) => {
                    console.log("Master data saved successfully.");
                    setMAlert(true);
                    setStatus(true);
                    console.log("Response:", res);
                });

                const data3 = {
                    uid: `wk-${WorkerID}`,
                    email: profileForm.email,
                };

                postData("/api/updateFirebaseUserEmail", data3).then((response) => {
                    console.log("Response:", response);
                });

                // send email
                postData("/api/sendProfileUpdateMail", {
                    email: profileForm.email,
                    id: WorkerID,
                    type: "WORKER_PROFILE_UPDATE",
                })
                    .then((response) => {
                        console.log("Profile update email sent successfully");
                    })
                    .catch((error) => {
                        console.error("Error sending profile update email:", error);
                    });

                // Dispatch and Fetch
                dispatch(deleteData());
                fetchDataAsync();
            } catch (error) {
                setAlert(true);
                setStatus(true);
                console.error("Error saving profile data:", error);
            }
        };

        await saveProfileData();
        setGeneralEdit(false);
        // you should keep one blank space after the general
        setSelectedComponent("General ");
    };

    function calculateAge(birthDate) {
        const currentDate = new Date();
        const birthDateParts = birthDate.split("-");

        const birthYear = parseInt(birthDateParts[0]);
        const birthMonth = parseInt(birthDateParts[1]);
        const birthDay = parseInt(birthDateParts[2]);

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        let age = currentYear - birthYear;

        if (
            currentMonth < birthMonth ||
            (currentMonth === birthMonth && currentDay < birthDay)
        ) {
            age--;
        }

        return age;
    }

    // Utility function to generate Carer Code
    const generateCarerCode = (firstName, lastName, suffix) => {
        // Ensure that firstName and lastName have sufficient length
        const firstInitial = firstName?.charAt(0)?.toUpperCase() || "X";
        const lastThree =
            lastName?.slice(0, 3)?.toUpperCase().padEnd(3, "X") || "XXX";
        const formattedSuffix = suffix.padStart(2, "0");

        return `${lastThree}${firstInitial}${formattedSuffix}`;
    };

    const checkAndSaveCarerCode = async (firstName, lastName) => {
        let suffix = "01";
        let carerCode = generateCarerCode(firstName, lastName, suffix);

        const checkCarerCode = async () => {
            const data = await fetchData(
                "/api/checkCarerCodeExists/${carerCode}/${WorkerID}"
            );
            if (data.increment) {
                suffix = String(parseInt(suffix) + 1).padStart(2, "0");
                carerCode = generateCarerCode(firstName, lastName, suffix);

                malert(carerCode);
                return await checkCarerCode(); // Recursive call until a unique carer code is found
            } else {
                return carerCode;
            }
        };

        return await checkCarerCode();
    };

    const handleChange = (event) => {
        setGeneralEdit(true);
        setSelectedComponent("General *");
        const {id, value, checked, type} = event.target;

        let newValue = value;
        if (type === "checkbox") {
            newValue = checked ? "Y" : "N";  // Ensure "Y" or "N" instead of true/false
        }


        // Email validation logic
        if (id === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(newValue)) {
                setEmailError("Invalid email address");
            } else {
                setEmailError("");
            }
        }

        // Phone validation logic
        if (id === "phone") {
            const phonePattern = /^[0-9]{10}$/; // Example pattern for a 10-digit phone number
            // if the phone number is empty, don't show the error
            if (newValue === "") {
                setPhoneError("");
            } else if (!phonePattern.test(newValue)) {
                setPhoneError("Invalid phone number");
            } else {
                setPhoneError("");
            }
        }

        // Phone2 validation logic
        if (id === "phone2") {
            const phonePattern = /^[0-9]{10}$/; // Example pattern for a 10-digit phone number
            // if the phone number is empty, don't show the error
            if (newValue === "") {
                setPhone2Error("");
            } else if (!phonePattern.test(newValue)) {
                setPhone2Error("Invalid phone number");
            } else {
                setPhone2Error("");
            }
        }
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
        if (id === "email") {
            if (!newValue) {
                setEmailError("");
            } else if (!emailPattern.test(newValue)) {
                setEmailError("Invalid email format");
            } else {
                setEmailError(""); // Clear the error if email is valid
            }
        }

        setProfileForm((prevState) => {
            let updatedState = {...prevState, [id]: newValue};

            // If the field is 'dob', calculate and update the age
            if (id === "dob") {
                const age = calculateAge(newValue);
                updatedState.age = age;
            }

            dispatch(upsertData(updatedState));
            return updatedState;
        });

        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                    fetchDataAsync();
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                    fetchDataAsync();
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        if (WorkerID) {
            fetchDataAsync();
        } else {
            console.log("WorkerID not found");
        }
        fetchUserRoles("m_wprofile", "Worker_Profile_General", setDisableSection);
    }, [WorkerID]);

    const generateFolderPath = (company, filename) => {
        return `${company}/worker/${WorkerID}/profile_picture/${filename}`;
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log("Reached Here");

        setIsSubmitting(true);
        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generateFolderPath(company, fileName);
            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const response = await postData("/api/postS3Data", {
                FolderPath,
            });

            const {uploadURL} = response;

            if (!uploadURL) {
                setMAlert(true);
                setStatus(false);
                setMsg("Failed to get pre-signed URL.");
                return;
            }

            const uploadRes = await fetch(uploadURL, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (uploadRes.ok) {
                setMAlert(true);
                setStatus(true);
                setMsg("File uploaded successfully!");

                const combinedData = {
                    Folder: folderforDB,
                    Bucket: "moscaresolutions",
                    File: FileNameforDB,
                };

                const insertResponse = await putData(
                    `/api/updateWorkerGeneralProfileData/${WorkerID}`,
                    {data: combinedData},
                    window.location.href
                );

                if (insertResponse.success) {
                    setMAlert(true);
                    setStatus(true);
                    setMsg("Worker Profile added successfully");
                    // Fetch and display the new profile picture
                    const FolderPath = `${folderforDB}/${FileNameforDB}`;
                    fetchProfilePicUrl(FolderPath);
                } else {
                    setMAlert(true);
                    setStatus(false);
                    setMsg("Failed to add Worker Profile");
                }
            } else {
                setMAlert(true);
                setStatus(false);
                setMsg("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            setMAlert(true);
            setStatus(false);
            setMsg("An error occurred while adding Worker Profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerFileInput = () => {
        document.getElementById("fileInput").click();
    };

    const getToken = async () => {
        const tokenData = await getOAuth2Token();
        /* console.log("Token from getOAuth2Token:", tokenData); */
        return tokenData;
    };

    const fetchXeroWorkerContacts = async () => {
        console.log("Fetching Xero Workers Contacts");
        setIsFetchingXeroworkerContact(true);
        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/xero/payroll-au/employees/`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const contacts = data.Employees.map((contact) => ({
                EmployeeID: contact.EmployeeID,
                FirstName: contact.FirstName,
                LastName: contact.LastName,
                Status: contact.Status,
            }));

            console.log(contacts);
            setXeroWorkerContact(contacts);
            /*  console.log("Xero Contact:", data.Contacts); */

            const xeroData = await putData(
                `/api/upsertxeroworker`,
                {contacts: contacts},
                window.location.href
            );

            console.log("Xero Contacts: ", xeroData);

            // Handle the response data as needed
        } catch (error) {
            console.error("Error fetching Contact:", error);
        } finally {
            setIsFetchingXeroworkerContact(false);
        }
    };

    const fetchContactData = async () => {
        try {
            const data = await fetchData(
                `/api/getWorkerDataByName/${profileForm.workerNumber}`,
                window.location.href
            );

            console.log("Data from getContactDataByName:", data);

            if (!data || !data.data) {
                console.error("Failed to fetch data or data is invalid");
                return null; // Return null if data is not valid
            }

            return data.data[0];
        } catch (error) {
            console.error("Error fetching data:", error);
            return null; // Return null if there is an error
        }
    };

    const postXeroContact = async () => {
        setIsFetchingXeroworkerContact(true);

        console.log("Profile Form:", profileForm);

        const contact = await fetchContactData();

        const firstName = contact.FirstName;
        const lastname = contact.Lastname;
        const status = contact.Status;
        const employeeId = contact.EmployeeID;

        const contactData = {
            EmployeeID: employeeId || "",
            FirstName: profileForm.firstName || firstName || "",
            LastName: profileForm.lastName || lastname || "",
            DateOfBirth: profileForm.dob || "",
            StartDate: "",
            Title: profileForm.title,
            MiddleNames: profileForm.middleName,
            Email: profileForm.email || "",
            Gender: "",
            Phone: profileForm.phone || "",
            Mobile: "",
            TwitterUserName: "",
            IsAuthorisedToApproveLeave: false,
            IsAuthorisedToApproveTimesheets: false,
            JobTitle: "",
            Classification: "",
            OrdinaryEarningsRateID: "",
            PayrollCalendarID: "",
            EmployeeGroupName: "",
            BankAccounts: [],
            PayTemplate: {},
            OpeningBalances: {},
            LeaveBalances: [],
            SuperMemberships: [],
            TerminationDate: "",
            TerminationReason: "",
            Status: status || "",
            UpdatedDateUTC: "",
            IsSTP2Qualified: false,
            IncomeType: "",
            EmploymentType: "",
            CountryOfResidence: "",
            HomeAddress: {},
        };
        console.log("Contact Data:", contactData);

        try {
            const token = await getToken();
            console.log("Token:", token);
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/xero/payroll-au/employees/`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
                body: JSON.stringify(contactData),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log("Success:", data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsFetchingXeroworkerContact(false);
        }
    };

    const fetchtXeroTimeSheet = async () => {
        console.log("Fetching Xero Workers Contacts");
        setIsFetchingXeroworkerContact(true);
        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(
                `${baseAPIUrl}/xero/payroll-au/Timesheets/`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const contacts = data.Timesheets.map((contact) => ({
                TimesheetID: contact.TimesheetID,
                EmployeeID: contact.EmployeeID,
                StartDate: contact.StartDate,
                EndDate: contact.EndDate,
                Status: contact.Status,
                Hours: contact.Hours,
                TimesheetLines: contact.TimesheetLines.map((line) => ({
                    TimesheetLineID: line.TimesheetLineID,
                    EarningsRateID: line.EarningsRateID,
                    TrackingItemID: line.TrackingItemID,
                    NumberOfUnits: line.NumberOfUnits,
                })),
            }));

            console.log(contacts);
            /*  console.log("Xero Contact:", data.Contacts); */

            /*  const xeroData = await putData(
              `/api/upsertxeroworker`,
              { contacts: contacts },
              window.location.href
            );

            console.log("Xero Contacts: ", xeroData); */

            // Handle the response data as needed
        } catch (error) {
            console.error("Error fetching Contact:", error);
        } finally {
            setIsFetchingXeroworkerContact(false);
        }
    };

    const postXeroTimeSheet = async () => {
        setIsFetchingXeroworkerContact(true);

        console.log("Profile Form:", profileForm.workerNumber);

        const contact = await fetchContactData();
        const employeeId = contact.EmployeeID;

        const timesheetUnits = await fetchData(
            `/api/getTimesheetForXero/15/4`,
            window.location.href
        );

        console.log("Timesheet Units:", timesheetUnits);

        const unitsCharged = timesheetUnits.data.map(
            (unit) => unit.TotalUnitsCharged
        );
        console.log(unitsCharged);

        const timesheetData = {
            EmployeeID: employeeId,
            StartDate: "2023-01-01",
            EndDate: "2023-01-07",
            Status: "DRAFT",
            TimesheetLines: [
                {
                    EarningsRateID: "",
                    NumberOfUnits: unitsCharged,
                },
            ],
        };
        console.log("Contact Data:", timesheetData);

        try {
            /* const token = await getToken();
            console.log("Token:", token);
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(
              "${baseAPIUrl}/xero/payroll-au/Timesheets/",
              {
                method: "POST",
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  'M-Client-ID': process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
                body: JSON.stringify(timesheetData),
              }
            );

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log("Success:", data); */
            console.log("Success");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsFetchingXeroworkerContact(false);
        }
    };

    const handlePasswordReset = async () => {
        const auth = getAuth();
        console.log(profileForm.email);
        sendPasswordResetEmail(auth, profileForm.email)
            .then(() => {
                console.log("Password reset email sent successfully");
            })
            .catch((error) => {
                console.error("Error sending password reset email: ", error);
            });
    };

    // Handle changes for dropdowns like title
    const handleDropdownChange = (newValue) => {
        setProfileForm((prevForm) => ({
            ...prevForm,
            title: newValue,
        }));
    };

    const handlePrefixChange = (newPrefix, prefixField) => {
        setProfileForm((prevForm) => ({
            ...prevForm,
            [prefixField]: newPrefix,
        }));
    };


    const handlePrint = async () => {
        const doc = new jsPDF();
        doc.setFont("Metropolis");
        doc.setFontSize(12);

        // Load the profile picture
        const profilePictureUrl = imgSrc; // Default picture if none exists
        const imageWidth = 30; // Width of the image
        const imageHeight = 30; // Height of the image
        const imageX = 10; // X position for the image
        const imageY = 10; // Y position for the image

        // Function to load image
        const loadImage = async (url) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to load image");
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        };

        try {
            const imageUrl = await loadImage(profilePictureUrl);
            console.log("imageUrl : ", imageUrl)
            // Add the image to the PDF
            doc.addImage(imageUrl, "JPEG", imageX, imageY, imageWidth, imageHeight);

            // Add the title below the image
            doc.text("Worker Details", 105, imageY + imageHeight + 10, {align: "center"});

            // Function to add table with dynamic spacing
            const addSectionWithTable = (title, data, startY) => {
                doc.text(title, 10, startY); // Title for the section
                doc.autoTable({
                    startY: startY + 5, // Adjust startY to position table below the title
                    body: data,
                    styles: {
                        fontSize: 8, // Smaller font size
                        cellPadding: {top: 3, right: 4, bottom: 3, left: 4},
                        halign: "left", // Align text to the left
                        valign: "middle",
                    },
                });
                return doc.lastAutoTable.finalY + 5; // Return the position after the table
            };

            // Section 1: Personal Details
            let currentY = imageY + imageHeight + 20; // Starting Y position after image and title
            const personalDetailsData = [
                ["First Name", profileForm?.firstName || "N/A"],
                ["Last Name", profileForm?.lastName || "N/A"],
                ["Gender", profileForm?.gender || "N/A"],
                ["Email", profileForm?.dob || "N/A"],
                ["Email", profileForm?.age || "N/A"],
            ];
            currentY = addSectionWithTable("1. Personal Details", personalDetailsData, currentY);

            // Section 2: Contact Details
            const contactDetailsData = [
                ["Phone 1", profileForm?.phone || "N/A"],
                ["Phone 2", profileForm?.phone2 || "N/A"],
                ["Email", profileForm?.email || "N/A"],
            ];
            currentY = addSectionWithTable("2. Contact Details", contactDetailsData, currentY);

            // Section 4: Others
            const othersData = [
                ["Status", profileForm?.status || "N/A"],
                ["Role", profileForm?.role || "N/A"],
                ["Worker ", profileForm?.workerNumber || "N/A"],
                ["Carer Code ", profileForm?.carerCode || "N/A"],
                ["Team Lead ", profileForm?.caseManager || "N/A"],
                ["Rostering Manager ", profileForm?.caseManager2 || "N/A"],
                ["Area ", profileForm?.area || "N/A"],

            ];
            addSectionWithTable("3. Others", othersData, currentY);

            // Print the document and open the print dialog
            doc.autoPrint();
            window.open(doc.output("bloburl"), "_blank");
        } catch (error) {
            console.error("Error loading the profile picture:", error);
        }
    };


    return (
        <div className="">

            {malert && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl glass dark:glass-dark border shadow-lg ${
                    status ? 'border-green-300 bg-green-50/50 text-green-800' : 'border-red-300 bg-red-50/50 text-red-800'
                }`}>
                    <div className="flex items-center gap-2">
                        {status ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500"/>
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500"/>
                        )}
                        <span className="font-medium">
              {status ? "Profile Updated Successfully" : "Something went wrong"}
            </span>
                        <button
                            onClick={() => setMAlert(false)}
                            className="ml-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    </div>
                </div>
            )}

            <div className="px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl pt-4 font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Worker Profile
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage worker information and settings
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <Printer className="h-4 w-4 text-gray-600"/>
                            <span>Print</span>
                        </button>

                        <button
                            onClick={handlePasswordReset}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                        >
                            <Lock className="h-4 w-4 text-gray-600"/>
                            <span>Reset Password</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="">
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}

                    {/* Profile Photo & Status Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Profile Photo */}
                        <div
                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                            <div className="flex items-start gap-6">
                                <div className="relative group">
                                    <div
                                        onClick={triggerFileInput}
                                        className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 cursor-pointer group-hover:shadow-lg transition-all duration-300"
                                    >
                                        {imgSrc ? (
                                            <Image
                                                src={imgSrc}
                                                alt="Profile"
                                                layout="fill"
                                                objectFit="cover"
                                                className="group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Upload
                                                    className="h-10 w-10 text-purple-500/50 group-hover:text-purple-500 transition-colors"/>
                                            </div>
                                        )}
                                    </div>
                                    {imgSrc && (
                                        <button
                                            // onClick={deleteProficPic}
                                            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-lg"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={disableSection}
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-2">Profile Photo</h3>
                                    <p className="text-sm text-gray-500">
                                        Upload a high-quality image for better identification
                                    </p>
                                </div>
                            </div>
                            {/*<Row style={{ alignItems: "start", paddingTop: "20px" }}>*/}
                            {/*  <Col>*/}
                            {/*    <div style={{ marginBottom: "10px" }} className="checkbox-container">*/}
                            {/*      <label htmlFor="IsActive" className="checkbox-label">*/}
                            {/*        IsActive?*/}
                            {/*        <input*/}
                            {/*            type="checkbox"*/}
                            {/*            id="IsActive"*/}
                            {/*            checked={profileForm.IsActive === "Y"}*/}
                            {/*            onChange={handleChange}*/}
                            {/*            disabled={disableSection}*/}
                            {/*            className="custom-checkbox"*/}
                            {/*        />*/}
                            {/*        <span className="checkmark"></span>*/}
                            {/*      </label>*/}
                            {/*    </div>*/}

                            {/*    <div className="checkbox-container">*/}
                            {/*      <label htmlFor="DeleteStatus" className="checkbox-label">*/}
                            {/*        Delete*/}
                            {/*        <input*/}
                            {/*            type="checkbox"*/}
                            {/*            id="DeleteStatus"*/}
                            {/*            checked={profileForm.DeleteStatus === "Y"}*/}
                            {/*            onChange={handleChange}*/}
                            {/*            disabled={disableSection}*/}
                            {/*            className="custom-checkbox"*/}
                            {/*        />*/}
                            {/*        <span className="checkmark"></span>*/}
                            {/*      </label>*/}
                            {/*    </div>*/}
                            {/*  </Col>*/}
                            {/*</Row>*/}
                        </div>

                        {/* Field Status */}
                        <div
                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                            <h3 className="text-lg font-medium mb-4">Field Status</h3>
                            <div className="grid gap-3">
                                {fieldStatus?.map((field, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300"
                                    >
                                        <span className="text-sm font-medium">{formatFieldName(field.name)}</span>
                                        {field.isFilled ? (
                                            <div
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                <CheckCircle2 className="h-4 w-4"/>
                                                <span>Complete</span>
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                                <XCircle className="h-4 w-4"/>
                                                <span>Incomplete</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form Sections */}
                    <div className="space-y-8">
                        {/* Personal Details */}
                        <div
                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-6">
                                <UserCircle className="h-5 w-5 text-purple-500"/>
                                <span>Personal Details</span>
                                <span className="text-red-500">*</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <PrefixedInputField
                                    label="First Name"
                                    prefixType="title"
                                    prefixValue={profileForm.title}
                                    onPrefixChange={handleDropdownChange}
                                    id="firstName"
                                    value={profileForm.firstName}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    placeholder="John"
                                    prefixOptions={titleOptions}
                                />

                                <PrefixedInputField
                                    label="Last Name"
                                    id="lastName"
                                    value={profileForm.lastName}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    placeholder="Doe"
                                />

                                <PrefixedInputField
                                    label="Gender"
                                    prefixType="gender"
                                    prefixValue={profileForm.gender}
                                    onPrefixChange={(newValue) => handlePrefixChange(newValue, "gender")}
                                    id="gender"
                                    value={profileForm.gender}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    placeholder="Select Gender"
                                    prefixOptions={genderOptions}
                                />

                                <PrefixedInputField
                                    type="date"
                                    id="dob"
                                    label="Date of Birth"
                                    value={profileForm.dob || ""}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                />

                                <PrefixedInputField
                                    type="text"
                                    label="Age"
                                    id="age"
                                    value={profileForm.age}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div
                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-6">
                                <Phone className="h-5 w-5 text-purple-500"/>
                                <span>Contact Details</span>
                                <span className="text-red-500">*</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <PrefixedInputField
                                    type="number"
                                    label="Phone 1"
                                    prefixType="countryCode"
                                    prefixValue={profileForm.phone1Prefix}
                                    onPrefixChange={(newPrefix) => handlePrefixChange(newPrefix, "phone1Prefix")}
                                    id="phone"
                                    value={profileForm.phone}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    placeholder="1234567890"
                                    error={phoneError}
                                    prefixOptions={countryCodes}
                                />

                                <PrefixedInputField
                                    type="number"
                                    label="Phone 2"
                                    prefixType="countryCode"
                                    prefixValue={profileForm.phone2Prefix}
                                    onPrefixChange={(newPrefix) => handlePrefixChange(newPrefix, "phone2Prefix")}
                                    id="phone2"
                                    value={profileForm.phone2}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    placeholder="0987654321"
                                    error={phone2Error}
                                    prefixOptions={countryCodes}
                                />

                                <PrefixedInputField
                                    label="Email"
                                    id="email"
                                    value={profileForm.email}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    placeholder="john.doe@example.com"
                                    error={emailError}
                                />
                            </div>
                        </div>

                        {/* Other Details */}
                        <div
                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-6">
                                <Settings className="h-5 w-5 text-purple-500"/>
                                <span>Other Details</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <PrefixedInputField
                                    type="select"
                                    label="Status"
                                    id="status"
                                    value={profileForm.status}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={statusData}
                                    placeholder="Select Status"
                                />

                                <PrefixedInputField
                                    type="select"
                                    label="Role"
                                    id="role"
                                    value={profileForm.role}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={roleData}
                                    placeholder="Select Role"
                                />

                                <PrefixedInputField
                                    type="select"
                                    label="Worker Number / Acc Code"
                                    id="workerNumber"
                                    value={profileForm.workerNumber}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={xeroWorkerContact?.map((item) => ({
                                        label: `${item.FirstName} ${item.LastName}`,
                                        value: item.EmployeeID,
                                    }))}
                                    placeholder="Select Worker"
                                />

                                <PrefixedInputField
                                    type="text"
                                    label="Carer Code"
                                    id="carerCode"
                                    value={profileForm.carerCode}
                                    disabled={disableSection}
                                    placeholder="Select Carer Code"
                                />

                                <PrefixedInputField
                                    type="select"
                                    label="Team Lead"
                                    id="caseManager"
                                    value={profileForm.caseManager}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={teamLeads}
                                    placeholder="Select Team Lead"
                                />

                                <PrefixedInputField
                                    type="select"
                                    label="Rostering Manager"
                                    id="caseManager2"
                                    value={profileForm.caseManager2}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={reportingManagers}
                                    placeholder="Select Rostering Manager"
                                />

                                <PrefixedInputField
                                    label="Area"
                                    type="select"
                                    id="area"
                                    value={profileForm.area}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={areaData.map((area) => ({
                                        value: area.AreaCode,
                                        label: area.Area,
                                    }))}
                                    placeholder="Select Area"
                                />

                                <PrefixedInputField
                                    label="Division"
                                    type="select"
                                    id="division"
                                    value={profileForm.division}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={divisionData.map((division) => ({
                                        value: division.Code,
                                        label: division.Division,
                                    }))}
                                    placeholder="Select Division"
                                />
                            </div>
                        </div>

                        {/* Web Access */}
                        <div
                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-6">
                                <Globe className="h-5 w-5 text-purple-500"/>
                                <span>Web Access</span>
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PrefixedInputField
                                        label="Web Availability"
                                        type="select"
                                        id="webAvailability"
                                        value={profileForm.webAvailability}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        options={[
                                            {value: "", label: "Default"},
                                            {value: "yes", label: "Yes"},
                                            {value: "no", label: "No"},
                                        ]}
                                    />

                                    <PrefixedInputField
                                        type="text"
                                        label="Web Username"
                                        id="webUsername"
                                        value={profileForm.webUsername}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="webEnabled"
                                            checked={profileForm.webEnabled}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Web Enabled</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="vAssessmentPortal"
                                            checked={profileForm.vAssessmentPortal}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                        />
                                        <span
                                            className="text-sm text-gray-700 dark:text-gray-300">vAssessment Portal</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="vOnboardPortal"
                                            checked={profileForm.vOnboardPortal}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                        />
                                        <span
                                            className="text-sm text-gray-700 dark:text-gray-300">vOnboard Portal</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                        className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                        <button
                            onClick={() => window.open(`/RosterManagement/${WorkerID}`)}
                            className="flex items-center gap-2 px-6 py-2.5 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <CalendarDays className="h-4 w-4"/>
                            <span>Open Roster</span>
                        </button>

                        <button
                            onClick={postXeroContact}
                            disabled={disableSection}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
                        >
                            <Send className="h-4 w-4"/>
                            <span>Send to Xero</span>
                        </button>

                        <button
                            onClick={fetchXeroWorkerContacts}
                            disabled={disableSection || isFetchingXeroworkerContact}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
                        >
                            <RefreshCw className="h-4 w-4"/>
                            <span>Sync from Xero</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {openConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose}/>

                    <div
                        className="relative w-full max-w-md mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                Confirm Update
                            </h2>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to update this worker profile?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveButton}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default General;