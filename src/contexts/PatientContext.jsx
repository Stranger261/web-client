import { createContext, useCallback, useContext, useState } from 'react';
import patientApi from '../services/patientApi';
import { ITEMS_PER_PAGE } from '../configs/CONST';

const PatientContext = createContext();

const PatientProvider = ({ children }) => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0,
    total: 0,
  });
  const [medHistory, setMedHistory] = useState();

  const getDoctorsPatients = useCallback(async (doctorUuid, filters) => {
    try {
      const res = await patientApi.getDoctorsPatients(doctorUuid, filters);

      console.log(res);
      return res.data;
    } catch (error) {
      console.error('Get doctors patients sched error: ', error);
      throw error;
    }
  }, []);

  const getPatientMedHistory = useCallback(async (patientUuid, filters) => {
    try {
      const medHistory = await patientApi.getPatientMedicalHistory(
        patientUuid,
        filters
      );
      console.log(medHistory.data.medHistory);
      setMedHistory(medHistory.data.medHistory);
      setPagination(medHistory.data.pagination);

      return medHistory.data;
    } catch (error) {
      console.log('Get doctor patients error: ', error);
      throw error;
    }
  }, []);

  const value = {
    medHistory,
    pagination,
    getDoctorsPatients,
    getPatientMedHistory,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }

  return context;
};

export default PatientProvider;
