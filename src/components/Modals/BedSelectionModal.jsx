import { useState, useEffect } from 'react';
import {
  Building2,
  Bed as BedIcon,
  CheckCircle,
  XCircle,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';
import Modal from '..//ui/Modal';
import { COLORS } from '../../configs/CONST';
import bedApi from '../../services/bedApi';

const BedSelectionModal = ({ isOpen, onClose, onSelectBed, admissionType }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [view, setView] = useState('floors'); // 'floors', 'rooms', 'beds'
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch floors on mount
  useEffect(() => {
    if (isOpen) {
      fetchFloors();
    }
  }, [isOpen]);

  const fetchFloors = async () => {
    setLoading(true);
    try {
      const response = await bedApi.getFloorSummary();
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
      const response = await bedApi.getRoomsSummary(floorNumber);
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
      const response = await bedApi.getRoomBeds(roomId);
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
  };

  const handleRoomClick = room => {
    setSelectedRoom(room);
    setView('beds');
    fetchBeds(room.room_id);
  };

  const handleBedClick = bed => {
    if (bed.bed_status === 'available') {
      setSelectedBed(bed);
    }
  };

  const handleConfirmBed = () => {
    if (selectedBed) {
      onSelectBed(selectedBed);
      onClose();
    }
  };

  const handleBack = () => {
    if (view === 'beds') {
      setView('rooms');
      setSelectedRoom(null);
      setSelectedBed(null);
    } else if (view === 'rooms') {
      setView('floors');
      setSelectedFloor(null);
      setRooms([]);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Bed for Admission"
      size="xl"
    >
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: COLORS.text.secondary }}
        >
          <button
            onClick={() => setView('floors')}
            className="hover:underline"
            style={{
              color: view === 'floors' ? COLORS.primary : COLORS.text.secondary,
            }}
          >
            Floors
          </button>
          {selectedFloor && (
            <>
              <span>/</span>
              <button
                onClick={() => setView('rooms')}
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

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: COLORS.primary }}
              />
            </div>
          ) : (
            <>
              {/* Floor View */}
              {view === 'floors' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        <div>
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
                        <div className="flex gap-2 mt-2">
                          <div
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: COLORS.badge.success.bg,
                              color: COLORS.badge.success.text,
                            }}
                          >
                            {floor.available_beds} free
                          </div>
                          <div
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: COLORS.badge.danger.bg,
                              color: COLORS.badge.danger.text,
                            }}
                          >
                            {floor.occupied_beds} occupied
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Room View */}
              {view === 'rooms' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        cursor:
                          room.available_beds === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div className="flex flex-col gap-2">
                        <div
                          className="font-semibold"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          Room {room.room_number}
                        </div>
                        <div
                          className="text-xs px-2 py-1 rounded inline-block"
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
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Bed View */}
              {view === 'beds' && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {beds.map(bed => {
                    const isSelected = selectedBed?.bed_id === bed.bed_id;
                    const isAvailable = bed.bed_status === 'available';

                    return (
                      <button
                        key={bed.bed_id}
                        onClick={() => handleBedClick(bed)}
                        disabled={!isAvailable}
                        className="p-4 rounded-lg border-2 transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? isDarkMode
                              ? COLORS.primary
                              : COLORS.primary + '20'
                            : isDarkMode
                              ? COLORS.surface.dark
                              : COLORS.surface.light,
                          borderColor: isSelected
                            ? COLORS.primary
                            : getBedStatusColor(bed.bed_status),
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          opacity: isAvailable ? 1 : 0.6,
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            style={{ color: getBedStatusColor(bed.bed_status) }}
                          >
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
            </>
          )}
        </div>

        {/* Selected Bed Info */}
        {selectedBed && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.success.bg,
              borderColor: COLORS.success,
            }}
          >
            <div
              className="font-semibold mb-2"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Selected Bed
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Floor {selectedFloor?.floor_number} → Room{' '}
              {selectedRoom?.room_number} → Bed {selectedBed.bed_number}
            </div>
            <div
              className="text-xs mt-1 px-2 py-1 rounded inline-block"
              style={{
                backgroundColor: COLORS.badge.info.bg,
                color: COLORS.badge.info.text,
              }}
            >
              {selectedBed.bed_type.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="flex justify-between items-center pt-4 border-t"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <button
            onClick={handleBack}
            disabled={view === 'floors'}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor:
                view === 'floors'
                  ? COLORS.surface.darkHover
                  : isDarkMode
                    ? COLORS.button.secondary.bg
                    : COLORS.button.outline.bgHover,
              color:
                view === 'floors'
                  ? COLORS.text.secondary
                  : isDarkMode
                    ? COLORS.text.white
                    : COLORS.text.primary,
              cursor: view === 'floors' ? 'not-allowed' : 'pointer',
              opacity: view === 'floors' ? 0.5 : 1,
            }}
          >
            Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : COLORS.button.outline.bgHover,
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmBed}
              disabled={!selectedBed}
              className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{
                backgroundColor: selectedBed
                  ? COLORS.button.primary.bg
                  : COLORS.surface.darkHover,
                color: COLORS.text.white,
                cursor: selectedBed ? 'pointer' : 'not-allowed',
                opacity: selectedBed ? 1 : 0.5,
              }}
            >
              <BedIcon className="w-5 h-5" />
              Confirm Bed
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BedSelectionModal;
