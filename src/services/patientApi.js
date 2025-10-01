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
  const res = await patientApi.get('/view/all', {
    params: { limit, page },
  });

  return res;
};

export const searchQueryPatient = async (page, limit, filters = {}) => {
  const res = await patientApi.get('/search', {
    params: {
      page,
      limit,
      ...filters,
    },
  });

  console.log(res);

  return res;
};

export const fetchPatientDetail = async id => {
  const res = await patientApi.get(`/view/${id}`);

  console.log(res.data.data);
  return res;
};
