import { createContext, useCallback, useContext, useState } from 'react';
import patientApi from '../services/patientApi';

const PatientContext = createContext();

const PatientProvider = ({ children }) => {
  const [medHistory, setMedHistory] = useState();

  const getDoctorsPatients = useCallback(async (doctorUuid, filters) => {
    try {
      const res = await patientApi.getDoctorsPatients(doctorUuid, filters);

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
      setMedHistory(medHistory.data.medHistory);

      return medHistory;
    } catch (error) {
      console.log('Get doctor patients error: ', error);
      throw error;
    }
  }, []);

  const getPatientMedRecords = useCallback(async (patientUuid, filters) => {
    try {
      const medRecords = await patientApi.getPatientMedicalRecords(
        patientUuid,
        filters
      );

      return medRecords;
    } catch (error) {
      console.log('Get doctor patients error: ', error);
      throw error;
    }
  }, []);

  const value = {
    medHistory,
    getDoctorsPatients,
    getPatientMedHistory,
    getPatientMedRecords,
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
