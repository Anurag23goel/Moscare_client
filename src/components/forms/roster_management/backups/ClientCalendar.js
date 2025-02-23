// ShiftCalendarComp.jsx
import React, {useCallback, useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {fetchData} from '@/utility/api_utility';
import AssignShiftModal from './AddShiftModal';
import styles from '@/styles/scheduler.module.css'; // Retain if used for other styles
import {useRouter} from 'next/router';
import {Alert, CircularProgress, Snackbar} from '@mui/material';
import ValidationBar from "@/components/widgets/ValidationBar";
import {v4 as uuidv4} from 'uuid';

const ShiftCalendarComp = ({ onDateClick, cId, rId, timezone, clientName }) => {
  const [events, setEvents] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const router = useRouter();
  const [clientId, setClientId] = useState(null);
  const [rosterId, setRosterId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessages, setValidationMessages] = useState([]);

    // const { colors } = useContext(ColorContext); // Access colors from context

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

  const handleOpenModal = () => setModalShow(true);
  const handleCloseModal = () => setModalShow(false);

  // Effect to set clientId and rosterId from props or router query
  useEffect(() => {
    if (
      cId === undefined ||
      rId === undefined ||
      cId === null ||
      rId === null
    ) {
      console.log('Fetching clientId and rosterId from query parameters');
      const { clientId: queryClientId, rosterId: queryRosterId } = router.query;
      setClientId(queryClientId || null);
      setRosterId(queryRosterId || null);
    } else {
      console.log('Fetching clientId and rosterId from passed props');
      setClientId(cId);
      setRosterId(rId);
    }
  }, [router.query, cId, rId]);

  // Effect to log updated clientId and rosterId
  useEffect(() => {
    console.log('Updated clientId:', clientId);
    console.log('Updated rosterId:', rosterId);
  }, [clientId, rosterId]);

  // Fetch shifts whenever clientId or rosterId changes
  useEffect(() => {
    const fetchShifts = async () => {
      // Determine which API endpoint to use
      let url = '';
      let identifier = '';

      if (rosterId) {
        // Fetch by RosterID
        url = `/api/getRosterShiftMainDataByRosterID/${rosterId}`;
        identifier = `RosterID: ${rosterId}`;
      } else if (clientId) {
        // Fetch by ClientID
        url = `/api/getApprovedShiftsByClientID/${clientId}`;
        identifier = `ClientID: ${clientId}`;
      } else {
        console.warn('Neither ClientID nor RosterID is available. Skipping fetch.');
        setEvents([]); // Clear events if no identifiers are available
        return;
      }

      console.log(`Fetching shifts using ${identifier}`);

      try {
        setLoading(true); // Start loading
        const data = await fetchData(url, window.location.href);
        console.log('Fetched shifts:', data);

        if (data && data.data) {
          const formattedEvents = data.data.map((shift) => ({
            title: shift.WorkerFirstName || shift.WorkerLastName || 'Shift',
            start: shift.ShiftStart ? new Date(shift.ShiftStart).toISOString() : null,
            end: shift.ShiftEnd ? new Date(shift.ShiftEnd).toISOString() : null,
            extendedProps: {
              ServiceDescription: shift.ServiceDescription,
            },
            classNames: [getShiftClassName(shift.ShiftStart, shift.ShiftEnd)],
          }));
          console.log('Formatted events:', formattedEvents);
          setEvents(formattedEvents);
        } else {
          console.error('Data format is incorrect:', data);
          setEvents([]); // Clear events if data is incorrect
        }
      } catch (error) {
        console.error('Error fetching shifts:', error);
        setErrorMessage('Failed to load shifts. Please try again later.');
        setEvents([]); // Clear events on error
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchShifts();
  }, [clientId, rosterId]);

  const getShiftClassName = (start, end) => {
    const now = new Date();
    if (new Date(end) < now) {
      return styles.shiftPast; // Use styles from CSS module
    } else if (new Date(start) <= now && new Date(end) >= now) {
      return styles.shiftPresent; // Use styles from CSS module
    } else {
      return styles.shiftFuture; // Use styles from CSS module
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  };

  // useEffect to apply inline styles to FullCalendar buttons
  useEffect(() => {
    // Define selectors for FullCalendar's default buttons
    const buttonSelectors = [
      '.fc-prev-button',
      '.fc-next-button',
      '.fc-today-button',
      '.fc-dayGridMonth-button',
      '.fc-timeGridWeek-button',
      '.fc-timeGridDay-button',
      '.fc-button', // Custom button class
    ];

    buttonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
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
    <>
      <ValidationBar
        messages={validationMessages}
        onClose={handleCloseMessage}
      />
      <div
        className={styles.calendarContainer}
      >
        {/* Loading Indicator */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <CircularProgress />
          </div>
        )}

        {/* Error Snackbar */}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>

        {/* Display ClientID and RosterID */}
        <div className={styles.identifiersContainer}>
          {clientId && (
            <div className={styles.identifier}>
              <strong>Client ID:</strong> {clientId}
            </div>
          )}
          {clientName && (
            <div className={styles.identifier}>
              <strong>Client Name:</strong> {clientName}
            </div>
          )}
          {rosterId && (
            <div className={styles.identifier}>
              <strong>Roster ID:</strong> {rosterId}
            </div>
          )}
          {!clientId && !rosterId && (
            <div className={styles.identifier}>
              <strong>No Client or Roster Selected</strong>
            </div>
          )}
          {timezone && (
            <div className={styles.identifier}>
              <strong>Client Timezone:</strong> {timezone}
            </div>
          )}
        </div>

        <FullCalendar
          className={styles.customCalendar} // Assign a custom class
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            left: 'prev,next today createShiftButton',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          customButtons={{
            createShiftButton: {
              text: 'Create Shift',
              click: handleOpenModal,
              className: 'createShiftButton', // Assign custom class directly
            },
          }}
          editable={false}
          selectable={true}
          selectMirror={true}
          dateClick={onDateClick}
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
              <div className={styles.fcEventTitle}>{arg.event.title}</div>
              <div className={styles.shiftDescription}>{arg.event.extendedProps.ServiceDescription}</div>
              <div className={styles.fcEventTime}>
                {formatTime(arg.event.start)} - {formatTime(arg.event.end)}
              </div>
            </div>
          )}
        />
        <AssignShiftModal
          showModal={modalShow}
          clientId={clientId}
          rosterId={rosterId}
          setShowModal={handleCloseModal}
          onAddValidationMessage={addValidationMessage} // Pass the handler
        />
      </div>
    </>
  );
};

export default ShiftCalendarComp;
