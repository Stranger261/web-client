import axios from 'axios';
import { PATIENT_SERVICE_BASE_URL } from '../config/API_URL';
const api = axios.create({
  baseURL: PATIENT_SERVICE_BASE_URL,
  withCredentials: true,
  headers: {
    'x-api-key': '7ZrUdlQq9ze0o7WA3fhvNE1L4G63dAKCpX7fyoISvfU=',
  },
});

export const admissionService = {
  // Create admission
  createAdmission: async admissionData => {
    const { data } = await api.post('/admissions', admissionData);
    return data;
  },

  // Get admission by ID
  getAdmissionById: async id => {
    const { data } = await api.get(`/admissions/${id}`);
    return data;
  },

  // Get active admissions
  getActiveAdmissions: async (filters = {}) => {
    const { data } = await api.get('/admissions/active/list', {
      params: filters,
    });
    return data;
  },

  // Assign bed to admission
  assignBed: async (admissionId, bedId, assignedBy) => {
    const { data } = await api.post(`/admissions/${admissionId}/assign-bed`, {
      bedId,
      assignedBy,
    });
    return data;
  },

  // Transfer bed
  transferBed: async (admissionId, newBedId, reason) => {
    const { data } = await api.post(`/admissions/${admissionId}/transfer-bed`, {
      newBedId,
      reason,
    });
    return data;
  },

  // Discharge patient
  dischargePatient: async (admissionId, dischargeData, dischargedBy) => {
    const { data } = await api.post(`/admissions/${admissionId}/discharge`, {
      dischargeData,
      dischargedBy,
    });
    return data;
  },

  // Get admission stats
  getAdmissionStats: async (dateFrom, dateTo) => {
    const { data } = await api.get('/admissions/stats/overview', {
      params: { dateFrom, dateTo },
    });
    return data;
  },

  // Get patient admission history
  getPatientHistory: async patientId => {
    const { data } = await api.get(`/admissions/patient/${patientId}/history`);
    return data;
  },
};
