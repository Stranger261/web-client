import { COLORS } from '../../../../configs/CONST';

const VitalsFormFields = ({ formData, onChange, errors, isDarkMode }) => {
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
      {/* Chief Complaint */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Chief Complaint / Reason for Visit{' '}
          <span style={{ color: COLORS.danger }}>*</span>
        </label>
        <textarea
          value={formData.chief_complaint}
          onChange={e => onChange('chief_complaint', e.target.value)}
          className={inputClassName}
          style={getInputStyle(errors.chief_complaint)}
          rows={3}
          placeholder="Patient's main reason for visit..."
        />
        {errors.chief_complaint && (
          <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
            {errors.chief_complaint}
          </p>
        )}
      </div>

      {/* Vital Signs Section */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 pb-2 border-b"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          Vital Signs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={e => onChange('temperature', e.target.value)}
              className={inputClassName}
              style={getInputStyle()}
              placeholder="e.g., 36.5"
            />
          </div>

          {/* Blood Pressure */}
          <div className="col-span-2 md:col-span-1">
            <label className={labelClassName} style={getLabelStyle()}>
              Blood Pressure (mmHg)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.blood_pressure_systolic}
                onChange={e =>
                  onChange('blood_pressure_systolic', e.target.value)
                }
                className={inputClassName}
                style={getInputStyle()}
                placeholder="Systolic"
              />
              <span
                className="flex items-center"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                /
              </span>
              <input
                type="number"
                value={formData.blood_pressure_diastolic}
                onChange={e =>
                  onChange('blood_pressure_diastolic', e.target.value)
                }
                className={inputClassName}
                style={getInputStyle()}
                placeholder="Diastolic"
              />
            </div>
          </div>

          {/* Heart Rate */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              value={formData.heart_rate}
              onChange={e => onChange('heart_rate', e.target.value)}
              className={inputClassName}
              style={getInputStyle()}
              placeholder="e.g., 72"
            />
          </div>

          {/* Respiratory Rate */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              Respiratory Rate (/min)
            </label>
            <input
              type="number"
              value={formData.respiratory_rate}
              onChange={e => onChange('respiratory_rate', e.target.value)}
              className={inputClassName}
              style={getInputStyle()}
              placeholder="e.g., 16"
            />
          </div>

          {/* Oxygen Saturation */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              O₂ Saturation (%)
            </label>
            <input
              type="number"
              value={formData.oxygen_saturation}
              onChange={e => onChange('oxygen_saturation', e.target.value)}
              className={inputClassName}
              style={getInputStyle()}
              placeholder="e.g., 98"
            />
          </div>
        </div>
      </div>

      {/* Physical Measurements */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 pb-2 border-b"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          Physical Measurements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Height */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.height}
              onChange={e => onChange('height', e.target.value)}
              className={inputClassName}
              style={getInputStyle()}
              placeholder="e.g., 170"
            />
          </div>

          {/* Weight */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={e => onChange('weight', e.target.value)}
              className={inputClassName}
              style={getInputStyle()}
              placeholder="e.g., 65"
            />
          </div>

          {/* BMI (auto-calculated) */}
          <div>
            <label className={labelClassName} style={getLabelStyle()}>
              BMI
            </label>
            <input
              type="text"
              value={formData.bmi || 'Auto-calculated'}
              disabled
              className={inputClassName}
              style={{
                ...getInputStyle(),
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>
      </div>

      {/* Pain Assessment */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Pain Level (0-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            value={formData.pain_level || 0}
            onChange={e => onChange('pain_level', e.target.value)}
            className="flex-1"
            style={{ accentColor: COLORS.primary }}
          />
          <span
            className="text-2xl font-bold w-12 text-center"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {formData.pain_level || 0}
          </span>
        </div>
        <div
          className="flex justify-between mt-1 text-xs"
          style={{ color: COLORS.text.secondary }}
        >
          <span>No Pain</span>
          <span>Moderate</span>
          <span>Worst Pain</span>
        </div>
      </div>

      {/* Triage Level */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Triage Level
        </label>
        <select
          value={formData.triage_level}
          onChange={e => onChange('triage_level', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
        >
          <option value="">Select triage level</option>
          <option value="non_urgent">Non-Urgent</option>
          <option value="semi_urgent">Semi-Urgent</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Nurse Notes */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Nurse Notes
        </label>
        <textarea
          value={formData.nurse_notes}
          onChange={e => onChange('nurse_notes', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={3}
          placeholder="Additional observations or notes..."
        />
      </div>
    </div>
  );
};

export default VitalsFormFields;
