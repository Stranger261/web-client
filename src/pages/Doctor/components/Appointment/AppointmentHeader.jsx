import { User, Calendar, Clock } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

const AppointmentHeader = ({ appointment }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (!appointment) return null;

  return (
    <div
      className="rounded-lg p-4 mb-6"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.darkHover
          : COLORS.badge.primary.bg,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" style={{ color: COLORS.info }} />
          <div>
            <div
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Patient
            </div>
            <div
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {appointment.patient_name || 'N/A'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: COLORS.info }} />
          <div>
            <div
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Date
            </div>
            <div
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {appointment.appointment_date || 'N/A'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: COLORS.info }} />
          <div>
            <div
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Time
            </div>
            <div
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {appointment.appointment_time || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentHeader;
