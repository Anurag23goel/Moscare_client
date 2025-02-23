import React, {useEffect, useState} from 'react';
import {Clock} from 'lucide-react';

interface TimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minTime?: Date;
  maxTime?: Date;
  interval?: number;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  minTime,
  maxTime,
  interval = 15
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<number>(value ? value.getHours() : 0);
  const [minutes, setMinutes] = useState<number>(value ? value.getMinutes() : 0);

  useEffect(() => {
    if (value) {
      setHours(value.getHours());
      setMinutes(value.getMinutes());
    }
  }, [value]);

  const handleTimeSelect = (newHours: number, newMinutes: number) => {
    const newDate = new Date();
    newDate.setHours(newHours, newMinutes, 0, 0);
    
    if (minTime && newDate < minTime) return;
    if (maxTime && newDate > maxTime) return;

    onChange(newDate);
    setIsOpen(false);
  };

  const formatTime = (hours: number, minutes: number) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const totalMinutes = 24 * 60;
    
    for (let i = 0; i < totalMinutes; i += interval) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      
      const date = new Date();
      date.setHours(h, m, 0, 0);
      
      if (minTime && date < minTime) continue;
      if (maxTime && date > maxTime) continue;

      slots.push({ hours: h, minutes: m });
    }
    
    return slots;
  };

  return (
    <div className="relative">
      <button
        className="form-input flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Clock className="w-4 h-4 text-gray-500" />
        {value ? formatTime(hours, minutes) : 'Select time'}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
          <div className="p-2 grid grid-cols-4 gap-1">
            {generateTimeSlots().map(({ hours: h, minutes: m }) => (
              <button
                key={`${h}:${m}`}
                className={`time-picker-cell ${
                  h === hours && m === minutes ? 'selected' : ''
                }`}
                onClick={() => handleTimeSelect(h, m)}
                type="button"
              >
                {formatTime(h, m)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};