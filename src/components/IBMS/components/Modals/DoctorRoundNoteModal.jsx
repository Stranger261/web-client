// components/modals/DoctorRoundNoteModal.jsx
import { useState } from 'react';
import {
  X,
  Stethoscope,
  AlertCircle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { TextArea } from '../../../ui/text-area';
import { Input } from '../../../ui/input';
import { Select } from '../../../ui/select';
import { COLORS } from '../../../../configs/CONST';

const DoctorRoundNoteModal = ({ isOpen, onClose, admission, onSubmit }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [showVitals, setShowVitals] = useState(false);

  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    specialInstructions: '',
    isCritical: false,
    // Optional vitals
    vitals: {
      temperature: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      respiratory_rate: '',
      oxygen_saturation: '',
      consciousness_level: '',
    },
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !admission) return null;

  const patientName =
    `${admission.patient?.person?.first_name || ''} ${admission.patient?.person?.last_name || ''}`.trim();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.assessment.trim()) {
      alert('Assessment is required');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        patientId: admission.patient_id,
        admissionId: admission.admission_id,
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        specialInstructions: formData.specialInstructions,
        isCritical: formData.isCritical,
        noteType: 'doctor_round',
        // Only include vitals if any are filled
        ...(hasAnyVitals() && {
          temperature: formData.vitals.temperature || null,
          blood_pressure_systolic:
            formData.vitals.blood_pressure_systolic || null,
          blood_pressure_diastolic:
            formData.vitals.blood_pressure_diastolic || null,
          heart_rate: formData.vitals.heart_rate || null,
          respiratory_rate: formData.vitals.respiratory_rate || null,
          oxygen_saturation: formData.vitals.oxygen_saturation || null,
          consciousness_level: formData.vitals.consciousness_level || null,
        }),
      };

      await onSubmit(noteData);
      handleClose();
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      specialInstructions: '',
      isCritical: false,
      vitals: {
        temperature: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        consciousness_level: '',
      },
    });
    setShowVitals(false);
    onClose();
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

  const hasAnyVitals = () => {
    return Object.values(formData.vitals).some(value => value !== '');
  };

  const consciousnessOptions = [
    { value: '', label: 'Select level' },
    { value: 'alert', label: 'Alert' },
    { value: 'drowsy', label: 'Drowsy' },
    { value: 'stupor', label: 'Stupor' },
    { value: 'coma', label: 'Coma' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-3xl rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.info + '20' }}
            >
              <Stethoscope className="w-5 h-5" style={{ color: COLORS.info }} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Doctor Round Note
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {patientName} • {admission.admission_number}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={handleClose}
            className="w-8 h-8 p-0"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
            {/* SOAP Sections */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjective (Patient's Complaints)
                </label>
                <TextArea
                  value={formData.subjective}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      subjective: e.target.value,
                    }))
                  }
                  placeholder="Patient's reported symptoms, concerns, or observations..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objective (Observations & Findings)
                </label>
                <TextArea
                  value={formData.objective}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      objective: e.target.value,
                    }))
                  }
                  placeholder="Physical exam findings, vital signs, test results..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assessment (Diagnosis & Evaluation) *
                </label>
                <TextArea
                  value={formData.assessment}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      assessment: e.target.value,
                    }))
                  }
                  placeholder="Your diagnosis, evaluation of condition, progress..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan (Treatment & Follow-up)
                </label>
                <TextArea
                  value={formData.plan}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, plan: e.target.value }))
                  }
                  placeholder="Treatment plan, medications, follow-up instructions..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span>Special Instructions</span>
                  <span
                    className="text-xs font-normal"
                    style={{ color: COLORS.text.secondary }}
                  >
                    (Optional)
                  </span>
                </label>
                <TextArea
                  value={formData.specialInstructions}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      specialInstructions: e.target.value,
                    }))
                  }
                  placeholder="NPO after midnight, strict bed rest, call if temp > 38.5°C, etc..."
                  rows={2}
                />
              </div>
            </div>

            {/* Optional Vital Signs Section */}
            <div
              className="border rounded-lg overflow-hidden"
              style={{
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              <button
                type="button"
                onClick={() => setShowVitals(!showVitals)}
                className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                }}
              >
                <div className="flex items-center gap-2">
                  <Activity size={18} style={{ color: COLORS.success }} />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Vital Signs (Optional)
                  </span>
                  {hasAnyVitals() && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: COLORS.success + '20',
                        color: COLORS.success,
                      }}
                    >
                      Added
                    </span>
                  )}
                </div>
                {showVitals ? (
                  <ChevronUp
                    size={18}
                    style={{ color: COLORS.text.secondary }}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    style={{ color: COLORS.text.secondary }}
                  />
                )}
              </button>

              {showVitals && (
                <div
                  className="p-4 space-y-4 border-t"
                  style={{
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Add vital signs if you observed them during your round.
                    Routine vitals are typically recorded by nursing staff.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                      label="O2 Saturation (%)"
                      name="oxygen_saturation"
                      type="number"
                      value={formData.vitals.oxygen_saturation}
                      onChange={handleVitalsChange}
                      placeholder="98"
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
              )}
            </div>

            {/* Critical Flag */}
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: formData.isCritical
                  ? COLORS.danger + '10'
                  : isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
              }}
            >
              <input
                type="checkbox"
                id="critical"
                checked={formData.isCritical}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    isCritical: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 focus:ring-2"
                style={{
                  accentColor: COLORS.danger,
                }}
              />
              <label
                htmlFor="critical"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              >
                <AlertCircle
                  className="w-4 h-4"
                  style={{
                    color: formData.isCritical
                      ? COLORS.danger
                      : COLORS.text.secondary,
                  }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Mark as critical observation
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-between sm:justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!formData.assessment.trim()}
              className="w-full sm:w-auto"
            >
              Save Doctor Round Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRoundNoteModal;
