import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

const AnnouncementItem = ({ announcement }) => {
  const getIcon = type => {
    const icons = {
      warning: AlertCircle,
      success: CheckCircle,
      emergency: AlertCircle,
      info: Info,
    };

    const colors = {
      warning: 'text-yellow-500',
      success: 'text-green-500',
      emergency: 'text-red-500',
      info: 'text-blue-500',
    };

    const Icon = icons[type] || Info;
    return <Icon className={`h-5 w-5 ${colors[type] || 'text-blue-500'}`} />;
  };

  const getColor = type => {
    const colors = {
      warning: 'bg-yellow-500',
      success: 'bg-green-500',
      emergency: 'bg-red-500',
      info: 'bg-blue-500',
    };
    return colors[type] || 'bg-blue-500';
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="mt-1">{getIcon(announcement.type)}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{announcement.title}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {announcement.date}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {announcement.message}
          </p>
          <div
            className={`inline-block h-1 w-8 rounded-full mt-3 ${getColor(
              announcement.type
            )}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

const AnnouncementsList = ({
  announcements = [],
  title = 'Hospital Announcements',
  subtitle = 'Latest updates and alerts',
}) => {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody>
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map(announcement => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No announcements available
            </div>
          )}
        </div>
        <Button variant="ghost" size="md" className="w-full mt-4">
          View All Announcements
        </Button>
      </CardBody>
    </Card>
  );
};

export default AnnouncementsList;
