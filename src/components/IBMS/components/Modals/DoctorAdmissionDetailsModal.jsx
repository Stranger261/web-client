// components/modals/DoctorAdmissionDetailsModal.jsx
import { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  BedDouble,
  Clock,
  Stethoscope,
  Heart,
  Scale,
  FileText,
  Pill,
  AlertCircle,
} from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';
import doctorAdmissionApi from '../../../../services/doctorAdmissionApi';
import { Button } from '../../../ui/button';
import { LoadingSpinner } from '../../../ui/loading-spinner';
import ProgressNoteList from '../../../ProgressNotes/ProgressNotesList';

const DoctorAdmissionDetailsModal = ({
  isOpen,
  onClose,
  admission,
  isDarkMode,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && admission) {
      fetchAdmissionDetails();
    }
  }, [isOpen, admission]);

  const fetchAdmissionDetails = async () => {
    setLoading(true);
    try {
      const response = await doctorAdmissionApi.getDoctorAdmissionDetails(
        admission.admission_id,
      );
      setDetails(response.data);
    } catch (error) {
      console.error('Error fetching admission details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !admission) return null;

  const patient = details?.patient || admission.patient;
  const person = patient?.person;
  const currentBed = admission.bedAssignments?.find(
    assignment => assignment.is_current,
  )?.bed;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'medical', label: 'Medical Info' },
    { id: 'notes', label: 'Progress Notes' },
    { id: 'prescriptions', label: 'Prescriptions' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="relative w-full max-w-6xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sm:p-6 border-b"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" style={{ color: COLORS.primary }} />
            <div>
              <h2
                className="text-xl font-bold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {person?.first_name} {person?.last_name}
              </h2>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                {patient?.mrn} • {admission.admission_number}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClose}
            className="w-8 h-8 p-0"
          />
        </div>

        {/* Tabs */}
        <div
          className="border-b"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  color:
                    activeTab === tab.id
                      ? COLORS.primary
                      : COLORS.text.secondary,
                  borderBottomColor:
                    activeTab === tab.id ? COLORS.primary : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Patient Info Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Patient Information
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar
                            className="w-4 h-4"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Date of Birth
                            </p>
                            <p
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {person?.date_of_birth
                                ? new Date(
                                    person.date_of_birth,
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Heart
                            className="w-4 h-4"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Blood Type
                            </p>
                            <p
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {person?.blood_type || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Scale
                            className="w-4 h-4"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Height & Weight
                            </p>
                            <p
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {patient?.height || 'N/A'} cm /{' '}
                              {patient?.weight || 'N/A'} kg
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admission Info Card */}
                    <div className="space-y-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Admission Details
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <BedDouble
                            className="w-4 h-4"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Current Bed
                            </p>
                            <p
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {currentBed
                                ? `Bed ${currentBed.bed_number}`
                                : 'Not assigned'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock
                            className="w-4 h-4"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Length of Stay
                            </p>
                            <p
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {admission.length_of_stay || 0} days
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Stethoscope
                            className="w-4 h-4"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <div>
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Admission Type
                            </p>
                            <p
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {admission.admission_type || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Card */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Diagnosis & Treatment
                    </h3>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.darkHover
                          : COLORS.surface.lightHover,
                      }}
                    >
                      <p
                        className="text-sm mb-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Primary Diagnosis
                      </p>
                      <p
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {admission.diagnosis_at_admission ||
                          'No diagnosis recorded'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Info Tab */}
              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chronic Conditions */}
                    <div className="space-y-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Chronic Conditions
                      </h3>
                      <div className="space-y-2">
                        {patient?.chronic_conditions ? (
                          patient.chronic_conditions
                            .split(',')
                            .map((condition, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <AlertCircle
                                  className="w-4 h-4"
                                  style={{ color: COLORS.warning }}
                                />
                                <span
                                  style={{
                                    color: isDarkMode
                                      ? COLORS.text.white
                                      : COLORS.text.primary,
                                  }}
                                >
                                  {condition.trim()}
                                </span>
                              </div>
                            ))
                        ) : (
                          <p style={{ color: COLORS.text.secondary }}>
                            No chronic conditions recorded
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div className="space-y-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Allergies
                      </h3>
                      <div className="space-y-2">
                        {patient?.allergies ? (
                          patient.allergies.split(',').map((allergy, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <AlertCircle
                                className="w-4 h-4"
                                style={{ color: COLORS.danger }}
                              />
                              <span
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.white
                                    : COLORS.text.primary,
                                }}
                              >
                                {allergy.trim()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: COLORS.text.secondary }}>
                            No allergies recorded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {patient?.emergency_contact && (
                    <div className="space-y-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        Emergency Contact
                      </h3>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.surface.darkHover
                            : COLORS.surface.lightHover,
                        }}
                      >
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {patient.emergency_contact}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3
                      className="text-lg font-semibold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Progress Notes
                    </h3>
                    <Button variant="primary" size="sm" icon={FileText}>
                      Add Note
                    </Button>
                  </div>
                  <ProgressNoteList
                    admissionId={admission.admission_id}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Active Prescriptions
                  </h3>
                  {details?.prescriptions?.length > 0 ? (
                    <div className="space-y-3">
                      {details.prescriptions.map(prescription => (
                        <div
                          key={prescription.prescription_id}
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: isDarkMode
                              ? COLORS.surface.darkHover
                              : COLORS.surface.lightHover,
                            borderColor: isDarkMode
                              ? COLORS.border.dark
                              : COLORS.border.light,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Pill
                                className="w-4 h-4"
                                style={{ color: COLORS.primary }}
                              />
                              <span
                                className="font-medium"
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.white
                                    : COLORS.text.primary,
                                }}
                              >
                                {prescription.items?.[0]?.medication_name ||
                                  'Unknown Medication'}
                              </span>
                            </div>
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor:
                                  prescription.prescription_status === 'active'
                                    ? COLORS.success + '20'
                                    : COLORS.warning + '20',
                                color:
                                  prescription.prescription_status === 'active'
                                    ? COLORS.success
                                    : COLORS.warning,
                              }}
                            >
                              {prescription.prescription_status}
                            </span>
                          </div>
                          {prescription.items?.map((item, index) => (
                            <div key={index} className="text-sm mt-2">
                              <p style={{ color: COLORS.text.secondary }}>
                                Dosage: {item.dosage} • Frequency:{' '}
                                {item.frequency}
                              </p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: COLORS.text.secondary }}>
                      No active prescriptions
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAdmissionDetailsModal;
