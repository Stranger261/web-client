import { createContext, useCallback, useContext, useState } from 'react';
import patientApi from '../services/patientApi';

const PatientContext = createContext();

const PatientProvider = ({ children }) => {
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
  const value = { getDoctorsPatients };

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
