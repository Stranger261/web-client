import { createContext, useContext, useEffect, useState } from 'react';
import notificationApi from '../services/notificationApi';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notifPagination, setNotifPagination] = useState({
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {}, []);

  const getUserNotifications = async filters => {
    try {
      const userNotification = await notificationApi.getUserNotification(
        filters
      );
      await getUserNotificationCount();
      setNotifications(userNotification.data?.notification);
      setNotifPagination(userNotification.data?.pagination);

      return userNotification?.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const getUserNotificationCount = async () => {
    try {
      const notifCount = await notificationApi.getUserNotificationCount();
      setUnreadCount(notifCount.data.unreadNotifCount);

      return notifCount;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const readNotification = async notifId => {
    try {
      const latestNotification = await notificationApi.readNotification(
        notifId
      );

      await getUserNotificationCount();

      return latestNotification?.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const readAllNotification = async () => {
    try {
      const res = await notificationApi.markedReadAllNotif();

      await getUserNotificationCount();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const value = {
    notifications,
    notifPagination,
    unreadCount,
    setNotifications,
    getUserNotifications,
    readNotification,
    readAllNotification,
    setNotifPagination,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return context;
};

export default NotificationProvider;
