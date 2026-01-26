import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState } from 'react';

import { BarChart3 } from 'lucide-react';
import { COLORS } from '../../../configs/CONST';

import PatientMedicalRecordTab from '../Tabs/PatientMedicalRecordTab';
import OverViewTab from '../Tabs/OverViewTab';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../ui/loading-spinner';
import { useEffect } from 'react';

import { calculatePatientStats } from '../../../utils/patientStats';

const PatientDetailsModal = ({ isOpen, onClose, patient, isLoading }) => {
  const { currentUser } = useAuth();

  const isDarkMode = document.documentElement.classList.contains('dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const calculatedStats = calculatePatientStats(patient);
    setStats(calculatedStats);
  }, [patient]);

  if (!patient) return;

  const formatPatientName = () => {
    if (!patient) return 'N/A';
    return `${patient.first_name} ${patient.middle_name || ''} ${
      patient.last_name
    }`.trim();
  };

  // Define available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = ['overview', 'analytics'];

    // Only show records tab if user is not a receptionist
    if (currentUser?.role !== 'receptionist') {
      baseTabs.splice(1, 0, 'records'); // Insert records tab between overview and analytics
    }

    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  // If activeTab is not available for the current user, switch to overview
  if (!availableTabs.includes(activeTab)) {
    setActiveTab('overview');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isLoading && !patient ? (
            <LoadingSpinner size="md" />
          ) : (
            <motion.div
              className="rounded-2xl shadow-xl w-full max-w-full sm:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col m-2 sm:m-4"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div
                className="p-4 sm:p-6 border-b flex-shrink-0"
                style={{
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl sm:text-2xl font-bold mb-1 truncate"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {formatPatientName()}
                    </h2>
                    <p
                      className="text-xs sm:text-sm truncate"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      MRN: {patient.mrn} | Patient ID: {patient.patient_id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('overview');
                      onClose();
                    }}
                    className="text-2xl font-bold transition-colors"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary;
                    }}
                  >
                    ×
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 py-2 mt-4 overflow-x-auto">
                  {availableTabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="px-4 py-2 rounded-lg font-medium transition-all capitalize whitespace-nowrap"
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
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <OverViewTab
                    isDarkMode={isDarkMode}
                    patient={patient}
                    stats={stats}
                  />
                )}

                {/* Records Tab - Only show if user is not receptionist */}
                {activeTab === 'records' &&
                  currentUser?.role !== 'receptionist' && (
                    <PatientMedicalRecordTab
                      patientUuid={patient?.patient_uuid}
                      isDarkMode={isDarkMode}
                    />
                  )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div
                    className="p-8 sm:p-12 rounded-lg border text-center"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.dark
                        : 'white',
                      borderColor: isDarkMode
                        ? COLORS.border.dark
                        : COLORS.border.light,
                    }}
                  >
                    <BarChart3
                      size={48}
                      className="mx-auto mb-4"
                      style={{ color: COLORS.primary }}
                    />
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Analytics Dashboard
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Detailed health trends, visit patterns, and treatment
                      effectiveness charts will be displayed here.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PatientDetailsModal;
