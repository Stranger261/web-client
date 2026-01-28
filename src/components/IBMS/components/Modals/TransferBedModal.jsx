import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Building2, BedDouble, ArrowRight, Search } from 'lucide-react';
import Modal from '../../../ui/Modal';
import { COLORS } from '../../../../configs/CONST';
import bedService from '../../../../services/bedApi';
import bedAssignmentApi from '../../../../services/bedAssignmentApi';

const TransferBedModal = ({
  isOpen,
  onClose,
  admission,
  isDarkMode,
  onTransferComplete,
}) => {
  const [view, setView] = useState('floors'); // 'floors', 'rooms', 'beds'
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [transferReason, setTransferReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // Get current bed info
  const currentBed = admission.bedAssignments?.find(ba => ba.is_current)?.bed;

  useEffect(() => {
    if (isOpen) {
      fetchFloors();
    }
  }, [isOpen]);

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
      // Filter out current bed and only show available beds
      const availableBeds = response.data.filter(
        bed =>
          bed.bed_status === 'available' && bed.bed_id !== currentBed?.bed_id,
      );
      setBeds(availableBeds);
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
    setSelectedBed(bed);
  };

  const handleTransfer = async () => {
    if (!selectedBed) {
      toast.error('Please select a bed');
      return;
    }

    if (!transferReason.trim()) {
      toast.error('Please provide a reason for transfer');
      return;
    }
    setTransferring(true);
    try {
      await bedAssignmentApi.transferPatient({
        admissionId: admission.admission_id,
        newBedId: selectedBed.bed_id,
        reason: transferReason,
      });

      toast.success('Patient transferred successfully');
      onTransferComplete();
    } catch (error) {
      console.error('Error transferring bed:', error);
      toast.error(error.response?.data?.message || 'Failed to transfer bed');
    } finally {
      setTransferring(false);
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
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Patient to New Bed"
      size="lg"
    >
      <div className="space-y-4">
        {/* Current Bed Info */}
        {currentBed && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.info.bg,
              borderColor: COLORS.info,
            }}
          >
            <p
              className="text-sm font-medium mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Current Bed
            </p>
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5" style={{ color: COLORS.info }} />
              <span
                className="font-bold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Bed {currentBed.bed_number}
              </span>
            </div>
          </div>
        )}

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
            Select Floor
          </button>
          {selectedFloor && (
            <>
              <span>→</span>
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
              <span>→</span>
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
            className="px-3 py-1 rounded text-sm"
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

        {/* Content */}
        <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: COLORS.primary }}
              />
            </div>
          ) : (
            <>
              {/* Floors */}
              {view === 'floors' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {floors.map(floor => (
                    <button
                      key={floor.floor_number}
                      onClick={() => handleFloorClick(floor)}
                      disabled={floor.available_beds === 0}
                      className="p-4 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.dark
                          : COLORS.surface.light,
                        borderColor: isDarkMode
                          ? COLORS.border.dark
                          : COLORS.border.light,
                        opacity: floor.available_beds === 0 ? 0.5 : 1,
                        cursor:
                          floor.available_beds === 0
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      <Building2
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: COLORS.primary }}
                      />
                      <p
                        className="font-bold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Floor {floor.floor_number}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {floor.available_beds} available
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Rooms */}
              {view === 'rooms' && (
                <div className="grid grid-cols-2 gap-3">
                  {rooms.map(room => (
                    <button
                      key={room.room_id}
                      onClick={() => handleRoomClick(room)}
                      disabled={room.available_beds === 0}
                      className="p-3 rounded-lg border-2 transition-all text-left"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.dark
                          : COLORS.surface.light,
                        borderColor: isDarkMode
                          ? COLORS.border.dark
                          : COLORS.border.light,
                        opacity: room.available_beds === 0 ? 0.5 : 1,
                        cursor:
                          room.available_beds === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <p
                        className="font-semibold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Room {room.room_number}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {room.available_beds} beds available
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Beds */}
              {view === 'beds' && (
                <>
                  {beds.length === 0 ? (
                    <div className="text-center py-8">
                      <p style={{ color: COLORS.text.secondary }}>
                        No available beds in this room
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {beds.map(bed => (
                        <button
                          key={bed.bed_id}
                          onClick={() => handleBedClick(bed)}
                          className="p-3 rounded-lg border-2 transition-all"
                          style={{
                            backgroundColor:
                              selectedBed?.bed_id === bed.bed_id
                                ? COLORS.primary + '20'
                                : isDarkMode
                                  ? COLORS.surface.dark
                                  : COLORS.surface.light,
                            borderColor:
                              selectedBed?.bed_id === bed.bed_id
                                ? COLORS.primary
                                : COLORS.success,
                          }}
                        >
                          <BedDouble
                            className="w-6 h-6 mx-auto mb-1"
                            style={{
                              color:
                                selectedBed?.bed_id === bed.bed_id
                                  ? COLORS.primary
                                  : COLORS.success,
                            }}
                          />
                          <p
                            className="text-sm font-semibold text-center"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {bed.bed_number}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Transfer Reason */}
        {selectedBed && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Reason for Transfer{' '}
              <span style={{ color: COLORS.danger }}>*</span>
            </label>
            <textarea
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              rows={3}
              placeholder="Why is the patient being transferred?"
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.input.backgroundDark
                  : COLORS.input.background,
                borderColor: isDarkMode
                  ? COLORS.input.borderDark
                  : COLORS.input.border,
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            />
          </div>
        )}

        {/* Selected Bed Summary */}
        {selectedBed && (
          <div
            className="p-3 rounded-lg border flex items-center justify-between"
            style={{
              backgroundColor: COLORS.badge.success.bg,
              borderColor: COLORS.success,
            }}
          >
            <div className="flex items-center gap-2">
              <BedDouble
                className="w-5 h-5"
                style={{ color: COLORS.success }}
              />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  New Bed: {selectedBed.bed_number}
                </p>
                <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                  Room {selectedRoom.room_number} • Floor{' '}
                  {selectedFloor.floor_number}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" style={{ color: COLORS.success }} />
          </div>
        )}

        {/* Actions */}
        <div
          className="flex gap-2 pt-4 border-t"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <button
            onClick={onClose}
            disabled={transferring}
            className="flex-1 px-4 py-2 rounded-lg font-medium"
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
            onClick={handleTransfer}
            disabled={!selectedBed || !transferReason.trim() || transferring}
            className="flex-1 px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor:
                selectedBed && transferReason.trim() && !transferring
                  ? COLORS.button.primary.bg
                  : COLORS.text.secondary,
              color: COLORS.text.white,
              cursor:
                selectedBed && transferReason.trim() && !transferring
                  ? 'pointer'
                  : 'not-allowed',
            }}
          >
            {transferring ? 'Transferring...' : 'Transfer Patient'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferBedModal;
