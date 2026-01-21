import { COLORS } from '../../../../../../configs/CONST';

const AssessmentTab = ({ data, onChange, errors, isDarkMode }) => {
  const inputClassName = `w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2`;

  const getInputStyle = (hasError = false) => ({
    backgroundColor: isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.input.background,
    borderColor: hasError
      ? COLORS.danger
      : isDarkMode
        ? COLORS.input.borderDark
        : COLORS.input.border,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  });

  const labelClassName = `block text-sm font-medium mb-1`;
  const getLabelStyle = () => ({
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Clinical Assessment
        </h3>
      </div>

      {/* History of Present Illness */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          History of Present Illness (HPI)
        </label>
        <textarea
          value={data.history_of_present_illness}
          onChange={e => onChange('history_of_present_illness', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={5}
          placeholder="Detailed history of the patient's current condition, onset, duration, severity, associated symptoms..."
        />
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Include: Onset, Location, Duration, Character, Aggravating/Relieving
          factors, Timing, Severity
        </p>
      </div>

      {/* Physical Examination */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Physical Examination (PE)
        </label>
        <textarea
          value={data.physical_examination}
          onChange={e => onChange('physical_examination', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={5}
          placeholder="General appearance, vital signs interpretation, system-specific findings..."
        />
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Include: General appearance, HEENT, Cardiovascular, Respiratory,
          Abdomen, Neurological, etc.
        </p>
      </div>
    </div>
  );
};

export default AssessmentTab;
