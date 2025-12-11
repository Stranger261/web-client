// src/components/Steps/DateTimeStep.jsx

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useSchedule } from '../../../../../contexts/ScheduleContext';
import Calendar from '../../../../../components/shared/Calendar';
import { formatTime } from '../../../../../utils/FormatTime';

export const DateTimeStep = ({
  selectedDoctor,
  selectedDepartment,
  onDateTimeSelect,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const { doctorSchedule, combinedSchedule, isLoading } = useSchedule();

  const handleDateClick = date => {
    console.log(date);
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSelect = slot => {
    console.log(slot);
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

    if (selectedDoctor && doctorSchedule?.availableSlots) {
      const slotsForDay = doctorSchedule.availableSlots.filter(
        slot => slot.date === dateKey
      );

      const slotsWithDoctor = slotsForDay.map(slot => ({
        ...slot,
        doctorUuid: selectedDoctor.staff_uuid,
        doctorId: selectedDoctor.staff_id,
        doctor: {
          staff_id: selectedDoctor.staff_id,
          staff_uuid: selectedDoctor.staff_uuid,
          name:
            selectedDoctor.name ||
            `${selectedDoctor.first_name} ${selectedDoctor.last_name}`,
          specialization: selectedDoctor.specialization,
        },
      }));

      return { timeSlots: slotsWithDoctor };
    }

    if (!selectedDoctor && Array.isArray(combinedSchedule)) {
      const allSlotsForDay = [];
      for (const schedule of combinedSchedule) {
        if (!schedule?.availableSlots) return;

        const slotsForDay = schedule.availableSlots.filter(
          slot => slot.date === dateKey
        );

        slotsForDay.forEach(slot => {
          allSlotsForDay.push({
            ...slot,
            doctorUuidd:
              slot?.doctor_uuid ||
              slot?.staff_uuid ||
              schedule.doctor.staff_uuid,
            doctorId:
              slot?.doctor_id || slot?.staff_id || schedule.doctor.staff_id,
            doctor: slot?.doctor || schedule?.doctor,
          });
        });
      }

      allSlotsForDay.sort((a, b) => a.time.localeCompare(b.time));

      return { timeSlots: allSlotsForDay };
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
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm">Loading schedule...</p>
        </div>
      );

    if (!selectedDate)
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg
            className="w-14 h-14 mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-center text-sm font-medium">
            Please select a date first
          </p>
        </div>
      );

    if (availabilityForDay?.timeSlots.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg
            className="w-14 h-14 mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <p className="text-center text-sm font-medium">
            No appointments available
          </p>
        </div>
      );

    const availableCount = availabilityForDay.timeSlots.filter(
      s => !s.is_booked
    ).length;

    return (
      <>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 mb-0.5">Available slots for</p>
          <p className="text-base font-bold text-gray-900">
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
          <p className="text-xs text-blue-600 mt-1 font-semibold">
            {availableCount} slot{availableCount !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
          {availabilityForDay?.timeSlots.map((slot, index) => {
            const slotKey = `${slot.time}-${slot.doctorId || index}`;
            const isSelected =
              selectedTimeSlot?.time === slot.time &&
              selectedTimeSlot?.doctorId === slot.doctorId;

            return (
              <button
                key={slotKey}
                onClick={() => handleTimeSelect(slot)}
                disabled={slot.is_booked}
                className={`min-h-[70px] p-3 rounded-lg border-2 transition-all duration-150 flex flex-col items-center justify-center ${
                  slot.is_booked
                    ? 'bg-red-50 border-red-300 text-red-500 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                }`}
              >
                <div className="font-bold text-base">
                  {formatTime(slot.time)}
                </div>
                {!selectedDoctor && slot.doctor?.name && (
                  <div
                    className={`text-xs mt-1 text-center line-clamp-1 ${
                      isSelected ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {slot.doctor.name}
                  </div>
                )}
                {slot.is_booked && (
                  <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 bg-red-200 rounded">
                    Booked
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-5">
        {selectedDoctor
          ? `Schedule for Dr. ${
              selectedDoctor.last_name || selectedDoctor.lastname
            }`
          : `Available times for ${selectedDepartment.department_name}`}
      </h3>

      {/* Single Column Layout */}
      <div className="space-y-6">
        {/* Calendar Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h4 className="text-lg font-semibold text-gray-800">Select Date</h4>
          </div>
          <Calendar
            selectedDate={selectedDate}
            handleDateClick={handleDateClick}
          />
        </div>

        {/* Time Slots Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="text-lg font-semibold text-gray-800">Select Time</h4>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4 min-h-[300px]">
            {renderTimeSlots()}
          </div>
        </div>
      </div>
    </div>
  );
};
