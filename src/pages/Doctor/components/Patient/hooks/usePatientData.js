import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { usePatient } from '../../../../../contexts/PatientContext';
import { ITEMS_PER_PAGE } from '../../../../../configs/CONST';

const usePatientData = (staffUuid, filters) => {
  const { getDoctorsPatients } = usePatient();
  const [patients, setPatients] = useState([]);
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    inactivePatients: 0,
    patientsWithInsurance: 0,
    totalAppointments: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!staffUuid) return;

      try {
        setIsLoading(true);
        const minDelay = new Promise(res => setTimeout(res, 300));
        const apiCall = getDoctorsPatients(staffUuid, {
          ...filters,
          page: pagination.currentPage,
          limit: pagination.limit,
        });

        const [, response] = await Promise.all([minDelay, apiCall]);

        setPatients(response.patients);
        setPagination(response.pagination);
        setPatientStats(response.stats);
      } catch (error) {
        const errMsg =
          error?.response?.message || error?.message || 'Something went wrong';
        console.error('Error fetching patients:', errMsg);
        toast.error(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [
    staffUuid,
    filters,
    pagination.currentPage,
    pagination.limit,
    getDoctorsPatients,
  ]);

  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = newLimit => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  return {
    patients,
    patientStats,
    pagination,
    isLoading,
    handlePageChange,
    handleLimitChange,
  };
};

export default usePatientData;
