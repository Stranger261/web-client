import Modal from '../../../../components/ui/Modal';
import VitalsRecordingForm from './VitalsRecordingForm';

const VitalsRecordingModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Patient Vitals"
      size="lg"
    >
      <VitalsRecordingForm appointment={appointment} onSuccess={onSuccess} />
    </Modal>
  );
};

export default VitalsRecordingModal;
