// pages/IBMS/components/FloorView.jsx
import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Wrench,
  Sparkles,
  Clock,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import bedService from '../../../services/bedApi';
import BedDetailsModal from './Modals/BedDetailsModal';
import { useIBMSSocket } from '../../../hooks/useIBMSSocket';

const FloorView = ({ isDarkMode, userRole }) => {
  const [view, setView] = useState('floors'); // 'floors', 'rooms', 'beds'
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showBedDetails, setShowBedDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const { joinFloor, leaveFloor, joinRoomById, leaveRoomById, isConnected } =
    useIBMSSocket({
      onBedStatusChanged: data => {
        // Update beds list
        setBeds(prevBeds =>
          prevBeds.map(bed =>
            bed.bed_id === data.bed_id
              ? { ...bed, bed_status: data.new_status }
              : bed,
          ),
        );

        // Refresh stats if needed
        if (view === 'floors') fetchFloors();
        if (view === 'rooms' && selectedFloor)
          fetchRooms(selectedFloor.floor_number);
      },

      onBedAssigned: data => {
        setBeds(prevBeds =>
          prevBeds.map(bed =>
            bed.bed_id === data.bed_id
              ? { ...bed, bed_status: 'occupied' }
              : bed,
          ),
        );

        if (view === 'floors') fetchFloors();
        if (view === 'rooms' && selectedFloor)
          fetchRooms(selectedFloor.floor_number);
      },

      onBedReleased: data => {
        setBeds(prevBeds =>
          prevBeds.map(bed =>
            bed.bed_id === data.bed_id
              ? { ...bed, bed_status: 'cleaning' }
              : bed,
          ),
        );

        if (view === 'floors') fetchFloors();
        if (view === 'rooms' && selectedFloor)
          fetchRooms(selectedFloor.floor_number);
      },

      onFloorStatsUpdated: data => {
        if (selectedFloor?.floor_number === data.floor_number) {
          fetchRooms(data.floor_number);
        }
        fetchFloors();
      },
    });

  // Fetch floors on mount
  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (selectedFloor && isConnected) {
      joinFloor(selectedFloor.floor_number);
    }

    return () => {
      if (selectedFloor) {
        leaveFloor(selectedFloor.floor_number);
      }
    };
  }, [selectedFloor, isConnected, joinFloor, leaveFloor]);

  useEffect(() => {
    if (selectedRoom && isConnected) {
      joinRoomById(selectedRoom.room_id);
    }

    return () => {
      if (selectedRoom) {
        leaveRoomById(selectedRoom.room_id);
      }
    };
  }, [selectedRoom, isConnected, joinRoomById, leaveRoomById]);

  // Listen to real-time updates
  // useEffect(() => {
  //   const handleBedStatusChanged = data => {
  //     console.log('🔴 Bed status changed:', data);

  //     // Update beds list
  //     setBeds(prevBeds =>
  //       prevBeds.map(bed =>
  //         bed.bed_id === data.bed_id
  //           ? { ...bed, bed_status: data.new_status }
  //           : bed,
  //       ),
  //     );

  //     // Refresh stats
  //     if (view === 'floors') fetchFloors();
  //     if (view === 'rooms' && selectedFloor)
  //       fetchRooms(selectedFloor.floor_number);
  //   };

  //   const handleFloorStatsUpdated = data => {
  //     if (selectedFloor?.floor_number === data.floor_number) {
  //       fetchRooms(data.floor_number);
  //     }
  //     fetchFloors();
  //   };

  //   on(SOCKET_EVENTS.BED_STATUS_CHANGED, handleBedStatusChanged);
  //   on(SOCKET_EVENTS.BED_ASSIGNED, handleBedStatusChanged);
  //   on(SOCKET_EVENTS.BED_RELEASED, handleBedStatusChanged);
  //   on(SOCKET_EVENTS.FLOOR_STATS_UPDATED, handleFloorStatsUpdated);

  //   return () => {
  //     off(SOCKET_EVENTS.BED_STATUS_CHANGED, handleBedStatusChanged);
  //     off(SOCKET_EVENTS.BED_ASSIGNED, handleBedStatusChanged);
  //     off(SOCKET_EVENTS.BED_RELEASED, handleBedStatusChanged);
  //     off(SOCKET_EVENTS.FLOOR_STATS_UPDATED, handleFloorStatsUpdated);
  //   };
  // }, [on, off, view, selectedFloor]);

  const fetchFloors = async () => {
    setLoading(true);
    try {
      const response = await bedService.getFloorSummary();
      setFloors(response.data);
    } catch (error) {
      console.error('Error fetching floors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async floorNumber => {
    setLoading(true);
    try {
      const response = await bedService.getRoomsSummary(floorNumber);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBeds = async roomId => {
    setLoading(true);
    try {
      const response = await bedService.getRoomBeds(roomId);
      setBeds(response.data);
    } catch (error) {
      console.error('Error fetching beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFloorClick = floor => {
    setSelectedFloor(floor);
    setView('rooms');
    fetchRooms(floor.floor_number);
    joinFloor(floor.floor_number);
  };

  const handleRoomClick = room => {
    setSelectedRoom(room);
    setView('beds');
    fetchBeds(room.room_id);
    joinRoomById(room.room_id);
  };

  const handleBedClick = bed => {
    setSelectedBed(bed);
    setShowBedDetails(true);
  };

  const handleBack = () => {
    if (view === 'beds') {
      setView('rooms');
      setSelectedRoom(null);
      if (selectedRoom) leaveRoomById(selectedRoom.room_id);
    } else if (view === 'rooms') {
      setView('floors');
      setSelectedFloor(null);
      if (selectedFloor) leaveRoomById(selectedRoom.room_id);
    }
  };

  const getBedStatusIcon = status => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5" />;
      case 'occupied':
        return <XCircle className="w-5 h-5" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      case 'reserved':
        return <Clock className="w-5 h-5" />;
      case 'cleaning':
        return <Sparkles className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getBedStatusColor = status => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'occupied':
        return COLORS.danger;
      case 'maintenance':
        return COLORS.warning;
      case 'reserved':
        return COLORS.info;
      case 'cleaning':
        return COLORS.warning;
      default:
        return COLORS.text.secondary;
    }
  };

  if (
    loading &&
    (view === 'floors'
      ? floors.length === 0
      : view === 'rooms'
        ? rooms.length === 0
        : beds.length === 0)
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: COLORS.primary }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: COLORS.text.secondary }}
      >
        <button
          onClick={() => {
            setView('floors');
            setSelectedFloor(null);
            setSelectedRoom(null);
          }}
          className="hover:underline"
          style={{
            color: view === 'floors' ? COLORS.primary : COLORS.text.secondary,
          }}
        >
          All Floors
        </button>
        {selectedFloor && (
          <>
            <span>/</span>
            <button
              onClick={() => {
                setView('rooms');
                setSelectedRoom(null);
              }}
              className="hover:underline"
              style={{
                color:
                  view === 'rooms' ? COLORS.primary : COLORS.text.secondary,
              }}
            >
              Floor {selectedFloor.floor_number}
            </button>
          </>
        )}
        {selectedRoom && (
          <>
            <span>/</span>
            <span style={{ color: COLORS.primary }}>
              Room {selectedRoom.room_number}
            </span>
          </>
        )}
      </div>

      {/* Back Button */}
      {view !== 'floors' && (
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.darkHover
              : COLORS.surface.lightHover,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          ← Back
        </button>
      )}

      {/* Floor View */}
      {view === 'floors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {floors.map(floor => (
            <button
              key={floor.floor_number}
              onClick={() => handleFloorClick(floor)}
              className="p-6 rounded-lg border-2 transition-all hover:shadow-lg"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <Building2
                  className="w-12 h-12"
                  style={{ color: COLORS.primary }}
                />
                <div className="text-center">
                  <div
                    className="font-bold text-lg"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Floor {floor.floor_number}
                  </div>
                  <div
                    className="text-sm mt-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {floor.available_beds}/{floor.total_beds} available
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-2 w-full">
                  <div
                    className="flex-1 px-2 py-1 rounded text-xs text-center"
                    style={{
                      backgroundColor: COLORS.badge.success.bg,
                      color: COLORS.badge.success.text,
                    }}
                  >
                    {floor.available_beds} Free
                  </div>
                  <div
                    className="flex-1 px-2 py-1 rounded text-xs text-center"
                    style={{
                      backgroundColor: COLORS.badge.danger.bg,
                      color: COLORS.badge.danger.text,
                    }}
                  >
                    {floor.occupied_beds} Occupied
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(floor.occupied_beds / floor.total_beds) * 100}%`,
                      backgroundColor: COLORS.danger,
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Room View */}
      {view === 'rooms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <button
              key={room.room_id}
              onClick={() => handleRoomClick(room)}
              disabled={room.available_beds === 0}
              className="p-4 rounded-lg border-2 transition-all hover:shadow-lg"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
                borderColor:
                  room.available_beds === 0
                    ? COLORS.text.secondary
                    : isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                opacity: room.available_beds === 0 ? 0.5 : 1,
                cursor: room.available_beds === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div
                    className="font-semibold text-lg"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Room {room.room_number}
                  </div>
                  <Users
                    className="w-5 h-5"
                    style={{ color: COLORS.text.secondary }}
                  />
                </div>

                <div
                  className="text-xs px-2 py-1 rounded inline-block w-fit"
                  style={{
                    backgroundColor: COLORS.badge.info.bg,
                    color: COLORS.badge.info.text,
                  }}
                >
                  {room.room_type.replace('_', ' ').toUpperCase()}
                </div>

                <div
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  {room.available_beds}/{room.total_beds} beds available
                </div>

                {/* Occupancy Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${((room.total_beds - room.available_beds) / room.total_beds) * 100}%`,
                      backgroundColor:
                        room.available_beds === 0
                          ? COLORS.danger
                          : COLORS.success,
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bed View */}
      {view === 'beds' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {beds.map(bed => {
            const statusColor = getBedStatusColor(bed.bed_status);

            return (
              <button
                key={bed.bed_id}
                onClick={() => handleBedClick(bed)}
                className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                  borderColor: statusColor,
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div style={{ color: statusColor }}>
                    {getBedStatusIcon(bed.bed_status)}
                  </div>
                  <div
                    className="font-semibold text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {bed.bed_number}
                  </div>
                  <div
                    className="text-xs capitalize"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {bed.bed_status.replace('_', ' ')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bed Details Modal */}
      {showBedDetails && selectedBed && (
        <BedDetailsModal
          isOpen={showBedDetails}
          onClose={() => {
            setShowBedDetails(false);
            setSelectedBed(null);
          }}
          bed={selectedBed}
          isDarkMode={isDarkMode}
          userRole={userRole}
          onUpdate={() => {
            if (selectedRoom) fetchBeds(selectedRoom.room_id);
          }}
        />
      )}
    </div>
  );
};

export default FloorView;
