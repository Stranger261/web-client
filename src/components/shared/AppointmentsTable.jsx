// File: /src/components/shared/AppointmentsTable.jsx
import { useEffect, useState } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  User,
  Calendar,
  Clock,
  MoreVertical,
  MapPin,
  Stethoscope,
  Video,
  Phone,
  FileText,
  Pill,
  AlertCircle,
} from 'lucide-react';
import Table from '../ui/table';
import Badge from '../ui/badge';
import { Button } from '../ui/button';
import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';

const AppointmentsTable = ({
  appointments,
  currentUser,
  onViewDetails,
  onEditAppointment,
  onCancelAppointment,
  onCheckIn,
  onStartConsultation,
  onAddNotes,
  onPrescribe,
  changing,
  isDashboard,
  showColumns = ['person', 'date', 'time', 'status', 'actions'],
}) => {
  const [view, setView] = useState('table');

  // Auto-detect screen size and set view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setView('card');
      } else {
        setView('table');
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get patient display info
  const getPatientDisplay = appointment => {
    const { patient, createdBy } = appointment;

    if (patient && typeof patient === 'object' && patient.fullName) {
      return {
        name: patient.displayName || patient.fullName,
        subInfo: patient.medicalRecordNumber
          ? `MRN: ${patient.medicalRecordNumber}`
          : `Age: ${patient.age || 'N/A'}`,
      };
    }

    if (createdBy && createdBy.role === 'patient') {
      return {
        name: `${createdBy.firstname || ''} ${createdBy.lastname || ''}`.trim(),
        subInfo: createdBy.phone || createdBy.email || '',
      };
    }

    return {
      name:
        typeof patient === 'string'
          ? `Patient ID: ${patient}`
          : 'Unknown Patient',
      subInfo: '',
    };
  };

  // Get doctor display info
  const getDoctorDisplay = appointment => {
    const { doctor } = appointment;

    if (!doctor) return { name: 'Unknown Doctor', subInfo: '' };

    const name = `Dr. ${doctor?.person?.first_name || ''} ${
      doctor?.person?.last_name || ''
    }`.trim();
    const subInfo = doctor.specialization || doctor.department?.name || '';

    return { name, subInfo };
  };

  // Get person info based on user role
  const getPersonDisplay = appointment => {
    return currentUser.role === 'patient'
      ? getDoctorDisplay(appointment)
      : getPatientDisplay(appointment);
  };

  // Get status variant for badge
  const getStatusVariant = status => {
    const statusMap = {
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'primary',
      rescheduled: 'info',
      scheduled: 'warning',
      'checked-in': 'success',
      'no-show': 'danger',
    };
    return statusMap[status] || 'default';
  };

  // Card View Component
  const AppointmentCard = ({ appointment }) => {
    const person = getPersonDisplay(appointment);
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex-shrink-0">
            {currentUser.role === 'patient' ? (
              <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {person.name}
              </h3>
              {appointment.priority === 'high' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
                  <AlertCircle size={12} />
                  HIGH
                </span>
              )}
            </div>
            {person.subInfo && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {person.subInfo}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(appointment.appointment_date)}
              </span>
              <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {appointment.start_time
                  ? `${formatTime(appointment.start_time)} - ${formatTime(
                      appointment.end_time
                    )}`
                  : 'TBD'}
              </span>
              {appointment.location && (
                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  {appointment.location}
                </span>
              )}
            </div>
            {appointment.reason && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-1">
                {appointment.reason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </Badge>
            {showColumns.includes('appointment_type') && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                {appointment.appointment_type}
              </span>
            )}
          </div>

          {/* Doctor Actions */}
          {currentUser.role === 'doctor' && (
            <div className="flex items-center gap-1">
              {appointment.consultation_method === 'video' &&
                onStartConsultation && (
                  <button
                    onClick={() => onStartConsultation(appointment)}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    title="Start Video Call"
                  >
                    <Video size={16} />
                  </button>
                )}
              {appointment.consultation_method === 'phone' &&
                onStartConsultation && (
                  <button
                    onClick={() => onStartConsultation(appointment)}
                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    title="Start Phone Call"
                  >
                    <Phone size={16} />
                  </button>
                )}
              {appointment.has_notes && (
                <span
                  className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"
                  title="Has Clinical Notes"
                >
                  <FileText size={16} />
                </span>
              )}
              {appointment.has_prescription && (
                <span
                  className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"
                  title="Has Prescription"
                >
                  <Pill size={16} />
                </span>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(appointment)}
          >
            Details
          </Button>
        </div>
      </div>
    );
  };

  // Card View Render
  if (view === 'card') {
    return (
      <div
        className={`space-y-4 p-4 transition-opacity duration-300 ${
          changing ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.appointment_uuid || appointment.id}
            appointment={appointment}
          />
        ))}
      </div>
    );
  }

  // Table View - Define columns based on showColumns prop
  const columns = [];

  // Person Column
  if (showColumns.includes('person')) {
    columns.push({
      header: currentUser.role === 'patient' ? 'Doctor' : 'Patient',
      accessor: 'person',
      render: appt => {
        const person = getPersonDisplay(appt);
        return (
          <div className="min-w-0">
            <div className="font-medium truncate">{person.name}</div>
            {person.subInfo && (
              <div className="text-xs opacity-70 truncate">
                {person.subInfo}
              </div>
            )}
          </div>
        );
      },
    });
  }

  // MRN Column - only for non-patient roles
  if (showColumns.includes('mrn') && currentUser.role !== 'patient') {
    columns.push({
      header: 'MRN',
      accessor: 'mrn',
      render: appt => (
        <div className="font-mono text-sm">
          {appt.patient && typeof appt.patient === 'object'
            ? appt.patient.medicalRecordNumber || 'N/A'
            : 'N/A'}
        </div>
      ),
    });
  }

  // Date Column
  if (showColumns.includes('date')) {
    columns.push({
      header: 'Date',
      accessor: 'date',
      render: appt => <div>{formatDate(appt.appointment_date)}</div>,
    });
  }

  // Time Column
  if (showColumns.includes('time')) {
    columns.push({
      header: 'Time',
      accessor: 'time',
      render: appt => (
        <div>
          {appt.start_time
            ? `${formatTime(appt.start_time)} - ${formatTime(appt.end_time)}`
            : 'TBD'}
        </div>
      ),
    });
  }

  // Status Column
  if (showColumns.includes('status')) {
    columns.push({
      header: 'Status',
      accessor: 'status',
      render: appt => (
        <Badge variant={getStatusVariant(appt.status)}>{appt.status}</Badge>
      ),
    });
  }

  // Appointment type Column
  if (showColumns.includes('appointment_type')) {
    columns.push({
      header: 'Appt. type',
      accessor: 'appointment_type',
      align: 'center',
      render: appt => (
        <div className="font-medium truncate">{appt.appointment_type}</div>
      ),
    });
  }

  // Method Column (for doctors)
  if (showColumns.includes('method') && currentUser.role === 'doctor') {
    columns.push({
      header: 'Method',
      accessor: 'method',
      render: appt => (
        <div className="flex items-center gap-2">
          {appt.consultation_method === 'video' && (
            <>
              <Video size={16} className="text-blue-600" />
              <span className="text-sm">Video</span>
            </>
          )}
          {appt.consultation_method === 'phone' && (
            <>
              <Phone size={16} className="text-green-600" />
              <span className="text-sm">Phone</span>
            </>
          )}
          {appt.consultation_method === 'in-person' && (
            <>
              <MapPin size={16} className="text-gray-600" />
              <span className="text-sm">In-Person</span>
            </>
          )}
        </div>
      ),
    });
  }

  // Priority Column (for doctors)
  if (showColumns.includes('priority') && currentUser.role === 'doctor') {
    columns.push({
      header: 'Priority',
      accessor: 'priority',
      align: 'center',
      render: appt => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize ${
            appt.priority === 'high'
              ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400'
              : 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {appt.priority}
        </span>
      ),
    });
  }

  // Actions Column
  if (showColumns.includes('actions')) {
    columns.push({
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: appt => {
        const actions = [];

        // Doctor-specific actions
        if (currentUser.role === 'doctor') {
          // Consultation button
          if (appt.consultation_method === 'video' && onStartConsultation) {
            actions.push(
              <Button
                key="video"
                variant="edit"
                size="sm"
                icon={Video}
                iconOnly
                onClick={() => onStartConsultation(appt)}
                title="Start Video Consultation"
              />
            );
          } else if (
            appt.consultation_method === 'phone' &&
            onStartConsultation
          ) {
            actions.push(
              <Button
                key="phone"
                variant="create"
                size="sm"
                icon={Phone}
                iconOnly
                onClick={() => onStartConsultation(appt)}
                title="Start Phone Consultation"
              />
            );
          }

          // Notes indicator/button
          if (appt.has_notes) {
            actions.push(
              <span
                key="notes"
                className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"
                title="Has Clinical Notes"
              >
                <FileText size={16} />
              </span>
            );
          } else if (onAddNotes) {
            actions.push(
              <button
                key="add-notes"
                onClick={() => onAddNotes(appt)}
                className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Add Clinical Notes"
              >
                <FileText size={16} />
              </button>
            );
          }

          // Prescription indicator/button
          if (appt.has_prescription) {
            actions.push(
              <span
                key="prescription"
                className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"
                title="Has Prescription"
              >
                <Pill size={16} />
              </span>
            );
          } else if (onPrescribe) {
            actions.push(
              <button
                key="add-prescription"
                onClick={() => onPrescribe(appt)}
                className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Create Prescription"
              >
                <Pill size={16} />
              </button>
            );
          }
        }

        // View button (all roles)
        actions.push(
          <Button
            key="view"
            variant="view"
            size="sm"
            icon={Eye}
            iconOnly
            onClick={() => onViewDetails(appt)}
          />
        );

        // Edit/Check-in button - only receptionist
        if (currentUser.role === 'receptionist' && onEditAppointment) {
          if (isDashboard) {
            if (appt.status !== 'checked-in' && appt.status !== 'no-show') {
              actions.push(
                <Button
                  key="check"
                  variant="create"
                  size="sm"
                  icon={CheckCircle}
                  iconOnly
                  onClick={() => onCheckIn(appt)}
                />
              );
            }
          } else {
            actions.push(
              <Button
                key="edit"
                variant="edit"
                size="sm"
                icon={Edit}
                iconOnly
                onClick={() => onEditAppointment(appt)}
              />
            );
          }
        }

        // Cancel button
        if (onCancelAppointment && appt.status !== 'cancelled') {
          const canCancel =
            currentUser.role === 'receptionist' ||
            (currentUser.role === 'patient' && appt.status === 'scheduled');

          if (canCancel) {
            actions.push(
              <Button
                key="cancel"
                variant="delete"
                size="sm"
                icon={Trash2}
                iconOnly
                disabled={appt.isDeleted}
                onClick={() => onCancelAppointment(appt)}
              />
            );
          }
        }

        return <div className="flex justify-end gap-2">{actions}</div>;
      },
    });
  }

  return (
    <div
      className={`transition-opacity duration-300 ${
        changing ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <Table columns={columns} data={appointments} hoverable={true} />
    </div>
  );
};

export default AppointmentsTable;
