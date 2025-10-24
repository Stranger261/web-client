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
import { useSchedule } from '../../context/ScheduleContext';

const Calendar = ({ selectedDate, handleDateClick }) => {
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

  // --- NEW, SMARTER LOGIC for calculating combined daily availability ---
  const dailyAvailability = useMemo(() => {
    const availabilityMap = new Map();
    const scheduleSource = doctorSchedule || combinedSchedule;

    if (scheduleSource) {
      const schedules = Array.isArray(scheduleSource)
        ? scheduleSource
        : [scheduleSource];

      schedules.forEach(sched => {
        sched?.dailySchedules?.forEach(day => {
          const dateKey = format(new Date(day.date), 'yyyy-MM-dd');

          if (!availabilityMap.has(dateKey)) {
            availabilityMap.set(dateKey, { hasAvailableSlots: false });
          }

          if (!day.isOnLeave && day.timeSlots.some(slot => !slot.isBooked)) {
            availabilityMap.get(dateKey).hasAvailableSlots = true;
          }
        });
      });
    }
    return availabilityMap;
  }, [doctorSchedule, combinedSchedule]);

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={prevMonth}
        disabled={isSameMonth(currentMonth, today)}
        className="text-sm text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &larr; Prev
      </button>
      <h2 className="text-lg font-bold text-gray-700">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button
        onClick={nextMonth}
        disabled={isSameMonth(currentMonth, startOfMonth(maxDate))}
        className="text-sm text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next &rarr;
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500">
        {days.map(day => (
          <div key={day}>{day}</div>
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

        const isUnavailable = !dayAvailability?.hasAvailableSlots;

        const isDisabled = isOutsideMonth || isPast || isTooFar;
        const isSelected = selectedDate && isSameDay(cloneDay, selectedDate);
        const isClickable = !isDisabled && !isUnavailable;

        days.push(
          <div
            key={day.toString()}
            onClick={() => isClickable && handleDateClick(cloneDay)}
            className={`text-center text-sm py-2 border rounded-md transition-colors ${
              isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : !isClickable
                ? 'bg-red-200 text-red-500 cursor-not-allowed'
                : isSelected
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-blue-50 cursor-pointer'
            }`}
          >
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2 mb-1" key={day.toString()}>
          {days}
        </div>
      );
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
