import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class vitalsService {
  constructor() {
    this.vitalsApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/appointment-vitals`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }
  async createVitals(vitalsData) {
    try {
      const res = await this.vitalsApi.post('/', { vitalsData });

      return res.data;
    } catch (error) {
      console.error('Failed to create vitals: ', error.message);
      throw error;
    }
  }

  async updateVitals(appointmentId, vitalsData) {
    try {
      const res = await this.vitalsApi.patch(`/${appointmentId}`, {
        vitalsData,
      });

      return res.data;
    } catch (error) {
      console.error('Failed to update vitals: ', error.message);
      throw error;
    }
  }

  async getVitalsByAppointment(appointmentId) {
    try {
      const res = await this.vitalsApi.get(`/appointment/${appointmentId}`);

      return res.data;
    } catch (error) {
      console.error('Failed to fetch vitals: ', error.message);
      throw error;
    }
  }

  async getPatientVitalsHistory(patientId, limit = 10) {
    try {
      const res = await this.vitalsApi.get(
        `/patient/${patientId}/history?=limit=${limit}`,
      );

      return res.data;
    } catch (error) {
      console.error('Failed to get patient vitals history: ', error.message);
      throw error;
    }
  }
}
export default new vitalsService();
