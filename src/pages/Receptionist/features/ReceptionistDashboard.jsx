import { useEffect, useState } from 'react';

import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

const ReceptionistDashboard = () => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isConnected || !socket) return;

    // socket.on('new-appointment', data => {
    //   console.log(data);
    // });
    socket.emit('receptionist-join', {
      role: currentUser.role,
      staff_uuid: currentUser.staff?.staff_uuid,
    });

    socket.on('new-appointment-booked', data => {
      console.log('new appontment booked: ', data);
    });
  }, [isConnected, socket, currentUser]);

  return (
    <div>
      <h1 className="text-3xl">RECEPTIONIST DASHBOARD</h1>
    </div>
  );
};

export default ReceptionistDashboard;
