import React, {useEffect, useState} from 'react';
import {fetchData} from '@/utility/api_utility';
import {useRouter} from 'next/router';
import PendingApprovalCalendar from '../../widgets/PendingForApprovalCalendar'; // Adjust the import path as needed

const RosterApproval = () => {
    const [draftShifts, setDraftShifts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false); // State to control modal visibility
    const router = useRouter();

    // Fetch draft shifts when the modal is opened
    useEffect(() => {
        if (isModalOpen) {
            fetchDraftShifts();
        }
    }, [isModalOpen]);

    const fetchDraftShifts = async () => {
        try {
            const response = await fetchData('/api/getPendingApprovalShifts');
            if (response && response.success) {
                setDraftShifts(response.data);
            } else {
                console.error('Failed to fetch draft shifts.');
            }
        } catch (error) {
            console.error('Error fetching draft shifts:', error);
        }
    };


    return (
        <div style={{marginTop: '20px'}}>
            <PendingApprovalCalendar/>
        </div>
    );
};

export default RosterApproval;
