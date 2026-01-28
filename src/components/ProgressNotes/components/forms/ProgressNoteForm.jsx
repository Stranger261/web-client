import { useState } from 'react';
import { Activity, FileText, AlertCircle } from 'lucide-react';
import { Input } from '../../../ui/input';
import { Select } from '../../../ui/select';
import { Button } from '../../../ui/button';
import { COLORS } from '../../../../configs/CONST';

const ProgressNoteForm = ({
  admission,
  onSubmit,
  onCancel,
  loading = false,
  initialData = null,
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const isAmendment = !!initialData;

  const [formData, setFormData] = useState({
    admissionId: admission?.admission_id || initialData?.admission_id || '',
    patientId: admission?.patient_id || initialData?.patient_id || '',
    noteType: initialData?.note_type || 'doctor_round',
    subjective: initialData?.subjective || '',
    objective: initialData?.objective || '',
    assessment: initialData?.assessment || '',
    plan: initialData?.plan || '',
    vitals: {
      temperature: initialData?.temperature || '',
      blood_pressure_systolic: initialData?.blood_pressure_systolic || '',
      blood_pressure_diastolic: initialData?.blood_pressure_diastolic || '',
      heart_rate: initialData?.heart_rate || '',
      respiratory_rate: initialData?.respiratory_rate || '',
      oxygen_saturation: initialData?.oxygen_saturation || '',
      pain_level: initialData?.pain_level || '',
      consciousness_level: initialData?.consciousness_level || '',
    },
    intakeOutput: initialData?.intake_output || '',
    woundCare: initialData?.wound_care || '',
    specialInstructions: initialData?.special_instructions || '',
    isCritical: initialData?.is_critical || false,
    reason: '', // For amendments
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleVitalsChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.noteType === 'doctor_round') {
      if (!formData.subjective?.trim()) {
        newErrors.subjective =
          'Patient complaints (Subjective) required for doctor rounds';
      }
      if (!formData.assessment?.trim()) {
        newErrors.assessment = 'Assessment required for doctor rounds';
      }
    }

    if (isAmendment && !formData.reason?.trim()) {
      newErrors.reason = 'Amendment reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const noteTypeOptions = [
    { value: 'doctor_round', label: 'Doctor Round' },
    { value: 'nurse_note', label: 'Nurse Note' },
    { value: 'vital_signs', label: 'Vital Signs Only' },
    { value: 'medication_admin', label: 'Medication Administration' },
    { value: 'procedure', label: 'Procedure Note' },
    { value: 'assessment', label: 'Assessment' },
  ];

  const consciousnessOptions = [
    { value: '', label: 'Select level' },
    { value: 'alert', label: 'Alert' },
    { value: 'drowsy', label: 'Drowsy' },
    { value: 'stupor', label: 'Stupor' },
    { value: 'coma', label: 'Coma' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Info Banner */}
      <div
        className="p-3 rounded-lg"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.surface.lightHover,
          borderLeft: `4px solid ${COLORS.info}`,
        }}
      >
        <p
          className="text-sm font-medium"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Patient: {admission?.patient?.person?.first_name}{' '}
          {admission?.patient?.person?.last_name}
        </p>
        <p className="text-xs" style={{ color: COLORS.text.secondary }}>
          Admission: {admission?.admission_number} • MRN:{' '}
          {admission?.patient?.mrn}
        </p>
      </div>

      {/* Note Type */}
      <Select
        label="Note Type"
        name="noteType"
        value={formData.noteType}
        onChange={handleChange}
        options={noteTypeOptions}
        required
        disabled={isAmendment}
      />

      {/* Amendment Reason */}
      {isAmendment && (
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Amendment Reason <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: errors.reason
                ? COLORS.danger
                : isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
            }}
            placeholder="Explain why you're amending this note..."
          />
          {errors.reason && (
            <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
              {errors.reason}
            </p>
          )}
        </div>
      )}

      {/* SOAP Notes Section */}
      <div
        className="p-4 rounded-lg border space-y-4"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.surface.lightHover,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-2">
          <FileText size={20} style={{ color: COLORS.info }} />
          <h3
            className="text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            SOAP Notes
          </h3>
        </div>

        {/* Subjective */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Subjective (Patient Complaints)
            {formData.noteType === 'doctor_round' && (
              <span style={{ color: COLORS.danger }}> *</span>
            )}
          </label>
          <textarea
            name="subjective"
            value={formData.subjective}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: errors.subjective
                ? COLORS.danger
                : isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
            }}
            placeholder="What is the patient reporting? (symptoms, complaints, concerns)"
          />
          {errors.subjective && (
            <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
              {errors.subjective}
            </p>
          )}
        </div>

        {/* Objective */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Objective (Observations)
          </label>
          <textarea
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
            placeholder="Observable findings (physical exam, test results)"
          />
        </div>

        {/* Assessment */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Assessment (Evaluation)
            {formData.noteType === 'doctor_round' && (
              <span style={{ color: COLORS.danger }}> *</span>
            )}
          </label>
          <textarea
            name="assessment"
            value={formData.assessment}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: errors.assessment
                ? COLORS.danger
                : isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
            }}
            placeholder="Clinical assessment and interpretation"
          />
          {errors.assessment && (
            <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
              {errors.assessment}
            </p>
          )}
        </div>

        {/* Plan */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Plan (Treatment Updates)
          </label>
          <textarea
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
            placeholder="Treatment plan and next steps"
          />
        </div>
      </div>

      {/* Vital Signs Section */}
      <div
        className="p-4 rounded-lg border space-y-4"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.surface.lightHover,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-2">
          <Activity size={20} style={{ color: COLORS.success }} />
          <h3
            className="text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Vital Signs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Temperature (°C)"
            name="temperature"
            type="number"
            step="0.1"
            value={formData.vitals.temperature}
            onChange={handleVitalsChange}
            placeholder="36.5"
          />

          <Input
            label="BP Systolic (mmHg)"
            name="blood_pressure_systolic"
            type="number"
            value={formData.vitals.blood_pressure_systolic}
            onChange={handleVitalsChange}
            placeholder="120"
          />

          <Input
            label="BP Diastolic (mmHg)"
            name="blood_pressure_diastolic"
            type="number"
            value={formData.vitals.blood_pressure_diastolic}
            onChange={handleVitalsChange}
            placeholder="80"
          />

          <Input
            label="Heart Rate (bpm)"
            name="heart_rate"
            type="number"
            value={formData.vitals.heart_rate}
            onChange={handleVitalsChange}
            placeholder="72"
          />

          <Input
            label="Respiratory Rate (bpm)"
            name="respiratory_rate"
            type="number"
            value={formData.vitals.respiratory_rate}
            onChange={handleVitalsChange}
            placeholder="16"
          />

          <Input
            label="Oxygen Saturation (%)"
            name="oxygen_saturation"
            type="number"
            value={formData.vitals.oxygen_saturation}
            onChange={handleVitalsChange}
            placeholder="98"
          />

          <Input
            label="Pain Level (0-10)"
            name="pain_level"
            type="number"
            min="0"
            max="10"
            value={formData.vitals.pain_level}
            onChange={handleVitalsChange}
            placeholder="0"
          />

          <Select
            label="Consciousness Level"
            name="consciousness_level"
            value={formData.vitals.consciousness_level}
            onChange={handleVitalsChange}
            options={consciousnessOptions}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Intake/Output Monitoring
          </label>
          <textarea
            name="intakeOutput"
            value={formData.intakeOutput}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
            placeholder="Fluid intake and output details..."
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Wound Care
          </label>
          <textarea
            name="woundCare"
            value={formData.woundCare}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
            placeholder="Wound assessment and care provided..."
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Special Instructions
          </label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.surface.light,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
            placeholder="Any special instructions or notes..."
          />
        </div>
      </div>

      {/* Critical Flag */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isCritical"
          name="isCritical"
          checked={formData.isCritical}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300"
          style={{ accentColor: COLORS.danger }}
        />
        <label
          htmlFor="isCritical"
          className="text-sm font-medium flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <AlertCircle size={16} style={{ color: COLORS.danger }} />
          Mark as Critical/Urgent
        </label>
      </div>

      {/* Actions */}
      <div
        className="flex justify-end gap-3 pt-4 border-t"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isAmendment ? 'Submit Amendment' : 'Save Progress Note'}
        </Button>
      </div>
    </form>
  );
};

export default ProgressNoteForm;
