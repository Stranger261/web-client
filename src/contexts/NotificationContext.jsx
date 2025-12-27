import { createContext, useContext, useEffect, useState } from 'react';
import notificationApi from '../services/notificationApi';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notifPagination, setNotifPagination] = useState({
    currentPage: 1,
    limit: 3,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {}, []);

  const getUserNotifications = async filters => {
    try {
      const userNotification = await notificationApi.getUserNotification(
        filters
      );
      setNotifications(userNotification.data?.notification);
      setNotifPagination(userNotification.data?.pagination);

      return userNotification?.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const readNotification = async notifId => {
    try {
      const latestNotification = await notificationApi.readNotification(
        notifId
      );

      console.log(latestNotification);

      return latestNotification?.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const readAllNotification = async () => {
    try {
      const res = await notificationApi.markedReadAllNotif();

      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const value = {
    notifications,
    notifPagination,
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
