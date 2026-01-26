import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  X,
  User,
  Calendar,
  Stethoscope,
  FileText,
  Clock,
  BedDouble,
  History,
  LogOut,
  Pill,
  CalendarCheck,
  DollarSign,
} from 'lucide-react';
import Modal from '../../../../../../components/ui/Modal';
import { COLORS } from '../../../../../../configs/CONST';
import bedAssignmentApi from '../../../../../../services/bedAssignmentApi';
import bedApi from '../../../../../../services/bedApi';

const AdmissionDetailsModal = ({
  isOpen,
  onClose,
  admission,
  isDarkMode,
  userRole,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'appointment', 'history'
  const [bedHistory, setBedHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [dischargeData, setDischargeData] = useState({
    discharge_type: 'routine',
    discharge_summary: '',
  });

  const tabs = [
    { id: 'details', label: 'Patient Details', icon: FileText },
    { id: 'appointment', label: 'Appointment Info', icon: CalendarCheck },
    { id: 'history', label: 'Bed History', icon: History },
  ];

  // Get data from admission object
  const patient = admission.patient;
  const patientPerson = patient?.person;
  const currentBed = admission.bedAssignments?.find(ba => ba.is_current)?.bed;
  const attendingDoctor = admission.attendingDoctor;
  const originatingAppointment = admission.originatingAppointment;

  const getPatientName = () => {
    if (!patientPerson) return 'Unknown Patient';
    return `${patientPerson.first_name} ${patientPerson.middle_name || ''} ${patientPerson.last_name}`.trim();
  };

  const getDoctorName = doctor => {
    if (!doctor?.person) return 'Unknown Doctor';
    return `${doctor.person.first_name} ${doctor.person.last_name}`;
  };

  const handleTabChange = async tabId => {
    setActiveTab(tabId);

    if (tabId === 'history' && bedHistory.length === 0) {
      await fetchBedHistory();
    }
  };

  const fetchBedHistory = async () => {
    setLoadingHistory(true);
    try {
      console.log(admission);
      const response = await bedAssignmentApi.getAssignmentHistory(
        admission.admission_id,
      );

      console.log(response.data);
      setBedHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching bed history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDischarge = async () => {
    if (!dischargeData.discharge_summary.trim()) {
      alert('Please provide a discharge summary');
      return;
    }

    try {
      await bedAssignmentApi.releasePatient({
        admissionId: admission.admission_id,
        reason: dischargeData.discharge_summary,
        dischargeType: dischargeData.discharge_type,
        dischargeSummary: dischargeData.discharge_summary,
      });

      toast.success('Patient discharged successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error discharging patient:', error);
      toast.error(
        error.response?.data?.message || 'Failed to discharge patient',
      );
    }
  };

  const calculateLOS = () => {
    const now = new Date();
    const admitted = new Date(admission.admission_date);
    const diffTime = Math.abs(now - admitted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admission Details"
      size="xl"
    >
      <div className="space-y-4">
        {/* Patient Header */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: COLORS.primary,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.primary + '20' }}
            >
              <User className="w-8 h-8" style={{ color: COLORS.primary }} />
            </div>
            <div className="flex-1">
              <h2
                className="text-xl font-bold"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {getPatientName()}
              </h2>
              <div
                className="flex gap-4 mt-1 text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                <span>MRN: {patient?.mrn}</span>
                <span>•</span>
                <span>Admission: {admission.admission_number}</span>
                <span>•</span>
                <span>
                  {patientPerson?.gender?.charAt(0).toUpperCase() +
                    patientPerson?.gender?.slice(1)}
                  , {calculateAge(patientPerson?.date_of_birth)} years
                </span>
              </div>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm font-medium capitalize"
              style={{
                backgroundColor:
                  admission.admission_status === 'active'
                    ? COLORS.badge.success.bg
                    : COLORS.badge.warning.bg,
                color:
                  admission.admission_status === 'active'
                    ? COLORS.badge.success.text
                    : COLORS.badge.warning.text,
              }}
            >
              {admission.admission_status}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-2 border-b"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="px-4 py-2 font-medium transition-all flex items-center gap-2"
                style={{
                  color: isActive ? COLORS.primary : COLORS.text.secondary,
                  borderBottom: isActive
                    ? `2px solid ${COLORS.primary}`
                    : 'none',
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && !showDischargeForm && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Patient Information */}
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patientPerson?.date_of_birth
                      ? new Date(
                          patientPerson.date_of_birth,
                        ).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Blood Type</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patientPerson?.nationality || 'N/A'}
                  </p>
                </div>
                {patient?.chronic_conditions && (
                  <div className="col-span-2">
                    <p style={{ color: COLORS.text.secondary }}>
                      Chronic Conditions
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
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
                  <BedDouble
                    className="w-5 h-5"
                    style={{ color: COLORS.success }}
                  />
                  <h4
                    className="font-semibold"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
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
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
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
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
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
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {calculateLOS()} days
                  </p>
                </div>
                {admission.expected_discharge_date && (
                  <div className="col-span-2">
                    <p style={{ color: COLORS.text.secondary }}>
                      Expected Discharge
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
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
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
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
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
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
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
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
        )}

        {/* Appointment Info Tab */}
        {activeTab === 'appointment' && originatingAppointment && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Appointment Details */}
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
              <h3
                className="font-semibold mb-3 flex items-center gap-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                <CalendarCheck
                  className="w-5 h-5"
                  style={{ color: COLORS.info }}
                />
                Appointment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p style={{ color: COLORS.text.secondary }}>
                    Appointment Number
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {originatingAppointment.appointment_number}
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Type</p>
                  <p
                    className="font-medium capitalize"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {originatingAppointment.appointment_type}
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Date</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {new Date(
                      originatingAppointment.appointment_date,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Time</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {originatingAppointment.start_time} -{' '}
                    {originatingAppointment.end_time}
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Duration</p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {originatingAppointment.duration_minutes} minutes
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>
                    Consultation Fee
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    ₱
                    {parseFloat(
                      originatingAppointment.consultation_fee,
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ color: COLORS.text.secondary }}>Payment Status</p>
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-medium capitalize"
                    style={{
                      backgroundColor:
                        originatingAppointment.payment_status === 'paid'
                          ? COLORS.badge.success.bg
                          : COLORS.badge.warning.bg,
                      color:
                        originatingAppointment.payment_status === 'paid'
                          ? COLORS.badge.success.text
                          : COLORS.badge.warning.text,
                    }}
                  >
                    {originatingAppointment.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor */}
            {originatingAppointment.doctor && (
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
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope
                    className="w-5 h-5"
                    style={{ color: COLORS.primary }}
                  />
                  <h4
                    className="font-semibold"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Consulting Doctor
                  </h4>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Dr. {getDoctorName(originatingAppointment.doctor)}
                </p>
                {originatingAppointment.doctor.specialization && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {originatingAppointment.doctor.specialization}
                  </p>
                )}
              </div>
            )}

            {/* Prescriptions */}
            {originatingAppointment.prescriptions &&
              originatingAppointment.prescriptions.length > 0 && (
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
                  <h3
                    className="font-semibold mb-3 flex items-center gap-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    <Pill
                      className="w-5 h-5"
                      style={{ color: COLORS.success }}
                    />
                    Prescriptions
                  </h3>
                  {originatingAppointment.prescriptions.map(
                    (prescription, index) => (
                      <div
                        key={prescription.prescription_id}
                        className="space-y-3"
                      >
                        <div
                          className="flex items-center justify-between pb-2 border-b"
                          style={{
                            borderColor: isDarkMode
                              ? COLORS.border.dark
                              : COLORS.border.light,
                          }}
                        >
                          <div>
                            <p
                              className="font-medium"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {prescription.prescription_number}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {new Date(
                                prescription.prescription_date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium capitalize"
                            style={{
                              backgroundColor:
                                prescription.prescription_status === 'active'
                                  ? COLORS.badge.success.bg
                                  : COLORS.badge.warning.bg,
                              color:
                                prescription.prescription_status === 'active'
                                  ? COLORS.badge.success.text
                                  : COLORS.badge.warning.text,
                            }}
                          >
                            {prescription.prescription_status}
                          </span>
                        </div>

                        {prescription.notes && (
                          <p
                            className="text-sm italic"
                            style={{ color: COLORS.text.secondary }}
                          >
                            Note: {prescription.notes}
                          </p>
                        )}

                        {/* Medication Items */}
                        {prescription.items &&
                          prescription.items.length > 0 && (
                            <div className="space-y-2">
                              {prescription.items.map((item, index) => (
                                <div
                                  key={item.item_id}
                                  className="p-3 rounded-lg"
                                  style={{
                                    backgroundColor: isDarkMode
                                      ? COLORS.surface.darkHover
                                      : COLORS.surface.lightHover,
                                  }}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p
                                        className="font-medium"
                                        style={{
                                          color: isDarkMode
                                            ? COLORS.text.white
                                            : COLORS.text.primary,
                                        }}
                                      >
                                        {item.medication_name}
                                      </p>
                                      <p
                                        className="text-xs"
                                        style={{ color: COLORS.text.secondary }}
                                      >
                                        {item.dosage} • {item.frequency} •{' '}
                                        {item.duration}
                                      </p>
                                    </div>
                                    {item.dispensed && (
                                      <span
                                        className="px-2 py-1 rounded text-xs font-medium"
                                        style={{
                                          backgroundColor:
                                            COLORS.badge.success.bg,
                                          color: COLORS.badge.success.text,
                                        }}
                                      >
                                        Dispensed
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span
                                        style={{ color: COLORS.text.secondary }}
                                      >
                                        Route:{' '}
                                      </span>
                                      <span
                                        className="font-medium"
                                        style={{
                                          color: isDarkMode
                                            ? COLORS.text.white
                                            : COLORS.text.primary,
                                        }}
                                      >
                                        {item.route}
                                      </span>
                                    </div>
                                    <div>
                                      <span
                                        style={{ color: COLORS.text.secondary }}
                                      >
                                        Quantity:{' '}
                                      </span>
                                      <span
                                        className="font-medium"
                                        style={{
                                          color: isDarkMode
                                            ? COLORS.text.white
                                            : COLORS.text.primary,
                                        }}
                                      >
                                        {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  {item.instructions && (
                                    <p
                                      className="text-xs mt-2 italic"
                                      style={{ color: COLORS.text.secondary }}
                                    >
                                      <strong>Instructions:</strong>{' '}
                                      {item.instructions}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ),
                  )}
                </div>
              )}
          </div>
        )}

        {/* Bed History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div
                  className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: COLORS.primary }}
                />
              </div>
            ) : bedHistory.length === 0 ? (
              <div
                className="text-center py-8 rounded-lg border"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                }}
              >
                <p style={{ color: COLORS.text.secondary }}>
                  No bed history available
                </p>
              </div>
            ) : (
              bedHistory.map((history, index) => (
                <div
                  key={history.assignment_id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.dark
                      : COLORS.surface.light,
                    borderColor: history.is_current
                      ? COLORS.success
                      : isDarkMode
                        ? COLORS.border.dark
                        : COLORS.border.light,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BedDouble
                        className="w-5 h-5"
                        style={{
                          color: history.is_current
                            ? COLORS.success
                            : COLORS.text.secondary,
                        }}
                      />
                      <div>
                        <p
                          className="font-semibold"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          Bed {history.bed?.bed_number}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: COLORS.text.secondary }}
                        >
                          Room {history.bed?.room?.room_number} • Floor{' '}
                          {history.bed?.room?.floor_number}
                        </p>
                      </div>
                    </div>
                    {history.is_current && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: COLORS.badge.success.bg,
                          color: COLORS.badge.success.text,
                        }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs space-y-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    <p>
                      Assigned: {new Date(history.assigned_at).toLocaleString()}
                    </p>
                    {history.released_at && (
                      <p>
                        Released:{' '}
                        {new Date(history.released_at).toLocaleString()}
                      </p>
                    )}
                    {history.transfer_reason && (
                      <p className="mt-2">
                        <span className="font-medium">Reason:</span>{' '}
                        {history.transfer_reason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Discharge Form */}
        {showDischargeForm && (
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
                ⚠️ You are about to discharge this patient. This action will
                release the assigned bed.
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
                Discharge Summary{' '}
                <span style={{ color: COLORS.danger }}>*</span>
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
                onClick={() => setShowDischargeForm(false)}
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
        )}
      </div>
    </Modal>
  );
};
export default AdmissionDetailsModal;
