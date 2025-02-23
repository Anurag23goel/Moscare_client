import React, {useEffect, useState} from 'react';
import LocationRosterPendingApprovalCalendar from '../../widgets/LocationRosterPendingApprovalCalendar';
import Cookies from "js-cookie";
import {postData} from "@/utility/api_utility";
import {Typography} from "@mui/material";

const LocationRosterApproval = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [message, setMessage] = useState('');
    // Optional: If you have any additional logic when the modal opens
    useEffect(() => {
        if (isModalOpen) {
            // Additional logic here
        }
    }, [isModalOpen]);

    // Function to fetch user info and assign role
    const fetchUserInfo = async () => {
        try {
            const User_ID = Cookies.get("User_ID"); // Retrieve User_ID from the cookie
            if (!User_ID) {
                throw new Error("User_ID is not defined or missing in cookies.");
            }

            const response = await postData('/api/getUserInfo', {User_ID});
            if (response && (response.UserGroup === 'Rostering Manager' || response.UserGroup === 'Super Admin' || response.UserGroup === 'All')) {
                setUserRole(response.UserGroup);
            } else {
                setMessage('Roster Approval data is only visible Rostering Clerks');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return (
        <>
            {userRole ? (
                <div style={{marginTop: '20px'}}>
                    <LocationRosterPendingApprovalCalendar/>
                </div>
            ) : (
                <Typography variant="h6" style={{textAlign: 'center', marginTop: '20px'}}>
                    {message || 'You dont have access to this page'}
                </Typography>
            )
            }
        </>
    );
};

export default LocationRosterApproval;
