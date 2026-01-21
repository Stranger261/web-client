import { COLORS } from '../../../../../configs/CONST';
import { Pill } from 'lucide-react';

const TreatmentSection = ({
  treatment,
  prescription,
  labTests,
  onTreatmentChange,
  onPrescriptionChange,
  onLabTestsChange,
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const inputStyle = {
    backgroundColor: isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.input.background,
    borderColor: isDarkMode ? COLORS.input.borderDark : COLORS.input.border,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Treatment Plan
        </label>
        <textarea
          value={treatment}
          onChange={e => onTreatmentChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={inputStyle}
          rows={3}
          placeholder="Recommended treatment and procedures..."
        />
      </div>

      <div>
        <label
          className="flex items-center gap-2 text-sm font-medium mb-1"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <Pill className="w-4 h-4" style={{ color: COLORS.info }} />
          Prescription
        </label>
        <textarea
          value={prescription}
          onChange={e => onPrescriptionChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={inputStyle}
          rows={4}
          placeholder="Medications (name, dosage, frequency, duration)..."
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Laboratory Tests Ordered
        </label>
        <textarea
          value={labTests}
          onChange={e => onLabTestsChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={inputStyle}
          rows={2}
          placeholder="Lab tests, imaging, or diagnostic procedures..."
        />
      </div>
    </div>
  );
};

export default TreatmentSection;
