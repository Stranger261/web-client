// pages/receptionist/ReceptionistPatient.jsx

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import usePatientFilters from '../../../components/Patients/hooks/usePatientFilters';
import usePatientData from '../../../components/Patients/hooks/usePatientData';
import PatientStatsCards from '../../../components/Patients/cards/PatientStatsCards';
import PatientFilters from '../../../components/Patients/components/PatientFilters';
import PatientTableView from '../../../components/Patients/components/PatientTableView';
import PatientMobileCards from '../../../components/Patients/cards/PatientMobileCards';
import PatientDetailsModal from '../../../components/Patients/Modals/PatientDetailsModal';
import DeleteConfirmModal from '../../../components/Patients/Modals/DeleteConfirmModal';
import AddFaceRegistrationModal from '../../../components/Patients/Modals/AddFaceRegistrationModal'; // NEW
import WalkInPatientRegistration from '../components/patientRegistration/WalkInPatientRegistration'; // NEW

import { useAuth } from '../../../contexts/AuthContext';
import { usePatient } from '../../../contexts/PatientContext'; // NEW
import { COLORS } from '../../../configs/CONST';

const ReceptionistPatient = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { currentUser } = useAuth();
  const { addFaceToPatient } = usePatient(); // NEW

  const userRole = currentUser?.role || 'receptionist';

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddFaceModalOpen, setIsAddFaceModalOpen] = useState(false); // NEW
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // NEW
  const [expandedRecordId, setExpandedRecordId] = useState(null);

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
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
      refreshPatients();
    } catch (error) {
      console.error('Delete patient error:', error);
    }
  };

  // NEW: Handle Add Face
  const handleAddFace = patient => {
    setSelectedPatient(patient);
    setIsAddFaceModalOpen(true);
  };

  // NEW: Handle Face Registration Success
  const handleFaceRegistrationSuccess = async () => {
    try {
      toast.success('Face registered successfully!');
      await refreshPatients(); // Refresh to show updated face status
      setIsAddFaceModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Face registration callback error:', error);
    }
  };

  // NEW: Handle Walk-in Registration Success
  const handleRegisterSuccess = async data => {
    try {
      toast.success(
        `Patient registered successfully! MRN: ${data.patient.mrn}`,
      );
      await refreshPatients();
      setIsRegisterModalOpen(false);
    } catch (error) {
      console.error('Registration callback error:', error);
    }
  };

  const toggleMedicalRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
  };

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
      {/* Header with Register Button */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* NEW: Register Button for Receptionist */}
        {userRole === 'receptionist' && (
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Register New Patient
          </button>
        )}
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
          onDeletePatient={handleDeletePatient}
          onAddFace={handleAddFace} // NEW
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
          onAddFace={handleAddFace} // NEW
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

      {/* NEW: Add Face Modal */}
      {isAddFaceModalOpen && selectedPatient && (
        <AddFaceRegistrationModal
          isOpen={isAddFaceModalOpen}
          onClose={() => {
            setIsAddFaceModalOpen(false);
            setSelectedPatient(null);
          }}
          onSuccess={handleFaceRegistrationSuccess}
          patientInfo={selectedPatient}
        />
      )}

      {/* NEW: Walk-in Registration Modal */}
      {isRegisterModalOpen && (
        <WalkInPatientRegistration
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
};

export default ReceptionistPatient;
