import axios from 'axios';
import { PATIENT_SERVICE_BASE_URL } from '../config/API_URL';

const patientApi = axios.create({
  baseURL: `${PATIENT_SERVICE_BASE_URL}`,
  withCredentials: true,
});

export const createNewPatient = async data => {
  const res = await patientApi.post('/create', data);

  return res;
};

export const updatePatient = async (id, data) => {
  const res = await patientApi.put(`/update/${id}`, data);

  return res;
};

export const softDeletePatient = async id => {
  const res = await patientApi.patch(`/delete/${id}`);

  return res;
};

export const fetchAllPatients = async (page, limit) => {
  try {
    const res = await patientApi.get('/view/all', {
      params: { limit, page },
    });
    return res;
  } catch (error) {
    console.error('Error fetching all patients:', error);
    throw error;
  }
};

export const searchQueryPatient = async (page, limit, filters = {}) => {
  try {
    const res = await patientApi.get('/search', {
      params: {
        page,
        limit,
        ...filters,
      },
    });

    return res;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

export const fetchPatientDetail = async id => {
  const res = await patientApi.get(`/view/${id}`);

  return res;
};

export const getPatientStatsAPI = async () => {
  try {
    const response = await patientApi.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    throw error;
  }
};
