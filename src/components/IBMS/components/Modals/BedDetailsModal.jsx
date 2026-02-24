// pages/IBMS/components/BedDetailsModal.jsx
import { useState } from 'react';
import { X, User, Wrench, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../ui/Modal';

import { COLORS } from '../../../../configs/CONST';
import bedService from '../../../../services/bedApi';

const BedDetailsModal = ({
  isOpen,
  onClose,
  bed,
  isDarkMode,
  userRole,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'clean', 'maintenance', 'cancel_reservation'
  const [reason, setReason] = useState('');

  const canPerformAction = action => {
    const permissions = {
      clean: ['nurse', 'housekeeping', 'admin'],
      maintenance: ['nurse', 'admin', 'maintenance'],
      cancel_reservation: ['receptionist', 'nurse', 'admin'],
    };
    return permissions[action]?.includes(userRole);
  };

  const handleMarkCleaned = async () => {
    setLoading(true);
    try {
      await bedService.markBedCleaned(bed.bed_id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error marking bed as cleaned:', error);
      alert(error.response?.data?.message || 'Failed to mark bed as cleaned');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMaintenance = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for maintenance');
      return;
    }

    setLoading(true);
    try {
      await bedService.markBedForMaintenance(bed.bed_id, reason);
      toast.success(
        `The ${bed.bed_type}-${bed.number}  is marked for bed maintenance`,
      );
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error marking bed for maintenance:', error);
      toast.error(
        error.response?.data?.message || 'Failed to mark bed for maintenance',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    setLoading(true);
    try {
      const cancelReason = reason || 'Reservation cancelled';
      await bedService.cancelBedReservation(bed.bed_id, cancelReason);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Bed Details">
      <div className="space-y-6">
        {/* Bed Info */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: getStatusColor(bed.bed_status),
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-xl font-bold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Bed {bed.bed_number}
              </h3>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                {bed.room?.room_number && `Room ${bed.room.room_number} • `}
                {bed.room?.floor_number && `Floor ${bed.room.floor_number}`}
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm font-medium capitalize"
              style={{
                backgroundColor: getStatusColor(bed.bed_status) + '20',
                color: getStatusColor(bed.bed_status),
              }}
            >
              {bed.bed_status.replace('_', ' ')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: COLORS.text.secondary }}>Bed Type</p>
              <p
                className="font-medium capitalize"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {bed.bed_type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p style={{ color: COLORS.text.secondary }}>Room Type</p>
              <p
                className="font-medium capitalize"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {bed.room?.room_type.replace('_', ' ')}
              </p>
            </div>
            {bed.last_cleaned_at && (
              <div className="col-span-2">
                <p style={{ color: COLORS.text.secondary }}>Last Cleaned</p>
                <p
                  className="font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {new Date(bed.last_cleaned_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current Assignment Info (if occupied) */}
        {bed.bed_status === 'occupied' && bed.assignments?.length > 0 && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.danger.bg,
              borderColor: COLORS.danger,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5" style={{ color: COLORS.danger }} />
              <h4
                className="font-semibold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Current Patient
              </h4>
            </div>
            <div className="text-sm space-y-1">
              <p style={{ color: COLORS.text.secondary }}>
                Admission ID: {bed.assignments[0].admission_id}
              </p>
              <p style={{ color: COLORS.text.secondary }}>
                Assigned:{' '}
                {new Date(bed.assignments[0].assigned_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Action Selection */}
        {!actionType && (userRole === 'nurse' || userRole === 'admin') && (
          <div className="space-y-3">
            <h4
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Available Actions
            </h4>
            {/* Mark as Cleaned */}
            {bed.bed_status === 'cleaning' && canPerformAction('clean') && (
              <button
                onClick={() => setActionType('clean')}
                className="w-full p-3 rounded-lg border-2 transition-all hover:shadow-md flex items-center gap-3"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                  borderColor: COLORS.success,
                }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: COLORS.success }}
                />
                <div className="text-left">
                  <div
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Mark as Cleaned
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Bed will be marked as available
                  </div>
                </div>
              </button>
            )}

            {/* Mark for Maintenance */}
            {['available', 'cleaning'].includes(bed.bed_status) &&
              canPerformAction('maintenance') && (
                <button
                  onClick={() => setActionType('maintenance')}
                  className="w-full p-3 rounded-lg border-2 transition-all hover:shadow-md flex items-center gap-3"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.dark
                      : COLORS.surface.light,
                    borderColor: COLORS.warning,
                  }}
                >
                  <Wrench
                    className="w-5 h-5"
                    style={{ color: COLORS.warning }}
                  />
                  <div className="text-left">
                    <div
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Mark for Maintenance
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      Report an issue with this bed
                    </div>
                  </div>
                </button>
              )}

            {/* Cancel Reservation */}
            {bed.bed_status === 'reserved' &&
              canPerformAction('cancel_reservation') && (
                <button
                  onClick={() => setActionType('cancel_reservation')}
                  className="w-full p-3 rounded-lg border-2 transition-all hover:shadow-md flex items-center gap-3"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.dark
                      : COLORS.surface.light,
                    borderColor: COLORS.danger,
                  }}
                >
                  <X className="w-5 h-5" style={{ color: COLORS.danger }} />
                  <div className="text-left">
                    <div
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Cancel Reservation
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      Make bed available again
                    </div>
                  </div>
                </button>
              )}
          </div>
        )}
        {/* Action Forms */}
        {actionType === 'clean' && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: COLORS.badge.success.bg,
                borderColor: COLORS.success,
              }}
            >
              <p className="text-sm" style={{ color: COLORS.text.primary }}>
                Are you sure you want to mark this bed as cleaned and available?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActionType(null)}
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
                onClick={handleMarkCleaned}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: loading
                    ? COLORS.text.secondary
                    : COLORS.success,
                  color: COLORS.text.white,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {actionType === 'maintenance' && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Reason for Maintenance{' '}
                <span style={{ color: COLORS.danger }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Describe the issue..."
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActionType(null);
                  setReason('');
                }}
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
                onClick={handleMarkMaintenance}
                disabled={loading || !reason.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor:
                    loading || !reason.trim()
                      ? COLORS.text.secondary
                      : COLORS.warning,
                  color: COLORS.text.white,
                  cursor: loading || !reason.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {actionType === 'cancel_reservation' && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                placeholder="Why is this reservation being cancelled?"
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActionType(null);
                  setReason('');
                }}
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
                onClick={handleCancelReservation}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: loading
                    ? COLORS.text.secondary
                    : COLORS.danger,
                  color: COLORS.text.white,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Processing...' : 'Cancel Reservation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BedDetailsModal;
