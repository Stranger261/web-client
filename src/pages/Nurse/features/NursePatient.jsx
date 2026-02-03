import { useState } from 'react';
import toast from 'react-hot-toast';

import usePatientData from '../../../components/Patients/hooks/usePatientData';
import usePatientFilters from '../../../components/Patients/hooks/usePatientFilters';
import PatientFilters from '../../../components/Patients/components/PatientFilters';

import PatientStatsCards from '../../../components/Patients/cards/PatientStatsCards';
import PatientMobileCards from '../../../components/Patients/cards/PatientMobileCards';
import PatientDetailsModal from '../../../components/Patients/Modals/PatientDetailsModal';
import PatientTableView from '../../../components/Patients/components/PatientTableView';

import { useAuth } from '../../../contexts/AuthContext';
import patientApi from '../../../services/patientApi'; // Use main patient API service
import { COLORS } from '../../../configs/CONST';

const NursePatients = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { currentUser } = useAuth();

  // User role is nurse
  const userRole = 'nurse';

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  const [isFetching, setIsFetching] = useState(false);

  // Use custom hooks with nurse role
  const {
    filters,
    showFilters,
    activeFiltersCount,
    handleFilterChange,
    handleClearFilters,
    setShowFilters,
  } = usePatientFilters(userRole);

  // Get nurse's staff_id from currentUser
  const nurseStaffId = currentUser?.staff_id || null;

  const {
    patients,
    stats,
    pagination,
    isLoading,
    handlePageChange,
    handleLimitChange,
    refreshPatients,
  } = usePatientData(filters, userRole, nurseStaffId);

  // Handlers
  const handleViewPatient = async patient => {
    try {
      setIsViewModalOpen(true);
      setIsFetching(true);
      // Use nurse-specific method from patient API
      const res = await patientApi.getNursePatientDetails(patient.patient_uuid);
      setSelectedPatient(res.data);
      setExpandedRecordId(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to view patient details. Try again later',
      );
      setIsViewModalOpen(false);
    } finally {
      setIsFetching(false);
    }
  };

  const toggleMedicalRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
  };

  return (
    <div className="p-4 md:p-8 max-w-full">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Patient Records
        </h1>
        <p
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Access and manage patient medical records and information
        </p>
      </div>

      {/* Stats Cards */}
      <PatientStatsCards
        stats={stats}
        isDarkMode={isDarkMode}
        userRole={userRole}
      />

      {/* Filters */}
      <PatientFilters
        filters={filters}
        showFilters={showFilters}
        activeFiltersCount={activeFiltersCount}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        userRole={userRole}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <PatientTableView
          patients={patients}
          pagination={pagination}
          isLoading={isLoading}
          onViewPatient={handleViewPatient}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isDarkMode={isDarkMode}
          userRole={userRole}
        />
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        <PatientMobileCards
          patients={patients}
          pagination={pagination}
          isLoading={isLoading}
          onViewPatient={handleViewPatient}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isDarkMode={isDarkMode}
          userRole={userRole}
        />
      </div>

      {/* Patient Details Modal */}
      {isViewModalOpen && (
        <PatientDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setExpandedRecordId(null);
          }}
          expandedRecordId={expandedRecordId}
          onToggleRecord={toggleMedicalRecord}
          patient={selectedPatient}
          userRole={userRole}
          isDarkMode={isDarkMode}
          isLoading={isFetching}
        />
      )}
    </div>
  );
};

export default NursePatients;
