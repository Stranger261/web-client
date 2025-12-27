import { io } from 'socket.io-client';

import { useState, useEffect } from 'react';

import { APPOINTMENT_SERVICE_BASE_URL } from '../configs/CONST';

const SOCKET_URL = APPOINTMENT_SERVICE_BASE_URL;

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        setIsConnected(true);
        setSocketId(socket.id);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
        setSocketId(null);
      });
    }
    return () => {};
  }, []);

  return { isConnected, socketId, socket };
};
