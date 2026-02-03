import { useState } from 'react';
import usePatientFilters from '../../../components/Patients/hooks/usePatientFilters';
import usePatientData from '../../../components/Patients/hooks/usePatientData';
import PatientStatsCards from '../../../components/Patients/cards/PatientStatsCards';
import PatientFilters from '../../../components/Patients/components/PatientFilters';
import PatientTableView from '../../../components/Patients/components/PatientTableView';
import PatientMobileCards from '../../../components/Patients/cards/PatientMobileCards';
import PatientDetailsModal from '../../../components/Patients/Modals/PatientDetailsModal';
import DeleteConfirmModal from '../../../components/Patients/Modals/DeleteConfirmModal';

import { useAuth } from '../../../contexts/AuthContext';
import { COLORS } from '../../../configs/CONST';

const ReceptionistPatient = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { currentUser } = useAuth();

  // Get user role from currentUser
  const userRole = currentUser?.role || 'receptionist';

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // Use custom hooks with role-based configuration
  const {
    filters,
    showFilters,
    activeFiltersCount,
    handleFilterChange,
    handleClearFilters,
    setShowFilters,
  } = usePatientFilters(userRole);

  const {
    patients,
    stats,
    pagination,
    isLoading,
    isDoctor,
    handlePageChange,
    handleLimitChange,
    refreshPatients,
  } = usePatientData(filters);

  // Handlers
  const handleViewPatient = patient => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
    setExpandedRecordId(null);
  };

  const handleDeletePatient = patient => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Implement delete logic here
      // await deletePatient(selectedPatient.patient_id);

      setIsDeleteModalOpen(false);
      setSelectedPatient(null);

      // Refresh the patient list after deletion
      refreshPatients();
    } catch (error) {
      console.error('Delete patient error:', error);
    }
  };

  const toggleMedicalRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
  };

  // Get page title based on role
  const getPageTitle = () => {
    switch (userRole) {
      case 'doctor':
        return 'My Patients';
      case 'nurse':
        return 'Patient Records';
      case 'receptionist':
      case 'admin':
        return 'All Patients';
      default:
        return 'Patients';
    }
  };

  const getPageDescription = () => {
    switch (userRole) {
      case 'doctor':
        return 'View and manage your assigned patients';
      case 'nurse':
        return 'Access patient records and medical information';
      case 'receptionist':
        return 'Manage and view all registered patients';
      case 'admin':
        return 'Manage all patients in the system';
      default:
        return 'Patient management';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-full">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1
              className="text-2xl md:text-3xl font-semibold mb-2"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {getPageTitle()}
            </h1>
            <p
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {getPageDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Role-based display */}
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
        isDarkMode={isDarkMode}
        patients={patients}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <PatientTableView
          patients={patients}
          pagination={pagination}
          isLoading={isLoading}
          onViewPatient={handleViewPatient}
          onDeletePatient={handleDeletePatient}
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
          onDeletePatient={handleDeletePatient}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isDarkMode={isDarkMode}
          userRole={userRole}
        />
      </div>

      {/* Modals */}
      <PatientDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setExpandedRecordId(null);
        }}
        expandedRecordId={expandedRecordId}
        onToggleRecord={toggleMedicalRecord}
        patient={selectedPatient}
        medicalRecords={selectedPatient?.medicalRecords || []}
        userRole={userRole}
        isDarkMode={isDarkMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        patient={selectedPatient}
        onConfirm={handleConfirmDelete}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ReceptionistPatient;
