import axios from 'axios';
import { INTERNAL_API_KEY, DEVELOPMENT_BASE_URL } from '../configs/CONST';

class patientService {
  constructor() {
    this.patientApi = axios.create({
      baseURL: DEVELOPMENT_BASE_URL,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
      withCredentials: true,
    });
  }

  async getDoctorsPatients(doctorUuid, filters = {}) {
    console.log(filters);
    try {
      const res = await this.patientApi.get(
        `/patients/doctors/${doctorUuid}/patients`,
        {
          params: filters,
        }
      );

      return res.data;
    } catch (error) {
      console.log('Get doctor patients error: ', error);
      throw error;
    }
  }
}

export default new patientService();
