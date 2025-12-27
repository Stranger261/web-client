import { useState, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addDays,
  isAfter,
} from 'date-fns';
import { useSchedule } from '../../contexts/ScheduleContext';

const Calendar = ({ selectedDate, handleDateClick, takenSlotsByDate = {} }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { changeMonth, doctorSchedule, combinedSchedule } = useSchedule();

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const maxDate = useMemo(() => addMonths(today, 3), [today]);

  const nextMonth = () => {
    const newMonthDate = addMonths(currentMonth, 1);
    if (isAfter(startOfMonth(newMonthDate), maxDate)) return;
    setCurrentMonth(newMonthDate);
    changeMonth(format(newMonthDate, 'yyyy-MM'));
  };

  const prevMonth = () => {
    const newMonthDate = subMonths(currentMonth, 1);
    if (isAfter(today, endOfMonth(newMonthDate))) return;
    setCurrentMonth(newMonthDate);
    changeMonth(format(newMonthDate, 'yyyy-MM'));
  };

  const dailyAvailability = useMemo(() => {
    const availabilityMap = new Map();

    if (doctorSchedule?.availableSlots) {
      doctorSchedule.availableSlots.forEach(slot => {
        const dateKey = slot.date;

        const takenForThisDate = takenSlotsByDate[dateKey] || [];

        if (!availabilityMap.has(dateKey)) {
          availabilityMap.set(dateKey, {
            hasAvailableSlots: false,
            slots: [],
          });
        }

        //  Skip if slot is taken for this date
        if (!takenForThisDate.includes(slot.time)) {
          availabilityMap.get(dateKey).hasAvailableSlots = true;
          availabilityMap.get(dateKey).slots.push(slot);
        }
      });
    }

    if (Array.isArray(combinedSchedule) && combinedSchedule.length > 0) {
      combinedSchedule.forEach(schedule => {
        if (
          schedule?.availableSlots &&
          Array.isArray(schedule.availableSlots)
        ) {
          schedule.availableSlots.forEach(slot => {
            const dateKey = slot.date;

            const takenForThisDate = takenSlotsByDate[dateKey] || [];

            if (!availabilityMap.has(dateKey)) {
              availabilityMap.set(dateKey, {
                hasAvailableSlots: false,
                slots: [],
              });
            }

            if (!takenForThisDate.includes(slot.time)) {
              availabilityMap.get(dateKey).hasAvailableSlots = true;
              availabilityMap
                .get(dateKey)
                .slots.push({ ...slot, doctor: schedule.doctor });
            }
          });
        }
      });
    }
    return availabilityMap;
  }, [doctorSchedule, combinedSchedule, takenSlotsByDate]);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={prevMonth}
        disabled={isSameMonth(currentMonth, today)}
        className="text-sm text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        ← Prev
      </button>
      <h2 className="text-lg font-bold text-gray-800">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button
        onClick={nextMonth}
        disabled={isSameMonth(currentMonth, startOfMonth(maxDate))}
        className="text-sm text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Next →
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-600 mb-2">
        {days.map(day => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const endDate = endOfWeek(endOfMonth(monthStart));
    let day = startOfWeek(monthStart);
    const rows = [];

    while (day <= endDate) {
      let days = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        const dayAvailability = dailyAvailability.get(dateKey);

        const isPast = cloneDay < today;
        const isTooFar = isAfter(cloneDay, maxDate);
        const isOutsideMonth = !isSameMonth(cloneDay, monthStart);

        const hasAvailableSlots = dayAvailability?.hasAvailableSlots || false;
        const slotCount = dayAvailability?.slots?.length || 0;

        const isDisabled = isOutsideMonth || isPast || isTooFar;
        const isSelected = selectedDate && isSameDay(cloneDay, selectedDate);
        const isClickable = !isDisabled && hasAvailableSlots;

        days.push(
          <div
            key={day.toString()}
            onClick={() => isClickable && handleDateClick(cloneDay)}
            className={`relative text-center text-sm py-4 px-2 border-2 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
              isDisabled
                ? 'text-gray-300 bg-gray-50 cursor-not-allowed border-gray-200'
                : !hasAvailableSlots
                ? 'bg-red-50 text-red-500 cursor-not-allowed border-red-300'
                : isSelected
                ? 'bg-blue-600 text-white font-bold shadow-md border-blue-700'
                : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-500 hover:shadow-sm'
            }`}
          >
            <div className="font-semibold text-lg">{format(day, 'd')}</div>

            {!isDisabled && hasAvailableSlots && !isSelected && (
              <div className="text-[10px] text-green-600 font-semibold mt-1">
                {slotCount} slot{slotCount !== 1 ? 's' : ''}
              </div>
            )}

            {!isDisabled && !hasAvailableSlots && !isOutsideMonth && (
              <div className="text-[10px] text-red-600 font-semibold mt-1">
                Full
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2 mb-2" key={day.toString()}>
          {days}
        </div>
      );
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
          <span className="text-gray-700">Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-700">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
          <span className="text-gray-700">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
