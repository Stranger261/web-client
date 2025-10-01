import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import Modal from './AppointmentModal';
import { useSchedule } from '../../context/ScheduleContext.jsx';
import { useAppointments } from '../../context/AppointmentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePatient } from '../../context/PatientContext.jsx';

import { PatientStep } from '../Steps/PatientStep.jsx';
import { DepartmentStep } from '../Steps/DepartmentStep.jsx';
import { DoctorStep } from '../Steps/DoctorStep.jsx';
import { DateTimeStep } from '../Steps/DateTimeStep.jsx';
import { ReasonStep } from '../Steps/ReasonStep.jsx';
import { ReceptionistConfirmationStep } from '../Steps/ReceptionistConfirmationStep.jsx';

import Spinner from '../generic/Spinner.jsx';

const AppointmentSchedulerModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialPatient = null,
  mode = 'create', // 'create' or 'edit'
  existingAppointment = null, // Pass existing appointment for edit mode
}) => {
  const {
    allDoctors,
    departments,
    getDepartments,
    getDoctors,
    getSchedule,
    getCombinedSchedule,
    clearSchedules,
    isLoading: scheduleLoading,
  } = useSchedule();

  const {
    bookUserAppointment,
    isCreating,
    getPatientAppointmentHistory,
    createReceptionistAppointment,
    updateAppointmentDetails, // Add this to your context
  } = useAppointments();

  const { currentUser } = useAuth();
  const { getAllPatients, patients, isLoading: patientsLoading } = usePatient();

  const [currentStep, setCurrentStep] = useState(0);
  const [appointmentDetails, setAppointmentDetails] = useState({
    patient: initialPatient,
    isFollowUp: false,
    previousAppointments: [],
    department: null,
    doctor: undefined,
    assignedDoctor: null,
    date: null,
    time: null,
    reason: '',
    priority: 'normal',
    notes: '',
    status: 'scheduled',
  });

  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isLoadingPatientHistory, setIsLoadingPatientHistory] = useState(false);

  // NEW: Initialize with existing appointment data in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && existingAppointment) {
      initializeEditMode(existingAppointment);
    }
  }, [isOpen, mode, existingAppointment]);

  // NEW: Function to initialize edit mode
  const initializeEditMode = async appointment => {
    try {
      // Load necessary data
      await Promise.all([getDepartments(), getDoctors(), getAllPatients()]);

      // Find the patient from the appointment
      const patient = appointment.createdBy || appointment.patient;

      // Parse the date
      const appointmentDate = new Date(appointment.appointmentDate);

      // Find department and doctor
      const department =
        departments?.find(d => d._id === appointment.doctor?.department) ||
        null;
      const doctor =
        allDoctors?.find(d => d._id === appointment.doctor?._id) || null;

      // Load patient history
      if (patient) {
        const history = await getPatientAppointmentHistory(
          patient._id || patient.id
        );

        setAppointmentDetails({
          patient: patient,
          isFollowUp: appointment.isFollowUp || false,
          previousAppointments: history || [],
          department: department,
          doctor: doctor,
          assignedDoctor: appointment.doctor?._id,
          date: appointmentDate,
          time: appointment.timeSlot,
          reason: appointment.reasonForVisit || '',
          priority: appointment.priority || 'normal',
          notes: appointment.notes || '',
          status: appointment.status || 'scheduled',
        });
      }

      // In edit mode, start from department selection (step 1)
      // This allows rescheduling date/time and changing doctor
      setCurrentStep(1);
    } catch (error) {
      console.error('Error initializing edit mode:', error);
      toast.error('Failed to load appointment details');
    }
  };

  // Initialize data when modal opens (CREATE MODE)
  useEffect(() => {
    if (isOpen && mode === 'create') {
      getDepartments();
      getDoctors();
      getAllPatients();

      if (initialPatient) {
        setCurrentStep(1);
        loadPatientHistory(initialPatient);
      } else {
        setCurrentStep(0);
      }
    }
  }, [
    isOpen,
    mode,
    initialPatient,
    getDepartments,
    getDoctors,
    getAllPatients,
  ]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setCurrentStep(0);
    setPatientSearchTerm('');
    setAppointmentDetails({
      patient: null,
      isFollowUp: false,
      previousAppointments: [],
      department: null,
      doctor: undefined,
      assignedDoctor: null,
      date: null,
      time: null,
      reason: '',
      priority: 'normal',
      notes: '',
      status: 'scheduled',
    });
  };

  const loadPatientHistory = async patient => {
    setIsLoadingPatientHistory(true);
    try {
      const history = await getPatientAppointmentHistory(
        patient._id || patient.id
      );
      const isFollowUp = history && history.length > 0;

      setAppointmentDetails(prev => ({
        ...prev,
        patient,
        previousAppointments: history || [],
        isFollowUp,
        ...(isFollowUp &&
          history.length > 0 && {
            department: history[0].department || prev.department,
            doctor: history[0].doctor || prev.doctor,
          }),
      }));

      if (isFollowUp && history.length > 0) {
        toast.success(`Follow-up detected! Pre-selected previous doctor.`);
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      setAppointmentDetails(prev => ({
        ...prev,
        patient,
        isFollowUp: false,
        previousAppointments: [],
      }));
    } finally {
      setIsLoadingPatientHistory(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm || !patients) {
      return patients || [];
    }

    const searchLower = patientSearchTerm.toLowerCase();
    const results = patients.filter(
      patient =>
        patient.fullName?.toLowerCase().includes(searchLower) ||
        patient.firstname?.toLowerCase().includes(searchLower) ||
        patient.lastname?.toLowerCase().includes(searchLower) ||
        patient.mrn?.toLowerCase().includes(searchLower)
    );

    return results;
  }, [patients, patientSearchTerm]);

  const doctorsInSelectedDept = useMemo(() => {
    if (!appointmentDetails.department || !allDoctors) return [];
    return allDoctors.filter(
      doc => doc.department?._id === appointmentDetails.department._id
    );
  }, [appointmentDetails.department, allDoctors]);

  const handleSelect = (field, value) => {
    setAppointmentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = async patient => {
    await loadPatientHistory(patient);
    nextStep();
  };

  const handleDoctorSelect = doctor => {
    console.log(doctor);
    handleSelect('doctor', doctor);
    const currentMonth = format(new Date(), 'yyyy-MM');
    if (doctor) {
      getSchedule(doctor._id, currentMonth);
    } else if (appointmentDetails.department) {
      getCombinedSchedule(appointmentDetails.department._id, currentMonth);
    }
    nextStep();
  };

  const handleDateTimeSelect = ({ date, time, assignedDoctor }) => {
    handleSelect('date', date);
    handleSelect('time', time);
    if (assignedDoctor) {
      handleSelect('assignedDoctor', assignedDoctor);
    }
  };

  // NEW: Modified submit handler to support both create and edit
  const handleSubmit = async e => {
    e.preventDefault();

    const finalDoctorId =
      appointmentDetails.doctor?._id || appointmentDetails.assignedDoctor;

    if (!finalDoctorId) {
      return toast.error(
        'Error: A doctor could not be assigned. Please try again.'
      );
    }

    if (!appointmentDetails.patient) {
      return toast.error('Error: Patient selection is required.');
    }

    const payload = {
      patientId:
        appointmentDetails.patient._id || appointmentDetails.patient.id,
      department: appointmentDetails.department?._id,
      doctor: finalDoctorId,
      appointmentDate: appointmentDetails.date,
      timeSlot: appointmentDetails.time,
      reasonForVisit: appointmentDetails.reason,
      isFollowUp: appointmentDetails.isFollowUp,
      priority: appointmentDetails.priority,
      notes: appointmentDetails.notes,
      status: appointmentDetails.status,
      // Only include createdBy for new appointments
      ...(mode === 'create' && { createdBy: currentUser._id }),
      // Add updatedBy for edits
      ...(mode === 'edit' && { updatedBy: currentUser._id }),
      patientDetails: {
        firstname: appointmentDetails.patient.firstname,
        lastname: appointmentDetails.patient.lastname,
        middlename: appointmentDetails.patient.middlename,
        phone: appointmentDetails.patient.phone,
        email: appointmentDetails.patient.email,
        dateOfBirth: appointmentDetails.patient.dateOfBirth,
        gender: appointmentDetails.patient.gender,
        mrn: appointmentDetails.patient.medicalRecordNumber,
        address: appointmentDetails.patient.address,
      },
    };

    try {
      let res;

      if (mode === 'edit') {
        // UPDATE existing appointment
        console.log('Update Payload:', payload);
        res = await updateAppointmentDetails(existingAppointment._id, payload);
        toast.success('Appointment updated successfully!');
      } else {
        // CREATE new appointment
        if (currentUser.role === 'patient') {
          res = await bookUserAppointment(payload);
        } else if (currentUser.role === 'receptionist') {
          console.log('Create Payload:', payload);
          res = await createReceptionistAppointment(payload);
        }
        toast.success(
          `Appointment scheduled successfully for ${appointmentDetails.patient.fullName}`
        );
      }

      nextStep();
      onSuccess?.(res);
    } catch (error) {
      toast.error(
        `${mode === 'edit' ? 'Update' : 'Booking'} failed: ${
          error.message || 'Something went wrong'
        }`
      );
    }
  };

  const nextStep = () => setCurrentStep(prev => (prev < 5 ? prev + 1 : prev));

  const prevStep = () => {
    if (currentStep === 3) {
      clearSchedules();
    }
    setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleClose = () => {
    if (currentStep === 5) {
      onClose();
    } else {
      if (
        window.confirm(
          'Are you sure you want to cancel? All progress will be lost.'
        )
      ) {
        onClose();
      }
    }
  };

  const handleNewAppointment = () => {
    resetModal();
    setCurrentStep(0);
  };

  // NEW: Modified title to reflect mode
  const getModalTitle = () => {
    const prefix = mode === 'edit' ? 'Edit' : 'Schedule';
    const steps = [
      'Select Patient',
      'Choose Department',
      'Select Doctor',
      'Pick Date & Time',
      'Appointment Details',
      'Confirmation',
    ];

    if (currentStep < steps.length) {
      return `${prefix} Appointment - ${steps[currentStep]}`;
    }
    return `${prefix} Appointment`;
  };

  const getStepProgress = () => {
    return `Step ${currentStep + 1} of 6`;
  };

  const renderStepContent = () => {
    // Skip patient selection step in edit mode
    if (mode === 'edit' && currentStep === 0) {
      return null;
    }

    switch (currentStep) {
      case 0:
        return (
          <PatientStep
            onSelect={handlePatientSelect}
            selected={appointmentDetails.patient}
            patients={filteredPatients}
            searchTerm={patientSearchTerm}
            onSearchChange={setPatientSearchTerm}
            isLoadingHistory={isLoadingPatientHistory}
          />
        );
      case 1:
        return (
          <DepartmentStep
            onSelect={dept => {
              handleSelect('department', dept);
              nextStep();
            }}
            selected={appointmentDetails.department}
            departments={departments}
            isFollowUp={appointmentDetails.isFollowUp}
            previousAppointments={appointmentDetails.previousAppointments}
          />
        );
      case 2:
        return (
          <DoctorStep
            onSelect={handleDoctorSelect}
            doctors={doctorsInSelectedDept}
            selectedDoctor={appointmentDetails.doctor}
            selectedDept={appointmentDetails.department}
            isFollowUp={appointmentDetails.isFollowUp}
            previousAppointments={appointmentDetails.previousAppointments}
          />
        );
      case 3:
        return (
          <DateTimeStep
            selectedDoctor={appointmentDetails.doctor}
            selectedDepartment={appointmentDetails.department}
            onDateTimeSelect={handleDateTimeSelect}
          />
        );
      case 4:
        return (
          <ReasonStep
            onSelect={handleSelect}
            reason={appointmentDetails.reason}
            priority={appointmentDetails.priority}
            notes={appointmentDetails.notes}
            status={appointmentDetails.status}
            isReceptionist={true}
            isFollowUp={appointmentDetails.isFollowUp}
            previousAppointments={appointmentDetails.previousAppointments}
            mode={mode} // Pass mode to ReasonStep
          />
        );
      case 5:
        return (
          <ReceptionistConfirmationStep
            details={appointmentDetails}
            onReset={handleNewAppointment}
            mode={mode}
          />
        );
      default:
        return <p>Loading...</p>;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !appointmentDetails.patient || isLoadingPatientHistory;
      case 1:
        return !appointmentDetails.department;
      case 2:
        return appointmentDetails.doctor === undefined;
      case 3:
        return !appointmentDetails.date || !appointmentDetails.time;
      case 4:
        return false;
      default:
        return true;
    }
  };

  const isLoading = scheduleLoading || patientsLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="xl"
      showCloseButton={currentStep !== 5}
    >
      <div className="max-h-[80vh] overflow-hidden flex flex-col">
        {/* Progress Header */}
        {currentStep < 5 && (
          <div className="flex-shrink-0 pb-4 border-b border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {getStepProgress()}
                {appointmentDetails.patient && (
                  <span className="ml-4">
                    Patient:{' '}
                    <strong>{appointmentDetails.patient.fullName}</strong>
                    {appointmentDetails.isFollowUp && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Follow-up
                      </span>
                    )}
                    {mode === 'edit' && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                        Editing
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && currentStep === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Footer Buttons */}
        {currentStep < 5 && (
          <div className="flex-shrink-0 flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={prevStep}
              disabled={
                currentStep === 0 || (mode === 'edit' && currentStep === 4)
              }
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                Cancel
              </button>

              <button
                onClick={currentStep === 4 ? handleSubmit : nextStep}
                disabled={isCreating || isNextDisabled()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCreating && currentStep === 4 ? (
                  <>
                    <Spinner size="small" />
                    <span className="ml-2">
                      {mode === 'edit' ? 'Updating...' : 'Scheduling...'}
                    </span>
                  </>
                ) : currentStep === 4 ? (
                  mode === 'edit' ? (
                    'Update Appointment'
                  ) : (
                    'Schedule Appointment'
                  )
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AppointmentSchedulerModal;
