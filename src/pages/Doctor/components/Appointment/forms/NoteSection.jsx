import { COLORS } from '../../../../../configs/CONST';

const NotesSection = ({ value, onChange }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Additional Notes
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.input.backgroundDark
            : COLORS.input.background,
          borderColor: isDarkMode
            ? COLORS.input.borderDark
            : COLORS.input.border,
          color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
        }}
        rows={3}
        placeholder="Any other relevant information..."
      />
    </div>
  );
};

export default NotesSection;
