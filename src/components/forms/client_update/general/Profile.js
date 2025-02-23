// Profile.js

import React, {useContext, useEffect, useState} from "react";
import {
    Building2,
    CheckCircle2,
    Lock,
    Phone,
    Printer,
    RefreshCw,
    Send,
    Trash2,
    Upload,
    UserCircle,
    X,
    XCircle
} from 'lucide-react';
import PrefixedInputField from "@/components/widgets/PrefixedInputField"; // Import the PrefixedInputField component
// import { Mail, UploadTwoTone } from "@mui/icons-material";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {useDispatch, useSelector} from "react-redux";
import {fetchData, fetchUserRoles, getOAuth2Token, postData, putData,} from "@/utility/api_utility";
import {deleteData, upsertData} from "@/redux/client/generalSlice";
import {useRouter} from "next/router";
import Image from "next/image";
import ColorContext from "@/contexts/ColorContext";
import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper function to map country names to flag emojis
const getFlagEmoji = (countryName) => {
    const countryCodeMap = {
        "Australia": "🇦🇺",
        "India": "🇮🇳",
        "United States": "🇺🇸",
        "United Kingdom": "🇬🇧",
        "New Zealand": "🇳🇿",
        // Add more mappings as needed
    };
    return countryCodeMap[countryName] || "";
};

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

const Profile = ({
                     setGeneralEdit,
                     setSelectedComponent,
                     // alert,
                     //  setAlert,
                     addValidationMessage,
                     // status,
                     setStatus,
                     onSaveReady,
                     isButtonClicked,
                     setIsButtonClicked,
                 }) => {
    const router = useRouter();
    const {ClientID} = router.query;

    const dispatch = useDispatch();
    const defaultGeneralForm = useSelector(
        (state) => state.clientgeneral.profileForm
    );

    const [profileForm, setProfileForm] = useState({
        ...defaultGeneralForm,
        phonePrefix: '+1', // Default country code
        phone2Prefix: '+1', // Default country code
        smsPrefix: '+1', // Default SMS country code
    });
    const [teamLeads, setTeamLeads] = useState([]);
    const [reportingManagers, setReportingManagers] = useState([]);
    const [IsSubmitting, setIsSubmitting] = useState(false);
    const [reqSign, setRequireSign] = useState([]);
    const [xeroContact, setXeroContact] = useState([]);
    const [payer, setPayer] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [tableOf, setTableOf] = useState("");

    const [prompt, setPrompt] = useState(false);
    const [areaData, setAreaData] = useState([]);
    const [divisionData, setDivisionData] = useState([]);

    const [groupData, setGroupData] = useState([]);
    const [locRoster, setLocRoster] = useState([]);
    const [fundingTypes, setFundingTypes] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [isFetchingXeroContact, setIsFetchingXeroContact] = useState(false);
    const [imgSrc, getImgSrc] = useState("");

    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [phone2Error, setPhone2Error] = useState("");
    const [ndisError, setNdisError] = useState("");
    const [clientsList, setClientsList] = useState([]); // State for all clients

    const [openConfirmation, setOpenConfirmation] = useState(false);

    // New state variables for dynamic options
    const [titleOptions, setTitleOptions] = useState([]);
    const [genderOptions, setGenderOptions] = useState([]);
    const [countryCodes, setCountryCodes] = useState([]);

    const [fieldStatus, setFieldStatus] = useState(null);

    const fetchIncompleteFields = async () => {
        try {
            const response = await fetchData(
                `/api/getImpClientIncompleteFields/${ClientID}`,
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


    // Generic handler for select fields using PrefixedInputField
    const handleSelectChange = (id, value) => {
        setGeneralEdit(true);
        // setSelectedComponent("General *");
        setProfileForm((prevState) => {
            const updatedState = {...prevState, [id]: value};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const mergeProfileData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchClientDataAsync = async () => {
        try {
            const [
                locRosterData,
                payerData,
                masterDataResponse,
                profileDataResponse,
                requireSignature,
                xeroContactData,
                areaDataResponse,
                divisionDataResponse,
                groupDataResponse,
                fundingTypeResponse,
                TLUserData,
                RMUserData,
                allClientsResponse,
                titlesRes,
                gendersRes,
                countriesRes
            ] = await Promise.all([
                fetchData('/api/getLocRosterMasterDataAreaStateRosterID', window.location.href),
                fetchData('/api/getPayerGeneralDataAll', window.location.href),
                fetchData(`/api/getClientMasterData/${ClientID}`, window.location.href),
                fetchData(`/api/getClientGeneralProfileData/${ClientID}`, window.location.href),
                fetchData("/api/getRequireSignature", window.location.href),
                fetchData(`/api/getxerocontact`, window.location.href),
                fetchData("/api/getAreaData", window.location.href),
                fetchData("/api/getDivision", window.location.href),
                fetchData("/api/getGroup", window.location.href),
                fetchData("/api/getFundingType", window.location.href),
                fetchData(`/api/getUserByUserGroup/Team Lead`),
                fetchData(`/api/getUserByUserGroup/Rostering Manager`),
                fetchData(`/api/getAllClientMasterDataNameId/`),
                fetchData('/api/getTitleValues'),
                fetchData('/api/getGenderValues'),
                fetchData('/api/getCountryCodes')
            ]);

            setLocRoster(locRosterData.data);
            setPayer(payerData.data);
            const masterData = masterDataResponse.data;
            const profileData = profileDataResponse.data;

            try{
                const FolderFromDb = profileData[0]?.Folder;
                const FileFromDb = profileData[0]?.File;
                const FolderPath = `${encodeURIComponent(FolderFromDb)}/${encodeURIComponent(FileFromDb)}`;
                console.log("FolderPath: ", FolderPath);
                await fetchProfilePicUrl(FolderPath);
            } catch (e) {
                console.error("Error fetching profile picture:", e);
            }

            setAreaData(areaDataResponse.data);
            setDivisionData(divisionDataResponse.data);
            setGroupData(groupDataResponse.data);
            setRequireSign(requireSignature.data);
            setXeroContact(xeroContactData.data);

            const teamLeadsData = TLUserData.map((lead) => ({
                value: lead.User_ID,
                label: `${lead.FirstName} ${lead.LastName}`,
            }));
            const reportingManagersData = RMUserData.map((manager) => ({
                value: manager.User_ID,
                label: `${manager.FirstName} ${manager.LastName}`,
            }));

            setTeamLeads([{value: "", label: "Select"}, ...teamLeadsData]);
            setReportingManagers([{value: "", label: "Select"}, ...reportingManagersData]);
            setFundingTypes(fundingTypeResponse.data);


            const allClientsData = allClientsResponse.data;
            console.log("All Clients Data:", allClientsData);

            // Extract unique clients for the dropdown
            const uniqueClients = [
                ...new Map(
                    allClientsData.map((item) => [item.ClientID, item])
                ).values(),
            ];
            setClientsList(uniqueClients); // Store all unique clients
            console.log("Unique Clients List:", uniqueClients);

            if (titlesRes.success) {
                const mappedTitles = titlesRes.data.map(title => ({
                    value: title.Title, // Use 'Title' from API
                    label: title.Title,
                }));
                setTitleOptions(mappedTitles);
                console.log("Mapped Titles:", mappedTitles); // Verify the mapping
            }

            if (gendersRes.success) {
                const mappedGenders = gendersRes.data.map(gender => ({
                    value: gender.Gender, // Use 'Gender' from API
                    label: gender.Gender,
                }));
                setGenderOptions(mappedGenders);
                console.log("Mapped Genders:", mappedGenders); // Verify the mapping
            }

            if (countriesRes.success) {
                const mappedCountries = countriesRes.data.map(country => ({
                    value: country.Country_Code, // e.g., '+1'
                    code: country.Country_Code, // e.g., '+1'
                    label: country.Country_Name, // e.g., 'United States'
                    flag: getFlagEmoji(country.Country_Name), // Map country name to flag
                }));
                setCountryCodes(mappedCountries);
                console.log("Mapped Countries:", mappedCountries); // Verify the mapping
            }

            const fetchedProfileForm = {
                title: profileData[0].Title,
                middleName: profileData[0].MiddleName,
                firstName: masterData[0].FirstName,
                lastName: masterData[0].LastName,
                preferredName: profileData[0].PreferredName,
                gender: profileData[0].Gender,
                phone: masterData[0].Phone,
                phonePrefix: masterData[0].PhoneCode || '+1', // client_master.PhoneCode
                sms: profileData[0].Sms,
                smsPrefix: profileData[0].SmsCode || '+1', // client_general_profile.SmsCode
                phone2: profileData[0].Phone2,
                phone2Prefix: profileData[0].Phone2Code || '+1', // client_general_profile.Phone2Code
                ndisNumber: profileData[0].NDISNumber,
                email: masterData[0].Email,
                accountingCode: profileData[0].AccountingCode,
                fundingType: profileData[0].FundingType,
                payer: profileData[0].Payer,
                caseManager: profileData[0].CaseManager,
                caseManager2: profileData[0].CaseManager2,
                area: profileData[0].Area,
                groups: profileData[0].Groups,
                requireSignature: profileData[0].RequireSignature,
                webUsername: profileData[0].WebUsername,
                division: profileData[0].Division,
                locationRoster: profileData[0].LocationRoster,
                webEnabled: profileData[0].WebEnabled,
                vAboutMeEnabled: profileData[0].VAboutMeEnabled,
                restrictedProfile: profileData[0].RestrictedProfile,
                pfpConsent: profileData[0].PfpConsent,
            };

            const mergedProfileForm = mergeProfileData(defaultGeneralForm, fetchedProfileForm);
            setProfileForm(mergedProfileForm);
        } catch (error) {
            console.error("Error fetching client data:", error);
        }
    };

    useEffect(() => {
        fetchIncompleteFields();
        ClientAgreementAlerts();
    }, [ClientID]);

    const handleClientChange = (value) => {
        const selectedClientID = value;
        if (selectedClientID) {
            router.push(`/client/profile/update/${selectedClientID}`); // Append the ClientID directly to the path
        }
    };

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return (
    //         <div>
    //             <h3>Loading...</h3>
    //         </div>
    //     );
    // }

    const fetchProfilePicUrl = async (FolderPath) => {
        try {
            const response = await fetchData(
                `/api/getS3Data/${FolderPath}`,
                window.location.href
            );

            const {dataURL} = response;

            console.log("Data URL:", dataURL);

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
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        }
    };

    const handleChooseButtonClick = (tableFor) => {
        console.log(tableFor);
        setOpenModal(true);
        setTableOf(tableFor);
    };

    const handleModalTableRowClick = (row) => {
        setProfileForm((prevState) => {
            if (tableOf === "Payer") {
                const payer = row.PayerCode;
                const payerName = row.PayerName;
                const updatedState = {
                    ...prevState,
                    [`${tableOf}Code`]: payer,      // Corrected
                    [`${tableOf}Name`]: payerName,  // Corrected
                };
                dispatch(upsertData(updatedState));
                return updatedState;
            }
            return prevState;
        });
        setOpenModal(false);
    };

    const handleClearButtonClick = (tableFor) => {
        console.log(tableFor);
        console.log("profieForm ", profileForm)
        setProfileForm((prevState) => {
            const updatedState = {...prevState, [`${tableFor}Name`]: ""};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                    fetchClientDataAsync();
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                    fetchClientDataAsync();
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        if (ClientID) {
            fetchClientDataAsync();
            ClientAgreementAlerts();
            fetchUserRoles("m_cprofile", "Client_Profile_General", setDisableSection);
        } else {
            console.log("ClientID not available");
        }
    }, [ClientID]);

    const handleChange = (event) => {
        event.preventDefault();
        setGeneralEdit(true);
        // setSelectedComponent("General *");
        const {id, value, checked, type} = event.target;

        let newValue = value;
        if (type === "checkbox") {
            newValue = checked;
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

        // NDIS validation logic
        if (id === "ndisNumber") {
            const ndisPattern = /^43\d{7}$/; // Pattern for a 9-digit NDIS number starting with "43"
            if (newValue === "") {
                setNdisError("");
            } else if (!ndisPattern.test(newValue)) {
                setNdisError("Invalid NDIS number");
            } else {
                setNdisError("");
            }
        }

        setProfileForm((prevState) => {
            const updatedState = {...prevState, [id]: newValue};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleSaveButton = () => {
        console.log("Profile form:", profileForm);
        if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
            addValidationMessage("Please fill in all required fields.", "error")
            return;
        }
        // Validate prefixes
        const phonePrefix = profileForm.phonePrefix || '';
        const phone2Prefix = profileForm.phone2Prefix || '';
        const smsPrefix = profileForm.smsPrefix || '';


        // Prepare data for general profile update (client_general_profile)
        const data = {
            Title: profileForm.title,
            MiddleName: profileForm.middleName,
            PreferredName: profileForm.preferredName,
            Gender: profileForm.gender,
            SmsCode: smsPrefix,        // Correctly mapped
            Phone2Code: phone2Prefix,  // Correctly mapped
            Phone2: profileForm.phone2,
            Sms: profileForm.sms,
            NDISNumber: profileForm.ndisNumber,
            AccountingCode: profileForm.accountingCode,
            FundingType: profileForm.fundingType || null,
            Payer: profileForm.payer,
            CaseManager: profileForm.caseManager,
            CaseManager2: profileForm.caseManager2,
            Area: profileForm.area,
            Groups: profileForm.groups,
            RequireSignature: profileForm.requireSignature,
            WebUsername: profileForm.webUsername,
            Division: profileForm.division,
            LocationRoster: profileForm.locationRoster,
            WebEnabled: profileForm.webEnabled,
            VAboutMeEnabled: profileForm.vAboutMeEnabled,
            RestrictedProfile: profileForm.restrictedProfile,
            PfpConsent: profileForm.pfpConsent,
        };

        console.log("Sending data to client_general_profile:", data);

        // Update general profile data
        putData(
            `/api/updateClientGeneralProfileData/${ClientID}`,
            {data: data},
            window.location.href
        )
            .then((response) => {
                console.log("Update client_general_profile response:", response);
                // Handle success (e.g., show a success message)
            })
            .catch((error) => {
                console.error("Error updating client_general_profile:", error);
                // Handle error (e.g., show an error message)
            });

        // Prepare data for master profile update (client_master)
        const data2 = {
            FirstName: profileForm.firstName,
            LastName: profileForm.lastName,
            PhoneCode: phonePrefix, // Correctly mapped
            Phone: profileForm.phone,
            Email: profileForm.email,
        };

        console.log("Sending data to client_master:", data2);

        // Update master profile data
        putData(
            `/api/updateClientMasterData/${ClientID}`,
            {data: data2},
            window.location.href
        )
            .then((response) => {
                addValidationMessage("Profile updated successfully.", "success");
                console.log("Update client_master response:", response);
                //   setAlert(true);
                //  setStatus(true);
                // Handle success (e.g., show a success message)
            })
            .catch((error) => {
                addValidationMessage(`Error updating profile: ${error.message}`, "error");
                console.error("Error updating client_master:", error);
                // Handle error (e.g., show an error message)
            });

        // Update Firebase user email
        const data3 = {
            uid: `cl-${ClientID}`,
            email: profileForm.email,
        };

        postData('/api/updateFirebaseUserEmail', data3)
            .then((response) => {
                console.log("Update Firebase user email response:", response);
                // Handle success
            })
            .catch((error) => {
                console.error("Error updating Firebase user email:", error);
                // Handle error
            });

        setGeneralEdit(false);
        setSelectedComponent("General ");
        postData('/api/sendProfileUpdateMail', {
            id: ClientID,
            email: profileForm.email,
            type: "CLIENT_PROFILE_UPDATE",
        }).then((response) => {
            console.log("Profile update email sent successfully");
        }).catch((error) => {
            console.error("Error sending profile update email:", error);
        });
    };

    console.log("Profile isButtonClicked:", isButtonClicked);

    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for Profile...");
            onSaveReady("Profile", (handleSaveButton())); // Pass function reference

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

    const generatePFPFolderPath = (company, filename) => {
        return `${company}/client/${ClientID}/profile_picture/${filename}`;
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log("Reached Here");

        setIsSubmitting(true);
        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            const fileName = encodeURIComponent(file.name);

            const FolderPath = generatePFPFolderPath(company, fileName);
            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const response = await postData("/api/postS3Data", {
                FolderPath,
            });

            const {uploadURL} = response;

            if (!uploadURL) {
                console.log("Failed to get pre-signed URL.");
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
                console.log("File uploaded successfully!");
                const combinedData = {
                    Folder: folderforDB,
                    Bucket: "moscaresolutions",
                    File: FileNameforDB,
                };

                const insertResponse = await putData(
                    `/api/updateClientGeneralProfileData/${ClientID}`,
                    {data: combinedData},
                    window.location.href
                );

                if (insertResponse.success) {
                    console.log("Client Document added successfully");
                    addValidationMessage("Profile updated successfully.", "success");
                } else {
                    console.log("Failed to add client document");
                }
            } else {
                console.log("File upload failed.");
            }
        } catch (error) {
            addValidationMessage(`Error updating profile: ${error.message}`, "error");
            console.error(error);
            console.log("An error occurred while adding client document");
        } finally {
            setIsSubmitting(false);
            fetchProfilePicUrl(generatePFPFolderPath(process.env.NEXT_PUBLIC_COMPANY, file.name));
        }
    };

    const triggerFileInput = () => {
        document.getElementById("fileInput").click();
    };

    const getToken = async () => {
        const tokenData = await getOAuth2Token();
        return tokenData;
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
            doc.text("Client Details", 105, imageY + imageHeight + 10, {align: "center"});

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
                ["Middle Name", profileForm?.middleName || "N/A"],
                ["Last Name", profileForm?.lastName || "N/A"],
                ["Preferred Name", profileForm?.preferredName || "N/A"],
                ["Gender", profileForm?.gender || "N/A"],
                ["Email", profileForm?.email || "N/A"],
            ];
            currentY = addSectionWithTable("1. Personal Details", personalDetailsData, currentY);

            // Section 2: Contact Details
            const contactDetailsData = [
                ["Phone 1", profileForm?.phone || "N/A"],
                ["Phone 2", profileForm?.phone2 || "N/A"],
                ["SMS", profileForm?.sms || "N/A"],
                ["NDIS Number", profileForm?.ndisNumber || "N/A"],
            ];
            currentY = addSectionWithTable("2. Contact Details", contactDetailsData, currentY);

            // Section 3: Accounting Details
            const accountingDetailsData = [
                ["Accounting Code", profileForm?.accountingCode || "N/A"],
                ["Funding Type", profileForm?.fundingType || "N/A"],
                ["Team Lead", profileForm?.teamLeads || "N/A"],
                ["Rostering Manager", profileForm?.RosterID || "N/A"],
                ["Area", profileForm?.area || "N/A"],
                ["Groups", profileForm?.groups ?? "N/A"],
                ["Require Signature", profileForm?.requireSignature || "N/A"],
                ["Division", profileForm?.division || "N/A"],
            ];
            currentY = addSectionWithTable("3. Accounting Details", accountingDetailsData, currentY);

            // Section 4: Others
            const othersData = [
                ["Web Username", profileForm?.webUsername || "N/A"],
                ["Location Roster", profileForm?.locationRoster || "N/A"],
                ["Payer", profileForm?.PayerName || "N/A"],
                ["Another Client", ClientID || "N/A"],
            ];
            addSectionWithTable("4. Others", othersData, currentY);

            // Print the document and open the print dialog
            doc.autoPrint();
            window.open(doc.output("bloburl"), "_blank");
        } catch (error) {
            console.error("Error loading the profile picture:", error);
        }
    };


    const fetchXeroContacts = async () => {
        console.log("Fetching Xero Contacts");
        setIsFetchingXeroContact(true);
        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(
                `${baseAPIUrl}/xero/accounting/contacts/`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        'M-Client-ID': process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                    },
                }
            );

            if (!response.ok) {
                console.log("Response:", response);
                return;
            }

            const data = await response.json();

            const contacts = data.Contacts.map((contact) => ({
                ContactID: contact.ContactID,
                Name: contact.Name,
                ContactStatus: contact.ContactStatus,
            }));

            console.log("Xero Contacts:", contacts);

            const xeroData = await putData(
                `/api/upsertxerocontact`,
                {contacts: contacts},
                window.location.href
            );

            setXeroContact(contacts);

            console.log("Xero Contacts Updated:", xeroData);
        } catch (error) {
            console.error("Error fetching Contact:", error);
        } finally {
            setIsFetchingXeroContact(false);
        }
    };

    const fetchContactData = async () => {
        try {
            const data = await fetchData(
                `/api/getContactDataByName/${profileForm.accountingCode}`,
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
        setIsFetchingXeroContact(true);

        console.log("Profile Form:", profileForm.accountingCode);

        const contact = profileForm.accountingCode ? await fetchContactData() : {};
        const {Name: name = profileForm.firstName, ContactID: contactId = ""} = contact;

        const contactData = {
            "ContactID": contactId || "",
            "ContactNumber": profileForm.phone || "",
            "AccountNumber": "",
            "ContactStatus": "",
            "Name": profileForm.firstName + " " + profileForm.lastName || "",
            "FirstName": profileForm.firstName || "",
            "LastName": profileForm.lastName || "",
            "CompanyNumber": "",
            "EmailAddress": profileForm.email || "",
            "SkypeUserName": "",
            "ContactPersons": [
                {
                    "FirstName": "",
                    "LastName": "",
                    "EmailAddress": "",
                    "PhoneNumber": "",
                    "Mobile": ""
                }
            ],
            "BankAccountDetails": "",
            "TaxNumber": "",
            "AccountsReceivableTaxType": "",
            "AccountsPayableTaxType": "",
            "Addresses": [
                {
                    "AddressType": "",
                    "AddressLine1": "",
                    "AddressLine2": "",
                    "AddressLine3": "",
                    "AddressLine4": "",
                    "City": "",
                    "Region": "",
                    "PostalCode": "",
                    "Country": "",
                    "AttentionTo": ""
                }
            ],
            "Phones": [
                {
                    "PhoneType": "",
                    "PhoneNumber": "",
                    "PhoneAreaCode": "",
                    "PhoneCountryCode": ""
                }
            ],
            "IsSupplier": false,
            "IsCustomer": false,
            "DefaultCurrency": "",
            "XeroNetworkKey": "",
            "SalesDefaultAccountCode": "",
            "PurchasesDefaultAccountCode": "",
            "SalesTrackingCategories": [],
            "PurchasesTrackingCategories": [],
            "TrackingCategoryName": "",
            "TrackingCategoryOption": "",
            "PaymentTerms": ""
        };
        console.log("Contact Data:", contactData);

        try {
            const token = await getToken();
            console.log("Access Token Profile Contact:", token);
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/xero/accounting/contacts/`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'M-Client-ID': process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
                body: JSON.stringify(contactData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsFetchingXeroContact(false);
        }
    };

    const handleClose = () => {
        setOpenConfirmation(false);
    };

    const handleSendLoginDetails = async () => {
        // Implement sending login details
    };

    const handlePasswordReset = async () => {
        const auth = getAuth();
        console.log("Password Reset Email:", profileForm.email);
        sendPasswordResetEmail(auth, profileForm.email)
            .then(() => {
                console.log("Password reset email sent successfully");
            })
            .catch((error) => {
                console.error("Error sending password reset email: ", error);
            });
    };


    const deleteProficPic = async () => {
        console.log("Delete Profile")
        try {
            const res = await putData(`/api/deleteClientProfilePic/${ClientID}`)
            console.log(res)
            if (res.success) {
                getImgSrc(null)
                addValidationMessage("Profile Deleted successfully.", "success");
            }
        } catch (err) {
            console.log(err);
            addValidationMessage("Something went wrong. Please try again later!", "success");
        }

    }

    const ClientAgreementAlerts = async () => {
        try {
            const res = await fetchData(`/api/checkAgreementAlertsByClient/${ClientID}`)
            console.log('response of alert', res)
            console.log('response of alert 2.0', res.data)
            if (res.success) {
                addValidationMessage(res.message, "success");
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="">

            {/* Client Selection Modal */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpenModal(false)}/>

                    <div
                        className="relative w-full max-w-4xl mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Select Payer
                                </h2>
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500"/>
                                </button>
                            </div>

                            <MListingDataTable
                                rows={payer}
                                rowSelected={handleModalTableRowClick}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="">
                    <div className=""/>

                    {/* Profile Section */}
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Client Profile
                            </h2>
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

                        {/* Profile Photo & Status Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Profile Photo */}
                            <div
                                className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                                <div className="flex items-start gap-6">
                                    <div className="relative group">
                                        <div
                                            onClick={triggerFileInput}
                                            className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 cursor-pointer group-hover:shadow-lg transition-all duration-300"
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
                                                onClick={deleteProficPic}
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
                            </div>

                            {/* Right Column - Field Status */}
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
                                    {/* First Name */}
                                    <PrefixedInputField
                                        label="First Name"
                                        prefixType="title"
                                        prefixValue={profileForm.title}
                                        onPrefixChange={(value) => handleSelectChange('title', value)}
                                        id="firstName"
                                        value={profileForm.firstName}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="John"
                                        prefixOptions={titleOptions}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Middle Name */}
                                    <PrefixedInputField
                                        label="Middle Name"
                                        prefixType="none"
                                        id="middleName"
                                        value={profileForm.middleName}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="David"
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Last Name */}
                                    <PrefixedInputField
                                        label="Last Name"
                                        prefixType="none"
                                        id="lastName"
                                        value={profileForm.lastName}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="Smith"
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Preferred Name */}
                                    <PrefixedInputField
                                        label="Preferred Name"
                                        prefixType="none"
                                        id="preferredName"
                                        value={profileForm.preferredName}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="Johnny"
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Gender */}
                                    <PrefixedInputField
                                        label="Gender"
                                        prefixType="gender"
                                        prefixValue={profileForm.gender}
                                        onPrefixChange={(value) => handleSelectChange('gender', value)}
                                        id="gender"
                                        value={profileForm.gender}
                                        onChange={() => {
                                        }}
                                        disabled={disableSection}
                                        placeholder="Select Gender"
                                        error={genderOptions.length === 0 ? "No gender options available" : ""}
                                        prefixOptions={genderOptions}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Email */}
                                    <PrefixedInputField
                                        label="Email"
                                        prefixType="none"
                                        id="email"
                                        value={profileForm.email}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="john.smith@example.com"
                                        error={emailError}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
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

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Phone */}
                                    <PrefixedInputField
                                        label="Phone"
                                        prefixType="countryCode"
                                        prefixValue={profileForm.phonePrefix}
                                        onPrefixChange={(value) => handleSelectChange('phonePrefix', value)}
                                        type="number"
                                        id="phone"
                                        value={profileForm.phone}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="1234567890"
                                        error={phoneError}
                                        prefixOptions={countryCodes}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* SMS */}
                                    <PrefixedInputField
                                        label="SMS"
                                        prefixType="countryCode"
                                        prefixValue={profileForm.smsPrefix}
                                        onPrefixChange={(value) => handleSelectChange('smsPrefix', value)}
                                        type="number"
                                        id="sms"
                                        value={profileForm.sms}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="9876543210"
                                        prefixOptions={countryCodes}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Phone 2 */}
                                    <PrefixedInputField
                                        label="Phone 2"
                                        prefixType="countryCode"
                                        prefixValue={profileForm.phone2Prefix}
                                        onPrefixChange={(value) => handleSelectChange('phone2Prefix', value)}
                                        type="number"
                                        id="phone2"
                                        value={profileForm.phone2}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="0987654321"
                                        error={phone2Error}
                                        prefixOptions={countryCodes}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* NDIS Number */}
                                    <PrefixedInputField
                                        type="number"
                                        label="NDIS Number"
                                        prefixType="none"
                                        id="ndisNumber"
                                        value={profileForm.ndisNumber}
                                        onChange={handleChange}
                                        disabled={disableSection}
                                        placeholder="430000011"
                                        error={ndisError}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />
                                </div>
                            </div>

                            {/* Accounting Details */}
                            <div
                                className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                                <h3 className="text-lg font-medium flex items-center gap-2 mb-6">
                                    <Building2 className="h-5 w-5 text-purple-500"/>
                                    <span>Accounting Details</span>
                                    <span className="text-red-500">*</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Accounting Code */}
                                    <PrefixedInputField
                                        label="Accounting Code"
                                        prefixType="none"
                                        id="accountingCode"
                                        value={profileForm.accountingCode}
                                        onChange={(e) => handleSelectChange('accountingCode', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Choose Accounting Code"
                                        type="select"
                                        options={xeroContact?.map((item) => ({
                                            value: item.ContactID,
                                            label: item.Name,
                                        }))}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Funding Type */}
                                    <PrefixedInputField
                                        label="Funding Type"
                                        prefixType="none"
                                        id="fundingType"
                                        value={profileForm.fundingType}
                                        onChange={(e) => handleSelectChange('fundingType', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Funding Type"
                                        type="select"
                                        options={fundingTypes.map((item) => ({
                                            value: item.ID,
                                            label: item.Type,
                                        }))}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Team Lead */}
                                    <PrefixedInputField
                                        label="Team Lead"
                                        prefixType="none"
                                        id="caseManager"
                                        value={profileForm.caseManager}
                                        onChange={(e) => handleSelectChange('caseManager', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Team Lead"
                                        type="select"
                                        options={teamLeads}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Rostering Manager */}
                                    <PrefixedInputField
                                        label="Rostering Manager"
                                        prefixType="none"
                                        id="caseManager2"
                                        value={profileForm.caseManager2}
                                        onChange={(e) => handleSelectChange('caseManager2', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Rostering Manager"
                                        type="select"
                                        options={reportingManagers}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Area */}
                                    <PrefixedInputField
                                        label="Area"
                                        prefixType="none"
                                        id="area"
                                        value={profileForm.area}
                                        onChange={(e) => handleSelectChange('area', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Area"
                                        type="select"
                                        options={areaData.map((area) => ({
                                            value: area.AreaCode,
                                            label: area.Area,
                                        }))}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Groups */}
                                    <PrefixedInputField
                                        label="Groups"
                                        prefixType="none"
                                        id="groups"
                                        value={profileForm.groups}
                                        onChange={(e) => handleSelectChange('groups', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Groups"
                                        type="select"
                                        options={groupData.map((group) => ({
                                            value: group.Code,
                                            label: group.Groups,
                                        }))}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Require Signature */}
                                    <PrefixedInputField
                                        label="Require Signature"
                                        prefixType="none"
                                        id="requireSignature"
                                        value={profileForm.requireSignature}
                                        onChange={(e) => handleSelectChange('requireSignature', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Requirement"
                                        type="select"
                                        options={reqSign.map((option) => ({
                                            value: option.ParamValue,
                                            label: option.ParamDesc,
                                        }))}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />

                                    {/* Division */}
                                    <PrefixedInputField
                                        label="Division"
                                        prefixType="none"
                                        id="division"
                                        value={profileForm.division}
                                        onChange={(e) => handleSelectChange('division', e.target.value)}
                                        disabled={disableSection}
                                        placeholder="Select Division"
                                        type="select"
                                        options={divisionData.map((division) => ({
                                            value: division.Division,
                                            label: division.Code,
                                        }))}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                    />
                                </div>
                            </div>

                            {/* Other Details section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Location Roster */}
                                <PrefixedInputField
                                    label="Location Roster"
                                    prefixType="none"
                                    id="locationRoster"
                                    value={profileForm.locationRoster}
                                    onChange={(e) => handleSelectChange('locationRoster', e.target.value)}
                                    disabled={disableSection}
                                    placeholder="Select Location Roster"
                                    type="select"
                                    options={locRoster.map((item) => ({
                                        value: `${item.Area}, ${item.State} - ${item.RosterID}`,
                                        label: `${item.Area}, ${item.State} - ${item.RosterID}`,
                                    }))}
                                    className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                />

                                {/* Choose another Client */}
                                <PrefixedInputField
                                    label="Choose another Client"
                                    prefixType="none"
                                    id="client-select"
                                    value={ClientID || ""}
                                    onChange={(e) => handleClientChange(e.target.value)}
                                    disabled={disableSection}
                                    placeholder="Choose another Client"
                                    type="select"
                                    options={clientsList.map((client) => ({
                                        value: client.ClientID,
                                        label: `${client.FirstName} ${client.LastName}`,
                                    }))}
                                    className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                />

                                {/* Payer */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <PrefixedInputField
                                            label="Payer"
                                            prefixType="none"
                                            id="payer"
                                            value={profileForm.PayerName}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            placeholder="Choose"
                                            className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button
                                            onClick={() => handleChooseButtonClick("Payer")}
                                            disabled={disableSection}
                                            className="px-4 py-2.5 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                                        >
                                            Choose
                                        </button>
                                        <button
                                            onClick={() => handleClearButtonClick("Payer")}
                                            disabled={disableSection}
                                            className="px-4 py-2.5 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                            <button
                                onClick={postXeroContact}
                                disabled={disableSection || isFetchingXeroContact}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
                            >
                                <Send className="h-4 w-4"/>
                                <span>Send to Xero</span>
                            </button>

                            <button
                                onClick={fetchXeroContacts}
                                disabled={disableSection || isFetchingXeroContact}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20"
                            >
                                <RefreshCw className="h-4 w-4"/>
                                <span>Sync from Xero</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );

};

export default Profile;

