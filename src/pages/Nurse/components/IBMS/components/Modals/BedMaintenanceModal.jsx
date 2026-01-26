import { useState } from 'react';
import {
  X,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
} from 'lucide-react';
import Modal from '../../../../../../components/ui/Modal';
import { COLORS } from '../../../../../../configs/CONST';
import bedApi from '../../../../../../services/bedApi';
import toast from 'react-hot-toast';

const BedMaintenanceModal = ({
  isOpen,
  onClose,
  bed,
  isDarkMode,
  userRole,
  onUpdate,
}) => {
  const [resolvingMaintenance, setResolvingMaintenance] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolveMaintenance = async () => {
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    setResolvingMaintenance(true);
    try {
      const reason = `Maintenance completed: ${resolutionNotes}`;
      await bedApi.updateBedStatus(bed.bed_id, 'cleaning', reason);

      toast.success('Maintenance resolved. Bed sent for cleaning.');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error resolving maintenance:', error);
      toast.error(
        error.response?.data?.message || 'Failed to resolve maintenance',
      );
    } finally {
      setResolvingMaintenance(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Maintenance Details">
      <div className="space-y-4">
        {/* Bed Info */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.badge.danger.bg,
            borderColor: COLORS.danger,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-6 h-6" style={{ color: COLORS.danger }} />
            <div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Bed {bed.bed_number}
              </h3>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                Room {bed.room?.room_number} • Floor {bed.room?.floor_number}
              </p>
            </div>
          </div>

          <div
            className="px-3 py-1 rounded-full text-xs font-medium inline-block"
            style={{
              backgroundColor: COLORS.danger,
              color: COLORS.text.white,
            }}
          >
            Under Maintenance
          </div>
        </div>

        {/* Maintenance Information */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <h4
            className="font-semibold mb-3"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Maintenance Details
          </h4>

          <div className="space-y-3 text-sm">
            {bed.maintenance_reported_at && (
              <div className="flex items-start gap-2">
                <Calendar
                  className="w-4 h-4 mt-0.5"
                  style={{ color: COLORS.text.secondary }}
                />
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Reported At</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {new Date(bed.maintenance_reported_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {bed.maintenance_reason && (
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="w-4 h-4 mt-0.5"
                  style={{ color: COLORS.warning }}
                />
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Issue Reported</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {bed.maintenance_reason}
                  </p>
                </div>
              </div>
            )}

            {bed.maintenance_reported_by && (
              <div className="flex items-start gap-2">
                <User
                  className="w-4 h-4 mt-0.5"
                  style={{ color: COLORS.text.secondary }}
                />
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Reported By</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Staff ID: {bed.maintenance_reported_by}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resolution Section */}
        {['admin', 'maintenance', 'receptionist', 'nurse'].includes(
          userRole,
        ) && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.success.bg,
              borderColor: COLORS.success,
            }}
          >
            <h4
              className="font-semibold mb-3 flex items-center gap-2"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              <CheckCircle
                className="w-5 h-5"
                style={{ color: COLORS.success }}
              />
              Resolve Maintenance
            </h4>

            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Resolution Notes{' '}
                  <span style={{ color: COLORS.danger }}>*</span>
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe what was fixed..."
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

              <button
                onClick={handleResolveMaintenance}
                disabled={!resolutionNotes.trim() || resolvingMaintenance}
                className="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor:
                    resolutionNotes.trim() && !resolvingMaintenance
                      ? COLORS.success
                      : COLORS.text.secondary,
                  color: COLORS.text.white,
                  cursor:
                    resolutionNotes.trim() && !resolvingMaintenance
                      ? 'pointer'
                      : 'not-allowed',
                }}
              >
                <CheckCircle className="w-5 h-5" />
                {resolvingMaintenance ? 'Resolving...' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BedMaintenanceModal;
