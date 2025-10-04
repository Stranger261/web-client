import axios from 'axios';
import { PATIENT_SERVICE_BASE_URL } from '../config/API_URL';
const api = axios.create({
  baseURL: PATIENT_SERVICE_BASE_URL,
  withCredentials: true,
  headers: {
    'x-api-key': '7ZrUdlQq9ze0o7WA3fhvNE1L4G63dAKCpX7fyoISvfU=',
  },
});

export const medicalRecordService = {
  // Create medical record
  createMedicalRecord: async recordData => {
    const { data } = await api.post('/medical-records', recordData);
    return data;
  },

  // Get medical record by ID
  getMedicalRecordById: async id => {
    const { data } = await api.get(`/medical-records/${id}`);
    return data;
  },

  // Get patient medical records
  getPatientMedicalRecords: async (patientId, options = {}) => {
    const { data } = await api.get(`/medical-records/patient/${patientId}`, {
      params: options,
    });
    return data;
  },

  // Get patient medical summary
  getPatientMedicalSummary: async patientId => {
    const { data } = await api.get(
      `/medical-records/patient/${patientId}/summary`
    );
    return data;
  },

  // Update medical record
  updateMedicalRecord: async (id, updateData) => {
    const { data } = await api.put(`/medical-records/${id}`, updateData);
    return data;
  },

  // Add prescription
  addPrescription: async (recordId, prescriptionData, billId) => {
    const { data } = await api.post(
      `/medical-records/${recordId}/prescription`,
      {
        prescriptionData,
        billId,
      }
    );
    return data;
  },

  // Add lab order
  addLabOrder: async (recordId, labOrderData, billId) => {
    const { data } = await api.post(`/medical-records/${recordId}/lab-order`, {
      labOrderData,
      billId,
    });
    return data;
  },

  // Complete medical record
  completeMedicalRecord: async (recordId, doctorId) => {
    const { data } = await api.patch(`/medical-records/${recordId}/complete`, {
      doctorId,
    });
    return data;
  },

  // Search medical records
  searchMedicalRecords: async searchParams => {
    const { data } = await api.get('/medical-records/search', {
      params: searchParams,
    });
    return data;
  },

  // Delete medical record
  deleteMedicalRecord: async id => {
    const { data } = await api.delete(`/medical-records/${id}`);
    return data;
  },
};
