// components/MobileNotificationItem.jsx
import { Video, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { formatNotificationTime } from '../../utils/FormatTime';

const MobileNotificationItem = ({ notif, darkMode, markAsRead, COLORS }) => {
  const navigate = useNavigate();

  const notificationData = notif.data ? JSON.parse(notif.data) : {};
  const hasJoinButton = notificationData.hasJoinButton === true;
  const roomId = notificationData.room_id;
  const joinLink =
    notificationData.join_link ||
    (roomId ? `/patient/video-call/${roomId}` : null);
  const isFiveMinReminder = notificationData.type === '5_min_reminder';

  const handleJoinRoom = e => {
    e.stopPropagation();
    if (joinLink) {
      markAsRead(notif.notification_id);
      navigate(joinLink);
    }
  };

  return (
    <div
      key={notif.notification_id}
      className="px-4 py-4 border-b active:bg-opacity-70 transition-colors"
      style={{
        backgroundColor: !notif.is_read
          ? darkMode
            ? 'rgba(59, 130, 246, 0.1)'
            : 'rgba(59, 130, 246, 0.05)'
          : 'transparent',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderLeftWidth: isFiveMinReminder ? '4px' : '0',
        borderLeftColor: isFiveMinReminder ? COLORS.primary : 'transparent',
      }}
      onClick={() => markAsRead(notif.notification_id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{notif.title}</p>
            {!notif.is_read && (
              <div
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: COLORS.primary }}
              />
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            {notif.message}
          </p>

          {roomId && (
            <p
              className="text-xs mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              Room ID: <span className="font-mono">{roomId}</span>
            </p>
          )}

          {hasJoinButton && joinLink && (
            <div className="mt-3">
              <Button
                variant="default"
                size="sm"
                icon={Video}
                onClick={handleJoinRoom}
                className="gap-2 w-full justify-center"
                style={{
                  backgroundColor: COLORS.primary,
                  color: 'white',
                }}
              >
                Join Consultation
              </Button>
            </div>
          )}

          <p className="text-xs mt-2" style={{ color: COLORS.text.secondary }}>
            {formatNotificationTime(notif.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileNotificationItem;
