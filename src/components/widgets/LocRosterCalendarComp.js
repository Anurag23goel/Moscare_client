// LocRosterCalendarComp.jsx
import React, {useContext, useEffect, useState} from 'react'; // Added useContext
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // Include if needed
import interactionPlugin from '@fullcalendar/interaction'; // Import interaction plugin
import {fetchData} from '@/utility/api_utility';
import styles from '@/styles/scheduler.module.css';
import ColorContext from '@/contexts/ColorContext'; // Import ColorContext

const LocRosterCalendarComp = ({disable, onDateClick, locationId, onShiftClick}) => {
    const [events, setEvents] = useState([]);
    // const {colors} = useContext(ColorContext); // Access colors from context

    useEffect(() => {
        const fetchLocationShifts = async () => {
            try {
                if (!locationId) return;
                const url = `/api/getLocationRosterApprovedShiftsByLocationID/${locationId}`;
                const data = await fetchData(url);
                console.log('Fetched location shifts:', data);

                if (data && data.data) {
                    console.log('First shift data:', data.data[0]);
                    const formattedEvents = data.data.map((shift) => {
                        // Split WorkerIDs and WorkerFirstNames into arrays
                        const workerIDs = shift.WorkerIDs ? shift.WorkerIDs.split(',') : [];
                        const workerNames = shift.WorkerFirstNames ? shift.WorkerFirstNames.split(',') : [];
                        const workers = workerIDs.map((id, index) => ({
                            WorkerID: id.trim(),
                            FirstName: workerNames[index]?.trim() || '',
                        }));

                        // Split ClientIDs and ClientFirstNames into arrays
                        const clientIDs = shift.ClientIDs ? shift.ClientIDs.split(',') : [];
                        const clientNames = shift.ClientFirstNames ? shift.ClientFirstNames.split(',') : [];
                        const clients = clientIDs.map((id, index) => ({
                            ClientID: id.trim(),
                            FirstName: clientNames[index]?.trim() || '',
                        }));

                        return {
                            title: `${shift.ServiceDescription} [${shift.WorkerCount}:${shift.ClientCount}]` || '',
                            start: shift.ShiftStart ? new Date(shift.ShiftStart) : null,
                            end: shift.ShiftEnd ? new Date(shift.ShiftEnd) : null,
                            extendedProps: {
                                ...shift,
                                shiftID: shift.ShiftID,
                                locationID: shift.LocationId,
                                serviceDescription: shift.ServiceDescription,
                                WtoCount: `${shift.WorkerCount}:${shift.ClientCount}`,
                                Workers: workers, // Array of worker objects
                                Clients: clients, // Array of client objects
                            },
                            classNames: [getShiftClassName(shift.ShiftStart, shift.ShiftEnd)],
                        };
                    });
                    console.log('Formatted events:', formattedEvents);
                    setEvents(formattedEvents);
                } else {
                    console.error('Data format is incorrect:', data);
                }
            } catch (error) {
                console.error('Error fetching location shifts:', error);
            }
        };

        fetchLocationShifts();
    }, [locationId]);

    const getShiftClassName = (start, end) => {
        const now = new Date();
        if (new Date(end) < now) {
            return styles.shiftPast;
        } else if (new Date(start) <= now && new Date(end) >= now) {
            return styles.shiftPresent;
        } else {
            return styles.shiftFuture;
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        const options = {hour: 'numeric', minute: '2-digit', hour12: true};
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };

    // Effect to apply inline styles to FullCalendar buttons
    useEffect(() => {
        // Define selectors for FullCalendar's default buttons and custom button
        const buttonSelectors = [
            '.fc-prev-button',
            '.fc-next-button',
            '.fc-today-button',
            '.fc-dayGridMonth-button',
            '.fc-timeGridWeek-button',
            '.fc-timeGridDay-button',
            '.fc-button', // Includes custom buttons like 'Create Shift'
        ];

        buttonSelectors.forEach((selector) => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach((button) => {
                if (button) {
                    // Apply primary color styles
                    button.style.backgroundColor = "blue";
                    button.style.color = 'white';
                    button.style.border = 'none';
                    button.style.borderRadius = '4px';
                    button.style.fontWeight = 'bold';
                    button.style.cursor = 'pointer';

                    // Add simple hover effect using opacity
                    button.onmouseover = () => {
                        button.style.opacity = '0.8';
                    };
                    button.onmouseout = () => {
                        button.style.opacity = '1';
                    };
                }
            });
        });
    }, ["blue", events]); // Re-run when primary color or events change

    return (
        <div className={styles.calendarContainer}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Include the necessary plugins
                initialView="dayGridMonth"
                events={events}
                headerToolbar={{
                    left: `prev,next today createShiftButton`,
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                customButtons={{
                    createShiftButton: {
                        text: 'Create Shift',
                        click: (info) => {
                            if (!disable) {
                                onDateClick(info);
                            }
                        },
                        className: 'createShiftButton', // Assign custom class directly
                    },
                }}
                editable={false}
                selectable={true}
                selectMirror={true}
                dateClick={(info) => {
                    if (!disable) {
                        onDateClick(info);
                    }
                }} // Handle date clicks
                eventClick={(info) => {
                    if (!disable) {
                        onShiftClick(info.event.extendedProps); // Pass shift data to parent
                    }
                }}
                dayMaxEvents={true}
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                }}
                buttonText={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                }}
                eventContent={(arg) => (
                    <div className={`${styles.CalendarShiftStrip} ${arg.event.classNames}`}>
                        <div className={styles.shiftDescription}>{arg.event.title}</div>
                        <div className={styles.shiftTime}>
                            <div className={styles.shiftCountt}>W:C({arg.event.extendedProps.WtoCount})</div>
                            {formatTime(arg.event.start)} - {formatTime(arg.event.end)}
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default LocRosterCalendarComp;
