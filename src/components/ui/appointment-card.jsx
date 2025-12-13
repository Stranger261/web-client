import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';

// Card View Component
const AppointmentCard = ({
  appointment,
  onStartConsultation,
  onAddNotes,
  onPrescribe,
  onViewDetails,
  getPatientDisplay,
  getStatusConfig,
  setShowActionMenu,
  showActionMenu,
}) => {
  const patient = getPatientDisplay(appointment);
  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="text-blue-600" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {patient.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              MRN: {patient.mrn} • Age: {patient.age}
            </p>
            {appointment.priority === 'high' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 mt-1">
                <AlertCircle size={12} />
                High Priority
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() =>
            setShowActionMenu(
              showActionMenu === appointment.appointment_uuid
                ? null
                : appointment.appointment_uuid
            )
          }
          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
        >
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Time and Date */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar size={16} />
          <span>{formatDate(appointment.appointment_date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock size={16} />
          <span>
            {formatTime(appointment.start_time)} -{' '}
            {formatTime(appointment.end_time)}
          </span>
        </div>
      </div>

      {/* Reason */}
      {appointment.reason && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {appointment.reason}
        </p>
      )}

      {/* Bottom Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${statusConfig.color}`}
          >
            <StatusIcon size={12} />
            {appointment.status}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium capitalize">
            {appointment.appointment_type}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Consultation Method Icons */}
          {appointment.consultation_method === 'video' && (
            <button
              onClick={() => onStartConsultation(appointment)}
              className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Start Video Call"
            >
              <Video size={16} />
            </button>
          )}
          {appointment.consultation_method === 'phone' && (
            <button
              onClick={() => onStartConsultation(appointment)}
              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"
              title="Start Phone Call"
            >
              <Phone size={16} />
            </button>
          )}

          {/* View Details */}
          <button
            onClick={() => onViewDetails(appointment)}
            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            title="View Details"
          >
            <Eye size={16} />
          </button>

          {/* Has Notes Indicator */}
          {appointment.has_notes && (
            <span
              className="p-1.5 bg-purple-100 text-purple-600 rounded"
              title="Has Clinical Notes"
            >
              <FileText size={16} />
            </span>
          )}

          {/* Has Prescription Indicator */}
          {appointment.has_prescription && (
            <span
              className="p-1.5 bg-orange-100 text-orange-600 rounded"
              title="Has Prescription"
            >
              <Pill size={16} />
            </span>
          )}
        </div>
      </div>

      {/* Action Menu */}
      {showActionMenu === appointment.appointment_uuid && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          <button
            onClick={() => onStartConsultation(appointment)}
            className="flex-1 min-w-[120px] px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
          >
            <Stethoscope size={16} />
            Consult
          </button>
          <button
            onClick={() => onAddNotes(appointment)}
            className="flex-1 min-w-[120px] px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            Add Notes
          </button>
          <button
            onClick={() => onPrescribe(appointment)}
            className="flex-1 min-w-[120px] px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 flex items-center justify-center gap-2"
          >
            <Pill size={16} />
            Prescribe
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
