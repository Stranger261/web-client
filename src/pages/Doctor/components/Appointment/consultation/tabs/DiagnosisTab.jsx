import { COLORS } from '../../../../../../configs/CONST';

const DiagnosisTab = ({ data, onChange, errors, isDarkMode }) => {
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
          Diagnosis
        </h3>
      </div>

      {/* Primary Diagnosis */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Primary Diagnosis <span style={{ color: COLORS.danger }}>*</span>
        </label>
        <textarea
          value={data.primary_diagnosis}
          onChange={e => onChange('primary_diagnosis', e.target.value)}
          className={inputClassName}
          style={getInputStyle(errors.primary_diagnosis)}
          rows={2}
          placeholder="Main diagnosis based on assessment..."
        />
        {errors.primary_diagnosis && (
          <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
            {errors.primary_diagnosis}
          </p>
        )}
      </div>

      {/* ICD-10 Code */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          ICD-10 Code
        </label>
        <input
          type="text"
          value={data.icd_10_code}
          onChange={e => onChange('icd_10_code', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          placeholder="e.g., J06.9, I10, E11.9"
        />
      </div>

      {/* Secondary Diagnoses */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Secondary Diagnoses / Differential Diagnoses
        </label>
        <textarea
          value={data.secondary_diagnoses}
          onChange={e => onChange('secondary_diagnoses', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={3}
          placeholder="Additional diagnoses or conditions to consider..."
        />
      </div>
    </div>
  );
};

export default DiagnosisTab;
