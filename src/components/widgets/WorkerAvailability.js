import React, {useEffect, useState} from 'react';
import {fetchData} from '@/utility/api_utility';
import styles from '@/styles/scheduler.module.css';
import {Container, Popover} from '@mui/material';
import {v4 as uuidv4} from 'uuid';
import {Col, Row} from "react-bootstrap";
import MButton from './MaterialButton';
import InputField from './InputField';

const AvailabilityScheduler = ({initialView}) => {
    const [workers, setWorkers] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [view, setView] = useState(initialView);
    const [loading, setLoading] = useState(true);
    const [popoverAnchor, setPopoverAnchor] = useState(null);
    const [popoverContent, setPopoverContent] = useState([]);
    const [activeTab, setActiveTab] = useState('availability');

    const fetchWorkers = async () => {
        try {
            console.log('Fetching workers...');
            const masterData = await fetchData('/api/getWorkerMasterSpecificDataAll', window.location.href);
            console.log('Workers fetched:', masterData);
            if (masterData && Array.isArray(masterData.data)) {
                const workersData = await Promise.all(masterData.data.map(async (worker) => {
                    const availabilityData = await fetchWorkerAvailabilityDataById(worker.WorkerID);
                    return {...worker, availabilityData};
                }));
                setWorkers(workersData);
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const fetchWorkerAvailabilityDataById = async (WorkerID) => {
        try {
            console.log(`Fetching availability data for worker ${WorkerID}...`);
            const response = await fetchData(`/api/getWorkerAvailabilityTimeData/${WorkerID}`, window.location.href);
            console.log(`Availability data for worker ${WorkerID} fetched:`, response);
            return response.success ? response.data : [];
        } catch (error) {
            console.error(`Error fetching availability data for worker ${WorkerID}:`, error);
            return [];
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
            updateSchedule(workers);
        }
    }, [view, workers]);

    const updateSchedule = (workersData) => {
        const daysInView = getDaysInView();
        const initialSchedule = workersData.map((worker) => {
            const workerSchedule = Array.from({length: daysInView}, () => []);

            Object.keys(worker.availabilityData).forEach((key) => {
                const dayIndex = getDayIndex(key);
                if (dayIndex !== -1) {
                    worker.availabilityData[key].forEach((availability) => {
                        workerSchedule[dayIndex].push({
                            id: uuidv4(),
                            status: worker.availabilityData[`${key}Status`],
                            availability: availability,
                        });
                    });
                }
            });

            return {
                id: worker.WorkerID.toString(), // Ensure ID is a string
                name: worker.FirstName,
                schedule: workerSchedule,
            };
        });

        setSchedule(initialSchedule);
    };

    const getDayIndex = (day) => {
        switch (day) {
            case 'CurrentMo':
            case 'NextMo':
                return 0;
            case 'CurrentTu':
            case 'NextTu':
                return 1;
            case 'CurrentWe':
            case 'NextWe':
                return 2;
            case 'CurrentTh':
            case 'NextTh':
                return 3;
            case 'CurrentFr':
            case 'NextFr':
                return 4;
            case 'CurrentSa':
            case 'NextSa':
                return 5;
            case 'CurrentSu':
            case 'NextSu':
                return 6;
            default:
                return -1;
        }
    };

    const renderPopoverContent = () => {
        if (!Array.isArray(popoverContent)) {
            return null;
        }

        return (
            <div className={styles.popoverContent}>
                {popoverContent.map((shift, index) => (
                    <div key={index}>
                        <div>Availability: {shift.availability}</div>
                        <div>Status: {shift.status}</div>
                        {index < popoverContent.length - 1 && <hr/>}
                    </div>
                ))}
            </div>
        );
    };

    const renderRows = () => {
        const daysInView = getDaysInView();

        return schedule.map((worker) => (
            <div key={worker.id} className={styles.schedulerRow}>
                <div className={styles.workerItem}>
                    <div>{worker.name}</div>
                </div>
                {worker.schedule.slice(0, daysInView).map((day, dayIndex) => (
                    <div key={dayIndex} className={styles.schedulerCell}>
                        {day.map((shift, index) => (
                            <div
                                key={index}
                                className={shift.status === 'As Below' ? styles.available : shift.status === 'Partially Available' ? styles.partiallyAvailable : styles.unavailable}
                                onClick={(event) => handlePopoverOpen(event, [shift])}
                            >
                                {shift.availability}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        ));
    };

    const handlePopoverOpen = (event, shifts) => {
        setPopoverAnchor(event.currentTarget);
        setPopoverContent(shifts);
    };

    const handlePopoverClose = () => {
        setPopoverAnchor(null);
        setPopoverContent([]);
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

    const renderHeader = () => {
        const daysInView = getDaysInView();
        const days = Array.from({length: daysInView}, (_, i) => i + 1);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        return (
            <div className={styles.schedulerHeader}>
                <div className={styles.schedulerHeaderCell}>All Workers</div>
                {days.map((day, index) => {
                    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
                    const dayMonth = `${date.getDate()}/${date.getMonth() + 1} ${dayNames[date.getDay()]}`;
                    return (
                        <div key={day} className={styles.schedulerHeaderCell}>
                            {dayMonth}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleViewChange = (event) => {
        setView(event.target.value);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div className={styles.schedulerContainer}>
            <Container style={{maxWidth: '100%'}}>
                <Row className="mb-2" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                    <Col sm={6} style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <InputField
                            id="view"
                            label="Select View"
                            value={view}
                            onChange={handleViewChange}
                            type="select"
                            options={[
                                {value: "Month", label: "Month"},
                                {value: "Fortnight", label: "Fortnight"},
                                {value: "Week", label: "Week"},
                                {value: "Day", label: "Day"},
                            ]}
                            placeholder={initialView} // Add placeholder
                            className={styles.viewSelect}
                        />
                        <MButton
                            label="Publish"
                            variant="contained"
                            color="primary"
                            size={"small"}
                            className={styles.filterButton}
                        />
                    </Col>
                </Row>
                <div className={styles.tabs}>
                    <div className={styles.tabContainer}>
                        <button
                            className={`${styles.tab_button} ${activeTab === 'availability' ? styles.active : ''}`}
                            onClick={() => setActiveTab('availability')}
                        >
                            Worker Availability
                        </button>
                    </div>
                </div>
                {activeTab === 'availability' && (
                    <SchedulerContent
                        renderHeader={renderHeader}
                        renderRows={renderRows}
                    />
                )}
            </Container>

            <Popover
                open={Boolean(popoverAnchor)}
                anchorEl={popoverAnchor}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {renderPopoverContent()}
            </Popover>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendColor} style={{backgroundColor: '#A5D6A7'}}></span>
                    Available
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendColor} style={{backgroundColor: '#FFE082'}}></span>
                    Partially Available
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendColor} style={{backgroundColor: '#FFCDD2'}}></span>
                    Unavailable
                </div>
            </div>
        </div>
    );
};

export default AvailabilityScheduler;
