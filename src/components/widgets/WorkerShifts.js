import React, {useEffect, useState} from 'react';
import {fetchData} from '@/utility/api_utility';
import styles from '@/styles/scheduler.module.css';

const WorkerShifts = ({view, openShifts}) => {
    const [workers, setWorkers] = useState([]);
    const [shiftSchedule, setShiftSchedule] = useState([]);
    const [shiftData, setShiftData] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchWorkers = async () => {
        try {
            const masterData = await fetchData('/api/getWorkerMasterSpecificDataAll', window.location.href);
            if (masterData && Array.isArray(masterData.data)) {
                const workersData = await Promise.all(masterData.data.map(async (worker) => {
                    const totalTimeData = await fetchWorkersTotalShiftHoursData(worker.WorkerID);
                    return {...worker, ...totalTimeData};
                }));
                setWorkers(workersData);
                workersData.forEach(worker => {
                    fetchApprovedShiftsByWorkerID(worker.WorkerID);
                });
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const fetchWorkersTotalShiftHoursData = async (WorkerID) => {
        try {
            const response = await fetchData(`/api/getWorkerTotalTimeDataById/${WorkerID}`, window.location.href);
            return response.success ? response : {totalAvailabilityHours: 0, totalShiftHours: 0, remainingHours: 0};
        } catch (error) {
            console.error(`Error fetching total time data for worker ${WorkerID}:`, error);
            return {totalAvailabilityHours: 0, totalShiftHours: 0, remainingHours: 0};
        }
    };

    const fetchApprovedShiftsByWorkerID = async (WorkerID) => {
        try {
            const response = await fetchData(`/api/getApprovedShiftsByWorkerID/${WorkerID}`, window.location.href);
            if (response.success) {
                setShiftData(prevState => ({...prevState, [WorkerID]: response.data}));
            }
        } catch (error) {
            console.error(`Error fetching shift data for worker ${WorkerID}:`, error);
        }
    };

    useEffect(() => {
        const fetchDataAsync = async () => {
            await fetchWorkers();
            setLoading(false);
        };
        fetchDataAsync();
    }, []);

    useEffect(() => {
        if (workers.length) {
            updateShiftSchedule();
        }
    }, [view, openShifts, shiftData]);

    const updateShiftSchedule = () => {
        const daysInView = getDaysInView();
        const initialSchedule = workers.map(worker => {
            const workerShifts = shiftData[worker.WorkerID] || []; // Use shiftData from state
            const workerSchedule = Array.from({length: daysInView}, () => []);

            workerShifts.forEach(shift => {
                const dayIndex = new Date(shift.ShiftStart).getDay();
                if (!workerSchedule[dayIndex]) {
                    workerSchedule[dayIndex] = [];
                }
                workerSchedule[dayIndex].push({
                    id: shift.id,
                    status: shift.ShiftStatus,
                    color: '#A5D6A7', // Color for shift
                    availability: `${new Date(shift.ShiftStart).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })} - ${new Date(shift.ShiftEnd).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`,
                    serviceDescription: shift.ServiceDescription,
                    clientName: `${shift.ClientFirstName} ${shift.ClientLastName}`
                });
            });

            return {
                id: worker.WorkerID.toString(), // Ensure ID is a string
                name: worker.FirstName,
                schedule: workerSchedule,
                totalAvailabilityHours: worker.totalAvailabilityHours,
                totalShiftHours: worker.totalShiftHours ?? 0,
                remainingHours: worker.remainingHours,
            };
        });

        const openShiftSchedule = Array.from({length: daysInView}, () => []); // Initialize array with empty arrays for each day

        openShifts.forEach(shift => {
            const dayIndex = new Date(shift.date).getDay();
            openShiftSchedule[dayIndex].push({
                id: shift.id,
                status: shift.status,
                color: shift.color,
                availability: shift.availability,
                serviceDescription: shift.serviceDescription,
                clientName: shift.clientName
            });
        });

        setShiftSchedule([{
            id: 'openShifts',
            name: 'Unallocated Shifts',
            schedule: openShiftSchedule
        }, ...initialSchedule]);
    };

    const getDaysInView = () => {
        switch (view) {
            case 'Month':
                return 30;
            case 'Week':
                return 7;
            case 'Fortnight':
                return 14;
            case 'Day':
                return 1;
            default:
                return 7;
        }
    };

    const renderRows = () => {
        const daysInView = getDaysInView();

        return shiftSchedule.map((worker) => (
            <div key={worker.id} className={styles.schedulerRow}>
                <div className={styles.workerItem}>
                    <div>{worker.name}</div>
                </div>
                {worker.schedule.slice(0, daysInView).map((day, dayIndex) => (
                    <div key={dayIndex} className={styles.schedulerCell}>
                        {day.map((shift, index) => (
                            <div key={shift.id} className={styles.shiftStrip}>
                                <div
                                    className={styles.shiftTime}>{shift.availability ? shift.availability.split(' - ')[0] : ''} - {shift.availability ? shift.availability.split(' - ')[1] : ''}</div>
                                <div
                                    className={styles.shiftDescription}>{shift.serviceDescription && shift.serviceDescription.length > 27 ? `${shift.serviceDescription.slice(0, 27)}...` : shift.serviceDescription || ''}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        ));
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <>
            {renderRows()}
        </>
    );
};

export default WorkerShifts;
