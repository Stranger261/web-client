import axios from 'axios';
import { PATIENT_SERVICE_BASE_URL } from '../config/API_URL';
const api = axios.create({
  baseURL: PATIENT_SERVICE_BASE_URL,
  withCredentials: true,
  headers: {
    'x-api-key': '7ZrUdlQq9ze0o7WA3fhvNE1L4G63dAKCpX7fyoISvfU=',
  },
});

export const bedService = {
  // Get all beds
  getAllBeds: async (filters = {}) => {
    const { data } = await api.get('/beds', { params: filters });
    return data;
  },

  // Get bed by ID
  getBedById: async id => {
    const { data } = await api.get(`/beds/${id}`);
    return data;
  },

  // Get available beds
  getAvailableBeds: async (wardType = null) => {
    const { data } = await api.get('/beds/available/list', {
      params: wardType ? { wardType } : {},
    });
    return data;
  },

  // Get bed statistics
  getBedStats: async () => {
    const { data } = await api.get('/beds/stats/occupancy');
    return data;
  },

  // Get ward overview
  getWardOverview: async () => {
    const { data } = await api.get('/beds/wards/overview');
    return data;
  },

  // Create bed
  createBed: async bedData => {
    const { data } = await api.post('/beds', bedData);
    return data;
  },

  // Update bed
  updateBed: async (id, bedData) => {
    const { data } = await api.put(`/beds/${id}`, bedData);
    return data;
  },

  // Update bed status
  updateBedStatus: async (id, status, notes = '') => {
    const { data } = await api.patch(`/beds/${id}/status`, { status, notes });
    return data;
  },

  // Mark bed cleaned
  markBedCleaned: async id => {
    const { data } = await api.patch(`/beds/${id}/cleaned`);
    return data;
  },

  // Delete bed
  deleteBed: async id => {
    const { data } = await api.delete(`/beds/${id}`);
    return data;
  },
};
