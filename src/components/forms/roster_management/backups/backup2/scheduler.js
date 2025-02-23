import React, {useCallback, useEffect, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {fetchData, postData} from '@/utility/api_utility';
import styles from '@/styles/scheduler.module.css';
import {
  Avatar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import SchedulerContent from './SchedulerContent';
import {Col, ListGroup, Modal, Row} from 'react-bootstrap';
import {useRouter} from 'next/router';
import DroppableCell from './DroppableCell';
import DraggableShift from './DraggableShift';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignShiftModal from './AddShiftModal';
import {addDays, format, isSameDay, parseISO, startOfToday, startOfWeek,} from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CopyIcon from '@mui/icons-material/ContentCopy';
import PublishIcon from '@mui/icons-material/Publish';
import PersonIcon from '@mui/icons-material/Person';
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';
import AddIcon from "@mui/icons-material/Add";
import MButton from './MaterialButton';

// Skeleton component for loading states
const SchedulerSkeleton = ({ view }) => {
  const getDaysInView = () => {
    switch (view) {
      case 'Month':
        return 30;
      case 'Fortnight':
        return 14;
      case 'Week':
        return 7;
      case 'Day':
        return 1;
      case 'Compact':
        return 30;
      default:
        return 7;
    }
  };
  const daysInView = getDaysInView();
  const rows = 10;

  return (
    <div className={styles.schedulerContainer}>
      <div className={styles.schedulerHeader}>
        <div className={`${styles.schedulerHeaderCell} ${styles.stickyColumn}`}>
          <Skeleton variant="rectangular" width="100%" height={40} />
        </div>
        {Array.from({ length: daysInView }).map((_, index) => (
          <div key={index} className={styles.schedulerHeaderCell}>
            <Skeleton variant="rectangular" width="100%" height={40} />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.schedulerRow}>
          <div className={`${styles.workerItem} ${styles.stickyColumn}`}>
            <Skeleton variant="rectangular" width="100%" height={40} />
          </div>
          {Array.from({ length: daysInView }).map((_, cellIndex) => (
            <div key={cellIndex} className={styles.schedulerCell}>
              <Skeleton variant="rectangular" width="100%" height={40} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Scheduler = () => {
  const [showClientModal, setShowClientModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [view, setView] = useState('Week');
  const [loading, setLoading] = useState(true);
  const [openShifts, setOpenShifts] = useState([]);
  const [shiftData, setShiftData] = useState({});
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverContent, setPopoverContent] = useState([]);
  const [activeTab, setActiveTab] = useState('availability');
  const router = useRouter();
  const [isDraftEnabled, setIsDraftEnabled] = useState(false);
  const [draftShifts, setDraftShifts] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogShift, setConfirmDialogShift] = useState(null);
  const [thresholdHours, setThresholdHours] = useState(0);
  const [thresholdAmount, setThresholdAmount] = useState(0);
  const [color, setColors] = useState([]);
  const [disableSection, setDisableSection] = useState(false);
  const [validationMessages, setValidationMessages] = useState([]);
    // const { colors } = useContext(ColorContext);

  const [clientId, setClientId] = useState(null);
  const [rosterId, setRosterId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRoster, setSelectedRoster] = useState(null);


  const [selectedShift, setSelectedShift] = useState(null); // New state for selected shift

  // const socketRef = useRef(null);

  // useEffect(() => {
  //   // Connect to the Socket.IO server
  //   socketRef.current = io(process.env.NEXT_PUBLIC_MOSCARE || 'http://localhost:5001');

  //   // Listen for events
  //   socketRef.current.on('shiftCreated', (data) => {
  //     console.log('Shift created:', data);
  //     addValidationMessage(data.message, "info");
  //     fetchDataAsync();
  //   });

  //   socketRef.current.on('shiftDraftSaved', (data) => {
  //     console.log('Draft shift saved:', data);
  //     addValidationMessage("A draft shift has been saved.", "info");
  //     fetchDataAsync();
  //   });

  //   socketRef.current.on('shiftsPublished', (data) => {
  //     console.log('Shifts published:', data);
  //     addValidationMessage("Shifts have been published successfully!", "success");
  //     fetchDataAsync();
  //   });

  //   // Cleanup the connection on unmount
  //   return () => {
  //     if (socketRef.current) socketRef.current.disconnect();
  //   };
  // }, []);

  const addValidationMessage = useCallback((content, type = 'info') => {
    const id = uuidv4();
    setValidationMessages(prev => [...prev, { id, type, content }]);
    // Auto-remove the message after 4 seconds
    setTimeout(() => {
      setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, 4000);
  }, []);

  const handleCloseMessage = useCallback((id) => {
    setValidationMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    // Automatically select the first roster associated with the client, if any
    if (client.RosterIDs && client.RosterIDs.length > 0) {
      setSelectedRoster(client.RosterIDs[0]);
    } else {
      setSelectedRoster(null);
    }
  };

  const handleShiftUpdate = () => {
    fetchDataAsync(); // Fetch the latest data
  };


  const CACHE_KEY = 'workerProfilePictures';

  // Load cache from localStorage
  const loadCache = () => {
    const cache = localStorage.getItem(CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  };

  // Save cache to localStorage
  const saveCache = (cache) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  };

  const fetchWorkerProfilePictures = async (workersList) => {
    const company = process.env.NEXT_PUBLIC_COMPANY;
    const cache = loadCache();

    const updatedData = await Promise.all(
      workersList.map(async (worker) => {
        if (!worker.Folder || !worker.File) {
          return { ...worker, UserProfile: null };
        }

        if (cache[worker.WorkerID] !== undefined) {
          return { ...worker, UserProfile: cache[worker.WorkerID] };
        }

        const fileName = encodeURIComponent(worker.File);
        const folderPath = generatePFPFolderPath(company, worker.WorkerID, fileName);

        try {
          const userProfileResponse = await fetchData(`/api/getS3Data/${folderPath}`);
          const { dataURL } = userProfileResponse;

          const fileResponse = await fetch(dataURL);
          if (!fileResponse.ok) {
            console.error(`Error fetching file from S3 for WorkerID ${worker.WorkerID}.`);
            cache[worker.WorkerID] = null;
            return { ...worker, UserProfile: null };
          }

          cache[worker.WorkerID] = dataURL;
          return { ...worker, UserProfile: dataURL };
        } catch (error) {
          console.error(`Error fetching profile for WorkerID ${worker.WorkerID}:`, error);
          cache[worker.WorkerID] = null;
          return { ...worker, UserProfile: null };
        }
      })
    );

    // Save updated cache
    saveCache(cache);

    return updatedData;
  };

  // Utility function to generate S3 folder path
  const generatePFPFolderPath = (company, workerId, filename) => {
    return `${company}/worker/${workerId}/profile_picture/${filename}`;
  };


  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientData = await fetchData(
          "/api/getClientMasterSpecificDataAll",
          window.location.href
        );
        const shiftData = await fetchData(
          "/api/getApprovedShifts",
          window.location.href
        );
        const rosterMasterData = await fetchData(
          "/api/getRosterMasterData",
          window.location.href
        );

        // Map roster data by ClientID
        const rosterDataByClientID = rosterMasterData.data.reduce(
          (acc, roster) => {
            if (!acc[roster.ClientID]) {
              acc[roster.ClientID] = [];
            }
            acc[roster.ClientID].push(roster);
            return acc;
          },
          {}
        );

        // Map shift data by ClientID to get shift counts
        const shiftCountByClientID = shiftData.data.reduce((acc, shift) => {
          acc[shift.ClientID] = (acc[shift.ClientID] || 0) + 1;
          return acc;
        }, {});

        // Combine client data with shift data and roster data
        const combinedData = clientData.data.map((client) => ({
          ...client,
          RosterIDs: rosterDataByClientID[client.ClientID] || [],
          shiftCount: shiftCountByClientID[client.ClientID] || 0,
        }));

        setClients(combinedData);
        setFilteredClients(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        addValidationMessage("Failed to fetch client data.", "error");
      }
    };

    fetchClients();
  }, [addValidationMessage]);


  // GET SHIFT COLORS
  const getShiftColors = async () => {
    try {
      const data = await fetchData(`/api/getShiftColors`);
      setColors(data.data);
    } catch (error) {
      console.error('Error fetching shift color:', error);
    }
  };

  useEffect(() => {
    getShiftColors();
  }, []);

  const getThresholdValues = async () => {
    try {
      const response = await fetchData('/api/getThresholdValues');
      console.log('API Response:', response);
      if (response.success) {
        setThresholdHours(parseFloat(response.data.thresholdHours) || 0);
        setThresholdAmount(parseFloat(response.data.thresholdAmount) || 0);
      } else {
        console.error('Error fetching threshold values:', response.error);
      }
    } catch (error) {
      console.error('Error fetching threshold values:', error);
    }
  };

  const openConfirmDialog = (action, shift = null) => {
    setConfirmDialogAction(action);
    setConfirmDialogShift(shift);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmDialogAction === 'saveDraft') {
      handleSaveAsDraft();
    } else if (confirmDialogAction === 'publish') {
      handlePublish();
    } else if (confirmDialogAction === 'sendForApproval') {
      handleShiftSubmitForApproval(confirmDialogShift);
    }
    setConfirmDialogOpen(false);
  };

  const [formState, setFormState] = useState({
    allWorkerWithShifts: 'All Workers With Shifts',
    allWorkerDivisions: 'All Worker Divisions',
    clientCaseManagers: 'All Client Case Managers',
    allWorkerWithRoles: 'All Workers With Roles',
    date: new Date().toISOString().slice(0, 10),
  });

  // Fetch basic worker data
  const fetchWorkersBasic = async () => {
    try {
      const masterData = await fetchData(
        '/api/getWorkerMasterSpecificDataAll',
        window.location.href
      );
      if (masterData && Array.isArray(masterData.data)) {
        // Initialize totalShiftHours and totalChargeAmount to 0
        const workersData = masterData.data.map((worker) => ({
          ...worker,
          totalShiftHours: 0,
          totalChargeAmount: 0,
        }));
        return workersData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching basic workers:', error);
      return [];
    }
  };

  // Fetch full worker data (including Folder, File)
  const fetchWorkersFull = async () => {
    try {
      const response = await fetchData(
        '/api/getWorkerMasterDataAll',
        window.location.href
      );
      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching full worker data:', error);
      return [];
    }
  };

  // Merge basic and full worker data by WorkerID
  const mergeWorkerData = (basicData, fullData) => {
    const fullDataMap = new Map();
    fullData.forEach((w) => {
      fullDataMap.set(w.WorkerID, w);
    });

    return basicData.map((worker) => {
      const fullInfo = fullDataMap.get(worker.WorkerID) || {};
      return {
        ...worker,
        ...fullInfo,
      };
    });
  };


  // Fetch data including profile pictures
  const fetchDataAsync = async () => {
    setLoading(true);
    try {
      // Fetch basic worker data
      const basicWorkers = await fetchWorkersBasic();
      // Fetch full worker data (with Folder, File)
      const fullWorkers = await fetchWorkersFull();

      // Merge them by WorkerID
      let mergedWorkers = mergeWorkerData(basicWorkers, fullWorkers);

      // Fetch profile pictures
      const workersWithPictures = await fetchWorkerProfilePictures(mergedWorkers);
      setWorkers(workersWithPictures);

      await fetchClients();
      await getAllShifts();
    } catch (error) {
      console.error('Error in fetchDataAsync:', error);
    }
    setLoading(false);
  };



  // Fetch clients
  const fetchClients = async () => {
    try {
      const clientData = await fetchData(
        '/api/getClientMasterSpecificDataAll',
        window.location.href
      );
      if (clientData && Array.isArray(clientData.data)) {
        setClients(clientData.data);
      } else {
        console.error('Fetched client data is not an array:', clientData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Fetch availability for a worker
  const fetchWorkersAvailabilitySchedule = async (WorkerID) => {
    try {
      const response = await fetchData(`/api/getWorkerAvailabilityTimeData/${WorkerID}`, window.location.href);
      const availabilityData = response.data[0];

      // If no availability data is found, return an empty object without logging an error
      if (!availabilityData) {
        return {};
      }

      const availabilityMap = {};
      const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
      const today = startOfToday();
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

      // Current week
      daysOfWeek.forEach((day, index) => {
        const statusKey = `Current${day}Status`;
        const timeKey = `Current${day}`;
        const date = addDays(startOfCurrentWeek, index);
        const dateStr = format(date, 'yyyy-MM-dd');

        if (date >= today) {
          let availability;
          if (availabilityData[statusKey] === 'Available') {
            availability = [{ status: 'Available', color: '#cce7ff', availability: 'Available' }];
          } else if (availabilityData[statusKey] === 'As Below') {
            const times = availabilityData[timeKey] || [];
            availability = times.map((timeRange) => ({
              status: 'Partially Available',
              color: '#fff3cd',
              availability: timeRange,
            }));
          } else {
            availability = [{ status: 'Unavailable', color: '#ffccd5', availability: 'Unavailable' }];
          }
          availabilityMap[dateStr] = availability;
        }
      });

      // Next week
      const startOfNextWeek = addDays(startOfCurrentWeek, 7);
      daysOfWeek.forEach((day, index) => {
        const statusKey = `Next${day}Status`;
        const timeKey = `Next${day}`;
        const date = addDays(startOfNextWeek, index);
        const dateStr = format(date, 'yyyy-MM-dd');

        let availability;
        if (availabilityData[statusKey] === 'Available') {
          availability = [{ status: 'Available', color: '#cce7ff', availability: 'Available' }];
        } else if (availabilityData[statusKey] === 'As Below') {
          const times = availabilityData[timeKey] || [];
          availability = times.map((timeRange) => ({
            status: 'Partially Available',
            color: '#fff3cd',
            availability: timeRange,
          }));
        } else {
          availability = [{ status: 'Unavailable', color: '#ffccd5', availability: 'Unavailable' }];
        }
        availabilityMap[dateStr] = availability;
      });

      return availabilityMap;
    } catch (error) {
      // Log only critical errors (e.g., network issues, server issues)
      if (error.response && error.response.status !== 404) {
        console.error(`Error fetching availability for worker ${WorkerID}:`, error);
      }
      // Return an empty object to gracefully handle the absence of data
      return {};
    }
  };


  // Fetch all shifts
  const getAllShifts = async () => {
    try {
      const response = await fetchData('/api/getAllShifts', window.location.href);
      if (response.success) {
        const allShiftsData = response.data;

        // Ensure that ChargeRate is a number
        allShiftsData.forEach((shift) => {
          shift.ChargeRate = parseFloat(shift.ChargeRate) || 0;
        });

        const shiftDataByWorker = {};
        const unallocatedShifts = [];
        const drafts = [];

        allShiftsData.forEach((shift) => {
          // Check if the shift is a draft
          if (shift.Status === 'D') {
            drafts.push(shift);
          }

          let isUnallocated = true;

          [
            'SupportWorker1',
            'SupportWorker2',
            'SupportWorker3',
            'SupportWorker4',
          ].forEach((workerField) => {
            const workerId = shift[workerField];
            if (workerId && workerId !== 'UNALLOCATED') {
              isUnallocated = false;
              if (!shiftDataByWorker[workerId]) {
                shiftDataByWorker[workerId] = [];
              }
              shiftDataByWorker[workerId].push(shift);
            }
          });

          // If no workers are allocated, add to unallocatedShifts
          if (isUnallocated) {
            unallocatedShifts.push(shift);
          }
        });

        // Update the state
        setShiftData(shiftDataByWorker);
        setOpenShifts(unallocatedShifts);

        // Set draft shifts
        setDraftShifts(drafts);
        if (drafts.length > 0) {
          setIsDraftEnabled(true);
        }
      } else {
        console.error('Error fetching all shifts:', response.error);
      }
    } catch (error) {
      console.error('Error fetching all shifts:', error);
    }
  };

  useEffect(() => {
    fetchDataAsync();
  }, [view, activeTab]);

  // Recalculate total shift hours and charge amounts whenever shiftData or view changes
  useEffect(() => {
    if (shiftData && Object.keys(shiftData).length > 0) {
      const updatedWorkers = recalculateTotalShiftHoursAndChargeAmount();
      setWorkers(updatedWorkers);
      updateSchedule(updatedWorkers, openShifts);
    }
  }, [shiftData, view]);



  // Function to recalculate total shift hours and charge amounts for each worker
  const recalculateTotalShiftHoursAndChargeAmount = () => {
    const workerHours = {};
    const workerChargeAmounts = {};
    const daysInView = getDaysInView();
    const today = startOfToday();
    const startDate = today;
    const endDate = addDays(today, daysInView);

    // Process all shifts
    Object.values(shiftData)
      .flat()
      .forEach((shift) => {
        const shiftStart = new Date(shift.ShiftStart);
        const shiftEnd = new Date(shift.ShiftEnd);

        if (shiftEnd >= startDate && shiftStart <= endDate) {
          const effectiveStart = shiftStart < startDate ? startDate : shiftStart;
          const effectiveEnd = shiftEnd > endDate ? endDate : shiftEnd;
          const duration = (effectiveEnd - effectiveStart) / (1000 * 60); // in minutes

          const supportWorkers = [
            shift.SupportWorker1,
            shift.SupportWorker2,
            shift.SupportWorker3,
            shift.SupportWorker4,
          ].filter((id) => id && id !== 'UNALLOCATED');

          const chargeRate = parseFloat(shift.ChargeRate);
          if (isNaN(chargeRate)) {
            console.warn(
              `Invalid ChargeRate for shift ${shift.ShiftID}: ${shift.ChargeRate}`
            );
          }
          const numSupportWorkers = supportWorkers.length || 1;
          const durationPerWorker = duration / numSupportWorkers;
          const chargeAmountPerWorker =
            ((duration / 60) * chargeRate) / numSupportWorkers;

          supportWorkers.forEach((workerId) => {
            if (!workerHours[workerId]) {
              workerHours[workerId] = 0;
            }
            if (!workerChargeAmounts[workerId]) {
              workerChargeAmounts[workerId] = 0;
            }
            workerHours[workerId] += durationPerWorker / 60; // Convert minutes to hours
            workerChargeAmounts[workerId] += chargeAmountPerWorker;
          });
        }
      });

    const updatedWorkers = workers.map((worker) => {
      const workerId = worker.WorkerID.toString();
      return {
        ...worker,
        totalShiftHours: workerHours[workerId] || 0,
        totalChargeAmount: workerChargeAmounts[workerId] || 0,
      };
    });

    return updatedWorkers;
  };

  const getDaysInView = () => {
    switch (view) {
      case 'Month':
        return 30;
      case 'Fortnight':
        return 14;
      case 'Week':
        return 7;
      case 'Day':
        return 1;
      case 'Compact':
        return 30;
      default:
        return 7;
    }
  };

  // Update schedule based on workersData and openShiftsData
  const updateSchedule = async (workersData, openShiftsData) => {
    const daysInView = getDaysInView();
    const today = startOfToday();

    const initialSchedule = await Promise.all(
      workersData.map(async (worker) => {
        const availabilityMap = await fetchWorkersAvailabilitySchedule(
          worker.WorkerID
        );

        const workerSchedule = Array.from(
          { length: daysInView },
          (_, index) => {
            const date = addDays(today, index);
            const dateStr = format(date, 'yyyy-MM-dd');

            if (availabilityMap[dateStr]) {
              return availabilityMap[dateStr];
            } else {
              return [
                {
                  status: 'Unavailable',
                  color: '#ffccd5',
                  availability: 'Unavailable',
                },
              ];
            }
          }
        );

        return {
          id: worker.WorkerID.toString(),
          name: worker.FirstName,
          schedule: workerSchedule,
          totalAvailabilityHours: worker.totalAvailabilityHours,
          totalShiftHours: worker.totalShiftHours ?? 0,
          remainingHours: worker.remainingHours,
          totalChargeRate: worker.totalChargeRate
            ? worker.totalChargeRate.toFixed(2)
            : '0.00',
          totalChargeAmount: worker.totalChargeAmount ?? 0,
          UserProfile: worker.UserProfile,
        };
      })
    );

    const openShiftSchedule = Array.from({ length: daysInView }, () => []);

    openShiftsData.forEach((shift) => {
      const shiftDate = new Date(shift.ShiftStart).setHours(0, 0, 0, 0);
      const today = startOfToday();

      const dayIndex = Math.round((shiftDate - today) / (1000 * 60 * 60 * 24));

      if (dayIndex >= 0 && dayIndex < daysInView) {
        if (!openShiftSchedule[dayIndex]) {
          openShiftSchedule[dayIndex] = [];
        }
        openShiftSchedule[dayIndex].push({
          id: shift.ShiftID,
          status: 'Unallocated Shift',
          color: '#ebebeb',
          availability: `${new Date(shift.ShiftStart).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} - ${new Date(shift.ShiftEnd).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          client: `${shift.ClientFirstName} ${shift.ClientLastName}`,
          ...shift,
        });
      }
    });

    const newSchedule = [
      { id: 'openShifts', name: 'Unallocated Shifts', schedule: openShiftSchedule },
      ...initialSchedule,
    ];

    setSchedule((prevSchedule) => {
      if (JSON.stringify(prevSchedule) !== JSON.stringify(newSchedule)) {
        return newSchedule;
      } else {
        return prevSchedule;
      }
    });
  };


  const handleCopyToNextWeek = async () => {
    try {
      // Get the current date
      const currentDate = new Date();

      // Calculate the date 7 days from now
      const nextWeekDate = new Date();
      nextWeekDate.setDate(currentDate.getDate() + 7);

      // Filter shifts based on status and date range
      const approvedShifts = Object.values(shiftData)
        .flat()
        .filter(
          (shift) =>
            shift.Status === "A" &&
            new Date(shift.ShiftStart) >= currentDate &&
            new Date(shift.ShiftStart) <= nextWeekDate
        );
      console.log("approved shifts", approvedShifts)

      if (approvedShifts.length === 0) {
        addValidationMessage(`No approved shifts found within the next 7 days.`, "warning");
        return;
      }

      console.log("Filtered approved shifts for the next 7 days:", approvedShifts);

      // Send filtered shifts to the backend
      const response = await postData("api/copyToNextWeek", {
        shifts: approvedShifts,
      });
      console.log("Backend response:", response);

      if (response.success) {
        addValidationMessage("Approved shifts copied successfully!", "success");
      } else {
        addValidationMessage("Failed to copy approved shifts.", "error");
      }
    } catch (error) {
      console.error("Error copying approved shifts to next week:", error);
      addValidationMessage(`Failed to copy approved shifts: ${error}`, "error");
    }
  };


  const handleShiftClick = (event, shiftInfo) => {
    setSelectedShift(shiftInfo); // Set the selected shift
    setClientId(shiftInfo.ClientID); // Set clientId based on the shift
    setRosterId(shiftInfo.RosterID); // Set rosterId based on the shift
    console.log("Setting selectedShift:", shiftInfo);

    // Use a callback to ensure the state is updated before opening the modal
    setModalShow(true);
  };

  const handleWorkerClick = (WorkerID) => {
    router.push(`/RosterManagement/${WorkerID}`);
  };

  const handleShiftsChanged = () => {
    const updatedWorkers = recalculateTotalShiftHoursAndChargeAmount();
    setWorkers(updatedWorkers);
  };

  const renderRows = (tab) => {
    const daysInView = getDaysInView();
    const today = startOfToday();

    // Helper function to filter shifts by date
    // Helper function to filter shifts by date
    const filterShiftsByDate = (shifts = [], date) => {
      if (!Array.isArray(shifts)) {
        console.warn('Expected shifts to be an array, but received:', shifts);
        return [];
      }
      return shifts.filter(
        (shift) =>
          shift.ShiftStart &&
          isSameDay(parseISO(shift.ShiftStart), date)
      );
    };


    return schedule.map((worker) => {
      const workerTotalShiftHours = parseFloat(worker.totalShiftHours) || 0;
      const workerTotalChargeAmount = parseFloat(worker.totalChargeAmount) || 0;

      return (
        <div
          key={worker.id}
          className={
            tab === 'availability'
              ? styles.schedulerRowAvailability
              : styles.schedulerRowShifts
          }
        >
          {/* Worker Profile and Information */}
          <div className={`${styles.workerItem} ${styles.stickyColumn}`}>
            <div className={styles.workerTopRow}>
              <Avatar
                src={worker.UserProfile || ''}
                alt={worker.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
                >
                {!worker.UserProfile && (
                  <PersonIcon
                    style={{ fontSize: '16px', width: '16px', height: '16px' }}
                  />
                )}
              </Avatar>
              <div className={styles.workerNameContainer}>
                <span className={styles.workerName} title={worker.name}>
                  {worker.name}
                </span>
              </div>
            </div>

            {/* Total Hours and Charge Amount */}
            {/* only display worker bottom row if the tab is worker shifts */}
            {tab === 'shifts' && (
              <div className={styles.workerBottomRow} style={{ border: '1px solid', borderColor: '#ebebeb' }}>
                <span className={styles.shiftHours} title={`${workerTotalShiftHours.toFixed(2)} Hrs`}>
                  {workerTotalShiftHours.toFixed(2)} Hrs
                </span>
                <span className={styles.payRate} title={`$${workerTotalChargeAmount.toFixed(2)}`}>
                  ${workerTotalChargeAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {worker.schedule.slice(0, daysInView).map((day, dayIndex) => {
            const date = addDays(today, dayIndex);

            if (tab === 'availability') {
              // Availability rendering remains unchanged
              return (
                <div
                  key={dayIndex}
                  className={styles.schedulerCellAvailability}
                  style={{ backgroundColor: day[0]?.color }}
                >
                  {day.map((availability, index) => (
                    <div key={index} className={styles.availabilityText}>
                      {availability.availability}
                    </div>
                  ))}
                </div>
              );
            } else if (tab === 'shifts') {
              // Filter shifts for workers and openShifts
              const shiftInfos =
                worker.id !== 'openShifts'
                  ? filterShiftsByDate(shiftData[worker.id] || [], date)
                  : [];

              const shiftMap = {};

              shiftInfos.forEach((shift) => {
                if (
                  !shiftMap[shift.ShiftID] ||
                  shiftMap[shift.ShiftID].Version < shift.Version ||
                  (shiftMap[shift.ShiftID].Version === shift.Version &&
                    shift.ShiftStatus !== 'D')
                ) {
                  shiftMap[shift.ShiftID] = shift;
                }
              });

              const unallocatedShiftInfos =
                worker.id === 'openShifts'
                  ? filterShiftsByDate(openShifts, date)
                  : [];

              const allShiftInfos = [...shiftInfos, ...unallocatedShiftInfos];

              return (
                <DroppableCell
                  key={dayIndex}
                  dayIndex={dayIndex}
                  date={date}
                  disable={disableSection}
                  workerId={worker.id === 'openShifts' ? 'openShifts' : worker.id}
                  setShiftData={setShiftData}
                  workerAvailability={worker.schedule}
                  openShifts={openShifts}
                  setOpenShifts={setOpenShifts}
                  setWorkers={setWorkers}
                  setIsDraftEnabled={setIsDraftEnabled}
                  setDraftShifts={setDraftShifts}
                  shiftData={shiftData}
                  view={view}
                  handleShiftsChanged={handleShiftsChanged}
                  workers={workers}
                >
                  {allShiftInfos.map((shiftInfo, index) => (
                    <DraggableShift
                      key={shiftInfo.ShiftID} // Use ShiftID as key
                      shift={shiftInfo}
                      draftShifts={draftShifts}
                      disable={disableSection}
                      source={
                        worker.id === 'openShifts' ? 'openShifts' : 'worker'
                      }
                      onShiftClick={handleShiftClick}
                      isCompactView={view === 'Compact'}
                    />
                  ))}
                </DroppableCell>
              );
            }
            return null;
          })}
        </div>
      )
    });
  }
  const renderHeader = () => {
    const daysInView = getDaysInView();
    const today = startOfToday();

    return (
      <div className={`${styles.schedulerHeader} ${view === 'Compact' ? styles.compactView : ''}`}>
        <div className={`${styles.schedulerHeaderCell} ${styles.stickyColumn}`}>
          All Workers
        </div>
        {Array.from({ length: daysInView }, (_, i) => i).map((index) => {
          const date = addDays(today, index);
          const formattedDate = format(date, 'dd/MM');
          const dayName = format(date, 'EEE');

          return (
            <div key={index} className={styles.schedulerHeaderCell}>
              <span className="date">{formattedDate}</span>
              <span className="day">{dayName}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLegend = () => {
    if (activeTab === 'availability') {
      return (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: '#cce7ff' }}
            ></span>
            Available
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: '#fff3cd' }}
            ></span>
            Partially Available
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: '#ffccd5' }}
            ></span>
            Unavailable
          </div>
        </div>
      );
    } else if (activeTab === 'shifts') {
      return (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: color.pastColor || '#cdcdcd' }}
            ></span>
            Past
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: color.ongoingColor || '#d0e2fe' }}
            ></span>
            Ongoing
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: color.futureColor || '#caf0d9' }}
            ></span>
            Future
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: color.unallocatedColor || '#fdddc6' }}
            ></span>
            Unallocated
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: color.draftColor || '#eae674aa' }}
            ></span>
            Draft
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: color.notStartedColor || '#D3BDF0' }}
            ></span>
            Not Started
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{
                backgroundColor: color.pendingForApprovalColor || '#b35f8b',
              }}
            ></span>
            Pending For Approval
          </div>
        </div>
      );
    }
  };

  const renderPopoverContent = () => {
    if (!Array.isArray(popoverContent) || popoverContent.length === 0) {
      return null;
    }
    const shift = popoverContent[0];
    return (
      <div className={styles.popoverContent}>
        <div>
          <strong>Client:</strong> {shift.ClientFirstName} {shift.ClientLastName}
        </div>
        <div>
          <strong>Service:</strong> {shift.ServiceDescription}
        </div>
        <div>
          <strong>Time:</strong>{' '}
          {new Date(shift.ShiftStart).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          -{' '}
          {new Date(shift.ShiftEnd).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        <div>
          <strong>Roster ID:</strong> {shift.RosterID}
        </div>
      </div>
    );
  };


  const handleViewChange = (event, newView) => {
    setView(newView);
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverContent([]);
  };

  const handleSaveAsDraft = async () => {
    try {
      const formatDateToLocalDateTime = (date) => {
        if (!date) return null;
        const localDate = new Date(date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        const seconds = String(localDate.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const payload = {
        shifts: draftShifts.map((shift) => ({
          ShiftID: shift.ShiftID,
          ClientID: shift.ClientID,
          RosterID: shift.RosterID,
          IsLocationRoster: shift.IsLocationRoster,
          ServiceCode: shift.ServiceCode,
          PayRate: shift.PayRate,
          ChargeRate: shift.ChargeRate,
          FixedFeeService: shift.FixedFeeService,
          CenterCapitalCosts: shift.CenterCapitalCosts,
          ShiftStart: formatDateToLocalDateTime(shift.ShiftStart),
          ShiftEnd: formatDateToLocalDateTime(shift.ShiftEnd),
          ShiftOccurOverTwo: shift.ShiftOccurOverTwo,
          ShiftSplit1: shift.ShiftSplit1,
          ShiftSplit2: shift.ShiftSplit2,
          ShiftSplit3: shift.ShiftSplit3,
          ShiftSplit4: shift.ShiftSplit4,
          SupportWorker1: shift.SupportWorker1,
          SupportWorker2: shift.SupportWorker2,
          SupportWorker3: shift.SupportWorker3,
          SupportWorker4: shift.SupportWorker4,
          LocationRoster: shift.LocationRoster,
          SplitHour1: shift.SplitHour1,
          SplitHour2: shift.SplitHour2,
          SplitHour3: shift.SplitHour3,
          SplitHour4: shift.SplitHour4,
          BreakStart: shift.BreakStart,
          BreakDuration: shift.BreakDuration,
          AppNote: shift.AppNote,
          PrivateNote: shift.PrivateNote,
          RosterCategory: shift.RosterCategory,
          CheckList: shift.CheckList,
          OrderNumber: shift.OrderNumber,
          MakerUser: shift.MakerUser,
          MakerDate: shift.MakerDate,
          UpdateUser: shift.UpdateUser,
          UpdateDate: shift.UpdateDate,
          ShiftStatus: shift.ShiftStatus,
          ShiftStatusReason: shift.ShiftStatusReason,
          ShiftDate: shift.ShiftDate,
        })),
      };

      const isValid = payload.shifts.every(
        (shift) =>
          shift.ClientID && shift.RosterID && shift.ShiftStart && shift.ShiftEnd
      );

      // if (!isValid) {
      //   throw new Error('One or more shifts are missing required data.');
      // }

      const response = await postData(
        '/api/saveShiftAsDraft',
        payload,
        '/RosterManagement'
      );

      //   if (response && response.success) {
      //     addValidationMessage("Shift saved as draft successfully!", "success");

      //     if (socketRef.current) {
      //       socketRef.current.emit('shiftDraftSaved', payload);
      //     }
      //   }
      // } catch (error) {
      //   console.error('Error saving shifts as draft:', error);
      //   addValidationMessage(`Failed to save shift as draft: ${error}`, "error");
      // }
      if (response && response.success) {
        addValidationMessage("Shift saved as draft successfully!", "success");
        setDraftShifts([]);
        setIsDraftEnabled(false);
        await fetchDataAsync();
      } else {
        throw new Error('Failed to save shifts as draft');
      }
    } catch (error) {
      console.error('Error saving shifts as draft:', error);
      addValidationMessage(`Failed to save shift as draft: ${error}`, "error");
    }
  };

  useEffect(() => {
    const allDraftShifts = [];

    schedule.forEach((worker) => {
      if (worker.id !== 'openShifts') {
        const workerShifts = shiftData[worker.id] || [];
        workerShifts.forEach((shift) => {
          if (shift.Status === 'D') {
            allDraftShifts.push(shift);
          }
        });
      }
    });

    openShifts.forEach((shift) => {
      if (shift.Status === 'D') {
        allDraftShifts.push(shift);
      }
    });

    setDraftShifts(allDraftShifts);
    setIsDraftEnabled(allDraftShifts.length > 0);
  }, [shiftData, openShifts, schedule]);
  // Inside Scheduler Component

  const handlePublish = async () => {
    try {
      const formatDateToLocalDateTime = (date) => {

        if (!date) {
          console.error("Invalid date:", date);
          return null;
        }
        const localDate = new Date(date);  // Interprets the string as UTC if it has "Z"
        if (isNaN(localDate.getTime())) {
          console.error("Invalid date format:", date);
          return null;
        }
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        const seconds = String(localDate.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      // Gather all shifts with status 'D' (Draft) from shiftData and openShifts
      const draftShiftsFromWorkers = Object.values(shiftData)
        .flat()
        .filter((shift) => shift.Status === 'D');

      const draftShiftsFromOpenShifts = openShifts.filter(
        (shift) => shift.Status === 'D'
      );

      const allDraftShifts = [...draftShiftsFromWorkers, ...draftShiftsFromOpenShifts];

      if (allDraftShifts.length === 0) {
        addValidationMessage("No draft shifts available to publish.", "warning");
        return;
      }

      const payload = {
        shifts: allDraftShifts.map((shift) => {
          console.log("Raw ShiftStart:", shift.ShiftStart);
          console.log("Raw ShiftEnd:", shift.ShiftEnd);

          const formattedShiftStart = formatDateToLocalDateTime(shift.ShiftStart);
          const formattedShiftEnd = formatDateToLocalDateTime(shift.ShiftEnd);

          if (!formattedShiftStart || !formattedShiftEnd) {
            console.error("Invalid ShiftStart or ShiftEnd for ShiftID:", shift.ShiftID);
            return null; // Skip this shift
          }

          return {
            ShiftID: shift.ShiftID,
            ClientID: shift.ClientID,
            RosterID: shift.RosterID,
            IsLocationRoster: shift.IsLocationRoster,
            ServiceCode: shift.ServiceCode,
            PayRate: shift.PayRate,
            ChargeRate: shift.ChargeRate,
            FixedFeeService: shift.FixedFeeService,
            CenterCapitalCosts: shift.CenterCapitalCosts,
            ShiftStart: formattedShiftStart,
            ShiftEnd: formattedShiftEnd,
            ShiftOccurOverTwo: shift.ShiftOccurOverTwo,
            ShiftSplit1: shift.ShiftSplit1,
            ShiftSplit2: shift.ShiftSplit2,
            ShiftSplit3: shift.ShiftSplit3,
            ShiftSplit4: shift.ShiftSplit4,
            SupportWorker1: shift.SupportWorker1,
            SupportWorker2: shift.SupportWorker2,
            SupportWorker3: shift.SupportWorker3,
            SupportWorker4: shift.SupportWorker4,
            LocationRoster: shift.LocationRoster,
            SplitHour1: shift.SplitHour1,
            SplitHour2: shift.SplitHour2,
            SplitHour3: shift.SplitHour3,
            SplitHour4: shift.SplitHour4,
            BreakStart: shift.BreakStart,
            BreakDuration: shift.BreakDuration,
            AppNote: shift.AppNote,
            PrivateNote: shift.PrivateNote,
            RosterCategory: shift.RosterCategory,
            CheckList: shift.CheckList,
            OrderNumber: shift.OrderNumber,
            MakerUser: shift.MakerUser,
            MakerDate: shift.MakerDate,
            UpdateUser: shift.UpdateUser,
            UpdateDate: shift.UpdateDate,
            ShiftStatus: shift.ShiftStatus,
            ShiftStatusReason: shift.ShiftStatusReason,
            ShiftDate: shift.ShiftDate,
          };
        }).filter(shift => shift !== null), // Remove skipped shifts
      };

      console.log("Payload to submit:", payload);

      const response = await postData(
        '/api/submitForApproval',
        payload,
        window.location.href
      );

      if (response && response.success) {
        addValidationMessage("All draft shifts published successfully!", "success");

        // Clear all draft shifts since they have been published
        setDraftShifts([]);
        setIsDraftEnabled(false);

        // Optionally, you can refetch the shifts to get updated data from the backend
        await fetchDataAsync();
      } else {
        throw new Error('Failed to publish shifts');
      }
    } catch (error) {
      console.error('Error during the publish process:', error);
      addValidationMessage(`Failed to publish shifts: ${error.message}`, "error");
    }
  };


  const handleShiftSubmitForApproval = async (shift) => {
    try {
      const payload = {
        shifts: [
          {
            ShiftID: shift.ShiftID,
            ClientID: shift.ClientID,
            RosterID: shift.RosterID,
            IsLocationRoster: shift.IsLocationRoster,
            ServiceCode: shift.ServiceCode,
            PayRate: shift.PayRate,
            ChargeRate: shift.ChargeRate,
            FixedFeeService: shift.FixedFeeService,
            CenterCapitalCosts: shift.CenterCapitalCosts,
            ShiftStart: shift.ShiftStart,
            ShiftEnd: shift.ShiftEnd,
            ShiftOccurOverTwo: shift.ShiftOccurOverTwo,
            ShiftSplit1: shift.ShiftSplit1,
            ShiftSplit2: shift.ShiftSplit2,
            ShiftSplit3: shift.ShiftSplit3,
            ShiftSplit4: shift.ShiftSplit4,
            SupportWorker1: shift.SupportWorker1,
            SupportWorker2: shift.SupportWorker2,
            SupportWorker3: shift.SupportWorker3,
            SupportWorker4: shift.SupportWorker4,
            LocationRoster: shift.LocationRoster,
            SplitHour1: shift.SplitHour1,
            SplitHour2: shift.SplitHour2,
            SplitHour3: shift.SplitHour3,
            SplitHour4: shift.SplitHour4,
            BreakStart: shift.BreakStart,
            BreakDuration: shift.BreakDuration,
            AppNote: shift.AppNote,
            PrivateNote: shift.PrivateNote,
            RosterCategory: shift.RosterCategory,
            CheckList: shift.CheckList,
            OrderNumber: shift.OrderNumber,
            MakerUser: shift.MakerUser,
            MakerDate: shift.MakerDate,
            UpdateUser: shift.UpdateUser,
            UpdateDate: shift.UpdateDate,
            ShiftStatus: shift.ShiftStatus,
            ShiftStatusReason: shift.ShiftStatusReason,
            ShiftDate: shift.ShiftDate,
          },
        ],
      };

      const response = await postData(
        '/api/submitForApproval',
        payload,
        window.location.href
      );

      if (response && response.success) {
        setDraftShifts((prevDraftShifts) =>
          prevDraftShifts.filter((draft) => draft.ShiftID !== shift.ShiftID)
        );
      } else {
        console.error('Failed to submit shift for approval:', response.error);
        alert('There was an error submitting the shift for approval.');
      }
    } catch (error) {
      console.error('Error during the publish process:', error);
      alert('An unexpected error occurred.');
    }
  };

  const handleShiftSaveAsDraft = (shift) => {
    setDraftShifts((prevDraftShifts) => {
      if (!prevDraftShifts.some((draft) => draft.ShiftID === shift.ShiftID)) {
        return [...prevDraftShifts, shift];
      }
      return prevDraftShifts;
    });
  };

  const handleAddShift = () => {
    console.log("weewf")
    setShowClientModal(true);
    // socketRef.current.emit('shiftCreated', { message: 'A new shift is being created.' });
  }

  const [modalShow, setModalShow] = useState(false);
  const handleOpenModal = () => setModalShow(true);
  const handleCloseModal = () => setModalShow(false);

  return (
    <>
      <ValidationBar
        messages={validationMessages}
        onClose={handleCloseMessage}
      />
      <DndProvider backend={HTML5Backend}>
        <div
          className={`${styles.schedulerContainer} ${view === 'Compact' ? styles.compactView : ''
            }`}
        >

          {/* Client Selection Modal */}
          <Modal
            show={showClientModal}
            onHide={() => setShowClientModal(false)}
            centered
            size="lg"
            className={styles.customModal}
          >
            <Modal.Header closeButton className={styles.modalHeader}
                          style={{backgroundColor: "blue", color: "white"}}>
              <Modal.Title>Select a Client</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                <div style={{
                  height: '400px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  padding: '10px',
                }} className={styles.scrollableList}>
                  <ListGroup>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <ListGroup.Item key={client.ClientID} className={styles.listGroupItem}>
                          <div className={styles.clientInfo}>
                            <div>
                              <strong>Client ID:</strong> {client.ClientID}
                            </div>
                            <div>
                              <strong>Name:</strong> {client.FirstName} {client.LastName}
                            </div>
                            <div>
                              <strong>Shifts:</strong> {client.shiftCount}
                            </div>
                            <div>
                              <div>
                                <strong>Rosters:</strong>
                                {client.RosterIDs.length > 0 ? (
                                  client.RosterIDs.map((roster) => (
                                    <Button
                                      key={roster.RosterID}
                                      variant="link"
                                      onClick={() => {
                                        setShowClientModal(false)
                                        setClientId(client.ClientID)
                                        setRosterId(roster.RosterID)
                                        setModalShow(true)
                                      }}
                                      className={styles.rosterButton}
                                    >
                                      {roster.RosterID}
                                    </Button>
                                  ))
                                ) : (
                                  <span>No Rosters Available</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>No clients found.</ListGroup.Item>
                    )}
                  </ListGroup>
                </div>
              </Container>
            </Modal.Body>
          </Modal>

          <AssignShiftModal
            showModal={modalShow}
            setShowModal={handleCloseModal}
            clientId={clientId} // Pass the clientId
            rosterId={rosterId} // Pass the rosterId
            onAddValidationMessage={addValidationMessage}
            data={selectedShift} // Pass the selected shift data for editing
            onUpdate={handleShiftUpdate} // Pass the callback here
          />

          {/* Confirmation Dialog */}
          <Dialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
            className={styles.customConfirmDialog}
          >
            <DialogTitle className={styles.customConfirmDialogTitle}>
              {confirmDialogAction === 'saveDraft' && 'Confirm Save as Draft'}
              {confirmDialogAction === 'publish' && 'Confirm Publish'}
              {confirmDialogAction === 'sendForApproval' &&
                'Confirm Send for Approval'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to{' '}
                {confirmDialogAction === 'saveDraft' && 'save this shift as draft?'}
                {confirmDialogAction === 'publish' && 'publish this shift?'}
                {confirmDialogAction === 'sendForApproval' &&
                  'send this shift for approval?'}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setConfirmDialogOpen(false)}
                color="primary"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmAction} color="primary" autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          {/* Main Container */}
          <Container
            style={{
              maxWidth: '100%',
              margin: '0px  0px 40px 0px',
              padding: '0px',
              overflowX: 'hidden',
              border: '1px solid black',
              borderTopRightRadius: '12px',
              borderBottomRightRadius: '12px',
              borderBottomLeftRadius: '12px',
              borderTopLeftRadius: '0px',
            }}
          >
            {/* Tabs for Availability and Shifts */}
            <div className={styles.tabs}>
              <MButton
                style={{
                    backgroundColor: "blue",
                  margin: "0px 10px",
                }}
                label="Add Shift "
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleAddShift()}
                size="small"
              />
              <div className={styles.tabContainer}>
                <button
                  className={`${styles.SchedulerTab_button}`}
                  onClick={() => setActiveTab('availability')}
                  style={{
                      backgroundColor: activeTab === 'availability' ? "blue" : 'white',
                    color: activeTab === 'availability' ? 'white' : 'black',
                    border: activeTab === 'availability' ? 'none' : '1px solid black',
                  }}
                >
                  Worker Availability
                </button>
              </div>
              <div className={styles.tabContainer}>
                <button
                  className={`${styles.WorkerShiftsTab_button}`}
                  onClick={() => setActiveTab('shifts')}
                  style={{
                      backgroundColor: activeTab === 'shifts' ? "blue" : 'white',
                    color: activeTab === 'shifts' ? 'white' : 'black',
                    border: activeTab === 'shifts' ? 'none' : '1px solid black',
                  }}
                >
                  Worker Shifts
                </button>
              </div>
            </div>

            {/* Availability Tab */}
            {activeTab === 'availability' ? (
              <>
                <Row
                  style={{
                    borderTop: 'none',
                    borderBottom: 'none',
                    padding: '0px',
                  }}
                  className={styles.schedulerHeader}
                >
                  <Row
                    className={`${styles.schedulerControls}`}
                    style={{
                        backgroundColor: "blue", // Set the background color dynamically
                      borderRadius: '4px', // Optional for rounded corners
                      padding: '15px',
                    }}
                  >
                    <Col
                      style={{ display: 'flex' }}
                      className={styles.schedulerControlsCol}
                    >
                      {/* View Toggle Buttons */}
                      <div className={styles.controlIcon}>
                        <ToggleButtonGroup
                          value={view}
                          exclusive
                          onChange={handleViewChange}
                          aria-label="View options"
                          className={styles.toggleButtonGroupCustom}
                        >
                          <ToggleButton
                            value="Week"
                            className={styles.toggleButtonCustomWeek}
                            sx={{
                              color: '#fff',
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: '#fff', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarViewWeekIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Week
                          </ToggleButton>

                          <ToggleButton
                            value="Fortnight"
                            className={styles.toggleButtonCustom}
                            sx={{
                              color: '#fff',
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: '#fff', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <DateRangeIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Fortnight
                          </ToggleButton>

                          <ToggleButton
                            value="Month"
                            className={styles.toggleButtonCustom}
                            sx={{
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              color: '#fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: '#fff', // Custom hover background color
                                color: '#8862F1', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarMonthIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Month
                          </ToggleButton>

                          <ToggleButton
                            value="Day"
                            className={styles.toggleButtonCustom}
                            sx={{
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              color: '#fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: 'lightgrey', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarTodayIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Day
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>

                      {/* Scheduler Filters */}
                      {/* <div className={styles.controlButtonIcon}>
                      <SchedulerFilters
                        clients={clients}
                        formState={formState}
                        handleChange={handleChange}
                        handleViewChange={handleViewChange}
                        view={view}
                        initialValues={formState}
                        applyFilters={applyFilters}
                        
                      />
                    </div> */}

                      {/* Refresh Button */}
                      <div className={styles.controlButtonIcon}>
                        <Tooltip title="Refresh Scheduler">
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={fetchDataAsync}
                            size="small"
                            startIcon={
                              <RefreshIcon style={{ marginRight: '6px', marginLeft: '0px', }} className={styles.buttonIconSmall} />
                            }
                            className={styles.refreshButtonCustom}
                          >
                            Refresh
                          </Button>
                        </Tooltip>
                      </div>
                    </Col>
                  </Row>
                </Row>


                {loading ? (
                  <SchedulerSkeleton view={view} />
                ) : (
                  <SchedulerContent
                    renderHeader={renderHeader}
                    renderRows={() =>
                      renderRows(
                        activeTab,
                        handleShiftSaveAsDraft,
                        handleShiftSubmitForApproval
                      )
                    }
                  />
                )}
              </>
            ) : (
              /* Shifts Tab */
              <>
                <Row
                  style={{
                    borderTop: 'none',
                    borderBottom: 'none',
                    backgroundColor: 'white',
                  }}
                  className={styles.schedulerHeader}
                >
                  <Row
                    style={{
                        backgroundColor: "blue", // Set the background color dynamically
                      borderRadius: '4px', // Optional for rounded corners
                      padding: '15px', // Optional for spacing inside the group
                    }}
                    className={`${styles.schedulerControls}`}
                  >
                    <Col
                      style={{ display: 'flex' }}
                      className={styles.schedulerControlsCol}
                    >
                      <div className={styles.controlContainer}>
                        {/* View Toggle Buttons */}
                        <ToggleButtonGroup
                          value={view}
                          exclusive
                          onChange={handleViewChange}
                          aria-label="View options"
                          className={styles.toggleButtonGroupCustom}
                        >
                          <ToggleButton
                            value="Week"
                            className={styles.toggleButtonCustomWeek}
                            sx={{
                              color: '#fff',
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: '#8862F1', // Custom hover background color
                                color: '#fff', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarViewWeekIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Week
                          </ToggleButton>

                          <ToggleButton
                            value="Fortnight"
                            className={styles.toggleButtonCustom}
                            sx={{
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              color: '#fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: 'lightgrey', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <DateRangeIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Fortnight
                          </ToggleButton>

                          <ToggleButton
                            value="Month"
                            className={styles.toggleButtonCustom}
                            sx={{
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              color: '#fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: 'lightgrey', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarMonthIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Month
                          </ToggleButton>

                          <ToggleButton
                            value="Compact"
                            className={styles.toggleButtonCustom}
                            sx={{
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              color: '#fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: 'lightgrey', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarViewWeekIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Compact
                          </ToggleButton>

                          <ToggleButton
                            value="Day"
                            className={styles.toggleButtonCustomDay}
                            sx={{
                              borderColor: '#fff', // Custom selected border color
                              borderLeft: '1px solid #fff',
                              color: '#fff',
                              '&.Mui-selected': {
                                borderColor: 'white', // Custom selected border color
                                backgroundColor: 'white', // Custom selected background color
                                color: 'black', // Custom selected text/icon color
                              },
                              '&:hover': {
                                backgroundColor: 'white', // Custom hover background color
                                color: 'black', // Custom hover text/icon color
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#8862F1', // Custom selected hover background color
                                color: '#fff', // Custom selected hover text/icon color
                              },
                              // Optional: Add transition for smooth color changes
                              transition: 'background-color 0.3s, color 0.3s',
                            }}
                          >
                            <CalendarTodayIcon sx={{ fontSize: '16px', marginRight: '6px' }} />
                            Day
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignSelf: 'center' }}>
                        {/* Refresh Button */}
                        <div className={styles.controlButtonIcon}>
                          <Tooltip title="Refresh Scheduler">
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={fetchDataAsync}
                              size="small"
                              startIcon={
                                <RefreshIcon style={{ marginRight: '6px', marginLeft: '0px', }} className={styles.buttonIconSmall} />
                              }
                              className={styles.refreshButtonCustom}
                            >
                              Refresh
                            </Button>
                          </Tooltip>
                        </div>

                        {/* Copy to Next Week Button */}
                        <div className={styles.controlButtonIcon}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<CopyIcon style={{ marginRight: '6px', marginLeft: '0px', }} className={styles.buttonIconSmall} />}
                            disabled={disableSection}
                            className={styles.copyButtonCustom}
                            onClick={handleCopyToNextWeek}
                          >
                            Copy to Next Week
                          </Button>
                        </div>

                        {/* Save as Draft Button */}
                        <div className={styles.controlButtonIcon}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<SaveIcon style={{ marginRight: '6px', marginLeft: '0px', }} className={styles.buttonIconSmall} />}
                            onClick={() => openConfirmDialog('saveDraft')}
                            disabled={!isDraftEnabled || disableSection}
                            className={styles.saveButtonCustom}
                          >
                            Save as Draft
                          </Button>
                        </div>

                        {/* Publish Button */}
                        <div className={styles.controlButtonIcon}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={
                              <PublishIcon style={{ marginRight: '6px', marginLeft: '0px', }} className={styles.buttonIconSmall} />
                            }
                            onClick={() => openConfirmDialog('publish')}
                            disabled={disableSection}
                            className={styles.publishButtonCustom}
                          >
                            Publish
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Row>
                {loading ? (
                  <SchedulerSkeleton view={view} />
                ) : (
                  <SchedulerContent
                    renderHeader={renderHeader}
                    renderRows={() =>
                      renderRows(
                        activeTab,
                        handleShiftSaveAsDraft,
                        handleShiftSubmitForApproval
                      )
                    }
                  />
                )}
              </>
            )}

            {/* Legend */}
            {renderLegend()}
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
        </div>
      </DndProvider>
    </>

  );
};

export default Scheduler;
