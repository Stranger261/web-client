import {
  Video,
  Building2,
  Stethoscope,
  RefreshCw,
  Scissors,
  Activity,
} from 'lucide-react';

export const ReasonStep = ({
  onSelect,
  reason,
  appointmentType = 'consultation',
  isOnlineConsultation = false,
  priority = 'normal',
  notes = '',
  status = 'scheduled',
  userRole = 'patient',
  isFollowUp = false,
  previousAppointments = [],
}) => {
  const handleInputChange = (field, value) => {
    onSelect(field, value);
  };

  // Appointment Type options
  const appointmentTypeOptions = [
    {
      value: 'consultation',
      label: 'Consultation',
      description: 'General medical consultation',
      icon: Stethoscope,
    },
    {
      value: 'followup',
      label: 'Follow-up',
      description: 'Follow-up visit',
      icon: RefreshCw,
    },
    {
      value: 'procedure',
      label: 'Procedure',
      description: 'Medical procedure',
      icon: Scissors,
    },
    {
      value: 'checkup',
      label: 'Check-up',
      description: 'Routine check-up',
      icon: Activity,
    },
  ];

  // Common reason suggestions
  const commonReasonSuggestions = [
    'General consultation',
    'Follow-up visit',
    'Routine check-up',
    'Symptoms evaluation',
    'Prescription refill',
    'Test results review',
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isFollowUp ? 'Follow-up Details' : 'Appointment Details'}
        </h2>
        <p className="text-gray-600 text-sm">
          Provide reason and details for this appointment
        </p>
      </div>

      {/* Appointment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Appointment Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {appointmentTypeOptions.map(type => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('appointmentType', type.value)}
                className={`p-3 border rounded-lg transition-all text-center ${
                  appointmentType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <IconComponent
                  className={`h-5 w-5 mx-auto mb-2 ${
                    appointmentType === type.value
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                />
                <div className="text-sm font-medium">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {type.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Consultation Mode */}
      {(userRole === 'patient' || userRole === 'receptionist') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Consultation Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('isOnlineConsultation', false)}
              className={`p-3 border rounded-lg transition-all text-center ${
                !isOnlineConsultation
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <Building2
                className={`h-5 w-5 mx-auto mb-2 ${
                  !isOnlineConsultation ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              <div className="text-sm font-medium">Face-to-Face</div>
            </button>

            <button
              type="button"
              onClick={() => handleInputChange('isOnlineConsultation', true)}
              className={`p-3 border rounded-lg transition-all text-center ${
                isOnlineConsultation
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 bg-white'
              }`}
            >
              <Video
                className={`h-5 w-5 mx-auto mb-2 ${
                  isOnlineConsultation ? 'text-green-600' : 'text-gray-500'
                }`}
              />
              <div className="text-sm font-medium">Online</div>
            </button>
          </div>
        </div>
      )}

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Visit <span className="text-red-500">*</span>
        </label>

        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {commonReasonSuggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleInputChange('reason', suggestion)}
                className={`px-2.5 py-1.5 text-xs border rounded-md ${
                  reason === suggestion
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={reason}
          onChange={e => handleInputChange('reason', e.target.value)}
          placeholder="Describe symptoms, concerns, or reason..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Staff-only fields */}
      {userRole !== 'patient' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900">
            {userRole === 'receptionist'
              ? 'Receptionist Settings'
              : 'Staff Notes'}
          </h3>

          {/* Priority */}
          {userRole === 'receptionist' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <div className="flex gap-2">
                {['normal', 'urgent', 'emergency'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleInputChange('priority', level)}
                    className={`px-3 py-1.5 text-xs border rounded-md flex-1 ${
                      priority === level
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          {userRole === 'receptionist' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={e => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Add staff notes..."
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
