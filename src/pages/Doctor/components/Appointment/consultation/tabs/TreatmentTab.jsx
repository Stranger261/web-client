import { COLORS } from '../../../../../../configs/CONST';

const TreatmentTab = ({ data, onChange, errors, isDarkMode }) => {
  const inputClassName = `w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2`;

  const getInputStyle = () => ({
    backgroundColor: isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.input.background,
    borderColor: isDarkMode ? COLORS.input.borderDark : COLORS.input.border,
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
          Treatment Plan
        </h3>
      </div>

      {/* Treatment Plan */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Treatment Plan & Recommendations
        </label>
        <textarea
          value={data.treatment_plan}
          onChange={e => onChange('treatment_plan', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={5}
          placeholder="Overall treatment approach, lifestyle modifications, patient education..."
        />
      </div>

      {/* Procedures Performed */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Procedures Performed
        </label>
        <textarea
          value={data.procedures_performed}
          onChange={e => onChange('procedures_performed', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={3}
          placeholder="Any procedures performed during this consultation..."
        />
      </div>
    </div>
  );
};

export default TreatmentTab;
