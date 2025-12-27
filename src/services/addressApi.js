import axios from 'axios';
import { INTERNAL_API_KEY, DEVELOPMENT_BASE_URL } from '../configs/CONST';

const patientApi = axios.create({
  baseURL: DEVELOPMENT_BASE_URL,
  withCredentials: true,
  headers: {
    'x-internal-api-key': INTERNAL_API_KEY,
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
