import { COLORS } from '../../../../../configs/CONST';

export const StatCard = ({ icon: Icon, label, value, color, isDarkMode }) => (
  <div
    className="rounded-lg p-4 border transition-all duration-200 hover:shadow-md"
    style={{
      backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
      borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium uppercase"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          {label}
        </p>
        <p
          className="text-lg font-bold truncate"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);
