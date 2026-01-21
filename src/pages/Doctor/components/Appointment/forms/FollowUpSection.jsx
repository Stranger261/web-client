import { COLORS } from '../../../../../configs/CONST';

const FollowUpSection = ({ notes, date, onNotesChange, onDateChange }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const inputStyle = {
    backgroundColor: isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.input.background,
    borderColor: isDarkMode ? COLORS.input.borderDark : COLORS.input.border,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium mb-1"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Follow-up Instructions
        </label>
        <textarea
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={inputStyle}
          rows={2}
          placeholder="Care instructions for the patient..."
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Follow-up Date
        </label>
        <input
          type="date"
          value={date}
          onChange={e => onDateChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={inputStyle}
        />
      </div>
    </div>
  );
};

export default FollowUpSection;
