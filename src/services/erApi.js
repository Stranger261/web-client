import axios from 'axios';
import { DEVELOPMENT_BASE_URL } from '../configs/CONST';

const apiClient = axios.create({
  baseURL: DEVELOPMENT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-internal-api-key': 'core-1-secret-key',
  },
  withCredentials: true,
});

export const erService = {
  // ========== ER Visit Endpoints ==========

  createVisit: async visitData => {
    const response = await apiClient.post('/er/visits', visitData);
    return response.data;
  },

  getAllVisits: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.triageLevel) params.append('triageLevel', filters.triageLevel);

    const response = await apiClient.get(`/er/visits?${params.toString()}`);
    return response.data;
  },

  getVisitById: async id => {
    const response = await apiClient.get(`/er/visits/${id}`);
    return response.data;
  },

  updateVisit: async (id, updateData) => {
    const response = await apiClient.put(`/er/visits/${id}`, updateData);
    return response.data;
  },

  updateStatus: async (id, status, notes = null) => {
    const response = await apiClient.patch(`/er/visits/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // ========== Triage Endpoints ==========

  createTriage: async triageData => {
    const response = await apiClient.post('/er/triage', triageData);
    return response.data;
  },

  getTriageByVisit: async erVisitId => {
    const response = await apiClient.get(`/er/triage/${erVisitId}`);
    return response.data;
  },

  // ========== Treatment Endpoints ==========

  createTreatment: async treatmentData => {
    const response = await apiClient.post('/er/treatments', treatmentData);
    return response.data;
  },

  getTreatmentsByVisit: async erVisitId => {
    const response = await apiClient.get(`/er/treatments/visit/${erVisitId}`);
    return response.data;
  },

  // ========== Dashboard Endpoints ==========

  getDashboardStats: async () => {
    const response = await apiClient.get('/er/dashboard/stats');
    return response.data;
  },

  getWaitingTimes: async () => {
    const response = await apiClient.get('/er/dashboard/waiting-times');
    return response.data;
  },

  // ========== Unknown Patient Endpoints ==========

  createUnknownPatient: async data => {
    const response = await apiClient.post('/er/unknown-patient', data);
    return response.data;
  },

  identifyUnknownPatient: async (
    patientId,
    realPatientId = null,
    personData = null,
  ) => {
    const payload = {};
    if (realPatientId) payload.realPatientId = realPatientId;
    if (personData) payload.personData = personData;

    const response = await apiClient.post(
      `/er/unknown-patient/${patientId}/identify`,
      payload,
    );
    return response.data;
  },

  getUnknownPatients: async () => {
    const response = await apiClient.get('/er/unknown-patients');
    return response.data;
  },

  // ========== Disposition Endpoints ==========

  dischargePatient: async (visitId, data) => {
    const response = await apiClient.post(
      `/er/visits/${visitId}/discharge`,
      data,
    );
    return response.data;
  },

  admitPatient: async (visitId, data) => {
    const response = await apiClient.post(`/er/visits/${visitId}/admit`, data);
    return response.data;
  },

  transferPatient: async (visitId, data) => {
    const response = await apiClient.post(
      `/er/visits/${visitId}/transfer`,
      data,
    );
    return response.data;
  },
};

export default erService;
