// components/shared/RescheduleCalendar.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { format, parse, isBefore } from 'date-fns';

import { useSchedule } from '../../contexts/ScheduleContext';

import Calendar from '../shared/Calendar';

import { formatTime } from '../../utils/FormatTime';
import { useSocket } from '../../contexts/SocketContext';

export const RescheduleCalendar = ({
  currentAppointment,
  onDateTimeSelect,
}) => {
  const { isConnected, socket } = useSocket();
  const currentRoomRef = useRef(new Set());

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [localTimeSlot, setLocalTimeSlot] = useState([]);
  const [takenSlotsByDate, setTakenSlotsByDate] = useState({});
  const [takenSlot, setTakenSlot] = useState(null);

  const { doctorSchedule, isLoading } = useSchedule();

  // Use the current appointment's doctor and department
  const selectedDoctor = currentAppointment?.doctor;
  const selectedDepartment = currentAppointment?.department;

  const handleDateClick = date => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setLocalTimeSlot([]); // ✅ Clear slots when date changes
  };

  const handleTimeSelect = slot => {
    setSelectedTimeSlot(slot);

    // Prepare the time object in the format expected by your backend
    const timeObj = {
      time: slot.time,
      date: slot.date,
      start_time: slot.time,
      end_time: slot.end_time || calculateEndTime(slot.time),
      doctor_uuid:
        slot.doctorUuid || slot.doctor_uuid || selectedDoctor?.staff_uuid,
      doctorId: slot.doctorId || slot.doctor_id || selectedDoctor?.staff_id,
      is_booked: slot.is_booked || false,
    };

    onDateTimeSelect({
      time: timeObj,
      assignedDoctor: selectedDoctor?.staff_uuid || selectedDoctor?.staff_id,
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

  // join-room for the doctor
  useEffect(() => {
    if (!socket || !isConnected || !selectedDate || !selectedDoctor) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const roomName = `${selectedDoctor.staff_uuid}_${dateKey}`;
    const newRooms = new Set([roomName]);

    // leave unnecessary room
    currentRoomRef.current.forEach(oldRoom => {
      if (!newRooms.has(oldRoom)) {
        const [doctor_uuid, date] = oldRoom.split('_');
        socket.emit('leave-appointment-room', { doctor_uuid, date });
      }
    });

    // join new room
    if (!currentRoomRef.current.has(roomName)) {
      const [doctor_uuid, date] = roomName.split('_');
      socket.emit('join-appointment-room', { doctor_uuid, date });
    }

    currentRoomRef.current = newRooms;

    // Listen for slot updates
    const handleSlotTaken = data => {
      if (data?.time && data?.date) {
        setTakenSlot(data);
      }
    };

    socket.on('appointment-slot-taken', handleSlotTaken);

    // clean up
    return () => {
      socket.off('appointment-slot-taken', handleSlotTaken);
      currentRoomRef.current.forEach(room => {
        const [doctor_uuid, date] = room.split('_');
        socket.emit('leave-appointment-room', { doctor_uuid, date });
      });
      currentRoomRef.current.clear();
    };
  }, [socket, isConnected, selectedDate, selectedDoctor]);

  const availabilityForDay = useMemo(() => {
    if (!selectedDate || !doctorSchedule?.availableSlots) {
      return { timeSlots: [] };
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');

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
          `${selectedDoctor.person?.first_name} ${selectedDoctor.person?.last_name}`,
        first_name: selectedDoctor.person?.first_name,
        last_name: selectedDoctor.person?.last_name,
        specialization: selectedDoctor.specialization,
      },
    }));

    return { timeSlots: slotsWithDoctor };
  }, [selectedDate, doctorSchedule, selectedDoctor]);

  useEffect(() => {
    if (availabilityForDay?.timeSlots && selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const takenForThisDate = takenSlotsByDate[dateKey] || [];

      // Map slots and mark them as booked, but DON'T filter them out
      const slotsWithBookedStatus = availabilityForDay.timeSlots.map(slot => ({
        ...slot,
        is_booked: takenForThisDate.includes(slot.time) || slot.is_booked,
      }));

      // ✅ Deduplicate slots based on date + time
      const uniqueSlots = slotsWithBookedStatus.reduce((acc, slot) => {
        const key = `${slot.date}-${slot.time}`;
        if (!acc.some(s => `${s.date}-${s.time}` === key)) {
          acc.push(slot);
        }
        return acc;
      }, []);

      setLocalTimeSlot(uniqueSlots);
    }
  }, [availabilityForDay, selectedDate, takenSlotsByDate]);

  // slot update from socket
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
          {localTimeSlot.map((slot, index) => {
            // ✅ Use index in key to ensure absolute uniqueness
            const slotKey = `slot-${slot.date}-${slot.time}-${index}`;

            // FIXED: Compare by BOTH date AND time (not doctorId)
            // This ensures only the exact slot on the exact date is highlighted
            const isSelected =
              selectedTimeSlot?.time === slot.time &&
              selectedTimeSlot?.date === slot.date;

            // Check if this is the current appointment slot
            const isCurrentSlot =
              currentAppointment &&
              slot.date === currentAppointment.appointment_date &&
              slot.time === currentAppointment.start_time;

            return (
              <button
                key={slotKey}
                onClick={() => !slot.is_booked && handleTimeSelect(slot)}
                disabled={slot.is_booked && !isCurrentSlot}
                className={`min-h-[70px] p-3 rounded-lg border-2 transition-all duration-150 flex flex-col items-center justify-center ${
                  isCurrentSlot
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    : slot.is_booked
                      ? 'bg-red-50 border-red-300 text-red-500 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                }`}
              >
                <div className="font-bold text-base">
                  {formatTime(slot.time)}
                </div>
                {isCurrentSlot && (
                  <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 bg-yellow-200 rounded">
                    Current
                  </div>
                )}
                {slot.is_booked && !isCurrentSlot && (
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
    <div className="space-y-4">
      {/* Current Appointment Info - More Compact */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
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
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">
            Current Schedule
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 ml-10">
          <div>
            <span className="font-medium">Doctor:</span> Dr.{' '}
            {selectedDoctor?.person?.first_name || selectedDoctor?.first_name}{' '}
            {selectedDoctor?.person?.last_name || selectedDoctor?.last_name}
          </div>
          <div>
            <span className="font-medium">Date:</span>{' '}
            {format(
              new Date(currentAppointment.appointment_date),
              'MMM d, yyyy',
            )}
          </div>
          <div>
            <span className="font-medium">Time:</span>{' '}
            {formatTime(currentAppointment.start_time)}
          </div>
          <div>
            <span className="font-medium">Dept:</span>{' '}
            {selectedDepartment?.department_name}
          </div>
        </div>
      </div>

      {/* Calendar and Time Slots in Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calendar Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-blue-600"
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
            <h4 className="text-sm font-semibold text-gray-800">
              Select New Date
            </h4>
          </div>
          <Calendar
            selectedDate={selectedDate}
            handleDateClick={handleDateClick}
            takenSlotsByDate={takenSlotsByDate}
          />
        </div>

        {/* Time Slots Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-blue-600"
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
            <h4 className="text-sm font-semibold text-gray-800">
              Select New Time
            </h4>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4 min-h-[400px]">
            {renderTimeSlots()}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedTimeSlot && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
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
            <h3 className="font-medium text-green-900 text-sm">
              New Time Slot Selected
            </h3>
          </div>
          <div className="ml-7 space-y-1">
            <p className="text-green-800 text-sm">
              <strong>{formatTime(selectedTimeSlot.time)}</strong> on{' '}
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            {/* Show comparison if date/time changed */}
            {(selectedDate &&
              format(selectedDate, 'yyyy-MM-dd') !==
                currentAppointment.appointment_date) ||
            (selectedTimeSlot &&
              selectedTimeSlot.time !== currentAppointment.start_time) ? (
              <p className="text-xs text-green-700 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Changed from{' '}
                {format(
                  new Date(currentAppointment.appointment_date),
                  'MMM d, yyyy',
                )}{' '}
                at {formatTime(currentAppointment.start_time)}
              </p>
            ) : (
              <p className="text-xs text-yellow-700 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Same as current appointment
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
