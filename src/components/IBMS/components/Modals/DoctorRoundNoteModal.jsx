// components/modals/DoctorRoundNoteModal.jsx
import { useState } from 'react';
import { X, Stethoscope, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { TextArea } from '../../../ui/text-area';

const DoctorRoundNoteModal = ({ isOpen, onClose, admission, onSubmit }) => {
  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    isCritical: false,
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
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        isCritical: formData.isCritical,
        noteType: 'doctor_round',
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
      isCritical: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Doctor Round Note
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* SOAP Sections */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjective (Patient's complaints)
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

              {/* Critical Flag */}
              <div className="flex items-center gap-2">
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
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label
                  htmlFor="critical"
                  className="flex items-center gap-2 text-sm"
                >
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Mark as critical observation
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!formData.assessment.trim()}
            >
              Save Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRoundNoteModal;
