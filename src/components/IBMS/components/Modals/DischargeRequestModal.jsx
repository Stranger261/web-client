// components/modals/DischargeRequestModal.jsx
import { useState } from 'react';
import {
  X,
  Calendar,
  FileText,
  AlertCircle,
  Activity,
  Stethoscope,
  ClipboardList,
  UserCheck,
  Pill,
  TestTube,
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { TextArea } from '../../../ui/text-area';
import { Input } from '../../../ui/input';

const DischargeRequestModal = ({ isOpen, onClose, admission, onSubmit }) => {
  const [formData, setFormData] = useState({
    // New required fields for external API
    discharge_datetime: '',
    final_diagnosis: '',
    discharge_type: '',
    condition_on_discharge: '',

    // Existing fields
    expected_discharge_date: '',
    summary: '',
    follow_up_instructions: '',
    medications_to_continue: '',
    required_tests: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen || !admission) return null;

  const patientName =
    `${admission.patient?.person?.first_name || ''} ${admission.patient?.person?.last_name || ''}`.trim();
  const los = admission.length_of_stay || 0;

  const dischargeTypes = [
    { value: 'regular', label: 'Regular', color: 'text-green-600' },
    {
      value: 'AMA',
      label: 'Against Medical Advice (AMA)',
      color: 'text-orange-600',
    },
    {
      value: 'transfer',
      label: 'Transfer to Another Facility',
      color: 'text-blue-600',
    },
    { value: 'deceased', label: 'Deceased', color: 'text-gray-600' },
    { value: 'other', label: 'Other', color: 'text-purple-600' },
  ];

  const conditionOptions = [
    { value: 'improved', label: 'Improved', color: 'text-green-600' },
    { value: 'stable', label: 'Stable', color: 'text-blue-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'deteriorated', label: 'Deteriorated', color: 'text-orange-600' },
    { value: 'deceased', label: 'Deceased', color: 'text-gray-600' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.discharge_datetime) {
      newErrors.discharge_datetime = 'Discharge date/time is required';
    }
    if (!formData.final_diagnosis?.trim()) {
      newErrors.final_diagnosis = 'Final diagnosis is required';
    }
    if (!formData.discharge_type) {
      newErrors.discharge_type = 'Discharge type is required';
    }
    if (!formData.condition_on_discharge) {
      newErrors.condition_on_discharge = 'Condition on discharge is required';
    }
    if (!formData.summary?.trim()) {
      newErrors.summary = 'Discharge summary is required';
    }
    if (!formData.expected_discharge_date) {
      newErrors.expected_discharge_date = 'Expected discharge date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Send all data to backend
      const dischargeData = {
        // New fields for external API
        patient_id: admission.patient_id,
        admission_id: admission.admission_id,
        discharge_datetime: formData.discharge_datetime,
        final_diagnosis: formData.final_diagnosis.trim(),
        discharge_type: formData.discharge_type,
        condition_on_discharge: formData.condition_on_discharge,

        // Existing fields
        expected_discharge_date: formData.expected_discharge_date,
        summary: formData.summary.trim(),
        follow_up_instructions: formData.follow_up_instructions.trim() || '',
        medications_to_continue: formData.medications_to_continue.trim() || '',
        required_tests: formData.required_tests.trim() || '',
      };

      await onSubmit(dischargeData);
      handleClose();
    } catch (error) {
      console.error('Error submitting discharge request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      discharge_datetime: '',
      final_diagnosis: '',
      discharge_type: '',
      condition_on_discharge: '',
      expected_discharge_date: '',
      summary: '',
      follow_up_instructions: '',
      medications_to_continue: '',
      required_tests: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Patient Discharge Request
                </h2>
                <p className="text-sm text-teal-100 mt-1">
                  {patientName} • {los} {los === 1 ? 'day' : 'days'} in hospital
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleClose}
              className="w-10 h-10 p-0 text-white hover:bg-white/20"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto">
            {/* Warning Banner */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Important Notice
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                    This will change the admission status to "Pending Discharge"
                    and notify the nursing staff for approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Discharge Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Discharge Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Discharge Date & Time */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Discharge Date & Time *
                  </label>
                  <Input
                    type="date"
                    value={formData.discharge_datetime}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        discharge_datetime: e.target.value,
                      }));
                      setErrors(prev => ({ ...prev, discharge_datetime: '' }));
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    className={
                      errors.discharge_datetime ? 'border-red-500' : ''
                    }
                  />
                  {errors.discharge_datetime && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.discharge_datetime}
                    </p>
                  )}
                </div>

                {/* Expected Discharge Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Expected Discharge Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.expected_discharge_date}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        expected_discharge_date: e.target.value,
                      }));
                      setErrors(prev => ({
                        ...prev,
                        expected_discharge_date: '',
                      }));
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={
                      errors.expected_discharge_date ? 'border-red-500' : ''
                    }
                  />
                  {errors.expected_discharge_date && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.expected_discharge_date}
                    </p>
                  )}
                </div>

                {/* Discharge Type */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <ClipboardList className="w-4 h-4 text-teal-600" />
                    Discharge Type *
                  </label>
                  <select
                    value={formData.discharge_type}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        discharge_type: e.target.value,
                      }));
                      setErrors(prev => ({ ...prev, discharge_type: '' }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.discharge_type
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select discharge type</option>
                    {dischargeTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.discharge_type && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.discharge_type}
                    </p>
                  )}
                </div>

                {/* Condition on Discharge */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    Condition on Discharge *
                  </label>
                  <select
                    value={formData.condition_on_discharge}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        condition_on_discharge: e.target.value,
                      }));
                      setErrors(prev => ({
                        ...prev,
                        condition_on_discharge: '',
                      }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.condition_on_discharge
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition_on_discharge && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.condition_on_discharge}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Clinical Summary Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Clinical Summary
              </h3>

              {/* Final Diagnosis */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Final Diagnosis *
                </label>
                <TextArea
                  value={formData.final_diagnosis}
                  onChange={e => {
                    setFormData(prev => ({
                      ...prev,
                      final_diagnosis: e.target.value,
                    }));
                    setErrors(prev => ({ ...prev, final_diagnosis: '' }));
                  }}
                  placeholder="Enter complete final diagnosis, treatment summary, and outcome..."
                  rows={3}
                  className={errors.final_diagnosis ? 'border-red-500' : ''}
                />
                {errors.final_diagnosis && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.final_diagnosis}
                  </p>
                )}
              </div>

              {/* Discharge Summary */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Discharge Summary *
                </label>
                <TextArea
                  value={formData.summary}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, summary: e.target.value }));
                    setErrors(prev => ({ ...prev, summary: '' }));
                  }}
                  placeholder="Summary of hospital stay, treatment completed, and outcomes..."
                  rows={3}
                  className={errors.summary ? 'border-red-500' : ''}
                />
                {errors.summary && (
                  <p className="text-xs text-red-600 mt-1">{errors.summary}</p>
                )}
              </div>
            </div>

            {/* Post-Discharge Care Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Post-Discharge Care
              </h3>

              {/* Follow-up Instructions */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
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
                  placeholder="Appointment scheduling, home care instructions, activity restrictions, warning signs..."
                  rows={3}
                />
              </div>

              {/* Medications to Continue */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Pill className="w-4 h-4 text-teal-600" />
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
                  placeholder="List medications patient should continue post-discharge with dosage and frequency..."
                  rows={2}
                />
              </div>

              {/* Required Tests */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <TestTube className="w-4 h-4 text-teal-600" />
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
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-teal-600 hover:bg-teal-700 text-white"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Discharge Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DischargeRequestModal;
