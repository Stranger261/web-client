// components/Baselayout/NotificationItem.jsx
import {
  Video,
  Calendar,
  AlertCircle,
  Check,
  Clock,
  ExternalLink,
  UserX, // Add this for no-show
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
  const joinLink = `/patient/video-call/${roomId}`;

  const appointmentTime = notificationData.appointment_time;
  const doctorName = notificationData.doctor_name;
  const patientName = notificationData.patient_name;
  const appointmentId = notificationData.appointment_id;

  const isFiveMinReminder = notificationData.type === '5_min_reminder';
  const isNoShow = notif.type === 'appointment_no_show';

  const NotifIcon = getNotificationIcon(notif.type);

  const handleJoinRoom = e => {
    e.stopPropagation();
    if (joinLink) {
      markAsRead(notif.notification_id);
      console.log(joinLink);
      navigate(joinLink, { replace: true });
    }
  };

  const handleNotificationClick = () => {
    markAsRead(notif.notification_id);

    // Navigate to appointment details if it's a no-show
    if (isNoShow && appointmentId) {
      navigate(`/appointments/${appointmentId}`);
      return;
    }

    if (hasJoinButton && joinLink && !isHovered) {
      navigate(joinLink, { replace: true });
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
              ? isNoShow
                ? 'rgba(239, 68, 68, 0.15)' // Red tint for no-show
                : 'rgba(59, 130, 246, 0.1)'
              : isNoShow
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(59, 130, 246, 0.05)'
            : 'transparent',
          borderColor: darkMode ? '#374151' : '#e5e7eb',
          borderLeftWidth: isNoShow || isFiveMinReminder ? '4px' : '0',
          borderLeftColor: isNoShow
            ? COLORS.status.red
            : isFiveMinReminder
              ? COLORS.primary
              : 'transparent',
        }}
        onClick={() => markAsRead(notif.notification_id)}
      >
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor: isNoShow
                ? darkMode
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(239, 68, 68, 0.1)'
                : darkMode
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(59, 130, 246, 0.1)',
            }}
          >
            <NotifIcon
              className="h-5 w-5"
              style={{ color: isNoShow ? COLORS.status.red : COLORS.primary }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{notif.title}</p>
              {!notif.is_read && (
                <div
                  className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                  style={{
                    backgroundColor: isNoShow
                      ? COLORS.status.red
                      : COLORS.primary,
                  }}
                />
              )}
            </div>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              {notif.message}
            </p>

            {/* Show patient name for no-show notifications */}
            {isNoShow && patientName && (
              <p
                className="text-sm mt-1 font-medium"
                style={{ color: COLORS.status.red }}
              >
                Patient: {patientName}
              </p>
            )}

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

            {/* View appointment button for no-shows */}
            {isNoShow && appointmentId && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Calendar}
                  onClick={() => navigate(`/appointments/${appointmentId}`)}
                  className="gap-2 w-full justify-center"
                >
                  View Appointment
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
        notif.type === 'appointment_reminder' || isNoShow ? 'border-l-4' : ''
      }`}
      style={{
        backgroundColor: !notif.is_read
          ? darkMode
            ? isNoShow
              ? 'rgba(239, 68, 68, 0.15)'
              : isFiveMinReminder
                ? 'rgba(59, 130, 246, 0.15)'
                : 'rgba(59, 130, 246, 0.1)'
            : isNoShow
              ? 'rgba(239, 68, 68, 0.08)'
              : isFiveMinReminder
                ? 'rgba(59, 130, 246, 0.08)'
                : 'rgba(59, 130, 246, 0.05)'
          : 'transparent',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderLeftColor: isNoShow
          ? COLORS.status.red
          : isFiveMinReminder
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
            backgroundColor: isNoShow
              ? darkMode
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(239, 68, 68, 0.2)'
              : isFiveMinReminder
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
              color: isNoShow
                ? COLORS.status.red
                : isFiveMinReminder
                  ? COLORS.primary
                  : COLORS.primary,
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
                {isNoShow && (
                  <span
                    className="text-xs px-1 py-1 rounded-full"
                    style={{
                      backgroundColor: COLORS.status.red + '20',
                      color: COLORS.status.red,
                    }}
                  >
                    No-Show
                  </span>
                )}
              </p>
              {(doctorName || patientName) && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: COLORS.text.secondary }}
                >
                  {isNoShow ? `Patient: ${patientName}` : `Dr. ${doctorName}`}
                </p>
              )}
            </div>
            {!notif.is_read && (
              <div
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                style={{
                  backgroundColor: isNoShow
                    ? COLORS.status.red
                    : isFiveMinReminder
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
