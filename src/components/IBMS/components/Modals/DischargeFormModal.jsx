import { COLORS } from '../../../../configs/CONST';

const DischargeFormModal = ({
  isDarkMode,
  dischargeData,
  setDischargeData,
  onCancel,
  handleDischarge,
}) => {
  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: COLORS.badge.danger.bg,
          borderColor: COLORS.danger,
        }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: COLORS.text.primary }}
        >
          ⚠️ You are about to discharge this patient. This action will release
          the assigned bed.
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Discharge Type <span style={{ color: COLORS.danger }}>*</span>
        </label>
        <select
          value={dischargeData.discharge_type}
          onChange={e =>
            setDischargeData({
              ...dischargeData,
              discharge_type: e.target.value,
            })
          }
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.input.backgroundDark
              : COLORS.input.background,
            borderColor: isDarkMode
              ? COLORS.input.borderDark
              : COLORS.input.border,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <option value="routine">Routine</option>
          <option value="against_advice">Against Medical Advice</option>
          <option value="transferred">Transferred</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Discharge Summary <span style={{ color: COLORS.danger }}>*</span>
        </label>
        <textarea
          value={dischargeData.discharge_summary}
          onChange={e =>
            setDischargeData({
              ...dischargeData,
              discharge_summary: e.target.value,
            })
          }
          rows={4}
          placeholder="Enter discharge summary, final diagnosis, and follow-up instructions..."
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.input.backgroundDark
              : COLORS.input.background,
            borderColor: isDarkMode
              ? COLORS.input.borderDark
              : COLORS.input.border,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg font-medium"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.darkHover
              : COLORS.button.outline.bgHover,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDischarge}
          disabled={!dischargeData.discharge_summary.trim()}
          className="flex-1 px-4 py-2 rounded-lg font-medium"
          style={{
            backgroundColor: dischargeData.discharge_summary.trim()
              ? COLORS.danger
              : COLORS.text.secondary,
            color: COLORS.text.white,
            cursor: dischargeData.discharge_summary.trim()
              ? 'pointer'
              : 'not-allowed',
          }}
        >
          Confirm Discharge
        </button>
      </div>
    </div>
  );
};

export default DischargeFormModal;
