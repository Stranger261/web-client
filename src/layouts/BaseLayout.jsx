import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Bell,
  X,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
  Video,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

import LoadingOverlay from '../components/shared/LoadingOverlay';
import Sidebar from '../components/shared/Sidebar';
import { COLORS, GRADIENTS } from '../configs/CONST';
import { useSocket } from '../contexts/SocketContext';
import { Button } from '../components/ui/button';
import { formatNotificationTime } from '../utils/FormatTime';
import { getLocalDateString } from '../utils/dateFormatter';
import Header from '../components/Baselayout/Header';
import MobileHeader from '../components/Baselayout/MobileHeader';
import NotificationItem from '../components/Baselayout/NotificationItem';

const BaseLayout = () => {
  const navigate = useNavigate();

  const { isLoading, currentUser, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    setNotifications,
    getUserNotifications,
    readNotification,
    readAllNotification,
    notifPagination,
  } = useNotification();
  const { isConnected, socket } = useSocket();

  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add ref for handling click outside notification panel
  const notificationRef = useRef(null);

  // Load notifications only when opening for the first time
  useEffect(() => {
    getUserNotifications();
  }, []);

  // Handle click outside notification panel for BOTH mobile and desktop
  useEffect(() => {
    const handleClickOutside = event => {
      // Check if we should close notifications
      if (
        isNotifOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        !event.target.closest('[data-notification-button]') && // Don't close if clicking the notification button itself
        !event.target.closest('[data-notification-panel]') // Don't close if clicking inside notification panel
      ) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewAppointmentReminder = data => {
      // Refresh notifications to show the new one
      getUserNotifications();

      // Play a subtle sound for 5-minute reminders
      if (data.type === '5_min_before') {
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.3;
          audio.play();
        } catch (err) {
          console.log('Could not play notification sound');
        }

        // Auto-open notification panel for 5-minute reminders
        if (!isNotifOpen) {
          setIsNotifOpen(true);
        }
      }
    };

    socket.on('appointment_reminder', handleNewAppointmentReminder);

    return () => {
      socket.off('appointment_reminder', handleNewAppointmentReminder);
    };
  }, [socket, isConnected, getUserNotifications, isNotifOpen]);

  const hasMore = notifPagination.currentPage < notifPagination.totalPages;

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(prev => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleNotifications = () => {
    setIsNotifOpen(prev => !prev);
    // Don't reset pagination here, let useEffect handle initial load
  };

  const markAsRead = async id => {
    const notif = notifications.find(n => n.notification_id === id);
    if (notif?.is_read) return;

    try {
      await readNotification(id);
      setNotifications(prev =>
        prev?.map(notif =>
          notif.notification_id === id ? { ...notif, is_read: true } : notif,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev?.map(notif => ({ ...notif, is_read: true })),
      );
      await readAllNotification();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Reset notifications array before loading page 1
      setNotifications([]);
      await getUserNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      toast.error('Failed to refresh notifications');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = notifPagination.currentPage + 1;
      const filters = {
        status: '',
        limit: notifPagination.limit,
        page: nextPage,
      };
      // Call getUserNotifications which should append the new page to existing notifications
      const res = await getUserNotifications(filters);
      const moreNotif = res.notification;
      const latestNotifDisplay = [...notifications, ...moreNotif];
      setNotifications(latestNotifDisplay);
    } catch (error) {
      console.error('Error loading more notifications:', error);
      toast.error('Failed to load more notifications');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    notifPagination.currentPage,
    getUserNotifications,
    notifPagination.limit,
  ]);

  const handleScroll = useCallback(
    e => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      // Trigger load more when user scrolls to bottom (with 50px threshold)
      if (
        scrollHeight - scrollTop <= clientHeight + 50 &&
        hasMore &&
        !isLoadingMore
      ) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore],
  );

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

  const logoutHandler = async () => {
    setLoggingOut(true);
    try {
      await new Promise(res => setTimeout(res, 800));
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const newAppointmentHandler = useCallback(
    data => {
      const todayStr = new Date().toLocaleDateString('en-CA');

      if (data.appointment_date === todayStr) {
        window.dispatchEvent(new Event('refresh-today-appointments'));
      }

      setNotifications([]);
      getUserNotifications();
    },
    [getUserNotifications, setNotifications],
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new-appointment-booked', newAppointmentHandler);

    return () => {
      socket.off('new-appointment-booked', newAppointmentHandler);
    };
  }, [socket, isConnected, newAppointmentHandler]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const doctor_uuid = currentUser?.person?.staff?.staff_uuid;
    const lastname = currentUser?.person?.last_name;

    const newAppointmentHandler = data => {
      const todayStr = getLocalDateString();

      if (data.appointment_date === todayStr) {
        window.dispatchEvent(new Event('refresh-today-appointments'));
      }

      // Clear notifications and reload from page 1 to get the new one
      setNotifications([]);
      getUserNotifications();
    };

    if (doctor_uuid && lastname && currentUser.role === 'doctor') {
      socket.emit('doctor-room', {
        doctor_uuid,
        lastname,
      });

      socket.on('new-appointment-booked', newAppointmentHandler);
    }

    if (currentUser?.role === 'patient') {
      const roomName = `${currentUser?.user_uuid}_${currentUser?.person?.last_name}`;
      socket.emit('room:user', {
        roomName,
      });

      socket.on('video:room-created', () => {
        getUserNotifications();
      });
    }

    return () => {
      if (socket) {
        socket.off('new-appointment-booked', newAppointmentHandler);
      }
    };
  }, [
    isConnected,
    socket,
    currentUser,
    getUserNotifications,
    setNotifications,
  ]);

  if (isLoading || loggingOut) {
    return <LoadingOverlay />;
  }

  if (!currentUser && !isLoading) {
    console.log('no user in BaseLayout');
    return null;
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: darkMode
          ? COLORS.background.dark
          : COLORS.background.main,
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
        <Sidebar
          isOpen={isDesktopSidebarOpen}
          toggleSidebar={toggleDesktopSidebar}
          onLogout={logoutHandler}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              isOpen={true}
              toggleSidebar={() => setIsMobileSidebarOpen(false)}
              onLogout={logoutHandler}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Desktop Header (contains desktop notification panel) */}
        <Header
          currentUser={currentUser}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleNotifications={toggleNotifications}
          unreadCount={unreadCount}
          isNotifOpen={isNotifOpen}
          notifPagination={notifPagination}
          isRefreshing={isRefreshing}
          handleMarkAllAsRead={handleMarkAllAsRead}
          handleRefresh={handleRefresh}
          handleScroll={handleScroll}
          notifications={notifications}
          getNotificationIcon={getNotificationIcon}
          markAsRead={markAsRead}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          formatNotificationTime={formatNotificationTime}
          loadMore={loadMore}
          setIsNotifOpen={setIsNotifOpen}
          notificationRef={notificationRef} // Pass the ref to Header
        />

        {/* Mobile Header */}
        <MobileHeader
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleNotifications={toggleNotifications}
          unreadCount={unreadCount}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        {/* Mobile Notification Overlay ONLY */}
        {isNotifOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsNotifOpen(false)}
            />
            <div
              ref={notificationRef}
              className="absolute inset-0 flex flex-col"
              style={{
                backgroundColor: darkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
              data-notification-panel
            >
              {/* Mobile Notification Header */}
              <div
                className="flex items-center justify-between px-4 py-4 border-b"
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
                  <Button
                    variant="ghost"
                    size="md"
                    icon={X}
                    iconOnly
                    onClick={() => setIsNotifOpen(false)}
                  />
                </div>
              </div>

              {/* Mobile Notification List */}
              <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
                {!notifications || notifications.length === 0 ? (
                  <div className="px-4 py-16 text-center flex flex-col items-center gap-3">
                    <Bell
                      className="h-16 w-16 opacity-30"
                      style={{ color: COLORS.text.secondary }}
                    />
                    <div>
                      <p
                        className="font-medium text-lg mb-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        No notifications
                      </p>
                      <p
                        className="text-sm mb-4"
                        style={{ color: COLORS.text.secondary }}
                      >
                        You're all caught up!
                      </p>
                      <Button
                        variant="ghost"
                        size="md"
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
                      <NotificationItem
                        key={notif.notification_id}
                        notif={notif}
                        darkMode={darkMode}
                        markAsRead={markAsRead}
                        getNotificationIcon={getNotificationIcon}
                        formatNotificationTime={formatNotificationTime}
                        COLORS={COLORS}
                        isMobile={true} // Mobile version
                      />;
                    })}
                    {isLoadingMore && (
                      <div className="px-4 py-4 text-center">
                        <RefreshCw
                          className="h-6 w-6 animate-spin mx-auto"
                          style={{ color: COLORS.primary }}
                        />
                      </div>
                    )}
                    {hasMore && !isLoadingMore && (
                      <div className="px-4 py-4 text-center">
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
                      <div className="px-4 py-4 text-center">
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
          </div>
        )}

        <main
          className="flex-1 overflow-x-hidden"
          style={{
            backgroundColor: darkMode
              ? COLORS.background.dark
              : COLORS.background.light,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
