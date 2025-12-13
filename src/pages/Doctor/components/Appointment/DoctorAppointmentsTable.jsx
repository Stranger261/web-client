import {
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Video,
  Phone,
  MapPin,
  MoreVertical,
  Pill,
  MessageSquare,
  Stethoscope,
  Calendar,
} from 'lucide-react';
import Table from '../../../../components/ui/table';
import Badge from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { formatDate } from '../../../../utils/dateFormatter';
import { formatTime } from '../../../../utils/FormatTime';
import AppointmentCard from '../../../../components/ui/appointment-card';

const DoctorAppointmentsTable = ({
  appointments,
  currentUser,
  view = 'table',
  onViewDetails,
  onStartConsultation,
  onAddNotes,
  onPrescribe,
  showActionMenu,
  setShowActionMenu,
}) => {
  // Get patient display info
  const getPatientDisplay = appointment => {
    const { patient } = appointment;
    const { person } = patient;
    const { user } = person;
    const fullName = `${person?.first_name} ${person?.middle_name || ''} ${
      person?.last_name
    }`;

    if (patient && typeof patient === 'object' && fullName) {
      return {
        name: fullName,
        mrn: patient.mrn || 'N/A',
        age: patient.age || 'N/A',
        phone: user.phone || '',
        email: user.email || '',
      };
    }

    return {
      name:
        typeof patient === 'string'
          ? `Patient ID: ${patient.patient_uuid}`
          : 'Unknown Patient',
      mrn: 'N/A',
      age: 'N/A',
      phone: '',
      email: '',
    };
  };

  // Get status variant for badge
  const getStatusVariant = status => {
    const statusMap = {
      confirmed: 'primary',
      'checked-in': 'success',
      cancelled: 'danger',
      completed: 'default',
      scheduled: 'warning',
      'no-show': 'danger',
    };
    return statusMap[status] || 'default';
  };

  // Get status config for styling
  const getStatusConfig = status => {
    const configs = {
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
      },
      'checked-in': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
      scheduled: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      },
      completed: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: CheckCircle,
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      },
      'no-show': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.scheduled;
  };

  const getPriorityColor = priority => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      normal: 'text-gray-600 bg-gray-50 border-gray-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[priority] || colors.normal;
  };

  // Card View Component

  // Card View Render
  if (view === 'card') {
    return (
      <div className="p-4 grid grid-cols-1 gap-4">
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.appointment_uuid}
            appointment={appointment}
            onStartConsultation={onStartConsultation}
            onPrescribe={onPrescribe}
            onViewDetails={onViewDetails}
            onAddNotes={onAddNotes}
            getPatientDisplay={getPatientDisplay}
            getStatusConfig={getStatusConfig}
            setShowActionMenu={setShowActionMenu}
            showActionMenu={showActionMenu}
          />
        ))}
      </div>
    );
  }

  // Table View - Define columns
  const columns = [
    {
      header: 'Patient',
      accessor: 'patient',
      render: appt => {
        const patient = getPatientDisplay(appt);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="text-blue-600" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">
                {patient.name}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {patient.mrn}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Date & Time',
      accessor: 'datetime',
      render: appt => (
        <div>
          <div className="text-sm text-gray-900 font-medium">
            {formatDate(appt.appointment_date)}
          </div>
          <div className="text-sm text-gray-500">
            {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: appt => (
        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md capitalize">
          {appt.appointment_type}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: 'method',
      render: appt => (
        <div className="flex items-center gap-2">
          {appt.consultation_method === 'video' && (
            <>
              <Video size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">Video</span>
            </>
          )}
          {appt.consultation_method === 'phone' && (
            <>
              <Phone size={16} className="text-green-600" />
              <span className="text-sm text-gray-700">Phone</span>
            </>
          )}
          {appt.consultation_method === 'in-person' && (
            <>
              <MapPin size={16} className="text-gray-600" />
              <span className="text-sm text-gray-700">In-Person</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: appt => (
        <Badge variant={getStatusVariant(appt.status)}>{appt.status}</Badge>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      align: 'center',
      render: appt => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize ${getPriorityColor(
            appt.priority
          )}`}
        >
          {appt.priority}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: appt => {
        const actions = [];

        // Consultation button
        if (appt.consultation_method === 'video') {
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
        } else if (appt.consultation_method === 'phone') {
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

        // View button
        actions.push(
          <Button
            key="view"
            variant="view"
            size="sm"
            icon={Eye}
            iconOnly
            onClick={() => onViewDetails(appt)}
            title="View Details"
          />
        );

        // Notes indicator/button
        if (appt.has_notes) {
          actions.push(
            <span
              key="notes"
              className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-lg"
              title="Has Clinical Notes"
            >
              <FileText size={16} />
            </span>
          );
        } else {
          actions.push(
            <button
              key="add-notes"
              onClick={() => onAddNotes(appt)}
              className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
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
              className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-lg"
              title="Has Prescription"
            >
              <Pill size={16} />
            </span>
          );
        } else {
          actions.push(
            <button
              key="add-prescription"
              onClick={() => onPrescribe(appt)}
              className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              title="Create Prescription"
            >
              <Pill size={16} />
            </button>
          );
        }

        return <div className="flex justify-end gap-2">{actions}</div>;
      },
    },
  ];

  return <Table columns={columns} data={appointments} hoverable={true} />;
};

export default DoctorAppointmentsTable;
