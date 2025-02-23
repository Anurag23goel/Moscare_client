// Calendar.js
import React, {useState} from 'react';
import DroppableCell from './DroppableCell';

const initialShifts = {
    5: ['Shift A', 'Shift B', 'Shift C'],
    10: [],
};

function Calendar() {
    const [shifts, setShifts] = useState(initialShifts);

    const moveShift = (shift, fromDay, toDay) => {
        if (fromDay === toDay) return;

        setShifts((prevShifts) => {
            const newShifts = {...prevShifts};

            if (!newShifts[toDay]) {
                newShifts[toDay] = [];
            }


            newShifts[fromDay] = newShifts[fromDay].filter((s) => s !== shift);

            newShifts[toDay] = [...newShifts[toDay], shift];

            return newShifts;
        });
    };

    const days = Array.from({length: 30}, (_, i) => i + 1);

    return (
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {days.map((day) => (
                <DroppableCell key={day} day={day} shifts={shifts[day] || []} moveShift={moveShift}/>
            ))}
        </div>
    );
}

export default Calendar;
