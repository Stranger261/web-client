// components/modals/DoctorAdmissionDetailsModal.jsx
import { useState, useEffect } from 'react';
import {
  User,
  FileText,
  BedDouble,
  History,
  CalendarCheck,
  ChartColumn,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { COLORS } from '../../../../configs/CONST';
import doctorAdmissionApi from '../../../../services/doctorAdmissionApi';

import Modal from '../../../ui/Modal';
import { LoadingSpinner } from '../../../ui/loading-spinner';

// Reuse tabs from nurse modal
import DetailsTab from '../tabs/DetailsTab';
import AppointmentInfoTab from '../tabs/AppointmentInfoTab';
import BedHistoryTab from '../tabs/BedHistoryTab';
import VitalsChartTab from '../tabs/VitalChartsTab';
import ProgressNotesTab from '../tabs/ProgressNotesTab';
import DischargeRequestModal from './DischargeRequestModal';

const DoctorAdmissionDetailsModal = ({
  isOpen,
  onClose,
  admission,
  isDarkMode,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [bedHistory, setBedHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  const tabs = [
    {
      id: 'details',
      label: 'Patient Details',
      shortLabel: 'Details',
      icon: User,
    },
    {
      id: 'appointment',
      label: 'Appointment Info',
      shortLabel: 'Appointment',
      icon: CalendarCheck,
    },
    {
      id: 'history',
      label: 'Bed History',
      shortLabel: 'History',
      icon: History,
    },
    {
      id: 'progressNotes',
      label: 'Progress Notes',
      shortLabel: 'Notes',
      icon: FileText,
    },
    {
      id: 'vitalsTrend',
      label: 'Vitals Trend',
      shortLabel: 'Vitals',
      icon: ChartColumn,
    },
  ];

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
      console.log('Doctor admission details:', response.data);
    } catch (error) {
      console.error('Error fetching admission details:', error);
      toast.error('Failed to load admission details');
    } finally {
      setLoading(false);
    }
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
      const response = await doctorAdmissionApi.getBedHistory(
        admission.admission_id,
      );
      setBedHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching bed history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDischargeRequest = async dischargeData => {
    try {
      await doctorAdmissionApi.requestPatientDischarge(
        admission.admission_id,
        dischargeData,
      );
      toast.success('Discharge request submitted successfully');
      setShowDischargeModal(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error requesting discharge:', error);
      toast.error(
        error.response?.data?.message || 'Failed to request discharge',
      );
    }
  };

  if (!isOpen || !admission) return null;

  // Use details if available, otherwise fallback to admission prop
  const currentData = details || admission;
  const patient = currentData.patient;
  const patientPerson = patient?.person;
  const currentBed = currentData.bedAssignments?.find(ba => ba.is_current)?.bed;
  const attendingDoctor = currentData.attendingDoctor;
  const originatingAppointment = currentData.originatingAppointment;

  const getPatientName = () => {
    if (!patientPerson) return 'Unknown Patient';
    return `${patientPerson.first_name} ${patientPerson.middle_name || ''} ${patientPerson.last_name}`.trim();
  };

  const getDoctorName = doctor => {
    if (!doctor?.person) return 'Unknown Doctor';
    return `${doctor.person.first_name} ${doctor.person.last_name}`;
  };

  const calculateLOS = () => {
    if (currentData.length_of_stay) return currentData.length_of_stay;
    const now = new Date();
    const admitted = new Date(currentData.admission_date);
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Patient Admission Details"
        size="xl"
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Patient Header - Responsive */}
          <div
            className="p-3 sm:p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              borderColor: COLORS.primary,
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: COLORS.primary + '20' }}
              >
                <User
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  style={{ color: COLORS.primary }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-lg sm:text-xl font-bold truncate"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {getPatientName()}
                </h2>
                <div
                  className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  <span className="whitespace-nowrap">MRN: {patient?.mrn}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">
                    Admission: {currentData.admission_number}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">
                    {patientPerson?.gender?.charAt(0).toUpperCase() +
                      patientPerson?.gender?.slice(1)}
                    , {calculateAge(patientPerson?.date_of_birth)} years
                  </span>
                </div>
              </div>
              <div
                className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor:
                    currentData.admission_status === 'active'
                      ? COLORS.badge.success.bg
                      : COLORS.badge.warning.bg,
                  color:
                    currentData.admission_status === 'active'
                      ? COLORS.badge.success.text
                      : COLORS.badge.warning.text,
                }}
              >
                {currentData.admission_status}
              </div>
            </div>
          </div>

          {/* Tabs - Scrollable on mobile */}
          <div className="relative -mx-3 sm:mx-0">
            <div
              className="flex gap-1 sm:gap-2 border-b overflow-x-auto hide-scrollbar px-3 sm:px-0"
              style={{
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className="px-3 sm:px-4 py-2 font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
                    style={{
                      color: isActive ? COLORS.primary : COLORS.text.secondary,
                      borderBottom: isActive
                        ? `2px solid ${COLORS.primary}`
                        : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
            {/* Fade effect on the right edge for scroll indication on mobile */}
            <div
              className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none md:hidden"
              style={{
                background: `linear-gradient(to left, ${isDarkMode ? COLORS.surface.dark : '#ffffff'}, transparent)`,
              }}
            />
          </div>

          {/* Tab Content */}
          <div className="overflow-x-hidden">
            {loading && activeTab === 'details' ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <DetailsTab
                    attendingDoctor={attendingDoctor}
                    getDoctorName={getDoctorName}
                    patient={patient}
                    patientPerson={patientPerson}
                    admission={currentData}
                    isDarkMode={isDarkMode}
                    currentBed={currentBed}
                    calculateLOS={calculateLOS}
                    userRole="doctor" // Set as doctor role
                    setShowDischargeForm={setShowDischargeModal}
                  />
                )}

                {/* Appointment Info Tab */}
                {activeTab === 'appointment' && (
                  <>
                    {originatingAppointment ? (
                      <AppointmentInfoTab
                        originatingAppointment={originatingAppointment}
                        isDarkMode={isDarkMode}
                        getDoctorName={getDoctorName}
                      />
                    ) : (
                      <div
                        className="text-center py-8"
                        style={{ color: COLORS.text.secondary }}
                      >
                        No appointment information available
                      </div>
                    )}
                  </>
                )}

                {/* Bed History Tab */}
                {activeTab === 'history' && (
                  <BedHistoryTab
                    isDarkMode={isDarkMode}
                    loadingHistory={loadingHistory}
                    bedHistory={bedHistory}
                  />
                )}

                {/* Vitals Trend Tab */}
                {activeTab === 'vitalsTrend' && (
                  <VitalsChartTab admissionId={currentData.admission_id} />
                )}

                {/* Progress Notes Tab */}
                {activeTab === 'progressNotes' && (
                  <ProgressNotesTab
                    admissionId={currentData.admission_id}
                    admission={currentData}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Hide scrollbar CSS */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </Modal>

      {/* Discharge Request Modal */}
      {showDischargeModal && (
        <DischargeRequestModal
          isOpen={showDischargeModal}
          onClose={() => setShowDischargeModal(false)}
          admission={currentData}
          onSubmit={handleDischargeRequest}
        />
      )}
    </>
  );
};

export default DoctorAdmissionDetailsModal;
