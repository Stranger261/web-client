import { useRef } from 'react';
import {
  X,
  Bell,
  RefreshCw,
  Calendar,
  Video,
  AlertCircle,
  Check,
  Clock,
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { COLORS } from '../../../configs/CONST';
import { formatNotificationTime } from '../../../utils/FormatTime';

const NotificationPanel = ({
  isOpen,
  onClose,
  darkMode,
  notifications,
  unreadCount,
  isLoadingMore,
  isRefreshing,
  notifPagination,
  handlers,
}) => {
  const scrollRef = useRef(null);

  if (!isOpen) return null;

  const getNotificationIcon = type => {
    switch (type) {
      case 'new_appointment':
        return Calendar;
      case 'room_created':
        return Video;
      case 'alert':
        return AlertCircle;
      case 'success':
        return Check;
      default:
        return Clock;
    }
  };

  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      notifPagination.currentPage < notifPagination.totalPages &&
      !isLoadingMore
    ) {
      handlers.loadMore();
    }
  };

  const hasMore = notifPagination.currentPage < notifPagination.totalPages;

  // Desktop View
  const DesktopView = () => (
    <div
      className="absolute right-0 mt-2 w-96 rounded-lg shadow-lg overflow-hidden"
      style={{
        background: darkMode
          ? 'linear-gradient(180deg, #0f1f3d 0%, #1a2d4d 100%)'
          : COLORS.surface.light,
        border: `1px solid ${darkMode ? 'rgba(61, 90, 128, 0.3)' : '#e5e7eb'}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: darkMode ? 'rgba(61, 90, 128, 0.3)' : '#e5e7eb',
        }}
      >
        <div>
          <h3 className="font-semibold text-lg text-white">Notifications</h3>
          {notifPagination.total > 0 && (
            <p className="text-xs text-slate-400">
              {notifPagination.total} total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            iconOnly
            onClick={handlers.refresh}
            disabled={isRefreshing}
            className={`text-slate-300 hover:text-blue-400 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handlers.markAllAsRead}
            disabled={unreadCount === 0}
            className="text-slate-300 hover:text-blue-400"
          >
            Mark all read
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto"
        onScroll={handleScroll}
      >
        <NotificationList />
      </div>
    </div>
  );

  // Mobile View
  const MobileView = () => (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          background: darkMode
            ? 'linear-gradient(180deg, #0a1929 0%, #0f1f3d 30%, #1a2d4d 100%)'
            : COLORS.surface.light,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4 border-b"
          style={{
            borderColor: darkMode ? 'rgba(61, 90, 128, 0.3)' : '#e5e7eb',
          }}
        >
          <div>
            <h3 className="font-semibold text-lg text-white">Notifications</h3>
            {notifPagination.total > 0 && (
              <p className="text-xs text-slate-400">
                {notifPagination.total} total
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              iconOnly
              onClick={handlers.refresh}
              disabled={isRefreshing}
              className={`text-slate-300 hover:text-blue-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handlers.markAllAsRead}
              disabled={unreadCount === 0}
              className="text-slate-300 hover:text-blue-400"
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={X}
              iconOnly
              onClick={onClose}
              className="text-slate-300 hover:text-blue-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          <NotificationList />
        </div>
      </div>
    </div>
  );

  const NotificationList = () => {
    if (!notifications || notifications.length === 0) {
      return (
        <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
          <Bell className="h-12 w-12 opacity-30 text-slate-400" />
          <div>
            <p className="font-medium mb-1 text-slate-400">No notifications</p>
            <p className="text-sm mb-3 text-slate-500">You're all caught up!</p>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={handlers.refresh}
              disabled={isRefreshing}
              className="text-blue-400 hover:text-blue-300"
            >
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        {notifications.map(notif => {
          const NotifIcon = getNotificationIcon(notif.type);
          return (
            <div
              key={notif.notification_id}
              className="px-4 py-3 border-b hover:bg-opacity-50 cursor-pointer transition-colors"
              style={{
                backgroundColor: !notif.is_read
                  ? darkMode
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(59, 130, 246, 0.05)'
                  : 'transparent',
                borderColor: darkMode ? 'rgba(61, 90, 128, 0.3)' : '#e5e7eb',
              }}
              onClick={() => handlers.markAsRead(notif.notification_id)}
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
                  <NotifIcon className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-white">
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-blue-400" />
                    )}
                  </div>
                  <p className="text-sm mt-1 text-slate-400">{notif.message}</p>
                  <p className="text-xs mt-1 text-slate-500">
                    {formatNotificationTime(notif.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {isLoadingMore && (
          <div className="px-4 py-3 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-400" />
          </div>
        )}
        {hasMore && !isLoadingMore && (
          <div className="px-4 py-3 text-center">
            <button
              onClick={handlers.loadMore}
              className="text-sm font-medium hover:underline transition-colors text-blue-400"
            >
              Load more ({notifPagination.currentPage} of{' '}
              {notifPagination.totalPages})
            </button>
          </div>
        )}
        {!hasMore && notifications.length > 0 && (
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-slate-500">No more notifications</p>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="hidden lg:block">
        <DesktopView />
      </div>
      <div className="lg:hidden">
        <MobileView />
      </div>
    </>
  );
};

export default NotificationPanel;
