import React, {useEffect, useState} from 'react';
import LocationRosterCalendar from './LocationRosterCalendar';

const LocationRosterCalendarPage = () => {
    const [selectedRoster, setSelectedRoster] = useState(null);

    useEffect(() => {
        // Option 1: Get data from URL
        const queryParams = new URLSearchParams(window.location.search);
        const rosterId = queryParams.get('id');
        const rosterName = queryParams.get('roster');

        if (rosterId && rosterName) {
            setSelectedRoster({Id: rosterId, Roster: rosterName});
        }

        // Option 2: Get data from sessionStorage
        const storedRoster = sessionStorage.getItem('selectedRoster');
        if (storedRoster) {
            setSelectedRoster(JSON.parse(storedRoster));
        }
    }, []);

    if (!selectedRoster) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Roster Details: {selectedRoster.Roster}</h1>
            <LocationRosterCalendar rosterId={selectedRoster.Id}/>
        </div>
    );
};

export default LocationRosterCalendarPage;
