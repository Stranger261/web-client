import {
  Activity,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Pi,
  Stethoscope,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { formatDate } from '../../../utils/dateFormatter';
import { PrescriptionsList } from '../components/PrescriptionList';
import { VitalsDisplay } from '../components/VitalDisplay';
import { AdmissionCard } from './AdmissionCard';

export const AppointmentCard = ({
  appointment,
  expandedSection,
  isDarkMode,
  toggleSection,
}) => {
  const sectionId = `appointment-${appointment.appointment_id}`;
  const isExpanded = expandedSection === sectionId;

  return (
    <div
      className="border rounded-lg p-3 sm:p-4 space-y-3 cursor-pointer"
      style={{
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
      }}
      onClick={() => toggleSection(sectionId)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Calendar
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
              Appointment #{appointment.appointment_id}
            </div>
            <div
              className="text-xs sm:text-sm mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              {formatDate(appointment.appointment_date)}
            </div>
            {appointment.status && (
              <span
                className="px-2 py-0.5 rounded text-xs mt-2 inline-block"
                style={{
                  backgroundColor:
                    appointment.status === 'completed'
                      ? COLORS.success
                      : COLORS.warning,
                  color: 'white',
                }}
              >
                {appointment.status}
              </span>
            )}
          </div>
        </div>
        <div className="p-1 flex-shrink-0">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Always show diagnosis if available */}
      {appointment.diagnosis && (
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope size={16} style={{ color: COLORS.primary }} />
            <span
              className="font-medium text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Diagnosis
            </span>
          </div>
          <div className="text-sm space-y-1">
            {appointment.diagnosis.chief_complaint && (
              <div className="break-words">
                <span style={{ color: COLORS.text.secondary }}>
                  Chief Complaint:{' '}
                </span>
                <span
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {appointment.diagnosis.chief_complaint}
                </span>
              </div>
            )}
            {appointment.diagnosis.primary_diagnosis && (
              <div className="break-words">
                <span style={{ color: COLORS.text.secondary }}>
                  Primary Diagnosis:{' '}
                </span>
                <span
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {appointment.diagnosis.primary_diagnosis}
                </span>
              </div>
            )}
            {appointment.diagnosis.history_of_present_illness && (
              <div className="break-words">
                <span style={{ color: COLORS.text.secondary }}>History: </span>
                <span
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {appointment.diagnosis.history_of_present_illness}
                </span>
              </div>
            )}
            {appointment.diagnosis.treatment_plan && (
              <div className="break-words">
                <span style={{ color: COLORS.text.secondary }}>
                  Treatment Plan:{' '}
                </span>
                <span
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {appointment.diagnosis.treatment_plan}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {isExpanded && (
        <div
          className="space-y-4 pt-3 border-t"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          {/* Show vitals if available */}
          {appointment.vitals && (
            <div>
              <div
                className="font-medium text-sm mb-2 flex items-center gap-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                <Activity size={16} />
                Vital Signs
              </div>
              <VitalsDisplay vitals={appointment.vitals} />
            </div>
          )}

          {/* Show prescriptions from resulting admission */}
          {appointment.resultingAdmission?.prescriptions &&
            appointment.resultingAdmission.prescriptions.length > 0 && (
              <div>
                <div
                  className="font-medium text-sm mb-2 flex items-center gap-2"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  <Pi size={16} />
                  Prescriptions (
                  {appointment.resultingAdmission.prescriptions.length})
                </div>
                <PrescriptionsList
                  prescriptions={appointment.resultingAdmission.prescriptions}
                  source="Admission"
                  sourceNumber={appointment.resultingAdmission.admission_number}
                  sourceDate={appointment.resultingAdmission.admission_date}
                />
              </div>
            )}

          {/* Show resulting admission */}
          {appointment.resultingAdmission && (
            <div>
              <div
                className="font-medium text-sm mb-3 flex items-center gap-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                <Building2 size={16} />
                Resulting Admission
              </div>
              <AdmissionCard
                admission={appointment.resultingAdmission}
                source="appointment"
                appointmentDate={appointment.appointment_date}
                toggleSection={toggleSection}
                expandedSection={expandedSection}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
