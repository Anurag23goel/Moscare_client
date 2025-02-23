import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {fetchData} from '@/utility/api_utility';
import styles from '@/styles/scheduler.module.css';

const WorkerCalendar = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!WorkerID) return;

        const fetchWorkerShifts = async () => {
            try {
                const data = await fetchData(`/api/getApprovedShiftsByWorkerID/${WorkerID}`, window.location.href);
                console.log('Fetched worker shifts:', data);
                setEvents(data.data.map(shift => ({
                    title: `${shift.ClientFirstName} ${shift.ClientLastName}` || 'Shift',
                    start: shift.ShiftStart,
                    end: shift.ShiftEnd,
                    service: shift.ServiceDescription,
                    classNames: [getShiftClassName(shift.ShiftStart, shift.ShiftEnd)]
                })));
            } catch (error) {
                console.error('Error fetching worker shifts:', error);
            }
        };
        fetchWorkerShifts();
    }, [WorkerID]);

    const getShiftClassName = (start, end) => {
        const now = new Date();
        const shiftStart = new Date(start);
        const shiftEnd = new Date(end);
        if (shiftEnd < now) {
            return 'pastShift';
        } else if (shiftStart <= now && shiftEnd >= now) {
            return 'currentShift';
        } else {
            return 'futureShift';
        }
    };

    const formatTime = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(date));
    };

    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };

    return (
        <>
            {/*<DashMenu />*/}
            <div className={styles.calendarContainer}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    eventTimeFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short'
                    }}
                    buttonText={{
                        today: 'Today',
                        month: 'Month',
                        week: 'Week',
                        day: 'Day'
                    }}
                    eventContent={(arg) => (
                        <div className={styles.fcEventContent}>
                            <div className={styles.fcEventTitle}>{arg.event.title}</div>
                            <div className={styles.fcEventTime}>
                                {formatTime(arg.event.start)} - {formatTime(arg.event.end)}
                            </div>
                            <div className={styles.fcEventService}>
                                {truncateText(arg.event.extendedProps.service, 27)}
                            </div>
                        </div>
                    )}
                    eventClassNames={(arg) => getShiftClassName(arg.event.start, arg.event.end)}
                />
            </div>
        </>
    );
};

export default WorkerCalendar;
