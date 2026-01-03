import Modal from '../../../../components/ui/Modal';
import PersonalInfoSection from './modals/PersonalInfoSection';
import ContactInfoSection from './modals/ContactInfoSection';
import AddressInfoSection from './modals/AddressInfoSection';
import InsuranceInfoSection from './modals/InsuranceInfoSection';
import MedicalRecordsSection from './modals/MedicalRecordsSection';
import AppointmentsSection from './modals/AppointmentsSection';

const PatientDetailsModal = ({
  isOpen,
  onClose,
  patient,
  expandedRecordId,
  onToggleRecord,
  isDarkMode,
}) => {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Details">
      <div className="space-y-6">
        <PersonalInfoSection patient={patient} isDarkMode={isDarkMode} />
        <ContactInfoSection patient={patient} isDarkMode={isDarkMode} />
        <AddressInfoSection patient={patient} isDarkMode={isDarkMode} />
        <InsuranceInfoSection patient={patient} isDarkMode={isDarkMode} />
        <MedicalRecordsSection
          patient={patient}
          expandedRecordId={expandedRecordId}
          onToggleRecord={onToggleRecord}
          isDarkMode={isDarkMode}
        />
        <AppointmentsSection patient={patient} isDarkMode={isDarkMode} />
      </div>
    </Modal>
  );
};

export default PatientDetailsModal;
