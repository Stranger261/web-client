// components/Baselayout/NotificationItem.jsx
import {
  Video,
  Calendar,
  AlertCircle,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NotificationItem = ({
  notif,
  darkMode,
  markAsRead,
  getNotificationIcon,
  formatNotificationTime,
  COLORS,
  isMobile = false,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Parse notification data
  const notificationData = notif.data ? JSON.parse(notif.data) : {};
  const hasJoinButton = notificationData.hasJoinButton === true;
  const roomId = notificationData.room_id;
  const joinLink =
    notificationData.join_link ||
    (roomId ? `/video-consultation/${roomId}` : null);
  const appointmentTime = notificationData.appointment_time;
  const doctorName = notificationData.doctor_name;
  const isFiveMinReminder = notificationData.type === '5_min_reminder';

  const NotifIcon = getNotificationIcon(notif.type);

  const handleJoinRoom = e => {
    e.stopPropagation();
    if (joinLink) {
      markAsRead(notif.notification_id);
      navigate(joinLink);
    }
  };

  const handleNotificationClick = () => {
    markAsRead(notif.notification_id);
    if (hasJoinButton && joinLink && !isHovered) {
      navigate(joinLink);
    }
  };

  if (isMobile) {
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
          <div
            className="p-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor: darkMode
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(59, 130, 246, 0.1)',
            }}
          >
            <NotifIcon className="h-5 w-5" style={{ color: COLORS.primary }} />
          </div>
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
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.text.secondary }}
            >
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

            <p
              className="text-xs mt-2"
              style={{ color: COLORS.text.secondary }}
            >
              {formatNotificationTime(notif.created_at)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div
      key={notif.notification_id}
      className={`px-4 py-3 border-b cursor-pointer transition-all duration-200 ${
        notif.type === 'appointment_reminder' ? 'border-l-4' : ''
      }`}
      style={{
        backgroundColor: !notif.is_read
          ? darkMode
            ? isFiveMinReminder
              ? 'rgba(59, 130, 246, 0.15)'
              : 'rgba(59, 130, 246, 0.1)'
            : isFiveMinReminder
              ? 'rgba(59, 130, 246, 0.08)'
              : 'rgba(59, 130, 246, 0.05)'
          : 'transparent',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderLeftColor: isFiveMinReminder
          ? COLORS.primary
          : notif.type === 'appointment_reminder'
            ? COLORS.accent
            : 'transparent',
      }}
      onClick={handleNotificationClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-full flex-shrink-0 mt-1"
          style={{
            backgroundColor: isFiveMinReminder
              ? darkMode
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(59, 130, 246, 0.2)'
              : darkMode
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <NotifIcon
            className="h-4 w-4"
            style={{
              color: isFiveMinReminder ? COLORS.primary : COLORS.primary,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium text-sm flex items-center gap-2">
                {notif.title}
                {isFiveMinReminder && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: COLORS.primary + '20',
                      color: COLORS.primary,
                    }}
                  >
                    Live
                  </span>
                )}
              </p>
              {doctorName && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: COLORS.text.secondary }}
                >
                  Dr. {doctorName}
                </p>
              )}
            </div>
            {!notif.is_read && (
              <div
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                style={{
                  backgroundColor: isFiveMinReminder
                    ? COLORS.status.green
                    : COLORS.primary,
                }}
              />
            )}
          </div>

          <p className="text-sm mt-2" style={{ color: COLORS.text.secondary }}>
            {notif.message}
          </p>

          {(appointmentTime || roomId) && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {appointmentTime && (
                <div
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                    color: COLORS.text.secondary,
                  }}
                >
                  ⏰ {appointmentTime}
                </div>
              )}

              {roomId && (
                <div
                  className="text-xs px-2 py-1 rounded flex items-center gap-1"
                  style={{
                    backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                    color: darkMode ? '#93c5fd' : '#1e40af',
                  }}
                >
                  <Video className="h-3 w-3" />
                  Room: {roomId.substring(0, 8)}...
                </div>
              )}
            </div>
          )}

          {hasJoinButton && joinLink && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant={isFiveMinReminder ? 'default' : 'outline'}
                size="sm"
                icon={Video}
                onClick={handleJoinRoom}
                className="gap-2 flex-1"
                style={
                  isFiveMinReminder
                    ? {
                        backgroundColor: COLORS.primary,
                        color: 'white',
                      }
                    : {}
                }
              >
                {isFiveMinReminder ? 'Join Consultation Now' : 'Join Room'}
              </Button>

              {isFiveMinReminder && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ExternalLink}
                  onClick={handleJoinRoom}
                  title="Open in new tab"
                />
              )}
            </div>
          )}

          <p className="text-xs mt-3" style={{ color: COLORS.text.secondary }}>
            {formatNotificationTime(notif.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
