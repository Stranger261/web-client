import { Bell, ChevronDown, Moon, RefreshCw, Sun } from 'lucide-react';
import { COLORS, GRADIENTS } from '../../configs/CONST';
import { normalizedWord } from '../../utils/normalizedWord';
import { useRef } from 'react';
import LiveClockHeader from '../shared/LiveClock';
import { Button } from '../ui/button';

const Header = ({
  currentUser,
  darkMode,
  toggleDarkMode,
  toggleNotifications,
  unreadCount,
  isNotifOpen,
  notifPagination,
  isRefreshing,
  handleMarkAllAsRead,
  handleRefresh,
  handleScroll,
  notifications,
  getNotificationIcon,
  markAsRead,
  isLoadingMore,
  hasMore,
  formatNotificationTime,
  loadMore,
}) => {
  const notificationScrollRef = useRef(null);

  const uuidDisplay =
    currentUser?.staff?.staff_uuid ||
    currentUser?.person?.patient?.patient_uuid;
  return (
    <header
      className="hidden lg:flex items-center justify-between px-6 py-4 shadow-sm sticky top-0 z-20"
      style={{
        backgroundColor: darkMode ? COLORS.surface.dark : COLORS.surface.light,
        color: darkMode ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      <LiveClockHeader />
      <div className="flex items-center space-x-6">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="md"
          icon={darkMode ? Sun : Moon}
          iconOnly
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        />

        {/* Notifications - Desktop */}
        <div className="relative">
          <Button
            variant="ghost"
            size="md"
            icon={Bell}
            iconOnly
            onClick={toggleNotifications}
            className="relative"
          />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
              style={{ backgroundColor: COLORS.status.red }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Desktop Notification Dropdown */}
          {isNotifOpen && (
            <div
              className="absolute right-0 mt-2 w-96 rounded-lg shadow-lg overflow-hidden"
              style={{
                backgroundColor: darkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{
                  borderColor: darkMode ? '#374151' : '#e5e7eb',
                }}
              >
                <div>
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {notifPagination.total > 0 && (
                    <p
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
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
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={isRefreshing ? 'animate-spin' : ''}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </Button>
                </div>
              </div>

              {/* Notification List */}
              <div
                ref={notificationScrollRef}
                className="max-h-96 overflow-y-auto"
                onScroll={handleScroll}
              >
                {!notifications || notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
                    <Bell
                      className="h-12 w-12 opacity-30"
                      style={{ color: COLORS.text.secondary }}
                    />
                    <div>
                      <p
                        className="font-medium mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        No notifications
                      </p>
                      <p
                        className="text-sm mb-3"
                        style={{ color: COLORS.text.secondary }}
                      >
                        You're all caught up!
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={RefreshCw}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                ) : (
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
                            borderColor: darkMode ? '#374151' : '#e5e7eb',
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
                              <NotifIcon
                                className="h-4 w-4"
                                style={{ color: COLORS.primary }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm">
                                  {notif.title}
                                </p>
                                {!notif.is_read && (
                                  <div
                                    className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                                    style={{
                                      backgroundColor: COLORS.primary,
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
                              <p
                                className="text-xs mt-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {formatNotificationTime(notif.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isLoadingMore && (
                      <div className="px-4 py-3 text-center">
                        <RefreshCw
                          className="h-5 w-5 animate-spin mx-auto"
                          style={{ color: COLORS.primary }}
                        />
                      </div>
                    )}
                    {hasMore && !isLoadingMore && (
                      <div className="px-4 py-3 text-center">
                        <button
                          onClick={loadMore}
                          className="text-sm font-medium hover:underline transition-colors"
                          style={{ color: COLORS.primary }}
                        >
                          Load more ({notifPagination.currentPage} of{' '}
                          {notifPagination.totalPages})
                        </button>
                      </div>
                    )}
                    {!hasMore && notifications.length > 0 && (
                      <div className="px-4 py-3 text-center">
                        <p
                          className="text-xs"
                          style={{ color: COLORS.text.secondary }}
                        >
                          No more notifications
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{
              background: GRADIENTS.primary,
            }}
          >
            {currentUser?.person.first_name?.charAt(0) || 'P'}
          </div>
          <div className="hidden md:block">
            <div className="font-medium">
              {currentUser?.person.first_name || 'Patient'}{' '}
              {currentUser?.person.last_name || ''}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: COLORS.text.secondary, maxWidth: '200px' }}
            >
              {normalizedWord(
                currentUser.role === 'doctor' ? 'Staff' : currentUser.role,
              )}{' '}
              UUID: {uuidDisplay || 'N/A'}
            </div>
          </div>
          <ChevronDown
            className="h-5 w-5"
            style={{ color: COLORS.text.secondary }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
