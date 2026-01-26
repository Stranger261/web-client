import { useState } from 'react';
import { Home, Building2, Calendar, AlertTriangle, Bed } from 'lucide-react';
import { COLORS } from '../../../../../../configs/CONST';
import BedSelectionModal from '../../../../../../components/Modals/BedSelectionModal';

const DispositionTab = ({
  data,
  onChange,
  errors,
  isDarkMode,
  onBedSelect,
}) => {
  const [showBedSelection, setShowBedSelection] = useState(false);

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

  const dispositionOptions = [
    {
      value: 'home',
      label: 'Home',
      icon: Home,
      color: COLORS.success,
      description: 'Patient discharged home',
    },
    {
      value: 'admit',
      label: 'Admit',
      icon: Building2,
      color: COLORS.danger,
      description: 'Admission required',
    },
    {
      value: 'followup',
      label: 'Follow-up',
      icon: Calendar,
      color: COLORS.info,
      description: 'Schedule follow-up',
    },
    {
      value: 'refer',
      label: 'Refer',
      icon: AlertTriangle,
      color: COLORS.warning,
      description: 'Refer to specialist',
    },
    {
      value: 'er',
      label: 'ER',
      icon: AlertTriangle,
      color: COLORS.danger,
      description: 'Transfer to ER',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Patient Disposition
        </h3>
      </div>

      {/* Disposition Selection */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Disposition <span style={{ color: COLORS.danger }}>*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {dispositionOptions.map(option => {
            const Icon = option.icon;
            const isSelected = data.disposition === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('disposition', option.value)}
                className="p-4 rounded-lg border-2 transition-all text-left"
                style={{
                  backgroundColor: isSelected
                    ? isDarkMode
                      ? COLORS.primary
                      : option.color + '20'
                    : isDarkMode
                      ? COLORS.surface.dark
                      : COLORS.surface.light,
                  borderColor: isSelected
                    ? option.color
                    : isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-6 h-6"
                    style={{
                      color: isSelected ? option.color : COLORS.text.secondary,
                    }}
                  />
                  <div className="flex-1">
                    <div
                      className="font-semibold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {option.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.disposition && (
          <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
            {errors.disposition}
          </p>
        )}
      </div>

      {/* Disposition Notes */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Disposition Notes
        </label>
        <textarea
          value={data.disposition_notes}
          onChange={e => onChange('disposition_notes', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={3}
          placeholder="Additional notes about the disposition decision..."
        />
      </div>

      {/* Admission Fields (show if disposition is 'admit') */}
      {data.disposition === 'admit' && (
        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.badge.danger.bg,
            borderColor: COLORS.danger,
          }}
        >
          <h4
            className="font-semibold mb-4 flex items-center gap-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            <Building2 className="w-5 h-5" style={{ color: COLORS.danger }} />
            Admission Details
          </h4>

          <div className="space-y-4">
            {/* Bed Selection Button */}
            <div>
              <label className={labelClassName} style={getLabelStyle()}>
                Assign Bed <span style={{ color: COLORS.danger }}>*</span>
              </label>

              {data.selected_bed_info ? (
                <div
                  className="p-3 rounded-lg border flex items-center justify-between"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.light,
                    borderColor: COLORS.success,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Bed
                      className="w-5 h-5"
                      style={{ color: COLORS.success }}
                    />
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Bed {data.selected_bed_info.bed_number}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Floor {data.selected_bed_info.floor_number} • Room{' '}
                        {data.selected_bed_info.room_number} •{' '}
                        {data.selected_bed_info.bed_type
                          .replace('_', ' ')
                          .toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBedSelection(true)}
                    className="px-3 py-1 rounded text-sm"
                    style={{
                      backgroundColor: COLORS.button.secondary.bg,
                      color: COLORS.text.white,
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBedSelection(true)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed transition-all hover:border-solid"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.light,
                    borderColor: errors.selected_bed_id
                      ? COLORS.danger
                      : COLORS.border.light,
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>Select Bed</span>
                  </div>
                </button>
              )}

              {errors.selected_bed_id && (
                <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
                  {errors.selected_bed_id}
                </p>
              )}
            </div>

            {/* Existing admission fields */}
            <div>
              <label className={labelClassName} style={getLabelStyle()}>
                Admission Reason <span style={{ color: COLORS.danger }}>*</span>
              </label>
              <textarea
                value={data.admission_reason}
                onChange={e => onChange('admission_reason', e.target.value)}
                className={inputClassName}
                style={getInputStyle(errors.admission_reason)}
                rows={2}
                placeholder="Reason for admission..."
              />
              {errors.admission_reason && (
                <p className="text-sm mt-1" style={{ color: COLORS.danger }}>
                  {errors.admission_reason}
                </p>
              )}
            </div>

            <div>
              <label className={labelClassName} style={getLabelStyle()}>
                Estimated Length of Stay (days)
              </label>
              <input
                type="number"
                value={data.estimated_stay_days}
                onChange={e => onChange('estimated_stay_days', e.target.value)}
                className={inputClassName}
                style={getInputStyle()}
                placeholder="e.g., 3"
              />
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Fields (show if disposition is 'followup') */}
      {data.disposition === 'followup' && (
        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.badge.info.bg,
            borderColor: COLORS.info,
          }}
        >
          <h4
            className="font-semibold mb-4 flex items-center gap-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            <Calendar className="w-5 h-5" style={{ color: COLORS.info }} />
            Follow-up Details
          </h4>

          <div className="space-y-4">
            <div>
              <label className={labelClassName} style={getLabelStyle()}>
                Follow-up Date
              </label>
              <input
                type="date"
                value={data.followup_date}
                onChange={e => onChange('followup_date', e.target.value)}
                className={inputClassName}
                style={getInputStyle()}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className={labelClassName} style={getLabelStyle()}>
                Follow-up Instructions
              </label>
              <textarea
                value={data.followup_instructions}
                onChange={e =>
                  onChange('followup_instructions', e.target.value)
                }
                className={inputClassName}
                style={getInputStyle()}
                rows={3}
                placeholder="Instructions for follow-up visit..."
              />
            </div>
          </div>
        </div>
      )}

      <BedSelectionModal
        isOpen={showBedSelection}
        onClose={() => setShowBedSelection(false)}
        onSelectBed={onBedSelect}
        admissionType="elective"
      />
    </div>
  );
};

export default DispositionTab;
