import Modal from '../../../ui/Modal';
import ProgressNoteForm from '../forms/ProgressNoteForm';

const ProgressNoteModal = ({
  isOpen,
  onClose,
  admission,
  onSubmit,
  loading = false,
  initialData = null,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Amend Progress Note' : 'New Progress Note'}
    >
      <ProgressNoteForm
        admission={admission}
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        initialData={initialData}
      />
    </Modal>
  );
};

export default ProgressNoteModal;
