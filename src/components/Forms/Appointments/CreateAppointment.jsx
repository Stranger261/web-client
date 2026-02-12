import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { usePatient } from '../../../contexts/PatientContext';

// Import steps
import { PatientStep } from './Steps/PatientStep';
import { DepartmentStep } from './Steps/DepartmentStep';
import { DoctorStep } from './Steps/DoctorStep';
import { DateTimeStep } from './Steps/DateTimeStep';
import { ReasonStep } from './Steps/ReasonStep';
import { ConfirmationStep } from './Steps/ConfirmationStep';
import InstructionBanner from './Steps/InstructionBanner';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

const CreateAppointment = ({
  onClose,
  onSubmit,
  userRole = 'patient',
  departments = [],
  allDoctors = [],
  isLoading = false,
  isSubmitting = false,
  selectedPatient = null,
  isFollowUp = false,
  previousAppointments = [],
  onGetDoctorAvailability,
  onGetCombinedSchedule,
  onClearSchedules,
  socket = null,
  isConnected = false,
  modalRef,
}) => {
  const { currentUser } = useAuth();
  const { getPatient } = usePatient();

  const [patients, setPatients] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [takenSlot, setTakenSlot] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  const [appointmentDetails, setAppointmentDetails] = useState({
    patient: userRole === 'receptionist' ? selectedPatient : currentUser,
    department: null,
    doctor: userRole === 'patient' ? undefined : null,
    assignedDoctor: null,
    date: null,
    time: null,
    reason: '',
    appointmentType: 'consultation',
    isOnlineConsultation: false,
    priority: 'normal',
    status: 'scheduled',
    notes: '',
  });

  // Scroll to top when step changes - use modalRef instead of creating another scroll container
  useEffect(() => {
    if (modalRef?.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [currentStep, modalRef]);

  useEffect(() => {
    const searchPatient = async () => {
      try {
        if (!patientSearchTerm.trim()) return;
        const patient = await getPatient(patientSearchTerm);
        setPatients(patient);
      } catch (error) {
        console.error(error);
        toast.error('Error searching for patient');
      }
    };
    searchPatient();
  }, [patientSearchTerm, getPatient]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleSlotTaken = data => {
      const currentDate = appointmentDetails.date;
      if (!currentDate) return;

      const dateKey = new Date(currentDate).toISOString().split('T')[0];

      if (dateKey === data.date) {
        setTakenSlot({
          time: data.time,
          date: data.date,
          doctor_uuid: data.doctor_uuid,
          timeStamp: Date.now(),
        });
      }
    };

    socket.on('slot-taken', handleSlotTaken);
    return () => socket.off('slot-taken', handleSlotTaken);
  }, [socket, isConnected, appointmentDetails.date]);

  const handleSelect = (field, value) => {
    setAppointmentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = patient => {
    handleSelect('patient', patient);
    if (userRole === 'receptionist') {
      nextStep();
    }
  };

  const handleDepartmentSelect = department => {
    handleSelect('department', department);
    nextStep();
  };

  const handleDoctorSelect = doctor => {
    handleSelect('doctor', doctor);

    const currentMonth = format(new Date(), 'yyyy-MM');

    if (doctor) {
      onGetDoctorAvailability(doctor.staff_uuid, currentMonth);
    } else if (appointmentDetails.department) {
      onGetCombinedSchedule(appointmentDetails.department._id, currentMonth);
    }

    nextStep();
  };

  const handleDateSelect = date => {
    handleSelect('date', date);
  };

  const handleDateTimeSelect = ({ time, assignedDoctor }) => {
    handleSelect('time', time);
    if (assignedDoctor) {
      handleSelect('assignedDoctor', assignedDoctor);
    }
    nextStep();
  };

  const preparePayload = () => {
    const basePayload = {
      appointment_type: appointmentDetails.appointmentType,
      is_online_consultation: appointmentDetails.isOnlineConsultation,
      reason: appointmentDetails.reason,
      department_id: appointmentDetails.department?.department_id,
      appointment_date:
        appointmentDetails.time?.date || appointmentDetails.date,
      start_time: appointmentDetails.time?.time,
    };

    if (userRole === 'patient') {
      return {
        ...basePayload,
        person_id: currentUser?.person?.person_id,
        doctor_uuid:
          appointmentDetails.doctor?.staff_uuid ||
          appointmentDetails.assignedDoctor,
      };
    }

    if (userRole === 'receptionist') {
      return {
        ...basePayload,
        person_id: appointmentDetails.patient?.person?.person_id,
        doctor_uuid:
          appointmentDetails.doctor?.staff_uuid ||
          appointmentDetails.assignedDoctor,
        priority: appointmentDetails.priority,
        status: appointmentDetails.status,
        notes: appointmentDetails.notes,
        created_by: currentUser?.id,
        created_by_type: 'staff',
      };
    }

    if (userRole === 'doctor' || userRole === 'nurse') {
      return {
        ...basePayload,
        patient_id: appointmentDetails.patient?.patient_id,
        doctor_uuid:
          appointmentDetails.doctor?.staff_uuid ||
          appointmentDetails.assignedDoctor,
        notes: appointmentDetails.notes,
        created_by: currentUser?.id,
        created_by_type: userRole,
      };
    }

    return basePayload;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!appointmentDetails.reason.trim()) {
      toast.error('Please provide a reason for the appointment');
      return;
    }

    if (userRole === 'receptionist' && !appointmentDetails.patient) {
      toast.error('Please select a patient');
      return;
    }

    const payload = preparePayload();

    try {
      console.log(payload);
      await onSubmit(payload);
      nextStep();
    } catch (error) {
      toast.error(error.message || 'Failed to create appointment');
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => (prev < totalSteps ? prev + 1 : prev));
  };

  const prevStep = () => {
    const isReceptionistDateTimeStep =
      userRole === 'receptionist' && currentStep === 3;
    const isPatientDateTimeStep = userRole === 'patient' && currentStep === 2;

    if (isReceptionistDateTimeStep || isPatientDateTimeStep) {
      if (onClearSchedules) {
        onClearSchedules();
      }

      setAppointmentDetails(prev => ({
        ...prev,
        date: null,
        time: null,
        assignedDoctor: null,
      }));

      if (socket && isConnected) {
        const doctor = appointmentDetails.doctor;
        const date = appointmentDetails.date;

        if (doctor && date) {
          socket.emit('leave-appointment-room', {
            doctor_uuid: doctor.staff_uuid,
            date: format(date, 'yyyy-MM-dd'),
          });
        }
      }
    }

    const isReceptionistDoctorStep =
      userRole === 'receptionist' && currentStep === 2;
    const isPatientDoctorStep = userRole === 'patient' && currentStep === 1;

    if (isReceptionistDoctorStep || isPatientDoctorStep) {
      setAppointmentDetails(prev => ({
        ...prev,
        doctor: userRole === 'patient' ? undefined : null,
        assignedDoctor: null,
      }));
    }

    setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setAppointmentDetails({
      patient: userRole === 'receptionist' ? selectedPatient : currentUser,
      department: null,
      doctor: userRole === 'patient' ? undefined : null,
      assignedDoctor: null,
      date: null,
      time: null,
      reason: '',
      appointmentType: 'consultation',
      isOnlineConsultation: false,
      priority: 'normal',
      status: 'scheduled',
      notes: '',
    });
  };

  const totalSteps = userRole === 'receptionist' ? 5 : 4;
  // Fix: Patient should show currentStep + 1, not + 2
  const displayStep = currentStep + 1;
  const totalDisplaySteps = userRole === 'receptionist' ? 6 : 5;

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return userRole === 'receptionist'
          ? !appointmentDetails.patient
          : !appointmentDetails.department;
      case 1:
        return userRole === 'receptionist'
          ? !appointmentDetails.department
          : appointmentDetails.doctor === undefined;
      case 2:
        return userRole === 'receptionist'
          ? appointmentDetails.doctor === undefined
          : !appointmentDetails.date || !appointmentDetails.time;
      case 3:
        return userRole === 'receptionist'
          ? !appointmentDetails.date || !appointmentDetails.time
          : !appointmentDetails.reason.trim();
      case 4:
        return !appointmentDetails.reason.trim();
      default:
        return false;
    }
  };

  const doctorsInSelectedDept = useMemo(() => {
    if (!appointmentDetails.department || !allDoctors) return [];
    return allDoctors.filter(
      doc => doc.department?._id === appointmentDetails.department._id,
    );
  }, [appointmentDetails.department, allDoctors]);

  const getStepContent = () => {
    if (userRole !== 'patient') {
      switch (currentStep) {
        case 0:
          return (
            <PatientStep
              onSelect={handlePatientSelect}
              selected={appointmentDetails.patient}
              patients={patients}
              searchTerm={patientSearchTerm}
              onSearchChange={setPatientSearchTerm}
              isLoading={isLoading}
            />
          );
        case 1:
          return (
            <DepartmentStep
              onSelect={handleDepartmentSelect}
              selected={appointmentDetails.department}
              departments={departments}
              isFollowUp={isFollowUp}
              previousAppointments={previousAppointments}
            />
          );
        case 2:
          return (
            <DoctorStep
              onSelect={handleDoctorSelect}
              doctors={doctorsInSelectedDept}
              selectedDoctor={appointmentDetails.doctor}
              selectedDept={appointmentDetails.department}
              isFollowUp={isFollowUp}
              previousAppointments={previousAppointments}
              userRole={userRole}
            />
          );
        case 3:
          return (
            <DateTimeStep
              selectedDoctor={appointmentDetails.doctor}
              selectedDepartment={appointmentDetails.department}
              onDateTimeSelect={handleDateTimeSelect}
              onDateSelect={handleDateSelect}
              takenSlot={takenSlot}
              userRole={userRole}
            />
          );
        case 4:
          return (
            <ReasonStep
              onSelect={handleSelect}
              reason={appointmentDetails.reason}
              appointmentType={appointmentDetails.appointmentType}
              isOnlineConsultation={appointmentDetails.isOnlineConsultation}
              priority={appointmentDetails.priority}
              status={appointmentDetails.status}
              notes={appointmentDetails.notes}
              userRole={userRole}
              isFollowUp={isFollowUp}
              previousAppointments={previousAppointments}
            />
          );
        case 5:
          return (
            <ConfirmationStep
              details={appointmentDetails}
              onClose={onClose}
              onReset={resetFlow}
              userRole={userRole}
            />
          );
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 0:
          return (
            <DepartmentStep
              onSelect={handleDepartmentSelect}
              selected={appointmentDetails.department}
              departments={departments}
              isFollowUp={isFollowUp}
              previousAppointments={previousAppointments}
            />
          );
        case 1:
          return (
            <DoctorStep
              onSelect={handleDoctorSelect}
              doctors={doctorsInSelectedDept}
              selectedDoctor={appointmentDetails.doctor}
              selectedDept={appointmentDetails.department}
              isFollowUp={isFollowUp}
              previousAppointments={previousAppointments}
              userRole={userRole}
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
              userRole={userRole}
            />
          );
        case 3:
          return (
            <ReasonStep
              onSelect={handleSelect}
              reason={appointmentDetails.reason}
              appointmentType={appointmentDetails.appointmentType}
              isOnlineConsultation={appointmentDetails.isOnlineConsultation}
              priority={appointmentDetails.priority}
              status={appointmentDetails.status}
              notes={appointmentDetails.notes}
              userRole={userRole}
              isFollowUp={isFollowUp}
              previousAppointments={previousAppointments}
            />
          );
        case 4:
          return (
            <ConfirmationStep
              details={appointmentDetails}
              onClose={onClose}
              onReset={resetFlow}
              userRole={userRole}
            />
          );
        default:
          return null;
      }
    }
  };

  if (isLoading && (!departments.length || !allDoctors.length)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header - Progress Banner */}
      <div className="flex-shrink-0 mb-4">
        <InstructionBanner
          currentStep={displayStep}
          totalSteps={totalDisplaySteps}
          userRole={userRole}
          isFollowUp={isFollowUp}
        />
      </div>

      {/* Scrollable Content - Let the modal handle scrolling */}
      <div className="flex-1 min-h-0">{getStepContent()}</div>

      {/* Fixed Footer - Navigation Buttons */}
      {currentStep < (userRole === 'receptionist' ? 5 : 4) && (
        <div className="flex-shrink-0 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <button
            onClick={
              currentStep === (userRole === 'receptionist' ? 4 : 3)
                ? handleSubmit
                : nextStep
            }
            disabled={isSubmitting || isNextDisabled()}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                {userRole === 'receptionist' ? 'Creating...' : 'Booking...'}
              </>
            ) : currentStep === (userRole === 'receptionist' ? 4 : 3) ? (
              userRole === 'receptionist' ? (
                'Create Appointment'
              ) : (
                'Confirm Appointment'
              )
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
