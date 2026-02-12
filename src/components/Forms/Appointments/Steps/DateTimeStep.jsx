// components/forms/Steps/DateTimeStep.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { format, parse, isBefore } from 'date-fns';

import { useSchedule } from '../../../../contexts/ScheduleContext';

import Calendar from '../../../shared/Calendar';

import { formatTime } from '../../../../utils/FormatTime';
import { useSocket } from '../../../../contexts/SocketContext';

export const DateTimeStep = ({
  selectedDoctor,
  selectedDepartment,
  onDateTimeSelect,
  onDateSelect,
  takenSlot,
  userRole = 'patient',
}) => {
  const { isConnected, socket } = useSocket();
  const currentRoomRef = useRef(new Set());

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [localTimeSlot, setLocalTimeSlot] = useState([]);

  const [takenSlotsByDate, setTakenSlotsByDate] = useState({});

  const { doctorSchedule, combinedSchedule, isLoading } = useSchedule();

  const handleDateClick = date => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);

    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleTimeSelect = slot => {
    setSelectedTimeSlot(slot);

    // Prepare the time object in the format expected by your backend
    const timeObj = {
      time: slot.time,
      date: slot.date,
      start_time: slot.time,
      end_time: slot.end_time || calculateEndTime(slot.time),
      doctor_uuid: slot.doctorUuid || slot.doctor_uuid,
      doctorId: slot.doctorId || slot.doctor_id,
      is_booked: slot.is_booked || false,
    };

    const assignedDoctorId =
      slot.doctorUuid || slot.doctor_uuid || slot.doctorId || slot.doctor_id;

    onDateTimeSelect({
      time: timeObj,
      assignedDoctor: assignedDoctorId,
    });
  };

  // Calculate end time (30-minute slots by default)
  const calculateEndTime = startTime => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours);
    endTime.setMinutes(minutes + 30);
    return format(endTime, 'HH:mm:ss');
  };

  // Helper function to check if a time slot is in the past
  const isTimeSlotPast = (dateStr, timeStr) => {
    try {
      const slotDateTime = parse(
        `${dateStr} ${timeStr}`,
        'yyyy-MM-dd HH:mm:ss',
        new Date(),
      );
      return isBefore(slotDateTime, new Date());
    } catch (error) {
      console.error('Error parsing time slot:', error);
      return false;
    }
  };

  // join-room for any doctor
  useEffect(() => {
    if (!socket || !isConnected || !selectedDate) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newRooms = new Set();

    if (selectedDoctor) {
      const roomName = `${selectedDoctor.staff_uuid}_${dateKey}`;
      newRooms.add(roomName);
    } else {
      const allAvailableDoctors = combinedSchedule || [];

      allAvailableDoctors.forEach(sched => {
        if (sched?.doctor?.staff_uuid) {
          const roomName = `${sched.doctor.staff_uuid}_${dateKey}`;
          newRooms.add(roomName);
        }
      });
    }

    // leave unnecessary room
    currentRoomRef.current.forEach(oldRoom => {
      if (!newRooms.has(oldRoom)) {
        const [doctor_uuid, date] = oldRoom.split('_');
        socket.emit('leave-appointment-room', { doctor_uuid, date });
      }
    });

    newRooms.forEach(newRoom => {
      if (!currentRoomRef.current.has(newRoom)) {
        const [doctor_uuid, date] = newRoom.split('_');
        socket.emit('join-appointment-room', { doctor_uuid, date });
      }
    });

    currentRoomRef.current = newRooms;

    // clean up
    return () => {
      currentRoomRef.current.forEach(room => {
        const [doctor_uuid, date] = room.split('_');
        socket.emit('leave-appointment-room', { doctor_uuid, date });
      });
      currentRoomRef.current.clear();
    };
  }, [socket, isConnected, selectedDate, selectedDoctor, combinedSchedule]);

  const availabilityForDay = useMemo(() => {
    if (!selectedDate) return { timeSlots: [] };
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    if (selectedDoctor && doctorSchedule?.availableSlots) {
      const slotsForDay = doctorSchedule.availableSlots.filter(
        slot => slot.date === dateKey && !isTimeSlotPast(slot.date, slot.time),
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
          first_name: selectedDoctor.first_name,
          last_name: selectedDoctor.last_name,
          specialization: selectedDoctor.specialization,
        },
      }));

      return { timeSlots: slotsWithDoctor };
    }

    if (!selectedDoctor && Array.isArray(combinedSchedule)) {
      const allSlotsForDay = [];
      for (const schedule of combinedSchedule) {
        if (!schedule?.availableSlots) continue;

        const slotsForDay = schedule.availableSlots.filter(
          slot =>
            slot.date === dateKey && !isTimeSlotPast(slot.date, slot.time),
        );

        slotsForDay.forEach(slot => {
          allSlotsForDay.push({
            ...slot,
            doctorUuid: slot?.doctor_uuid || schedule.doctor?.staff_uuid,
            doctorId: slot?.doctor_id || schedule.doctor?.staff_id,
            doctor: slot?.doctor ||
              schedule?.doctor || {
                staff_id: schedule.doctor?.staff_id,
                staff_uuid: schedule.doctor?.staff_uuid,
                name:
                  schedule.doctor?.name ||
                  `${schedule.doctor?.first_name || ''} ${
                    schedule.doctor?.last_name || ''
                  }`.trim(),
                first_name: schedule.doctor?.first_name,
                last_name: schedule.doctor?.last_name,
                specialization: schedule.doctor?.specialization,
              },
          });
        });
      }

      allSlotsForDay.sort((a, b) => a.time.localeCompare(b.time));

      return { timeSlots: allSlotsForDay };
    }

    return { timeSlots: [] };
  }, [selectedDate, doctorSchedule, combinedSchedule, selectedDoctor]);

  useEffect(() => {
    if (availabilityForDay?.timeSlots && selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const takenForThisDate = takenSlotsByDate[dateKey] || [];

      // Map slots and mark them as booked, but DON'T filter them out
      const slotsWithBookedStatus = availabilityForDay.timeSlots.map(slot => ({
        ...slot,
        is_booked: takenForThisDate.includes(slot.time) || slot.is_booked,
      }));

      setLocalTimeSlot(slotsWithBookedStatus);
    }
  }, [availabilityForDay, selectedDate, takenSlotsByDate]);

  // slot update
  useEffect(() => {
    if (takenSlot?.time && takenSlot?.date) {
      setTakenSlotsByDate(prev => {
        const dateKey = takenSlot.date;
        const existingTakenSlots = prev[dateKey] || [];

        if (existingTakenSlots.includes(takenSlot.time)) {
          return prev;
        }

        return {
          ...prev,
          [dateKey]: [...existingTakenSlots, takenSlot.time],
        };
      });

      // Update localTimeSlot to mark the slot as booked instead of removing it
      if (selectedDate) {
        const currentDateKey = format(selectedDate, 'yyyy-MM-dd');
        if (currentDateKey === takenSlot.date) {
          setLocalTimeSlot(prevSlots =>
            prevSlots.map(slot =>
              slot.time === takenSlot.time
                ? { ...slot, is_booked: true }
                : slot,
            ),
          );
        }
      }
    }
  }, [takenSlot, selectedDate]);

  if (!selectedDepartment) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-14 h-14 mx-auto mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="text-gray-600 font-medium">
          Please select a department first.
        </p>
      </div>
    );
  }

  const renderTimeSlots = () => {
    if (isLoading)
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      );

    if (!selectedDate)
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-14 h-14 mb-3 text-gray-400"
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
          <p className="text-gray-600 font-medium">
            Please select a date first
          </p>
        </div>
      );

    if (localTimeSlot.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-14 h-14 mb-3 text-gray-400"
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
          <p className="text-gray-600 font-medium mb-2">
            No appointments available
          </p>
          <p className="text-sm text-gray-500 text-center">
            Try selecting a different date or check back later
          </p>
        </div>
      );

    const availableCount = localTimeSlot.filter(s => !s.is_booked).length;
    const bookedCount = localTimeSlot.filter(s => s.is_booked).length;

    // Group slots by doctor when "Any Doctor" is selected
    const groupedSlots = !selectedDoctor
      ? localTimeSlot.reduce((groups, slot) => {
          const doctorKey = slot.doctorUuid || slot.doctorId || 'unknown';
          if (!groups[doctorKey]) {
            groups[doctorKey] = {
              doctor: slot.doctor || {
                name: 'Available Doctor',
                specialization: '',
              },
              slots: [],
            };
          }
          groups[doctorKey].slots.push(slot);
          return groups;
        }, {})
      : null;

    return (
      <>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">
                Available slots for
              </p>
              <p className="text-base font-bold text-gray-900">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600 font-semibold">
                {availableCount} slot{availableCount !== 1 ? 's' : ''} available
              </p>
              {bookedCount > 0 && (
                <p className="text-xs text-red-600">{bookedCount} booked</p>
              )}
            </div>
          </div>
        </div>

        {selectedDoctor ? (
          // Single doctor view
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
            {localTimeSlot.map((slot, index) => {
              const slotKey = `${slot.time}-${slot.doctorId || index}`;
              const isSelected =
                selectedTimeSlot?.time === slot.time &&
                selectedTimeSlot?.doctorId === slot.doctorId;

              return (
                <button
                  key={slotKey}
                  onClick={() => !slot.is_booked && handleTimeSelect(slot)}
                  disabled={slot.is_booked}
                  className={`min-h-[70px] p-3 rounded-lg border-2 transition-all duration-150 flex flex-col items-center justify-center ${
                    slot.is_booked
                      ? 'bg-red-50 border-red-300 text-red-500 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                  }`}
                >
                  <div className="font-bold text-base">
                    {formatTime(slot.time)}
                  </div>
                  {slot.is_booked && (
                    <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 bg-red-200 rounded">
                      Booked
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // Multiple doctors view (Any Doctor selected)
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {Object.values(groupedSlots).map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {group.doctor.name}
                    </p>
                    {group.doctor.specialization && (
                      <p className="text-sm text-gray-600">
                        {group.doctor.specialization}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {group.slots.map((slot, slotIndex) => {
                    const slotKey = `${slot.time}-${
                      slot.doctorId || slotIndex
                    }`;
                    const isSelected =
                      selectedTimeSlot?.time === slot.time &&
                      selectedTimeSlot?.doctorId === slot.doctorId;

                    return (
                      <button
                        key={slotKey}
                        onClick={() =>
                          !slot.is_booked && handleTimeSelect(slot)
                        }
                        disabled={slot.is_booked}
                        className={`min-h-[70px] p-3 rounded-lg border-2 transition-all duration-150 flex flex-col items-center justify-center ${
                          slot.is_booked
                            ? 'bg-red-50 border-red-300 text-red-500 cursor-not-allowed'
                            : isSelected
                              ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                              : 'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="font-bold text-base">
                          {formatTime(slot.time)}
                        </div>
                        {slot.is_booked && (
                          <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 bg-red-200 rounded">
                            Booked
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Date & Time
        </h2>
        <p className="text-gray-600">
          Choose when you'd like to have your appointment
        </p>
      </div>

      {/* Doctor/Department Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              {selectedDoctor
                ? `Dr. ${
                    selectedDoctor.first_name || selectedDoctor.firstname
                  } ${selectedDoctor.last_name || selectedDoctor.lastname}`
                : selectedDepartment?.department_name}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedDoctor?.specialization || 'Any available doctor'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {selectedDate
                ? format(selectedDate, 'MMMM yyyy')
                : 'Select a date'}
            </p>
          </div>
        </div>
      </div>

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
            takenSlotsByDate={takenSlotsByDate}
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

      {/* Selection Summary */}
      {selectedTimeSlot && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="font-medium text-green-900">Time Slot Selected</h3>
          </div>
          <p className="text-green-800">
            <strong>{formatTime(selectedTimeSlot.time)}</strong> on{' '}
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
          {!selectedDoctor && selectedTimeSlot.doctor?.name && (
            <p className="text-sm text-green-700 mt-1">
              With {selectedTimeSlot.doctor.name}
              {selectedTimeSlot.doctor.specialization &&
                ` (${selectedTimeSlot.doctor.specialization})`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
