import { COLORS } from '../../../../../configs/CONST';

const ChiefComplaintSection = ({ value, onChange, error }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Chief Complaint / Reason for Visit{' '}
        <span style={{ color: COLORS.danger }}>*</span>
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.input.backgroundDark
            : COLORS.input.background,
          borderColor: error
            ? COLORS.danger
            : isDarkMode
            ? COLORS.input.borderDark
            : COLORS.input.border,
          color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
        }}
        rows={3}
        placeholder="Patient's main reason for visit..."
      />
      {error && (
        <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ChiefComplaintSection;
