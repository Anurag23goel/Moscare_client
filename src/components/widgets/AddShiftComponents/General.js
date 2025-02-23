"use client";

import { useState, useEffect, useCallback } from 'react';
import { format, addDays, isToday, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Tooltip } from 'react-tooltip';
import "react-datepicker/dist/react-datepicker.css";
import {
    Calendar,
    Clock,
    Users,
    AlertCircle,
    FileText,
    Building2,
    DollarSign,
    Loader2,
    Info,
    Plus,
    Minus,
    CheckCircle2,
    XCircle,
    Settings,
    MessageSquare,
    HelpCircle
  } from 'lucide-react';
import { fetchData, postData } from '@/utility/api_utility';
import { Alert, Snackbar } from '@mui/material';

const TimePicker = ({ value, onChange, disabled, minTime, maxTime }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    
    const currentValue = value ? new Date(value) : null;
    const currentHour = currentValue?.getHours() || 0;
    const currentMinute = currentValue?.getMinutes() || 0;
  
    const handleHourChange = (hour) => {
      const newDate = new Date();
      newDate.setHours(hour, currentMinute);
      onChange(newDate);
    };
  
    const handleMinuteChange = (minute) => {
      const newDate = new Date();
      newDate.setHours(currentHour, minute);
      onChange(newDate);
    };
  
    return (
      <div className="relative flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <select
            value={currentHour}
            onChange={(e) => handleHourChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
          >
            {hours.map(hour => (
              <option key={hour} value={hour}>
                {hour.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <span className="text-gray-500">:</span>
        <div className="relative flex-1">
          <select
            value={currentMinute}
            onChange={(e) => handleMinuteChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full pl-4 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
          >
            {minutes.map(minute => (
              <option key={minute} value={minute}>
                {minute.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  
  // Custom select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? 'rgb(139, 92, 246, 0.5)' : 'rgba(229, 231, 235, 0.5)',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(139, 92, 246, 0.3)' : 'none',
      '&:hover': {
        borderColor: 'rgb(139, 92, 246, 0.5)'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'rgb(139, 92, 246)' 
        : state.isFocused 
          ? 'rgba(139, 92, 246, 0.1)'
          : 'transparent',
      color: state.isSelected ? 'white' : 'inherit',
      '&:hover': {
        backgroundColor: state.isSelected 
          ? 'rgb(139, 92, 246)' 
          : 'rgba(139, 92, 246, 0.1)'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(229, 231, 235, 0.5)'
    })
  };

  
const General = ({
  formState,
  setFormState,
  clientId,
  rosterId,
  onAddValidationMessage,
  data,
  onUpdate
}) => {
  // State
  const [shiftStartDate, setShiftStartDate] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftEndDate, setShiftEndDate] = useState(null);
  const [shiftEndTime, setShiftEndTime] = useState(null);
  const [service, setService] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdditionalWorkers, setShowAdditionalWorkers] = useState(false);
  const [workerCount, setWorkerCount] = useState(1);
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [chkExcldHoliday, setChkExcldHoliday] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [cccOutput, setCccOutput] = useState('');
  const [ccc, setCcc] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [rosterCategory, setRosterCategory] = useState([]);

  // Handlers
  const handleStartDateChange = (date) => {
    if (!date) return;

    const isHoliday = publicHolidays.includes(format(date, 'yyyy-MM-dd'));
    if (isHoliday && chkExcldHoliday === 1) {
      setSnackbar({
        open: true,
        message: 'Cannot create shifts on public holidays per client settings',
        severity: 'error'
      });
      return;
    }

    setShiftStartDate(date);
    if (!formState.ShiftOccurOverTwo) {
      setShiftEndDate(date);
    }
  };

  const handleStartTimeChange = (time) => {
    if (!time) return;
    setShiftStartTime(time);
    
    if (!formState.ShiftOccurOverTwo) {
      const endTime = new Date(time);
      endTime.setHours(endTime.getHours() + 1);
      setShiftEndTime(endTime);
    }
  };

  const handleEndDateChange = (date) => {
    if (!date || !formState.ShiftOccurOverTwo) return;

    const isHoliday = publicHolidays.includes(format(date, 'yyyy-MM-dd'));
    if (isHoliday && chkExcldHoliday === 1) {
      setSnackbar({
        open: true,
        message: 'Cannot create shifts on public holidays per client settings',
        severity: 'error'
      });
      return;
    }

    if (date < shiftStartDate) {
      setSnackbar({
        open: true,
        message: 'End date must be after start date',
        severity: 'error'
      });
      return;
    }

    const maxEndDate = addDays(shiftStartDate, 1);
    if (date > maxEndDate) {
      setSnackbar({
        open: true,
        message: 'Shift cannot span more than two days',
        severity: 'error'
      });
      return;
    }

    setShiftEndDate(date);
  };

  const handleEndTimeChange = (time) => {
    if (!time) return;

    if (!formState.ShiftOccurOverTwo && time <= shiftStartTime) {
      setSnackbar({
        open: true,
        message: 'End time must be after start time',
        severity: 'error'
      });
      return;
    }

    setShiftEndTime(time);
  };

  const handleServiceChange = async (serviceCode) => {
    setFormState(prev => ({ ...prev, ServiceCode: serviceCode }));
    
    if (!shiftStartDate || !shiftStartTime || !formState.SupportWorker1 || formState.SupportWorker1 === 'UNALLOCATED') {
      setSnackbar({
        open: true,
        message: 'Please select shift timing and worker before choosing a service',
        severity: 'warning'
      });
      return;
    }

    setIsCalculating(true);
    try {
      const response = await postData('/api/getServiceRates', {
        serviceCode,
        workerId: formState.SupportWorker1,
        clientId,
        shiftStart: format(shiftStartDate, 'yyyy-MM-dd HH:mm:ss')
      });

      if (response.success) {
        setFormState(prev => ({
          ...prev,
          PayRate: response.payRate,
          ChargeRate: response.chargeRate,
          FixedFeeService: response.isFixedFee || false
        }));

        // Check for CCC if enabled
        if (formState.CenterCapitalCosts) {
          const cccResponse = await fetchData(`/api/getCCCOfServiceSelected/${serviceCode}`);
          if (cccResponse.success) {
            const cccValue = parseFloat(cccResponse.data.Charge_Rate_1);
            setCcc(cccValue);
            setCccOutput(`Centre Capital Costs: $${cccValue} per hour`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching service rates:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch service rates',
        severity: 'error'
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleWorkerChange = async (workerId, index) => {
    if (workerId === formState[`SupportWorker${index}`]) return;

    // Check for duplicate workers
    const currentWorkers = Object.values(formState)
      .filter((value, i) => i.startsWith('SupportWorker') && value && value !== 'UNALLOCATED');
    
    if (currentWorkers.includes(workerId)) {
      setSnackbar({
        open: true,
        message: 'This worker is already assigned to this shift',
        severity: 'error'
      });
      return;
    }

    // Check worker availability
    try {
      const availabilityResponse = await postData('/api/checkWorkerAvailability', {
        workerId,
        shiftStart: format(shiftStartDate, 'yyyy-MM-dd HH:mm:ss'),
        shiftEnd: format(shiftEndDate, 'yyyy-MM-dd HH:mm:ss')
      });

      if (!availabilityResponse.success) {
        setSnackbar({
          open: true,
          message: availabilityResponse.message || 'Worker is not available for this shift',
          severity: 'warning'
        });
        return;
      }

      setFormState(prev => ({
        ...prev,
        [`SupportWorker${index}`]: workerId
      }));

      // Recalculate rates if this is the primary worker
      if (index === 1 && formState.ServiceCode) {
        handleServiceChange(formState.ServiceCode);
      }
    } catch (error) {
      console.error('Error checking worker availability:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check worker availability',
        severity: 'error'
      });
    }
  };

  const addWorker = () => {
    if (workerCount >= 4) return;
    setWorkerCount(prev => prev + 1);
  };

  const removeWorker = (index) => {
    setFormState(prev => {
      const newState = { ...prev };
      // Shift workers up
      for (let i = index; i < 4; i++) {
        newState[`SupportWorker${i}`] = newState[`SupportWorker${i + 1}`] || '';
      }
      newState[`SupportWorker4`] = '';
      return newState;
    });
    setWorkerCount(prev => prev - 1);
  };

  // Effects
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch all data concurrently
        const [workersRes, holidaysRes, rosterCatRes] = await Promise.all([
          fetchData('/api/getWorkerMasterDataAll'),
          fetch(`https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/AU`),
          fetchData('/api/getRosterCategory')
        ]);

        // Process workers
        if (workersRes.success) {
          setWorkers(workersRes.data);
        }

        // Process holidays
        const holidays = await holidaysRes.json();
        setPublicHolidays(holidays.map(h => h.date));

        // Process roster categories
        if (rosterCatRes.success) {
          setRosterCategory(rosterCatRes.data);
        }

        // Fetch client holiday settings if clientId exists
        if (clientId) {
          const holidaySettingsRes = await fetchData(`/api/getChkExcHolidayByClientID/${clientId}`);
          if (holidaySettingsRes.success) {
            setChkExcldHoliday(holidaySettingsRes.CHKExcldHoliday);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        onAddValidationMessage('Failed to load required data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [clientId]);

  // Fetch services when shift start date changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!shiftStartDate || !clientId) return;

      try {
        const servicesRes = await fetchData(`/api/getServiceAsPerAgreement/${clientId}`);
        if (servicesRes.success) {
          setService(servicesRes.data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        onAddValidationMessage('Failed to load services', 'error');
      }
    };

    fetchServices();
  }, [shiftStartDate, clientId]);

  // Calculate duration and check overtime
  useEffect(() => {
    if (!shiftStartTime || !shiftEndTime) return;

    const duration = (shiftEndTime - shiftStartTime) / (1000 * 60 * 60);
    setFormState(prev => ({
      ...prev,
      durationHours: duration
    }));

    if (duration > 8) {
      setSnackbar({
        open: true,
        message: 'This shift includes overtime hours',
        severity: 'warning'
      });
    }
  }, [shiftStartTime, shiftEndTime]);

  // Update form state with dates
  useEffect(() => {
    if (shiftStartDate && shiftStartTime && shiftEndDate && shiftEndTime) {
      const startDateTime = new Date(shiftStartDate);
      startDateTime.setHours(shiftStartTime.getHours(), shiftStartTime.getMinutes());
      
      const endDateTime = new Date(shiftEndDate);
      endDateTime.setHours(shiftEndTime.getHours(), shiftEndTime.getMinutes());

      setFormState(prev => ({
        ...prev,
        ShiftStart: format(startDateTime, 'yyyy-MM-dd HH:mm:ss'),
        ShiftEnd: format(endDateTime, 'yyyy-MM-dd HH:mm:ss')
      }));
    }
  }, [shiftStartDate, shiftStartTime, shiftEndDate, shiftEndTime]);

  // Populate form with existing data when editing
  useEffect(() => {
    if (data) {
      const startDate = parseISO(data.ShiftStart);
      const endDate = parseISO(data.ShiftEnd);

      setShiftStartDate(startDate);
      setShiftStartTime(startDate);
      setShiftEndDate(endDate);
      setShiftEndTime(endDate);
      setShowAdditionalWorkers(!!data.SupportWorker2);
      setWorkerCount(
        [data.SupportWorker1, data.SupportWorker2, data.SupportWorker3, data.SupportWorker4]
          .filter(w => w && w !== 'UNALLOCATED').length
      );

      setFormState(prev => ({
        ...prev,
        ...data,
        checkNotes: !!(data.AppNote || data.PrivateNote)
      }));
    }
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Left Column */}
    <div className="space-y-2">
      {/* Shift Timing Section */}
      <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">Shift Timing</h3>
          </div>
          <Tooltip id="shift-timing-help">
            <div className="p-2">
              <p className="text-sm">Set the start and end times for the shift.</p>
              <p className="text-sm mt-1">For shifts spanning multiple days, enable the "Over Two Days" option.</p>
            </div>
          </Tooltip>
          <HelpCircle 
            className="h-4 w-4 text-gray-400 cursor-help"
            data-tooltip-id="shift-timing-help"
          />
        </div>

        <div className="space-y-4">
          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <DatePicker
                selected={shiftStartDate}
                onChange={handleStartDateChange}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                customInput={
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <TimePicker
                value={shiftStartTime}
                onChange={handleStartTimeChange}
                minTime={isToday(shiftStartDate) ? new Date() : null}
              />
            </div>
          </div>

          {/* Shift Over Two Days Toggle */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
            <input
              type="checkbox"
              id="ShiftOccurOverTwo"
              checked={formState.ShiftOccurOverTwo}
              onChange={e => setFormState(prev => ({ ...prev, ShiftOccurOverTwo: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
            />
            <label htmlFor="ShiftOccurOverTwo" className="text-sm text-gray-700 dark:text-gray-300">
              Shift Occurs Over Two Days
            </label>
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <DatePicker
                selected={shiftEndDate}
                onChange={handleEndDateChange}
                dateFormat="dd/MM/yyyy"
                disabled={!formState.ShiftOccurOverTwo}
                minDate={shiftStartDate}
                maxDate={shiftStartDate ? addDays(shiftStartDate, 1) : null}
                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                customInput={
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <TimePicker
                value={shiftEndTime}
                onChange={handleEndTimeChange}
                minTime={!formState.ShiftOccurOverTwo ? shiftStartTime : null}
              />
            </div>
          </div>

          {/* Duration Display */}
          {formState.durationHours > 0 && (
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  Total Duration: {formState.durationHours.toFixed(2)} hours
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Section */}
      <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">Service Details</h3>
          </div>
          <Tooltip id="service-help">
            <div className="p-2">
              <p className="text-sm">Select the service type for this shift.</p>
              <p className="text-sm mt-1">Pay and charge rates will be calculated automatically.</p>
            </div>
          </Tooltip>
          <HelpCircle 
            className="h-4 w-4 text-gray-400 cursor-help"
            data-tooltip-id="service-help"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service
            </label>
            <Select
              value={service.find(s => s.Service_Code === formState.ServiceCode)}
              onChange={option => handleServiceChange(option.value)}
              options={service.map(s => ({
                value: s.Service_Code,
                label: s.Description
              }))}
              isDisabled={!shiftStartDate || !shiftStartTime}
              styles={selectStyles}
              placeholder="Select Service"
              isLoading={isCalculating}
            />
          </div>

          {/* Rates Display */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pay Rate
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.PayRate?.toFixed(2)}
                  disabled
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50"
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Charge Rate
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.ChargeRate?.toFixed(2)}
                  disabled
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50"
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {cccOutput && (
                <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  {cccOutput}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right Column */}
    <div className="space-y-6">
      {/* Worker Selection Section */}
      <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">Worker Assignment</h3>
          </div>
          <Tooltip id="worker-help">
            <div className="p-2">
              <p className="text-sm">Assign workers to this shift.</p>
              <p className="text-sm mt-1">You can add up to 4 workers per shift.</p>
            </div>
          </Tooltip>
          <HelpCircle 
            className="h-4 w-4 text-gray-400 cursor-help"
            data-tooltip-id="worker-help"
          />
        </div>

        <div className="space-y-4">
          {/* Primary Worker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Worker
            </label>
            <Select
              value={workers.find(w => w.WorkerID === formState.SupportWorker1)}
              onChange={option => handleWorkerChange(option.value, 1)}
              options={[
                { value: 'UNALLOCATED', label: 'Unallocated' },
                ...workers.map(w => ({
                  value: w.WorkerID,
                  label: `${w.FirstName} ${w.LastName}`
                }))
              ]}
              styles={selectStyles}
              placeholder="Select Worker"
            />
          </div>

          {/* Additional Workers Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showAdditionalWorkers"
                checked={showAdditionalWorkers}
                onChange={e => setShowAdditionalWorkers(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
              />
              <label htmlFor="showAdditionalWorkers" className="text-sm text-gray-700 dark:text-gray-300">
                Add Additional Workers
              </label>
            </div>
            
            {showAdditionalWorkers && (
              <button
                onClick={addWorker}
                disabled={workerCount >= 4}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4 text-purple-600" />
              </button>
            )}
          </div>

          {/* Additional Workers */}
          {showAdditionalWorkers && Array.from({ length: workerCount - 1 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Worker {index + 2}
                </label>
                <Select
                  value={workers.find(w => w.WorkerID === formState[`SupportWorker${index + 2}`])}
                  onChange={option => handleWorkerChange(option.value, index + 2)}
                  options={workers.map(w => ({
                    value: w.WorkerID,
                    label: `${w.FirstName} ${w.LastName}`
                  }))}
                  styles={selectStyles}
                  placeholder="Select Worker"
                />
              </div>
              <button
                onClick={() => removeWorker(index + 2)}
                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors mt-6"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Settings Section */}
      <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">Additional Settings</h3>
          </div>
          <Tooltip id="settings-help">
            <div className="p-2">
              <p className="text-sm">Configure additional shift settings.</p>
              <p className="text-sm mt-1">Add notes and special requirements.</p>
            </div>
          </Tooltip>
          <HelpCircle 
            className="h-4 w-4 text-gray-400 cursor-help"
            data-tooltip-id="settings-help"
          />
        </div>

        <div className="space-y-4">
          {/* Roster Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Roster Category
            </label>
            <Select
              value={rosterCategory.find(cat => cat.ID === formState.RosterCategory)}
              onChange={option => setFormState(prev => ({ ...prev, RosterCategory: option.value }))}
              options={rosterCategory.map(cat => ({
                value: cat.ID,
                label: cat.Description
              }))}
              styles={selectStyles}
              placeholder="Select Category"
            />
          </div>

          {/* Settings Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <input
                type="checkbox"
                id="CenterCapitalCosts"
                checked={formState.CenterCapitalCosts}
                onChange={e => setFormState(prev => ({ ...prev, CenterCapitalCosts: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
              />
              <label htmlFor="CenterCapitalCosts" className="text-sm text-gray-700 dark:text-gray-300">
                Centre Capital Costs
              </label>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <input
                type="checkbox"
                id="FixedFeeService"
                checked={formState.FixedFeeService}
                onChange={e => setFormState(prev => ({ ...prev, FixedFeeService: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                disabled
              />
              <label htmlFor="FixedFeeService" className="text-sm text-gray-700 dark:text-gray-300">
                Fixed Fee Service
              </label>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="checkNotes"
                checked={formState.checkNotes}
                onChange={e => setFormState(prev => ({ ...prev, checkNotes: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
              />
              <label htmlFor="checkNotes" className="text-sm text-gray-700 dark:text-gray-300">
                Add Notes
              </label>
            </div>

            {formState.checkNotes && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    App Notes
                  </label>
                  <div className="relative">
                    <textarea
                      value={formState.AppNote}
                      onChange={e => setFormState(prev => ({ ...prev, AppNote: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      rows={3}
                      placeholder="Notes visible in the app"
                    />
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Private Notes
                  </label>
                  <div className="relative">
                    <textarea
                      value={formState.PrivateNote}
                      onChange={e => setFormState(prev => ({ ...prev, PrivateNote: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      rows={3}
                      placeholder="Internal notes"
                    />
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Loading Overlay */}
    {loading && (
      <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )}

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </div>
  );
};

export default General;