import { Plus, Trash2 } from 'lucide-react';
import PrescriptionMedicationRow from '../PrescriptionMedicationRow';
import { COLORS } from '../../../../../../configs/CONST';

const PrescriptionTab = ({
  medications,
  onAdd,
  onRemove,
  onChange,
  isDarkMode,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Prescriptions
        </h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: COLORS.button.create.bg,
            color: COLORS.button.create.text,
          }}
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {medications.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border-2 border-dashed"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            color: COLORS.text.secondary,
          }}
        >
          <p>No medications prescribed yet.</p>
          <p className="text-sm mt-1">Click "Add Medication" to start.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((medication, index) => (
            <PrescriptionMedicationRow
              key={index}
              index={index}
              medication={medication}
              onChange={onChange}
              onRemove={onRemove}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionTab;
