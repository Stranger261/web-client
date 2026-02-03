import {
  User,
  Calendar,
  BedDouble,
  Clock,
  MapPin,
  Stethoscope,
  Heart,
  Scale,
  FileText,
  Eye,
  CheckCircle,
  LogOut,
  AlertCircle,
  TrendingUp,
  Thermometer,
  Activity,
  Pill,
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { COLORS } from '../../../../configs/CONST';

const DoctorAdmissionCard = ({
  admission,
  isDarkMode,
  onViewDetails,
  onAddDoctorNote,
  onUpdateDiagnosis,
  onRequestDischarge,
  onViewRounds,
  stats = null,
}) => {
  // Helper functions
  const getCurrentBed = () => {
    return admission.bedAssignments?.find(assignment => assignment.is_current)
      ?.bed;
  };

  const getPatientName = () => {
    const person = admission.patient?.person;
    return (
      `${person?.first_name || ''} ${person?.middle_name ? person.middle_name + ' ' : ''}${person?.last_name || ''}`.trim() ||
      'Unknown Patient'
    );
  };

  const calculateLengthOfStay = () => {
    if (!admission.admission_date) return 0;
    const endDate = admission.discharge_date
      ? new Date(admission.discharge_date)
      : new Date();
    const startDate = new Date(admission.admission_date);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAdmissionPriority = () => {
    if (admission.is_discharge_pending) return 'high';
    if (admission.length_of_stay > 7) return 'medium';
    return 'low';
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const isActive = admission.admission_status === 'active';
  const isDischarged = admission.admission_status === 'discharged';
  const isPendingDischarge = admission.admission_status === 'pending_discharge';
  const currentBed = getCurrentBed();
  const patientName = getPatientName();
  const los = calculateLengthOfStay();
  const priority = getAdmissionPriority();

  return (
    <div
      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
        isDischarged ? 'opacity-75' : 'hover:shadow-lg'
      }`}
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderColor: isDischarged
          ? COLORS.success
          : isDarkMode
            ? COLORS.border.dark
            : COLORS.border.light,
        borderLeft: `4px solid ${getPriorityColor(priority)}`,
      }}
    >
      {/* Priority Indicator */}
      {!isDischarged && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getPriorityColor(priority) }}
            />
            <span
              className="text-xs font-medium capitalize"
              style={{ color: getPriorityColor(priority) }}
            >
              {priority} priority
            </span>
          </div>

          {admission.visited_today && (
            <div className="flex items-center gap-1">
              <CheckCircle
                className="w-3 h-3"
                style={{ color: COLORS.success }}
              />
              <span className="text-xs" style={{ color: COLORS.success }}>
                Visited today
              </span>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: isDischarged
                ? COLORS.success + '20'
                : COLORS.primary + '20',
            }}
          >
            {isDischarged ? (
              <LogOut
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: COLORS.success }}
              />
            ) : (
              <User
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: COLORS.primary }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="font-bold text-base sm:text-lg truncate"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patientName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p
                className="text-xs sm:text-sm truncate"
                style={{ color: COLORS.text.secondary }}
              >
                #{admission.admission_number}
              </p>
              <span
                className="text-xs px-1 py-0.5 rounded whitespace-nowrap"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                  color: COLORS.text.secondary,
                }}
              >
                {admission.patient?.mrn || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <div
            className="px-2.5 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap"
            style={{
              backgroundColor: isPendingDischarge
                ? COLORS.warning + '20'
                : isDischarged
                  ? COLORS.success + '20'
                  : COLORS.info + '20',
              color: isPendingDischarge
                ? COLORS.warning
                : isDischarged
                  ? COLORS.success
                  : COLORS.info,
              border: `1px solid ${
                isPendingDischarge
                  ? COLORS.warning
                  : isDischarged
                    ? COLORS.success
                    : COLORS.info
              }`,
            }}
          >
            {isPendingDischarge
              ? 'Pending Discharge'
              : isDischarged
                ? '✓ Discharged'
                : 'Active'}
          </div>
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4" style={{ color: COLORS.info }} />
          <span
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Diagnosis
          </span>
        </div>
        <p
          className="text-xs sm:text-sm line-clamp-2"
          style={{ color: COLORS.text.secondary }}
        >
          {admission.diagnosis_at_admission || 'No diagnosis recorded'}
        </p>
      </div>

      {/* Bed and LOS Info */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
        {currentBed ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: COLORS.success + '20' }}
            >
              <BedDouble
                className="w-3 h-3"
                style={{ color: COLORS.success }}
              />
            </div>
            <div className="min-w-0">
              <p style={{ color: COLORS.text.secondary }}>Bed</p>
              <p
                className="font-medium truncate"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {currentBed.bed_number}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: COLORS.warning + '20' }}
            >
              <AlertCircle
                className="w-3 h-3"
                style={{ color: COLORS.warning }}
              />
            </div>
            <div className="min-w-0">
              <p style={{ color: COLORS.text.secondary }}>Bed</p>
              <p
                className="font-medium truncate"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Not assigned
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: COLORS.info + '20' }}
          >
            <Clock className="w-3 h-3" style={{ color: COLORS.info }} />
          </div>
          <div className="min-w-0">
            <p style={{ color: COLORS.text.secondary }}>LOS</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {los} day{los !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-1 mb-3">
          <div
            className="text-center p-1 rounded"
            style={{ backgroundColor: COLORS.info + '10' }}
          >
            <p className="text-xs font-bold" style={{ color: COLORS.info }}>
              {stats.active_prescriptions_count || 0}
            </p>
            <p className="text-xs" style={{ color: COLORS.text.secondary }}>
              Meds
            </p>
          </div>
          <div
            className="text-center p-1 rounded"
            style={{ backgroundColor: COLORS.success + '10' }}
          >
            <p className="text-xs font-bold" style={{ color: COLORS.success }}>
              {admission.active_prescriptions_count || 0}
            </p>
            <p className="text-xs" style={{ color: COLORS.text.secondary }}>
              Active Rx
            </p>
          </div>
          <div
            className="text-center p-1 rounded"
            style={{ backgroundColor: COLORS.warning + '10' }}
          >
            <p className="text-xs font-bold" style={{ color: COLORS.warning }}>
              {admission.patient?.age || 'N/A'}
            </p>
            <p className="text-xs" style={{ color: COLORS.text.secondary }}>
              Age
            </p>
          </div>
        </div>
      )}

      {/* Doctor Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onViewDetails(admission)}
          className="w-full"
          icon={Eye}
        >
          View Details
        </Button>

        {isActive && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddDoctorNote(admission)}
              icon={FileText}
              className="text-xs"
            >
              Add Note
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRounds(admission)}
              icon={Activity}
              className="text-xs"
            >
              Rounds
            </Button>

            {admission.is_discharge_pending && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => onRequestDischarge(admission)}
                icon={LogOut}
                className="text-xs col-span-2"
              >
                Process Discharge
              </Button>
            )}
          </div>
        )}

        {/* {isPendingDischarge && (
          <Button
            variant="warning"
            size="sm"
            onClick={() => onRequestDischarge(admission)}
            icon={LogOut}
            className="w-full text-xs"
          >
            Pending Discharge
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default DoctorAdmissionCard;
