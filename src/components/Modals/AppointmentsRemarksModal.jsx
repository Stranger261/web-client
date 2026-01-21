import { Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import AppointmentHeader from '../../pages/Doctor/components/Appointment/AppointmentHeader';
import ChiefComplaintSection from '../../pages/Doctor/components/Appointment/forms/ChiefComplaintSection';
import VitalSignsSection from '../../pages/Doctor/components/Appointment/forms/VitalSignsSection';
import DiagnosisSection from '../../pages/Doctor/components/Appointment/forms/DiagnosisSection';
import TreatmentSection from '../../pages/Doctor/components/Appointment/forms/TreatmentSection';
import FollowUpSection from '../../pages/Doctor/components/Appointment/forms/FollowUpSection';
import NotesSection from '../../pages/Doctor/components/Appointment/forms/NoteSection';
import { useAppointmentRemarks } from '../../pages/Doctor/components/Appointment/hooks/useAppointmentRemarks';
import { COLORS } from '../../configs/CONST';

const AppointmentRemarksModal = ({ isOpen, onClose, appointment, onSave }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const {
    formData,
    errors,
    isSaving,
    saveSuccess,
    handleFieldChange,
    handleVitalSignChange,
    handleSave,
  } = useAppointmentRemarks(appointment);

  const handleSubmit = async () => {
    const success = await handleSave(onSave);
    if (success) {
      setTimeout(onClose, 1500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consultation Notes & Remarks"
    >
      <div className="space-y-6">
        <AppointmentHeader appointment={appointment} />

        <ChiefComplaintSection
          value={formData.chiefComplaint}
          onChange={value => handleFieldChange('chiefComplaint', value)}
          error={errors.chiefComplaint}
        />

        <VitalSignsSection
          vitalSigns={formData.vitalSigns}
          onChange={handleVitalSignChange}
        />

        <DiagnosisSection
          value={formData.diagnosis}
          onChange={value => handleFieldChange('diagnosis', value)}
          error={errors.diagnosis}
        />

        <TreatmentSection
          treatment={formData.treatment}
          prescription={formData.prescription}
          labTests={formData.labTests}
          onTreatmentChange={value => handleFieldChange('treatment', value)}
          onPrescriptionChange={value =>
            handleFieldChange('prescription', value)
          }
          onLabTestsChange={value => handleFieldChange('labTests', value)}
        />

        <FollowUpSection
          notes={formData.followUpNotes}
          date={formData.followUpDate}
          onNotesChange={value => handleFieldChange('followUpNotes', value)}
          onDateChange={value => handleFieldChange('followUpDate', value)}
        />

        <NotesSection
          value={formData.additionalNotes}
          onChange={value => handleFieldChange('additionalNotes', value)}
        />

        {errors.submit && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: COLORS.badge.danger.bg,
              borderColor: COLORS.danger,
              color: COLORS.badge.danger.text,
            }}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{errors.submit}</span>
          </div>
        )}

        {saveSuccess && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: COLORS.badge.success.bg,
              borderColor: COLORS.success,
              color: COLORS.badge.success.text,
            }}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Saved successfully!</span>
          </div>
        )}

        <div
          className="flex gap-3 pt-4 border-t"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.button.outline.bgHover,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <X className="w-5 h-5" />
              Cancel
            </span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: COLORS.button.edit.bg,
              color: COLORS.button.edit.text,
            }}
          >
            <span className="flex items-center justify-center gap-2">
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Notes
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentRemarksModal;
