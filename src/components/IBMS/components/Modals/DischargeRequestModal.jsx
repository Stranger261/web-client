// components/modals/DischargeRequestModal.jsx
import { useState } from 'react';
import { X, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { TextArea } from '../../../ui/text-area';
import { Input } from '../../../ui/input';

const DischargeRequestModal = ({ isOpen, onClose, admission, onSubmit }) => {
  const [formData, setFormData] = useState({
    expected_discharge_date: '',
    summary: '',
    follow_up_instructions: '',
    medications_to_continue: '',
    required_tests: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !admission) return null;

  const patientName =
    `${admission.patient?.person?.first_name || ''} ${admission.patient?.person?.last_name || ''}`.trim();
  const los = admission.length_of_stay || 0;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.summary.trim()) {
      alert('Discharge summary is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting discharge request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      expected_discharge_date: '',
      summary: '',
      follow_up_instructions: '',
      medications_to_continue: '',
      required_tests: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Request Patient Discharge
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {patientName} • {los} days in hospital
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
            {/* Warning */}
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  This will change the admission status to "Pending Discharge"
                  and notify nursing staff.
                </p>
              </div>
            </div>

            {/* Discharge Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Discharge Date *
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.expected_discharge_date}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      expected_discharge_date: e.target.value,
                    }))
                  }
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Discharge Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discharge Summary *
              </label>
              <TextArea
                value={formData.summary}
                onChange={e =>
                  setFormData(prev => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Summary of hospital stay, final diagnosis, treatment completed..."
                rows={4}
                required
              />
            </div>

            {/* Follow-up Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Follow-up Instructions
              </label>
              <TextArea
                value={formData.follow_up_instructions}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    follow_up_instructions: e.target.value,
                  }))
                }
                placeholder="Appointment scheduling, home care instructions, restrictions..."
                rows={3}
              />
            </div>

            {/* Medications to Continue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medications to Continue
              </label>
              <TextArea
                value={formData.medications_to_continue}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    medications_to_continue: e.target.value,
                  }))
                }
                placeholder="List medications patient should continue post-discharge..."
                rows={2}
              />
            </div>

            {/* Required Tests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Tests Before Discharge
              </label>
              <TextArea
                value={formData.required_tests}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    required_tests: e.target.value,
                  }))
                }
                placeholder="List any tests needed before discharge (labs, imaging, etc.)..."
                rows={2}
              />
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
              variant="warning"
              loading={loading}
              disabled={
                !formData.summary.trim() || !formData.expected_discharge_date
              }
            >
              Submit Discharge Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DischargeRequestModal;
