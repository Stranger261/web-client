import axios from 'axios';
import { PATIENT_SERVICE_BASE_URL } from '../configs/CONST';

const patientApi = axios.create({
  baseURL: import.meta.env.PATIENT_BASE_URL || PATIENT_SERVICE_BASE_URL,
  withCredentials: true,
  headers: {
    'x-internal-api-key':
      import.meta.env.INTERNAL_API_KEY || 'core-1-secret-key',
  },
});

export const addressAPI = {
  // Get all regions
  getRegions: async () => {
    const response = await patientApi.get('/address/regions');
    return response.data;
  },

  // Get provinces by region
  getProvinces: async regionCode => {
    const response = await patientApi.get(`/address/provinces/${regionCode}`);
    return response.data;
  },

  // Get cities by province
  getCities: async provinceCode => {
    const response = await patientApi.get(`/address/cities/${provinceCode}`);
    return response.data;
  },

  // Get barangays by city
  getBarangays: async cityCode => {
    const response = await patientApi.get(`/address/barangays/${cityCode}`);
    return response.data;
  },

  // Get full address by barangay
  getFullAddress: async barangayCode => {
    const response = await patientApi.get(
      `/address/full-address/${barangayCode}`
    );
    return response.data;
  },
};
