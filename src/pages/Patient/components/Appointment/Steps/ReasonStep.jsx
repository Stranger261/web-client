// components/Steps/ReasonStep.jsx
import { AlertTriangle, FileText, ClockIcon } from 'lucide-react';

export const ReasonStep = ({
  onSelect,
  reason,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isFollowUp ? 'Follow-up Appointment Details' : 'Appointment Details'}
        </h2>
        <p className="text-gray-600">
          {isFollowUp
            ? 'Provide details for this follow-up appointment'
            : 'Provide the reason and additional details for this appointment'}
        </p>
      </div>

      {/* Follow-up Context */}
      {isFollowUp && previousAppointments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Follow-up Context
              </h3>
              <div className="text-sm text-blue-800">
                <p className="mb-1">
                  <strong>Previous appointment:</strong>{' '}
                  {new Date(
                    previousAppointments[0].appointmentDate
                  ).toLocaleDateString()}
                </p>
                {previousAppointments[0].reasonForVisit && (
                  <p className="mb-1">
                    <strong>Previous reason:</strong>{' '}
                    {previousAppointments[0].reasonForVisit}
                  </p>
                )}
                <p className="text-blue-600 text-xs mt-2">
                  This information can help provide context for the follow-up
                  appointment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reason Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Reason Selection
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonReasons.map(commonReason => (
            <button
              key={commonReason}
              onClick={() => handleInputChange('reason', commonReason)}
              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                reason === commonReason
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
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
          className="block text-sm font-medium text-gray-700 mb-2"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Be specific to help the doctor prepare for the appointment
        </p>
      </div>

      {/* Receptionist-only fields */}
      {isReceptionist && (
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              Receptionist Settings
            </h3>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="flex gap-2">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('priority', option.value)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
                    priority === option.value
                      ? `border-blue-500 ${option.bgColor} ${option.color}`
                      : 'border-gray-300 hover:border-blue-300 text-gray-700'
                  }`}
                >
                  {option.value === 'urgent' && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  {option.value === 'emergency' && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Set priority to help with scheduling and doctor preparation
            </p>
          </div>

          {/* Appointment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Status
            </label>
            <select
              value={status}
              onChange={e => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Scheduled appointments can be confirmed later
            </p>
          </div>

          {/* Internal Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Internal Notes (Staff Only)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Add any internal notes, special instructions, or observations..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              These notes are only visible to staff members
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Reason:</strong> {reason || 'Not specified'}
          </p>
          {isReceptionist && (
            <>
              <p>
                <strong>Priority:</strong>
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    priority === 'emergency'
                      ? 'bg-red-100 text-red-700'
                      : priority === 'urgent'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {priorityOptions.find(p => p.value === priority)?.label}
                </span>
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {statusOptions.find(s => s.value === status)?.label}
              </p>
              {notes && (
                <p>
                  <strong>Notes:</strong> {notes.substring(0, 50)}
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
