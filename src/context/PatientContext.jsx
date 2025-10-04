import { useState, useCallback, useContext } from 'react';
import { createContext } from 'react';
import {
  createNewPatient,
  fetchAllPatients,
  fetchPatientDetail,
  getPatientStatsAPI,
  searchQueryPatient,
  softDeletePatient,
  updatePatient,
} from '../services/patientApi';

export const PatientContext = createContext();

const PatientProvider = ({ children }) => {
  const [patientDetail, setPatientDetail] = useState({});
  const [patients, setPatients] = useState([]);
  const [patientsMaxPage, setPatientsMaxPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const [patientStats, setPatientStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentVisits: 0,
    totalVisitsAllPatients: 0,
  });

  const getAllPatients = useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      const response = await fetchAllPatients(page, limit);

      if (response.data?.success) {
        setPatients(response.data.data.patients);
        setPatientsMaxPage(response.data.data.pagination.totalPages);
      }

      return response;
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPatients = useCallback(
    async (page = 1, limit = 20, filters = {}) => {
      try {
        setIsLoading(true);
        const response = await searchQueryPatient(page, limit, filters);

        if (response.data?.success) {
          setPatients(response.data.data.patients || []);
          setPatientsMaxPage(response.data.data.pagination?.totalPages || 1);
        }

        return response;
      } catch (error) {
        console.error('Error searching patients:', error);
        setPatients([]);

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPatientDetailsById = useCallback(async id => {
    try {
      const patient = await fetchPatientDetail(id);

      setPatientDetail(patient.data.data);

      return patient.data.data;
    } catch (error) {
      console.log(error);
      setPatientDetail({});
    }
  }, []);

  const createPatient = useCallback(async data => {
    try {
      const newPatient = await createNewPatient(data);

      return newPatient;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const updatePatientDetail = useCallback(async (id, data) => {
    try {
      const updatedPatient = await updatePatient(id, data);

      return updatedPatient;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const deletePatient = useCallback(async id => {
    const deletedPatient = await softDeletePatient(id);

    console.log(deletedPatient);
    return deletedPatient.data.data;
  }, []);

  const getPatientStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getPatientStatsAPI();

      if (response.success) {
        setPatientStats(response.data);
      }

      return response;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    patientDetail,
    patients,
    patientsMaxPage,
    isLoading,
    patientStats,
    createPatient,
    updatePatientDetail,
    deletePatient,
    getPatientDetailsById,
    getAllPatients,
    searchPatients,
    setPatientDetail,
    getPatientStats,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext);

export default PatientProvider;
