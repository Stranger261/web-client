// components/appointments/AppointmentDetails.jsx
import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';

const AppointmentDetails = ({
  appointment,
  currentUser,
  showFields = [], // Will be set based on role
}) => {
  if (!appointment) return null;

  // Get patient information
  const getPatientInfo = () => {
    const { patient, createdBy } = appointment;

    if (patient && typeof patient === 'object' && patient.fullName) {
      return {
        name: patient.displayName || patient.fullName,
        details: [
          patient.medicalRecordNumber && `MRN: ${patient.medicalRecordNumber}`,
          patient.age && `Age: ${patient.age}`,
          patient.gender && `Gender: ${patient.gender}`,
          patient.dateOfBirth && `DOB: ${formatDate(patient.dateOfBirth)}`,
          patient.phone && `Phone: ${patient.phone}`,
        ]
          .filter(Boolean)
          .join(' • '),
      };
    }

    if (createdBy && createdBy.role === 'patient') {
      return {
        name: `${createdBy.firstname || ''} ${createdBy.lastname || ''}`.trim(),
        details: [
          createdBy.email && `Email: ${createdBy.email}`,
          createdBy.phone && `Phone: ${createdBy.phone}`,
        ]
          .filter(Boolean)
          .join(' • '),
      };
    }

    return {
      name:
        typeof patient === 'string'
          ? `Patient ID: ${patient}`
          : 'Unknown Patient',
      details: '',
    };
  };

  // Get doctor information
  const getDoctorInfo = () => {
    const { doctor } = appointment;

    if (!doctor) return { name: 'Unknown Doctor', details: '' };

    const name = `Dr. ${doctor.firstname || ''} ${
      doctor.lastname || ''
    }`.trim();
    const details = [doctor.specialization, doctor.department?.name]
      .filter(Boolean)
      .join(' • ');

    return { name, details };
  };

  // Render a detail row
  const renderDetailRow = (label, content) => (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900 sm:col-span-2">{content}</dd>
      </div>
    </div>
  );

  const patient = getPatientInfo();
  const doctor = getDoctorInfo();

  return (
    <div className="space-y-0">
      {/* Patient Info */}
      {showFields.includes('patient') &&
        currentUser.role !== 'patient' &&
        renderDetailRow(
          'Patient',
          <div>
            <div className="font-medium">{patient.name}</div>
            {patient.details && (
              <div className="text-sm text-gray-600 mt-1">
                {patient.details}
              </div>
            )}
          </div>
        )}

      {/* MRN */}
      {showFields.includes('mrn') &&
        currentUser.role === 'receptionist' &&
        renderDetailRow(
          'Medical Record Number',
          <div className="font-mono font-medium">
            {appointment.patient && typeof appointment.patient === 'object'
              ? appointment.patient.medicalRecordNumber || 'Not available'
              : 'Not available'}
          </div>
        )}

      {/* Doctor Info */}
      {showFields.includes('doctor') &&
        renderDetailRow(
          'Doctor',
          <div>
            <div className="font-medium">{doctor.name}</div>
            {doctor.details && (
              <div className="text-sm text-gray-600 mt-1">{doctor.details}</div>
            )}
          </div>
        )}

      {/* Appointment Date */}
      {showFields.includes('date') &&
        renderDetailRow(
          'Appointment Date',
          <div className="font-medium">
            {formatDate(appointment.appointmentDate)}
          </div>
        )}

      {/* Time Slot */}
      {showFields.includes('time') &&
        renderDetailRow(
          'Time Slot',
          <div className="font-medium">
            {appointment.timeSlot
              ? `${formatTime(appointment.timeSlot.startTime)} - ${formatTime(
                  appointment.timeSlot.endTime
                )}`
              : 'Not set'}
          </div>
        )}

      {/* Status */}
      {showFields.includes('status') &&
        renderDetailRow(
          'Status',
          <span
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${
              appointment.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : appointment.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : appointment.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {appointment.status}
          </span>
        )}

      {/* Reason */}
      {showFields.includes('reason') &&
        renderDetailRow(
          'Reason for Visit',
          appointment.reasonForVisit || 'Not specified'
        )}

      {/* Follow-up */}
      {showFields.includes('followUp') &&
        renderDetailRow(
          'Follow-up Appointment',
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              appointment.isFollowUp
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {appointment.isFollowUp ? '✓ Yes' : 'No'}
          </span>
        )}

      {/* Created At */}
      {showFields.includes('createdAt') &&
        renderDetailRow(
          'Created At',
          <div className="text-sm text-gray-600">
            {formatDate(appointment.createdAt)}
          </div>
        )}

      {/* Updated At */}
      {showFields.includes('updatedAt') &&
        renderDetailRow(
          'Last Updated At',
          <div className="text-sm text-gray-600">
            {formatDate(appointment.updatedAt)}
          </div>
        )}
    </div>
  );
};

export default AppointmentDetails;
