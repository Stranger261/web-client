import { COLORS } from '../../../../../configs/CONST';
import { Stethoscope } from 'lucide-react';

const VitalSignsSection = ({ vitalSigns, onChange }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const vitalFields = [
    {
      key: 'bloodPressure',
      label: 'Blood Pressure',
      placeholder: 'e.g., 120/80 mmHg',
    },
    { key: 'heartRate', label: 'Heart Rate', placeholder: 'e.g., 72 bpm' },
    { key: 'temperature', label: 'Temperature', placeholder: 'e.g., 36.5°C' },
    {
      key: 'respiratoryRate',
      label: 'Respiratory Rate',
      placeholder: 'e.g., 16 /min',
    },
    {
      key: 'oxygenSaturation',
      label: 'O₂ Saturation',
      placeholder: 'e.g., 98%',
    },
  ];

  return (
    <div>
      <h3
        className="text-base font-semibold mb-3 flex items-center gap-2"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        <Stethoscope className="w-5 h-5" style={{ color: COLORS.info }} />
        Vital Signs
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vitalFields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label
              className="block text-sm font-medium mb-1"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {label}
            </label>
            <input
              type="text"
              value={vitalSigns[key]}
              onChange={e => onChange(key, e.target.value)}
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
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitalSignsSection;
