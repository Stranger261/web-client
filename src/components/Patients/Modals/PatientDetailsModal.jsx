import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import { COLORS } from '../../../configs/CONST';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../ui/loading-spinner';
import { calculatePatientStats } from '../../../utils/patientStats';

import OverViewTab from '../Tabs/OverViewTab';
import PatientRecordsTab from '../Tabs/PatientRecordsTab';

const PatientDetailsModal = ({ isOpen, onClose, patient, isLoading }) => {
  const { currentUser } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (patient) {
      const calculatedStats = calculatePatientStats(patient);
      setStats(calculatedStats);
    }
  }, [patient]);

  // Define available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [{ id: 'overview', label: 'Overview' }];

    // Only show records tab if user is not a receptionist
    if (currentUser?.role !== 'receptionist') {
      baseTabs.splice(1, 0, { id: 'records', label: 'Medical Records' });
    }

    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  // Reset to overview when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPatientName = () => {
    if (!patient) return 'N/A';
    return `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
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
          onClick={e => e.stopPropagation()}
        >
          {isLoading && !patient ? (
            <div className="flex items-center justify-center p-12">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
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
                      MRN: {patient?.mrn} | Patient ID: {patient?.patient_id}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 py-2 mt-4 overflow-x-auto">
                  {availableTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
                      style={{
                        backgroundColor:
                          activeTab === tab.id
                            ? COLORS.primary
                            : isDarkMode
                              ? COLORS.surface.darkHover
                              : '#f3f4f6',
                        color:
                          activeTab === tab.id
                            ? 'white'
                            : isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {activeTab === 'overview' && (
                  <OverViewTab
                    isDarkMode={isDarkMode}
                    patient={patient}
                    stats={stats}
                  />
                )}

                {activeTab === 'records' &&
                  currentUser?.role !== 'receptionist' && (
                    <PatientRecordsTab
                      patientUuid={patient?.patient_uuid}
                      patientId={patient?.patient_id}
                      isDarkMode={isDarkMode}
                      patientInfo={{
                        name: `${patient.first_name} ${patient.last_name}`,
                        mrn: patient.mrn,
                        dob: patient.date_of_birth,
                        gender: patient.gender,
                      }}
                    />
                  )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PatientDetailsModal;
