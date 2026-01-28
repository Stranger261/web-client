import { BedDouble } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

const BedHistoryTab = ({ isDarkMode, loadingHistory, bedHistory }) => {
  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {loadingHistory ? (
        <div className="flex items-center justify-center py-8">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: COLORS.primary }}
          />
        </div>
      ) : bedHistory.length === 0 ? (
        <div
          className="text-center py-8 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <p style={{ color: COLORS.text.secondary }}>
            No bed history available
          </p>
        </div>
      ) : (
        bedHistory.map(history => (
          <div
            key={history.assignment_id}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              borderColor: history.is_current
                ? COLORS.success
                : isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <BedDouble
                  className="w-5 h-5"
                  style={{
                    color: history.is_current
                      ? COLORS.success
                      : COLORS.text.secondary,
                  }}
                />
                <div>
                  <p
                    className="font-semibold"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Bed {history.bed?.bed_number}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Room {history.bed?.room?.room_number} • Floor{' '}
                    {history.bed?.room?.floor_number}
                  </p>
                </div>
              </div>
              {history.is_current && (
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: COLORS.badge.success.bg,
                    color: COLORS.badge.success.text,
                  }}
                >
                  Current
                </span>
              )}
            </div>
            <div
              className="text-xs space-y-1"
              style={{ color: COLORS.text.secondary }}
            >
              <p>Assigned: {new Date(history.assigned_at).toLocaleString()}</p>
              {history.released_at && (
                <p>
                  Released: {new Date(history.released_at).toLocaleString()}
                </p>
              )}
              {history.transfer_reason && (
                <p className="mt-2">
                  <span className="font-medium">Reason:</span>{' '}
                  {history.transfer_reason}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BedHistoryTab;
