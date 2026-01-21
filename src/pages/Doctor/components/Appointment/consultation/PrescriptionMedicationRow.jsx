import { Trash2 } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';

const PrescriptionMedicationRow = ({
  index,
  medication,
  onChange,
  onRemove,
  isDarkMode,
}) => {
  const inputClassName = `w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2`;

  const getInputStyle = () => ({
    backgroundColor: isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.input.background,
    borderColor: isDarkMode ? COLORS.input.borderDark : COLORS.input.border,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  });

  const labelClassName = `block text-xs font-medium mb-1`;
  const getLabelStyle = () => ({
    color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
  });

  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div
      className="p-4 rounded-lg border relative"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.surface.lightHover,
          color: COLORS.danger,
        }}
        title="Remove medication"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
        {/* Medication Name */}
        <div className="md:col-span-2">
          <label className={labelClassName} style={getLabelStyle()}>
            Medication Name <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <input
            type="text"
            value={medication.medication_name}
            onChange={e => handleChange('medication_name', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
            placeholder="e.g., Amoxicillin, Ibuprofen"
          />
        </div>

        {/* Dosage */}
        <div>
          <label className={labelClassName} style={getLabelStyle()}>
            Dosage <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <input
            type="text"
            value={medication.dosage}
            onChange={e => handleChange('dosage', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
            placeholder="e.g., 500mg, 10ml"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className={labelClassName} style={getLabelStyle()}>
            Frequency <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <input
            type="text"
            value={medication.frequency}
            onChange={e => handleChange('frequency', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
            placeholder="e.g., 3 times daily, Every 8 hours"
          />
        </div>

        {/* Route */}
        <div>
          <label className={labelClassName} style={getLabelStyle()}>
            Route
          </label>
          <select
            value={medication.route}
            onChange={e => handleChange('route', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
          >
            <option value="">Select route</option>
            <option value="oral">Oral</option>
            <option value="IV">IV (Intravenous)</option>
            <option value="IM">IM (Intramuscular)</option>
            <option value="subcutaneous">Subcutaneous</option>
            <option value="topical">Topical</option>
            <option value="inhalation">Inhalation</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className={labelClassName} style={getLabelStyle()}>
            Duration
          </label>
          <input
            type="text"
            value={medication.duration}
            onChange={e => handleChange('duration', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
            placeholder="e.g., 7 days, 2 weeks"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className={labelClassName} style={getLabelStyle()}>
            Quantity
          </label>
          <input
            type="number"
            value={medication.quantity}
            onChange={e => handleChange('quantity', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
            placeholder="e.g., 21, 30"
          />
        </div>

        {/* Instructions */}
        <div className="md:col-span-2">
          <label className={labelClassName} style={getLabelStyle()}>
            Special Instructions
          </label>
          <textarea
            value={medication.instructions}
            onChange={e => handleChange('instructions', e.target.value)}
            className={inputClassName}
            style={getInputStyle()}
            rows={2}
            placeholder="e.g., Take with food, Avoid alcohol"
          />
        </div>
      </div>
    </div>
  );
};

export default PrescriptionMedicationRow;
