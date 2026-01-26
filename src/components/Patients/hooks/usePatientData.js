import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { usePatient } from '../../../contexts/PatientContext';
import { useAuth } from '../../../contexts/AuthContext';

const usePatientData = filters => {
  const { getAllPatients, getDoctorsPatients } = usePatient();
  const { currentUser } = useAuth();

  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withoutFace: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Determine user role and fetch method
  const userRole = currentUser?.role || 'receptionist';
  const isDoctor = userRole === 'doctor';
  const staffUuid = isDoctor ? currentUser?.staff?.staff_uuid : null;

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);

      let response;

      // Use different endpoints based on role
      if (isDoctor && staffUuid) {
        // Doctors see only their patients with medical records
        response = await getDoctorsPatients(staffUuid, {
          ...filters,
          page: pagination.currentPage,
          limit: pagination.limit,
        });
      } else {
        // Receptionists, nurses, admins see all patients
        response = await getAllPatients(
          {
            ...filters,
            page: pagination.currentPage,
            limit: pagination.limit,
          },
          userRole,
        );
      }

      setPatients(response.patients);
      setPagination(response.pagination);
      setStats(response.stats);
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch patients';
      console.error('Error fetching patients:', errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters,
    pagination.currentPage,
    pagination.limit,
    userRole,
    currentUser?.staff_uuid,
  ]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = newLimit => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  const refreshPatients = () => {
    fetchPatients();
  };

  return {
    patients,
    stats,
    pagination,
    isLoading,
    userRole,
    isDoctor,
    handlePageChange,
    handleLimitChange,
    refreshPatients,
  };
};

export default usePatientData;
