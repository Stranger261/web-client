import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  MoreVertical,
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../../../components/ui/card';
import Badge from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

const AppointmentCard = ({ appointment, onAction }) => {
  const getStatusVariant = status => {
    const variants = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg mb-3 last:mb-0 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold">{appointment.doctorName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {appointment.specialty}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <span className="flex items-center text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              {appointment.date}
            </span>
            <span className="flex items-center text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {appointment.time}
            </span>
            <span className="flex items-center text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              {appointment.location}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant={getStatusVariant(appointment.status)}>
          {appointment.status.charAt(0).toUpperCase() +
            appointment.status.slice(1)}
        </Badge>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => onAction?.(appointment)}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const AppointmentsList = ({
  appointments = [],
  title = 'Upcoming Appointments',
  subtitle = 'Manage your scheduled visits',
  showViewAll = true,
}) => {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          showViewAll && (
            <Button variant="ghost" size="sm">
              View All
            </Button>
          )
        }
      />
      <CardBody>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No appointments scheduled
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AppointmentsList;
