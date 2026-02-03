import { useState, useEffect, useCallback } from 'react';
import patientApi from '../services/patientApi';

const usePatientData = (filters, userRole = 'receptionist', staffId = null) => {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalMedicalRecords: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch patients based on role
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      // Call different endpoints based on role
      if (userRole === 'nurse') {
        // Use nurse-specific endpoint (care team filtered)
        response = await patientApi.getNursePatients(filters);
      } else if (userRole === 'doctor' && staffId) {
        // Use doctor-specific endpoint
        response = await patientApi.getDoctorsPatients(staffId, filters);
      } else {
        // Use general endpoint for admin/receptionist
        response = await patientApi.getAllPatients(filters);
      }

      if (response.success) {
        setPatients(response.data.patients || []);
        setStats(response.data.stats || stats);
        setPagination(response.data.pagination || pagination);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, userRole, staffId]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handler for page change
  const handlePageChange = newPage => {
    // This will be handled by parent component updating filters
    // Or you can dispatch an event/callback here
  };

  // Handler for limit change
  const handleLimitChange = newLimit => {
    // This will be handled by parent component updating filters
    // Or you can dispatch an event/callback here
  };

  // Refresh patients
  const refreshPatients = () => {
    fetchPatients();
  };

  return {
    patients,
    stats,
    pagination,
    isLoading,
    error,
    handlePageChange,
    handleLimitChange,
    refreshPatients,
  };
};

export default usePatientData;
