import { Clock, CheckCircle, UserCheck, Phone, Mail } from 'lucide-react';

const PatientCard = ({ patient }) => {
  let statusBadgeClass = 'badge-neutral';
  let statusIcon = null;

  switch (patient.status?.toLowerCase()) {
    case 'checked-in':
      statusBadgeClass = 'badge-info';
      statusIcon = <UserCheck size={12} className="mr-1.5" />;
      break;
    case 'waiting':
      statusBadgeClass = 'badge-warning';
      statusIcon = <Clock size={12} className="mr-1.5" />;
      break;
    case 'completed':
      statusBadgeClass = 'badge-success';
      statusIcon = <CheckCircle size={12} className="mr-1.5" />;
      break;
    default:
      statusBadgeClass = 'badge-neutral';
  }

  return (
    <div className="bg-base-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border-l-4 border-primary">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-base-content">
            {patient.firstname} {patient.lastname}
          </h4>
        </div>
        <div className={`badge badge-sm ${statusBadgeClass}`}>
          {statusIcon}
          {patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-base-content/80">
          <Phone size={12} className="mr-2" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-center text-sm text-base-content/80">
          <Mail size={12} className="mr-2" />
          <span className="truncate">{patient.email}</span>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
