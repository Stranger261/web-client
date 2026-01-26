// contexts/SocketContext.jsx
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
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('reconnect', attemptNumber => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socketInstance.on('connect_error', error => {
      console.error('🔴 Socket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Helper functions for room management
  const joinRoom = room => {
    if (socket && isConnected) {
      socket.emit('join', room);
      console.log(`📍 Joined room: ${room}`);
    }
  };

  const leaveRoom = room => {
    if (socket && isConnected) {
      socket.emit('leave', room);
      console.log(`🚪 Left room: ${room}`);
    }
  };

  // Helper to listen to events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Helper to stop listening
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  // Helper to emit events
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    on,
    off,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }

  return context;
};

export default SocketProvider;
