import { Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import Table from '../../../../components/ui/table';
import Badge from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { formatDate } from '../../../../utils/dateFormatter';
import { formatTime } from '../../../../utils/FormatTime';

const AppointmentsTable = ({
  appointments,
  currentUser,
  onViewDetails,
  onEditAppointment,
  onCancelAppointment,
  pageItem,
  changing,
  isDashboard,
  onCheckIn,
  showColumns = ['person', 'date', 'time', 'status', 'actions'],
}) => {
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

  // Define columns based on showColumns prop
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

  // MRN Column - only for receptionist
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

  // Actions Column
  if (showColumns.includes('actions')) {
    columns.push({
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: appt => {
        const actions = [];

        // View button
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
