import { io } from 'socket.io-client';
import { APPOINTMENT_SERVICE_BASE_URL } from '../configs/CONST';

const socket = io(APPOINTMENT_SERVICE_BASE_URL, {
  path: '/socket.io',
  withCredentials: true,
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Frontend connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Frontend disconnected');
});

export default socket;
