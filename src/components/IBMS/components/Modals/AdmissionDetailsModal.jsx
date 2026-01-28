import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  User,
  FileText,
  BedDouble,
  History,
  CalendarCheck,
  ChartColumn,
} from 'lucide-react';
import Modal from '../../../ui/Modal';
import { COLORS } from '../../../../configs/CONST';
import bedAssignmentApi from '../../../../services/bedAssignmentApi';

import AppointmentInfoTab from '../tabs/AppointmentInfoTab';
import DetailsTab from '../tabs/DetailsTab';
import BedHistoryTab from '../tabs/BedHistoryTab';
import DischargeFormModal from './DischargeFormModal';
import VitalsChartTab from '../tabs/VitalChartsTab';
import ProgressNotesTab from '../tabs/ProgressNotesTab';

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
      const response = await bedAssignmentApi.getAssignmentHistory(
        admission.admission_id,
      );

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
                  Admission: {admission.admission_number}
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
          {/* Details Tab */}
          {activeTab === 'details' && !showDischargeForm && (
            <DetailsTab
              attendingDoctor={attendingDoctor}
              getDoctorName={getDoctorName}
              patient={patient}
              patientPerson={patientPerson}
              admission={admission}
              isDarkMode={isDarkMode}
              currentBed={currentBed}
              calculateLOS={calculateLOS}
              userRole={userRole}
              setShowDischargeForm={setShowDischargeForm}
            />
          )}

          {/* Appointment Info Tab */}
          {activeTab === 'appointment' && originatingAppointment && (
            <AppointmentInfoTab
              originatingAppointment={originatingAppointment}
              isDarkMode={isDarkMode}
              getDoctorName={getDoctorName}
            />
          )}

          {/* Bed History Tab */}
          {activeTab === 'history' && (
            <BedHistoryTab
              isDarkMode={isDarkMode}
              loadingHistory={loadingHistory}
              bedHistory={bedHistory}
            />
          )}

          {activeTab === 'vitalsTrend' && (
            <VitalsChartTab admissionId={admission.admission_id} />
          )}

          {activeTab === 'progressNotes' && (
            <ProgressNotesTab
              admissionId={admission.admission_id}
              admission={admission}
            />
          )}

          {/* Discharge Form */}
          {showDischargeForm && (
            <DischargeFormModal
              isDarkMode={isDarkMode}
              handleDischarge={handleDischarge}
              dischargeData={dischargeData}
              setDischargeData={setDischargeData}
              showDischargeForm={showDischargeForm}
              onCancel={() => setShowDischargeForm(false)}
            />
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
  );
};
export default AdmissionDetailsModal;
