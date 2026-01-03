import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, ITEMS_PER_PAGE } from '../../../configs/CONST';

import PatientStatsCards from '../components/Patient/PatientStatsCards';
import PatientFilters from '../components/Patient/PatientFilters';
import PatientTableView from '../components/Patient/PatientTableView';
import PatientMobileCards from '../components/Patient/PatientMobileCards';
import PatientDetailsModal from '../components/Patient/PatientDetailsModal';
import DeleteConfirmModal from '../components/Patient/DeleteConfirmModal';

import usePatientData from '../components/Patient/hooks/usePatientData';
import usePatientFilters from '../components/Patient/hooks/usePatientFilters';

const DoctorPatients = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { currentUser } = useAuth();

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // Use custom hooks
  const {
    filters,
    showFilters,
    activeFiltersCount,
    handleFilterChange,
    handleClearFilters,
    setShowFilters,
  } = usePatientFilters();

  const {
    patients,
    patientStats,
    pagination,
    isLoading,
    handlePageChange,
    handleLimitChange,
  } = usePatientData(currentUser?.staff?.staff_uuid, filters);

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
    // Implement delete logic here
    setIsDeleteModalOpen(false);
    setSelectedPatient(null);
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
          My Patients
        </h1>
        <p
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Manage and view all your registered patients
        </p>
      </div>

      {/* Stats Cards */}
      <PatientStatsCards stats={patientStats} isDarkMode={isDarkMode} />

      {/* Filters */}
      <PatientFilters
        filters={filters}
        showFilters={showFilters}
        activeFiltersCount={activeFiltersCount}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
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
        />
      </div>

      {/* Modals */}
      <PatientDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setExpandedRecordId(null);
        }}
        patient={selectedPatient}
        expandedRecordId={expandedRecordId}
        onToggleRecord={toggleMedicalRecord}
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

export default DoctorPatients;
