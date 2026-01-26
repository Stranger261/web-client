import { Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { formatDate } from '../../../utils/dateFormatter';
import { PrescriptionsList } from '../components/PrescriptionList';

export const AdmissionCard = ({
  admission,
  source = 'appointment',
  appointmentDate,
  isDarkMode,
  expandedSection,
  toggleSection,
}) => {
  const sectionId = `admission-${admission.admission_id}`;
  const isExpanded = expandedSection === sectionId;

  return (
    <div
      className="border rounded-lg p-3 sm:p-4 ml-0 sm:ml-8 cursor-pointer"
      style={{
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
      }}
      onClick={() => toggleSection(sectionId)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{
              backgroundColor:
                source === 'walk-in' ? COLORS.danger : COLORS.primary,
            }}
          >
            <Building2
              size={18}
              className="sm:w-5 sm:h-5"
              style={{ color: 'white' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm sm:text-base break-words"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {admission.admission_number}
            </div>
            <div className="space-y-1">
              <div
                className="text-xs sm:text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                {formatDate(admission.admission_date)}
              </div>
              {source === 'appointment' && appointmentDate && (
                <div
                  className="text-xs"
                  style={{ color: COLORS.text.secondary }}
                >
                  From appointment on {formatDate(appointmentDate)}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor:
                    admission.admission_type === 'emergency'
                      ? COLORS.danger
                      : COLORS.primary,
                  color: 'white',
                }}
              >
                {admission.admission_type}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor:
                    admission.admission_status === 'active'
                      ? COLORS.success
                      : COLORS.text.secondary,
                  color: 'white',
                }}
              >
                {admission.admission_status}
              </span>
            </div>
          </div>
        </div>
        <div className="p-1 flex-shrink-0">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <div
        className="mb-3 p-3 rounded-lg"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
        }}
      >
        <div
          className="text-xs font-medium mb-1"
          style={{ color: COLORS.text.secondary }}
        >
          Diagnosis at Admission
        </div>
        <div
          className="text-sm break-words"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {admission.diagnosis_at_admission || 'Not specified'}
        </div>
      </div>

      {isExpanded &&
        admission.prescriptions &&
        admission.prescriptions.length > 0 && (
          <div
            className="space-y-3 pt-3 border-t"
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <div
              className="font-medium text-sm mb-2"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Prescriptions ({admission.prescriptions.length})
            </div>
            <PrescriptionsList
              prescriptions={admission.prescriptions}
              source={source === 'walk-in' ? 'Walk-in Admission' : 'Admission'}
              sourceNumber={admission.admission_number}
              sourceDate={admission.admission_date}
            />
          </div>
        )}
    </div>
  );
};
