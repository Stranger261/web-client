import { useState, useEffect } from 'react';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../../configs/socketEvents';
import bedService from '../../../services/bedApi';
import { useSocket } from '../../../contexts/SocketContext';
import IBMSDashboard from '../components/IBMS/pages/IBMSDashboard';

// const NurseBedManagement = () => {
//   const [floors, setFloors] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [beds, setBeds] = useState([]);
//   const [selectedFloor, setSelectedFloor] = useState(null);
//   const [selectedRoom, setSelectedRoom] = useState(null);

//   const { joinRoom, leaveRoom, on, off } = useSocket();

//   // Fetch initial data
//   useEffect(() => {
//     fetchFloors();

//     // Join bed management room for global updates
//     joinRoom(SOCKET_ROOMS.BED_MANAGEMENT);

//     return () => {
//       leaveRoom(SOCKET_ROOMS.BED_MANAGEMENT);
//     };
//   }, []);

//   // Listen to real-time bed status changes
//   useEffect(() => {
//     const handleBedStatusChanged = data => {
//       console.log('🔴 Bed status changed:', data);

//       // Update bed in the list
//       setBeds(prevBeds =>
//         prevBeds.map(bed =>
//           bed.bed_id === data.bed_id
//             ? { ...bed, bed_status: data.new_status }
//             : bed,
//         ),
//       );

//       // Refresh floor stats if we're viewing that floor
//       if (selectedFloor === data.room?.floor_number) {
//         fetchRooms(selectedFloor);
//       }
//     };

//     const handleBedAssigned = data => {
//       console.log('🔴 Bed assigned:', data);

//       // Update bed status
//       setBeds(prevBeds =>
//         prevBeds.map(bed =>
//           bed.bed_id === data.bed_id ? { ...bed, bed_status: 'occupied' } : bed,
//         ),
//       );

//       // Show notification
//       showNotification(
//         `Bed ${data.bed_number} assigned to admission #${data.admission_id}`,
//       );

//       // Refresh data
//       if (selectedFloor) fetchRooms(selectedFloor);
//       if (selectedRoom) fetchBeds(selectedRoom);
//     };

//     const handleBedReleased = data => {
//       console.log('🔴 Bed released:', data);

//       setBeds(prevBeds =>
//         prevBeds.map(bed =>
//           bed.bed_id === data.bed_id ? { ...bed, bed_status: 'cleaning' } : bed,
//         ),
//       );

//       showNotification(`Bed ${data.bed_number} released - needs cleaning`);

//       if (selectedFloor) fetchRooms(selectedFloor);
//       if (selectedRoom) fetchBeds(selectedRoom);
//     };

//     const handleFloorStatsUpdated = data => {
//       console.log('🔴 Floor stats updated:', data);

//       // Refresh floor summary
//       fetchFloors();

//       if (selectedFloor === data.floor_number) {
//         fetchRooms(data.floor_number);
//       }
//     };

//     const handleAdmissionCreated = data => {
//       console.log('🔴 New admission:', data);

//       showNotification(
//         `New admission: ${data.patient_name} - Bed ${data.bed_assignment.bed.bed_number}`,
//       );

//       // Refresh relevant data
//       fetchFloors();
//     };

//     // Register event listeners
//     on(SOCKET_EVENTS.BED_STATUS_CHANGED, handleBedStatusChanged);
//     on(SOCKET_EVENTS.BED_ASSIGNED, handleBedAssigned);
//     on(SOCKET_EVENTS.BED_RELEASED, handleBedReleased);
//     on(SOCKET_EVENTS.FLOOR_STATS_UPDATED, handleFloorStatsUpdated);
//     on(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionCreated);

//     return () => {
//       // Cleanup listeners
//       off(SOCKET_EVENTS.BED_STATUS_CHANGED, handleBedStatusChanged);
//       off(SOCKET_EVENTS.BED_ASSIGNED, handleBedAssigned);
//       off(SOCKET_EVENTS.BED_RELEASED, handleBedReleased);
//       off(SOCKET_EVENTS.FLOOR_STATS_UPDATED, handleFloorStatsUpdated);
//       off(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionCreated);
//     };
//   }, [on, off, selectedFloor, selectedRoom]);

//   // Join/leave floor-specific room
//   useEffect(() => {
//     if (selectedFloor) {
//       joinRoom(SOCKET_ROOMS.FLOOR(selectedFloor));
//       fetchRooms(selectedFloor);
//     }

//     return () => {
//       if (selectedFloor) {
//         leaveRoom(SOCKET_ROOMS.FLOOR(selectedFloor));
//       }
//     };
//   }, [selectedFloor]);

//   // Join/leave room-specific room
//   useEffect(() => {
//     if (selectedRoom) {
//       joinRoom(SOCKET_ROOMS.ROOM(selectedRoom));
//       fetchBeds(selectedRoom);
//     }

//     return () => {
//       if (selectedRoom) {
//         leaveRoom(SOCKET_ROOMS.ROOM(selectedRoom));
//       }
//     };
//   }, [selectedRoom]);

//   const fetchFloors = async () => {
//     try {
//       const response = await bedService.getFloorSummary();
//       setFloors(response.data);
//     } catch (error) {
//       console.error('Error fetching floors:', error);
//     }
//   };

//   const fetchRooms = async floorNumber => {
//     try {
//       const response = await bedService.getRoomsSummary(floorNumber);
//       setRooms(response.data);
//     } catch (error) {
//       console.error('Error fetching rooms:', error);
//     }
//   };

//   const fetchBeds = async roomId => {
//     try {
//       const response = await bedService.getRoomBeds(roomId);
//       setBeds(response.data);
//     } catch (error) {
//       console.error('Error fetching beds:', error);
//     }
//   };

//   const showNotification = message => {
//     // Implement your notification system
//     console.log('📢 Notification:', message);
//   };

//   return (
//     <div>
//       {/* Your bed management UI here */}
//       {/* Floors, rooms, and beds will update automatically */}
//     </div>
//   );
// };

const NurseBedManagement = () => {
  return <IBMSDashboard />;
};

export default NurseBedManagement;
