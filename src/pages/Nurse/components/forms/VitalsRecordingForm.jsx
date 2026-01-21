import {
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import VitalsFormFields from './VitalsFormFields';
import { COLORS } from '../../../../configs/CONST';
import { useVitalsForm } from '../../../../hooks/useVitalsForm';

const VitalsRecordingForm = ({ appointment, onSuccess }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const {
    formData,
    errors,
    isSaving,
    saveSuccess,
    handleFieldChange,
    handleSubmit,
  } = useVitalsForm(appointment);

  const onSubmit = async () => {
    const success = await handleSubmit();
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Patient Info Header */}
      <div
        className="rounded-lg p-4 mb-6"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.badge.primary.bg,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: COLORS.info }} />
            <div>
              <div
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Patient
              </div>
              <div
                className="font-semibold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {appointment?.patient?.person
                  ? `${appointment?.patient?.person?.first_name}
                ${appointment?.patient?.person?.last_name}`
                  : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: COLORS.info }} />
            <div>
              <div
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Date
              </div>
              <div
                className="font-semibold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {appointment?.appointment_date || 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: COLORS.info }} />
            <div>
              <div
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Time
              </div>
              <div
                className="font-semibold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {appointment?.appointment_time || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Title */}
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Record Patient Vitals
      </h2>

      {/* Form Fields */}
      <VitalsFormFields
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
        isDarkMode={isDarkMode}
      />

      {/* Error/Success Messages */}
      {errors.submit && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm mt-6"
          style={{
            backgroundColor: COLORS.badge.danger.bg,
            borderColor: COLORS.danger,
            color: COLORS.badge.danger.text,
            border: '1px solid',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      {saveSuccess && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm mt-6"
          style={{
            backgroundColor: COLORS.badge.success.bg,
            borderColor: COLORS.success,
            color: COLORS.badge.success.text,
            border: '1px solid',
          }}
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Vitals recorded successfully! Patient checked in.</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isSaving}
          className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: isSaving
              ? COLORS.text.secondary
              : COLORS.button.create.bg,
            color: COLORS.button.create.text,
            opacity: isSaving ? 0.6 : 1,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Vitals & Check In Patient
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VitalsRecordingForm;
