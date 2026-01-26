// hooks/useIBMSSocket.js
import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../configs/socketEvents';

/**
 * Custom hook for IBMS real-time updates
 */
export const useIBMSSocket = (options = {}) => {
  const {
    onBedStatusChanged,
    onBedAssigned,
    onBedReleased,
    onBedTransferred,
    onAdmissionCreated,
    onAdmissionDischarged,
    onFloorStatsUpdated,
    onRoomOccupancyUpdated,
  } = options;

  const { socket, isConnected, joinRoom, leaveRoom, on, off } = useSocket();

  // Join bed management room on mount
  useEffect(() => {
    if (isConnected) {
      joinRoom(SOCKET_ROOMS.BED_MANAGEMENT);
    }

    return () => {
      if (isConnected) {
        leaveRoom(SOCKET_ROOMS.BED_MANAGEMENT);
      }
    };
  }, [isConnected, joinRoom, leaveRoom]);

  // Listen to bed status changes
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleBedStatusChanged = data => {
      console.log('🔴 Bed status changed:', data);
      if (onBedStatusChanged) onBedStatusChanged(data);
    };

    const handleBedAssigned = data => {
      console.log('🔴 Bed assigned:', data);
      if (onBedAssigned) onBedAssigned(data);
    };

    const handleBedReleased = data => {
      console.log('🔴 Bed released:', data);
      if (onBedReleased) onBedReleased(data);
    };

    const handleBedTransferred = data => {
      console.log('🔴 Bed transferred:', data);
      if (onBedTransferred) onBedTransferred(data);
    };

    const handleAdmissionCreated = data => {
      console.log('🔴 Admission created:', data);
      if (onAdmissionCreated) onAdmissionCreated(data);
    };

    const handleAdmissionDischarged = data => {
      console.log('🔴 Admission discharged:', data);
      if (onAdmissionDischarged) onAdmissionDischarged(data);
    };

    const handleFloorStatsUpdated = data => {
      console.log('🔴 Floor stats updated:', data);
      if (onFloorStatsUpdated) onFloorStatsUpdated(data);
    };

    const handleRoomOccupancyUpdated = data => {
      console.log('🔴 Room occupancy updated:', data);
      if (onRoomOccupancyUpdated) onRoomOccupancyUpdated(data);
    };

    // Register listeners
    on(SOCKET_EVENTS.BED_STATUS_CHANGED, handleBedStatusChanged);
    on(SOCKET_EVENTS.BED_ASSIGNED, handleBedAssigned);
    on(SOCKET_EVENTS.BED_RELEASED, handleBedReleased);
    on(SOCKET_EVENTS.BED_TRANSFERRED, handleBedTransferred);
    on(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionCreated);
    on(SOCKET_EVENTS.ADMISSION_DISCHARGED, handleAdmissionDischarged);
    on(SOCKET_EVENTS.FLOOR_STATS_UPDATED, handleFloorStatsUpdated);
    on(SOCKET_EVENTS.ROOM_OCCUPANCY_UPDATED, handleRoomOccupancyUpdated);

    return () => {
      // Cleanup listeners
      off(SOCKET_EVENTS.BED_STATUS_CHANGED, handleBedStatusChanged);
      off(SOCKET_EVENTS.BED_ASSIGNED, handleBedAssigned);
      off(SOCKET_EVENTS.BED_RELEASED, handleBedReleased);
      off(SOCKET_EVENTS.BED_TRANSFERRED, handleBedTransferred);
      off(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionCreated);
      off(SOCKET_EVENTS.ADMISSION_DISCHARGED, handleAdmissionDischarged);
      off(SOCKET_EVENTS.FLOOR_STATS_UPDATED, handleFloorStatsUpdated);
      off(SOCKET_EVENTS.ROOM_OCCUPANCY_UPDATED, handleRoomOccupancyUpdated);
    };
  }, [
    socket,
    isConnected,
    on,
    off,
    onBedStatusChanged,
    onBedAssigned,
    onBedReleased,
    onBedTransferred,
    onAdmissionCreated,
    onAdmissionDischarged,
    onFloorStatsUpdated,
    onRoomOccupancyUpdated,
  ]);

  // Helper to join specific floor
  const joinFloor = useCallback(
    floorNumber => {
      if (isConnected) {
        joinRoom(SOCKET_ROOMS.FLOOR(floorNumber));
      }
    },
    [isConnected, joinRoom],
  );

  // Helper to leave specific floor
  const leaveFloor = useCallback(
    floorNumber => {
      if (isConnected) {
        leaveRoom(SOCKET_ROOMS.FLOOR(floorNumber));
      }
    },
    [isConnected, leaveRoom],
  );

  // Helper to join specific room
  const joinRoomById = useCallback(
    roomId => {
      if (isConnected) {
        joinRoom(SOCKET_ROOMS.ROOM(roomId));
      }
    },
    [isConnected, joinRoom],
  );

  // Helper to leave specific room
  const leaveRoomById = useCallback(
    roomId => {
      if (isConnected) {
        leaveRoom(SOCKET_ROOMS.ROOM(roomId));
      }
    },
    [isConnected, leaveRoom],
  );

  return {
    socket,
    isConnected,
    joinFloor,
    leaveFloor,
    joinRoomById,
    leaveRoomById,
    joinRoom,
    leaveRoom,
  };
};
