// File: /src/components/Patients/Tabs/PatientMedicalRecordTab.jsx
import { useCallback, useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Calendar,
  Pill,
  Stethoscope,
  Activity,
  ChevronDown,
  ChevronUp,
  Building2,
  Heart,
  Droplet,
  AlertCircle,
  User,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { usePatient } from '../../../contexts/PatientContext';
import { exportToCSV, exportToJSON, exportToPDF } from '../utils/exportHelper';
import { Button } from '../../ui/button';
import { generateRecordKey } from '../../../utils/keyGenerator';
import { AppointmentCard } from '../cards/AppointmentCard';
import { AdmissionCard } from '../cards/AdmissionCard';

const PatientMedicalRecordTab = ({ patientUuid, isDarkMode }) => {
  const { getPatientDetails } = usePatient();

  const [records, setRecords] = useState({
    appointments: [],
    walkInAdmissions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // Only 'appointments' and 'admissions'
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = sectionId => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  };

  const processPatientData = useCallback(patientData => {
    if (!patientData) return null;

    return {
      appointments: patientData.appointments || [],
      walkInAdmissions: patientData.walkInAdmissions || [],
    };
  }, []);

  const fetchMedRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getPatientDetails(patientUuid);

      if (res) {
        const processedData = processPatientData(res);
        if (processedData) {
          setRecords(processedData);
        }
      } else {
        setRecords({
          appointments: [],
          walkInAdmissions: [],
        });
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setRecords({
        appointments: [],
        walkInAdmissions: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [patientUuid, getPatientDetails, processPatientData]);

  useEffect(() => {
    fetchMedRecords();
  }, [fetchMedRecords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get appointments with their related data
  const getAppointmentsWithPrescriptions = appointments => {
    const appointmentsWithPrescriptions = [];

    appointments.forEach(appointment => {
      // Check if appointment has resultingAdmission with prescriptions
      if (appointment.resultingAdmission?.prescriptions?.length > 0) {
        appointment.resultingAdmission.prescriptions.forEach(prescription => {
          appointmentsWithPrescriptions.push({
            ...appointment,
            prescriptionDetail: {
              ...prescription,
              source: 'admission',
              admission_id: appointment.resultingAdmission.admission_id,
              admission_number: appointment.resultingAdmission.admission_number,
            },
          });
        });
      }
      // Check if appointment has prescriptions directly (if applicable)
      if (appointment.prescriptions?.length > 0) {
        appointment.prescriptions.forEach(prescription => {
          appointmentsWithPrescriptions.push({
            ...appointment,
            prescriptionDetail: {
              ...prescription,
              source: 'appointment',
              appointment_id: appointment.appointment_id,
            },
          });
        });
      }
    });

    return appointmentsWithPrescriptions;
  };

  const getCurrentRecords = () => {
    switch (activeTab) {
      case 'appointments':
        return records.appointments || [];
      case 'admissions':
        return records.walkInAdmissions || [];
      default:
        return [];
    }
  };

  const getFilteredRecords = () => {
    const currentRecords = getCurrentRecords();

    if (!debouncedSearchTerm) return currentRecords;

    return currentRecords.filter(record => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const recordText = JSON.stringify(record).toLowerCase();
      return recordText.includes(searchLower);
    });
  };

  const getTabIcon = tabName => {
    const icons = {
      appointments: Calendar,
      admissions: Building2,
    };
    const Icon = icons[tabName] || FileText;
    return <Icon size={18} />;
  };

  const getTabLabel = tabName => {
    const counts = {
      appointments: records.appointments?.length || 0,
      admissions: records.walkInAdmissions?.length || 0,
    };

    const labels = {
      appointments: 'Appointments',
      admissions: 'Walk-in/ER Admissions',
    };

    return `${labels[tabName]} (${counts[tabName]})`;
  };

  const tabs = ['appointments', 'admissions'];
  const filteredRecords = getFilteredRecords();

  return (
    <div className="space-y-4">
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div
            className="w-12 h-12 border-4 border-solid rounded-full animate-spin mb-4"
            style={{
              borderColor: `${COLORS.primary} transparent transparent transparent`,
            }}
          ></div>
          <p
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Loading medical records...
          </p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Simplified Tabs - Only Appointments and Admissions */}
          <div className="flex gap-1 sm:gap-2 border-b pb-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setExpandedSection(null);
                }}
                className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 text-sm sm:text-base ${
                  activeTab === tab ? '' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    activeTab === tab
                      ? COLORS.primary
                      : isDarkMode
                        ? COLORS.surface.darkHover
                        : '#f3f4f6',
                  color:
                    activeTab === tab
                      ? 'white'
                      : isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                }}
              >
                {getTabIcon(tab)}
                <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                <span className="sm:hidden">
                  {tab === 'appointments' ? 'Apps' : 'Admits'}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Export */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'appointments' ? 'appointments' : 'admissions'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : 'white',
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              />
            </div>

            {/* Export Button */}
            <div className="relative">
              <Button
                className="px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2"
                style={{ backgroundColor: COLORS.primary, color: 'white' }}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </Button>

              {showExportMenu && (
                <div
                  className="absolute right-0 top-full mt-2 rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]"
                  style={{
                    backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
                    border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                  }}
                >
                  {['CSV', 'JSON', 'PDF'].map(format => (
                    <Button
                      key={format}
                      onClick={e => {
                        e.stopPropagation();
                        const exportFunc = {
                          CSV: exportToCSV,
                          JSON: exportToJSON,
                          PDF: exportToPDF,
                        }[format];
                        exportFunc(getCurrentRecords(), `${activeTab}_records`);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-80 transition-colors"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                        backgroundColor: 'transparent',
                      }}
                    >
                      Export as {format}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Records Count */}
          <div
            className="text-sm px-1"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Showing {filteredRecords.length} of {getCurrentRecords().length}{' '}
            records
          </div>

          {/* Records List */}
          <div className="space-y-3">
            {filteredRecords.length > 0 ? (
              activeTab === 'appointments' ? (
                filteredRecords.map((appointment, index) => (
                  <AppointmentCard
                    key={generateRecordKey(appointment, index, activeTab)}
                    appointment={appointment}
                    expandedSection={expandedSection}
                    isDarkMode={isDarkMode}
                    toggleSection={toggleSection}
                  />
                ))
              ) : (
                // Walk-in Admissions
                filteredRecords.map((admission, index) => (
                  <AdmissionCard
                    key={generateRecordKey(admission, index, activeTab)}
                    admission={admission}
                    source="walk-in"
                    // appointmentDate={}
                    isDarkMode={isDarkMode}
                    expandedSection={expandedSection}
                    toggleSection={toggleSection}
                  />
                ))
              )
            ) : (
              <div
                className="text-center py-12 rounded-lg border"
                style={{
                  backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                <div className="flex justify-center mb-3">
                  {getTabIcon(activeTab)}
                </div>
                <p className="text-sm font-medium">
                  No{' '}
                  {activeTab === 'appointments'
                    ? 'appointments'
                    : 'walk-in admissions'}{' '}
                  found
                </p>
                {debouncedSearchTerm && (
                  <p className="text-xs mt-1 opacity-70">
                    No results for "{debouncedSearchTerm}"
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientMedicalRecordTab;
