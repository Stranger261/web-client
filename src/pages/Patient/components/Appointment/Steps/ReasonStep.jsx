// components/Steps/ReasonStep.jsx
import {
  AlertTriangle,
  FileText,
  ClockIcon,
  Video,
  Building2,
} from 'lucide-react';

export const ReasonStep = ({
  onSelect,
  reason,
  isOnlineConsultation = false,
  priority = 'normal',
  notes = '',
  status = 'scheduled',
  isReceptionist = false,
  isFollowUp = false,
  previousAppointments = [],
}) => {
  const handleInputChange = (field, value) => {
    onSelect(field, value);
  };

  // Common reasons for quick selection
  const commonReasons = [
    'Annual Check-up',
    'Follow-up Visit',
    'Consultation',
    'Lab Results Review',
    'Prescription Renewal',
    'Symptoms Evaluation',
    'Referral Appointment',
    'Preventive Care',
  ];

  // Priority options for receptionist
  const priorityOptions = [
    {
      value: 'normal',
      label: 'Normal',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      value: 'urgent',
      label: 'Urgent',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      value: 'emergency',
      label: 'Emergency',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  // Status options for receptionist
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'rescheduled', label: 'Rescheduled' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isFollowUp ? 'Follow-up Appointment Details' : 'Appointment Details'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isFollowUp
            ? 'Provide details for this follow-up appointment'
            : 'Provide the reason and additional details for this appointment'}
        </p>
      </div>

      {/* Follow-up Context */}
      {isFollowUp && previousAppointments.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Follow-up Context
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>
                  <strong>Previous appointment:</strong>{' '}
                  {new Date(
                    previousAppointments[0].appointmentDate
                  ).toLocaleDateString()}
                </p>
                {previousAppointments[0].reasonForVisit && (
                  <p>
                    <strong>Previous reason:</strong>{' '}
                    {previousAppointments[0].reasonForVisit}
                  </p>
                )}
                <p className="text-blue-600 dark:text-blue-300 text-xs mt-2">
                  This information can help provide context for the follow-up
                  appointment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Appointment Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Face-to-Face Option */}
          <button
            type="button"
            onClick={() => handleInputChange('isOnlineConsultation', false)}
            className={`relative flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
              isOnlineConsultation === false
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                isOnlineConsultation === false
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1 text-left">
              <h3
                className={`font-semibold ${
                  isOnlineConsultation === false
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                Face-to-Face
              </h3>
              <p
                className={`text-sm ${
                  isOnlineConsultation === false
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                In-person visit at clinic
              </p>
            </div>
            {isOnlineConsultation === false && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* Online Consultation Option */}
          <button
            type="button"
            onClick={() => handleInputChange('isOnlineConsultation', true)}
            className={`relative flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
              isOnlineConsultation === true
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                isOnlineConsultation === true
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Video className="h-6 w-6" />
            </div>
            <div className="flex-1 text-left">
              <h3
                className={`font-semibold ${
                  isOnlineConsultation === true
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                Online Consultation
              </h3>
              <p
                className={`text-sm ${
                  isOnlineConsultation === true
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Video call appointment
              </p>
            </div>
            {isOnlineConsultation === true && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isOnlineConsultation === true
            ? 'You will receive a video call link before your appointment'
            : 'Please arrive 10 minutes before your scheduled time'}
        </p>
      </div>

      {/* Quick Reason Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Reason Selection
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonReasons.map(commonReason => (
            <button
              key={commonReason}
              type="button"
              onClick={() => handleInputChange('reason', commonReason)}
              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                reason === commonReason
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300'
              }`}
            >
              {commonReason}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reason */}
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Reason for Visit {isFollowUp && '(Follow-up Details)'}
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={e => handleInputChange('reason', e.target.value)}
          placeholder={
            isFollowUp
              ? 'Describe the purpose of this follow-up appointment...'
              : 'Describe the reason for this appointment...'
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Be specific to help the doctor prepare for the appointment
        </p>
      </div>

      {/* Receptionist-only fields */}
      {isReceptionist && (
        <div className="space-y-4 border-t dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Receptionist Settings
            </h3>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority Level
            </label>
            <div className="flex gap-2">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('priority', option.value)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
                    priority === option.value
                      ? `border-blue-500 ${option.bgColor} ${option.color}`
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {(option.value === 'urgent' ||
                    option.value === 'emergency') && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Set priority to help with scheduling and doctor preparation
            </p>
          </div>

          {/* Appointment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appointment Status
            </label>
            <select
              value={status}
              onChange={e => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Scheduled appointments can be confirmed later
            </p>
          </div>

          {/* Internal Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Internal Notes (Staff Only)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Add any internal notes, special instructions, or observations..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              These notes are only visible to staff members
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Summary
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            <strong className="text-gray-900 dark:text-white">
              Appointment Type:
            </strong>{' '}
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                isOnlineConsultation
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}
            >
              {isOnlineConsultation ? 'Online Consultation' : 'Face-to-Face'}
            </span>
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">Reason:</strong>{' '}
            {reason || 'Not specified'}
          </p>
          {isReceptionist && (
            <>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  Priority:
                </strong>
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    priority === 'emergency'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : priority === 'urgent'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {priorityOptions.find(p => p.value === priority)?.label}
                </span>
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">
                  Status:
                </strong>{' '}
                {statusOptions.find(s => s.value === status)?.label}
              </p>
              {notes && (
                <p>
                  <strong className="text-gray-900 dark:text-white">
                    Notes:
                  </strong>{' '}
                  {notes.substring(0, 50)}
                  {notes.length > 50 ? '...' : ''}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
