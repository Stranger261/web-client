import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class diagnosisService {
  constructor() {
    this.diagnosisApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/appointment-diagnosis`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  async createDiagnosis(diagnosisData) {
    try {
      console.log('sending data: ', diagnosisData);
      const res = await this.diagnosisApi.post('/', { diagnosisData });

      return res.data;
    } catch (error) {
      console.error('Failed to create diagnosis: ', error.message);
      throw error;
    }
  }

  async updateDiagnosis(apptId, diagnosisData) {
    try {
      const res = await this.diagnosisApi.patch(`/${apptId}`, {
        diagnosisData,
      });

      return res.data;
    } catch (error) {
      console.error('Failed to update diagnosis: ', error.message);
      throw error;
    }
  }

  async getDiagnosisByAppointment(apptId) {
    try {
      const res = await this.diagnosisApi.get(`/appointment/${apptId}`);

      return res.data;
    } catch (error) {
      console.error('Failed to get diagnosis: ', error.message);
      throw error;
    }
  }
}

export default new diagnosisService();
