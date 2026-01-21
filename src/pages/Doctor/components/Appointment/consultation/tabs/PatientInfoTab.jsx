import {
  User,
  Calendar,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
} from 'lucide-react';
import { COLORS } from '../../../../../../configs/CONST';

const PatientInfoTab = ({ appointment, vitals, isDarkMode }) => {
  const InfoCard = ({ icon: Icon, label, value, color }) => (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color: color || COLORS.info }} />
        <span
          className="text-xs"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-lg font-semibold"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        {value || 'N/A'}
      </div>
    </div>
  );

  const VitalCard = ({ icon: Icon, label, value, unit, color }) => (
    <div
      className="p-3 rounded-lg"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.badge.primary.bgDark
          : COLORS.badge.primary.bg,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className="w-5 h-5"
            style={{ color: color || COLORS.primary }}
          />
          <span
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {label}
          </span>
        </div>
        <div className="text-right">
          <div
            className="text-lg font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {value || '--'}
          </div>
          {unit && (
            <div
              className="text-xs"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={User}
            label="Patient Name"
            value={`${appointment?.patient?.person?.first_name} ${appointment?.patient?.person?.last_name}`}
          />
          <InfoCard
            icon={Calendar}
            label="Appointment Date"
            value={appointment?.appointment_date}
          />
          <InfoCard
            icon={Clock}
            label="Appointment Time"
            value={appointment?.appointment_time}
          />
        </div>
      </div>

      {/* Chief Complaint */}
      {vitals?.chief_complaint && (
        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Chief Complaint
          </h3>
          <div
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.badge.warning.bg,
              borderColor: COLORS.warning,
            }}
          >
            <p
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {vitals.chief_complaint}
            </p>
          </div>
        </div>
      )}

      {/* Vital Signs */}
      {vitals && (
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Vital Signs (Recorded by Nurse)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VitalCard
              icon={Thermometer}
              label="Temperature"
              value={vitals.temperature}
              unit="°C"
              color={COLORS.danger}
            />
            <VitalCard
              icon={Activity}
              label="Blood Pressure"
              value={
                vitals.blood_pressure_systolic &&
                vitals.blood_pressure_diastolic
                  ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`
                  : null
              }
              unit="mmHg"
              color={COLORS.info}
            />
            <VitalCard
              icon={Heart}
              label="Heart Rate"
              value={vitals.heart_rate}
              unit="bpm"
              color={COLORS.danger}
            />
            <VitalCard
              icon={Wind}
              label="Respiratory Rate"
              value={vitals.respiratory_rate}
              unit="/min"
              color={COLORS.info}
            />
            <VitalCard
              icon={Droplet}
              label="O₂ Saturation"
              value={vitals.oxygen_saturation}
              unit="%"
              color={COLORS.success}
            />
            <VitalCard
              icon={Activity}
              label="BMI"
              value={vitals.bmi}
              unit=""
              color={COLORS.primary}
            />
          </div>
        </div>
      )}

      {/* Pain Level */}
      {vitals?.pain_level !== null && vitals?.pain_level !== undefined && (
        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Pain Assessment
          </h3>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              border: `2px solid ${COLORS.warning}`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Pain Level
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-3xl font-bold"
                  style={{
                    color:
                      vitals.pain_level >= 7
                        ? COLORS.danger
                        : vitals.pain_level >= 4
                          ? COLORS.warning
                          : COLORS.success,
                  }}
                >
                  {vitals.pain_level}
                </span>
                <span style={{ color: COLORS.text.secondary }}>/10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nurse Notes */}
      {vitals?.nurse_notes && (
        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Nurse Notes
          </h3>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <p
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {vitals.nurse_notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfoTab;
