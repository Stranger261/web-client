import { User, Stethoscope, FileText, BedDouble, LogOut } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

const DetailsTab = ({
  admission,
  isDarkMode,
  patientPerson,
  patient,
  currentBed,
  calculateLOS,
  attendingDoctor,
  getDoctorName,
  userRole,
  setShowDischargeForm,
}) => {
  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {/* Patient Information */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <h3
          className="font-semibold mb-3 flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <User className="w-5 h-5" />
          Patient Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p style={{ color: COLORS.text.secondary }}>Date of Birth</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patientPerson?.date_of_birth
                ? new Date(patientPerson.date_of_birth).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Blood Type</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patientPerson?.blood_type || patient?.blood_type || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Civil Status</p>
            <p
              className="font-medium capitalize"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patientPerson?.civil_status || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Nationality</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patientPerson?.nationality || 'N/A'}
            </p>
          </div>
          {patient?.chronic_conditions && (
            <div className="col-span-2">
              <p style={{ color: COLORS.text.secondary }}>Chronic Conditions</p>
              <p
                className="font-medium"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {patient.chronic_conditions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Bed */}
      {currentBed && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.badge.success.bg,
            borderColor: COLORS.success,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BedDouble className="w-5 h-5" style={{ color: COLORS.success }} />
            <h4
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Current Bed Assignment
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p style={{ color: COLORS.text.secondary }}>Bed Number</p>
              <p
                className="font-medium"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {currentBed.bed_number}
              </p>
            </div>
            <div>
              <p style={{ color: COLORS.text.secondary }}>Bed Type</p>
              <p
                className="font-medium capitalize"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {currentBed.bed_type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p style={{ color: COLORS.text.secondary }}>Status</p>
              <p
                className="font-medium capitalize"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {currentBed.bed_status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admission Details */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <h3
          className="font-semibold mb-3 flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <FileText className="w-5 h-5" />
          Admission Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p style={{ color: COLORS.text.secondary }}>Admission Type</p>
            <p
              className="font-medium capitalize"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {admission.admission_type}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Source</p>
            <p
              className="font-medium capitalize"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {admission.admission_source}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Admission Date</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {new Date(admission.admission_date).toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Length of Stay</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {calculateLOS()} days
            </p>
          </div>
          {admission.expected_discharge_date && (
            <div className="col-span-2">
              <p style={{ color: COLORS.text.secondary }}>Expected Discharge</p>
              <p
                className="font-medium"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {new Date(
                  admission.expected_discharge_date,
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attending Doctor */}
      {attendingDoctor && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope
              className="w-5 h-5"
              style={{ color: COLORS.primary }}
            />
            <h4
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Attending Physician
            </h4>
          </div>
          <p
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Dr. {getDoctorName(attendingDoctor)}
          </p>
          {attendingDoctor.specialization && (
            <p
              className="text-xs mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              {attendingDoctor.specialization}
            </p>
          )}
        </div>
      )}

      {/* Diagnosis */}
      {admission.diagnosis_at_admission && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <h4
            className="font-semibold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Diagnosis at Admission
          </h4>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            {admission.diagnosis_at_admission}
          </p>
        </div>
      )}

      {/* Discharge Button */}
      {['nurse', 'admin'].includes(userRole) &&
        admission.admission_status === 'active' && (
          <button
            onClick={() => setShowDischargeForm(true)}
            className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: COLORS.danger,
              color: COLORS.text.white,
            }}
          >
            <LogOut className="w-5 h-5" />
            Discharge Patient
          </button>
        )}
    </div>
  );
};

export default DetailsTab;
