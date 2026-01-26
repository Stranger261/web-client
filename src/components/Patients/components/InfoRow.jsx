import { COLORS } from '../../../configs/CONST';

export const InfoRow = ({ label, value, isDarkMode }) => (
  <div className="flex justify-between items-center py-2">
    <span
      className="text-sm"
      style={{
        color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
      }}
    >
      {label}
    </span>
    <span
      className="text-sm font-semibold text-right"
      style={{
        color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      {value || 'N/A'}
    </span>
  </div>
);
