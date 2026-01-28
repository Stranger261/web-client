import { COLORS } from '../../../../configs/CONST';
import {
  User,
  Calendar,
  BedDouble,
  Clock,
  ArrowRight,
  MapPin,
  Stethoscope,
  Heart,
  Scale,
  FileText,
  Eye,
} from 'lucide-react';
import { Button } from '../../../ui/button';

const AdmissionCard = ({
  admissions,
  isDarkMode,
  onViewDetails,
  onTransferBed,
  userRole,
  onAddNote,
}) => {
  // Helper functions
  const getCurrentBed = admission => {
    return admission.bedAssignments?.find(assignment => assignment.is_current)
      ?.bed;
  };

  const getPatientName = admission => {
    const person = admission.patient?.person;
    return (
      `${person?.first_name || ''} ${person?.middle_name ? person.middle_name + ' ' : ''}${person?.last_name || ''}`.trim() ||
      'Unknown Patient'
    );
  };

  const getDoctorName = admission => {
    const doctor = admission.attendingDoctor;
    if (!doctor) return null;
    const person = doctor.person;
    return `Dr. ${person?.first_name || ''} ${person?.last_name || ''}`.trim();
  };

  const calculateLengthOfStay = admissionDate => {
    if (!admissionDate) return 0;
    const now = new Date();
    const admitted = new Date(admissionDate);
    const diffTime = Math.abs(now - admitted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAdmissionTypeColor = type => {
    switch (type?.toLowerCase()) {
      case 'elective':
        return COLORS.info;
      case 'emergency':
        return COLORS.danger;
      case 'transfer':
        return COLORS.warning;
      case 'delivery':
        return COLORS.success;
      case 'urgent':
        return COLORS.warning;
      default:
        return COLORS.text.secondary;
    }
  };

  const getAdmissionSourceColor = source => {
    switch (source?.toLowerCase()) {
      case 'emergency':
        return COLORS.danger;
      case 'outpatient':
        return COLORS.info;
      case 'transfer':
        return COLORS.warning;
      case 'referral':
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {admissions.map(admission => {
        const currentBed = getCurrentBed(admission);
        const patientName = getPatientName(admission);
        const doctorName = getDoctorName(admission);
        const los = calculateLengthOfStay(admission.admission_date);

        return (
          <div
            key={admission.admission_id}
            className="p-3 sm:p-4 rounded-lg border-2 transition-all hover:shadow-lg"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            {/* Admission Header - Responsive */}
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: COLORS.primary + '20' }}
                >
                  <User
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{ color: COLORS.primary }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-base sm:text-lg truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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

              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                <div
                  className="px-2 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap"
                  style={{
                    backgroundColor:
                      getAdmissionTypeColor(admission.admission_type) + '20',
                    color: getAdmissionTypeColor(admission.admission_type),
                  }}
                >
                  {admission.admission_type || 'N/A'}
                </div>

                <div
                  className="px-2 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap"
                  style={{
                    backgroundColor:
                      getAdmissionSourceColor(admission.admission_source) +
                      '20',
                    color: getAdmissionSourceColor(admission.admission_source),
                  }}
                >
                  {admission.admission_source || 'N/A'}
                </div>
              </div>
            </div>

            {/* Patient Info - Responsive */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: COLORS.info + '20' }}
                >
                  <Heart className="w-3 h-3" style={{ color: COLORS.info }} />
                </div>
                <div className="min-w-0">
                  <p style={{ color: COLORS.text.secondary }}>Blood Type</p>
                  <p
                    className="font-medium truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {admission.patient?.person?.blood_type || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: COLORS.success + '20' }}
                >
                  <Scale
                    className="w-3 h-3"
                    style={{ color: COLORS.success }}
                  />
                </div>
                <div className="min-w-0">
                  <p style={{ color: COLORS.text.secondary }}>Vitals</p>
                  <p
                    className="font-medium text-xs truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {admission.patient?.height || 'N/A'}cm /{' '}
                    {admission.patient?.weight || 'N/A'}kg
                  </p>
                </div>
              </div>
            </div>

            {/* Bed Info */}
            {currentBed ? (
              <div
                className="p-2.5 sm:p-3 rounded-lg mb-3"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble
                    className="w-4 h-4"
                    style={{ color: COLORS.success }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Bed {currentBed.bed_number}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                  <span style={{ color: COLORS.text.secondary }}>
                    Type: {currentBed.bed_type}
                  </span>
                  <div
                    className="px-1.5 py-0.5 rounded font-medium capitalize"
                    style={{
                      backgroundColor:
                        currentBed.bed_status === 'occupied'
                          ? COLORS.danger + '20'
                          : COLORS.success + '20',
                      color:
                        currentBed.bed_status === 'occupied'
                          ? COLORS.danger
                          : COLORS.success,
                    }}
                  >
                    {currentBed.bed_status}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="p-2.5 sm:p-3 rounded-lg mb-3"
                style={{
                  backgroundColor: COLORS.danger + '10',
                  border: `1px solid ${COLORS.danger}20`,
                }}
              >
                <p
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: COLORS.danger }}
                >
                  ⚠️ No bed assigned
                </p>
              </div>
            )}

            {/* Details Grid - Responsive */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Calendar
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: COLORS.text.secondary }}
                />
                <div className="min-w-0">
                  <p style={{ color: COLORS.text.secondary }}>Admitted</p>
                  <p
                    className="font-medium truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {formatDate(admission.admission_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: COLORS.text.secondary }}
                />
                <div className="min-w-0">
                  <p style={{ color: COLORS.text.secondary }}>LOS</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {los} day{los !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Info - Responsive */}
            {doctorName && (
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: COLORS.info + '20' }}
                >
                  <Stethoscope
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    style={{ color: COLORS.info }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {doctorName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {admission.attendingDoctor?.specialization || 'Physician'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions - Responsive Layout */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Primary Action - Always full width on mobile, flexible on desktop */}
              <Button
                variant="primary"
                size="md"
                onClick={() => onViewDetails(admission)}
                className="w-full sm:flex-1"
                icon={ArrowRight}
                iconPosition="right"
              >
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View Details</span>
              </Button>

              {/* Secondary Actions - Stacked on mobile, row on desktop */}
              <div className="flex gap-2">
                {['nurse', 'admin'].includes(userRole) && currentBed && (
                  <Button
                    variant={isDarkMode ? 'ghost' : 'outline'}
                    size="md"
                    onClick={() => onTransferBed(admission)}
                    className="flex-1 sm:flex-none"
                    icon={MapPin}
                  >
                    <span className="hidden sm:inline">Transfer</span>
                    <span className="sm:hidden">Transfer</span>
                  </Button>
                )}

                {admission.admission_status === 'active' && (
                  <Button
                    variant={isDarkMode ? 'ghost' : 'outline'}
                    size="md"
                    icon={FileText}
                    onClick={() => onAddNote(admission)}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">Add Note</span>
                    <span className="sm:hidden">Note</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdmissionCard;
