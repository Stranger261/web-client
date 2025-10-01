// components/Steps/ReceptionistConfirmationStep.jsx
import { CheckCircle, UserIcon, Calendar, Clock, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';

export const ReceptionistConfirmationStep = ({ details, onReset }) => {
  const {
    patient,
    isFollowUp,
    previousAppointments,
    department,
    doctor,
    assignedDoctor,
    date,
    time,
    reason,
    priority,
    notes,
    status,
  } = details;

  const finalDoctor = doctor || assignedDoctor;

  const priorityConfig = {
    normal: { label: 'Normal', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    urgent: {
      label: 'Urgent',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    emergency: {
      label: 'Emergency',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
  };

  const statusConfig = {
    scheduled: {
      label: 'Scheduled',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
  };

  const DetailRow = ({ icon: Icon, label, children, priority = false }) => (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${
        priority ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
      }`}
    >
      <Icon
        className={`h-5 w-5 mt-0.5 ${
          priority ? 'text-blue-600' : 'text-gray-500'
        }`}
      />
      <div className="flex-1">
        <dt className="text-sm font-medium text-gray-700">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{children}</dd>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Appointment Scheduled Successfully!
        </h2>
        <p className="text-gray-600">
          The appointment has been created for{' '}
          <strong>{patient?.fullName || patient?.displayName}</strong>
        </p>
      </div>

      {/* Follow-up Badge */}
      {isFollowUp && (
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="h-4 w-4 mr-1" />
            Follow-up Appointment
          </span>
        </div>
      )}

      {/* Appointment Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Appointment Details
        </h3>

        <div className="space-y-3">
          {/* Patient Information */}
          <DetailRow icon={UserIcon} label="Patient" priority>
            <div>
              <div className="font-semibold">
                {patient?.fullName || patient?.displayName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {patient?.mrn && (
                  <span className="font-mono">MRN: {patient.mrn}</span>
                )}
                {patient?.phone && (
                  <span className={patient?.mrn ? ' • ' : ''}>
                    Phone: {patient.phone}
                  </span>
                )}
              </div>
              {patient?.dateOfBirth && (
                <div className="text-sm text-gray-600">
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                  {patient?.age && ` (Age: ${patient.age})`}
                </div>
              )}
            </div>
          </DetailRow>

          {/* Department & Doctor */}
          <DetailRow icon={UserIcon} label="Healthcare Provider">
            <div>
              <div className="font-semibold">
                Dr. {finalDoctor?.firstname} {finalDoctor?.lastname}
              </div>
              <div className="text-sm text-gray-600">
                {finalDoctor?.specialization} • {department?.name}
              </div>
            </div>
          </DetailRow>

          {/* Date & Time */}
          <DetailRow icon={Calendar} label="Appointment Schedule">
            <div>
              <div className="font-semibold">{formatDate(date)}</div>
              <div className="text-sm text-gray-600">
                {formatTime(time?.startTime)} - {formatTime(time?.endTime)}
              </div>
            </div>
          </DetailRow>

          {/* Reason */}
          <DetailRow icon={FileText} label="Reason for Visit">
            <div>{reason || 'Not specified'}</div>
          </DetailRow>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailRow icon={FileText} label="Priority">
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority]?.bgColor} ${priorityConfig[priority]?.color}`}
              >
                {priorityConfig[priority]?.label}
              </span>
            </DetailRow>

            <DetailRow icon={FileText} label="Status">
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}
              >
                {statusConfig[status]?.label}
              </span>
            </DetailRow>
          </div>

          {/* Internal Notes */}
          {notes && (
            <DetailRow icon={FileText} label="Internal Notes (Staff Only)">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
                {notes}
              </div>
            </DetailRow>
          )}
        </div>
      </div>

      {/* Follow-up Context */}
      {isFollowUp && previousAppointments?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Follow-up Context</h4>
          <div className="text-sm text-blue-800">
            <p>
              Previous appointment:{' '}
              {new Date(
                previousAppointments[0].appointmentDate
              ).toLocaleDateString()}
            </p>
            {previousAppointments[0].reasonForVisit && (
              <p>Previous reason: {previousAppointments[0].reasonForVisit}</p>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Next Steps</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>
            • Patient will receive appointment confirmation (if contact info
            available)
          </li>
          <li>• Send appointment reminders as per clinic policy</li>
          <li>• Update patient's medical record with appointment details</li>
          {priority === 'urgent' || priority === 'emergency' ? (
            <li className="font-medium">
              • High priority: Notify doctor of {priority} appointment
            </li>
          ) : null}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          Schedule Another Appointment
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            Print Details
          </button>

          <button
            onClick={() => {
              // Navigate to appointments list or close modal
              window.location.href = '/receptionist/appointments';
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            View All Appointments
          </button>
        </div>
      </div>

      {/* Reference Information */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
        <p>
          Appointment created on {new Date().toLocaleDateString()} at{' '}
          {new Date().toLocaleTimeString()}
        </p>
        <p>
          For any changes, contact the patient or modify through the
          appointments management system.
        </p>
      </div>
    </div>
  );
};
