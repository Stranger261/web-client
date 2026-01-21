import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class consultationService {
  constructor() {
    this.consultationApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/appointment-consultation`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async getCompleteConsultation(apptId) {
    try {
      const res = await this.consultationApi.get(`/${apptId}`);

      return res.data;
    } catch (error) {
      console.error('Failed to get complete consultation', error.message);
      throw error;
    }
  }

  async getPatientConsultationHistory(patientId, limit = 20) {
    try {
      const res = await this.consultationApi.get(
        `/patient/${patientId}/history?limit=${limit}`,
      );

      return res.data;
    } catch (error) {
      console.error(
        'Failed to get patient consultation history',
        error.message,
      );
      throw error;
    }
  }

  async startConsultation(apptId) {
    try {
      const res = await this.consultationApi.post(`/${apptId}/start`);

      return res.data;
    } catch (error) {
      console.error('Failed to start consultation', error.message);
      throw error;
    }
  }
}

export default new consultationService();
