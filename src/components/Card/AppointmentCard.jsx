import {
  Clock,
  CalendarCheck,
  User,
  CheckCircle,
  FileText,
  Repeat,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateFormatter';

const AppointmentCard = ({ appointment, onStatusChange, role }) => {
  const normalizedStatus = appointment.status
    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
    : 'Pending';

  let statusBadgeClass = 'badge-neutral';
  let statusIcon = null;

  switch (appointment.status?.toLowerCase()) {
    case 'check-in':
      statusBadgeClass = 'badge-info';
      statusIcon = <Clock size={12} className="mr-1.5" />;
      break;
    case 'scheduled':
      statusBadgeClass = 'badge-warning';
      statusIcon = <CalendarCheck size={12} className="mr-1.5" />;
      break;
    case 'completed':
      statusBadgeClass = 'badge-success';
      statusIcon = <CheckCircle size={12} className="mr-1.5" />;
      break;
    case 'cancelled':
      statusBadgeClass = 'badge-error';
      statusIcon = <AlertCircle size={12} className="mr-1.5" />;
      break;
    case 'no-show':
      statusBadgeClass = 'badge-ghost';
      statusIcon = <User size={12} className="mr-1.5" />;
      break;
    default:
      statusBadgeClass = 'badge-neutral';
  }

  return (
    <div className="bg-base-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border-l-4 border-primary space-y-4">
      {/* Header: Patient & Status */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-base-content">
            {appointment.patient?.firstname} {appointment.patient?.lastname}
          </h3>
          <p className="text-sm text-base-content/70">
            Dr. {appointment.doctor?.firstname} {appointment.doctor?.lastname}
          </p>
          <p className="text-xs text-base-content/60">
            {appointment.doctor?.specialization || 'General Practice'}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className={`badge badge-sm ${statusBadgeClass}`}>
            {statusIcon}
            {normalizedStatus}
          </div>
          {role !== 'patient' && appointment.status === 'scheduled' && (
            <button
              onClick={() => onStatusChange(appointment.id, 'check-in')}
              className="btn btn-xs btn-primary"
            >
              Check In
            </button>
          )}
          {role !== 'patient' && appointment.status === 'check-in' && (
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => onStatusChange(appointment.id, 'completed')}
                className="btn btn-xs btn-success"
              >
                Complete
              </button>
              <button
                onClick={() => onStatusChange(appointment.id, 'no-show')}
                className="btn btn-xs btn-ghost"
              >
                No Show
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-base-300"></div>

      {/* Date & Time */}
      <div className="flex items-center text-sm text-base-content/80">
        <CalendarCheck size={14} className="mr-2" />
        <span>
          {formatDate(appointment.appointmentDate)} —{' '}
          {formatTime(appointment.timeSlot?.startTime)}-
          {formatTime(appointment.timeSlot?.endTime)}
        </span>
      </div>

      {/* Reason */}
      <div className="flex items-center text-sm text-base-content/80">
        <FileText size={14} className="mr-2" />
        <span>{appointment.reasonForVisit || 'No reason provided'}</span>
      </div>

      {/* Contact Info */}
      <div className="flex items-center text-sm text-base-content/80">
        <Phone size={14} className="mr-2" />
        <span>{appointment.patient?.phone}</span>
      </div>

      {/* Follow-up */}
      <div className="flex items-center text-sm text-base-content/80">
        <Repeat size={14} className="mr-2" />
        <span>
          {appointment.isFollowUp
            ? 'Follow-up Appointment'
            : 'Initial Appointment'}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;
