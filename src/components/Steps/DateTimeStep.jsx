// src/components/Steps/DateTimeStep.jsx

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useSchedule } from '../../context/ScheduleContext';
import Calendar from '../generic/Calendar';
import { formatTime } from '../../utils/FormatTime.js';

export const DateTimeStep = ({
  selectedDoctor,
  selectedDepartment,
  onDateTimeSelect,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const { doctorSchedule, combinedSchedule, isLoading } = useSchedule();

  const handleDateClick = date => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  // This function now correctly calls the prop it receives with a single object
  const handleTimeSelect = slot => {
    setSelectedTimeSlot(slot);
    onDateTimeSelect({
      date: selectedDate,
      time: slot,
      assignedDoctor: slot.doctorId,
    });
  };

  const availabilityForDay = useMemo(() => {
    if (!selectedDate) return { timeSlots: [] };
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    // Case 1: A specific doctor is selected
    if (selectedDoctor && doctorSchedule) {
      const day = doctorSchedule.dailySchedules.find(
        d => format(new Date(d.date), 'yyyy-MM-dd') === dateKey
      );
      if (day && !day.isOnLeave) {
        const slotsWithDoctor = day.timeSlots.map(slot => ({
          ...slot,
          doctorId: selectedDoctor._id,
        }));
        return { ...day, timeSlots: slotsWithDoctor };
      }
      return { timeSlots: [] };
    }

    // Case 2: "Any Doctor" is selected - merge slots and find an available doctor for each
    if (!selectedDoctor && combinedSchedule) {
      const mergedSlots = {};
      for (const schedule of combinedSchedule) {
        const day = schedule.dailySchedules.find(
          d => format(new Date(d.date), 'yyyy-MM-dd') === dateKey
        );
        if (day && !day.isOnLeave) {
          for (const slot of day.timeSlots) {
            if (!mergedSlots[slot.startTime] && !slot.isBooked) {
              mergedSlots[slot.startTime] = {
                ...slot,
                isBooked: false,
                doctorId: schedule.doctor,
              };
            }
          }
        }
      }
      return {
        timeSlots: Object.values(mergedSlots).sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        ),
      };
    }
    return { timeSlots: [] };
  }, [selectedDate, doctorSchedule, combinedSchedule, selectedDoctor]);

  if (!selectedDepartment) {
    return (
      <p className="text-center text-gray-500">
        Please select a department first.
      </p>
    );
  }

  const renderTimeSlots = () => {
    if (isLoading)
      return <p className="text-center text-gray-500">Loading schedule...</p>;
    if (!selectedDate)
      return (
        <p className="text-center text-gray-500">
          Please select a date to see available times.
        </p>
      );
    if (availabilityForDay.isOnLeave && selectedDoctor)
      return (
        <p className="text-center text-yellow-700">
          The doctor is on leave on this day.
        </p>
      );
    if (availabilityForDay.timeSlots.length === 0)
      return (
        <p className="text-center text-gray-500">
          No appointments available on this day.
        </p>
      );

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {availabilityForDay.timeSlots.map(slot => (
          <button
            key={slot.startTime}
            onClick={() => handleTimeSelect(slot)}
            disabled={slot.isBooked}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-center font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              slot.isBooked
                ? 'bg-red-100 border-red-200 text-red-400 cursor-not-allowed line-through'
                : selectedTimeSlot?.startTime === slot.startTime
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : 'bg-white border-gray-200 text-blue-700 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            {formatTime(slot.startTime)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {selectedDoctor
          ? `Schedule for Dr. ${selectedDoctor.lastname}`
          : `Available times for ${selectedDepartment.name}`}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
        <div className="flex-1">
          <Calendar
            selectedDate={selectedDate}
            handleDateClick={handleDateClick}
          />
        </div>
        <div className="flex-1 mt-6 lg:mt-0">
          <h4 className="font-semibold mb-4 text-gray-700">
            {selectedDate
              ? `Available Slots for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'Available Slots'}
          </h4>
          <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
            {renderTimeSlots()}
          </div>
        </div>
      </div>
    </div>
  );
};

// export default DateTimeStep;
