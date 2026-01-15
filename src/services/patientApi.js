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

  async getPatientMedicalHistory(patientUuid, filters) {
    try {
      const medHistory = await this.patientApi.get(
        `patients/${patientUuid}/med-history`,
        { params: filters }
      );

      return medHistory.data;
    } catch (error) {
      console.log('Get patient medical history failed: ', error);
      throw error;
    }
  }

  async getPatientMedicalRecords(patientUuid, filters) {
    try {
      const medRecords = await this.patientApi.get(
        `patients/${patientUuid}/med-records`,
        { params: filters }
      );

      return medRecords.data;
    } catch (error) {
      console.log('Get patient medical history failed: ', error);
      throw error;
    }
  }
}

export default new patientService();
