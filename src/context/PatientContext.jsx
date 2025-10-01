import { useState, useCallback, useContext, useEffect } from 'react';
import { createContext } from 'react';
import {
  createNewPatient,
  fetchAllPatients,
  fetchPatientDetail,
  searchQueryPatient,
  softDeletePatient,
  updatePatient,
} from '../services/patientApi';

export const PatientContext = createContext();

const PatientProvider = ({ children }) => {
  const [patientDetail, setPatientDetail] = useState({});
  const [patients, setPatients] = useState([]);
  const [patientsMaxPage, setPatientsMaxPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAllPatients = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    try {
      const response = await fetchAllPatients(page, limit);
      setPatientsMaxPage(response.data.data.pagination.totalPages);
      setPatients(response.data.data.patients);
    } catch (error) {
      console.error('Error fetching all patients:', error);
      setPatients([]);
      setPatientsMaxPage(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPatients = useCallback(
    async (page = 1, limit = 20, filters = {}) => {
      try {
        const response = await searchQueryPatient(page, limit, filters);
        setPatientsMaxPage(response.data.data.pagination.totalPages);
        setPatients(response.data.data.patients);
      } catch (error) {
        console.error('Error searching patients:', error);
        // Handle no results gracefully
        setPatients([]);
        setPatientsMaxPage(1);
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

  const value = {
    patientDetail,
    patients,
    patientsMaxPage,
    isLoading,
    createPatient,
    updatePatientDetail,
    deletePatient,
    getPatientDetailsById,
    getAllPatients,
    searchPatients,
    setPatientDetail,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext);

export default PatientProvider;
