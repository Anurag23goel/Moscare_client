import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import LocationRosterCalendar from '../../../components/forms/roster_management/LocationRosterCalendar';
import {fetchData} from '@/utility/api_utility'; // Your utility for API calls

const LocationRoster = () => {
    const router = useRouter();
    const {RosterID} = router.query;

    const [rosterData, setRosterData] = useState(null);
    const [availableRosters, setAvailableRosters] = useState([]); // Initialize with empty array
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (RosterID) {
            fetchRosterData(RosterID);
            fetchAvailableRosters(); // Fetch available rosters for the dropdown
        }
    }, [RosterID]);

    const fetchRosterData = async (RosterID) => {
        try {
            const response = await fetchData(`/api/getLocRosterDataByID?RosterID=${RosterID}`);
            if (response.success) {
                setRosterData(response.data);
            }
        } catch (error) {
            console.error('Error fetching roster data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableRosters = async () => {
        try {
            const response = await fetchData(`/api/getAllRosters`);
            if (response.success) {
                setAvailableRosters(response.data);
                console.log('Available rosters:', response.data);
            } else {
                console.error('Error fetching available rosters:', response.message);
            }
        } catch (error) {
            console.error('Error fetching available rosters:', error);
        }
    };


    return (
        <div>
            {!loading && rosterData && (
                <LocationRosterCalendar rosterData={rosterData} availableRosters={availableRosters}/>
            )}
        </div>
    );
};

export default LocationRoster;
