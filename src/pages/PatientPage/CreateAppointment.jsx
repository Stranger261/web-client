// src/pages/CreateAppointment.jsx

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { useSchedule } from '../../context/ScheduleContext.jsx';
import { useAppointments } from '../../context/AppointmentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

import { DepartmentStep } from '../../components/Steps/DepartmentStep.jsx';
import { DoctorStep } from '../../components/Steps/DoctorStep.jsx';
import { DateTimeStep } from '../../components/Steps/DateTimeStep.jsx';
import { ReasonStep } from '../../components/Steps/ReasonStep.jsx';
import { ConfirmationStep } from '../../components/Steps/ConfirmationStep.jsx';

import InstructionBanner from '../../components/generic/InstructionBanner.jsx';
import LoadingOverlay from '../../components/generic/LoadingOverlay';
import Spinner from '../../components/generic/Spinner.jsx';

const CreateAppointment = () => {
  const {
    allDoctors,
    departments,
    getDepartments,
    getDoctors,
    getSchedule,
    getCombinedSchedule,
    clearSchedules,
    isLoading,
  } = useSchedule();
  const { bookUserAppointment, isBooking, refreshAppointments } =
    useAppointments();
  const { currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [appointmentDetails, setAppointmentDetails] = useState({
    department: null,
    doctor: undefined, // Initial state for "no choice made"
    assignedDoctor: null, // For the "Any Doctor" flow
    date: null,
    time: null,
    reason: '',
  });

  useEffect(() => {
    getDepartments();
    getDoctors();
  }, [getDepartments, getDoctors]);

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
      getSchedule(doctor._id, currentMonth);
    } else if (appointmentDetails.department) {
      getCombinedSchedule(appointmentDetails.department._id, currentMonth);
    }
    nextStep();
  };

  // FIX: This now accepts a single object argument and destructures it.
  const handleDateTimeSelect = ({ date, time, assignedDoctor }) => {
    handleSelect('date', date);
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
      department: appointmentDetails.department?._id,
      doctor: finalDoctorId,
      userId: currentUser._id,
      appointmentDate: appointmentDetails.date,
      timeSlot: appointmentDetails.time,
      reasonForVisit: appointmentDetails.reason,
      dateOfBirth: currentUser.dateOfBirth,
      gender: currentUser.gender,
      firstname: currentUser.firstname,
      lastname: currentUser.lastname,
      middlename: currentUser.middlename,
      phone: currentUser.phone,
      address: currentUser.address,
      city: currentUser.city,
      zipCode: currentUser.zipCode,
    };

    try {
      const res = await bookUserAppointment(payload);
      nextStep();
      toast.success(res.message);
    } catch (error) {
      toast.error(`Booking failed: ${error.message || 'Something went wrong'}`);
    }
  };

  const nextStep = () => setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
  const prevStep = () => {
    if (currentStep === 2) {
      clearSchedules();
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
          />
        );
      case 3:
        return (
          <ReasonStep
            onSelect={handleSelect}
            reason={appointmentDetails.reason}
          />
        );
      case 4:
        return (
          <ConfirmationStep details={appointmentDetails} onReset={resetFlow} />
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
      <div className="mt-8 p-8 bg-white rounded-2xl shadow-md w-full max-w-4xl">
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
                <Spinner /> Booking...
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
