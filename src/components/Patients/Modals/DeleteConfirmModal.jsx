import Modal from '../../ui/Modal';
import { Button } from '../../ui/button';
import { COLORS } from '../../../configs/CONST';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  patient,
  onConfirm,
  isDarkMode,
}) => {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <div className="space-y-4">
        <p
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Are you sure you want to delete patient{' '}
          <strong>
            {patient.first_name} {patient.last_name}
          </strong>
          ?
        </p>
        <p
          className="text-sm"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          This action will soft delete the patient record and can be restored
          later.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Patient
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
