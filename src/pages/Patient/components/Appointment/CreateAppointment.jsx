// src/pages/CreateAppointment.jsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { useSchedule } from '../../../../contexts/ScheduleContext.jsx';
import { useAppointment } from '../../../../contexts/AppointmentContext.jsx';
import { useAuth } from '../../../../contexts/AuthContext.jsx';

import { DepartmentStep } from './Steps/DepartmentStep.jsx';
import { DoctorStep } from './Steps/DoctorStep.jsx';
import { DateTimeStep } from './Steps/DateTimeStep.jsx';
import { ReasonStep } from './Steps/ReasonStep.jsx';
import { ConfirmationStep } from './Steps/ConfirmationStep.jsx';

import InstructionBanner from './Steps/InstructionBanner.jsx';
import LoadingOverlay from '../../../../components/shared/LoadingOverlay';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner.jsx';
import { useSocket } from '../../../../contexts/SocketContext.jsx';
import { toastInfo } from '../../../../components/ui/toast-custom.jsx';

const CreateAppointment = ({ onClose }) => {
  const {
    allDoctors,
    departments,
    getDepartments,
    getAllDoctors,
    getDoctorAvailability,
    getCombinedSchedule,
    clearSchedules,
    isLoading,
  } = useSchedule();
  const { currentUser } = useAuth();
  const { bookUserAppointment, isBooking, refreshAppointments } =
    useAppointment();

  // for socket
  const { isConnected, socket } = useSocket();
  const currentRoomRef = useRef(new Set());

  const [currentStep, setCurrentStep] = useState(0);
  const [appointmentDetails, setAppointmentDetails] = useState({
    department: null,
    doctor: undefined,
    assignedDoctor: null,
    date: null,
    time: null,
    reason: '',
    isOnlineConsultation: false,
  });
  // for updates
  const [slotBeingBooked, setSlotBeingBooked] = useState(null);
  const [takenSlot, setTakenSlot] = useState(null);

  useEffect(() => {
    getDepartments();
    getAllDoctors();
  }, [getDepartments, getAllDoctors]);

  // for slot-taken
  useEffect(() => {
    if (!socket) return;

    const handleSlotTaken = data => {
      if (slotBeingBooked && slotBeingBooked.time === data.time) {
        setSlotBeingBooked(null);
        return;
      }

      const currentDate = appointmentDetails.date;
      if (!currentDate) return;

      const dateKey = format(currentDate, 'yyyy-MM-dd');

      if (dateKey === data.date) {
        setTakenSlot({
          time: data.time,
          date: data.date,
          doctor_uuid: data.doctor_uuid,
          timeStamp: Date.now(),
        });

        if (currentStep === 2) {
          toastInfo(`Time slot ${data.time} was just booked`);
        }
      }
    };

    socket.on('slot-taken', handleSlotTaken);

    return () => {
      socket.off('slot-taken', handleSlotTaken);
    };
  }, [
    socket,
    appointmentDetails.doctor,
    appointmentDetails.date,
    appointmentDetails.time,
    slotBeingBooked,
    currentStep,
  ]);

  const doctorsInSelectedDept = useMemo(() => {
    if (!appointmentDetails.department || !allDoctors) return [];
    return allDoctors.filter(
      doc => doc.department?._id === appointmentDetails.department._id
    );
  }, [appointmentDetails.department, allDoctors]);

  const handleSelect = (field, value) => {
    setAppointmentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleDoctorSelect = doctor => {
    handleSelect('doctor', doctor);

    const currentMonth = format(new Date(), 'yyyy-MM');
    if (doctor) {
      getDoctorAvailability(doctor.staff_uuid, currentMonth);
    } else if (appointmentDetails.department) {
      getCombinedSchedule(appointmentDetails.department._id, currentMonth);
    }
    nextStep();
  };

  const handleDateSelect = date => {
    handleSelect('date', date);
  };

  // FIX: This now accepts a single object argument and destructures it.
  const handleDateTimeSelect = ({ time, assignedDoctor }) => {
    handleSelect('time', time);
    if (assignedDoctor) {
      handleSelect('assignedDoctor', assignedDoctor);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const finalDoctorId =
      appointmentDetails.doctor?._id || appointmentDetails.assignedDoctor;

    if (!finalDoctorId) {
      return toast.error(
        'Error: A doctor could not be assigned. Please try again.'
      );
    }

    const payload = {
      person_id: currentUser.person.person_id,
      department_id: appointmentDetails.department?.department_id,
      doctor_uuid:
        appointmentDetails.doctor?.staff_uuid ||
        appointmentDetails.time.doctor_uuid,
      appointment_date: appointmentDetails.time?.date,
      is_online_consultation: appointmentDetails.isOnlineConsultation,
      start_time: appointmentDetails.time?.time,
      end_time: null,
      reason: appointmentDetails.reason,
    };

    setSlotBeingBooked(appointmentDetails.time?.time);

    try {
      const res = await bookUserAppointment(payload);
      await refreshAppointments(currentUser.patient.patient_uuid);

      if (currentRoomRef.current && socket) {
        const doctor = appointmentDetails.doctor;
        const date = appointmentDetails.date;

        if (doctor && date) {
          socket.emit('leave-appointment-room', {
            doctor_uuid: doctor.staff_uuid,
            date: format(date, 'yyyy-MM-dd'),
          });
          currentRoomRef.current = null;
        }
      }

      nextStep();
      toast.success(res.message);
    } catch (error) {
      toast.error(`Booking failed: ${error.message || 'Something went wrong'}`);
      setSlotBeingBooked(null);
    }
  };

  const nextStep = () => setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
  const prevStep = () => {
    if (currentStep === 2) {
      clearSchedules();

      // leave room if go back to step before date and time
      if (currentRoomRef.current && socket) {
        const doctor = appointmentDetails.doctor;
        const date = appointmentDetails.date;

        if (doctor && date) {
          socket.emit('leave-appointment-room', {
            doctor_uuid: doctor.staff_uuid,
            date: format(date, 'yyyy-MM-dd'),
          });
          currentRoomRef.current = null;
        }
      }
    }
    setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));
  };

  const resetFlow = async () => {
    setCurrentStep(0);
    setAppointmentDetails({
      department: null,
      doctor: undefined,
      assignedDoctor: null,
      date: null,
      time: null,
      reason: '',
    });
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DepartmentStep
            onSelect={dept => {
              handleSelect('department', dept);
              nextStep();
            }}
            selected={appointmentDetails.department}
            departments={departments}
          />
        );
      case 1:
        return (
          <DoctorStep
            onSelect={handleDoctorSelect}
            doctors={doctorsInSelectedDept}
            selectedDoctor={appointmentDetails.doctor}
            selectedDept={appointmentDetails.department}
          />
        );
      case 2:
        return (
          <DateTimeStep
            selectedDoctor={appointmentDetails.doctor}
            selectedDepartment={appointmentDetails.department}
            onDateTimeSelect={handleDateTimeSelect}
            onDateSelect={handleDateSelect}
            takenSlot={takenSlot}
          />
        );
      case 3:
        return (
          <ReasonStep
            onSelect={handleSelect}
            reason={appointmentDetails.reason}
            isOnlineConsultation={appointmentDetails.isOnlineConsultation}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            details={appointmentDetails}
            onClose={onClose}
            onReset={resetFlow}
          />
        );
      default:
        return <p>Welcome</p>;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !appointmentDetails.department;
      case 1:
        return appointmentDetails.doctor === undefined;
      case 2:
        return !appointmentDetails.date || !appointmentDetails.time;
      case 3:
        return false; // Reason is optional
      default:
        return true;
    }
  };

  if (isLoading && (!departments.length || !allDoctors.length)) {
    return <LoadingOverlay />;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full">
        <InstructionBanner currentStep={currentStep} />
      </div>
      <div className="mt-8 p-8 bg-white rounded-2xl shadow-md w-full max-w-6xl">
        {getStepContent()}
      </div>
      {currentStep < 4 && (
        <div className="mt-8 flex w-full max-w-4xl justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={currentStep === 3 ? handleSubmit : nextStep}
            disabled={isBooking || isNextDisabled()}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isBooking && currentStep === 3 ? (
              <>
                <LoadingSpinner /> Booking...
              </>
            ) : currentStep === 3 ? (
              'Confirm Appointment'
            ) : (
              'Next'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateAppointment;
