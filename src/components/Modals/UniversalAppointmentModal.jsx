import Modal from './AppointmentModal';
import AppointmentDetails from '../appointments/AppointmentDetails';
import AppointmentForm from '../Form/AppointmentForm';

const UniversalAppointmentModal = ({
  isOpen,
  onClose,
  mode = 'view', // 'view', 'edit', 'create'
  appointment = null,
  currentUser,
  onSave,
  onCancel,
  onEdit,
  // Data for form dropdowns
  doctors = [],
  patients = [],
  timeSlots = [],
}) => {
  // Get modal title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Schedule New Appointment';
      case 'edit':
        return 'Edit Appointment';
      case 'view':
      default:
        return 'Appointment Details';
    }
  };

  // Get fields to show based on user role
  const getFieldsForRole = () => {
    switch (currentUser.role) {
      case 'receptionist':
        return [
          'patient',
          'mrn',
          'doctor',
          'date',
          'time',
          'status',
          'reason',
          'followUp',
          'createdDate',
          'createdAt',
          'updatedAt',
        ];
      case 'patient':
        return ['doctor', 'date', 'time', 'status', 'reason', 'followUp'];
      case 'doctor':
        return ['patient', 'date', 'time', 'status', 'reason', 'followUp'];
      default:
        return ['doctor', 'date', 'time', 'status', 'reason', 'followUp'];
    }
  };

  // Handle form save
  const handleFormSave = async formData => {
    try {
      await onSave(formData);
      onClose(); // Close modal on successful save
    } catch (error) {
      // Error handling is done in the form component
      console.error('Error saving appointment:', error);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    onClose();
  };

  // Render content based on mode
  const renderContent = () => {
    switch (mode) {
      case 'create':
      case 'edit':
        return (
          <AppointmentForm
            appointment={appointment}
            currentUser={currentUser}
            mode={mode}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            doctors={doctors}
            patients={patients}
            timeSlots={timeSlots}
          />
        );
      case 'view':
      default:
        return (
          <>
            <AppointmentDetails
              appointment={appointment}
              currentUser={currentUser}
              showFields={getFieldsForRole()}
            />
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <div className="max-h-[80vh] overflow-y-auto">{renderContent()}</div>
    </Modal>
  );
};

export default UniversalAppointmentModal;
