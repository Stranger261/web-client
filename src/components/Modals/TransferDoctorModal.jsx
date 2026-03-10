import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Check,
  X,
  AlertCircle,
  Stethoscope,
  RefreshCw,
  Scissors,
  Activity,
  Building2,
  Video,
  Clock,
} from 'lucide-react';
import { format, parse, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

import { COLORS } from '../../configs/CONST';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAppointment } from '../../contexts/AppointmentContext';
import Calendar from '../shared/Calendar';
import { formatTime } from '../../utils/FormatTime';

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = ['Doctor', 'Date & Time', 'Reason', 'Confirm'];

const StepIndicator = ({ currentStep, isDarkMode }) => (
  <div className="flex items-center justify-center mb-8">
    {STEPS.map((label, idx) => {
      const done = idx < currentStep;
      const active = idx === currentStep;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={{
                backgroundColor: done
                  ? 'rgb(34 197 94)'
                  : active
                    ? COLORS.info
                    : isDarkMode
                      ? COLORS.surface.darkHover
                      : 'rgb(229 231 235)',
                color:
                  done || active
                    ? 'white'
                    : isDarkMode
                      ? COLORS.text.light
                      : 'rgb(156 163 175)',
              }}
            >
              {done ? <Check size={14} /> : idx + 1}
            </div>
            <span
              className="text-xs mt-1 font-medium whitespace-nowrap"
              style={{
                color: active
                  ? COLORS.info
                  : isDarkMode
                    ? COLORS.text.light
                    : COLORS.text.secondary,
                opacity: active || done ? 1 : 0.5,
              }}
            >
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className="w-10 h-0.5 mb-5 mx-1 transition-all duration-300"
              style={{
                backgroundColor: done
                  ? 'rgb(34 197 94)'
                  : isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Doctor ───────────────────────────────────────────────────────────
const DoctorSelectStep = ({
  doctors,
  selectedDoctor,
  onSelect,
  originalDoctor,
  isLoading,
  isDarkMode,
}) => {
  // Filter out the current doctor
  const availableDoctors = doctors.filter(
    d => d.staff_uuid !== originalDoctor?.staff_uuid,
  );

  const getDoctorName = doctor => {
    if (doctor?.person)
      return `Dr. ${doctor.person.first_name} ${doctor.person.last_name}`;
    if (doctor?.firstname || doctor?.lastname)
      return `Dr. ${doctor.firstname || ''} ${doctor.lastname || ''}`.trim();
    return 'Unknown Doctor';
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3
          className="text-lg font-bold"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Select New Doctor
        </h3>
        <p
          className="text-sm mt-1"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Choose a doctor from the same department to transfer to
        </p>
      </div>

      {/* Transferring from */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl border"
        style={{
          borderColor: 'rgb(254 202 202)',
          backgroundColor: isDarkMode
            ? 'rgba(239,68,68,0.08)'
            : 'rgb(254 242 242)',
        }}
      >
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <X size={15} className="text-red-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
            Transferring from
          </p>
          <p
            className="text-sm font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {getDoctorName(originalDoctor)}
          </p>
          {originalDoctor?.specialization && (
            <p className="text-xs text-red-400">
              {originalDoctor.specialization}
            </p>
          )}
        </div>
      </div>

      {/* Doctor list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: COLORS.info }}
          />
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Loading doctors...
          </p>
        </div>
      ) : availableDoctors.length === 0 ? (
        <div className="text-center py-10">
          <User size={36} className="mx-auto mb-3 opacity-30" />
          <p
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            No other doctors available in this department.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {availableDoctors.map(doctor => {
            const isSelected = selectedDoctor?.staff_uuid === doctor.staff_uuid;
            const name = getDoctorName(doctor);

            return (
              <button
                key={doctor.staff_uuid}
                onClick={() => onSelect(doctor)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150"
                style={{
                  borderColor: isSelected
                    ? COLORS.info
                    : isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgb(239 246 255)'
                    : isDarkMode
                      ? COLORS.surface.dark
                      : 'white',
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isSelected
                      ? COLORS.info
                      : isDarkMode
                        ? COLORS.surface.darkHover
                        : 'rgb(243 244 246)',
                  }}
                >
                  <User
                    size={20}
                    style={{ color: isSelected ? 'white' : COLORS.info }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {name}
                  </p>
                  {doctor.specialization && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: COLORS.info }}
                    >
                      {doctor.specialization}
                    </p>
                  )}
                  {doctor.experience && (
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {doctor.experience} yrs experience
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: COLORS.info }}
                  >
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Step 2: Date & Time ──────────────────────────────────────────────────────
const DateTimeSelectStep = ({
  selectedDoctor,
  originalAppointment,
  onDateTimeSelect,
  selectedDateTime,
  isDarkMode,
}) => {
  // Each step gets its own fresh schedule fetch — use local state to avoid
  // conflicts with the shared doctorSchedule in context
  const { getDoctorAvailability, isLoading } = useSchedule();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch the new doctor's schedule when this step mounts
  useEffect(() => {
    if (!selectedDoctor?.staff_uuid) return;

    const today = new Date();
    const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(today), 'yyyy-MM-dd');

    getDoctorAvailability(selectedDoctor.staff_uuid, startDate, endDate).then(
      res => {
        setAvailableSlots(res?.data?.availableSlots || []);
      },
    );
  }, [selectedDoctor?.staff_uuid]); // eslint-disable-line react-hooks/exhaustive-deps

  const isTimeSlotPast = (dateStr, timeStr) => {
    try {
      const dt = parse(
        `${dateStr} ${timeStr}`,
        'yyyy-MM-dd HH:mm:ss',
        new Date(),
      );
      return isBefore(dt, new Date());
    } catch {
      return false;
    }
  };

  const slotsForDay = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return availableSlots.filter(
      s =>
        s.date === dateKey && !s.is_booked && !isTimeSlotPast(s.date, s.time),
    );
  }, [selectedDate, availableSlots]);

  const originalDateStr = originalAppointment?.appointment_date;
  const originalTime = originalAppointment?.start_time;

  const originalSlotAvailable =
    selectedDate &&
    originalDateStr &&
    format(selectedDate, 'yyyy-MM-dd') === originalDateStr &&
    slotsForDay.some(s => s.time === originalTime);

  const handleDateClick = date => {
    setSelectedDate(date);
    onDateTimeSelect(null);
  };

  const handleSlotClick = slot => {
    onDateTimeSelect({ date: selectedDate, slot });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3
          className="text-lg font-bold"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Select Date & Time
        </h3>
        <p
          className="text-sm mt-1"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Pick an available slot for{' '}
          {selectedDoctor?.person
            ? `Dr. ${selectedDoctor.person.first_name} ${selectedDoctor.person.last_name}`
            : `Dr. ${selectedDoctor?.firstname || ''} ${selectedDoctor?.lastname || ''}`.trim()}
        </p>
      </div>

      {/* Original slot hint */}
      {originalDateStr && originalTime && (
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-xl border"
          style={{
            borderColor: isDarkMode
              ? 'rgba(59,130,246,0.3)'
              : 'rgb(191 219 254)',
            backgroundColor: isDarkMode
              ? 'rgba(59,130,246,0.08)'
              : 'rgb(239 246 255)',
          }}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: COLORS.info }} />
            <span
              className="text-xs"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Original:{' '}
              <strong
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {format(new Date(originalDateStr + 'T00:00:00'), 'MMM d, yyyy')}{' '}
                at {formatTime(originalTime)}
              </strong>
            </span>
          </div>
          {originalSlotAvailable ? (
            <button
              onClick={() => {
                const slot = slotsForDay.find(s => s.time === originalTime);
                if (slot) handleSlotClick(slot);
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ backgroundColor: COLORS.info, color: 'white' }}
            >
              Use same slot
            </button>
          ) : (
            selectedDate &&
            format(selectedDate, 'yyyy-MM-dd') === originalDateStr && (
              <span className="text-xs text-red-400 font-medium flex-shrink-0">
                Not available
              </span>
            )
          )}
        </div>
      )}

      {/* Calendar */}
      <Calendar
        selectedDate={selectedDate}
        handleDateClick={handleDateClick}
        takenSlotsByDate={{}}
      />

      {/* Time slots */}
      <div
        className="rounded-xl border p-4 min-h-[140px]"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : 'rgb(249 250 251)',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="animate-spin rounded-full h-7 w-7 border-b-2"
              style={{ borderColor: COLORS.info }}
            />
          </div>
        ) : !selectedDate ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <p className="text-sm">Select a date to see available times</p>
          </div>
        ) : slotsForDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <p className="text-sm">No available slots on this date</p>
          </div>
        ) : (
          <>
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {slotsForDay.length} slot{slotsForDay.length !== 1 ? 's' : ''}{' '}
              available
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slotsForDay.map(slot => {
                const isSelected =
                  selectedDateTime?.slot?.time === slot.time &&
                  selectedDateTime?.date &&
                  format(selectedDateTime.date, 'yyyy-MM-dd') ===
                    format(selectedDate, 'yyyy-MM-dd');
                const isSameAsOriginal = slot.time === originalTime;

                return (
                  <button
                    key={slot.time}
                    onClick={() => handleSlotClick(slot)}
                    className="relative py-2.5 px-2 rounded-lg border-2 text-sm font-semibold transition-all duration-150 text-center"
                    style={{
                      borderColor: isSelected
                        ? COLORS.info
                        : isDarkMode
                          ? COLORS.border.dark
                          : COLORS.border.light,
                      backgroundColor: isSelected
                        ? COLORS.info
                        : isDarkMode
                          ? COLORS.surface.darkHover
                          : 'white',
                      color: isSelected
                        ? 'white'
                        : isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                    }}
                  >
                    {formatTime(slot.time)}
                    {/* Blue dot = same time as original appointment */}
                    {isSameAsOriginal && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: COLORS.info }}
                        title="Same time as original appointment"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Step 3: Reason ───────────────────────────────────────────────────────────
const ReasonStep = ({ transferDetails, onUpdate, isDarkMode }) => {
  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation', icon: Stethoscope },
    { value: 'followup', label: 'Follow-up', icon: RefreshCw },
    { value: 'procedure', label: 'Procedure', icon: Scissors },
    { value: 'checkup', label: 'Check-up', icon: Activity },
  ];

  const suggestions = [
    'Doctor emergency / unavailability',
    'Patient preference',
    'Specialist referral',
    'Second opinion',
    'Schedule conflict',
    'Follow-up continuity',
  ];

  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h3
          className="text-lg font-bold"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Appointment Details
        </h3>
        <p
          className="text-sm mt-1"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Set the details for the transferred appointment
        </p>
      </div>

      {/* Appointment type */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wide mb-2"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Appointment Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {appointmentTypes.map(({ value, label, icon: Icon }) => {
            const active = transferDetails.appointmentType === value;
            return (
              <button
                key={value}
                onClick={() => onUpdate('appointmentType', value)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: active
                    ? COLORS.info
                    : isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  backgroundColor: active
                    ? isDarkMode
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgb(239 246 255)'
                    : isDarkMode
                      ? COLORS.surface.dark
                      : 'white',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: active
                      ? COLORS.info
                      : isDarkMode
                        ? COLORS.surface.darkHover
                        : 'rgb(243 244 246)',
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? 'white' : COLORS.info }}
                  />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {label}
                </span>
                {active && (
                  <Check
                    size={13}
                    className="ml-auto"
                    style={{ color: COLORS.info }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consultation mode */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wide mb-2"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Consultation Mode
        </label>
        <div className="flex gap-3">
          {[
            { value: false, label: 'Face-to-Face', icon: Building2 },
            { value: true, label: 'Online', icon: Video },
          ].map(({ value, label, icon: Icon }) => {
            const active = transferDetails.isOnlineConsultation === value;
            return (
              <button
                key={String(value)}
                onClick={() => onUpdate('isOnlineConsultation', value)}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: active
                    ? COLORS.info
                    : isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  backgroundColor: active
                    ? isDarkMode
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgb(239 246 255)'
                    : isDarkMode
                      ? COLORS.surface.dark
                      : 'white',
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color: active
                      ? COLORS.info
                      : isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                  }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reason */}
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wide mb-2"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Reason for Transfer <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => onUpdate('reason', s)}
              className="px-2.5 py-1 text-xs rounded-full border transition-all"
              style={{
                borderColor:
                  transferDetails.reason === s
                    ? COLORS.info
                    : isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                backgroundColor:
                  transferDetails.reason === s
                    ? isDarkMode
                      ? 'rgba(59,130,246,0.2)'
                      : 'rgb(239 246 255)'
                    : 'transparent',
                color:
                  transferDetails.reason === s
                    ? COLORS.info
                    : isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <textarea
          value={transferDetails.reason}
          onChange={e => onUpdate('reason', e.target.value)}
          rows={3}
          placeholder="Describe the reason for this transfer..."
          className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none transition-colors outline-none"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        />
      </div>
    </div>
  );
};

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────
const ConfirmStep = ({
  originalAppointment,
  newDoctor,
  selectedDateTime,
  transferDetails,
  isDarkMode,
}) => {
  const getDoctorName = doctor => {
    if (!doctor) return 'N/A';
    if (doctor?.person)
      return `Dr. ${doctor.person.first_name} ${doctor.person.last_name}`;
    return `Dr. ${doctor.firstname || ''} ${doctor.lastname || ''}`.trim();
  };

  const Row = ({ label, oldVal, newVal, changed }) => (
    <div
      className="flex items-start gap-3 py-2.5 border-b last:border-0"
      style={{
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      <div
        className="w-20 text-xs font-semibold uppercase tracking-wide flex-shrink-0 pt-0.5"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        {label}
      </div>
      <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
        <span
          className="text-sm line-through opacity-50 truncate"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          {oldVal}
        </span>
        <ArrowRight size={12} className="flex-shrink-0 opacity-40" />
        <span
          className="text-sm font-semibold"
          style={{
            color: changed
              ? COLORS.info
              : isDarkMode
                ? COLORS.text.white
                : COLORS.text.primary,
          }}
        >
          {newVal}
        </span>
      </div>
    </div>
  );

  const originalDate = originalAppointment?.appointment_date
    ? format(
        new Date(originalAppointment.appointment_date + 'T00:00:00'),
        'MMM d, yyyy',
      )
    : 'N/A';
  const newDate = selectedDateTime?.date
    ? format(selectedDateTime.date, 'MMM d, yyyy')
    : 'N/A';

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3
          className="text-lg font-bold"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Confirm Transfer
        </h3>
        <p
          className="text-sm mt-1"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Review all changes before confirming
        </p>
      </div>

      {/* Changes summary */}
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wide mb-2"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Changes
        </p>
        <Row
          label="Doctor"
          oldVal={getDoctorName(originalAppointment?.doctor)}
          newVal={getDoctorName(newDoctor)}
          changed
        />
        <Row
          label="Date"
          oldVal={originalDate}
          newVal={newDate}
          changed={originalDate !== newDate}
        />
        <Row
          label="Time"
          oldVal={formatTime(originalAppointment?.start_time)}
          newVal={
            selectedDateTime?.slot?.time
              ? formatTime(selectedDateTime.slot.time)
              : 'N/A'
          }
          changed={
            originalAppointment?.start_time !== selectedDateTime?.slot?.time
          }
        />
        <Row
          label="Type"
          oldVal={originalAppointment?.appointment_type || 'consultation'}
          newVal={transferDetails.appointmentType}
          changed={
            originalAppointment?.appointment_type !==
            transferDetails.appointmentType
          }
        />
        <Row
          label="Mode"
          oldVal={
            originalAppointment?.is_online_consultation
              ? 'Online'
              : 'Face-to-Face'
          }
          newVal={
            transferDetails.isOnlineConsultation ? 'Online' : 'Face-to-Face'
          }
          changed={
            !!originalAppointment?.is_online_consultation !==
            transferDetails.isOnlineConsultation
          }
        />
      </div>

      {/* Reason */}
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wide mb-1"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Reason for Transfer
        </p>
        <p
          className="text-sm"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {transferDetails.reason || 'Not specified'}
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <AlertCircle
          size={15}
          className="text-amber-500 mt-0.5 flex-shrink-0"
        />
        <p className="text-xs text-amber-700 leading-relaxed">
          The original appointment will be <strong>cancelled</strong> and a new
          one will be created with the selected doctor. This action cannot be
          undone.
        </p>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const TransferDoctorModal = ({ isOpen, onClose, appointment, onUpdate }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const { allDoctors, getAllDoctors, clearSchedules, isLoading } =
    useSchedule();
  const { transferAppointment } = useAppointment();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [transferDetails, setTransferDetails] = useState({
    appointmentType: 'consultation',
    isOnlineConsultation: false,
    reason: '',
  });

  // Fetch doctors for this department fresh every time the modal opens
  useEffect(() => {
    if (!isOpen || !appointment) return;

    // Reset all state
    setCurrentStep(0);
    setSelectedDoctor(null);
    setSelectedDateTime(null);
    clearSchedules();
    setTransferDetails({
      appointmentType: appointment.appointment_type || 'consultation',
      isOnlineConsultation: appointment.is_online_consultation || false,
      reason: '',
    });

    // Prefer department_id, fall back to _id
    const deptId =
      appointment.department?.department_id || appointment.department?._id;

    if (deptId) {
      getAllDoctors(deptId);
    }
  }, [isOpen, appointment?.appointment_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!appointment) return null;

  const handleDetailUpdate = (field, value) => {
    setTransferDetails(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!selectedDoctor;
      case 1:
        return !!selectedDateTime?.date && !!selectedDateTime?.slot;
      case 2:
        return !!transferDetails.reason.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(p => p + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(p => p - 1);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      // Fix: Use selectedDoctor instead of newDoctor
      const newDoctorName = selectedDoctor?.person
        ? `Dr. ${selectedDoctor.person.first_name} ${selectedDoctor.person.last_name}`
        : `Dr. ${selectedDoctor?.firstname || ''} ${selectedDoctor?.lastname || ''}`.trim();

      const payload = {
        original_appointment_id: appointment.appointment_id,
        new_doctor_uuid: selectedDoctor.staff_uuid,
        appointment_date: format(selectedDateTime.date, 'yyyy-MM-dd'),
        start_time: selectedDateTime.slot.time,
        appointment_type: transferDetails.appointmentType,
        is_online_consultation: transferDetails.isOnlineConsultation,
        reason: transferDetails.reason,
        notes: `Transferred to ${newDoctorName}: ${transferDetails.reason}`,
      };

      const response = await transferAppointment(payload);

      toast.success('Appointment transferred successfully');
      onUpdate?.(response?.data);
      window.dispatchEvent(new Event('refresh-today-appointments'));
      onClose();
    } catch (error) {
      const msg =
        error?.response?.data?.message || 'Failed to transfer appointment';
      toast.error(msg);
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    <DoctorSelectStep
      key="doctor"
      doctors={allDoctors}
      selectedDoctor={selectedDoctor}
      onSelect={setSelectedDoctor}
      originalDoctor={appointment.doctor}
      isLoading={isLoading}
      isDarkMode={isDarkMode}
    />,
    <DateTimeSelectStep
      key="datetime"
      selectedDoctor={selectedDoctor}
      originalAppointment={appointment}
      onDateTimeSelect={setSelectedDateTime}
      selectedDateTime={selectedDateTime}
      isDarkMode={isDarkMode}
    />,
    <ReasonStep
      key="reason"
      transferDetails={transferDetails}
      onUpdate={handleDetailUpdate}
      isDarkMode={isDarkMode}
    />,
    <ConfirmStep
      key="confirm"
      originalAppointment={appointment}
      newDoctor={selectedDoctor}
      selectedDateTime={selectedDateTime}
      transferDetails={transferDetails}
      isDarkMode={isDarkMode}
    />,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-[70] px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
            }}
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0"
              style={{
                borderBottom: `1px solid ${
                  isDarkMode ? COLORS.border.dark : COLORS.border.light
                }`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(234 179 8)' }}
                >
                  <ArrowRight size={18} className="text-white" />
                </div>
                <div>
                  <h2
                    className="text-base font-bold leading-tight"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Transfer Doctor
                  </h2>
                  <p
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {appointment.appointment_number}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : 'rgb(243 244 246)',
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-5 flex-shrink-0">
              <StepIndicator
                currentStep={currentStep}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                >
                  {steps[currentStep]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex gap-3 flex-shrink-0"
              style={{
                borderTop: `1px solid ${
                  isDarkMode ? COLORS.border.dark : COLORS.border.light
                }`,
              }}
            >
              <button
                onClick={currentStep === 0 ? onClose : handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : 'rgb(243 244 246)',
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                <ArrowLeft size={15} />
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: COLORS.info, color: 'white' }}
                >
                  Continue
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'rgb(234 179 8)', color: 'white' }}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Check size={15} />
                      Confirm Transfer
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransferDoctorModal;
