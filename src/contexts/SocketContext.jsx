import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { SOCKET_URL } from '../configs/CONST';

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('disconnected');
    });

    socketInstance.on('reconnect', attemptNumber => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
  };
  return (
    <SocketContext.Provider value={value}> {children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }

  return context;
};

export default SocketProvider;
